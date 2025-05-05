
// Handles API requests to Creator IQ endpoints with pagination support
import { processResponseMetadata } from './responseProcessor.ts';

/**
 * Query Creator IQ API endpoint with automatic pagination support
 */
export async function queryCreatorIQEndpoint(endpoint: any, payload: any) {
  const apiKey = Deno.env.get("CREATOR_IQ_API_KEY");
  if (!apiKey) {
    throw new Error("Creator IQ API key is not configured");
  }
  
  let url = `https://apis.creatoriq.com/crm/v1/api${endpoint.route}`;
  
  // Enhanced error handling for publisher ID placeholder in message endpoints
  if (endpoint.route.includes("{publisher_id}") && endpoint.route.includes("/messages")) {
    console.error("Error: Publisher ID placeholder not resolved in message endpoint URL");
    
    // Create a more descriptive error response
    return {
      endpoint: endpoint.route,
      method: endpoint.method,
      name: endpoint.name,
      error: "Missing publisher ID",
      data: {
        operation: {
          successful: false,
          type: "Send Message",
          details: "Failed to send message: No publisher ID specified. Please provide a specific publisher ID.",
          timestamp: new Date().toISOString()
        },
        success: false,
        message: "Unable to send message without a valid publisher ID. Please specify a publisher ID."
      }
    };
  }
  
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
  
  console.log(`Querying endpoint ${endpoint.route} with payload:`, payload);
  
  // For GET requests, need to handle pagination
  if (endpoint.method === "GET") {
    try {
      // Extract pagination-related parameters
      const enableAllPages = payload._fullSearch === true || 
                           (payload.all_pages === true) || 
                           ('all_pages' in payload && payload.all_pages === 'true');
      
      // Deep clone the payload to avoid modifying the original
      const queryPayload = { ...payload };
      
      // Remove special parameters that shouldn't be sent as query params
      if ('_fullSearch' in queryPayload) delete queryPayload._fullSearch;
      
      // Define a function to fetch a single page
      const fetchPage = async (page = 1, limit = queryPayload.limit || 50) => {
        const queryParams = new URLSearchParams();
        
        // Add all parameters from payload
        for (const [key, value] of Object.entries(queryPayload)) {
          if (key !== 'page' && key !== 'limit' && key !== 'all_pages' && key !== 'max_pages') { // Don't override our pagination params or internal params
            queryParams.append(key, String(value));
          }
        }
        
        // Add pagination parameters
        queryParams.append('page', String(page));
        queryParams.append('limit', String(limit));
        
        const fullUrl = `${url}?${queryParams.toString()}`;
        console.log(`Fetching page ${page} with limit ${limit} from ${fullUrl}`);
        
        const response = await fetch(fullUrl, { headers });
        
        if (!response.ok) {
          const responseText = await response.text();
          console.error(`API error: ${response.status} ${response.statusText} - ${responseText}`);
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      };
      
      // Start by fetching the first page to determine total pages
      let initialData = await fetchPage(1);
      
      // Check if we need to handle pagination and endpoint supports it
      let shouldPaginate = enableAllPages && 
                         endpoint.route.match(/\/(lists|publishers|campaigns)(?:\/\d+\/publishers)?$/);
      
      if (shouldPaginate) {
        console.log("Pagination detected, checking if multiple pages exist");
        
        // Determine the collection field name based on endpoint
        let collectionField = null;
        if (endpoint.route === '/lists') {
          collectionField = 'ListsCollection';
        } else if (endpoint.route === '/publishers') {
          collectionField = 'PublisherCollection';
        } else if (endpoint.route === '/campaigns') {
          collectionField = 'CampaignCollection';
        } else if (endpoint.route.includes('/publishers')) {
          collectionField = 'PublisherCollection';
        }
        
        if (!collectionField || !initialData[collectionField]) {
          console.log(`No collection field '${collectionField}' found in response, pagination not possible`);
          shouldPaginate = false;
        }
      }
      
      // If we have multiple pages and should paginate, fetch all pages and combine results
      if (shouldPaginate && initialData.total_pages && initialData.total_pages > 1) {
        const totalPages = Math.min(initialData.total_pages, payload.max_pages || 100); // Respect max_pages limit
        const totalItems = initialData.total || 0;
        console.log(`Found ${totalPages} pages with ${totalItems} total items. Starting pagination...`);
        
        // Determine the collection field name based on endpoint
        const collectionField = endpoint.route === '/lists' ? 'ListsCollection' : 
                               endpoint.route === '/publishers' ? 'PublisherCollection' :
                               endpoint.route === '/campaigns' ? 'CampaignCollection' :
                               endpoint.route.includes('/publishers') ? 'PublisherCollection' : null;
        
        if (collectionField && initialData[collectionField]) {
          // Store all items from all pages in this array
          const allItems = [...initialData[collectionField]];
          
          // Fetch the remaining pages (starting from page 2)
          const pagePromises = [];
          for (let page = 2; page <= totalPages; page++) {
            pagePromises.push(fetchPage(page, queryPayload.limit || 1000));
          }
          
          console.log(`Fetching ${pagePromises.length} additional pages in parallel...`);
          const pageResults = await Promise.allSettled(pagePromises);
          
          // Process results, including those that failed
          let successCount = 0;
          let failCount = 0;
          
          for (const pageResult of pageResults) {
            if (pageResult.status === 'fulfilled') {
              const pageData = pageResult.value;
              if (pageData[collectionField] && Array.isArray(pageData[collectionField])) {
                allItems.push(...pageData[collectionField]);
                successCount++;
              } else {
                console.warn(`Missing ${collectionField} in page response:`, pageData);
                failCount++;
              }
            } else {
              console.error(`Page fetch failed:`, pageResult.reason);
              failCount++;
            }
          }
          
          console.log(`Combined ${allItems.length} items from ${successCount} successful pages (${failCount} failed)`);
          
          if (collectionField === 'ListsCollection') {
            // Debug for lists: Check for TestList
            const listNames = allItems
              .map(item => item.List?.Name)
              .filter(Boolean);
            
            const testListItems = listNames.filter(
              name => name.toLowerCase().includes('testlist')
            );
            
            if (testListItems.length > 0) {
              console.log(`Found TestList items in combined data:`, testListItems);
            } else {
              console.log(`TestList not found in combined data of ${listNames.length} lists`);
            }
          }
          
          // Replace the collection in the initial data with the combined collection
          initialData[collectionField] = allItems;
          
          // Update pagination metadata to reflect that we've fetched everything
          initialData.page = 1;
          initialData.pages_count = 1;
          initialData.is_paginated = false;
          initialData._all_pages_fetched = true;
          initialData._total_items_fetched = allItems.length;
        } else {
          console.warn(`Unable to determine collection field for endpoint ${endpoint.route}`);
        }
      }
      
      // Process results based on endpoint type
      processResponseMetadata(initialData, endpoint);
      
      return {
        endpoint: endpoint.route,
        method: endpoint.method,
        name: endpoint.name,
        data: initialData
      };
    } catch (error) {
      console.error(`Error during paginated request to ${endpoint.route}:`, error);
      return {
        endpoint: endpoint.route,
        method: endpoint.method,
        name: endpoint.name,
        error: error.message || "Unknown error",
        data: {
          operation: {
            successful: false,
            type: endpoint.name,
            details: `Pagination failed: ${error.message || "Unknown error"}`,
            timestamp: new Date().toISOString()
          }
        }
      };
    }
  } else {
    // For non-GET methods (POST, PUT, DELETE)
    try {
      console.log(`Making ${endpoint.method} request to ${url} with payload:`, payload);
      const response = await fetch(url, {
        method: endpoint.method,
        headers,
        body: JSON.stringify(payload)
      });
      
      console.log(`Creator IQ API response status: ${response.status}`);
      
      // Enhanced error handling for common error codes
      if (!response.ok) {
        // For 404 errors on message sending, provide a more helpful error with publisher ID
        if (response.status === 404 && endpoint.route.includes("/messages")) {
          const publisherId = endpoint.route.match(/\/publishers\/(\d+)\/messages/)?.[1];
          
          console.error(`Publisher not found: ${publisherId || "Unknown ID"}`);
          
          return {
            endpoint: endpoint.route,
            method: endpoint.method,
            name: endpoint.name,
            error: `Publisher not found: ${publisherId || "Unknown ID"}`,
            data: {
              operation: {
                successful: false,
                type: "Send Message",
                details: `Failed to send message: Publisher with ID ${publisherId || "Unknown"} not found`,
                timestamp: new Date().toISOString()
              },
              success: false,
              messageId: null,
              publisherId: publisherId,
              message: `Publisher with ID ${publisherId || "Unknown"} not found`
            }
          };
        }
        
        // Handle other error status codes
        const errorText = await response.text();
        let errorMessage = `Creator IQ API error: ${response.status} ${response.statusText}`;
        
        try {
          // Try to parse error response as JSON for more details
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage += ` - ${errorJson.message}`;
          }
        } catch (e) {
          // If not JSON, use the text directly if available
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        }
        
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Process operation metadata based on endpoint type
      processResponseMetadata(data, endpoint);
      
      return {
        endpoint: endpoint.route,
        method: endpoint.method,
        name: endpoint.name,
        data
      };
    } catch (error) {
      console.error(`Error querying endpoint ${endpoint.route}:`, error);
      
      // Enhanced error response structure
      const errorResponse = {
        endpoint: endpoint.route,
        method: endpoint.method,
        name: endpoint.name,
        error: error.message || "Unknown error",
        data: {
          operation: {
            successful: false,
            type: endpoint.name,
            details: `Operation failed: ${error.message || "Unknown error"}`,
            timestamp: new Date().toISOString()
          },
          success: false,
          message: error.message || "Unknown error"
        }
      };
      
      // Special handling for message operations
      if (endpoint.route.includes("/messages")) {
        const publisherId = endpoint.route.match(/\/publishers\/(\d+)\/messages/)?.[1];
        if (publisherId) {
          errorResponse.data.publisherId = publisherId;
          errorResponse.data.operation.details += ` (Publisher ID: ${publisherId})`;
        }
      }
      
      return errorResponse;
    }
  }
}
