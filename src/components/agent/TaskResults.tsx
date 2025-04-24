
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";

interface TaskResult {
  answer: string;
  reasoning?: string;
  steps_taken?: Array<{
    step: number;
    action: string;
    result: string;
  }>;
  tools_used?: string[];
}

interface TaskResultsProps {
  result: TaskResult;
}

export const TaskResults = ({ result }: TaskResultsProps) => {
  return (
    <div className="space-y-4" ref={resultRef}>
      {result.tools_used && result.tools_used.length > 0 && (
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {result.tools_used.map(tool => (
              <Badge key={tool} variant="secondary" className="text-xs">
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <Tabs defaultValue="answer">
        <TabsList className="mb-2">
          <TabsTrigger value="answer">Answer</TabsTrigger>
          {result.reasoning && <TabsTrigger value="reasoning">Thinking Process</TabsTrigger>}
          {result.steps_taken && result.steps_taken.length > 0 && (
            <TabsTrigger value="steps">Steps Taken</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="answer" className="mt-0">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {result.answer.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </TabsContent>
        
        {result.reasoning && (
          <TabsContent value="reasoning" className="mt-0">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {result.reasoning.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </TabsContent>
        )}
        
        {result.steps_taken && result.steps_taken.length > 0 && (
          <TabsContent value="steps" className="mt-0">
            <div className="space-y-4">
              {result.steps_taken.map((step, index) => (
                <div key={index} className="rounded-md border p-4">
                  <h4 className="font-medium">
                    Step {step.step}: {step.action}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.result}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
