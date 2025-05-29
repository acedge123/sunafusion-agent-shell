
import { executeQuery } from './querier/index.ts';
import { buildPayload } from './payloadBuilder.ts';
import type { EndpointType } from './querier/types.ts';

export async function queryCreatorIQEndpoint(
  endpoint: EndpointType,
  query: string,
  apiKey: string,
  params?: any
): Promise<any> {
  try {
    console.log(`Querying Creator IQ endpoint: ${endpoint.name}`);
    
    const payload = buildPayload(query, params);
    const result = await executeQuery(endpoint, payload, apiKey);
    
    return result;
  } catch (error) {
    console.error(`Error querying Creator IQ endpoint ${endpoint.name}:`, error);
    throw error;
  }
}
