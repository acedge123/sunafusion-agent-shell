import { useState, useEffect, useRef, useCallback } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, Bot, Brain, Plus, ArrowLeft } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import ChatContainer, { Message } from "@/components/chat/ChatContainer"
import { v4 as uuidv4 } from "uuid"
import { Badge } from "@/components/ui/badge"

const WELCOME_MESSAGE = `Hello! I'm connected to your Edge Bot (OpenClaw). I can:
• Check your email and draft replies
• Search the web and scrape pages
• Manage GitHub issues and PRs
• Query your database
• Remember things for later

What would you like me to do?`

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: WELCOME_MESSAGE,
      role: "assistant",
      timestamp: new Date()
    }
  ])
  
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [pendingJobId, setPendingJobId] = useState<string | null>(null)
  const [pendingLearningId, setPendingLearningId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [seenResponseIds, setSeenResponseIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get current user ID for filtering responses
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setCurrentUserId(session?.user?.id || null)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setCurrentUserId(session?.user?.id || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load recent chat history on mount
  useEffect(() => {
    if (!currentUserId) return

    const loadRecentHistory = async () => {
      // Fetch recent chat_query and chat_response learnings for this user
      const { data: responses } = await supabase
        .from('agent_learnings')
        .select('id, learning, created_at, kind, metadata')
        .eq('kind', 'chat_response')
        .order('created_at', { ascending: false })
        .limit(20)

      const { data: queries } = await supabase
        .from('agent_learnings')
        .select('id, learning, created_at, kind, metadata')
        .eq('kind', 'chat_query')
        .order('created_at', { ascending: false })
        .limit(20)

      // Filter to this user's messages and combine
      const userResponses = (responses || [])
        .filter(r => (r.metadata as any)?.user_id === currentUserId)
      const userQueries = (queries || [])
        .filter(q => (q.metadata as any)?.user_id === currentUserId)

      // Track seen IDs
      const seen = new Set<string>()
      userResponses.forEach(r => seen.add(r.id))
      setSeenResponseIds(seen)

      // Combine and sort by date
      const combined = [
        ...userQueries.map(q => ({
          id: q.id,
          content: (q.learning as string).replace(/^User query:\s*/i, ''),
          role: 'user' as const,
          timestamp: new Date(q.created_at)
        })),
        ...userResponses.map(r => ({
          id: r.id,
          content: r.learning,
          role: 'assistant' as const,
          timestamp: new Date(r.created_at)
        }))
      ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

      if (combined.length > 0) {
        setMessages([
          {
            id: "welcome-message",
            content: WELCOME_MESSAGE,
            role: "assistant",
            timestamp: new Date(0) // Put welcome first
          },
          ...combined
        ])
      }
    }

    loadRecentHistory()
  }, [currentUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Helper to add response if not already seen
  const addResponseIfNew = useCallback((learning: {
    id: string;
    learning: string;
    created_at: string;
    metadata: any;
  }) => {
    if (seenResponseIds.has(learning.id)) return false
    if (learning.metadata?.user_id !== currentUserId) return false

    setSeenResponseIds(prev => new Set([...prev, learning.id]))
    setMessages(prev => {
      const filtered = prev.filter(m => !m.id.startsWith('processing-'))
      return [...filtered, {
        id: learning.id,
        content: learning.learning,
        role: "assistant",
        timestamp: new Date(learning.created_at)
      }]
    })
    setIsProcessing(false)
    setPendingJobId(null)
    setPendingLearningId(null)
    return true
  }, [currentUserId, seenResponseIds])

  // Subscribe to chat responses via realtime
  useEffect(() => {
    if (!currentUserId) return

    const channel = supabase
      .channel('chat-responses')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_learnings',
          filter: 'kind=eq.chat_response',
        },
        (payload) => {
          const learning = payload.new as { 
            id: string; 
            learning: string; 
            created_at: string;
            metadata: { user_id?: string; job_id?: string; query_learning_id?: string } | null;
          }
          
          if (addResponseIfNew(learning)) {
            toast({
              title: "Response received",
              description: "Edge Bot has replied.",
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, toast, addResponseIfNew])

  // Poll for response while waiting (fallback if realtime misses it)
  useEffect(() => {
    if (!isProcessing || !currentUserId) return

    const pollInterval = setInterval(async () => {
      console.log('[Chat] Polling for responses...', { pendingLearningId, currentUserId })
      
      const { data, error } = await supabase
        .from('agent_learnings')
        .select('id, learning, created_at, metadata')
        .eq('kind', 'chat_response')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('[Chat] Poll error:', error)
        return
      }

      console.log('[Chat] Poll results:', data?.length, 'responses found')

      // Find any new responses for this user
      for (const r of data || []) {
        const meta = r.metadata as { user_id?: string; query_learning_id?: string } | null
        if (meta?.user_id === currentUserId && !seenResponseIds.has(r.id)) {
          console.log('[Chat] Found new response:', r.id)
          addResponseIfNew(r as any)
          toast({
            title: "Response received",
            description: "Edge Bot has replied.",
          })
          break // Only add one at a time to avoid duplicates
        }
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [isProcessing, pendingLearningId, currentUserId, seenResponseIds, addResponseIfNew, toast])

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isProcessing) return

    const currentInput = input
    setInput("")
    setIsProcessing(true)

    // Add user message locally
    setMessages(prev => [...prev, {
      id: uuidv4(),
      content: currentInput,
      role: "user",
      timestamp: new Date()
    }])

    try {
      // Submit to agent-vault which creates a job
      const { data: sessionData } = await supabase.auth.getSession()
      const authToken = sessionData?.session?.access_token

      const response = await fetch(
        'https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault/chat/submit',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({ message: currentInput }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to submit: ${response.statusText}`)
      }

      const data = await response.json()
      setPendingJobId(data.job?.id)
      setPendingLearningId(data.learning_id)

      // Add a "processing" indicator message
      setMessages(prev => [...prev, {
        id: "processing-" + (data.job?.id || uuidv4()),
        content: "🔄 Message sent to Edge Bot. Waiting for response...",
        role: "assistant",
        timestamp: new Date()
      }])

      toast({
        title: "Message sent",
        description: "Edge Bot is processing your request...",
      })

    } catch (error) {
      console.error("Chat submit error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message"
      })
      
      setMessages(prev => [...prev, {
        id: uuidv4(),
        content: "Sorry, I couldn't send your message. Please try again.",
        role: "assistant",
        timestamp: new Date()
      }])
      setIsProcessing(false)
    }
  }, [input, isProcessing, toast])

  const handleNewConversation = () => {
    setMessages([{
      id: "welcome-message",
      content: WELCOME_MESSAGE,
      role: "assistant",
      timestamp: new Date()
    }])
    setPendingJobId(null)
    setIsProcessing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">Edge Bot Chat</h1>
                <Badge variant="secondary" className="text-xs">OpenClaw</Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Your AI assistant with email, search, GitHub, and database skills
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNewConversation} title="New conversation">
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
            <Link to="/learnings">
              <Button variant="outline" size="sm">
                <Brain className="h-4 w-4 mr-2" />
                Learnings
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4">
        <ChatContainer messages={messages} />
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4 bg-background">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Edge Bot anything..."
            disabled={isProcessing}
            className="resize-none"
            rows={3}
          />
          <div className="flex flex-col justify-end">
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isProcessing}
              size="lg"
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
        {pendingJobId && (
          <p className="text-center text-xs text-muted-foreground mt-2">
            Job ID: {pendingJobId}
          </p>
        )}
      </div>
    </div>
  )
}

export default Chat
