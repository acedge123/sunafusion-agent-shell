
import { EndpointType, QueryPayload, CreatorIQResponse } from './types.ts';
import { executePostRequest, executePatchRequest, executeDeleteRequest } from './utils.ts';

export async function executeNonGetRequest(
  endpoint: EndpointType,
  payload: QueryPayload,
  apiKey: string
): Promise<CreatorIQResponse> {
  try {
    console.log(`Executing ${endpoint.method} request to: ${endpoint.path}`);
    
    let response;
    
    switch (endpoint.method.toUpperCase()) {
      case 'POST':
        response = await executePostRequest(endpoint.path, payload, apiKey);
        break;
      case 'PATCH':
        response = await executePatchRequest(endpoint.path, payload, apiKey);
        break;
      case 'DELETE':
        response = await executeDeleteRequest(endpoint.path, payload, apiKey);
        break;
      default:
        throw new Error(`Unsupported method: ${endpoint.method}`);
    }
    
    console.log(`${endpoint.method} request successful, received data:`, response);
    
    return {
      data: response,
      status: 200
    };
  } catch (error) {
    console.error(`Error in ${endpoint.method} request:`, error);
    return {
      error: `${endpoint.method} request error: ${error.message}`,
      status: 500
    };
  }
}

export async function processNonGetResponse(response: any): Promise<any> {
  // Process the response data
  if (response && typeof response === 'object') {
    return response;
  }
  
  return response;
}
