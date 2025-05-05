
// Specialized handlers for publisher-related payloads
import { extractStatusFromQuery, extractMessageFromQuery } from '../textExtractors.ts';
import { extractPublisherId } from './utils.ts';
import { BuildPayloadOptions, CreatorIQEndpoint } from './types.ts';

/**
 * Build payload for publisher status update endpoint
 */
export function buildPublisherStatusPayload({ query, params, previousState = null }: BuildPayloadOptions, endpoint: CreatorIQEndpoint): any {
  console.log("Building payload for publisher status update");
  const statusValue = params.status_value || extractStatusFromQuery(query);
  
  // Update publisher ID in the endpoint if needed
  const publisherId = extractPublisherId(params, endpoint, previousState);
  
  // If we have a publisher_id, replace the placeholder in the route
  if (publisherId && endpoint.route.includes("{publisher_id}")) {
    endpoint.route = endpoint.route.replace("{publisher_id}", publisherId);
    console.log(`Updated endpoint with publisher ID: ${endpoint.route}`);
  }
  
  return {
    Status: statusValue || "active"
  };
}

/**
 * Build payload for publisher message endpoint
 */
export function buildPublisherMessagePayload({ query, params, previousState = null }: BuildPayloadOptions, endpoint: CreatorIQEndpoint): any {
  console.log("Building payload for message sending");
  
  // Extract message from query or params
  const messageContent = params.message_content || extractMessageFromQuery(query) || "Hello from Creator IQ!";
  const messageSubject = params.message_subject || "Message from Creator IQ";
  
  // Update publisher ID in the endpoint if needed
  const publisherId = extractPublisherId(params, endpoint, previousState);
  
  // If we have a publisher ID, update the endpoint route
  if (publisherId && endpoint.route.includes("{publisher_id}")) {
    endpoint.route = endpoint.route.replace("{publisher_id}", publisherId);
    endpoint.publisherId = publisherId;
    console.log(`Updated endpoint with publisher ID: ${endpoint.route}`);
  }
  
  return {
    Subject: messageSubject,
    Content: messageContent
  };
}

/**
 * Build payload for general publisher query endpoint
 */
export function buildPublisherQueryPayload({ params }: BuildPayloadOptions): any {
  const searchParams: any = { limit: 50 };
  
  if (params.publisher_search_term) {
    searchParams.search = params.publisher_search_term;
  }
  
  return searchParams;
}
