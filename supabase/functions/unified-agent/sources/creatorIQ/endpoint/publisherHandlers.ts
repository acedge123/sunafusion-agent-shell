
// Handlers for publisher-related endpoints
import { CreatorIQEndpoint, PreviousState } from './types.ts';
import { extractPublisherIdFromQuery } from './utils.ts';

/**
 * Handle publisher status update endpoints
 */
export function handlePublisherStatusUpdateEndpoints(query: string): CreatorIQEndpoint[] {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('update') && 
      lowerQuery.includes('status') && 
      (lowerQuery.includes('publisher') || lowerQuery.includes('influencer'))) {
    console.log("Detected publisher status update request");
    return [{
      route: "/publishers/{publisher_id}",
      method: "PUT",
      name: "Update Publisher Status"
    }];
  }
  
  return [];
}

/**
 * Handle publisher message endpoints
 */
export function handlePublisherMessageEndpoints(query: string): CreatorIQEndpoint[] {
  const lowerQuery = query.toLowerCase();
  
  if ((lowerQuery.includes('send') && lowerQuery.includes('message')) ||
      (lowerQuery.includes('message') && 
      (lowerQuery.includes('publisher') || lowerQuery.includes('influencer')))) {
    console.log("Detected message sending request");
    
    const publisherId = extractPublisherIdFromQuery(query);
    
    if (publisherId) {
      console.log(`Using explicit publisher ID from query: ${publisherId}`);
      
      // Use the exact publisher ID in the endpoint
      return [{
        route: `/publishers/${publisherId}/messages`,
        method: "POST",
        name: "Send Message to Publisher",
        publisherId: publisherId
      }];
    } 
    // If we don't have an ID in the query, we need a placeholder endpoint
    else {
      console.log("No publisher ID found in the query, will need to determine it later");
      return [{
        route: "/publishers/{publisher_id}/messages",
        method: "POST",
        name: "Send Message to Publisher"
      }];
    }
  }
  
  return [];
}

/**
 * Handle generic publisher endpoints
 */
export function handleGenericPublisherEndpoints(query: string): CreatorIQEndpoint[] {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('publisher') || lowerQuery.includes('influencer')) {
    console.log("Adding generic publisher endpoint");
    return [{
      route: "/publishers",
      method: "GET",
      name: "List Publishers"
    }];
  }
  
  return [];
}
