// Type definitions for Creator IQ state management

export enum CreatorIQErrorType {
  API_ERROR = 'api_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  NETWORK_ERROR = 'network_error',
  DATA_FORMAT_ERROR = 'data_format_error',
  INCOMPLETE_DATA = 'incomplete_data',
  WRITE_OPERATION_ERROR = 'write_operation_error',
  PUBLISHER_NOT_FOUND = 'publisher_not_found'
}

export interface CreatorIQError {
  type: CreatorIQErrorType;
  message: string;
  originalError?: any;
  isRetryable?: boolean;
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
  DELETE = 'delete',
  ADD = 'add',
  ADD_TO_LIST = 'add_to_list',
  ADD_TO_CAMPAIGN = 'add_to_campaign'
}

export interface CreatorIQPayload {
  [key: string]: any;
}

export interface CreatorIQEndpoint {
  route: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  name: string;
  sourceListId?: string;
  sourceCampaignId?: string;
  targetListId?: string;
  targetCampaignId?: string;
  publisherId?: string;
  [key: string]: any;
}

export interface CreatorIQWriteOperation {
  type: 'create_list' | 'update_publisher' | 'add_publisher_to_list' | 'add_publisher_to_campaign' | 'send_message';
  payload: CreatorIQPayload;
  targetId?: string;
}

export interface PaginationMetadata {
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMetadata;
  _metadata?: {
    source: 'cache' | 'db' | 'api' | 'none' | 'error';
    isFresh?: boolean;
    error?: string;
    timestamp?: number;
  };
}
