
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface TaskResultsContainerProps {
  result: TaskResult | null;
}

export const TaskResultsContainer = ({ result }: TaskResultsContainerProps) => {
  const resultRef = useRef<HTMLDivElement>(null);

  if (!result) return null;

  return (
    <Card ref={resultRef}>
      <CardHeader>
        <CardTitle>Task Results</CardTitle>
      </CardHeader>
      <CardContent>
        <TaskResults result={result} />
      </CardContent>
    </Card>
  );
};
