
import { EndpointType, QueryPayload, CreatorIQResponse } from './types.ts';
import { executeGetRequest } from './utils.ts';

export async function handleGetRequest(
  endpoint: EndpointType,
  payload: QueryPayload,
  apiKey: string
): Promise<CreatorIQResponse> {
  try {
    console.log(`Executing GET request to: ${endpoint.path}`);
    
    const response = await executeGetRequest(endpoint.path, payload, apiKey);
    
    console.log(`GET request successful, received data:`, response);
    
    return {
      data: response,
      status: 200
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
