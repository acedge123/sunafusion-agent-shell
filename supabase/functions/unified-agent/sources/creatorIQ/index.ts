
// Main entry point for Creator IQ integration
// Re-exports all functionality from modules

export { determineCreatorIQEndpoints } from './endpoint/index.ts';
export { buildCreatorIQPayload } from './payloadBuilder.ts';
export { queryCreatorIQEndpoint } from './endpointQuerier.ts';
export { processResponseMetadata } from './responseProcessor.ts';
export { extractListNameFromQuery, extractStatusFromQuery, extractMessageFromQuery } from './textExtractors.ts';

// Additional helper function to consolidate all Creator IQ operations
export async function processCreatorIQQuery(query: string, params: any = {}, previousState: any = null) {
  // Determine which endpoints to query based on the user's query
  const endpoints = determineCreatorIQEndpoints(query, previousState);
  
  // Process each endpoint and collect results
  const results = [];
  for (const endpoint of endpoints) {
    try {
      // Build the payload for the endpoint
      const payload = buildCreatorIQPayload(endpoint, query, params, previousState);
      
      // Query the endpoint
      const result = await queryCreatorIQEndpoint(endpoint, payload);
      
      // Add the result to the collection
      results.push(result);
    } catch (error) {
      console.error(`Error processing endpoint ${endpoint.name}:`, error);
      results.push({
        endpoint: endpoint.route,
        method: endpoint.method,
        name: endpoint.name,
        error: error.message || "Unknown error"
      });
    }
  }
  
  return {
    source: "creator_iq",
    results
  };
}
