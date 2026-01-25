/**
 * Discriminated union for agent results - provides type safety 
 * without over-specifying unknown API responses
 */
export type AgentResult =
  | { source: "memory"; results: unknown[] }
  | { source: "google_drive"; results?: unknown[]; error?: string; details?: string }
  | { source: "file_analysis"; results: unknown[] }
  | { source: "web_search"; results?: unknown[]; error?: string }
  | { source: "slack"; results?: unknown[]; error?: string; details?: string }
  | { source: "creator_iq"; results?: unknown[]; error?: string; details?: string; state?: unknown };

/**
 * Pagination info extracted from context
 */
export interface PaginationInfo {
  current_page?: number;
  total_pages?: number;
  total_items?: number;
}

/**
 * Task result structure from agent
 */
export interface TaskResult {
  reasoning: string;
  steps: Array<{ step: number; action: string; result: string }>;
  answer: string;
  tools_used: string[];
}
