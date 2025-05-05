
// Main entry point for Creator IQ integration
// This file is a thin wrapper that exports all functionality from the modular files

import { 
  determineCreatorIQEndpoints, 
  buildCreatorIQPayload, 
  queryCreatorIQEndpoint,
  processResponseMetadata,
  extractListNameFromQuery,
  extractStatusFromQuery,
  extractMessageFromQuery,
  processCreatorIQQuery
} from './creatorIQ/index.ts';

// Re-export the main functions
export { 
  determineCreatorIQEndpoints, 
  buildCreatorIQPayload, 
  queryCreatorIQEndpoint,
  processResponseMetadata,
  extractListNameFromQuery,
  extractStatusFromQuery,
  extractMessageFromQuery,
  processCreatorIQQuery
};

// For backwards compatibility
export default async function handleCreatorIQQuery(query: string, params: any = {}, previousState: any = null) {
  return await processCreatorIQQuery(query, params, previousState);
}
