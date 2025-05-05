
// Main endpoint determiner - combines all handlers
import { CreatorIQEndpoint } from './types.ts';
import { handleListCreationEndpoints, handleListQueryEndpoints } from './listHandlers.ts';
import { handleCampaignQueryEndpoints } from './campaignHandlers.ts';
import { 
  handlePublisherStatusUpdateEndpoints, 
  handlePublisherMessageEndpoints, 
  handleGenericPublisherEndpoints 
} from './publisherHandlers.ts';
import { handlePublisherTransferEndpoints } from './transferHandlers.ts';

/**
 * Determine CreatorIQ endpoints to query based on user query and context
 * @param query User's text query
 * @param previousState Optional previous state for context
 * @returns Array of endpoints to query
 */
export function determineCreatorIQEndpoints(query: string, previousState: any = null): CreatorIQEndpoint[] {
  const endpoints: CreatorIQEndpoint[] = [];
  
  // First priority: Check for list creation (write operation)
  const listCreationEndpoints = handleListCreationEndpoints(query);
  if (listCreationEndpoints.length > 0) {
    return listCreationEndpoints;
  }
  
  // Second priority: Publisher transfers between lists/campaigns (complex write operation)
  const transferEndpoints = handlePublisherTransferEndpoints(query, previousState);
  if (transferEndpoints.length > 0) {
    return transferEndpoints;
  }
  
  // Third priority: Publisher status updates (write operation)
  const statusUpdateEndpoints = handlePublisherStatusUpdateEndpoints(query);
  if (statusUpdateEndpoints.length > 0) {
    return statusUpdateEndpoints;
  }
  
  // Fourth priority: Message sending (write operation)
  const messageEndpoints = handlePublisherMessageEndpoints(query);
  if (messageEndpoints.length > 0) {
    return messageEndpoints;
  }
  
  // Fifth priority: List queries (read operation)
  const listQueryEndpoints = handleListQueryEndpoints(query, previousState);
  endpoints.push(...listQueryEndpoints);
  
  // Sixth priority: Campaign queries (read operation)
  const campaignQueryEndpoints = handleCampaignQueryEndpoints(query, previousState);
  endpoints.push(...campaignQueryEndpoints);
  
  // If no endpoints were added but looking for publishers, add generic publisher endpoint
  if (endpoints.length === 0) {
    const publisherEndpoints = handleGenericPublisherEndpoints(query);
    endpoints.push(...publisherEndpoints);
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
