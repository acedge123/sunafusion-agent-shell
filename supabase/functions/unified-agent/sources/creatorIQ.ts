
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
    
    console.log(`Querying Creator IQ endpoint: ${endpoint.route} with payload:`, payload);

    // Improved request handling
    let response;
    if (endpoint.method === 'POST') {
      console.log(`Making POST request to ${url}`);
      response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });
    } else {
      // For GET requests, properly build URL with query parameters
      const urlParams = new URLSearchParams();
      if (payload) {
        Object.entries(payload).forEach(([key, value]) => {
          if (!endpoint.route.includes(`{${key}}`) && value !== undefined) {
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
          data: data
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
    
    return {
      endpoint: endpoint.route,
      name: endpoint.name,
      data: data
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
  
  // Define all available endpoints with updated terminology
  const availableEndpoints = {
    publishers: {
      route: "/publishers",
      method: "GET",
      name: "List Publishers",
      keywords: ["publishers", "influencers", "list publishers", "find influencers", "influencer list"]
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
      keywords: ["campaigns", "marketing campaigns", "influencer campaigns", "list campaigns", "ready rocker", "ambassador program"]
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
    // Lists endpoints with keywords
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
    }
  };
  
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
      endpoints.push(availableEndpoints.lists);
      
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
  
  // Check if query is about showing ALL campaigns
  const showAllCampaigns = lowerQuery.match(/show\s+all(?:\s+\d+)?\s+campaigns/) || 
                          lowerQuery.match(/all\s+\d+\s+campaigns/) ||
                          lowerQuery.match(/display\s+all\s+campaigns/);
  
  if (showAllCampaigns && endpoint.route === "/campaigns") {
    console.log("Setting up payload for fetching all campaigns");
    payload.limit = 100; // Try to get more per page when explicitly requested
  }
  
  // Apply any params passed explicitly from the frontend
  if (creator_iq_params) {
    // If we have a specific campaign ID, use it for relevant endpoints
    if (creator_iq_params.campaign_id && endpoint.route.includes('/campaigns/')) {
      // The campaign ID is already in the route, nothing to add to payload
      console.log(`Using campaign ID from params: ${creator_iq_params.campaign_id}`);
    }
    
    // If we have a campaign search term from frontend
    if (creator_iq_params.campaign_search_term) {
      payload.search = creator_iq_params.campaign_search_term;
      console.log(`Using campaign search term from params: "${payload.search}"`);
    }
    
    // Copy other relevant params
    if (creator_iq_params.limit) payload.limit = creator_iq_params.limit;
    if (creator_iq_params.offset) payload.offset = creator_iq_params.offset;
    if (creator_iq_params.page) payload.page = creator_iq_params.page;
    if (creator_iq_params.status) payload.status = creator_iq_params.status;
  }
  
  // Use previous state if available and relevant
  if (previousState) {
    // If query is about publishers in a campaign and we have campaign data
    if (endpoint.route.includes('/publishers') && 
        endpoint.campaignContext && 
        endpoint.campaignContext.id) {
      
      console.log(`Using campaign context: ${endpoint.campaignContext.name} (${endpoint.campaignContext.id})`);
      // The campaign ID is already in the route
    }
  }
  
  // Check for list name in the query
  const listNameMatch = lowerQuery.match(/list\s+([a-z0-9\s]+)/i) || 
                        lowerQuery.match(/([a-z0-9\s]+)\s+list/i);
  
  if (listNameMatch && listNameMatch[1] && !payload.search) {
    const listName = listNameMatch[1].trim();
    console.log(`Adding search parameter for list name: "${listName}"`);
    payload.search = listName;
  }
  
  // Check for campaign name in the query with improved detection
  const campaignNameMatch = lowerQuery.match(/campaign(?:\s+called|\s+named|\s+titled)?\s+["']([^"']+)["']/i) || 
                           lowerQuery.match(/["']([^"']+)["'](?:\s+campaign)/i) ||
                           lowerQuery.match(/find\s+(?:a\s+)?campaign\s+(?:with|named|called|titled|containing)\s+([a-z0-9\s]+)/i);
  
  if (campaignNameMatch && campaignNameMatch[1] && !payload.search) {
    const campaignName = campaignNameMatch[1].trim();
    console.log(`Adding search parameter for campaign name: "${campaignName}"`);
    payload.search = campaignName;
  }
  
  // Check specifically for Ready Rocker Ambassador Program with improved detection
  if ((lowerQuery.includes("ready rocker") || 
      (lowerQuery.includes("ready") && lowerQuery.includes("rocker")) || 
      (lowerQuery.includes("ambassador") && lowerQuery.includes("program"))) && 
      !payload.search) {
    console.log("Adding search parameter for Ready Rocker Ambassador Program");
    payload.search = "Ready Rocker";
  }
  
  // If endpoint is campaigns and we still don't have a search term, check for any campaign-related terms
  if (endpoint.route === "/campaigns" && !payload.search) {
    const campaignTerms = ["ambassador", "program", "marketing"];
    for (const term of campaignTerms) {
      if (lowerQuery.includes(term)) {
        console.log(`Adding search parameter for campaign term: "${term}"`);
        payload.search = term;
        break;
      }
    }
  }
  
  // Special handling for full search across all pages
  if (endpoint.fullSearch && endpoint.route === "/campaigns") {
    console.log("Enabling full search across all pages");
    // Set flag for the caller to know this needs special handling
    payload._fullSearch = true;
  }
  
  // Handle context for showing all campaigns
  if (endpoint.getAllPages && endpoint.route === "/campaigns") {
    console.log("Setting up for retrieving all campaigns");
    payload._getAllPages = true;
  }
  
  return payload;
}

