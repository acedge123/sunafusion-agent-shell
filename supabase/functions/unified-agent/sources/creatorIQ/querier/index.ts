
import { handleGetRequest } from './getRequests.ts';
import { executeNonGetRequest } from './nonGetRequests.ts';
import type { EndpointType, QueryPayload } from './types.ts';

export async function executeQuery(
  endpoint: EndpointType,
  payload: QueryPayload,
  apiKey: string
): Promise<any> {
  console.log(`Executing ${endpoint.method} request to ${endpoint.name}`);
  
  try {
    if (endpoint.method === 'GET') {
      return await handleGetRequest(endpoint, payload, apiKey);
    } else {
      return await executeNonGetRequest(endpoint, payload, apiKey);
    }
  } catch (error) {
    console.error(`Error executing ${endpoint.name} query:`, error);
    throw error;
  }
}

// Re-export other functions
export { handleGetRequest } from './getRequests.ts';
export { executeNonGetRequest } from './nonGetRequests.ts';
