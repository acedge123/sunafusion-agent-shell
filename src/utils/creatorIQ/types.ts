
// Type definitions for Creator IQ state management

export enum CreatorIQErrorType {
  API_ERROR = 'api_error',
  DATA_FORMAT_ERROR = 'data_format_error',
  AUTHENTICATION_ERROR = 'auth_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error',
  INCOMPLETE_DATA = 'incomplete_data'
}

export interface CreatorIQError {
  type: CreatorIQErrorType;
  message: string;
  originalError?: any;
  retryCount?: number;
  isRetryable: boolean;
}

export interface CreatorIQState {
  campaigns?: any[];
  publishers?: any[];
  lists?: any[];
  operationResults?: any[];
  context?: string;
  lastUpdated?: string;
}

export interface CreatorIQOperationResult {
  successful: boolean;
  type: string;
  details: string;
  id?: string;
  name?: string;
  timestamp: string;
}

export enum CreatorIQOperationType {
  READ = 'read',
  WRITE = 'write',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}

export interface CreatorIQPayload {
  [key: string]: any;
}

export interface CreatorIQEndpoint {
  route: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  name: string;
  [key: string]: any;
}
