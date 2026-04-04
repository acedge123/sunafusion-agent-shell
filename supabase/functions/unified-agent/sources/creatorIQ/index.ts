// Main entry point for Creator IQ integration
// Re-exports all functionality from modules

import { errMsg } from "../../../_shared/error.ts";

export { determineCreatorIQEndpoints } from './endpoint/index.ts';
export { buildCreatorIQPayload } from './payloadBuilder.ts';
export { queryCreatorIQEndpoint } from './querier/index.ts';
export { processResponseMetadata } from './responseProcessor.ts';
export { extractListNameFromQuery, extractStatusFromQuery, extractMessageFromQuery } from './textExtractors.ts';

import { determineCreatorIQEndpoints } from './endpoint/index.ts';
import { buildCreatorIQPayload } from './payloadBuilder.ts';
import { queryCreatorIQEndpoint } from './querier/index.ts';

// Additional helper function to consolidate all Creator IQ operations
export async function processCreatorIQQuery(query: string, params: Record<string, unknown> = {}, previousState: unknown = null) {
  // Determine which endpoints to query based on the user's query
  const endpoints = determineCreatorIQEndpoints(query, previousState);

  // Process each endpoint and collect results
  const results: unknown[] = [];
  for (const endpoint of endpoints) {
    try {
      // Build the payload for the endpoint
      const payload = buildCreatorIQPayload(endpoint, query, params, previousState);

      // Query the endpoint
      const result = await queryCreatorIQEndpoint(endpoint, payload);

      // Add the result to the collection
      results.push(result);
    } catch (error: unknown) {
      console.error(`Error processing endpoint ${endpoint.name}:`, error);
      results.push({
        endpoint: endpoint.route,
        method: endpoint.method,
        name: endpoint.name,
        error: errMsg(error)
      });
    }
  }

  return {
    source: "creator_iq" as const,
    results
  };
}
