
import { Message } from "@/components/chat/ChatContainer";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { generateStateKey, extractCampaignData, saveStateToDatabase, findStateByQuery } from "@/utils/creatorIQStateManager";

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
    let storedToken = null;
    if (!providerToken && sessionData?.session?.user) {
      try {
        const { data: tokenData, error: tokenError } = await supabase
          .from('google_drive_access')
          .select('access_token')
          .eq('user_id', sessionData.session.user.id)
          .maybeSingle();
          
        if (tokenError) {
          console.error("Error querying token from database:", tokenError);
        } else {
          storedToken = tokenData?.access_token;
          console.log("Retrieved stored token from database:", !!storedToken);
        }
      } catch (dbError) {
        console.error("Error retrieving token from database:", dbError);
      }
    }

    // Store provider token if available
    if (providerToken && sessionData?.session?.user?.id) {
      try {
        const { error: upsertError } = await supabase
          .from('google_drive_access')
          .upsert({
            user_id: sessionData.session.user.id,
            access_token: providerToken,
            token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
            
        if (upsertError) {
          console.error("Error storing Google Drive token:", upsertError);
        } else {
          console.log("Successfully stored Google Drive token from session");
        }
      } catch (storeError) {
        console.error("Error in token storage:", storeError);
      }
    }

    // Check if this is a follow-up question related to Creator IQ
    let previousState = null;
    let stateKey = null;
    
    if (userId && content.toLowerCase().includes('creator') || 
        content.toLowerCase().includes('campaign') || 
        content.toLowerCase().includes('publisher') || 
        content.toLowerCase().includes('ready rocker')) {
      
      // Try to find relevant previous state based on query content
      const queryTerms = [
        'campaign', 'publisher', 'influencer', 'creator iq', 'ready rocker'
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
    
    // Store any Creator IQ data for future reference
    if (stateKey && userId && response.data.sources) {
      const creatorIQSource = response.data.sources.find(s => s.source === "creator_iq");
      if (creatorIQSource?.results) {
        console.log("Storing Creator IQ results for future reference");
        
        // Process and extract structured data from the response
        const processedData = {
          campaigns: [],
          publishers: [],
          lists: []
        };
        
        // Process each endpoint result
        for (const result of creatorIQSource.results) {
          if (result.endpoint === "/campaigns" && result.data) {
            processedData.campaigns = extractCampaignData(result.data);
            console.log(`Extracted ${processedData.campaigns.length} campaigns`);
          }
          
          // Add processing for other endpoints as needed
          // ...
        }
        
        // Store the extracted data if we have any
        if (processedData.campaigns.length > 0 || 
            processedData.publishers.length > 0 || 
            processedData.lists.length > 0) {
          await saveStateToDatabase(userId, stateKey, processedData);
        }
      }
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

// Helper function to build Creator IQ parameters based on content
function buildCreatorIQParams(content: string, previousState: any = null) {
  const lowerContent = content.toLowerCase();
  
  // Basic parameters for all Creator IQ requests
  const params: any = {
    prefer_full_results: true,
    return_raw_response: true
  };
  
  // Add campaign-specific parameters
  if (lowerContent.includes('campaign') || lowerContent.includes('ready rocker')) {
    params.search_campaigns = true;
    
    // Extract search terms for campaigns
    if (lowerContent.includes('ready rocker')) {
      params.campaign_search_term = 'Ready Rocker';
    }
    
    // Specific campaign name extraction - look for phrases like "find campaign X" or "campaign called X"
    const campaignNameMatch = content.match(/campaign(?:\s+called|\s+named|\s+titled)?\s+["']([^"']+)["']/i) || 
                             content.match(/["']([^"']+)["'](?:\s+campaign)/i);
    if (campaignNameMatch && campaignNameMatch[1]) {
      params.campaign_search_term = campaignNameMatch[1];
    }
    
    // Add previous state campaign data if available
    if (previousState && previousState.campaigns && previousState.campaigns.length > 0) {
      params.previous_campaigns = previousState.campaigns;
      
      // If query asks about publishers and we have campaign data, include campaign IDs
      if (lowerContent.includes('publisher') || 
          lowerContent.includes('influencer') || 
          lowerContent.includes('how many')) {
        
        // Find the most likely campaign based on query
        const relevantCampaign = previousState.campaigns.find((c: any) => 
          lowerContent.includes(c.name.toLowerCase())
        );
        
        if (relevantCampaign) {
          params.campaign_id = relevantCampaign.id;
          params.campaign_name = relevantCampaign.name;
          console.log(`Using previously identified campaign: ${relevantCampaign.name} (${relevantCampaign.id})`);
        }
      }
    }
  }
  
  // Add publisher/list specific parameters if needed
  if (lowerContent.includes('publisher') || lowerContent.includes('influencer')) {
    params.include_publishers = true;
    
    // Add previous publishers data if available
    if (previousState && previousState.publishers && previousState.publishers.length > 0) {
      params.previous_publishers = previousState.publishers;
    }
  }
  
  if (lowerContent.includes('list')) {
    params.include_lists = true;
    
    // Add previous lists data if available
    if (previousState && previousState.lists && previousState.lists.length > 0) {
      params.previous_lists = previousState.lists;
    }
  }
  
  return params;
}
