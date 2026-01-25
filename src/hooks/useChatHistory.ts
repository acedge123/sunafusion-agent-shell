import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sourceData?: any;
}

interface UseChatHistoryOptions {
  conversationId?: string;
  loadLimit?: number;
}

export function useChatHistory(options: UseChatHistoryOptions = {}) {
  const { loadLimit = 50 } = options;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>(options.conversationId || uuidv4());
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load conversation history
  const loadHistory = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Load recent messages for this user (most recent first)
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(loadLimit);

      if (error) {
        console.error('Error loading chat history:', error);
        return;
      }

      if (data && data.length > 0) {
        // Get the most recent conversation_id
        const latestConversationId = data[0].conversation_id;
        setConversationId(latestConversationId);

        // Filter messages for this conversation and reverse to chronological order
        const conversationMessages = data
          .filter(msg => msg.conversation_id === latestConversationId)
          .reverse()
          .map(msg => ({
            id: msg.id,
            content: msg.content,
            role: msg.role as 'user' | 'assistant',
            timestamp: new Date(msg.created_at),
            sourceData: msg.source_data
          }));

        setMessages(conversationMessages);
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadLimit]);

  // Load history when userId changes
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Save a message to the database
  const saveMessage = useCallback(async (message: ChatMessage) => {
    if (!userId) {
      console.log('Cannot save message: user not authenticated');
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          id: message.id,
          user_id: userId,
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
          source_data: message.sourceData || null,
          created_at: message.timestamp.toISOString()
        });

      if (error) {
        console.error('Error saving message:', error);
      }
    } catch (err) {
      console.error('Error saving message:', err);
    }
  }, [userId, conversationId]);

  // Add message to state and persist
  const addMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const fullMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, fullMessage]);
    await saveMessage(fullMessage);
    
    return fullMessage;
  }, [saveMessage]);

  // Update the last assistant message (for streaming)
  const updateLastAssistantMessage = useCallback((content: string, sourceData?: any) => {
    setMessages(prev => {
      const lastMsg = prev[prev.length - 1];
      if (lastMsg?.role === 'assistant') {
        return prev.map((msg, i) => 
          i === prev.length - 1 
            ? { ...msg, content, sourceData: sourceData || msg.sourceData }
            : msg
        );
      }
      return prev;
    });
  }, []);

  // Finalize assistant message (save to DB after streaming completes)
  const finalizeAssistantMessage = useCallback(async (messageId: string, content: string, sourceData?: any) => {
    if (!userId) return;

    try {
      // Check if message already exists
      const { data: existing } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('id', messageId)
        .maybeSingle();

      if (existing) {
        // Update existing
        await supabase
          .from('chat_messages')
          .update({ content, source_data: sourceData })
          .eq('id', messageId);
      } else {
        // Insert new
        await supabase
          .from('chat_messages')
          .insert({
            id: messageId,
            user_id: userId,
            conversation_id: conversationId,
            role: 'assistant',
            content,
            source_data: sourceData
          });
      }
    } catch (err) {
      console.error('Error finalizing assistant message:', err);
    }
  }, [userId, conversationId]);

  // Start a new conversation
  const startNewConversation = useCallback(() => {
    const newId = uuidv4();
    setConversationId(newId);
    setMessages([]);
    return newId;
  }, []);

  // Clear all messages for current user
  const clearHistory = useCallback(async () => {
    if (!userId) return;

    try {
      await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId);
      
      setMessages([]);
      setConversationId(uuidv4());
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  }, [userId]);

  return {
    messages,
    setMessages,
    conversationId,
    isLoading,
    isAuthenticated: !!userId,
    addMessage,
    updateLastAssistantMessage,
    finalizeAssistantMessage,
    startNewConversation,
    clearHistory,
    loadHistory
  };
}
