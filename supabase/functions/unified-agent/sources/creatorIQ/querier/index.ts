
// Main endpoint querier module that handles API requests to Creator IQ endpoints
import { handleGetRequest } from './getRequests.ts';
import { handleNonGetRequest } from './nonGetRequests.ts';
import { createErrorResponse } from './utils.ts';
import { QueryResult } from './types.ts';

/**
 * Query Creator IQ API endpoint with automatic pagination support
 */
export async function queryCreatorIQEndpoint(endpoint: any, payload: any): Promise<QueryResult> {
  const apiKey = Deno.env.get("CREATOR_IQ_API_KEY");
  if (!apiKey) {
    throw new Error("Creator IQ API key is not configured");
  }
  
  let baseUrl = "https://apis.creatoriq.com/crm/v1/api";
  
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
  
  try {
    // For GET requests, need to handle pagination
    if (endpoint.method === "GET") {
      return await handleGetRequest(endpoint, payload, apiKey, baseUrl);
    } else {
      // For non-GET methods (POST, PUT, DELETE)
      return await handleNonGetRequest(endpoint, payload, apiKey, baseUrl);
    }
  } catch (error) {
    return createErrorResponse(endpoint, error);
  }
}

/**
 * Process the response to handle deeply nested structures
 * This helper normalizes API responses that have multiple layers of nesting
 */
export function processNestedResponse(response: any): any {
  if (!response) return null;
  
  // Process lists collection
  if (response.ListsCollection && Array.isArray(response.ListsCollection)) {
    response.ListsCollection = response.ListsCollection.map((listItem: any) => {
      // Handle doubly nested list data
      if (listItem.List && listItem.List.List) {
        listItem.List = listItem.List.List;
      }
      return listItem;
    });
  }
  
  // Process publishers collection
  if (response.PublisherCollection && Array.isArray(response.PublisherCollection)) {
    response.PublisherCollection = response.PublisherCollection.map((pubItem: any) => {
      // Handle doubly nested publisher data
      if (pubItem.Publisher && pubItem.Publisher.Publisher) {
        pubItem.Publisher = pubItem.Publisher.Publisher;
      }
      return pubItem;
    });
  }
  
  return response;
}

// Re-export types
export type { QueryResult, QueryOptions, PaginationInfo } from './types.ts';
