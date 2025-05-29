
// This file is a wrapper for the modular payload system
// Import from the modular payload system
import { buildPayload as buildModularPayload } from './payload/index.ts';

// Re-export the main function with the original name
export function buildCreatorIQPayload(endpoint: any, query: string, params: any = {}, previousState: any = null) {
  return buildModularPayload(endpoint, query, params, previousState);
}
