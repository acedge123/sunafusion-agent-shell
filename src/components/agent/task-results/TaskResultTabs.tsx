
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, AlertTriangle } from "lucide-react";
import { Fragment } from "react";

import { TaskResultAnswer } from "./TaskResultAnswer";
import { TaskResultReasoning } from "./TaskResultReasoning";
import { TaskResultSteps } from "./TaskResultSteps";
import { CreatorIQDataPanel } from "./creator-iq/CreatorIQDataPanel";

interface TaskResultTabsProps {
  result: {
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
  };
}

export const TaskResultTabs = ({ result }: TaskResultTabsProps) => {
  // Check if we have Creator IQ data in the sources
  const creatorIQData = result.sources?.find(source => source.source === "creator_iq");
  
  // Determine if there are any errors in Creator IQ data
  const hasCreatorIQErrors = creatorIQData?.error || 
    creatorIQData?.results?.some(result => result.error);
    
  return (
    <Tabs defaultValue="answer">
      <TabsList className="mb-2">
        <TabsTrigger value="answer">Answer</TabsTrigger>
        {result.reasoning && <TabsTrigger value="reasoning">Thinking Process</TabsTrigger>}
        {result.steps_taken && result.steps_taken.length > 0 && (
          <TabsTrigger value="steps">Steps Taken</TabsTrigger>
        )}
        {creatorIQData && creatorIQData.results && creatorIQData.results.length > 0 && (
          <TabsTrigger value="creator_iq_data" className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            Creator IQ Data
            {hasCreatorIQErrors && (
              <AlertTriangle className="h-3 w-3 text-amber-500 ml-1" />
            )}
          </TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="answer" className="mt-0">
        <TaskResultAnswer answer={result.answer} />
      </TabsContent>
      
      {result.reasoning && (
        <TabsContent value="reasoning" className="mt-0">
          <TaskResultReasoning reasoning={result.reasoning} />
        </TabsContent>
      )}
      
      {result.steps_taken && result.steps_taken.length > 0 && (
        <TabsContent value="steps" className="mt-0">
          <TaskResultSteps steps={result.steps_taken} />
        </TabsContent>
      )}
      
      {creatorIQData && creatorIQData.results && creatorIQData.results.length > 0 && (
        <TabsContent value="creator_iq_data" className="mt-0">
          <CreatorIQDataPanel creatorIQData={creatorIQData} />
        </TabsContent>
      )}
    </Tabs>
  );
};
