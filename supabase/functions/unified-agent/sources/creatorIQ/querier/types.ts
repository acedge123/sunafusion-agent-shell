
export interface EndpointType {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  requiresAuth: boolean;
  supportedQueries: string[];
}

export interface QueryPayload {
  method: string;
  path: string;
  queryParams?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
}

export interface CreatorIQResponse {
  data?: any;
  error?: string;
  status?: number;
}
