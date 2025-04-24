
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { TaskInput } from "./TaskInput";
import { ToolSelector } from "./ToolSelector";
import { ReasoningControls } from "./ReasoningControls";
import { TaskResults } from "./TaskResults";

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
  const [selectedTools, setSelectedTools] = useState<string[]>(["web_search", "file_search", "file_analysis"]);
  const [reasoningLevel, setReasoningLevel] = useState<"low" | "medium" | "high">("medium");
  const { toast } = useToast();
  const resultRef = useRef<HTMLDivElement>(null);

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const runTask = async (task: string) => {
    if (!task.trim() || isProcessing) return;
    setIsProcessing(true);
    setResult(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const authToken = sessionData?.session?.access_token;
      const providerToken = sessionData?.session?.provider_token;
      
      let storedToken = null;
      if (!providerToken && sessionData?.session?.user) {
        const { data: tokenData } = await supabase
          .from('google_drive_access')
          .select('access_token')
          .eq('user_id', sessionData.session.user.id)
          .maybeSingle();
          
        storedToken = tokenData?.access_token;
      }

      const includeDrive = selectedTools.includes("file_search") || selectedTools.includes("file_analysis");
      if (includeDrive && !providerToken && !storedToken) {
        toast({
          variant: "default",
          title: "Google Drive Access Required",
          description: "Your task involves Google Drive but you're not connected. Please connect your Google Drive first."
        });
      }

      const response = await supabase.functions.invoke('unified-agent', {
        body: {
          query: task,
          conversation_history: [],
          include_web: selectedTools.includes("web_search"),
          include_drive: includeDrive,
          provider_token: providerToken || storedToken,
          task_mode: true,
          tools: selectedTools,
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
      
      const driveSource = response.data.sources?.find(source => source.source === "google_drive");
      if (driveSource && driveSource.error) {
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
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
      console.error("Task execution error:", error);
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
            />
          )}
          
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
        <Card>
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
