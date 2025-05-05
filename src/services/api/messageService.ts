
import { Message } from "@/components/chat/ChatContainer";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { processCreatorIQResponse } from "./creatorIQService";
import { getProviderToken, storeProviderToken } from "./tokenService";
import { buildCreatorIQParams } from "./paramBuilder";
import { findStateByQuery, generateStateKey } from "@/utils/creatorIQ";

export async function sendMessage(content: string): Promise<Message> {
  try {
    // Get the current session for the auth token
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error("Error getting session:", sessionError);
      throw new Error("Failed to get authentication session");
    }
    
    const authToken = sessionData?.session?.access_token
    const providerToken = sessionData?.session?.provider_token
    const userId = sessionData?.session?.user?.id
    
    console.log("Provider token available from session:", !!providerToken);
    
    // If no provider token in session, try to get from database
    const storedToken = await getProviderToken(sessionData);

    // Check if this is a follow-up question related to Creator IQ
    const { stateKey, previousState } = await prepareCreatorIQState(userId, content);

    // Add specific Creator IQ parameters if the query relates to campaigns
    const creatorIQParams = buildCreatorIQParams(content, previousState);
    console.log("Using Creator IQ params:", creatorIQParams);

    // Extract publisher ID if present in the message for direct message sending
    const publisherIdMatch = content.match(/\b(\d{6,10})\b/); // Look for 6-10 digit numbers that could be publisher IDs
    if (publisherIdMatch && publisherIdMatch[1]) {
      const potentialPublisherId = publisherIdMatch[1].trim();
      console.log(`Potential publisher ID found in message: ${potentialPublisherId}`);
      
      // Add to the params if not already there
      if (!creatorIQParams.publisher_id) {
        creatorIQParams.publisher_id = potentialPublisherId;
        console.log(`Added publisher ID to params: ${potentialPublisherId}`);
      }
    }
    
    // Extract message content if this appears to be a message sending request
    const messageMatch = content.match(/message\s+["']([^"']+)["']/i) || 
                         content.match(/["']([^"']{3,100})["']/);
    if (messageMatch && messageMatch[1]) {
      const messageContent = messageMatch[1].trim();
      console.log(`Message content found: "${messageContent}"`);
      
      // Add to the params if not already there
      if (!creatorIQParams.message_content) {
        creatorIQParams.message_content = messageContent;
        console.log(`Added message content to params: "${messageContent}"`);
      }
    }

    // Extract list names for searching
    const listSearchTerms = extractSearchTerms(content, ['list', 'lists']);
    if (listSearchTerms.length > 0) {
      console.log(`List search terms extracted: ${listSearchTerms.join(', ')}`);
      if (!creatorIQParams.list_search) {
        creatorIQParams.list_search = listSearchTerms[0];
      }
    }
    
    // Extract publisher/creator names for searching
    const publisherSearchTerms = extractSearchTerms(content, ['publisher', 'creator', 'influencer']);
    if (publisherSearchTerms.length > 0) {
      console.log(`Publisher search terms extracted: ${publisherSearchTerms.join(', ')}`);
      if (!creatorIQParams.publisher_search) {
        creatorIQParams.publisher_search = publisherSearchTerms[0];
      }
    }

    // Pass the state key and previous state to the edge function
    const response = await supabase.functions.invoke('unified-agent', {
      body: {
        query: content,
        conversation_history: [],
        include_web: true,
        include_drive: true,
        include_creator_iq: true,
        debug_token_info: {
          hasProviderToken: !!providerToken,
          hasStoredToken: !!storedToken,
          userHasSession: !!sessionData?.session,
          tokenSource: providerToken ? 'provider_token' : (storedToken ? 'database' : 'none')
        },
        // Add specific parameters for Creator IQ searches
        creator_iq_params: creatorIQParams,
        // Add state information
        state_key: stateKey,
        previous_state: previousState
      },
      headers: authToken ? {
        Authorization: `Bearer ${authToken}`
      } : undefined
    });

    if (response.error) {
      console.error("Edge function error:", response.error);
      throw new Error(response.error.message || "Failed to get AI response");
    }
    
    // Log the response structure to help with debugging
    console.log("AI response structure:", Object.keys(response.data));
    console.log("Sources available:", response.data.sources?.map(s => s.source));
    
    // Check for Creator IQ errors in the response
    const creatorIQSource = response.data.sources?.find(s => s.source === "creator_iq");
    if (creatorIQSource && creatorIQSource.error) {
      console.error("Creator IQ error in response:", creatorIQSource.error);
    }
    
    // Also check for operation-specific errors
    if (creatorIQSource && creatorIQSource.results) {
      const operationErrors = creatorIQSource.results
        .filter(result => result.error || (result.data && result.data.operation && result.data.operation.successful === false))
        .map(result => ({
          endpoint: result.endpoint,
          error: result.error || (result.data?.operation?.details || "Unknown error"),
          name: result.name
        }));
      
      if (operationErrors.length > 0) {
        console.warn("Creator IQ operation errors:", operationErrors);
      }
      
      // Extract successful operations and log them
      const successfulOperations = creatorIQSource.results
        .filter(result => !result.error && result.data && result.data.operation && result.data.operation.successful === true)
        .map(result => ({
          endpoint: result.endpoint,
          operation: result.data.operation,
          name: result.name
        }));
      
      if (successfulOperations.length > 0) {
        console.info("Creator IQ successful operations:", successfulOperations);
      }
      
      // Extract and log message sending results specifically
      const messageResults = creatorIQSource.results
        .filter(result => result.name && result.name.includes("Send Message"));
      
      if (messageResults.length > 0) {
        console.info("Message sending results:", messageResults);
        
        // Check for publisher IDs to store in previous state
        messageResults.forEach(result => {
          if (result.data && result.data.publisherId) {
            console.log(`Message sent to publisher ID: ${result.data.publisherId}`);
          }
        });
      }
    }
    
    // Store provider token if available
    if (providerToken && userId) {
      await storeProviderToken(sessionData, providerToken);
    }
    
    // Process and store any Creator IQ data for future reference
    if (stateKey && userId && response.data.sources) {
      await processCreatorIQResponse(stateKey, userId, response.data.sources);
    }

    return {
      id: uuidv4(),
      content: response.data.answer,
      role: "assistant",
      timestamp: new Date()
    };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
}

// Helper function to prepare Creator IQ state for the current query
async function prepareCreatorIQState(userId: string | undefined, content: string) {
  let previousState = null;
  let stateKey = null;
  
  if (userId && (content.toLowerCase().includes('creator') || 
      content.toLowerCase().includes('campaign') || 
      content.toLowerCase().includes('publisher') || 
      content.toLowerCase().includes('list') ||
      content.toLowerCase().includes('ready rocker') ||
      content.toLowerCase().includes('message'))) {
    
    // Try to find relevant previous state based on query content
    const queryTerms = [
      'campaign', 'publisher', 'influencer', 'creator iq', 'ready rocker', 'list', 'message'
    ].filter(term => content.toLowerCase().includes(term));
    
    if (queryTerms.length > 0) {
      console.log("Looking for previous state with terms:", queryTerms);
      previousState = await findStateByQuery(userId, queryTerms);
      
      if (previousState) {
        console.log("Found previous Creator IQ state:", previousState);
        
        // Extract publisher IDs from previous state for potential message sending
        if (previousState.publishers && previousState.publishers.length > 0) {
          console.log(`Found ${previousState.publishers.length} publishers in previous state`);
          
          // Log first few publisher IDs for debugging
          const samplePublishers = previousState.publishers.slice(0, 3);
          console.log("Sample publishers from previous state:", samplePublishers.map(p => p.id));
        }
      }
    }
    
    // Generate a new state key for this query
    stateKey = generateStateKey(userId, content);
  }
  
  return { stateKey, previousState };
}

// Helper function to extract search terms from content
function extractSearchTerms(content: string, contextKeywords: string[]): string[] {
  const contentLower = content.toLowerCase();
  const terms: string[] = [];
  
  // First look for terms after contextKeywords with quotes
  for (const keyword of contextKeywords) {
    const quotedRegex = new RegExp(`${keyword}\\s+["']([^"']+)["']`, 'i');
    const quotedMatch = contentLower.match(quotedRegex);
    
    if (quotedMatch && quotedMatch[1]) {
      terms.push(quotedMatch[1].trim());
      continue;
    }
    
    // Then look for terms after contextKeywords without quotes
    const pattern = `${keyword}\\s+([^\\s,\\.\\?!]{3,}[\\s\\w]+)`;
    const regex = new RegExp(pattern, 'i');
    const match = contentLower.match(regex);
    
    if (match && match[1]) {
      // Extract up to the next punctuation
      const term = match[1].replace(/[,.!?].*$/, '').trim();
      if (term && term.length >= 3 && !terms.includes(term)) {
        terms.push(term);
      }
    }
  }
  
  return terms;
}
