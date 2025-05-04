// Creator IQ API integration

// Updated function to query Creator IQ endpoints with improved pagination support
export async function queryCreatorIQEndpoint(endpoint, payload) {
  try {
    const CREATOR_IQ_API_KEY = Deno.env.get('CREATOR_IQ_API_KEY');
    if (!CREATOR_IQ_API_KEY) {
      throw new Error("CREATOR_IQ_API_KEY is not set");
    }

    // Updated base URL
    const baseUrl = 'https://apis.creatoriq.com/crm/v1/api';
    const url = `${baseUrl}${endpoint.route}`;
    
    // Set up headers for Creator IQ API
    const headers = {
      'Authorization': `Bearer ${CREATOR_IQ_API_KEY}`,
      'Content-Type': 'application/json'
    };
    
    console.log(`Querying Creator IQ endpoint: ${endpoint.route} with method: ${endpoint.method} and payload:`, payload);

    // Improved request handling
    let response;
    if (endpoint.method === 'POST') {
      console.log(`Making POST request to ${url}`);
      response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });
    } else if (endpoint.method === 'PUT') {
      console.log(`Making PUT request to ${url}`);
      response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(payload)
      });
    } else {
      // For GET requests, properly build URL with query parameters
      const urlParams = new URLSearchParams();
      if (payload) {
        Object.entries(payload).forEach(([key, value]) => {
          if (!endpoint.route.includes(`{${key}}`) && value !== undefined && typeof value !== 'object') {
            urlParams.append(key, value.toString());
          }
        });
      }
      
      const fullUrl = `${url}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
      console.log(`Making GET request to ${fullUrl}`);
      response = await fetch(fullUrl, {
        method: 'GET',
        headers: headers
      });
    }
    
    // Log response status and handle errors
    console.log(`Creator IQ API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Creator IQ API error (${response.status}): ${errorText}`);
      throw new Error(`Creator IQ API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Creator IQ response from ${endpoint.route}:`, data);
    
    // Enhanced search handling for campaigns
    if (endpoint.route === "/campaigns") {
      // Special handling for campaign searches that need to check all pages
      if (payload.search) {
        const searchTerm = payload.search.toLowerCase();
        console.log(`Searching for campaigns by term: "${searchTerm}" across all pages`);
        
        // Store the first page results
        let allCampaigns = [...(data.CampaignCollection || [])];
        let currentPage = 1;
        const totalPages = data.total_pages || 1;
        
        // If there are more pages and we're doing a specific search, fetch all pages
        // We only do this for specific searches to avoid overloading the API with requests
        if (totalPages > 1 && searchTerm) {
          console.log(`Found ${totalPages} pages of campaigns, fetching all pages for complete search...`);
          
          // Fetch the remaining pages
          while (currentPage < totalPages && currentPage < 10) { // Limit to 10 pages max as safety
            currentPage++;
            const nextPagePayload = { ...payload, page: currentPage };
            const nextPageUrlParams = new URLSearchParams();
            
            Object.entries(nextPagePayload).forEach(([key, value]) => {
              if (value !== undefined) {
                nextPageUrlParams.append(key, value.toString());
              }
            });
            
            const nextPageUrl = `${url}?${nextPageUrlParams.toString()}`;
            console.log(`Fetching campaigns page ${currentPage}/${totalPages} from ${nextPageUrl}`);
            
            try {
              const nextPageResponse = await fetch(nextPageUrl, {
                method: 'GET',
                headers: headers
              });
              
              if (nextPageResponse.ok) {
                const nextPageData = await nextPageResponse.json();
                if (nextPageData.CampaignCollection && nextPageData.CampaignCollection.length > 0) {
                  console.log(`Found ${nextPageData.CampaignCollection.length} campaigns on page ${currentPage}`);
                  allCampaigns = [...allCampaigns, ...nextPageData.CampaignCollection];
                }
              } else {
                console.error(`Error fetching page ${currentPage}: ${nextPageResponse.status}`);
              }
            } catch (pageError) {
              console.error(`Error fetching page ${currentPage}:`, pageError);
            }
          }
          
          console.log(`Fetched a total of ${allCampaigns.length} campaigns across ${currentPage} pages`);
        }
        
        // Now perform the search on the complete dataset
        // Improved case-insensitive search with more flexible matching
        const filteredCampaigns = allCampaigns.filter((campaign) => {
          if (campaign.Campaign && campaign.Campaign.CampaignName) {
            const campaignName = campaign.Campaign.CampaignName.toLowerCase();
            
            // Direct match
            if (campaignName.includes(searchTerm)) {
              return true;
            }
            
            // Special handling for "Ready Rocker Ambassador Program"
            if (searchTerm.includes("ready") && searchTerm.includes("rocker")) {
              return (
                (campaignName.includes("ready") && campaignName.includes("rocker")) ||
                (campaignName.includes("ambassador") && 
                 (campaignName.includes("ready") || campaignName.includes("rocker") || campaignName.includes("program")))
              );
            }
            
            // Handle possible variations with fuzzy matching
            if (searchTerm.includes("ambassador") && campaignName.includes("ambassador")) {
              return true;
            }
            
            // Match by separate words in the search term
            const searchWords = searchTerm.split(/\s+/);
            if (searchWords.length > 1) {
              // If multiple search words, consider it a match if most words are found
              let matchCount = 0;
              for (const word of searchWords) {
                if (word.length > 2 && campaignName.includes(word)) { // Only count words longer than 2 chars
                  matchCount++;
                }
              }
              // Match if at least 60% of the search words are found
              return matchCount >= Math.ceil(searchWords.length * 0.6);
            }
          }
          return false;
        });
        
        console.log(`Found ${filteredCampaigns.length} campaigns matching "${searchTerm}" across all pages`);
        
        // Save the total campaign count for reference
        const totalCampaigns = allCampaigns.length;
        
        // For each campaign, get publisher counts
        for (const campaign of filteredCampaigns) {
          if (campaign.Campaign && campaign.Campaign.CampaignId) {
            try {
              const campaignId = campaign.Campaign.CampaignId;
              const publishersUrl = `${baseUrl}/campaigns/${campaignId}/publishers`;
              const publishersResponse = await fetch(publishersUrl, {
                method: 'GET',
                headers: headers
              });
              
              if (publishersResponse.ok) {
                const publishersData = await publishersResponse.json();
                campaign.Campaign.PublishersCount = publishersData.count || 0;
                console.log(`Campaign ${campaignId} has ${campaign.Campaign.PublishersCount} publishers`);
              }
            } catch (error) {
              console.error("Error getting publisher count:", error);
            }
          }
        }
        
        // Update the response with filtered results
        data.CampaignCollection = filteredCampaigns;
        data.filtered_by = searchTerm;
        data.count = filteredCampaigns.length;
        data.total = totalCampaigns;
        data.searched_all_pages = true;
        data.pages_searched = currentPage;
        data.total_pages_available = totalPages;
        
        return {
          endpoint: endpoint.route,
          name: endpoint.name,
          data: data,
          method: endpoint.method
        };
      }
      
      // For non-search requests, just add publisher counts
      if (data.CampaignCollection) {
        // Add pagination metadata for campaigns even when not searching
        data.total = data.CampaignCollection.length || 0;
        data.page = payload.page || 1;
        data.total_pages = Math.ceil(data.total / (payload.limit || 50)) || 1;
        
        // Get campaign details including publisher counts for the results on this page
        for (const campaign of data.CampaignCollection) {
          if (campaign.Campaign && campaign.Campaign.CampaignId) {
            try {
              const campaignId = campaign.Campaign.CampaignId;
              const publishersUrl = `${baseUrl}/campaigns/${campaignId}/publishers`;
              const publishersResponse = await fetch(publishersUrl, {
                method: 'GET',
                headers: headers
              });
              
              if (publishersResponse.ok) {
                const publishersData = await publishersResponse.json();
                campaign.Campaign.PublishersCount = publishersData.count || 0;
                console.log(`Campaign ${campaignId} has ${campaign.Campaign.PublishersCount} publishers`);
              }
            } catch (error) {
              console.error(`Error getting publishers for campaign ${campaign.Campaign.CampaignId}:`, error);
            }
          }
        }
      }
    }
    
    // Enhanced search handling for lists
    if (endpoint.route === "/lists") {
      // Special handling for list searches that need to check all pages
      if (payload.search) {
        const searchTerm = payload.search.toLowerCase();
        console.log(`Searching for lists by term: "${searchTerm}" across all pages`);
        
        // Store the first page results
        let allLists = [...(data.ListsCollection || [])];
        let currentPage = 1;
        const totalPages = data.total_pages || 1;
        
        // If there are more pages and we're doing a specific search, fetch all pages
        if (totalPages > 1 && searchTerm) {
          console.log(`Found ${totalPages} pages of lists, fetching all pages for complete search...`);
          
          // Fetch the remaining pages
          while (currentPage < totalPages && currentPage < 10) { // Limit to 10 pages max as safety
            currentPage++;
            const nextPagePayload = { ...payload, page: currentPage };
            const nextPageUrlParams = new URLSearchParams();
            
            Object.entries(nextPagePayload).forEach(([key, value]) => {
              if (value !== undefined) {
                nextPageUrlParams.append(key, value.toString());
              }
            });
            
            const nextPageUrl = `${url}?${nextPageUrlParams.toString()}`;
            console.log(`Fetching lists page ${currentPage}/${totalPages} from ${nextPageUrl}`);
            
            try {
              const nextPageResponse = await fetch(nextPageUrl, {
                method: 'GET',
                headers: headers
              });
              
              if (nextPageResponse.ok) {
                const nextPageData = await nextPageResponse.json();
                if (nextPageData.ListsCollection && nextPageData.ListsCollection.length > 0) {
                  console.log(`Found ${nextPageData.ListsCollection.length} lists on page ${currentPage}`);
                  allLists = [...allLists, ...nextPageData.ListsCollection];
                }
              } else {
                console.error(`Error fetching page ${currentPage}: ${nextPageResponse.status}`);
              }
            } catch (pageError) {
              console.error(`Error fetching page ${currentPage}:`, pageError);
            }
          }
          
          console.log(`Fetched a total of ${allLists.length} lists across ${currentPage} pages`);
        }
        
        // Now perform the search on the complete dataset
        const filteredLists = allLists.filter((listItem) => {
          if (listItem.List && listItem.List.Name) {
            const listName = listItem.List.Name.toLowerCase();
            
            // Direct match
            if (listName.includes(searchTerm)) {
              return true;
            }
            
            // Match by separate words in the search term
            const searchWords = searchTerm.split(/\s+/);
            if (searchWords.length > 1) {
              // If multiple search words, consider it a match if most words are found
              let matchCount = 0;
              for (const word of searchWords) {
                if (word.length > 2 && listName.includes(word)) { // Only count words longer than 2 chars
                  matchCount++;
                }
              }
              // Match if at least 60% of the search words are found
              return matchCount >= Math.ceil(searchWords.length * 0.6);
            }
          }
          return false;
        });
        
        console.log(`Found ${filteredLists.length} lists matching "${searchTerm}" across all pages`);
        
        // Save the total list count for reference
        const totalLists = allLists.length;
        
        // For each list, get publisher counts
        for (const listItem of filteredLists) {
          if (listItem.List && listItem.List.Id) {
            try {
              const listId = listItem.List.Id;
              const publishersUrl = `${baseUrl}/lists/${listId}/publishers`;
              const publishersResponse = await fetch(publishersUrl, {
                method: 'GET',
                headers: headers
              });
              
              if (publishersResponse.ok) {
                const publishersData = await publishersResponse.json();
                listItem.List.Publishers = publishersData.count || 0;
                console.log(`List ${listId} has ${listItem.List.Publishers} publishers`);
              }
            } catch (error) {
              console.error("Error getting publisher count:", error);
            }
          }
        }
        
        // Update the response with filtered results
        data.ListsCollection = filteredLists;
        data.filtered_by = searchTerm;
        data.count = filteredLists.length;
        data.total = totalLists;
        data.searched_all_pages = true;
        data.pages_searched = currentPage;
        data.total_pages_available = totalPages;
      } else {
        // For non-search requests, ensure pagination metadata is present
        if (data.ListsCollection) {
          data.total = data.total || data.ListsCollection.length || 0;
          data.page = payload.page || 1;
          data.total_pages = data.total_pages || Math.ceil(data.total / (payload.limit || 50)) || 1;
          
          // Get list details including publisher counts
          for (const listItem of data.ListsCollection) {
            if (listItem.List && listItem.List.Id) {
              try {
                const listId = listItem.List.Id;
                const publishersUrl = `${baseUrl}/lists/${listId}/publishers`;
                const publishersResponse = await fetch(publishersUrl, {
                  method: 'GET',
                  headers: headers
                });
                
                if (publishersResponse.ok) {
                  const publishersData = await publishersResponse.json();
                  listItem.List.Publishers = publishersData.count || 0;
                  console.log(`List ${listId} has ${listItem.List.Publishers} publishers`);
                }
              } catch (error) {
                console.error(`Error getting publishers for list ${listItem.List.Id}:`, error);
              }
            }
          }
        }
      }
    }
    
    return {
      endpoint: endpoint.route,
      name: endpoint.name,
      data: data,
      method: endpoint.method
    };
    
  } catch (error) {
    console.error(`Error querying Creator IQ endpoint ${endpoint.route}:`, error);
    return {
      endpoint: endpoint.route,
      name: endpoint.name,
      error: error.message || "Unknown error"
    };
  }
}

// Helper function to determine which Creator IQ endpoint(s) to query based on the query
export function determineCreatorIQEndpoints(query, previousState = null) {
  const lowerQuery = query.toLowerCase();
  const endpoints = [];
  
  // Define all available endpoints with updated terminology including write operations
  const availableEndpoints = {
    // Read operations
    publishers: {
      route: "/publishers",
      method: "GET",
      name: "List Publishers",
      keywords: ["publishers", "influencers", "list publishers", "find influencers", "influencer list", "get publishers"]
    },
    publisher_details: {
      route: "/publishers/{publisher_id}",
      method: "GET",
      name: "Get Publisher Details",
      keywords: ["publisher details", "influencer details", "creator profile", "influencer information"]
    },
    publisher_performance: {
      route: "/publishers/{publisher_id}/performance",
      method: "GET",
      name: "Get Publisher Performance",
      keywords: ["publisher performance", "influencer performance", "performance metrics", "engagement stats"]
    },
    campaigns: {
      route: "/campaigns",
      method: "GET",
      name: "List Campaigns",
      keywords: ["campaigns", "marketing campaigns", "influencer campaigns", "list campaigns", "ready rocker", "ambassador program", "get campaigns"]
    },
    campaign_details: {
      route: "/campaigns/{campaign_id}",
      method: "GET",
      name: "Get Campaign Details",
      keywords: ["campaign details", "campaign information", "campaign stats"]
    },
    content: {
      route: "/content",
      method: "GET",
      name: "List Content",
      keywords: ["content", "posts", "influencer content", "campaign content", "creator posts"]
    },
    lists: {
      route: "/lists",
      method: "GET",
      name: "Get Lists",
      keywords: ["lists", "publisher lists", "influencer lists", "get lists", "search lists", "list", "find list"]
    },
    list_details: {
      route: "/lists/{list_id}",
      method: "GET", 
      name: "Get List Details",
      keywords: ["list details", "list information", "specific list", "list data"]
    },
    list_publishers: {
      route: "/lists/{list_id}/publishers",
      method: "GET",
      name: "Get Publishers in List",
      keywords: ["list members", "publishers in list", "list publishers", "influencers in list", "count publishers", "list count"]
    },
    
    // Write operations
    create_list: {
      route: "/lists",
      method: "POST",
      name: "Create List",
      keywords: ["create list", "new list", "add list", "make list", "build list"]
    },
    update_list: {
      route: "/lists/{list_id}",
      method: "PUT",
      name: "Update List",
      keywords: ["update list", "edit list", "modify list", "change list"]
    },
    add_publisher_to_list: {
      route: "/lists/{list_id}/publishers",
      method: "POST",
      name: "Add Publisher to List",
      keywords: ["add publisher to list", "add influencer to list", "include publisher", "add to list"]
    },
    update_publisher: {
      route: "/publishers/{publisher_id}",
      method: "PUT",
      name: "Update Publisher",
      keywords: ["update publisher", "edit publisher", "modify publisher", "change publisher status"]
    },
    create_campaign: {
      route: "/campaigns",
      method: "POST",
      name: "Create Campaign",
      keywords: ["create campaign", "new campaign", "add campaign", "make campaign", "start campaign"]
    },
    update_campaign: {
      route: "/campaigns/{campaign_id}",
      method: "PUT",
      name: "Update Campaign",
      keywords: ["update campaign", "edit campaign", "modify campaign", "change campaign"]
    },
    add_publisher_to_campaign: {
      route: "/campaigns/{campaign_id}/publishers",
      method: "POST",
      name: "Add Publisher to Campaign",
      keywords: ["add publisher to campaign", "include publisher in campaign", "invite publisher"]
    },
    send_message: {
      route: "/publishers/{publisher_id}/messages",
      method: "POST",
      name: "Send Message to Publisher",
      keywords: ["send message", "message publisher", "contact publisher", "send notification", "notify publisher"]
    }
  };
  
  // Check if query is asking for creating a list
  const createListMatch = lowerQuery.match(/create\s+(?:a\s+)?list\s+(?:called|named|titled)?\s+["']([^"']+)["']/i) || 
                         lowerQuery.match(/make\s+(?:a\s+)?(?:new\s+)?list\s+(?:called|named|titled)?\s+["']([^"']+)["']/i);
  
  if (createListMatch && createListMatch[1]) {
    const listName = createListMatch[1].trim();
    console.log(`Detected CREATE LIST operation with name: "${listName}"`);
    endpoints.push({
      ...availableEndpoints.create_list,
      listName: listName
    });
    return endpoints;
  }
  
  // Check if query is asking for sending messages to publishers
  const sendMessageMatch = lowerQuery.match(/send\s+(?:a\s+)?message\s+to\s+publishers?/i) ||
                          lowerQuery.match(/message\s+publishers/i);
  
  if (sendMessageMatch) {
    console.log("Detected SEND MESSAGE operation");
    
    // If there's a specific campaign or list mentioned, we might need to get publishers first
    if (lowerQuery.includes("campaign") || lowerQuery.includes("list")) {
      // This is a complex operation that requires multiple endpoints
      // First determine if we need campaign or list data
      if (lowerQuery.includes("campaign")) {
        endpoints.push(availableEndpoints.campaigns);
        // We'll need to get publishers for a campaign and then send messages
        endpoints.push({
          ...availableEndpoints.send_message,
          requiresPublishers: true,
          sourceType: "campaign"
        });
      } else if (lowerQuery.includes("list")) {
        endpoints.push(availableEndpoints.lists);
        // We'll need to get publishers for a list and then send messages
        endpoints.push({
          ...availableEndpoints.send_message,
          requiresPublishers: true,
          sourceType: "list"
        });
      }
    } else {
      // Direct message to publishers
      endpoints.push(availableEndpoints.publishers);
      endpoints.push(availableEndpoints.send_message);
    }
    
    return endpoints;
  }
  
  // Check if query is about adding a publisher to a list or campaign
  const addPublisherMatch = lowerQuery.match(/add\s+publisher(?:s)?\s+to\s+(campaign|list)/i) ||
                           lowerQuery.match(/invite\s+publisher(?:s)?\s+to\s+(campaign|list)/i);
  
  if (addPublisherMatch) {
    const targetType = addPublisherMatch[1].toLowerCase();
    console.log(`Detected ADD PUBLISHER TO ${targetType.toUpperCase()} operation`);
    
    if (targetType === "campaign") {
      endpoints.push(availableEndpoints.campaigns);
      endpoints.push(availableEndpoints.publishers);
      endpoints.push(availableEndpoints.add_publisher_to_campaign);
    } else if (targetType === "list") {
      endpoints.push(availableEndpoints.lists);
      endpoints.push(availableEndpoints.publishers);
      endpoints.push(availableEndpoints.add_publisher_to_list);
    }
    
    return endpoints;
  }
  
  // Check if query is about updating publisher status
  const updatePublisherMatch = lowerQuery.match(/update\s+publisher(?:s)?\s+status/i) ||
                              lowerQuery.match(/change\s+publisher(?:s)?\s+status/i) ||
                              lowerQuery.match(/set\s+publisher(?:s)?\s+status/i);
  
  if (updatePublisherMatch) {
    console.log("Detected UPDATE PUBLISHER operation");
    endpoints.push(availableEndpoints.publishers);
    endpoints.push(availableEndpoints.update_publisher);
    return endpoints;
  }
  
  // Check if query is about showing ALL campaigns
  const showAllCampaigns = lowerQuery.match(/show\s+all(?:\s+\d+)?\s+campaigns/) || 
                          lowerQuery.match(/all\s+\d+\s+campaigns/) ||
                          lowerQuery.match(/display\s+all\s+campaigns/);
  
  if (showAllCampaigns) {
    console.log("Query is about showing ALL campaigns");
    endpoints.push({
      ...availableEndpoints.campaigns,
      getAllPages: true
    });
    return endpoints;
  }
  
  // Check if query is about showing ALL lists
  const showAllLists = lowerQuery.match(/show\s+all(?:\s+\d+)?\s+lists/) || 
                      lowerQuery.match(/all\s+\d+\s+lists/) ||
                      lowerQuery.match(/display\s+all\s+lists/);
  
  if (showAllLists) {
    console.log("Query is about showing ALL lists");
    endpoints.push({
      ...availableEndpoints.lists,
      getAllPages: true
    });
    return endpoints;
  }
  
  // Check if query is asking for a specific list by name
  const listNameMatch = lowerQuery.match(/list\s+([a-z0-9\s]+)/i) || 
                       lowerQuery.match(/([a-z0-9\s]+)\s+list/i);
  
  let listName = null;
  if (listNameMatch && listNameMatch[1]) {
    listName = listNameMatch[1].trim();
    console.log(`Detected possible list name: "${listName}"`);
  }
  
  // Check for campaign name in the query with improved detection
  const campaignNameMatch = lowerQuery.match(/campaign(?:\s+called|\s+named|\s+titled)?\s+["']([^"']+)["']/i) || 
                           lowerQuery.match(/["']([^"']+)["'](?:\s+campaign)/i) ||
                           lowerQuery.match(/find\s+(?:a\s+)?campaign\s+(?:with|named|called|titled|containing)\s+([a-z0-9\s]+)/i);
  
  // Special handling for Ready Rocker campaign search
  const readyRockerSearch = lowerQuery.includes("ready rocker") || 
                          (lowerQuery.includes("ready") && lowerQuery.includes("rocker")) ||
                          (lowerQuery.includes("ambassador") && lowerQuery.includes("program"));
  
  if (readyRockerSearch || (campaignNameMatch && campaignNameMatch[1])) {
    console.log("Query is specifically about finding a campaign by name");
    endpoints.push({
      ...availableEndpoints.campaigns,
      fullSearch: true
    });
    return endpoints;
  }
  
  // Check which endpoints match the query
  let matchedEndpoints = false;
  for (const [key, endpoint] of Object.entries(availableEndpoints)) {
    const isRelevant = endpoint.keywords.some(keyword => lowerQuery.includes(keyword.toLowerCase()));
    if (isRelevant) {
      endpoints.push(endpoint);
      matchedEndpoints = true;
      console.log(`Matched endpoint: ${key} based on keywords`);
    }
  }
  
  // Special handling for "Ready Rocker" queries
  if (lowerQuery.includes("ready rocker") || lowerQuery.includes("ambassador program")) {
    console.log("Adding campaigns endpoint for Ready Rocker search");
    const campaignsEndpoint = availableEndpoints.campaigns;
    if (!endpoints.some(e => e.route === campaignsEndpoint.route)) {
      endpoints.push({
        ...campaignsEndpoint,
        fullSearch: true
      });
      matchedEndpoints = true;
    }
  }
  
  // Special handling for list-related queries
  if ((lowerQuery.includes("list") && !matchedEndpoints) || listName) {
    // If there's a specific list name mentioned, prioritize list_details and list_publishers
    if (listName) {
      console.log(`Adding list endpoints for list name: "${listName}"`);
      endpoints.push({
        ...availableEndpoints.lists,
        fullSearch: true
      });
      
      // If query is about counting or finding publishers in a list, add list_publishers endpoint
      if (lowerQuery.includes("count") || 
          lowerQuery.includes("publishers") || 
          lowerQuery.includes("influencers")) {
        endpoints.push(availableEndpoints.list_publishers);
      }
    } else {
      // Generic list query without specific list name
      endpoints.push(availableEndpoints.lists);
    }
  }
  
  // If no specific endpoints matched, return a default set
  if (endpoints.length === 0) {
    // Default to lists endpoint for this request as it's likely list related
    if (lowerQuery.includes("list")) {
      console.log("No specific endpoints matched, defaulting to lists endpoint");
      endpoints.push(availableEndpoints.lists);
    } else {
      // Fall back to publishers and campaigns as most common use cases
      console.log("No specific endpoints matched, defaulting to publishers and campaigns");
      endpoints.push(availableEndpoints.publishers);
      endpoints.push(availableEndpoints.campaigns);
    }
  }
  
  console.log(`Selected ${endpoints.length} endpoints for the query`);
  return endpoints;
}

// Helper function to build the payload for Creator IQ API calls
export function buildCreatorIQPayload(endpoint, query, creator_iq_params = {}, previousState = null) {
  const lowerQuery = query.toLowerCase();
  
  // Start with basic parameters
  const payload = {
    limit: 50 // Increase default limit to get more results
  };
  
  // Handle write operations with special payload building
  if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
    // Build payload based on the specific operation type
    switch (endpoint.name) {
      case "Create List":
        console.log("Building payload for CREATE LIST operation");
        // List creation requires at least a name
        payload.Name = endpoint.listName || "New List";
        payload.Description = extractDescription(query) || `List created on ${new Date().toLocaleDateString()}`;
        return payload;
        
      case "Update List":
        console.log("Building payload for UPDATE LIST operation");
        // For list updates, we need the list ID in the route
        if (creator_iq_params.list_id) {
          const updates = {};
          
          if (lowerQuery.includes("description")) {
            updates.Description = extractDescription(query);
          }
          if (lowerQuery.includes("name")) {
            const nameMatch = query.match(/name\s+(?:to\s+)?["']([^"']+)["']/i);
            if (nameMatch && nameMatch[1]) {
              updates.Name = nameMatch[1].trim();
            }
          }
          
          return updates;
        }
        break;
        
      case "Add Publisher to List":
        console.log("Building payload for ADD PUBLISHER TO LIST operation");
        // We need publisher IDs and list ID
        if (creator_iq_params.list_id && creator_iq_params.publisher_ids) {
          return {
            PublisherIds: Array.isArray(creator_iq_params.publisher_ids) ? 
              creator_iq_params.publisher_ids : [creator_iq_params.publisher_ids]
          };
        }
        break;
        
      case "Update Publisher":
        console.log("Building payload for UPDATE PUBLISHER operation");
        // Extract status from query
        const statusMatch = lowerQuery.match(/status\s+(?:to\s+)?["']?([a-zA-Z]+)["']?/i);
        if (statusMatch && statusMatch[1]) {
          const status = statusMatch[1].trim();
          // Validate status is a valid value
          const validStatuses = ["active", "inactive", "pending", "invited"];
          if (validStatuses.includes(status.toLowerCase())) {
            return {
              Status: status.toLowerCase()
            };
          }
        }
        break;
        
      case "Send Message to Publisher":
        console.log("Building payload for SEND MESSAGE TO PUBLISHER operation");
        // Extract message content
        const messageMatch = query.match(/message\s+(?:saying\s+|content\s+)?["']([^"']+)["']/i);
        if (messageMatch && messageMatch[1]) {
          const messageContent = messageMatch[1].trim();
          return {
            Content: messageContent,
            Subject: extractSubject(query) || "New Message from Creator IQ"
          };
        } else {
          // Try to extract message another way
          const lines = query.split('\n');
          for (const line of lines) {
            if (line.toLowerCase().includes('message:')) {
              const content = line.substring(line.indexOf(':') + 1).trim();
              if (content) {
                return {
                  Content: content,
                  Subject: extractSubject(query) || "New Message from Creator IQ"
                };
              }
            }
          }
        }
        
        // Default message if we couldn't extract one
        return {
          Content: "This is an automated message from the Creator IQ system.",
          Subject: "New Message from Creator IQ"
        };
        
      case "Create Campaign":
