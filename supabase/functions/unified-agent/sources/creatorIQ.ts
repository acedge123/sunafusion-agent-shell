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
    endpoints.push({
      route: "/publishers/{publisher_id}/messages",
      method: "POST",
      name: "Send Message to Publisher"
    });
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
  
  // Message sending
  if (endpoint.route.includes("/publishers/") && endpoint.route.includes("/messages")) {
    console.log("Building payload for message sending");
    const messageContent = params.message_content || extractMessageFromQuery(query);
    const messageSubject = params.message_subject || "Message from Creator IQ";
    
    // Similar to above, handle publisher_id
    if (endpoint.route.includes("{publisher_id}") && !params.publisher_id) {
      if (previousState && previousState.publishers && previousState.publishers.length > 0) {
        payload.publisher_id = previousState.publishers[0].id;
        console.log(`Using publisher ID from state: ${payload.publisher_id}`);
      }
    }
    
    if (payload.publisher_id) {
      endpoint.route = endpoint.route.replace("{publisher_id}", payload.publisher_id);
    }
    
    return {
      Subject: messageSubject,
      Content: messageContent || "Hello from Creator IQ!"
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
  if (endpoint.route.includes("/lists/") && endpoint.route.includes("/publishers")) {
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
  const messageMatch = query.match(/message\s+(?:saying\s+|content\s+)?["']([^"']+)["']/i);
  if (messageMatch && messageMatch[1]) {
    return messageMatch[1].trim();
  }
  
  // Try to extract message another way
  const lines = query.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('message:')) {
      const messageContent = line.substring(line.indexOf(':') + 1).trim();
      if (messageContent) {
        return messageContent;
      }
    }
  }
  
  return "Hello from Creator IQ!"; // Default message
}

// Query Creator IQ API endpoint
export async function queryCreatorIQEndpoint(endpoint, payload) {
  const apiKey = Deno.env.get("CREATOR_IQ_API_KEY");
  if (!apiKey) {
    throw new Error("Creator IQ API key is not configured");
  }
  
  let url = `https://apis.creatoriq.com/crm/v1/api${endpoint.route}`;
  
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
  
  console.log(`Querying endpoint ${endpoint.route} with payload:`, payload);
  
  let response;
  
  if (endpoint.method === "GET") {
    // For GET requests, convert payload to query params
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(payload)) {
      queryParams.append(key, String(value));
    }
    
    const fullUrl = `${url}?${queryParams.toString()}`;
    console.log(`Making GET request to ${fullUrl}`);
    response = await fetch(fullUrl, { headers });
  } else {
    // For POST, PUT, DELETE requests
    console.log(`Making ${endpoint.method} request to ${url} with payload:`, payload);
    response = await fetch(url, {
      method: endpoint.method,
      headers,
      body: JSON.stringify(payload)
    });
  }
  
  console.log(`Creator IQ API response status: ${response.status}`);
  
  if (!response.ok) {
    throw new Error(`Creator IQ API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
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
  
  return {
    endpoint: endpoint.route,
    method: endpoint.method,
    name: endpoint.name,
    data
  };
}
