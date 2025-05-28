
// Main entry point for Creator IQ integration
import { determineCreatorIQEndpoints } from './endpoint/index.ts';
import { buildPayload } from './payload/index.ts';
import { queryCreatorIQEndpoint } from './querier/index.ts';
import { processResponseMetadata } from './responseProcessor.ts';
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
        
        // First query the lists to get the list ID
        console.log(`Step 1: Fetching all lists to find target list...`);
        const listsResult = await queryCreatorIQEndpoint(endpoints[0], buildPayload(endpoints[0], query, params, previousState));
        console.log(`Lists fetch result success:`, listsResult.success);
        
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
          
          // Build payload for adding the publisher using the correct format
          const postPayload = {
            PublisherId: [parseInt(publisherId)]
          };
          
          console.log(`Step 2: Adding publisher ${publisherId} to list ${targetListId}`);
          console.log(`POST endpoint:`, JSON.stringify(postEndpoint, null, 2));
          console.log(`POST payload:`, JSON.stringify(postPayload, null, 2));
          
          // Execute the POST request
          console.log(`Executing POST request...`);
          const postResult = await queryCreatorIQEndpoint(postEndpoint, postPayload);
          
          console.log(`POST request completed with success:`, postResult.success);
          console.log(`POST request result:`, JSON.stringify(postResult, null, 2));
          
          // Return both results with proper success indication
          if (postResult.success) {
            console.log(`Successfully added publisher ${publisherId} to list "${targetListName}"`);
            return [listsResult, postResult];
          } else {
            console.error(`Failed to add publisher ${publisherId} to list "${targetListName}":`, postResult.error);
            return [listsResult, postResult];
          }
        } else {
          console.error(`Could not find list with name "${targetListName}"`);
          console.log("Available lists:", listsResult.data?.ListsCollection?.map((item: any) => {
            const listData = item.List || item;
            return listData?.Name;
          }).filter(Boolean));
          // Return just the lists result with error indication
          return [{
            ...listsResult,
            error: `List "${targetListName}" not found`
          }];
        }
      }
    }
    
    // For all other cases, query all endpoints
    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        const payload = buildPayload(endpoint, query, params, previousState);
        console.log(`Querying endpoint ${endpoint.route} with payload:`, JSON.stringify(payload, null, 2));
        const result = await queryCreatorIQEndpoint(endpoint, payload);
        console.log(`Result from ${endpoint.route} success:`, result.success);
        return result;
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
export { queryCreatorIQEndpoint } from './querier/index.ts';
export { processResponseMetadata } from './responseProcessor.ts';
export { extractListNameFromQuery, extractStatusFromQuery, extractMessageFromQuery } from './textExtractors.ts';
