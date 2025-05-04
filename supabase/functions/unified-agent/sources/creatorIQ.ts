
// Creator IQ API integration

// Updated function to query Creator IQ endpoints
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
    if (endpoint.route === "/campaigns" && payload.search && data.CampaignCollection) {
      const searchTerm = payload.search.toLowerCase();
      console.log(`Filtering campaigns by search term: ${searchTerm}`);
      
      // Improved case-insensitive search with more flexible matching
      const filteredCampaigns = data.CampaignCollection.filter((campaign) => {
        if (campaign.Campaign && campaign.Campaign.CampaignName) {
          const campaignName = campaign.Campaign.CampaignName.toLowerCase();
          // Match partial words and handle possible variations
          return campaignName.includes(searchTerm) || 
                 campaignName.includes("ready") && campaignName.includes("rocker") ||
                 campaignName.includes("ambassador") && (campaignName.includes("ready") || campaignName.includes("rocker"));
        }
        return false;
      });
      
      console.log(`Found ${filteredCampaigns.length} campaigns matching "${searchTerm}" using enhanced search`);
      
      // Add pagination metadata for campaigns
      data.CampaignCollection = filteredCampaigns;
      data.filtered_by = payload.search;
      data.count = filteredCampaigns.length;
      data.total = data.CampaignCollection.length || 0;
      data.page = payload.page || 1;
      data.total_pages = Math.ceil(data.total / (payload.limit || 50)) || 1;
      
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
    } else if (endpoint.route === "/campaigns" && data.CampaignCollection) {
      // Add pagination metadata for campaigns even when not searching
      data.total = data.CampaignCollection.length || 0;
      data.page = payload.page || 1;
      data.total_pages = Math.ceil(data.total / (payload.limit || 50)) || 1;
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
    // New List endpoints with keywords
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
  
  // Check if query is asking for a specific list by name
  const listNameMatch = lowerQuery.match(/list\s+([a-z0-9\s]+)/i) || 
                       lowerQuery.match(/([a-z0-9\s]+)\s+list/i);
  
  let listName = null;
  if (listNameMatch && listNameMatch[1]) {
    listName = listNameMatch[1].trim();
    console.log(`Detected possible list name: "${listName}"`);
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
      endpoints.push(campaignsEndpoint);
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
  
  // Check for campaign name in the query
  const campaignNameMatch = lowerQuery.match(/campaign(?:\s+called|\s+named|\s+titled)?\s+["']([^"']+)["']/i) || 
                           lowerQuery.match(/["']([^"']+)["'](?:\s+campaign)/i);
  
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
  
  return payload;
}
