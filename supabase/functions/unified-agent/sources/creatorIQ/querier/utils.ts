
// Utility functions for endpoint querier
import { QueryResult, PaginationInfo } from './types.ts';

/**
 * Create common CORS headers for API responses
 */
export function getCorsHeaders(): Record<string, string> {
  return {
    "Authorization": "Bearer",
    "Content-Type": "application/json"
  };
}

/**
 * Extract pagination information from API response
 */
export function extractPaginationInfo(response: any): PaginationInfo | null {
  if (!response) return null;

  const page = response.page || 1;
  const limit = response.limit || 50;
  const totalItems = response.total || 0;
  const totalPages = response.total_pages || Math.ceil(totalItems / limit) || 1;

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(endpoint: any, error: Error | string): QueryResult {
  const errorMessage = typeof error === 'string' ? error : error.message || "Unknown error";
  console.error(`Error querying endpoint ${endpoint.route}:`, errorMessage);
  
  // Create base error response
  const errorResponse: QueryResult = {
    endpoint: endpoint.route,
    method: endpoint.method,
    name: endpoint.name,
    error: errorMessage,
    data: {
      operation: {
        successful: false,
        type: endpoint.name,
        details: `Operation failed: ${errorMessage}`,
        timestamp: new Date().toISOString()
      },
      success: false,
      message: errorMessage
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

/**
 * Create standardized publisher not found error
 */
export function createPublisherNotFoundError(endpoint: any): QueryResult {
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
