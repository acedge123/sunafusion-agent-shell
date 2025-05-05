
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
      content.toLowerCase().includes('ready rocker'))) {
    
    // Try to find relevant previous state based on query content
    const queryTerms = [
      'campaign', 'publisher', 'influencer', 'creator iq', 'ready rocker', 'list'
    ].filter(term => content.toLowerCase().includes(term));
    
    if (queryTerms.length > 0) {
      console.log("Looking for previous state with terms:", queryTerms);
      previousState = await findStateByQuery(userId, queryTerms);
      
      if (previousState) {
        console.log("Found previous Creator IQ state:", previousState);
      }
    }
    
    // Generate a new state key for this query
    stateKey = generateStateKey(userId, content);
  }
  
  return { stateKey, previousState };
}
