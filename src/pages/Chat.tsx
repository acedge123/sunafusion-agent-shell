import { useState, useEffect, useRef } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send, Bot, Zap, AlertCircle, Trash2, Plus } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import ChatContainer, { Message } from "@/components/chat/ChatContainer"
import SourcePanel from "@/components/chat/SourcePanel"
import OperatorButtons from "@/components/chat/OperatorButtons"
import { v4 as uuidv4 } from "uuid"
import { getHeavyTaskSuggestion } from "@/utils/heavyTaskDetector"
import { startBackendAgent, streamBackendAgent, normalizeBackendResponse } from "@/services/api/backendAgentService"
import { useChatHistory } from "@/hooks/useChatHistory"

type RunMode = 'quick' | 'heavy'

// Feature flag: Enable Heavy Mode (requires backend deployment)
const HEAVY_MODE_ENABLED = import.meta.env.VITE_ENABLE_HEAVY_MODE === 'true'

const WELCOME_MESSAGE = "Hello! I'm your AI assistant with access to your Google Drive files and web search. How can I help you today?"

const Chat = () => {
  const [searchParams] = useSearchParams()
  const {
    messages: chatMessages,
    isLoading: isLoadingHistory,
    isAuthenticated,
    addMessage,
    finalizeAssistantMessage,
    startNewConversation,
    clearHistory
  } = useChatHistory()
  
  // Local messages state for UI (includes welcome message and handles non-authenticated users)
  const [localMessages, setLocalMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: WELCOME_MESSAGE,
      role: "assistant",
      timestamp: new Date()
    }
  ])
  
  // Merge persisted messages with welcome message
  const messages: Message[] = isAuthenticated && chatMessages.length > 0
    ? chatMessages.map(m => ({
        id: m.id,
        content: m.content,
        role: m.role,
        timestamp: m.timestamp
      }))
    : localMessages
  
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [runMode, setRunMode] = useState<RunMode>('quick')
  const [showHeavyTaskAdvisory, setShowHeavyTaskAdvisory] = useState(false)
  const [activeAgentRunId, setActiveAgentRunId] = useState<string | null>(null)
  const [lastSourceData, setLastSourceData] = useState<any>(null)
  const [streamingContent, setStreamingContent] = useState<string>("")
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Handle URL params for query/result
  useEffect(() => {
    const query = searchParams.get("query")
    const resultParam = searchParams.get("result")

    if (query && resultParam && !isLoadingHistory) {
      try {
        const result = JSON.parse(decodeURIComponent(resultParam))
        
        // Add messages from URL params
        if (isAuthenticated) {
          addMessage({ content: query, role: "user" })
          addMessage({ content: result.answer, role: "assistant" })
        } else {
          setLocalMessages(prev => [
            ...prev,
            { id: uuidv4(), content: query, role: "user", timestamp: new Date() },
            { id: uuidv4(), content: result.answer, role: "assistant", timestamp: new Date() }
          ])
        }
      } catch (error) {
        console.error("Failed to parse result:", error)
      }
    }
  }, [searchParams, isLoadingHistory, isAuthenticated, addMessage])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingContent])

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

    const currentInput = input
    setInput("")
    setShowHeavyTaskAdvisory(false)
    setIsProcessing(true)

    // Add user message
    if (isAuthenticated) {
      await addMessage({ content: currentInput, role: "user" })
    } else {
      setLocalMessages(prev => [...prev, {
        id: uuidv4(),
        content: currentInput,
        role: "user",
        timestamp: new Date()
      }])
    }

    try {
      if (HEAVY_MODE_ENABLED && runMode === 'heavy') {
        await handleBackendAgent(currentInput)
      } else {
        await handleEdgeAgent(currentInput)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
      
      const errorContent = "Sorry, I encountered an error while processing your request. Please try again."
      if (isAuthenticated) {
        await addMessage({ content: errorContent, role: "assistant" })
      } else {
        setLocalMessages(prev => [...prev, {
          id: uuidv4(),
          content: errorContent,
          role: "assistant",
          timestamp: new Date()
        }])
      }
    } finally {
      setIsProcessing(false)
      setStreamingContent("")
      setStreamingMessageId(null)
    }
  }

  const handleEdgeAgent = async (query: string) => {
    // Build conversation history from current messages
    const conversationHistory = messages
      .filter(msg => msg.id !== "welcome-message")
      .map(msg => ({ role: msg.role, content: msg.content }))

    const { data: sessionData } = await supabase.auth.getSession()
    const authToken = sessionData?.session?.access_token
    const providerToken = sessionData?.session?.provider_token
    
    let storedToken = null
    if (!providerToken && sessionData?.session?.user) {
      try {
        const { data: tokenData } = await supabase
          .from('google_drive_access')
          .select('access_token')
          .eq('user_id', sessionData.session.user.id)
          .maybeSingle()
        storedToken = tokenData?.access_token
      } catch (dbError) {
        console.error("Error retrieving token from database:", dbError)
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
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined
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
          }, { onConflict: 'user_id' })
      } catch (storeError) {
        console.error("Error in token storage:", storeError)
      }
    }

    // Store source data
    if (response.data.source_data) {
      setLastSourceData(response.data.source_data)
    } else {
      setLastSourceData(null)
    }

    const assistantContent = response.data.answer || response.data.message || "No response received"
    
    if (isAuthenticated) {
      await addMessage({ 
        content: assistantContent, 
        role: "assistant",
        sourceData: response.data.source_data 
      })
    } else {
      setLocalMessages(prev => [...prev, {
        id: uuidv4(),
        content: assistantContent,
        role: "assistant",
        timestamp: new Date()
      }])
    }
  }

  const handleBackendAgent = async (query: string) => {
    const response = await startBackendAgent(query, {
      stream: true,
      reasoning_effort: 'medium'
    })

    const { agent_run_id } = response
    setActiveAgentRunId(agent_run_id)

    const assistantMessageId = uuidv4()
    setStreamingMessageId(assistantMessageId)
    setStreamingContent("")

    // Add placeholder message for local display
    if (!isAuthenticated) {
      setLocalMessages(prev => [...prev, {
        id: assistantMessageId,
        content: "",
        role: "assistant",
        timestamp: new Date()
      }])
    }

    let accumulatedContent = ""

    await streamBackendAgent(
      agent_run_id,
      (streamMessage) => {
        const normalized = normalizeBackendResponse(streamMessage)
        if (normalized && normalized.content) {
          accumulatedContent += normalized.content
          setStreamingContent(accumulatedContent)
          
          // Update local messages for non-authenticated users
          if (!isAuthenticated) {
            setLocalMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: accumulatedContent }
                : msg
            ))
          }
        }
      },
      (error) => {
        console.error("Backend agent stream error:", error)
        accumulatedContent += `\n\n[Error: ${error.message}]`
        setStreamingContent(accumulatedContent)
      },
      async () => {
        // Stream complete - persist the message
        if (isAuthenticated && accumulatedContent) {
          await addMessage({ content: accumulatedContent, role: "assistant" })
        }
        setActiveAgentRunId(null)
        setStreamingContent("")
        setStreamingMessageId(null)
      }
    )
  }

  const handleStopAgent = async () => {
    if (!activeAgentRunId) return

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const authToken = sessionData?.session?.access_token

      if (!authToken) throw new Error("Authentication required")

      const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000'
      const response = await fetch(`${BACKEND_API_URL}/api/agent-run/${activeAgentRunId}/stop`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      if (!response.ok) throw new Error(`Failed to stop agent: ${response.statusText}`)

      setActiveAgentRunId(null)
      toast({ title: "Agent stopped", description: "The agent run has been stopped successfully." })
    } catch (error) {
      console.error("Error stopping agent:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to stop agent"
      })
    }
  }

  const handleNewConversation = () => {
    if (isAuthenticated) {
      startNewConversation()
    } else {
      setLocalMessages([{
        id: "welcome-message",
        content: WELCOME_MESSAGE,
        role: "assistant",
        timestamp: new Date()
      }])
    }
    setLastSourceData(null)
  }

  const handleClearHistory = async () => {
    if (isAuthenticated) {
      await clearHistory()
      toast({ title: "History cleared", description: "All chat history has been deleted." })
    }
    setLocalMessages([{
      id: "welcome-message",
      content: WELCOME_MESSAGE,
      role: "assistant",
      timestamp: new Date()
    }])
    setLastSourceData(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Combine persisted messages with streaming content for display
  const displayMessages = streamingMessageId && isAuthenticated && streamingContent
    ? [...messages, { id: streamingMessageId, content: streamingContent, role: "assistant" as const, timestamp: new Date() }]
    : messages

  if (isLoadingHistory) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">TheGig.Agency Assistant</h1>
            <p className="text-muted-foreground text-sm">
              Ask me anything about your Google Drive files or general questions
              {isAuthenticated && <span className="ml-2 text-xs">(chat history saved)</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNewConversation} title="New conversation">
              <Plus className="h-4 w-4" />
            </Button>
            {isAuthenticated && (
              <Button variant="outline" size="sm" onClick={handleClearHistory} title="Clear all history">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button asChild variant="outline" className="ml-2">
              <Link to="/agent" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Switch to Agent Mode
              </Link>
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4">
        <OperatorButtons onSelectQuery={(query) => setInput(query)} />
        <ChatContainer messages={displayMessages} />
        <div ref={messagesEndRef} />
        {lastSourceData && (
          <div className="mt-4">
            <SourcePanel sourceData={lastSourceData} />
          </div>
        )}
      </div>
      
      <div className="border-t p-4 bg-background">
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
