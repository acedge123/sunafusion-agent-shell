
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import ChatContainer, { Message } from "@/components/chat/ChatContainer"
import { v4 as uuidv4 } from "uuid"

const Chat = () => {
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if we have a query and result from URL params
    const query = searchParams.get("query")
    const resultParam = searchParams.get("result")

    if (query && resultParam) {
      try {
        const result = JSON.parse(decodeURIComponent(resultParam))
        
        // Add the query as a user message
        const userMessage: Message = {
          id: uuidv4(),
          content: query,
          role: "user",
          timestamp: new Date()
        }
        
        // Add the answer as an assistant message
        const assistantMessage: Message = {
          id: uuidv4(),
          content: result.answer,
          role: "assistant",
          timestamp: new Date()
        }
        
        setMessages([
          {
            id: "welcome-message",
            content: "Hello! I'm your AI assistant with access to your Google Drive files and web search. How can I help you today?",
            role: "assistant",
            timestamp: new Date()
          },
          userMessage,
          assistantMessage
        ])
      } catch (error) {
        console.error("Failed to parse result:", error)
        setMessages([
          {
            id: "welcome-message",
            content: "Hello! I'm your AI assistant with access to your Google Drive files and web search. How can I help you today?",
            role: "assistant",
            timestamp: new Date()
          }
        ])
      }
    } else {
      // No query/result, just show welcome message
      setMessages([
        {
          id: "welcome-message",
          content: "Hello! I'm your AI assistant with access to your Google Drive files and web search. How can I help you today?",
          role: "assistant",
          timestamp: new Date()
        }
      ])
    }
  }, [searchParams])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      // Convert previous messages to the format expected by the agent
      const conversationHistory = messages
        .filter(msg => msg.id !== "welcome-message") // Skip the welcome message
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))

      // Get the current session for the auth token
      const { data: sessionData } = await supabase.auth.getSession()
      const authToken = sessionData?.session?.access_token
      const providerToken = sessionData?.session?.provider_token

      const response = await supabase.functions.invoke('unified-agent', {
        body: {
          query: input,
          conversation_history: conversationHistory,
          include_web: true,
          include_drive: true,
          provider_token: providerToken // Pass provider token explicitly
        },
        headers: authToken ? {
          Authorization: `Bearer ${authToken}`
        } : undefined
      })

      if (response.error) throw response.error

      const assistantMessage: Message = {
        id: uuidv4(),
        content: response.data.answer,
        role: "assistant",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
      
      const errorMessage: Message = {
        id: uuidv4(),
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4">
        <h1 className="text-xl font-bold">TheGig.Agency Assistant</h1>
        <p className="text-muted-foreground text-sm">
          Ask me anything about your Google Drive files or general questions
        </p>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4">
        <ChatContainer messages={messages} />
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4 bg-background">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            disabled={isProcessing}
            className="resize-none"
            rows={3}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isProcessing}
            className="align-self-end"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Chat
