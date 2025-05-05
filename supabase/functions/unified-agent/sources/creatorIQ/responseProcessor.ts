
// This file processes the API response metadata from Creator IQ endpoints
// and adds additional context to help with future queries

/**
 * Process the response metadata to provide better context for future interactions
 */
export function processResponseMetadata(responseData: any, endpoint: any) {
  // For list endpoints, extract list name and ID for context
  if (endpoint.route === '/lists' && responseData && responseData.ListsCollection) {
    console.log(`Processing ${responseData.ListsCollection.length} lists`);
    
    // Add information about pagination
    if (responseData.total && responseData.total_pages) {
      console.log(`Lists pagination info: ${responseData.page || 1}/${responseData.total_pages} pages, ${responseData.total} total items`);
    }
  }
  
  // For list detail endpoints
  else if (endpoint.route.match(/\/lists\/\d+$/) && responseData && responseData.List) {
    // Handle nested response structure
    const listData = responseData.List.List || responseData.List;
    
    if (listData) {
      console.log(`Got list: ${listData.Name || listData.name || 'Unknown list'}`);
      
      // Extract publisher count if available
      if (Array.isArray(listData.Publishers)) {
        console.log(`List has ${listData.Publishers.length} publishers`);
        
        // Ensure responseData is properly formed for extraction
        responseData.publisherCount = listData.Publishers.length;
        responseData.publisherIds = listData.Publishers;
      }
    }
  }
  
  // For campaign endpoints
  else if (endpoint.route === '/campaigns' && responseData && responseData.CampaignCollection) {
    console.log(`Processing ${responseData.CampaignCollection.length} campaigns`);
  }
  
  // For campaign detail endpoints
  else if (endpoint.route.match(/\/campaigns\/\d+$/) && responseData && responseData.Campaign) {
    // Handle nested response structure
    const campaignData = responseData.Campaign.Campaign || responseData.Campaign;
    
    if (campaignData) {
      console.log(`Got campaign: ${campaignData.CampaignName || 'Unknown campaign'}`);
    }
  }
  
  // For publisher endpoints
  else if ((endpoint.route === '/publishers' || 
           endpoint.route.match(/\/lists\/\d+\/publishers$/) ||
           endpoint.route.match(/\/campaigns\/\d+\/publishers$/)) && 
           responseData) {
    
    let publisherCount = 0;
    
    if (responseData.PublisherCollection) {
      publisherCount = responseData.PublisherCollection.length;
    } else if (responseData.PublishersCollection) {
      publisherCount = responseData.PublishersCollection.length;
    }
    
    if (publisherCount > 0) {
      console.log(`Processing ${publisherCount} publishers`);
      
      // Add information about source context if available
      if (endpoint.route.match(/\/lists\/(\d+)\/publishers$/)) {
        const listId = endpoint.route.match(/\/lists\/(\d+)\/publishers$/)[1];
        responseData.listId = listId;
        console.log(`Publishers are from list ID: ${listId}`);
      } 
      else if (endpoint.route.match(/\/campaigns\/(\d+)\/publishers$/)) {
        const campaignId = endpoint.route.match(/\/campaigns\/(\d+)\/publishers$/)[1];
        responseData.campaignId = campaignId;
        console.log(`Publishers are from campaign ID: ${campaignId}`);
      }
    }
  }
  
  // For operation responses (add publisher to list/campaign, etc.)
  else if (responseData.operation) {
    console.log(`Operation ${responseData.operation.type || 'Unknown'}: ${responseData.operation.successful ? 'Successful' : 'Failed'}`);
  }
  
  // No specific processing needed/available
  return responseData;
}
