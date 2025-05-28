
// Handle non-GET requests (POST, PUT, DELETE)
import { logRequest, createErrorResult, createSuccessResult } from './utils.ts';
import { QueryResult } from './types.ts';

/**
 * Validate API key format
 */
function validateApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  // Basic validation - should be a non-empty string
  return apiKey.trim().length > 0;
}

/**
 * Validate endpoint configuration
 */
function validateEndpoint(endpoint: any): string | null {
  if (!endpoint) return "Endpoint is null or undefined";
  if (!endpoint.route) return "Endpoint route is missing";
  if (!endpoint.method) return "Endpoint method is missing";
  if (!endpoint.name) return "Endpoint name is missing";
  
  // Validate route format
  if (typeof endpoint.route !== 'string' || !endpoint.route.startsWith('/')) {
    return "Endpoint route must be a string starting with '/'";
  }
  
  // Validate method
  const validMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!validMethods.includes(endpoint.method.toUpperCase())) {
    return `Invalid HTTP method: ${endpoint.method}. Must be one of: ${validMethods.join(', ')}`;
  }
  
  return null; // No validation errors
}

/**
 * Validate payload for specific operations
 */
function validatePayload(endpoint: any, payload: any): string | null {
  if (!payload) return "Payload is null or undefined";
  
  // Validate publisher addition to lists
  if (endpoint.route.includes('/lists/') && endpoint.route.includes('/publishers') && endpoint.method === 'POST') {
    if (!payload.PublisherId) {
      return "PublisherId is required for adding publishers to lists";
    }
    if (!Array.isArray(payload.PublisherId)) {
      return "PublisherId must be an array";
    }
    if (payload.PublisherId.length === 0) {
      return "PublisherId array cannot be empty";
    }
    // Validate each publisher ID is a number
    for (let i = 0; i < payload.PublisherId.length; i++) {
      const id = payload.PublisherId[i];
      if (!Number.isInteger(id) || id <= 0) {
        return `Invalid publisher ID at index ${i}: ${id}. Must be a positive integer.`;
      }
    }
  }
  
  // Validate campaign publisher assignment
  if (endpoint.route.includes('/campaign/') && endpoint.route.includes('/publishers') && endpoint.method === 'POST') {
    if (!payload.publisherId) {
      return "publisherId is required for campaign publisher assignment";
    }
    if (!Number.isInteger(payload.publisherId) || payload.publisherId <= 0) {
      return "publisherId must be a positive integer";
    }
    if (!payload.status) {
      return "status is required for campaign publisher assignment";
    }
  }
  
  return null; // No validation errors
}

/**
 * Create request with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 30000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log(`=== REQUEST TIMEOUT AFTER ${timeoutMs}ms ===`);
    controller.abort();
  }, timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Handle non-GET requests (POST, PUT, DELETE)
 */
export async function handleNonGetRequest(endpoint: any, payload: any, apiKey: string, baseUrl: string): Promise<QueryResult> {
  console.log(`=== NON-GET REQUEST HANDLER START ===`);
  console.log(`Method: ${endpoint.method}, Route: ${endpoint.route}, Name: ${endpoint.name}`);
  
  logRequest(endpoint, payload);
  
  try {
    // Validate API key
    console.log("=== VALIDATING API KEY ===");
    if (!validateApiKey(apiKey)) {
      console.error("=== API KEY VALIDATION FAILED ===");
      return createErrorResult(endpoint, "Invalid or missing API key");
    }
    console.log("API key validation: ✓ Valid");
    
    // Validate endpoint configuration
    console.log("=== VALIDATING ENDPOINT CONFIGURATION ===");
    const endpointError = validateEndpoint(endpoint);
    if (endpointError) {
      console.error("=== ENDPOINT VALIDATION FAILED ===", endpointError);
      return createErrorResult(endpoint, `Endpoint validation failed: ${endpointError}`);
    }
    console.log("Endpoint validation: ✓ Valid");
    
    // Validate payload
    console.log("=== VALIDATING PAYLOAD ===");
    const payloadError = validatePayload(endpoint, payload);
    if (payloadError) {
      console.error("=== PAYLOAD VALIDATION FAILED ===", payloadError);
      return createErrorResult(endpoint, `Payload validation failed: ${payloadError}`);
    }
    console.log("Payload validation: ✓ Valid");
    
    // Construct URL
    let url = `${baseUrl}${endpoint.route}`;
    console.log(`=== CONSTRUCTING REQUEST URL ===`);
    console.log(`Base URL: ${baseUrl}`);
    console.log(`Route: ${endpoint.route}`);
    console.log(`Initial URL: ${url}`);
    
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
        console.log(`Publisher IDs to add:`, payload.PublisherId);
      }
    }
    
    console.log(`Final URL: ${url}`);
    
    // Prepare request options
    console.log("=== PREPARING REQUEST OPTIONS ===");
    const requestOptions: RequestInit = {
      method: endpoint.method,
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Creator-IQ-Unified-Agent/1.0'
      }
    };
    
    // Add body for POST and PUT requests
    if ((endpoint.method === "POST" || endpoint.method === "PUT") && payload) {
      requestOptions.body = JSON.stringify(payload);
      console.log(`Request body set (${requestOptions.body.length} chars):`, requestOptions.body);
    }
    
    console.log(`Request options:`, {
      method: requestOptions.method,
      headers: requestOptions.headers,
      bodyLength: requestOptions.body ? requestOptions.body.length : 0
    });
    
    // Execute request with timeout
    console.log(`=== EXECUTING ${endpoint.method} REQUEST ===`);
    console.log(`URL: ${url}`);
    console.log(`Timeout: 30 seconds`);
    
    const response = await fetchWithTimeout(url, requestOptions, 30000);
    
    console.log(`=== RESPONSE RECEIVED ===`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    // Check response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`=== ${endpoint.method} REQUEST FAILED ===`);
      console.error(`Status: ${response.status} ${response.statusText}`);
      console.error(`Error response:`, errorText);
      
      // Provide more specific error messages based on status code
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      if (response.status === 400) {
        errorMessage += ` - Bad Request. ${errorText || 'Check payload format and required fields.'}`;
      } else if (response.status === 401) {
        errorMessage += ` - Unauthorized. Check API key.`;
      } else if (response.status === 403) {
        errorMessage += ` - Forbidden. Insufficient permissions.`;
      } else if (response.status === 404) {
        errorMessage += ` - Not Found. Check endpoint URL and resource IDs.`;
      } else if (response.status === 429) {
        errorMessage += ` - Rate Limited. Too many requests.`;
      } else if (response.status >= 500) {
        errorMessage += ` - Server Error. Try again later.`;
      }
      
      if (errorText) {
        errorMessage += ` Response: ${errorText}`;
      }
      
      return createErrorResult(endpoint, new Error(errorMessage));
    }
    
    // Parse response
    console.log("=== PARSING RESPONSE ===");
    let data;
    try {
      const responseText = await response.text();
      console.log(`Raw response text (${responseText.length} chars):`, responseText);
      
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
      console.log(`Parse error, assuming success for 2xx response`);
    }
    
    console.log(`=== ${endpoint.method} REQUEST SUCCESSFUL ===`);
    
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
        payloadSent: payload,
        responseStatus: response.status
      }
    };
    
    // Add specific context based on operation type
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
    
    console.log("=== OPERATION METADATA ADDED ===");
    console.log("Final operation data:", JSON.stringify(operationData.operation, null, 2));
    
    return createSuccessResult(endpoint, operationData);
    
  } catch (error) {
    console.error(`=== ${endpoint.method} REQUEST ERROR ===`);
    console.error(`Error type: ${error.constructor.name}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack:`, error.stack);
    
    // Enhance error message with context
    let enhancedMessage = error.message;
    if (error.message.includes('timeout')) {
      enhancedMessage = `Request timed out - the Creator IQ API may be slow or unavailable. ${error.message}`;
    } else if (error.message.includes('network')) {
      enhancedMessage = `Network error - check internet connection and Creator IQ API availability. ${error.message}`;
    } else if (error.message.includes('abort')) {
      enhancedMessage = `Request was aborted - possible timeout or cancellation. ${error.message}`;
    }
    
    return createErrorResult(endpoint, new Error(enhancedMessage));
  }
}
