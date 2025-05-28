
// Main entry point for Creator IQ integration
import { determineCreatorIQEndpoints } from './endpoint/index.ts';
import { buildPayload } from './payload/index.ts';
import { queryEndpoint } from './querier/index.ts';
import { processResponseMetadata } from './response/index.ts';
import { extractListNameFromQuery, extractStatusFromQuery, extractMessageFromQuery } from './textExtractors.ts';

/**
 * Main function to process Creator IQ queries
 */
export async function processCreatorIQQuery(query: string, params: any = {}, previousState: any = null) {
  console.log("Processing Creator IQ query:", query);
  
  try {
    // Determine which endpoints to query
    const endpoints = determineCreatorIQEndpoints(query, previousState);
    console.log(`Determined ${endpoints.length} endpoints to query`);
    
    // Handle case where we need to add a specific publisher to a specific list
    // This happens when we get the lists but still need to create the POST endpoint
    if (endpoints.length === 1 && endpoints[0].route === "/lists" && endpoints[0].method === "GET") {
      // Check if this is for adding a specific publisher to a specific list
      const publisherIdMatch = query.match(/publisher\s*\(\s*(\d+)\s*\)/i) || 
                              query.match(/publisher\s+(\d+)/i) ||
                              query.match(/(\d{6,10})/);
      
      const listNameMatch = query.match(/list[^?]*?["']([^"']+)["']/i) ||
                           query.match(/list\s+([A-Za-z0-9\s-]+[a-zA-Z0-9])(?:\s*:|\s*\?|$)/i) ||
                           query.match(/to\s+this\s+list[^?]*?([A-Za-z0-9\s-]+[a-zA-Z0-9])(?:\s*:|\s*\?|$)/i);
      
      if (publisherIdMatch && listNameMatch) {
        const publisherId = publisherIdMatch[1];
        const targetListName = listNameMatch[1].trim();
        console.log(`Detected specific publisher ${publisherId} to be added to list "${targetListName}"`);
        
        // First query the lists to get the list ID, then we'll add the POST endpoint
        const listsResult = await queryEndpoint(endpoints[0], buildPayload(endpoints[0], query, params, previousState));
        
        // Find the target list ID from the results
        let targetListId = null;
        if (listsResult.data && listsResult.data.ListsCollection) {
          for (const listItem of listsResult.data.ListsCollection) {
            const listData = listItem.List || listItem;
            if (listData && listData.Name && listData.Name.toLowerCase().includes(targetListName.toLowerCase())) {
              targetListId = listData.Id;
              console.log(`Found target list ID: ${targetListId} for "${targetListName}"`);
              break;
            }
          }
        }
        
        // If we found the list, create and execute the POST endpoint
        if (targetListId) {
          const postEndpoint = {
            route: `/lists/${targetListId}/publishers`,
            method: "POST",
            name: "Add Publishers To List",
            targetListId: targetListId,
            publisherId: publisherId
          };
          
          // Build payload for adding the publisher
          const postPayload = {
            PublisherId: [parseInt(publisherId)]
          };
          
          console.log(`Adding publisher ${publisherId} to list ${targetListId} with payload:`, postPayload);
          
          // Execute the POST request
          const postResult = await queryEndpoint(postEndpoint, postPayload);
          
          // Return both results
          return [listsResult, postResult];
        } else {
          console.error(`Could not find list with name "${targetListName}"`);
          // Return just the lists result
          return [listsResult];
        }
      }
    }
    
    // For all other cases, query all endpoints
    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        const payload = buildPayload(endpoint, query, params, previousState);
        return await queryEndpoint(endpoint, payload);
      })
    );
    
    return results;
    
  } catch (error) {
    console.error("Error processing Creator IQ query:", error);
    throw error;
  }
}

// Re-export all the main functions
export { determineCreatorIQEndpoints } from './endpoint/index.ts';
export { buildPayload as buildCreatorIQPayload } from './payload/index.ts';
export { queryEndpoint as queryCreatorIQEndpoint } from './querier/index.ts';
export { processResponseMetadata } from './response/index.ts';
export { extractListNameFromQuery, extractStatusFromQuery, extractMessageFromQuery } from './textExtractors.ts';
