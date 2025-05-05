// Builds payloads for Creator IQ API requests
import { extractListNameFromQuery, extractStatusFromQuery, extractMessageFromQuery } from './textExtractors.ts';

/**
 * Build payload for Creator IQ API requests
 */
export function buildCreatorIQPayload(endpoint: any, query: string, params: any = {}, previousState: any = null) {
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
        endpoint.sourceListId && previousState.publishers.some((p: any) => p.listId === endpoint.sourceListId)) {
      
      const sourceListPublishers = previousState.publishers.filter((p: any) => p.listId === endpoint.sourceListId);
      const publisherIds = sourceListPublishers.map((p: any) => p.id);
      
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
      let publisherIds: string[] = [];
      
      // Check for source list publishers
      if (endpoint.sourceType === 'list' && endpoint.sourceId) {
        const sourceListPublishers = previousState.publishers.filter((p: any) => p.listId === endpoint.sourceId);
        if (sourceListPublishers.length > 0) {
          publisherIds = sourceListPublishers.map((p: any) => p.id);
          console.log(`Using ${publisherIds.length} publisher IDs from source list ${endpoint.sourceId}`);
        }
      }
      
      // Check for source campaign publishers
      else if (endpoint.sourceType === 'campaign' && endpoint.sourceId) {
        const sourceCampaignPublishers = previousState.publishers.filter((p: any) => p.campaignId === endpoint.sourceId);
        if (sourceCampaignPublishers.length > 0) {
          publisherIds = sourceCampaignPublishers.map((p: any) => p.id);
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
      publisherIds = previousState.publishers.map((p: any) => p.id);
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
