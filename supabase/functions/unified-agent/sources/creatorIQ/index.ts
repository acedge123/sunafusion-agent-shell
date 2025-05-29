
// Re-export all the main functionality
export { searchCreatorIQ } from './endpointQuerier.ts';
export { determineEndpoint } from './endpointDeterminer.ts';
export { buildPayload } from './payloadBuilder.ts';
export { processResponse } from './responseProcessor.ts';
export { extractTextFromQuery } from './textExtractors.ts';

// Export a default search function for compatibility
export default async function searchCreatorIQData(query: string, authToken?: string) {
  return await searchCreatorIQ(query, authToken);
}
