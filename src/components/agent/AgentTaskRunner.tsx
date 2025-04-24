
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { CornerDownLeft, Loader2, Send, Sparkles, Wrench, Brain, Search, FileSearch, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { v4 as uuidv4 } from "uuid";

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
  const [task, setTask] = useState(initialTask);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>(["web_search", "file_search", "file_analysis"]);
  const [reasoningLevel, setReasoningLevel] = useState<"low" | "medium" | "high">("medium");
  const [activeTab, setActiveTab] = useState("answer");
  const { toast } = useToast();
  const { user } = useAuth();
  const resultRef = useRef<HTMLDivElement>(null);

  // Tool options
  const availableTools = [
    { id: "web_search", name: "Web Search", icon: <Search className="h-4 w-4" /> },
    { id: "file_search", name: "Drive Search", icon: <FileSearch className="h-4 w-4" /> },
    { id: "file_analysis", name: "File Analysis", icon: <FileText className="h-4 w-4" /> },
  ];

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const runTask = async () => {
    if (!task.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setResult(null);

    try {
      // Get the current session for the auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const authToken = sessionData?.session?.access_token;
      const providerToken = sessionData?.session?.provider_token;
      
      // If no provider token in session, try to get from database
      let storedToken = null;
      if (!providerToken && sessionData?.session?.user) {
        try {
          const { data: tokenData } = await supabase
            .from('google_drive_access')
            .select('access_token')
            .eq('user_id', sessionData.session.user.id)
            .maybeSingle();
            
          storedToken = tokenData?.access_token;
          console.log("Retrieved stored token from database:", !!storedToken);
        } catch (dbError) {
          console.error("Error retrieving token from database:", dbError);
        }
      }

      // Call the unified-agent function with task mode enabled
      const response = await supabase.functions.invoke('unified-agent', {
        body: {
          query: task,
          conversation_history: [],
          include_web: true,
          include_drive: true,
          provider_token: providerToken || storedToken,
          task_mode: true,
          tools: selectedTools,
          allow_iterations: true,
          max_iterations: 5,
          reasoning_level: reasoningLevel,
          debug_token_info: {
            hasProviderToken: !!providerToken,
            hasStoredToken: !!storedToken,
            userHasSession: !!sessionData?.session
          }
        },
        headers: authToken ? {
          Authorization: `Bearer ${authToken}`
        } : undefined
      });

      if (response.error) throw response.error;
      
      setResult(response.data);
      
      // Store provider token if present
      if (providerToken && sessionData?.session?.user?.id) {
        try {
          await supabase
            .from('google_drive_access')
            .upsert({
              user_id: sessionData.session.user.id,
              access_token: providerToken,
              token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
        } catch (storeError) {
          console.error("Error storing token:", storeError);
        }
      }
      
      // Scroll to results
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      runTask();
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
        <CardContent>
          <Textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your task in detail... (e.g., 'Find recent articles about climate change and summarize the main points')"
            disabled={isProcessing}
            className="min-h-[120px] mb-4"
          />
          
          {showToolSelection && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Tools to use:</div>
              <div className="flex flex-wrap gap-2">
                {availableTools.map(tool => (
                  <Badge 
                    key={tool.id}
                    variant={selectedTools.includes(tool.id) ? "default" : "outline"} 
                    className="cursor-pointer"
                    onClick={() => toggleTool(tool.id)}
                  >
                    <span className="mr-1">{tool.icon}</span>
                    {tool.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {showReasoningControls && (
            <div>
              <div className="text-sm font-medium mb-2">Thinking level:</div>
              <div className="flex items-center gap-2">
                <Button 
                  variant={reasoningLevel === "low" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReasoningLevel("low")}
                  className="flex items-center gap-1"
                >
                  <Brain className="h-4 w-4" />
                  Basic
                </Button>
                <Button 
                  variant={reasoningLevel === "medium" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReasoningLevel("medium")}
                  className="flex items-center gap-1"
                >
                  <Brain className="h-4 w-4" />
                  Standard
                </Button>
                <Button 
                  variant={reasoningLevel === "high" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReasoningLevel("high")}
                  className="flex items-center gap-1"
                >
                  <Brain className="h-4 w-4" />
                  Detailed
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={runTask} 
            disabled={!task.trim() || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running task...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Run Task
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Card ref={resultRef}>
          <CardHeader>
            <CardTitle>Task Results</CardTitle>
            <CardDescription>
              {result.tools_used && result.tools_used.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
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
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentTaskRunner;
