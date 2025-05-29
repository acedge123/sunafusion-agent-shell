
// Type definitions for endpoint querier
export interface QueryResult {
  endpoint: string;
  method: string;
  name: string;
  data: any;
  error?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface QueryOptions {
  enableAllPages?: boolean;
  maxPages?: number;
  pageSize?: number;
}
