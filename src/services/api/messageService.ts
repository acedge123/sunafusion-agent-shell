
import { Message } from "@/components/chat/ChatContainer";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { processCreatorIQResponse } from "./creatorIQService";
import { getProviderToken, storeProviderToken } from "./tokenService";
import { buildCreatorIQParams } from "./paramBuilder";
import { findStateByQuery, generateStateKey } from "@/utils/creatorIQ";
import { extractSearchTerms, prepareCreatorIQState } from "./messageHelpers";
import { processAgentResponse } from './messageResponseProcessor';

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
    
    return await processAgentResponse(response.data, stateKey, userId, providerToken, sessionData);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
}

// The issue is here - we need to import processAgentResponse from messageResponseProcessor
// Remove this incorrect export line
// export { processAgentResponse } from './messageResponseProcessor';

