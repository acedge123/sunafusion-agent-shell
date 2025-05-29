
import type { QueryPayload } from './querier/types.ts';

export function buildPayload(query: string, params?: any): QueryPayload {
  // Build the payload based on the query and parameters
  const payload: QueryPayload = {
    query_params: {},
    body_params: {},
    path_params: {}
  };

  // Add any additional parameters if provided
  if (params) {
    if (params.query_params) {
      payload.query_params = { ...payload.query_params, ...params.query_params };
    }
    if (params.body_params) {
      payload.body_params = { ...payload.body_params, ...params.body_params };
    }
    if (params.path_params) {
      payload.path_params = { ...payload.path_params, ...params.path_params };
    }
  }

  return payload;
}
