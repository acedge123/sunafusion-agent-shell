
import React, { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import AgentTaskRunner from "@/components/agent/AgentTaskRunner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, ListChecks, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import ChatContainer, { Message } from "@/components/chat/ChatContainer";
import { Link } from "react-router-dom";

const Agent = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("task");
  const [taskExamples] = useState([
    "Research the latest advancements in renewable energy and create a summary of the most promising technologies",
    "Find information about climate change impacts in coastal areas and compile the key findings",
    "Search for articles about machine learning applications in healthcare and identify the top trends",
    "Look through my Google Drive files related to project management and summarize the key points",
    "Find influencer campaigns in Creator IQ with engagement rates above 5% from the last quarter",
    "Analyze the performance of our top creators in Creator IQ and compare their metrics"
  ]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Hello! I'm your AI agent assistant. I can help you complete complex tasks by using tools like web search, Google Drive integration, and Creator IQ data access.",
      role: "assistant",
      timestamp: new Date()
    }
  ]);

  const handleTaskSelection = (task: string) => {
    setActiveTab("task");
    setCustomPrompt(task);
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      content,
      role: "user",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Agent</h1>
          <p className="text-muted-foreground mt-2">
            Your autonomous AI agent that can complete complex tasks using tools like web search, Google Drive, and Creator IQ
          </p>
        </div>

        {!user && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="mb-4">Sign in to access all agent capabilities</p>
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="task" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Task Runner
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Example Tasks
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="task" className="mt-4">
            <AgentTaskRunner initialTask={customPrompt} />
          </TabsContent>
          
          <TabsContent value="examples" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Example Tasks</CardTitle>
                <CardDescription>
                  Select an example task to get started with the agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {taskExamples.map((example, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-accent" onClick={() => handleTaskSelection(example)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Bot className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                          <p>{example}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Agent;
