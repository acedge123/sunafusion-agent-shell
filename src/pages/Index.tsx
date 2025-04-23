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
import { GoogleDriveAuth } from "@/components/drive/GoogleDriveAuth"

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Hello! I'm your AI assistant with access to Google Drive and web search. Ask me anything - I'll use all available resources to help you!",
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
      
      // Add an error message to the chat
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
    <div className="flex flex-col h-screen bg-background">
      <AgentHeader 
        agentName="Suna AI" 
        agentImage="/placeholder.svg"
        onSettings={() => console.log("Settings clicked")}
      />
      
      <div className="p-4 bg-muted/20 border-b">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center max-w-4xl mx-auto">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">TheGig.Agency Unified Assistant</h1>
            <p className="text-muted-foreground mb-4">
              Your intelligent assistant that seamlessly searches both your Google Drive files and the web to provide comprehensive answers
            </p>
            {!user && (
              <Button asChild>
                <Link to="/auth">Sign In to Access All Features</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {user && <GoogleDriveAuth />}
      
      <div className="flex-1 overflow-hidden">
        <ChatContainer messages={messages} className="h-full" />
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
        disabled={isLoading} 
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
          <div className="bg-background p-4 rounded-lg shadow-lg flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Getting response...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index
