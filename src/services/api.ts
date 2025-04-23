
import { Message } from "@/components/chat/ChatContainer";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";

export async function sendMessage(content: string): Promise<Message> {
  try {
    // Use the unified-agent edge function to process the message
    const response = await supabase.functions.invoke('unified-agent', {
      body: {
        query: content,
        conversation_history: [],
        include_web: true,
        include_drive: true
      }
    });

    if (response.error) {
      throw new Error(response.error.message || "Failed to get AI response");
    }

    return {
      id: uuidv4(),
      content: response.data.answer,
      role: "assistant",
      timestamp: new Date()
    };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
}
