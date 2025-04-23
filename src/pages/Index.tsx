
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";
import AgentHeader from "@/components/agent/AgentHeader";
import ChatContainer, { Message } from "@/components/chat/ChatContainer";
import ChatInput from "@/components/chat/ChatInput";
import { sendMessage } from "@/services/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Hello! I'm your AI assistant. How can I help you today?",
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
            <h1 className="text-2xl font-bold mb-2">TheGig.Agency Assistant</h1>
            <p className="text-muted-foreground mb-4">Your intelligent assistant with access to Google Drive and web search</p>
            <div className="flex gap-2 justify-center md:justify-start">
              {user ? (
                <>
                  <Button asChild>
                    <Link to="/chat">AI Chat Assistant</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/drive">Google Drive Files</Link>
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <Link to="/auth">Sign In to Access All Features</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ChatContainer messages={messages} className="h-full" />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default Index;
