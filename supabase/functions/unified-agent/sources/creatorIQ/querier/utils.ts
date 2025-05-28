
// Utility functions for Creator IQ querier
import { CreatorIQEndpoint, QueryResult } from './types.ts';

/**
 * Create a standardized error result
 */
export function createErrorResult(
  endpoint: CreatorIQEndpoint,
  error: string | Error,
  details?: any
): QueryResult {
  const errorMessage = error instanceof Error ? error.message : error;
  
  return {
    endpoint: endpoint.route,
    method: endpoint.method,
    name: endpoint.name,
    error: errorMessage,
    details: details ? JSON.stringify(details) : undefined,
    data: null
  };
}

/**
 * Create a standardized success result
 */
export function createSuccessResult(
  endpoint: CreatorIQEndpoint,
  data: any
): QueryResult {
  return {
    endpoint: endpoint.route,
    method: endpoint.method,
    name: endpoint.name,
    data,
    error: undefined
  };
}

/**
 * Log request information for debugging
 */
export function logRequest(endpoint: CreatorIQEndpoint, payload?: any) {
  console.log(`Querying ${endpoint.method} ${endpoint.route}`, {
    name: endpoint.name,
    payload: payload ? JSON.stringify(payload) : 'No payload'
  });
}

/**
 * Validate endpoint configuration
 */
export function validateEndpoint(endpoint: CreatorIQEndpoint): boolean {
  return !!(endpoint.route && endpoint.method && endpoint.name);
}
