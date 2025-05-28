
// Main entry point for Creator IQ integration
import { determineCreatorIQEndpoints } from './endpoint/index.ts';
import { buildPayload } from './payload/index.ts';
import { queryCreatorIQEndpoint } from './querier/index.ts';
import { processResponseMetadata } from './responseProcessor.ts';
import { extractListNameFromQuery, extractStatusFromQuery, extractMessageFromQuery } from './textExtractors.ts';

/**
 * Retry function with exponential backoff
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`=== RETRY ATTEMPT ${attempt}/${maxRetries} ===`);
      const result = await operation();
      console.log(`=== RETRY SUCCESSFUL ON ATTEMPT ${attempt} ===`);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`=== RETRY ATTEMPT ${attempt} FAILED ===`, {
        error: error.message,
        status: error.status,
        attempt,
        maxRetries
      });
      
      if (attempt === maxRetries) {
        console.error(`=== ALL RETRY ATTEMPTS EXHAUSTED ===`);
        break;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`=== WAITING ${Math.round(delay)}ms BEFORE RETRY ===`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Main function to process Creator IQ queries
 */
export async function processCreatorIQQuery(query: string, params: any = {}, previousState: any = null) {
  console.log("=== CREATOR IQ QUERY PROCESSING START ===");
  console.log("Processing Creator IQ query:", query);
  console.log("Params received:", JSON.stringify(params, null, 2));
  console.log("Previous state available:", !!previousState);
  
  try {
    // Validate API key early
    const apiKey = Deno.env.get("CREATOR_IQ_API_KEY");
    if (!apiKey) {
      console.error("=== CRITICAL ERROR: NO API KEY ===");
      throw new Error("Creator IQ API key is not configured");
    }
    console.log("API key validation: ✓ Available");
    
    // Determine which endpoints to query
    const endpoints = determineCreatorIQEndpoints(query, previousState);
    console.log(`=== ENDPOINTS DETERMINED ===`);
    console.log(`Found ${endpoints.length} endpoints to query:`, endpoints.map(e => `${e.method} ${e.route}`));
    
    // Handle case where we need to add a specific publisher to a specific list
    // This happens when we get the lists but still need to create the POST endpoint
    if (endpoints.length === 1 && endpoints[0].route === "/lists" && endpoints[0].method === "GET") {
      console.log("=== CHECKING FOR PUBLISHER-TO-LIST OPERATION ===");
      
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
        console.log(`=== PUBLISHER-TO-LIST OPERATION DETECTED ===`);
        console.log(`Publisher ID: ${publisherId}`);
        console.log(`Target list name: "${targetListName}"`);
        
        // First query the lists to get the list ID
        console.log(`=== STEP 1: FETCHING LISTS ===`);
        let listsResult;
        try {
          listsResult = await retryOperation(async () => {
            const payload = buildPayload(endpoints[0], query, params, previousState);
            console.log("Lists query payload:", JSON.stringify(payload, null, 2));
            return await queryCreatorIQEndpoint(endpoints[0], payload);
          });
          console.log(`Lists fetch result - Success: ${listsResult.success}`);
        } catch (error) {
          console.error("=== LISTS FETCH FAILED ===", error);
          return [{
            ...endpoints[0],
            error: `Failed to fetch lists: ${error.message}`,
            success: false
          }];
        }
        
        // Find the target list ID from the results
        let targetListId = null;
        console.log("=== STEP 2: SEARCHING FOR TARGET LIST ===");
        
        if (listsResult.data && listsResult.data.ListsCollection) {
          console.log(`Searching through ${listsResult.data.ListsCollection.length} lists`);
          
          for (const listItem of listsResult.data.ListsCollection) {
            const listData = listItem.List || listItem;
            if (listData && listData.Name) {
              console.log(`Checking list: "${listData.Name}" (ID: ${listData.Id})`);
              if (listData.Name.toLowerCase().includes(targetListName.toLowerCase())) {
                targetListId = listData.Id;
                console.log(`=== TARGET LIST FOUND ===`);
                console.log(`List ID: ${targetListId}, Name: "${listData.Name}"`);
                break;
              }
            }
          }
        }
        
        if (!targetListId) {
          console.error("=== TARGET LIST NOT FOUND ===");
          console.log("Available lists:", listsResult.data?.ListsCollection?.map((item: any) => {
            const listData = item.List || item;
            return { id: listData?.Id, name: listData?.Name };
          }).filter(Boolean));
          
          return [{
            ...listsResult,
            error: `List "${targetListName}" not found`,
            success: false
          }];
        }
        
        // Create and execute the POST endpoint
        console.log("=== STEP 3: CREATING POST ENDPOINT ===");
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
        
        console.log(`=== POST OPERATION DETAILS ===`);
        console.log(`Endpoint:`, JSON.stringify(postEndpoint, null, 2));
        console.log(`Payload:`, JSON.stringify(postPayload, null, 2));
        console.log(`Target URL: /lists/${targetListId}/publishers`);
        
        // Execute the POST request with comprehensive error handling
        console.log(`=== STEP 4: EXECUTING POST REQUEST ===`);
        let postResult;
        try {
          postResult = await retryOperation(async () => {
            console.log("=== ATTEMPTING POST REQUEST ===");
            console.log("POST endpoint validation:", {
              hasRoute: !!postEndpoint.route,
              hasMethod: !!postEndpoint.method,
              hasName: !!postEndpoint.name,
              routeFormat: postEndpoint.route,
              payloadFormat: JSON.stringify(postPayload)
            });
            
            const result = await queryCreatorIQEndpoint(postEndpoint, postPayload);
            console.log("=== POST REQUEST COMPLETED ===");
            console.log("Result success:", result.success);
            console.log("Result data:", JSON.stringify(result.data, null, 2));
            
            if (!result.success && result.error) {
              throw new Error(`POST request failed: ${result.error}`);
            }
            
            return result;
          }, 3, 2000); // 3 retries, 2 second base delay
          
          console.log(`=== POST REQUEST FINAL RESULT ===`);
          console.log(`Success: ${postResult.success}`);
          
        } catch (error) {
          console.error(`=== POST REQUEST FAILED AFTER RETRIES ===`, {
            error: error.message,
            stack: error.stack,
            publisherId,
            targetListId,
            targetListName
          });
          
          postResult = {
            endpoint: postEndpoint.route,
            method: postEndpoint.method,
            name: postEndpoint.name,
            error: `Failed to add publisher ${publisherId} to list "${targetListName}": ${error.message}`,
            success: false,
            data: null
          };
        }
        
        // Return both results with proper success indication
        const finalResults = [listsResult, postResult];
        console.log("=== OPERATION COMPLETE ===");
        console.log("Final results summary:", finalResults.map(r => ({
          endpoint: r.endpoint,
          success: r.success,
          hasError: !!r.error
        })));
        
        return finalResults;
      }
    }
    
    // For all other cases, query all endpoints
    console.log("=== PROCESSING STANDARD ENDPOINTS ===");
    const results = await Promise.all(
      endpoints.map(async (endpoint, index) => {
        console.log(`=== PROCESSING ENDPOINT ${index + 1}/${endpoints.length} ===`);
        console.log(`Endpoint: ${endpoint.method} ${endpoint.route}`);
        
        try {
          return await retryOperation(async () => {
            const payload = buildPayload(endpoint, query, params, previousState);
            console.log(`Payload for ${endpoint.route}:`, JSON.stringify(payload, null, 2));
            
            const result = await queryCreatorIQEndpoint(endpoint, payload);
            console.log(`Result from ${endpoint.route} - Success: ${result.success}`);
            
            if (!result.success && result.error) {
              throw new Error(`Endpoint ${endpoint.route} failed: ${result.error}`);
            }
            
            return result;
          });
        } catch (error) {
          console.error(`=== ENDPOINT ${endpoint.route} FAILED ===`, {
            error: error.message,
            endpoint: endpoint.route,
            method: endpoint.method
          });
          
          return {
            endpoint: endpoint.route,
            method: endpoint.method,
            name: endpoint.name,
            error: error.message || "Unknown error",
            success: false,
            data: null
          };
        }
      })
    );
    
    console.log("=== ALL ENDPOINTS PROCESSED ===");
    console.log("Results summary:", results.map(r => ({
      endpoint: r.endpoint,
      success: r.success,
      hasError: !!r.error
    })));
    
    return results;
    
  } catch (error) {
    console.error("=== CREATOR IQ QUERY PROCESSING ERROR ===", {
      error: error.message,
      stack: error.stack,
      query,
      params
    });
    throw error;
  }
}

// Re-export all the main functions
export { determineCreatorIQEndpoints } from './endpoint/index.ts';
export { buildPayload as buildCreatorIQPayload } from './payload/index.ts';
export { queryCreatorIQEndpoint } from './querier/index.ts';
export { processResponseMetadata } from './responseProcessor.ts';
export { extractListNameFromQuery, extractStatusFromQuery, extractMessageFromQuery } from './textExtractors.ts';
