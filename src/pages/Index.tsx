import React, { useState } from "react"
import { Link } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/components/ui/use-toast"
import AgentHeader from "@/components/agent/AgentHeader"
import ChatContainer, { Message } from "@/components/chat/ChatContainer"
import ChatInput from "@/components/chat/ChatInput"
import { sendMessage } from "@/services/api"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/AuthProvider"
import { Loader2 } from "lucide-react"
import AgentTaskRunner from "@/components/agent/AgentTaskRunner"

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Hello! I'm your AI assistant with access to Google Drive, Slack, and web search. Ask me anything or give me a complex task - I'll break it down into steps and solve it for you.",
      role: "assistant",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiMessage = await sendMessage(content);
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        content: "Sorry, I encountered an error processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AgentHeader 
        agentName="Suna AI" 
        agentImage="/placeholder.svg"
        onSettings={() => console.log("Settings clicked")}
      />
      
      <div className="p-4 pb-0 bg-muted/20 border-b">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center max-w-4xl mx-auto">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">TheGig.Agency Unified Assistant</h1>
            <p className="text-muted-foreground mb-2">
              Your intelligent assistant that autonomously searches your Google Drive files, Slack messages, and the web to solve complex tasks
            </p>
            
            {!user && (
              <Button asChild>
                <Link to="/auth">Sign In to Access All Features</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <AgentTaskRunner 
            showToolSelection={true}
            initialTask="Example: Summarize all meeting minutes for our client Copper Fit or Find all Slack messages about the Q2 marketing campaign" 
          />
        </div>
      </div>
      
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
          <div className="bg-background p-4 rounded-lg shadow-lg flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Getting response...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
