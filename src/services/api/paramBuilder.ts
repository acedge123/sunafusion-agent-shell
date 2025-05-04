
// Helper function to build Creator IQ parameters based on content
export function buildCreatorIQParams(content: string, previousState: any = null) {
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
