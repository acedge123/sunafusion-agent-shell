
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGoogleDrive } from "@/hooks/useGoogleDrive";
import { TaskInput } from "./TaskInput";
import { ToolSelector } from "./ToolSelector";
import { ReasoningControls } from "./ReasoningControls";
import { TaskResults } from "./TaskResults";
import { DriveErrorAlert } from "@/components/drive/error/DriveErrorAlert";
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

interface AgentTaskRunnerProps {
  initialTask?: string;
  showToolSelection?: boolean;
  showReasoningControls?: boolean;
}

const AgentTaskRunner = ({
  initialTask = "",
  showToolSelection = true,
  showReasoningControls = true
}: AgentTaskRunnerProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>(["web_search", "file_search", "file_analysis", "product_feed_search", "creator_iq"]);
  const [reasoningLevel, setReasoningLevel] = useState<"low" | "medium" | "high">("medium");
  const [driveError, setDriveError] = useState<string | null>(null);
  const { toast } = useToast();
  const resultRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { getToken, isAuthenticated, initiateAuth } = useGoogleDrive();

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleDriveReconnect = () => {
    setDriveError(null);
    initiateAuth();
  };

  const runTask = async (task: string) => {
    if (!task.trim() || isProcessing) return;
    setIsProcessing(true);
    setResult(null);
    setDriveError(null);

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
            setDriveError("Your Google Drive connection is invalid or has insufficient permissions.");
            toast({
              variant: "default",
              title: "Google Drive Access Required",
              description: "Your task involves Google Drive but your connection is invalid. Please reconnect Google Drive first."
            });
            
            if (!token) {
              setIsProcessing(false);
              return;
            }
          }
          
          driveToken = token;
        } catch (error) {
          const parsedError = parseGoogleDriveError(error);
          console.error("Drive token error:", parsedError);
          
          if (parsedError.type === GoogleDriveErrorType.AUTH_ERROR) {
            setDriveError("Google Drive authentication failed. Please reconnect your account.");
          } else {
            setDriveError(parsedError.message);
          }
          
          // If Drive is essential but we can't get a token, abort
          if (includeDrive && (!selectedTools.includes("web_search") || task.toLowerCase().includes("drive"))) {
            displayDriveError(parsedError);
            setIsProcessing(false);
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
      
      setResult(response.data);
      
      // Handle Drive-specific errors from the response
      const driveSource = response.data.sources?.find(source => source.source === "google_drive");
      if (driveSource && driveSource.error) {
        setDriveError(driveSource.error);
        toast({
          variant: "default",
          title: "Google Drive Access Issue",
          description: "There was an issue accessing your Google Drive. Try reconnecting your account."
        });
      }
      
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth' });
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
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Task Runner
          </CardTitle>
          <CardDescription>
            Describe your task and the agent will execute it using available tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showToolSelection && (
            <ToolSelector 
              selectedTools={selectedTools}
              onToolToggle={toggleTool}
              driveConnected={isAuthenticated}
            />
          )}
          
          <DriveErrorAlert 
            error={driveError} 
            onReconnect={handleDriveReconnect}
          />
          
          {showReasoningControls && (
            <ReasoningControls
              reasoningLevel={reasoningLevel}
              onLevelChange={setReasoningLevel}
            />
          )}
          
          <TaskInput
            onSubmit={runTask}
            isProcessing={isProcessing}
            initialTask={initialTask}
          />
        </CardContent>
      </Card>

      {result && (
        <Card ref={resultRef}>
          <CardHeader>
            <CardTitle>Task Results</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskResults result={result} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentTaskRunner;
