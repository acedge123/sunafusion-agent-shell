
// Handle non-GET requests (POST, PUT, DELETE)
import { logRequest, createErrorResult, createSuccessResult } from './utils.ts';
import { QueryResult } from './types.ts';

/**
 * Handle non-GET requests (POST, PUT, DELETE)
 */
export async function handleNonGetRequest(endpoint: any, payload: any, apiKey: string, baseUrl: string): Promise<QueryResult> {
  logRequest(endpoint, payload);
  
  try {
    let url = `${baseUrl}${endpoint.route}`;
    
    // For some endpoints, we need to add query parameters
    if (endpoint.method === "POST" && endpoint.route.includes("/publishers")) {
      // Handle publisher assignment to campaigns
      if (payload.publisherId && endpoint.route.includes("/campaign/")) {
        // Query parameter for publisher ID in campaign assignment
        url += `?publisherId=${payload.publisherId}`;
      }
      // Handle adding publishers to lists
      else if (payload.PublisherId && endpoint.route.includes("/list/")) {
        // This is handled in the request body
      }
    }
    
    console.log(`Making ${endpoint.method} request to: ${url}`);
    console.log(`Request payload:`, JSON.stringify(payload, null, 2));
    
    const requestOptions: RequestInit = {
      method: endpoint.method,
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    };
    
    // Add body for POST and PUT requests
    if ((endpoint.method === "POST" || endpoint.method === "PUT") && payload) {
      requestOptions.body = JSON.stringify(payload);
    }
    
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${endpoint.method} request failed:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // Some APIs return empty responses for successful operations
      data = { success: true, message: "Operation completed successfully" };
    }
    
    console.log(`${endpoint.method} request successful for ${endpoint.name}:`, data);
    
    // Add operation metadata for tracking
    const operationData = {
      ...data,
      operation: {
        successful: true,
        type: endpoint.name,
        details: `${endpoint.name} completed successfully`,
        timestamp: new Date().toISOString()
      }
    };
    
    // For message sending operations, add publisher context
    if (endpoint.route.includes("/messages")) {
      const publisherId = endpoint.route.match(/\/publishers\/(\d+)\/messages/)?.[1];
      if (publisherId) {
        operationData.publisherId = publisherId;
        operationData.operation.details += ` (Publisher ID: ${publisherId})`;
      }
    }
    
    // For list operations, add list context
    if (endpoint.route.includes("/lists") && data.List) {
      operationData.listId = data.List.Id;
      operationData.listName = data.List.Name;
    }
    
    return createSuccessResult(endpoint, operationData);
    
  } catch (error) {
    console.error(`Error in ${endpoint.method} request for ${endpoint.name}:`, error);
    return createErrorResult(endpoint, error);
  }
}
