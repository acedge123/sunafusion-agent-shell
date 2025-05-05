
// This file is now a re-export wrapper for backwards compatibility
// Import from the modular payload system
import { buildPayload } from './payload/index.ts';

// Re-export the main function with the original name
export function buildCreatorIQPayload(endpoint: any, query: string, params: any = {}, previousState: any = null) {
  return buildPayload(endpoint, query, params, previousState);
}
