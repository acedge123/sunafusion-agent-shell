
// Main endpoint querier module that handles API requests to Creator IQ endpoints
import { handleGetRequest } from './getRequests.ts';
import { handleNonGetRequest } from './nonGetRequests.ts';
import { createErrorResponse } from './utils.ts';
import { QueryResult } from './types.ts';

/**
 * Enhanced error logging function
 */
function logDetailedError(context: string, error: any, endpoint?: any, payload?: any) {
  console.error(`=== ${context.toUpperCase()} ERROR ===`);
  console.error(`Error type: ${error?.constructor?.name || 'Unknown'}`);
  console.error(`Error message: ${error?.message || 'No message'}`);
  
  if (error?.status) {
    console.error(`HTTP status: ${error.status}`);
  }
  
  if (error?.stack) {
    console.error(`Stack trace:`, error.stack);
  }
  
  if (endpoint) {
    console.error(`Endpoint details:`, {
      route: endpoint.route,
      method: endpoint.method,
      name: endpoint.name
    });
  }
  
  if (payload) {
    console.error(`Payload:`, JSON.stringify(payload, null, 2));
  }
  
  console.error(`=== END ${context.toUpperCase()} ERROR ===`);
}

/**
 * Query Creator IQ API endpoint with automatic pagination support
 */
export async function queryCreatorIQEndpoint(endpoint: any, payload: any): Promise<QueryResult> {
  console.log("=== QUERY CREATOR IQ ENDPOINT START ===");
  console.log(`Endpoint: ${endpoint?.method || 'UNKNOWN'} ${endpoint?.route || 'UNKNOWN'}`);
  console.log(`Name: ${endpoint?.name || 'UNKNOWN'}`);
  
  try {
    // Validate API key
    const apiKey = Deno.env.get("CREATOR_IQ_API_KEY");
    if (!apiKey) {
      const errorMsg = "Creator IQ API key is not configured";
      console.error("=== API KEY ERROR ===", errorMsg);
      throw new Error(errorMsg);
    }
    console.log("API key: ✓ Available");
    
    // Validate endpoint
    if (!endpoint) {
      throw new Error("Endpoint is null or undefined");
    }
    
    if (!endpoint.route) {
      throw new Error("Endpoint route is missing");
    }
    
    if (!endpoint.method) {
      throw new Error("Endpoint method is missing");
    }
    
    console.log("Endpoint validation: ✓ Valid");
    
    let baseUrl = "https://apis.creatoriq.com/crm/v1/api";
    console.log(`Base URL: ${baseUrl}`);
    
    // Enhanced error handling for publisher ID placeholder in message endpoints
    if (endpoint.route.includes("{publisher_id}") && endpoint.route.includes("/messages")) {
      console.error("=== PUBLISHER ID PLACEHOLDER ERROR ===");
      
      // Create a more descriptive error response
      return {
        endpoint: endpoint.route,
        method: endpoint.method,
        name: endpoint.name,
        error: "Missing publisher ID",
        success: false,
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
    
    console.log("=== DELEGATING TO REQUEST HANDLER ===");
    
    // For GET requests, need to handle pagination
    if (endpoint.method === "GET") {
      console.log("Delegating to GET request handler");
      try {
        const result = await handleGetRequest(endpoint, payload, apiKey, baseUrl);
        console.log(`GET request result - Success: ${result.success}`);
        return result;
      } catch (error) {
        logDetailedError("GET REQUEST", error, endpoint, payload);
        return createErrorResponse(endpoint, error);
      }
    } else {
      // For non-GET methods (POST, PUT, DELETE)
      console.log("Delegating to non-GET request handler");
      try {
        const result = await handleNonGetRequest(endpoint, payload, apiKey, baseUrl);
        console.log(`Non-GET request result - Success: ${result.success}`);
        return result;
      } catch (error) {
        logDetailedError("NON-GET REQUEST", error, endpoint, payload);
        return createErrorResponse(endpoint, error);
      }
    }
    
  } catch (error) {
    logDetailedError("QUERY ENDPOINT", error, endpoint, payload);
    return createErrorResponse(endpoint, error);
  }
}

/**
 * Process the response to handle deeply nested structures
 * This helper normalizes API responses that have multiple layers of nesting
 */
export function processNestedResponse(response: any): any {
  if (!response) return null;
  
  // Create a deep copy to avoid mutating the original
  const normalized = JSON.parse(JSON.stringify(response));
  
  // Process lists collection
  if (normalized.ListsCollection && Array.isArray(normalized.ListsCollection)) {
    normalized.ListsCollection = normalized.ListsCollection.map((listItem: any) => {
      // Handle doubly nested list data
      if (listItem.List && listItem.List.List) {
        const newItem = { ...listItem };
        newItem.List = listItem.List.List;
        return newItem;
      }
      return listItem;
    });
  }
  
  // Process publishers collection
  if (normalized.PublisherCollection && Array.isArray(normalized.PublisherCollection)) {
    normalized.PublisherCollection = normalized.PublisherCollection.map((pubItem: any) => {
      // Handle doubly nested publisher data
      if (pubItem.Publisher && pubItem.Publisher.Publisher) {
        const newItem = { ...pubItem };
        newItem.Publisher = pubItem.Publisher.Publisher;
        return newItem;
      }
      return pubItem;
    });
  }
  
  // Process alternate publishers collection name
  if (normalized.PublishersCollection && Array.isArray(normalized.PublishersCollection)) {
    normalized.PublishersCollection = normalized.PublishersCollection.map((pubItem: any) => {
      // Handle doubly nested publisher data
      if (pubItem.Publisher && pubItem.Publisher.Publisher) {
        const newItem = { ...pubItem };
        newItem.Publisher = pubItem.Publisher.Publisher;
        return newItem;
      }
      return pubItem;
    });
  }
  
  // Process campaigns collection
  if (normalized.CampaignCollection && Array.isArray(normalized.CampaignCollection)) {
    normalized.CampaignCollection = normalized.CampaignCollection.map((campaignItem: any) => {
      // Handle doubly nested campaign data
      if (campaignItem.Campaign && campaignItem.Campaign.Campaign) {
        const newItem = { ...campaignItem };
        newItem.Campaign = campaignItem.Campaign.Campaign;
        return newItem;
      }
      return campaignItem;
    });
  }
  
  // Process direct list object
  if (normalized.List && normalized.List.List) {
    normalized.List = normalized.List.List;
  }
  
  // Process direct publisher object
  if (normalized.Publisher && normalized.Publisher.Publisher) {
    normalized.Publisher = normalized.Publisher.Publisher;
  }
  
  // Process direct campaign object
  if (normalized.Campaign && normalized.Campaign.Campaign) {
    normalized.Campaign = normalized.Campaign.Campaign;
  }
  
  return normalized;
}

// Re-export types
export type { QueryResult, QueryOptions, PaginationInfo } from './types.ts';
