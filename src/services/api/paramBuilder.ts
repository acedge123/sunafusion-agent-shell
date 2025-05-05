
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
    lowerContent.includes('invite') ||
    lowerContent.includes('copy');
  
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
    
    // Check for adding publishers to list operations
    else if ((lowerContent.includes('add') || lowerContent.includes('copy')) && 
            (lowerContent.includes('publisher') || lowerContent.includes('influencer'))) {
      
      // Check if operation is for list or campaign
      if (lowerContent.includes('list')) {
        params.add_publishers_to_list = true;
        
        // Extract source list and target list names
        let sourceListName, targetListName;
        
        // Try to find the source list name
        const sourceRegexPatterns = [
          /from\s+(?:list|the\s+list)(?:\s+called|\s+named)?\s+["']([^"']+)["']/i,
          /from\s+the\s+["']([^"']+)["']\s+list/i,
          /(\b[A-Z][a-zA-Z0-9\s-]+)(?:\s+list)?\s+(?:to|into)/i
        ];
        
        for (const pattern of sourceRegexPatterns) {
          const match = content.match(pattern);
          if (match && match[1]) {
            sourceListName = match[1].trim();
            console.log(`Found potential source list name: "${sourceListName}"`);
            break;
          }
        }
        
        // Try to find the target list name
        const targetRegexPatterns = [
          /(?:to|into)(?:\s+list|\s+the\s+list)(?:\s+called|\s+named)?\s+["']([^"']+)["']/i,
          /(?:to|into)\s+the\s+["']([^"']+)["']\s+list/i,
          /(?:to|into)\s+(?:list|the\s+list)\s+(\b[A-Z][a-zA-Z0-9\s-]+\b)/i
        ];
        
        for (const pattern of targetRegexPatterns) {
          const match = content.match(pattern);
          if (match && match[1]) {
            targetListName = match[1].trim();
            console.log(`Found potential target list name: "${targetListName}"`);
            break;
          }
        }
        
        // Check if we have list data from previous state
        if (previousState && previousState.lists && previousState.lists.length > 0) {
          // Find source list ID if we have a name
          if (sourceListName) {
            const sourceList = previousState.lists.find((l: any) => 
              l.name.toLowerCase().includes(sourceListName.toLowerCase())
            );
            
            if (sourceList) {
              params.source_list_id = sourceList.id;
              params.source_list_name = sourceList.name;
              console.log(`Found matching source list: ${sourceList.name} (ID: ${sourceList.id})`);
            }
          }
          
          // Find target list ID if we have a name
          if (targetListName) {
            const targetList = previousState.lists.find((l: any) => 
              l.name.toLowerCase().includes(targetListName.toLowerCase())
            );
            
            if (targetList) {
              params.target_list_id = targetList.id;
              params.target_list_name = targetList.name;
              console.log(`Found matching target list: ${targetList.name} (ID: ${targetList.id})`);
            }
          }
        }
      } 
      // Check if operation is for campaign
      else if (lowerContent.includes('campaign')) {
        params.add_publishers_to_campaign = true;
        
        // Extract source and target (campaign/list) names
        let sourceName, targetCampaignName;
        let isSourceList = false;
        let isSourceCampaign = false;
        
        // Try to find the source name (could be list or campaign)
        const sourceRegexPatterns = [
          // From list patterns
          /from\s+(?:list|the\s+list)(?:\s+called|\s+named)?\s+["']([^"']+)["']/i,
          /from\s+the\s+["']([^"']+)["']\s+list/i,
          // From campaign patterns
          /from\s+(?:campaign|the\s+campaign)(?:\s+called|\s+named)?\s+["']([^"']+)["']/i,
          /from\s+the\s+["']([^"']+)["']\s+campaign/i,
          // Generic "from X to Y" pattern
          /from\s+["']([^"']+)["']\s+to/i
        ];
        
        for (const pattern of sourceRegexPatterns) {
          const match = content.match(pattern);
          if (match && match[1]) {
            sourceName = match[1].trim();
            // Determine if source is likely a list or campaign based on the pattern
            if (pattern.toString().includes('list')) {
              isSourceList = true;
            } else if (pattern.toString().includes('campaign')) {
              isSourceCampaign = true;
            }
            console.log(`Found potential source: "${sourceName}" (likely ${isSourceList ? 'list' : isSourceCampaign ? 'campaign' : 'unknown'})`);
            break;
          }
        }
        
        // Try to find the target campaign name
        const targetRegexPatterns = [
          /(?:to|into)(?:\s+campaign|\s+the\s+campaign)(?:\s+called|\s+named)?\s+["']([^"']+)["']/i,
          /(?:to|into)\s+the\s+["']([^"']+)["']\s+campaign/i,
          /(?:to|into)\s+(?:campaign|the\s+campaign)\s+(\b[A-Z][a-zA-Z0-9\s-]+\b)/i
        ];
        
        for (const pattern of targetRegexPatterns) {
          const match = content.match(pattern);
          if (match && match[1]) {
            targetCampaignName = match[1].trim();
            console.log(`Found potential target campaign name: "${targetCampaignName}"`);
            break;
          }
        }
        
        // If we have previous state, try to find matching sources and targets
        if (previousState) {
          // Find source based on name and type (list or campaign)
          if (sourceName) {
            // Check lists if source is a list or unknown
            if ((isSourceList || !isSourceCampaign) && previousState.lists && previousState.lists.length > 0) {
              const sourceList = previousState.lists.find((l: any) => 
                l.name.toLowerCase().includes(sourceName.toLowerCase())
              );
              
              if (sourceList) {
                params.source_list_id = sourceList.id;
                params.source_list_name = sourceList.name;
                params.source_type = 'list';
                console.log(`Found matching source list: ${sourceList.name} (ID: ${sourceList.id})`);
              }
            }
            
            // Check campaigns if source is a campaign or unknown and we didn't find a list match
            if ((isSourceCampaign || !isSourceList || !params.source_list_id) && 
                previousState.campaigns && previousState.campaigns.length > 0) {
              const sourceCampaign = previousState.campaigns.find((c: any) => 
                c.name.toLowerCase().includes(sourceName.toLowerCase())
              );
              
              if (sourceCampaign) {
                params.source_campaign_id = sourceCampaign.id;
                params.source_campaign_name = sourceCampaign.name;
                params.source_type = 'campaign';
                console.log(`Found matching source campaign: ${sourceCampaign.name} (ID: ${sourceCampaign.id})`);
              }
            }
          }
          
          // Find target campaign
          if (targetCampaignName && previousState.campaigns && previousState.campaigns.length > 0) {
            const targetCampaign = previousState.campaigns.find((c: any) => 
              c.name.toLowerCase().includes(targetCampaignName.toLowerCase())
            );
            
            if (targetCampaign) {
              params.target_campaign_id = targetCampaign.id;
              params.target_campaign_name = targetCampaign.name;
              console.log(`Found matching target campaign: ${targetCampaign.name} (ID: ${targetCampaign.id})`);
            }
          }
        }
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
      
      // Extract the publisher ID if directly specified in the query
      const publisherIdMatch = content.match(/publisher\s+(?:id\s+)?(\d+)/i) || 
                              content.match(/(?:send|message)(?:\s+to)?\s+publisher\s+(?:id\s+)?(\d+)/i) ||
                              content.match(/publisher\s+(?:with\s+id\s+)?(\d+)/i);
      
      if (publisherIdMatch && publisherIdMatch[1]) {
        params.publisher_id = publisherIdMatch[1].trim();
        console.log(`Extracted explicit publisher ID: "${params.publisher_id}"`);
      }
      
      // If no explicit publisher ID in query, try to get from previous state
      else if (previousState && previousState.publishers && previousState.publishers.length > 0) {
        // Use the first publisher from previous state
        params.publisher_id = previousState.publishers[0].id;
        params.publisher_name = previousState.publishers[0].name;
        console.log(`Using publisher ID from previous state: ${params.publisher_id} (${params.publisher_name})`);
      }
      
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
