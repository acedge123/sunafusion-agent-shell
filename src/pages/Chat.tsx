
import { useState, useEffect, useRef } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send, Bot, Zap, AlertCircle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import ChatContainer, { Message } from "@/components/chat/ChatContainer"
import { v4 as uuidv4 } from "uuid"
import { detectHeavyTask, getHeavyTaskSuggestion } from "@/utils/heavyTaskDetector"
import { startBackendAgent, streamBackendAgent, normalizeBackendResponse } from "@/services/api/backendAgentService"

type RunMode = 'quick' | 'heavy'

// Feature flag: Enable Heavy Mode (requires backend deployment)
const HEAVY_MODE_ENABLED = import.meta.env.VITE_ENABLE_HEAVY_MODE === 'true'

const Chat = () => {
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [runMode, setRunMode] = useState<RunMode>('quick')
  const [showHeavyTaskAdvisory, setShowHeavyTaskAdvisory] = useState(false)
  const [activeAgentRunId, setActiveAgentRunId] = useState<string | null>(null)
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

  // Check for heavy task advisory when input changes (only if Heavy Mode is enabled)
  useEffect(() => {
    if (HEAVY_MODE_ENABLED && input.trim() && runMode === 'quick') {
      const suggestion = getHeavyTaskSuggestion(input)
      setShowHeavyTaskAdvisory(!!suggestion)
    } else {
      setShowHeavyTaskAdvisory(false)
    }
  }, [input, runMode])

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setShowHeavyTaskAdvisory(false)
    setIsProcessing(true)

    try {
      if (HEAVY_MODE_ENABLED && runMode === 'heavy') {
        // Backend agentpress path
        await handleBackendAgent(currentInput)
      } else {
        // Edge unified-agent path (quick mode)
        await handleEdgeAgent(currentInput)
      }
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

  const handleEdgeAgent = async (query: string) => {
    // Convert previous messages to the format expected by the agent
    // Use current messages state, filtering out welcome message
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
    
    // If no provider token in session, try to get from database
    let storedToken = null;
    if (!providerToken && sessionData?.session?.user) {
      try {
        const { data: tokenData } = await supabase
          .from('google_drive_access')
          .select('access_token')
          .eq('user_id', sessionData.session.user.id)
          .maybeSingle();
          
        storedToken = tokenData?.access_token;
        console.log("Chat: Retrieved stored token from database:", !!storedToken);
      } catch (dbError) {
        console.error("Chat: Error retrieving token from database:", dbError);
      }
    }

    const response = await supabase.functions.invoke('unified-agent', {
      body: {
        query,
        conversation_history: conversationHistory,
        include_web: true,
        include_drive: true,
        provider_token: providerToken || storedToken,
        debug_token_info: {
          hasProviderToken: !!providerToken,
          hasStoredToken: !!storedToken,
          userHasSession: !!sessionData?.session
        }
      },
      headers: authToken ? {
        Authorization: `Bearer ${authToken}`
      } : undefined
    })

    if (response.error) throw response.error
    
    // Store provider token if available
    if (providerToken && sessionData?.session?.user?.id) {
      try {
        await supabase
          .from('google_drive_access')
          .upsert({
            user_id: sessionData.session.user.id,
            access_token: providerToken,
            token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
      } catch (storeError) {
        console.error("Error in token storage:", storeError);
      }
    }

    // Normalize Edge response to Message format
    const assistantMessage: Message = {
      id: uuidv4(),
      content: response.data.answer || response.data.message || "No response received",
      role: "assistant",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, assistantMessage])
  }

  const handleBackendAgent = async (query: string) => {
    // Start backend agent
    const response = await startBackendAgent(query, {
      stream: true,
      reasoning_effort: 'medium'
    })

    const { agent_run_id } = response
    setActiveAgentRunId(agent_run_id)  // Track active run for stop button

    // Create a placeholder assistant message that we'll update as we stream
    const assistantMessageId = uuidv4()
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: "",
      role: "assistant",
      timestamp: new Date()
    }
    setMessages(prev => [...prev, assistantMessage])

    // Stream responses - use functional updates to avoid stale closures
    await streamBackendAgent(
      agent_run_id,
      (streamMessage) => {
        const normalized = normalizeBackendResponse(streamMessage)
        if (normalized && normalized.content) {
          // Use functional update to accumulate content safely
          setMessages(prev => prev.map(msg => {
            if (msg.id === assistantMessageId) {
              // Accumulate content from previous state
              const currentContent = msg.content || ""
              return { ...msg, content: currentContent + normalized.content }
            }
            return msg
          }))
        }
      },
      (error) => {
        console.error("Backend agent stream error:", error)
        setMessages(prev => prev.map(msg => {
          if (msg.id === assistantMessageId) {
            const currentContent = msg.content || ""
            const errorText = `\n\n[Error: ${error.message}]`
            return { ...msg, content: currentContent + errorText }
          }
          return msg
        }))
      },
      () => {
        // Stream complete
        console.log("Backend agent stream completed")
        setActiveAgentRunId(null)  // Clear active run
      }
    )
  }

  const handleStopAgent = async () => {
    if (!activeAgentRunId) return

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const authToken = sessionData?.session?.access_token

      if (!authToken) {
        throw new Error("Authentication required")
      }

      const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000'
      const response = await fetch(`${BACKEND_API_URL}/api/agent-run/${activeAgentRunId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to stop agent: ${response.statusText}`)
      }

      setActiveAgentRunId(null)
      toast({
        title: "Agent stopped",
        description: "The agent run has been stopped successfully."
      })
    } catch (error) {
      console.error("Error stopping agent:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to stop agent"
      })
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">TheGig.Agency Assistant</h1>
            <p className="text-muted-foreground text-sm">
              Ask me anything about your Google Drive files or general questions
            </p>
          </div>
          <Button asChild variant="outline" className="ml-2">
            <Link to="/agent" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Switch to Agent Mode
            </Link>
          </Button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4">
        <ChatContainer messages={messages} />
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4 bg-background">
        {/* Run Mode Toggle - Only show if Heavy Mode is enabled */}
        {HEAVY_MODE_ENABLED && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="run-mode"
                  checked={runMode === 'heavy'}
                  onCheckedChange={(checked) => setRunMode(checked ? 'heavy' : 'quick')}
                  disabled={isProcessing}
                />
                <Label htmlFor="run-mode" className="text-sm font-medium cursor-pointer">
                  {runMode === 'quick' ? (
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Quick Mode
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      Heavy Mode
                    </span>
                  )}
                </Label>
              </div>
              <span className="text-xs text-muted-foreground">
                {runMode === 'quick' 
                  ? "Fast responses with Edge function" 
                  : "Full agent with sandbox & tools"}
              </span>
            </div>

            {/* Heavy Task Advisory Banner */}
            {showHeavyTaskAdvisory && (
              <Alert className="mb-3 border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-sm text-amber-800">
                    {getHeavyTaskSuggestion(input)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRunMode('heavy')
                      setShowHeavyTaskAdvisory(false)
                    }}
                    className="ml-2 h-7"
                  >
                    Switch
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={runMode === 'quick' ? "Ask a question..." : "Describe your task..."}
            disabled={isProcessing}
            className="resize-none"
            rows={3}
          />
          <div className="flex flex-col gap-2">
            {HEAVY_MODE_ENABLED && runMode === 'heavy' && activeAgentRunId && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStopAgent}
                disabled={!activeAgentRunId}
                className="h-8"
              >
                Stop
              </Button>
            )}
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
    </div>
  )
}

export default Chat
