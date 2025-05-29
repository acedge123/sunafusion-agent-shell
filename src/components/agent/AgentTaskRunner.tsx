
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useGoogleDrive } from "@/hooks/useGoogleDrive";
import { TaskInput } from "./TaskInput";
import { TaskConfigurationPanel } from "./TaskConfigurationPanel";
import { TaskResultsContainer } from "./TaskResultsContainer";
import { useTaskExecutor } from "./TaskExecutor";

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
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [reasoningLevel, setReasoningLevel] = useState<"low" | "medium" | "high">("medium");
  const [driveError, setDriveError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, initiateAuth } = useGoogleDrive();

  const { executeTask } = useTaskExecutor({
    selectedTools,
    reasoningLevel,
    onResult: (taskResult) => {
      setResult(taskResult);
      if (taskResult && resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    },
    onDriveError: setDriveError,
    onProcessingChange: setIsProcessing
  });

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
          <TaskConfigurationPanel
            selectedTools={selectedTools}
            onToolToggle={toggleTool}
            driveConnected={isAuthenticated}
            reasoningLevel={reasoningLevel}
            onReasoningLevelChange={setReasoningLevel}
            driveError={driveError}
            onDriveReconnect={handleDriveReconnect}
            showToolSelection={showToolSelection}
            showReasoningControls={showReasoningControls}
          />
          
          <TaskInput
            onSubmit={executeTask}
            isProcessing={isProcessing}
            initialTask={initialTask}
          />
        </CardContent>
      </Card>

      <div ref={resultRef}>
        <TaskResultsContainer result={result} />
      </div>
    </div>
  );
};

export default AgentTaskRunner;
