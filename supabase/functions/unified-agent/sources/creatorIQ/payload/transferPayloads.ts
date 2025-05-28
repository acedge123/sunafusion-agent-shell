
// Specialized handlers for publisher transfer payloads
import { getSourcePublishers } from './utils.ts';
import { BuildPayloadOptions, CreatorIQEndpoint } from './types.ts';

/**
 * Validate publisher ID
 */
function validatePublisherId(id: any): boolean {
  if (id === null || id === undefined) return false;
  const num = parseInt(id);
  return Number.isInteger(num) && num > 0;
}

/**
 * Build payload for adding publishers to a list
 */
export function buildAddPublishersToListPayload({ params, previousState = null }: BuildPayloadOptions, endpoint: CreatorIQEndpoint): any {
  console.log("=== BUILDING ADD PUBLISHERS TO LIST PAYLOAD ===");
  console.log("Endpoint details:", JSON.stringify(endpoint, null, 2));
  console.log("Params:", JSON.stringify(params, null, 2));
  console.log("Previous state available:", !!previousState);
  
  let publisherIds: number[] = [];
  
  // Priority 1: If we have a specific publisher ID from the endpoint
  if (endpoint.publisherId) {
    console.log(`Using specific publisher ID from endpoint: ${endpoint.publisherId}`);
    if (validatePublisherId(endpoint.publisherId)) {
      publisherIds = [parseInt(endpoint.publisherId)];
    } else {
      console.error(`Invalid publisher ID from endpoint: ${endpoint.publisherId}`);
    }
  }
  
  // Priority 2: If we have specific publisher IDs in params
  else if (params.publisher_ids && Array.isArray(params.publisher_ids) && params.publisher_ids.length > 0) {
    console.log(`Using ${params.publisher_ids.length} publisher IDs from params`);
    publisherIds = params.publisher_ids
      .filter(id => validatePublisherId(id))
      .map(id => parseInt(id));
    
    if (publisherIds.length !== params.publisher_ids.length) {
      console.warn(`Filtered out invalid publisher IDs. Original: ${params.publisher_ids.length}, Valid: ${publisherIds.length}`);
    }
  }
  
  // Priority 3: If we have a single publisher_id in params
  else if (params.publisher_id && validatePublisherId(params.publisher_id)) {
    console.log(`Using single publisher ID from params: ${params.publisher_id}`);
    publisherIds = [parseInt(params.publisher_id)];
  }
  
  // Priority 4: If we have source publishers in previous state
  else {
    const sourcePublisherIds = getSourcePublishers(endpoint, previousState);
    if (sourcePublisherIds.length > 0) {
      console.log(`Using ${sourcePublisherIds.length} publisher IDs from previous state`);
      publisherIds = sourcePublisherIds
        .filter(id => validatePublisherId(id))
        .map(id => parseInt(id));
    }
  }
  
  const payload = {
    PublisherId: publisherIds
  };
  
  console.log("=== ADD PUBLISHERS TO LIST PAYLOAD BUILT ===");
  console.log(`Publisher IDs count: ${publisherIds.length}`);
  console.log(`Publisher IDs:`, publisherIds);
  console.log("Final payload:", JSON.stringify(payload, null, 2));
  
  // Validation
  if (publisherIds.length === 0) {
    console.warn("WARNING: No valid publisher IDs found for adding to list");
  }
  
  return payload;
}

/**
 * Build payload for adding publishers to a campaign
 */
export function buildAddPublishersToCampaignPayload({ params, previousState = null }: BuildPayloadOptions, endpoint: CreatorIQEndpoint): any {
  console.log("=== BUILDING ADD PUBLISHERS TO CAMPAIGN PAYLOAD ===");
  console.log("Endpoint details:", JSON.stringify(endpoint, null, 2));
  console.log("Params:", JSON.stringify(params, null, 2));
  console.log("Previous state available:", !!previousState);
  
  let publisherId: number | null = null;
  let status = "Invited"; // Default status
  
  // Priority 1: If we have a specific publisher ID from the endpoint
  if (endpoint.publisherId) {
    console.log(`Using specific publisher ID from endpoint: ${endpoint.publisherId}`);
    if (validatePublisherId(endpoint.publisherId)) {
      publisherId = parseInt(endpoint.publisherId);
    } else {
      console.error(`Invalid publisher ID from endpoint: ${endpoint.publisherId}`);
    }
  }
  
  // Priority 2: If we have specific publisher IDs in params (use first one)
  else if (params.publisher_ids && Array.isArray(params.publisher_ids) && params.publisher_ids.length > 0) {
    console.log(`Using first of ${params.publisher_ids.length} publisher IDs from params`);
    const validIds = params.publisher_ids.filter(id => validatePublisherId(id));
    if (validIds.length > 0) {
      publisherId = parseInt(validIds[0]);
      if (validIds.length > 1) {
        console.warn(`Campaign assignment can only handle one publisher at a time. Using first valid ID: ${publisherId}`);
      }
    }
  }
  
  // Priority 3: If we have a single publisher_id in params
  else if (params.publisher_id && validatePublisherId(params.publisher_id)) {
    console.log(`Using single publisher ID from params: ${params.publisher_id}`);
    publisherId = parseInt(params.publisher_id);
  }
  
  // Priority 4: If we have source publishers in previous state (use first one)
  else {
    const sourcePublisherIds = getSourcePublishers(endpoint, previousState);
    if (sourcePublisherIds.length > 0) {
      console.log(`Using first of ${sourcePublisherIds.length} publisher IDs from previous state`);
      const validIds = sourcePublisherIds.filter(id => validatePublisherId(id));
      if (validIds.length > 0) {
        publisherId = parseInt(validIds[0]);
      }
    }
  }
  
  // Check for custom status in params
  if (params.status && typeof params.status === 'string') {
    status = params.status;
    console.log(`Using custom status from params: ${status}`);
  }
  
  const payload = {
    publisherId: publisherId,
    status: status
  };
  
  console.log("=== ADD PUBLISHERS TO CAMPAIGN PAYLOAD BUILT ===");
  console.log(`Publisher ID: ${publisherId}`);
  console.log(`Status: ${status}`);
  console.log("Final payload:", JSON.stringify(payload, null, 2));
  
  // Validation
  if (!publisherId) {
    console.warn("WARNING: No valid publisher ID found for adding to campaign");
  }
  
  return payload;
}
