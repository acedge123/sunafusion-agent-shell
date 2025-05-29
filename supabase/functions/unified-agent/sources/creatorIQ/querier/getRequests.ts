
import { EndpointType, QueryPayload, CreatorIQResponse } from './types.ts';
import { executeGetRequest } from './utils.ts';

export async function handleGetRequest(
  endpoint: EndpointType,
  payload: QueryPayload,
  apiKey: string
): Promise<CreatorIQResponse> {
  try {
    console.log(`Executing GET request to: ${endpoint.path}`);
    
    const response = await executeGetRequest(payload, apiKey);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GET request failed: ${response.status} ${errorText}`);
      return {
        error: `Request failed: ${response.status} ${errorText}`,
        status: response.status
      };
    }
    
    const data = await response.json();
    console.log(`GET request successful, received data:`, data);
    
    return {
      data,
      status: response.status
    };
  } catch (error) {
    console.error('Error in GET request:', error);
    return {
      error: `GET request error: ${error.message}`,
      status: 500
    };
  }
}

export async function processGetResponse(response: any): Promise<any> {
  // Process the response data
  if (response && typeof response === 'object') {
    return response;
  }
  
  return response;
}
