
import { Message } from "@/components/chat/ChatContainer";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";

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

    // Add specific Creator IQ parameters if the query relates to campaigns
    const creatorIQParams = buildCreatorIQParams(content);
    console.log("Using Creator IQ params:", creatorIQParams);

    // Use the unified-agent edge function to process the message
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
        creator_iq_params: creatorIQParams
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
    if (response.data.sources) {
      console.log("Sources:", response.data.sources.map(s => s.source));
      
      // Log Creator IQ data structure if present
      const creatorIQSource = response.data.sources.find(s => s.source === "creator_iq");
      if (creatorIQSource) {
        console.log("Creator IQ data structure:", 
          creatorIQSource.results?.map(r => ({
            endpoint: r.endpoint,
            dataKeys: r.data ? Object.keys(r.data) : "No data"
          }))
        );
        
        // Log specific campaign information if available
        const campaignData = creatorIQSource.results?.find(r => r.endpoint === "/campaigns");
        if (campaignData && campaignData.data) {
          console.log("Campaign data total:", campaignData.data.total);
          if (campaignData.data.filtered_by) {
            console.log(`Filtered by: ${campaignData.data.filtered_by}`);
          }
          if (campaignData.data.CampaignCollection?.length > 0) {
            campaignData.data.CampaignCollection.forEach((campaign, idx) => {
              console.log(`Campaign ${idx + 1}:`, 
                campaign.Campaign?.CampaignName || "Unnamed", 
                `(ID: ${campaign.Campaign?.CampaignId})`,
                `Publishers: ${campaign.Campaign?.PublishersCount || "unknown"}`
              );
            });
          }
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
function buildCreatorIQParams(content: string) {
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
  }
  
  // Add publisher/list specific parameters if needed
  if (lowerContent.includes('publisher') || lowerContent.includes('influencer')) {
    params.include_publishers = true;
  }
  
  if (lowerContent.includes('list')) {
    params.include_lists = true;
  }
  
  return params;
}
