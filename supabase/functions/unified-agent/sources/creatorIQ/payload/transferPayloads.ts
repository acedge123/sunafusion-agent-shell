
// Specialized handlers for publisher transfer payloads
import { getSourcePublishers } from './utils.ts';
import { BuildPayloadOptions, CreatorIQEndpoint } from './types.ts';

/**
 * Build payload for adding publishers to a list
 */
export function buildAddPublishersToListPayload({ params, previousState = null }: BuildPayloadOptions, endpoint: CreatorIQEndpoint): any {
  console.log("Building payload for adding publishers to list");
  
  // If we have specific publisher IDs to add
  if (params.publisher_ids && Array.isArray(params.publisher_ids) && params.publisher_ids.length > 0) {
    console.log(`Using ${params.publisher_ids.length} publisher IDs from params`);
    return {
      PublisherIds: params.publisher_ids
    };
  }
  
  // If we have source publishers in previous state
  const publisherIds = getSourcePublishers(endpoint, previousState);
  if (publisherIds.length > 0) {
    return {
      PublisherIds: publisherIds
    };
  }
  
  // Default empty array if no publishers identified
  return {
    PublisherIds: []
  };
}

/**
 * Build payload for adding publishers to a campaign
 */
export function buildAddPublishersToCampaignPayload({ params, previousState = null }: BuildPayloadOptions, endpoint: CreatorIQEndpoint): any {
  console.log("Building payload for adding publishers to campaign");
  
  // If we have specific publisher IDs to add
  if (params.publisher_ids && Array.isArray(params.publisher_ids) && params.publisher_ids.length > 0) {
    console.log(`Using ${params.publisher_ids.length} publisher IDs from params`);
    return {
      PublisherIds: params.publisher_ids
    };
  }
  
  // If we have source publishers in previous state
  const publisherIds = getSourcePublishers(endpoint, previousState);
  if (publisherIds.length > 0) {
    return {
      PublisherIds: publisherIds
    };
  }

  // If no specific publishers found but we have previous state with publishers
  if (previousState && previousState.publishers && previousState.publishers.length > 0) {
    // As a fallback, use all publishers from previous state
    const allPublisherIds = previousState.publishers.map((p: any) => p.id);
    console.log(`Using ${allPublisherIds.length} publisher IDs from previous state as fallback`);
    return {
      PublisherIds: allPublisherIds
    };
  }
  
  // Default empty array if no publishers identified
  return {
    PublisherIds: []
  };
}
