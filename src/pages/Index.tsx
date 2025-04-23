
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";
import AgentHeader from "@/components/agent/AgentHeader";
import ChatContainer, { Message } from "@/components/chat/ChatContainer";
import ChatInput from "@/components/chat/ChatInput";
import { sendMessage } from "@/services/api";

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
      
      <div className="flex-1 overflow-hidden">
        <ChatContainer messages={messages} className="h-full" />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default Index;
