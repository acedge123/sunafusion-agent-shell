
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import AgentHeader from "@/components/agent/AgentHeader";
import ChatContainer, { Message } from "@/components/chat/ChatContainer";
import ChatInput from "@/components/chat/ChatInput";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response (to be replaced with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: uuidv4(),
        content: "This is a placeholder response. The actual AI functionality will be implemented when merging with the Suna repository.",
        role: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
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
      
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Index;
