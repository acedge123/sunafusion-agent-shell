
import { Message } from "@/components/chat/ChatContainer";

const API_URL = "http://localhost:8000/api";

export async function sendMessage(content: string): Promise<Message> {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: content }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  const data = await response.json();
  return {
    id: data.id || crypto.randomUUID(),
    content: data.content,
    role: "assistant",
    timestamp: new Date()
  };
}
