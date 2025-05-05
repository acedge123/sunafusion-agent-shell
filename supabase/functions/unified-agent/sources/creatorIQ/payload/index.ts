
// Main payload builder - combines all specialized builders
import { CreatorIQEndpoint, BuildPayloadOptions } from './types.ts';
import { buildListCreationPayload, buildListQueryPayload, buildListPublishersQueryPayload } from './listPayloads.ts';
import { buildPublisherStatusPayload, buildPublisherMessagePayload, buildPublisherQueryPayload } from './publisherPayloads.ts';
import { buildCampaignQueryPayload, buildCampaignPublishersQueryPayload } from './campaignPayloads.ts';
import { buildAddPublishersToListPayload, buildAddPublishersToCampaignPayload } from './transferPayloads.ts';

/**
 * Build payload for Creator IQ API requests
 */
export function buildPayload(endpoint: CreatorIQEndpoint, query: string, params: any = {}, previousState: any = null): any {
  // Start with any params passed in
  const payload = { ...params };
  const options: BuildPayloadOptions = { query, params, previousState };
  
  // List creation
  if (endpoint.route === "/lists" && endpoint.method === "POST") {
    return buildListCreationPayload(options);
  }
  
  // Add publishers to list
  if (endpoint.route.includes('/lists/') && endpoint.route.includes('/publishers') && endpoint.method === "POST") {
    return buildAddPublishersToListPayload(options, endpoint);
  }
  
  // Add publishers to campaign
  if (endpoint.route.includes('/campaigns/') && endpoint.route.includes('/publishers') && endpoint.method === "POST") {
    return buildAddPublishersToCampaignPayload(options, endpoint);
  }
  
  // Publisher status update
  if (endpoint.route.includes("/publishers/") && endpoint.method === "PUT") {
    return buildPublisherStatusPayload(options, endpoint);
  }
  
  // Message sending
  if (endpoint.route.includes("/publishers/") && endpoint.route.includes("/messages")) {
    return buildPublisherMessagePayload(options, endpoint);
  }

  // GET requests for campaigns
  if (endpoint.route === "/campaigns" && endpoint.method === "GET") {
    return buildCampaignQueryPayload(options);
  }

  // GET requests for publishers in campaign
  if (endpoint.route.includes("/campaigns/") && endpoint.route.includes("/publishers")) {
    return buildCampaignPublishersQueryPayload();
  }

  // GET requests for all publishers
  if (endpoint.route === "/publishers" && endpoint.method === "GET") {
    return buildPublisherQueryPayload(options);
  }

  // GET requests for all lists
  if (endpoint.route === "/lists" && endpoint.method === "GET") {
    return buildListQueryPayload(options);
  }

  // GET requests for publishers in a list
  if (endpoint.route.includes("/lists/") && endpoint.route.includes("/publishers") && endpoint.method === "GET") {
    return buildListPublishersQueryPayload();
  }

  // Default minimal payload
  return payload;
}
