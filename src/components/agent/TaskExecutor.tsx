import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGoogleDrive } from "@/hooks/useGoogleDrive";
import { displayDriveError, GoogleDriveErrorType, parseGoogleDriveError } from "@/utils/googleDriveErrors";

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

interface TaskExecutorProps {
  selectedTools: string[];
  reasoningLevel: "low" | "medium" | "high";
  onResult: (result: TaskResult) => void;
  onDriveError: (error: string) => void;
  onProcessingChange: (isProcessing: boolean) => void;
}

export const useTaskExecutor = ({
  selectedTools,
  reasoningLevel,
  onResult,
  onDriveError,
  onProcessingChange
}: TaskExecutorProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { getToken } = useGoogleDrive();

  const executeTask = async (task: string) => {
    if (!task.trim()) return;
    
    onProcessingChange(true);
    onResult(null as any);
    onDriveError(null as any);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const authToken = sessionData?.session?.access_token;
      
      // Get Google Drive token using our centralized hook
      const includeDrive = selectedTools.includes("file_search") || selectedTools.includes("file_analysis");
      
      let driveToken = null;
      if (includeDrive && user) {
        try {
          const { token, isValid } = await getToken();
          
          if (!isValid) {
            onDriveError("Your Google Drive connection is invalid or has insufficient permissions.");
            toast({
              variant: "default",
              title: "Google Drive Access Required",
              description: "Your task involves Google Drive but your connection is invalid. Please reconnect Google Drive first."
            });
            
            if (!token) {
              onProcessingChange(false);
              return;
            }
          }
          
          driveToken = token;
        } catch (error) {
          const parsedError = parseGoogleDriveError(error);
          console.error("Drive token error:", parsedError);
          
          if (parsedError.type === GoogleDriveErrorType.AUTH_ERROR) {
            onDriveError("Google Drive authentication failed. Please reconnect your account.");
          } else {
            onDriveError(parsedError.message);
          }
          
          // If Drive is essential but we can't get a token, abort
          if (includeDrive && (!selectedTools.includes("web_search") || task.toLowerCase().includes("drive"))) {
            displayDriveError(parsedError);
            onProcessingChange(false);
            return;
          } else {
            // Otherwise, proceed without Drive functionality
            toast({
              title: "Limited Functionality",
              description: "Continuing without Google Drive access. Some results may be limited."
            });
          }
        }
      }

      const response = await supabase.functions.invoke('unified-agent', {
        body: {
          query: task,
          conversation_history: [],
          include_web: selectedTools.includes("web_search"),
          include_drive: includeDrive && driveToken !== null,
          include_product_feeds: selectedTools.includes("product_feed_search"),
          include_creator_iq: selectedTools.includes("creator_iq"),
          provider_token: driveToken,
          task_mode: true,
          tools: selectedTools.filter(tool => {
            // Filter out Drive tools if we don't have a valid token
            if ((tool === "file_search" || tool === "file_analysis") && !driveToken) {
              return false;
            }
            return true;
          }),
          allow_iterations: true,
          max_iterations: 5,
          reasoning_level: reasoningLevel,
        },
        headers: authToken ? {
          Authorization: `Bearer ${authToken}`
        } : undefined
      });

      if (response.error) throw response.error;
      
      onResult(response.data);
      
      // Handle Drive-specific errors from the response
      const driveSource = response.data.sources?.find(source => source.source === "google_drive");
      if (driveSource && driveSource.error) {
        onDriveError(driveSource.error);
        toast({
          variant: "default",
          title: "Google Drive Access Issue",
          description: "There was an issue accessing your Google Drive. Try reconnecting your account."
        });
      }
      
    } catch (error) {
      console.error("Task execution error:", error);
      
      // Try to categorize the error
      const isNetworkError = error instanceof Error && 
        (error.message.includes("network") || error.message.includes("fetch"));
      
      const isServerError = error instanceof Error && 
        (error.message.includes("500") || error.message.includes("server"));
      
      // Show appropriate error message
      toast({
        variant: "destructive",
        title: isNetworkError ? "Network Error" : 
               isServerError ? "Server Error" : "Error",
        description: error instanceof Error ? 
                     error.message : "An unexpected error occurred"
      });
    } finally {
      onProcessingChange(false);
    }
  };

  return { executeTask };
};
