
export interface EndpointType {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  description?: string;
}

export interface QueryPayload {
  query_params?: Record<string, any>;
  body_params?: Record<string, any>;
  path_params?: Record<string, any>;
}

export interface CreatorIQResponse {
  data?: any;
  error?: string;
  status: number;
}
