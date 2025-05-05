// Determines which Creator IQ endpoints to query based on user's query

// Determine which Creator IQ endpoints to query based on the user's query
export function determineCreatorIQEndpoints(query: string, previousState: any = null) {
  const endpoints = [];
  const lowerQuery = query.toLowerCase();

  // First check for write operations as they have higher priority
  if ((lowerQuery.includes('create') || lowerQuery.includes('make')) && 
      lowerQuery.includes('list')) {
    console.log("Detected list creation request");
    endpoints.push({
      route: "/lists",
      method: "POST",
      name: "Create List"
    });
    return endpoints;
  }
  
  // Check for add publisher to list operation
  if ((lowerQuery.includes('add') || lowerQuery.includes('copy') || lowerQuery.includes('move')) && 
     (lowerQuery.includes('publisher') || lowerQuery.includes('influencer'))) {
    
    // Determine if adding to list or campaign
    const isListTarget = lowerQuery.includes('list') && !lowerQuery.includes('from list to campaign');
    const isCampaignTarget = lowerQuery.includes('campaign') || lowerQuery.includes('from list to campaign');
    
    if (isListTarget) {
      console.log("Detected request to add publisher to list");
      
      // Try to extract source and target list info from the query
      let sourceListId, targetListId;
      let sourceListName, targetListName;
      
      // Find list names in the query
      const sourcePhrases = ['from list', 'in list', 'list called', 'source list'];
      const targetPhrases = ['to list', 'into list', 'target list'];
      
      // Extract list names from query
      for (const phrase of sourcePhrases) {
        if (lowerQuery.includes(phrase)) {
          const afterPhrase = query.substring(query.toLowerCase().indexOf(phrase) + phrase.length).trim();
          const listNameMatch = afterPhrase.match(/["']([^"']+)["']/) || 
                               afterPhrase.match(/(\b[A-Z][a-zA-Z0-9\s-]+)/);
          if (listNameMatch) {
            sourceListName = listNameMatch[1].trim();
            console.log(`Found potential source list name: "${sourceListName}"`);
            break;
          }
        }
      }
      
      for (const phrase of targetPhrases) {
        if (lowerQuery.includes(phrase)) {
          const afterPhrase = query.substring(query.toLowerCase().indexOf(phrase) + phrase.length).trim();
          const listNameMatch = afterPhrase.match(/["']([^"']+)["']/) || 
                               afterPhrase.match(/(\b[A-Z][a-zA-Z0-9\s-]+)/);
          if (listNameMatch) {
            targetListName = listNameMatch[1].trim();
            console.log(`Found potential target list name: "${targetListName}"`);
            break;
          }
        }
      }
      
      // If we have previous state with lists, try to find the lists by name
      if (previousState && previousState.lists && previousState.lists.length > 0) {
        if (sourceListName) {
          const sourceList = previousState.lists.find((list: any) => 
            list.name.toLowerCase().includes(sourceListName.toLowerCase())
          );
          if (sourceList) {
            sourceListId = sourceList.id;
            console.log(`Found source list ID: ${sourceListId} for "${sourceListName}"`);
          }
        }
        
        if (targetListName) {
          const targetList = previousState.lists.find((list: any) => 
            list.name.toLowerCase().includes(targetListName.toLowerCase())
          );
          if (targetList) {
            targetListId = targetList.id;
            console.log(`Found target list ID: ${targetListId} for "${targetListName}"`);
          }
        }
      }
      
      // If we found a source list, get its publishers
      if (sourceListId) {
        endpoints.push({
          route: `/lists/${sourceListId}/publishers`,
          method: "GET",
          name: "Get Source List Publishers",
          sourceListId: sourceListId
        });
      } else {
        // If no source list identified, we need to get all lists first
        endpoints.push({
          route: "/lists",
          method: "GET",
          name: "Get Lists"
        });
      }
      
      // If we found both source and target list IDs and they're different, add the endpoint to add publishers
      if (sourceListId && targetListId && sourceListId !== targetListId) {
        endpoints.push({
          route: `/lists/${targetListId}/publishers`,
          method: "POST",
          name: "Add Publishers To List",
          targetListId: targetListId,
          sourceListId: sourceListId
        });
      }
    }
    else if (isCampaignTarget) {
      console.log("Detected request to add publisher to campaign");
      
      // Extract source (list or campaign) and target campaign info
      let sourceId, targetCampaignId;
      let sourceName, targetCampaignName;
      let sourceType = null; // 'list' or 'campaign'
      
      // Check for source type indicators
      const isSourceList = lowerQuery.includes('from list') || lowerQuery.includes('from the list');
      const isSourceCampaign = lowerQuery.includes('from campaign') || lowerQuery.includes('from the campaign');
      
      // Find source names in the query (list or campaign)
      const sourcePhrases = [
        'from list', 'from the list', 'list called', 'source list',
        'from campaign', 'from the campaign', 'campaign called', 'source campaign'
      ];
      const targetPhrases = ['to campaign', 'into campaign', 'target campaign'];
      
      // Extract source name from query
      for (const phrase of sourcePhrases) {
        if (lowerQuery.includes(phrase)) {
          const afterPhrase = query.substring(query.toLowerCase().indexOf(phrase) + phrase.length).trim();
          const nameMatch = afterPhrase.match(/["']([^"']+)["']/) || 
                           afterPhrase.match(/(\b[A-Z][a-zA-Z0-9\s-]+)/);
          if (nameMatch) {
            sourceName = nameMatch[1].trim();
            // Set source type based on phrase
            if (phrase.includes('list')) {
              sourceType = 'list';
            } else if (phrase.includes('campaign')) {
              sourceType = 'campaign';
            }
            console.log(`Found potential source ${sourceType}: "${sourceName}"`);
            break;
          }
        }
      }
      
      // Extract target campaign name from query
      for (const phrase of targetPhrases) {
        if (lowerQuery.includes(phrase)) {
          const afterPhrase = query.substring(query.toLowerCase().indexOf(phrase) + phrase.length).trim();
          const campaignNameMatch = afterPhrase.match(/["']([^"']+)["']/) || 
                                   afterPhrase.match(/(\b[A-Z][a-zA-Z0-9\s-]+)/);
          if (campaignNameMatch) {
            targetCampaignName = campaignNameMatch[1].trim();
            console.log(`Found potential target campaign name: "${targetCampaignName}"`);
            break;
          }
        }
      }
      
      // If we have previous state, try to find the source and target IDs
      if (previousState) {
        // Find source ID based on type and name
        if (sourceName) {
          if ((sourceType === 'list' || !sourceType) && previousState.lists && previousState.lists.length > 0) {
            const sourceList = previousState.lists.find((list: any) => 
              list.name.toLowerCase().includes(sourceName.toLowerCase())
            );
            if (sourceList) {
              sourceId = sourceList.id;
              sourceType = 'list';
              console.log(`Found source list ID: ${sourceId} for "${sourceName}"`);
            }
          }
          
          if ((sourceType === 'campaign' || (!sourceType && !sourceId)) && 
              previousState.campaigns && previousState.campaigns.length > 0) {
            const sourceCampaign = previousState.campaigns.find((campaign: any) => 
              campaign.name.toLowerCase().includes(sourceName.toLowerCase())
            );
            if (sourceCampaign) {
              sourceId = sourceCampaign.id;
              sourceType = 'campaign';
              console.log(`Found source campaign ID: ${sourceId} for "${sourceName}"`);
            }
          }
        }
        
        // Find target campaign ID
        if (targetCampaignName && previousState.campaigns && previousState.campaigns.length > 0) {
          const targetCampaign = previousState.campaigns.find((campaign: any) => 
            campaign.name.toLowerCase().includes(targetCampaignName.toLowerCase())
          );
          if (targetCampaign) {
            targetCampaignId = targetCampaign.id;
            console.log(`Found target campaign ID: ${targetCampaignId} for "${targetCampaignName}"`);
          }
        }
      }
      
      // Based on what we found, set up the endpoints
      // If we have a source list or campaign, get its publishers first
      if (sourceId && sourceType) {
        if (sourceType === 'list') {
          endpoints.push({
            route: `/lists/${sourceId}/publishers`,
            method: "GET",
            name: "Get Source List Publishers",
            sourceListId: sourceId
          });
        } else if (sourceType === 'campaign') {
          endpoints.push({
            route: `/campaigns/${sourceId}/publishers`,
            method: "GET",
            name: "Get Source Campaign Publishers",
            sourceCampaignId: sourceId
          });
        }
      } else {
        // If we don't have a source, get lists or campaigns first
        if (isSourceList) {
          endpoints.push({
            route: "/lists",
            method: "GET",
            name: "Get Lists"
          });
        } else if (isSourceCampaign) {
          endpoints.push({
            route: "/campaigns",
            method: "GET",
            name: "List Campaigns"
          });
        } else {
          // Try both
          endpoints.push({
            route: "/lists",
            method: "GET",
            name: "Get Lists"
          });
          endpoints.push({
            route: "/campaigns",
            method: "GET",
            name: "List Campaigns"
          });
        }
      }
      
      // If we have a target campaign ID and source, add endpoint to add publishers
      if (targetCampaignId && sourceId) {
        endpoints.push({
          route: `/campaigns/${targetCampaignId}/publishers`,
          method: "POST",
          name: "Add Publishers To Campaign",
          targetCampaignId: targetCampaignId,
          sourceId: sourceId,
          sourceType: sourceType
        });
      }
    }
    
    return endpoints;
  }
  
  // Check for publisher status update
  if (lowerQuery.includes('update') && 
      lowerQuery.includes('status') && 
      (lowerQuery.includes('publisher') || lowerQuery.includes('influencer'))) {
    console.log("Detected publisher status update request");
    // We'll need to extract the publisher ID from context or handle it in the payload builder
    endpoints.push({
      route: "/publishers/{publisher_id}",
      method: "PUT",
      name: "Update Publisher Status"
    });
    return endpoints;
  }
  
  // Check for message sending
  if ((lowerQuery.includes('send') && lowerQuery.includes('message')) ||
      (lowerQuery.includes('message') && 
      (lowerQuery.includes('publisher') || lowerQuery.includes('influencer')))) {
    console.log("Detected message sending request");
    
    // Enhanced publisher ID extraction from query
    // Look for patterns like "publisher 12345" or "publisher ID 12345" or just a standalone number
    const publisherIdPatterns = [
      // "publisher 12345" or "publisher ID 12345"
      /publisher\s+(?:id\s+)?(\d+)/i,
      // "send message to publisher 12345"
      /(?:send|message)(?:\s+to)?\s+publisher\s+(?:id\s+)?(\d+)/i,
      // "publisher with id 12345" 
      /publisher\s+(?:with\s+id\s+)?(\d+)/i,
      // "this publisher 12345"
      /this\s+publisher\s+(\d+)/i,
      // Standalone number that could be a publisher ID
      /\b(\d{6,10})\b/ // Looking for 6-10 digit numbers that are likely publisher IDs
    ];
    
    let publisherId = null;
    // Try each pattern until we find a match
    for (const pattern of publisherIdPatterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        publisherId = match[1].trim();
        console.log(`Found publisher ID in query using pattern ${pattern}: ${publisherId}`);
        break;
      }
    }
    
    if (publisherId) {
      console.log(`Using explicit publisher ID from query: ${publisherId}`);
      
      // Use the exact publisher ID in the endpoint
      endpoints.push({
        route: `/publishers/${publisherId}/messages`,
        method: "POST",
        name: "Send Message to Publisher",
        publisherId: publisherId
      });
    } 
    // If we don't have an ID in the query, we need a placeholder endpoint
    else {
      console.log("No publisher ID found in the query, will need to determine it later");
      endpoints.push({
        route: "/publishers/{publisher_id}/messages",
        method: "POST",
        name: "Send Message to Publisher"
      });
    }
    
    return endpoints;
  }

  // Handle list-related queries
  if (lowerQuery.includes('list') || 
      (lowerQuery.includes('find') && lowerQuery.includes('influencer'))) {
    console.log("Adding list endpoints based on keywords");
    endpoints.push({
      route: "/lists",
      method: "GET",
      name: "Get Lists"
    });
    
    // If we detect a specific list name, add endpoint for that list's publishers
    const listNameMatch = query.match(/list(?:\s+called|\s+named|\s+titled)?\s+["']([^"']+)["']/i);
    if (listNameMatch && listNameMatch[1]) {
      const listName = listNameMatch[1];
      console.log(`Detected list name: "${listName}", will search for it`);
      
      // If we have previous state with lists, try to find the list ID
      if (previousState && previousState.lists && previousState.lists.length > 0) {
        const matchingList = previousState.lists.find((list: any) => 
          list.name.toLowerCase().includes(listName.toLowerCase())
        );
        
        if (matchingList) {
          console.log(`Found matching list in previous state: ${matchingList.name} (${matchingList.id})`);
          endpoints.push({
            route: `/lists/${matchingList.id}/publishers`,
            method: "GET",
            name: "Get Publishers in List"
          });
        }
      }
    }
  }

  // Handle campaign-related queries
  if (lowerQuery.includes('campaign') || 
      lowerQuery.includes('ready rocker') || 
      lowerQuery.includes('ambassador') || 
      lowerQuery.includes('program')) {
    console.log("Adding campaign endpoints based on keywords");
    endpoints.push({
      route: "/campaigns",
      method: "GET",
      name: "List Campaigns"
    });
    
    // If we detect a specific campaign or have one in state, add publishers endpoint
    if (previousState && previousState.campaigns && previousState.campaigns.length > 0) {
      // If query mentions specific campaign, look for it in state
      let targetCampaign = null;
      
      for (const campaign of previousState.campaigns) {
        if (lowerQuery.includes(campaign.name.toLowerCase())) {
          console.log(`Query mentions campaign: ${campaign.name}, will get its publishers`);
          targetCampaign = campaign;
          break;
        }
      }
      
      // If we found a specific campaign, add endpoint for its publishers
      if (targetCampaign) {
        endpoints.push({
          route: `/campaigns/${targetCampaign.id}/publishers`,
          method: "GET",
          name: "Get Campaign Publishers"
        });
      } 
      // Otherwise if query asks for publishers, use the first campaign
      else if (lowerQuery.includes('publisher') || lowerQuery.includes('influencer')) {
        console.log("Query mentions publishers but no specific campaign, using first campaign from state");
        endpoints.push({
          route: `/campaigns/${previousState.campaigns[0].id}/publishers`,
          method: "GET",
          name: "Get Campaign Publishers"
        });
      }
    }
  }

  // If no endpoints were added but we're looking for publishers, add generic publisher endpoint
  if (endpoints.length === 0 && 
     (lowerQuery.includes('publisher') || lowerQuery.includes('influencer'))) {
    console.log("Adding generic publisher endpoint");
    endpoints.push({
      route: "/publishers",
      method: "GET",
      name: "List Publishers"
    });
  }

  // If still no endpoints added, default to campaigns
  if (endpoints.length === 0) {
    console.log("No specific endpoints matched, adding default campaign endpoint");
    endpoints.push({
      route: "/campaigns",
      method: "GET",
      name: "List Campaigns"
    });
  }

  console.log(`Selected ${endpoints.length} endpoints for the query`);
  return endpoints;
}
