
// This file is now a re-export wrapper for backwards compatibility
// Import from the modular endpoint system
import { determineCreatorIQEndpoints as determineEndpoints } from './endpoint/index.ts';

// Re-export the main function with the original name
export function determineCreatorIQEndpoints(query: string, previousState: any = null) {
  return determineEndpoints(query, previousState);
}
