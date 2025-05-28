
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
    
    console.log(`Preparing ${endpoint.method} request to: ${url}`);
    console.log(`Request payload:`, JSON.stringify(payload, null, 2));
    console.log(`Endpoint details:`, JSON.stringify(endpoint, null, 2));
    
    // For some endpoints, we need to add query parameters
    if (endpoint.method === "POST" && endpoint.route.includes("/publishers")) {
      // Handle publisher assignment to campaigns
      if (payload.publisherId && endpoint.route.includes("/campaign")) {
        // Query parameter for publisher ID in campaign assignment
        url += `?publisherId=${payload.publisherId}`;
        console.log(`Added publisherId query param for campaign assignment: ${url}`);
      }
      // Handle adding publishers to lists - this should NOT have query params, just body
      else if (payload.PublisherId && endpoint.route.includes("/list")) {
        console.log(`Adding publishers to list - payload will be sent in request body`);
      }
    }
    
    console.log(`Final URL for ${endpoint.method} request: ${url}`);
    
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
      console.log(`Request body set:`, requestOptions.body);
    }
    
    console.log(`Making ${endpoint.method} request with options:`, {
      method: requestOptions.method,
      headers: requestOptions.headers,
      bodyLength: requestOptions.body ? requestOptions.body.length : 0
    });
    
    const response = await fetch(url, requestOptions);
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${endpoint.method} request failed with status ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    let data;
    try {
      const responseText = await response.text();
      console.log(`Raw response text:`, responseText);
      
      if (responseText.trim()) {
        data = JSON.parse(responseText);
        console.log(`Parsed response data:`, JSON.stringify(data, null, 2));
      } else {
        // Some APIs return empty responses for successful operations
        data = { success: true, message: "Operation completed successfully" };
        console.log(`Empty response, assuming success`);
      }
    } catch (parseError) {
      console.error(`Failed to parse response:`, parseError);
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
        timestamp: new Date().toISOString(),
        url: url,
        method: endpoint.method,
        payloadSent: payload
      }
    };
    
    // For adding publishers to lists, add specific context
    if (endpoint.route.includes("/lists") && endpoint.route.includes("/publishers") && endpoint.method === "POST") {
      const listIdMatch = endpoint.route.match(/\/lists\/(\d+)\/publishers/);
      if (listIdMatch) {
        operationData.listId = listIdMatch[1];
        operationData.operation.details += ` (List ID: ${listIdMatch[1]})`;
      }
      if (payload.PublisherId && Array.isArray(payload.PublisherId)) {
        operationData.publisherIds = payload.PublisherId;
        operationData.operation.details += ` (Publisher IDs: ${payload.PublisherId.join(', ')})`;
      }
    }
    
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
