
import { TaskResultTabs } from "./task-results/TaskResultTabs";
import { ToolsUsedDisplay } from "./task-results/ToolsUsedDisplay";

interface TaskResult {
  answer: string;
  reasoning?: string;
  steps_taken?: Array<{
    step: number;
    action: string;
    result: string;
  }>;
  tools_used?: string[];
  sources?: Array<{
    source: string;
    results: any[];
    error?: string;
  }>;
}

interface TaskResultsProps {
  result: TaskResult;
}

export const TaskResults = ({ result }: TaskResultsProps) => {
  return (
    <div className="space-y-4">
      {result.tools_used && result.tools_used.length > 0 && (
        <ToolsUsedDisplay tools={result.tools_used} />
      )}
      
      <TaskResultTabs result={result} />
    </div>
  );
};
