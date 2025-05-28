
// Specialized handlers for publisher transfer payloads
import { getSourcePublishers } from './utils.ts';
import { BuildPayloadOptions, CreatorIQEndpoint } from './types.ts';

/**
 * Build payload for adding publishers to a list
 */
export function buildAddPublishersToListPayload({ params, previousState = null }: BuildPayloadOptions, endpoint: CreatorIQEndpoint): any {
  console.log("Building payload for adding publishers to list");
  
  // If we have a specific publisher ID from the endpoint
  if (endpoint.publisherId) {
    console.log(`Using specific publisher ID from endpoint: ${endpoint.publisherId}`);
    return {
      PublisherId: [parseInt(endpoint.publisherId)]
    };
  }
  
  // If we have specific publisher IDs to add
  if (params.publisher_ids && Array.isArray(params.publisher_ids) && params.publisher_ids.length > 0) {
    console.log(`Using ${params.publisher_ids.length} publisher IDs from params`);
    return {
      PublisherId: params.publisher_ids.map((id: any) => parseInt(id))
    };
  }
  
  // If we have source publishers in previous state
  const publisherIds = getSourcePublishers(endpoint, previousState);
  if (publisherIds.length > 0) {
    return {
      PublisherId: publisherIds.map((id: any) => parseInt(id))
    };
  }
  
  // Default empty array if no publishers identified
  return {
    PublisherId: []
  };
}

/**
 * Build payload for adding publishers to a campaign
 */
export function buildAddPublishersToCampaignPayload({ params, previousState = null }: BuildPayloadOptions, endpoint: CreatorIQEndpoint): any {
  console.log("Building payload for adding publishers to campaign");
  
  // If we have a specific publisher ID from the endpoint
  if (endpoint.publisherId) {
    console.log(`Using specific publisher ID from endpoint: ${endpoint.publisherId}`);
    return {
      publisherId: parseInt(endpoint.publisherId),
      status: "Invited"
    };
  }
  
  // If we have specific publisher IDs to add
  if (params.publisher_ids && Array.isArray(params.publisher_ids) && params.publisher_ids.length > 0) {
    console.log(`Using ${params.publisher_ids.length} publisher IDs from params`);
    // For campaigns, we need to add publishers one by one
    return {
      publisherId: parseInt(params.publisher_ids[0]),
      status: "Invited"
    };
  }
  
  // If we have source publishers in previous state
  const publisherIds = getSourcePublishers(endpoint, previousState);
  if (publisherIds.length > 0) {
    return {
      publisherId: parseInt(publisherIds[0]),
      status: "Invited"
    };
  }

  // If no specific publishers found but we have previous state with publishers
  if (previousState && previousState.publishers && previousState.publishers.length > 0) {
    // As a fallback, use the first publisher from previous state
    const publisherId = previousState.publishers[0].id;
    console.log(`Using publisher ID from previous state as fallback: ${publisherId}`);
    return {
      publisherId: parseInt(publisherId),
      status: "Invited"
    };
  }
  
  // Default payload if no publishers identified
  return {
    publisherId: null,
    status: "Invited"
  };
}
