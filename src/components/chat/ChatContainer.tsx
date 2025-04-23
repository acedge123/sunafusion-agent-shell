
import React from "react";
import ChatMessage from "./ChatMessage";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatContainerProps {
  messages: Message[];
  className?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  messages, 
  className 
}) => {
  return (
    <div className={cn("flex flex-col gap-4 overflow-y-auto p-4", className)}>
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-center text-muted-foreground">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))
      )}
    </div>
  );
};

export default ChatContainer;
