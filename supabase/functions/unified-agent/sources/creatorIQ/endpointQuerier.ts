
import { determineEndpoint } from './endpointDeterminer.ts';
import { buildPayload } from './payloadBuilder.ts';
import { processResponse } from './responseProcessor.ts';
import { executeQuery } from './querier/index.ts';

export async function searchCreatorIQ(
  query: string,
  authToken?: string
): Promise<{ source: string; results: any[]; error?: string }> {
  console.log('Searching Creator IQ for query:', query);
  
  if (!authToken) {
    return {
      source: 'creator_iq',
      results: [],
      error: 'Authentication required to access Creator IQ'
    };
  }

  try {
    const apiKey = Deno.env.get('CREATOR_IQ_API_KEY');
    
    if (!apiKey) {
      throw new Error('Creator IQ API key not configured');
    }

    // Determine which endpoint to use based on the query
    const endpoint = determineEndpoint(query);
    console.log('Determined endpoint:', endpoint);

    // Build the payload for the request
    const payload = buildPayload(query, endpoint);
    console.log('Built payload:', payload);

    // Execute the query
    const response = await executeQuery(endpoint, payload, apiKey);
    console.log('Raw response:', response);

    // Process the response
    const processedResults = processResponse(response, endpoint);
    console.log('Processed results:', processedResults);

    return {
      source: 'creator_iq',
      results: processedResults
    };

  } catch (error) {
    console.error('Error in searchCreatorIQ:', error);
    return {
      source: 'creator_iq',
      results: [],
      error: `Creator IQ search error: ${error.message}`
    };
  }
}
