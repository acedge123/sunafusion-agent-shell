/**
 * Service for calling the backend agentpress API (heavy tasks)
 */

import { supabase } from "@/integrations/supabase/client";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

export interface BackendAgentStartRequest {
  model_name?: string;
  enable_thinking?: boolean;
  reasoning_effort?: 'low' | 'medium' | 'high';
  stream?: boolean;
  enable_context_manager?: boolean;
}

export interface BackendAgentResponse {
  agent_run_id: string;
  status: string;
}

export interface StreamMessage {
  type: string;
  status?: string;
  message?: string;
  content?: string;
  [key: string]: any;
}

/**
 * Start a backend agent run
 */
export async function startBackendAgent(
  prompt: string,
  options: BackendAgentStartRequest = {}
): Promise<BackendAgentResponse> {
  const { data: sessionData } = await supabase.auth.getSession();
  const authToken = sessionData?.session?.access_token;

  if (!authToken) {
    throw new Error("Authentication required for backend agent");
  }

  // Build form data
  const formData = new FormData()
  formData.append('prompt', prompt)
  formData.append('model_name', options.model_name || 'anthropic/claude-3-7-sonnet-latest')
  formData.append('enable_thinking', String(options.enable_thinking || false))
  formData.append('reasoning_effort', options.reasoning_effort || 'low')
  formData.append('stream', String(options.stream !== false))
  formData.append('enable_context_manager', String(options.enable_context_manager || false))

  const response = await fetch(`${BACKEND_API_URL}/agent/initiate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      // Don't set Content-Type - browser will set it with boundary for FormData
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `Backend agent failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Stream agent run responses
 */
export async function streamBackendAgent(
  agentRunId: string,
  onMessage: (message: StreamMessage) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const authToken = sessionData?.session?.access_token;

  if (!authToken) {
    throw new Error("Authentication required for backend agent");
  }

  try {
    const response = await fetch(
      `${BACKEND_API_URL}/agent-run/${agentRunId}/stream?token=${encodeURIComponent(authToken)}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Stream failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete?.();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            onMessage(data);
          } catch (e) {
            console.error('Failed to parse SSE message:', e);
          }
        }
      }
    }
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Normalize backend agent stream response to unified message format
 */
export function normalizeBackendResponse(streamMessage: StreamMessage): {
  content?: string;
  role: 'assistant' | 'user' | 'system';
  type?: string;
} | null {
  // Backend sends various message types
  if (streamMessage.type === 'status') {
    if (streamMessage.status === 'completed') {
      return null; // Completion signal, not a message
    }
    // Status messages become assistant messages
    return {
      content: streamMessage.message || streamMessage.status || '',
      role: 'assistant',
      type: 'status'
    };
  }

  if (streamMessage.content) {
    return {
      content: streamMessage.content,
      role: 'assistant',
      type: streamMessage.type
    };
  }

  // Fallback: try to extract any text content
  if (streamMessage.message) {
    return {
      content: streamMessage.message,
      role: 'assistant',
      type: streamMessage.type
    };
  }

  return null;
}
