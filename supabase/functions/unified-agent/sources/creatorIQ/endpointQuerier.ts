
// This file is now a re-export wrapper for backwards compatibility
// Import from the modular querier system
import { queryCreatorIQEndpoint as queryEndpoint } from './querier/index.ts';

// Re-export the main function with the original name
export function queryCreatorIQEndpoint(endpoint: any, payload: any) {
  return queryEndpoint(endpoint, payload);
}
