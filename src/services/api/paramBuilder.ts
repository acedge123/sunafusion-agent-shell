
// Helper function to build Creator IQ parameters based on content
export function buildCreatorIQParams(content: string, previousState: any = null) {
  const lowerContent = content.toLowerCase();
  
  // Basic parameters for all Creator IQ requests
  const params: any = {
    prefer_full_results: true,
    return_raw_response: true
  };
  
  // Add campaign-specific parameters
  if (lowerContent.includes('campaign') || 
     lowerContent.includes('ready rocker') || 
     lowerContent.includes('ambassador') ||
     lowerContent.includes('program')) {
    params.search_campaigns = true;
    
    // Extract search terms for campaigns with improved matching
    if (lowerContent.includes('ready rocker') || 
        (lowerContent.includes('ready') && lowerContent.includes('rocker')) || 
        (lowerContent.includes('ambassador') && lowerContent.includes('program'))) {
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
  
  // Add list-specific parameters
  if (lowerContent.includes('list')) {
    params.search_lists = true;
    
    // Extract search terms for lists
    const listNameMatch = content.match(/list(?:\s+called|\s+named|\s+titled)?\s+["']([^"']+)["']/i) || 
                         content.match(/["']([^"']+)["'](?:\s+list)/i) ||
                         content.match(/find(?:\s+a)?\s+list(?:\s+with|\s+named|\s+called|\s+titled|\s+containing)?\s+["']?([^"']+)["']?/i);
                         
    if (listNameMatch && listNameMatch[1]) {
      params.list_search_term = listNameMatch[1];
    }
    
    // Add previous state list data if available
    if (previousState && previousState.lists && previousState.lists.length > 0) {
      params.previous_lists = previousState.lists;
      
      // If query asks about publishers in a list and we have list data, include list IDs
      if (lowerContent.includes('publisher') || 
          lowerContent.includes('influencer') || 
          lowerContent.includes('how many')) {
        
        // Find the most likely list based on query
        const relevantList = previousState.lists.find((l: any) => 
          lowerContent.includes(l.name.toLowerCase())
        );
        
        if (relevantList) {
          params.list_id = relevantList.id;
          params.list_name = relevantList.name;
          console.log(`Using previously identified list: ${relevantList.name} (${relevantList.id})`);
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
  
  return params;
}
