
// Helper function to build Creator IQ parameters based on content
export function buildCreatorIQParams(content: string, previousState: any = null) {
  const lowerContent = content.toLowerCase();
  
  // Basic parameters for all Creator IQ requests
  const params: any = {
    prefer_full_results: true,
    return_raw_response: true
  };
  
  // Detect operation type (read vs write)
  const isWriteOperation = 
    lowerContent.includes('create') || 
    lowerContent.includes('add') || 
    lowerContent.includes('update') || 
    lowerContent.includes('change') ||
    lowerContent.includes('send message') ||
    lowerContent.includes('invite');
  
  if (isWriteOperation) {
    params.operation_type = 'write';
    
    // Check for list creation operations
    if ((lowerContent.includes('create') || lowerContent.includes('make')) && 
        lowerContent.includes('list')) {
      
      params.create_list = true;
      
      // Extract list name - enhanced pattern matching
      // Look for patterns like:
      // - "create a list called X"
      // - "create a new list named X"
      // - "make a list titled X"
      // - "create list X"
      // - "create list called X"
      let listNameMatch = content.match(/list\s+(?:called|named|titled)?\s+["']([^"']+)["']/i) ||
                          content.match(/["']([^"']+)["'](?:\s+list)/i) ||
                          content.match(/(?:create|make)\s+(?:a\s+)?(?:new\s+)?list\s+(?:called|named|titled)?\s+["']([^"']+)["']/i);
      
      // If no match yet, try without quotes
      if (!listNameMatch) {
        listNameMatch = content.match(/list\s+(?:called|named|titled)?\s+([^\s.,!?]+)/i) ||
                       content.match(/([^\s.,!?]+)(?:\s+list)/i) ||
                       content.match(/(?:create|make)\s+(?:a\s+)?(?:new\s+)?list\s+(?:called|named|titled)?\s+([^\s.,!?]+)/i);
      }
      
      if (listNameMatch && listNameMatch[1]) {
        params.list_name = listNameMatch[1].trim();
        console.log(`Extracted list name for creation: "${params.list_name}"`);
      }
      
      // If no specific match but we detect list creation, use default name
      if (!params.list_name && params.create_list) {
        // Extract any capitalized words that might be a name
        const possibleNameMatch = content.match(/(?:create|make)\s+(?:a\s+)?(?:new\s+)?list\s+(?:called|named|titled)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
        
        if (possibleNameMatch && possibleNameMatch[1]) {
          params.list_name = possibleNameMatch[1].trim();
          console.log(`Extracted potential list name from capitalized words: "${params.list_name}"`);
        } else {
          // Use a timestamp-based name as fallback
          params.list_name = `New List ${new Date().toISOString().split('T')[0]}`;
          console.log(`Using default list name: "${params.list_name}"`);
        }
      }
      
      // Extract description if available
      const descriptionMatch = content.match(/description\s+(?:is\s+|as\s+)?["']([^"']+)["']/i) ||
                               content.match(/with\s+description\s+["']([^"']+)["']/i);
      
      if (descriptionMatch && descriptionMatch[1]) {
        params.list_description = descriptionMatch[1].trim();
        console.log(`Extracted list description: "${params.list_description}"`);
      }
    }
    
    // Check for publisher status update operations
    else if (lowerContent.includes('status') && 
             (lowerContent.includes('publisher') || lowerContent.includes('influencer'))) {
      
      params.update_publisher_status = true;
      
      // Extract status
      const statusMatch = lowerContent.match(/status\s+(?:to\s+)?["']?([a-zA-Z]+)["']?/i);
      if (statusMatch && statusMatch[1]) {
        params.status_value = statusMatch[1].trim().toLowerCase();
        console.log(`Extracted status value: "${params.status_value}"`);
      }
      
      // Check if we have publisher data from previous state
      if (previousState && previousState.publishers && previousState.publishers.length > 0) {
        // If query contains specific publisher criteria, we'll use that
        if (lowerContent.includes('with status')) {
          const currentStatusMatch = lowerContent.match(/with\s+status\s+["']?([a-zA-Z]+)["']?/i);
          if (currentStatusMatch && currentStatusMatch[1]) {
            const currentStatus = currentStatusMatch[1].trim().toLowerCase();
            // Filter publishers by their current status
            const matchingPublishers = previousState.publishers.filter((p: any) => 
              p.status && p.status.toLowerCase() === currentStatus
            );
            
            if (matchingPublishers.length > 0) {
              params.publisher_ids = matchingPublishers.map((p: any) => p.id);
              console.log(`Found ${matchingPublishers.length} publishers with status "${currentStatus}"`);
            }
          }
        }
      }
    }
    
    // Check for send message operations
    else if (lowerContent.includes('send message') || lowerContent.includes('message publisher')) {
      params.send_message = true;
      
      // Extract message content
      const messageMatch = content.match(/message\s+(?:saying\s+|content\s+)?["']([^"']+)["']/i);
      if (messageMatch && messageMatch[1]) {
        params.message_content = messageMatch[1].trim();
        console.log(`Extracted message content: "${params.message_content}"`);
      } else {
        // Try to extract message another way
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.toLowerCase().includes('message:')) {
            const messageContent = line.substring(line.indexOf(':') + 1).trim();
            if (messageContent) {
              params.message_content = messageContent;
              console.log(`Extracted message content from line: "${params.message_content}"`);
              break;
            }
          }
        }
      }
      
      // Extract subject if available
      const subjectMatch = content.match(/subject\s+(?:is\s+|as\s+)?["']([^"']+)["']/i);
      if (subjectMatch && subjectMatch[1]) {
        params.message_subject = subjectMatch[1].trim();
        console.log(`Extracted message subject: "${params.message_subject}"`);
      }
    }
  }
  
  // For read operations, add campaign-specific parameters
  if (!isWriteOperation && (
     lowerContent.includes('campaign') || 
     lowerContent.includes('ready rocker') || 
     lowerContent.includes('ambassador') ||
     lowerContent.includes('program'))) {
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
  
  // Add list-specific parameters for read operations
  if (!isWriteOperation && lowerContent.includes('list')) {
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
