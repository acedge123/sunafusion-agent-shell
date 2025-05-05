
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
