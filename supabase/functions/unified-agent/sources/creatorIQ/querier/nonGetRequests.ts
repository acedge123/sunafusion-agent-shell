
// Handlers for non-GET requests (POST, PUT, DELETE)
import { processResponseMetadata } from '../responseProcessor.ts';
import { createErrorResponse, createPublisherNotFoundError } from './utils.ts';
import { QueryResult } from './types.ts';

/**
 * Handle POST, PUT and DELETE requests
 */
export async function handleNonGetRequest(
  endpoint: any, 
  payload: any,
  apiKey: string,
  baseUrl: string
): Promise<QueryResult> {
  try {
    const url = `${baseUrl}${endpoint.route}`;
    console.log(`Making ${endpoint.method} request to ${url} with payload:`, payload);
    
    // Set up headers for API request
    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };
    
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
        return createPublisherNotFoundError(endpoint);
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
    return createErrorResponse(endpoint, error);
  }
}
