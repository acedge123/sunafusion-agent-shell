
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGoogleDrive } from "@/hooks/useGoogleDrive";

interface TaskResult {
  answer: string;
  reasoning?: string;
  steps_taken?: Array<{
    step: number;
    action: string;
    result: string;
  }>;
  tools_used?: string[];
  sources?: any[];
}

interface UseTaskExecutorProps {
  selectedTools: string[];
  reasoningLevel: "low" | "medium" | "high";
  onResult: (result: TaskResult | null) => void;
  onDriveError: (error: string | null) => void;
  onProcessingChange: (isProcessing: boolean) => void;
}

export const useTaskExecutor = ({
  selectedTools,
  reasoningLevel,
  onResult,
  onDriveError,
  onProcessingChange
}: UseTaskExecutorProps) => {
  const { getValidToken } = useGoogleDrive();

  const executeTask = async (task: string) => {
    if (!task.trim()) return;

    console.log('=== Task Execution Debug ===');
    console.log('Task:', task);
    console.log('Selected tools:', selectedTools);
    console.log('Reasoning level:', reasoningLevel);
    console.log('Tools count:', selectedTools.length);

    onProcessingChange(true);
    onResult(null);
    onDriveError(null);

    try {
      // Get auth session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Failed to get authentication session");
      }

      const authToken = sessionData?.session?.access_token;
      let providerToken = null;

      // Check if Google Drive tools are selected
      const driveToolsSelected = selectedTools.some(tool => 
        tool === 'file_search' || tool === 'file_analysis'
      );

      if (driveToolsSelected) {
        console.log('Drive tools selected, getting provider token...');
        try {
          providerToken = await getValidToken();
          console.log('Provider token obtained:', !!providerToken);
        } catch (error) {
          console.error('Failed to get provider token:', error);
          onDriveError("Google Drive authentication failed. Please reconnect your Google account.");
          return;
        }
      }

      // Build the request payload
      const payload = {
        query: task,
        conversation_history: [],
        task_mode: true,
        tools: selectedTools,
        allow_iterations: true,
        max_iterations: 3,
        reasoning_level: reasoningLevel,
        // Enable sources based on selected tools
        include_web: selectedTools.includes('web_search'),
        include_drive: selectedTools.includes('file_search') || selectedTools.includes('file_analysis'),
        include_product_feeds: selectedTools.includes('product_feed_search'),
        include_creator_iq: selectedTools.includes('creator_iq'),
        provider_token: providerToken
      };

      console.log('Request payload:', {
        ...payload,
        provider_token: !!payload.provider_token // Don't log the actual token
      });

      // Make the request to the unified-agent function
      const response = await supabase.functions.invoke('unified-agent', {
        body: payload,
        headers: authToken ? {
          Authorization: `Bearer ${authToken}`
        } : undefined
      });

      console.log('Response received:', {
        error: response.error,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : []
      });

      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(response.error.message || "Failed to execute task");
      }

      const result = response.data;
      console.log('Task result:', {
        hasAnswer: !!result?.answer,
        hasReasoning: !!result?.reasoning,
        stepsCount: result?.steps_taken?.length || 0,
        toolsUsed: result?.tools_used || [],
        sourcesCount: result?.sources?.length || 0
      });

      onResult(result);
    } catch (error) {
      console.error("Error executing task:", error);
      onResult({
        answer: `I encountered an error while executing your task: ${error.message}. Please try again or contact support if the issue persists.`,
        reasoning: "An error occurred during task execution.",
        steps_taken: [],
        tools_used: selectedTools,
        sources: []
      });
    } finally {
      onProcessingChange(false);
    }
  };

  return { executeTask };
};
