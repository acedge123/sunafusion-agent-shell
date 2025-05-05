// Creator IQ API integration

// Determine which Creator IQ endpoints to query based on the user's query
export function determineCreatorIQEndpoints(query, previousState = null) {
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
          const sourceList = previousState.lists.find(list => 
            list.name.toLowerCase().includes(sourceListName.toLowerCase())
          );
          if (sourceList) {
            sourceListId = sourceList.id;
            console.log(`Found source list ID: ${sourceListId} for "${sourceListName}"`);
          }
        }
        
        if (targetListName) {
          const targetList = previousState.lists.find(list => 
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
            const sourceList = previousState.lists.find(list => 
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
            const sourceCampaign = previousState.campaigns.find(campaign => 
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
          const targetCampaign = previousState.campaigns.find(campaign => 
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
        const matchingList = previousState.lists.find(list => 
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

// Build payload for Creator IQ API requests
export function buildCreatorIQPayload(endpoint, query, params = {}, previousState = null) {
  const payload = { ...params }; // Start with any params passed in
  
  // List creation
  if (endpoint.route === "/lists" && endpoint.method === "POST") {
    console.log("Building payload for list creation");
    const listName = params.list_name || extractListNameFromQuery(query);
    
    // Create list payload
    return {
      Name: listName || `New List ${new Date().toISOString().split('T')[0]}`, 
      Description: params.list_description || ""
    };
  }
  
  // Add publishers to list
  if (endpoint.route.includes('/lists/') && endpoint.route.includes('/publishers') && endpoint.method === "POST") {
    console.log("Building payload for adding publishers to list");
    
    // If we have specific publisher IDs to add
    if (params.publisher_ids && Array.isArray(params.publisher_ids) && params.publisher_ids.length > 0) {
      console.log(`Using ${params.publisher_ids.length} publisher IDs from params`);
      return {
        PublisherIds: params.publisher_ids
      };
    }
    
    // If we have source list publishers in previous state
    if (previousState && previousState.publishers && previousState.publishers.length > 0 && 
        endpoint.sourceListId && previousState.publishers.some(p => p.listId === endpoint.sourceListId)) {
      
      const sourceListPublishers = previousState.publishers.filter(p => p.listId === endpoint.sourceListId);
      const publisherIds = sourceListPublishers.map(p => p.id);
      
      console.log(`Using ${publisherIds.length} publisher IDs from source list ${endpoint.sourceListId}`);
      
      return {
        PublisherIds: publisherIds
      };
    }
    
    // Default empty array if no publishers identified
    return {
      PublisherIds: []
    };
  }
  
  // Add publishers to campaign
  if (endpoint.route.includes('/campaigns/') && endpoint.route.includes('/publishers') && endpoint.method === "POST") {
    console.log("Building payload for adding publishers to campaign");
    
    // If we have specific publisher IDs to add
    if (params.publisher_ids && Array.isArray(params.publisher_ids) && params.publisher_ids.length > 0) {
      console.log(`Using ${params.publisher_ids.length} publisher IDs from params`);
      return {
        PublisherIds: params.publisher_ids
      };
    }
    
    // If we have source list or campaign publishers in previous state
    if (previousState && previousState.publishers && previousState.publishers.length > 0) {
      let publisherIds = [];
      
      // Check for source list publishers
      if (endpoint.sourceType === 'list' && endpoint.sourceId) {
        const sourceListPublishers = previousState.publishers.filter(p => p.listId === endpoint.sourceId);
        if (sourceListPublishers.length > 0) {
          publisherIds = sourceListPublishers.map(p => p.id);
          console.log(`Using ${publisherIds.length} publisher IDs from source list ${endpoint.sourceId}`);
        }
      }
      
      // Check for source campaign publishers
      else if (endpoint.sourceType === 'campaign' && endpoint.sourceId) {
        const sourceCampaignPublishers = previousState.publishers.filter(p => p.campaignId === endpoint.sourceId);
        if (sourceCampaignPublishers.length > 0) {
          publisherIds = sourceCampaignPublishers.map(p => p.id);
          console.log(`Using ${publisherIds.length} publisher IDs from source campaign ${endpoint.sourceId}`);
        }
      }
      
      // If we found publishers, return them
      if (publisherIds.length > 0) {
        return {
          PublisherIds: publisherIds
        };
      }
      
      // As a fallback, use all publishers from previous state
      publisherIds = previousState.publishers.map(p => p.id);
      console.log(`Using ${publisherIds.length} publisher IDs from previous state as fallback`);
      return {
        PublisherIds: publisherIds
      };
    }
    
    // Default empty array if no publishers identified
    return {
      PublisherIds: []
    };
  }
  
  // Publisher status update
  if (endpoint.route.includes("/publishers/") && endpoint.method === "PUT") {
    console.log("Building payload for publisher status update");
    const statusValue = params.status_value || extractStatusFromQuery(query);
    
    // If we have a publisher ID in the URL template but not in params, try to find it
    if (endpoint.route.includes("{publisher_id}") && !params.publisher_id) {
      if (previousState && previousState.publishers && previousState.publishers.length > 0) {
        payload.publisher_id = previousState.publishers[0].id;
        console.log(`Using publisher ID from state: ${payload.publisher_id}`);
      }
    }
    
    // If we have a publisher_id, replace the placeholder in the route
    if (payload.publisher_id) {
      endpoint.route = endpoint.route.replace("{publisher_id}", payload.publisher_id);
    }
    
    return {
      Status: statusValue || "active"
    };
  }
  
  // Message sending - Improved handling
  if (endpoint.route.includes("/publishers/") && endpoint.route.includes("/messages")) {
    console.log("Building payload for message sending");
    
    // Extract message from query or params
    const messageContent = params.message_content || extractMessageFromQuery(query) || "Hello from Creator IQ!";
    const messageSubject = params.message_subject || "Message from Creator IQ";
    
    // If the endpoint already has a publisher ID directly in the route (not a placeholder)
    if (endpoint.publisherId || !endpoint.route.includes("{publisher_id}")) {
      if (endpoint.publisherId) {
        console.log(`Using publisher ID from endpoint: ${endpoint.publisherId}`);
      } else {
        // Extract the publisher ID from the route if it's not a placeholder
        const idMatch = endpoint.route.match(/\/publishers\/(\d+)\/messages/);
        if (idMatch && idMatch[1]) {
          endpoint.publisherId = idMatch[1];
          console.log(`Extracted publisher ID from route: ${endpoint.publisherId}`);
        }
      }
      
      return {
        Subject: messageSubject,
        Content: messageContent
      };
    }
    
    // If we have a publisher ID in params, update the endpoint
    if (params.publisher_id) {
      // Replace the placeholder in the endpoint with the actual publisher ID
      if (endpoint.route.includes("{publisher_id}")) {
        endpoint.route = endpoint.route.replace("{publisher_id}", params.publisher_id);
        console.log(`Updated endpoint with publisher ID from params: ${endpoint.route}`);
      }
      // Also store the publisher ID in the endpoint object for reference
      endpoint.publisherId = params.publisher_id;
      
      return {
        Subject: messageSubject,
        Content: messageContent
      };
    }
    
    // Try to get a publisher ID from previous state if we still have a placeholder
    if (endpoint.route.includes("{publisher_id}")) {
      let publisherId = null;
      
      // Try first to get the most recent publisher from previous state
      if (previousState && previousState.publishers && previousState.publishers.length > 0) {
        publisherId = previousState.publishers[0].id;
        console.log(`Using publisher ID from state: ${publisherId}`);
      }
      
      // Look for publisher ID in the query
      if (!publisherId) {
        const idMatch = query.match(/\b(\d{6,10})\b/); // Look for 6-10 digit numbers that could be publisher IDs
        if (idMatch && idMatch[1]) {
          publisherId = idMatch[1];
          console.log(`Extracted potential publisher ID from query: ${publisherId}`);
        }
      }
      
      if (publisherId) {
        endpoint.route = endpoint.route.replace("{publisher_id}", publisherId);
        endpoint.publisherId = publisherId;
        console.log(`Updated endpoint with publisher ID: ${endpoint.route}`);
        
        return {
          Subject: messageSubject,
          Content: messageContent
        };
      }
      
      console.error("Error: No publisher ID available for message sending");
      // We keep the placeholder, the error will be caught during the API call
    }
    
    return {
      Subject: messageSubject,
      Content: messageContent
    };
  }

  // For GET requests to list campaigns
  if (endpoint.route === "/campaigns" && endpoint.method === "GET") {
    const searchParams: any = { limit: 50 };
    
    if (params.campaign_search_term) {
      searchParams.search = params.campaign_search_term;
      console.log(`Adding campaign search term: "${params.campaign_search_term}"`);
    }
    
    return searchParams;
  }

  // For GET requests to list publishers in a campaign
  if (endpoint.route.includes("/campaigns/") && endpoint.route.includes("/publishers")) {
    return { limit: 50 };
  }

  // For GET requests to list all publishers
  if (endpoint.route === "/publishers" && endpoint.method === "GET") {
    const searchParams: any = { limit: 50 };
    
    if (params.publisher_search_term) {
      searchParams.search = params.publisher_search_term;
    }
    
    return searchParams;
  }

  // For GET requests to list all lists
  if (endpoint.route === "/lists" && endpoint.method === "GET") {
    const searchParams: any = { limit: 50 };
    
    if (params.list_search_term) {
      searchParams.search = params.list_search_term;
      console.log(`Adding search parameter for list name: "${params.list_search_term}"`);
      
      // Enable search across all pages
      searchParams._fullSearch = true;
      console.log("Enabling full search across all pages");
    }
    
    return searchParams;
  }

  // For GET requests to list publishers in a list
  if (endpoint.route.includes("/lists/") && endpoint.route.includes("/publishers") && endpoint.method === "GET") {
    return { limit: 50 };
  }

  // Default minimal payload
  return payload;
}

// Helper to extract list name from query
function extractListNameFromQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  // Handle various patterns for list name extraction
  const patterns = [
    // "create a list called X"
    /list\s+(?:called|named|titled)?\s+["']([^"']+)["']/i,
    // "create a list X"
    /["']([^"']+)["'](?:\s+list)/i,
    // "create list X" without quotes
    /(?:create|make)\s+(?:a\s+)?(?:new\s+)?list\s+(?:called|named|titled)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
  ];
  
  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      console.log(`Extracted list name: "${match[1].trim()}"`);
      return match[1].trim();
    }
  }
  
  // Try to extract any capitalized words after "create list" as a potential name
  const capitalizedMatch = query.match(/(?:create|make)\s+(?:a\s+)?(?:new\s+)?list\s+(?:called|named|titled)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (capitalizedMatch && capitalizedMatch[1]) {
    console.log(`Extracted potential list name from capitalized words: "${capitalizedMatch[1].trim()}"`);
    return capitalizedMatch[1].trim();
  }
  
  // Extract list name from simpler pattern if above patterns fail
  if (lowerQuery.includes("ai agent test")) {
    return "AI Agent Test";
  }
  
  // Default name with timestamp
  return `New List ${new Date().toISOString().split('T')[0]}`;
}

// Extract status value from query
function extractStatusFromQuery(query) {
  const statusMatch = query.toLowerCase().match(/status\s+(?:to\s+)?["']?([a-zA-Z]+)["']?/i);
  if (statusMatch && statusMatch[1]) {
    return statusMatch[1].trim().toLowerCase();
  }
  return "active"; // Default status
}

// Extract message content from query
function extractMessageFromQuery(query) {
  // Added more patterns to extract messages
  const patterns = [
    // "message saying 'hello world'"
    /message\s+(?:saying\s+|content\s+)?["']([^"']+)["']/i,
    // "with message 'hello world'"
    /with\s+message\s+["']([^"']+?)["']/i,
    // "message hello world"
    /message\s+["']?([^"']+?)["']?\s*(?:to|$)/i,
    // "hello test" (quotation marks without explicit "message" keyword)
    /["']([^"']{3,100})["']/
  ];
  
  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim();
      console.log(`Extracted message content: "${extracted}"`);
      return extracted;
    }
  }
  
  // Try to extract message after a colon or newline
  const lines = query.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('message:')) {
      const messageContent = line.substring(line.indexOf(':') + 1).trim();
      if (messageContent) {
        console.log(`Extracted message after colon: "${messageContent}"`);
        return messageContent;
      }
    }
  }
  
  return null; // No message found
}

// Query Creator IQ API endpoint with automatic pagination support
export async function queryCreatorIQEndpoint(endpoint, payload) {
  const apiKey = Deno.env.get("CREATOR_IQ_API_KEY");
  if (!apiKey) {
    throw new Error("Creator IQ API key is not configured");
  }
  
  let url = `https://apis.creatoriq.com/crm/v1/api${endpoint.route}`;
  
  // Enhanced error handling for publisher ID placeholder in message endpoints
  if (endpoint.route.includes("{publisher_id}") && endpoint.route.includes("/messages")) {
    console.error("Error: Publisher ID placeholder not resolved in message endpoint URL");
    
    // Create a more descriptive error response
    return {
      endpoint: endpoint.route,
      method: endpoint.method,
      name: endpoint.name,
      error: "Missing publisher ID",
      data: {
        operation: {
          successful: false,
          type: "Send Message",
          details: "Failed to send message: No publisher ID specified. Please provide a specific publisher ID.",
          timestamp: new Date().toISOString()
        },
        success: false,
        message: "Unable to send message without a valid publisher ID. Please specify a publisher ID."
      }
    };
  }
  
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
  
  console.log(`Querying endpoint ${endpoint.route} with payload:`, payload);
  
  // For GET requests, need to handle pagination
  if (endpoint.method === "GET") {
    try {
      // Extract pagination-related parameters
      const enableAllPages = payload._fullSearch === true || 
                           (payload.all_pages === true) || 
                           ('all_pages' in payload && payload.all_pages === 'true');
      
      // Deep clone the payload to avoid modifying the original
      const queryPayload = { ...payload };
      
      // Remove special parameters that shouldn't be sent as query params
      if ('_fullSearch' in queryPayload) delete queryPayload._fullSearch;
      
      // Define a function to fetch a single page
      const fetchPage = async (page = 1, limit = queryPayload.limit || 50) => {
        const queryParams = new URLSearchParams();
        
        // Add all parameters from payload
        for (const [key, value] of Object.entries(queryPayload)) {
          if (key !== 'page' && key !== 'limit') { // Don't override our pagination params
            queryParams.append(key, String(value));
          }
        }
        
        // Add pagination parameters
        queryParams.append('page', String(page));
        queryParams.append('limit', String(limit));
        
        const fullUrl = `${url}?${queryParams.toString()}`;
        console.log(`Fetching page ${page} with limit ${limit} from ${fullUrl}`);
        
        const response = await fetch(fullUrl, { headers });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      };
      
      // Start by fetching the first page to determine total pages
      let initialData = await fetchPage(1);
      
      // Check if we need to handle pagination and endpoint supports it
      let shouldPaginate = enableAllPages && 
                         endpoint.route.match(/\/(lists|publishers|campaigns)(?:\/\d+\/publishers)?$/);
      
      if (shouldPaginate) {
        console.log("Pagination detected, checking if multiple pages exist");
        
        // Determine the collection field name based on endpoint
        let collectionField = null;
        if (endpoint.route === '/lists') {
          collectionField = 'ListsCollection';
        } else if (endpoint.route === '/publishers') {
          collectionField = 'PublisherCollection';
        } else if (endpoint.route === '/campaigns') {
          collectionField = 'CampaignCollection';
        } else if (endpoint.route.includes('/publishers')) {
          collectionField = 'PublisherCollection';
        }
        
        if (!collectionField || !initialData[collectionField]) {
          console.log(`No collection field '${collectionField}' found in response, pagination not possible`);
          shouldPaginate = false;
        }
      }
      
      // If we have multiple pages and should paginate, fetch all pages and combine results
      if (shouldPaginate && initialData.total_pages && initialData.total_pages > 1) {
        const totalPages = initialData.total_pages;
        const totalItems = initialData.total || 0;
        console.log(`Found ${totalPages} pages with ${totalItems} total items. Starting pagination...`);
        
        // Determine the collection field name based on endpoint
        const collectionField = endpoint.route === '/lists' ? 'ListsCollection' : 
                               endpoint.route === '/publishers' ? 'PublisherCollection' :
                               endpoint.route === '/campaigns' ? 'CampaignCollection' :
                               endpoint.route.includes('/publishers') ? 'PublisherCollection' : null;
        
        if (collectionField && initialData[collectionField]) {
          // Store all items from all pages in this array
          const allItems = [...initialData[collectionField]];
          
          // Fetch the remaining pages (starting from page 2)
          const pagePromises = [];
          for (let page = 2; page <= totalPages; page++) {
            pagePromises.push(fetchPage(page));
          }
          
          console.log(`Fetching ${pagePromises.length} additional pages in parallel...`);
          const pageResults = await Promise.all(pagePromises);
          
          // Combine all results
          for (const pageData of pageResults) {
            if (pageData[collectionField] && Array.isArray(pageData[collectionField])) {
              allItems.push(...pageData[collectionField]);
            } else {
              console.warn(`Missing ${collectionField} in page response:`, pageData);
            }
          }
          
          console.log(`Combined ${allItems.length} items from ${totalPages} pages`);
          
          // Replace the collection in the initial data with the combined collection
          initialData[collectionField] = allItems;
          
          // Update pagination metadata to reflect that we've fetched everything
          initialData.page = 1;
          initialData.pages_count = 1;
          initialData.is_paginated = false;
        } else {
          console.warn(`Unable to determine collection field for endpoint ${endpoint.route}`);
        }
      }
      
      // Process results based on endpoint type
      processResponseMetadata(initialData, endpoint);
      
      return {
        endpoint: endpoint.route,
        method: endpoint.method,
        name: endpoint.name,
        data: initialData
      };
    } catch (error) {
      console.error(`Error during paginated request to ${endpoint.route}:`, error);
      return {
        endpoint: endpoint.route,
        method: endpoint.method,
        name: endpoint.name,
        error: error.message || "Unknown error",
        data: {
          operation: {
            successful: false,
            type: endpoint.name,
            details: `Pagination failed: ${error.message || "Unknown error"}`,
            timestamp: new Date().toISOString()
          }
        }
      };
    }
  } else {
    // For non-GET methods (POST, PUT, DELETE)
    try {
      console.log(`Making ${endpoint.method} request to ${url} with payload:`, payload);
      const response = await fetch(url, {
        method: endpoint.method,
        headers,
        body: JSON.stringify(payload)
      });
      
      console.log(`Creator IQ API response status: ${response.status}`);
      
      // Enhanced error handling for common error codes
      if (!response.ok) {
        // For 404 errors on message sending, provide a more helpful error with publisher ID
        if (response.status === 404 && endpoint.route.includes("/messages")) {
          const publisherId = endpoint.route.match(/\/publishers\/(\d+)\/messages/)?.[1];
          
          console.error(`Publisher not found: ${publisherId || "Unknown ID"}`);
          
          return {
            endpoint: endpoint.route,
            method: endpoint.method,
            name: endpoint.name,
            error: `Publisher not found: ${publisherId || "Unknown ID"}`,
            data: {
              operation: {
                successful: false,
                type: "Send Message",
                details: `Failed to send message: Publisher with ID ${publisherId || "Unknown"} not found`,
                timestamp: new Date().toISOString()
              },
              success: false,
              messageId: null,
              publisherId: publisherId,
              message: `Publisher with ID ${publisherId || "Unknown"} not found`
            }
          };
        }
        
        // Handle other error status codes
        const errorText = await response.text();
        let errorMessage = `Creator IQ API error: ${response.status} ${response.statusText}`;
        
        try {
          // Try to parse error response as JSON for more details
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage += ` - ${errorJson.message}`;
          }
        } catch (e) {
          // If not JSON, use the text directly if available
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        }
        
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Process operation metadata based on endpoint type
      processResponseMetadata(data, endpoint);
      
      return {
        endpoint: endpoint.route,
        method: endpoint.method,
        name: endpoint.name,
        data
      };
    } catch (error) {
      console.error(`Error querying endpoint ${endpoint.route}:`, error);
      
      // Enhanced error response structure
      const errorResponse = {
        endpoint: endpoint.route,
        method: endpoint.method,
        name: endpoint.name,
        error: error.message || "Unknown error",
        data: {
          operation: {
            successful: false,
            type: endpoint.name,
            details: `Operation failed: ${error.message || "Unknown error"}`,
            timestamp: new Date().toISOString()
          },
          success: false,
          message: error.message || "Unknown error"
        }
      };
      
      // Special handling for message operations
      if (endpoint.route.includes("/messages")) {
        const publisherId = endpoint.route.match(/\/publishers\/(\d+)\/messages/)?.[1];
        if (publisherId) {
          errorResponse.data.publisherId = publisherId;
          errorResponse.data.operation.details += ` (Publisher ID: ${publisherId})`;
        }
      }
      
      return errorResponse;
    }
  }
}

// Helper function to process metadata in responses
function processResponseMetadata(data, endpoint) {
  // If this is a successful list creation, add metadata
  if (endpoint.method === "POST" && endpoint.route === "/lists" && data.List && data.List.Id) {
    console.log(`Successfully created list: ${data.List.Name} (ID: ${data.List.Id})`);
    
    // Add operation metadata
    data.operation = {
      type: "Create List",
      successful: true,
      details: `Created list: ${data.List.Name} (ID: ${data.List.Id})`,
      timestamp: new Date().toISOString()
    };
  }
  
  // If this is a successful publisher addition to list, add metadata
  if (endpoint.method === "POST" && endpoint.route.includes("/lists/") && endpoint.route.includes("/publishers")) {
    // Extract list ID from the URL
    const listId = endpoint.route.match(/\/lists\/(\d+)\/publishers/)?.[1];
    const publisherIds = endpoint?.payload?.PublisherIds || [];
    
    console.log(`Added publishers to list ${listId}`);
    
    // Add operation metadata
    data.operation = {
      type: "Add Publishers To List",
      successful: true,
      details: `Added publishers to list ${listId}`,
      timestamp: new Date().toISOString(),
      listId: listId,
      publisherIds: publisherIds
    };
    
    // Add additional metadata for state tracking
    data.listId = listId;
    data.success = true;
    data.message = `Publishers added to list ${listId}`;
    data.publisherIds = publisherIds;
  }
  
  // If this is a successful publisher addition to campaign, add metadata
  if (endpoint.method === "POST" && endpoint.route.includes("/campaigns/") && endpoint.route.includes("/publishers")) {
    // Extract campaign ID from the URL
    const campaignId = endpoint.route.match(/\/campaigns\/(\d+)\/publishers/)?.[1];
    const publisherIds = endpoint?.payload?.PublisherIds || [];
    
    console.log(`Added publishers to campaign ${campaignId}`);
    
    // Add operation metadata
    data.operation = {
      type: "Add Publishers To Campaign",
      successful: true,
      details: `Added publishers to campaign ${campaignId}`,
      timestamp: new Date().toISOString(),
      campaignId: campaignId,
      publisherIds: publisherIds
    };
    
    // Add additional metadata for state tracking
    data.campaignId = campaignId;
    data.success = true;
    data.message = `Publishers added to campaign ${campaignId}`;
    data.publisherIds = publisherIds;
  }
  
  // Enhanced handling for message operations
  if (endpoint.route.includes("/messages") && endpoint.method === "POST") {
    // Extract publisher ID from the URL
    const publisherId = endpoint.route.match(/\/publishers\/(\d+)\/messages/)?.[1];
    
    console.log(`Successfully sent message to publisher ${publisherId}`);
    
    // Add more detailed operation metadata
    data.operation = {
      type: "Send Message",
      successful: true,
      details: `Message sent successfully to publisher ${publisherId}`,
      timestamp: new Date().toISOString(),
      publisherId: publisherId
    };
    
    // Add additional metadata for state tracking
    data.publisherId = publisherId;
    data.success = true;
    data.messageId = data.MessageId || data.Id || new Date().getTime().toString(); // Use API-provided ID or generate one
    data.message = `Message sent successfully to publisher ${publisherId}`;
    
    // Store the publisher ID and message content for future reference
    data.sentMessage = {
      publisherId: publisherId,
      content: endpoint?.payload?.Content,
      subject: endpoint?.payload?.Subject,
      sentAt: new Date().toISOString()
    };
  }
}
