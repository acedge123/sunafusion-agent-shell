
// Main entry point for Creator IQ integration
// This file is a thin wrapper that exports all functionality from the modular files

import { determineCreatorIQEndpoints } from './creatorIQ/endpointDeterminer.ts';
import { buildCreatorIQPayload } from './creatorIQ/payloadBuilder.ts';
import { queryCreatorIQEndpoint } from './creatorIQ/endpointQuerier.ts';

// Re-export the main functions
export { determineCreatorIQEndpoints, buildCreatorIQPayload, queryCreatorIQEndpoint };
