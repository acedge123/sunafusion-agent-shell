
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"

export interface SlackMessage {
  id: string
  text: string
  user: string
  ts: string
  channel: string
  thread_ts?: string
  userProfile?: {
    name: string
    image?: string
  }
}

export interface SlackChannel {
  id: string
  name: string
  is_private: boolean
  is_archived: boolean
  num_members?: number
}

export interface SearchParams {
  query: string
  channels?: string[]
  limit?: number
}

export const useSlackData = () => {
  const [messages, setMessages] = useState<SlackMessage[]>([])
  const [channels, setChannels] = useState<SlackChannel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  
  const getSlackToken = async () => {
    if (!user) return null
    
    try {
      const { data, error } = await supabase
        .from('slack_access')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
        
      if (error) throw error
      return data?.access_token || null
    } catch (err) {
      console.error("Error retrieving Slack token:", err)
      return null
    }
  }
  
  const searchMessages = async (params: SearchParams) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.functions.invoke('slack-data', {
        body: {
          action: 'search',
          query: params.query,
          channels: params.channels,
          limit: params.limit || 20
        }
      })
      
      if (error) throw new Error(error.message)
      if (data.error) throw new Error(data.error)
      
      setMessages(data.messages || [])
      return data.messages || []
    } catch (err) {
      console.error("Error searching Slack messages:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to search Slack messages"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Slack Search Error",
        description: errorMessage,
      })
      return []
    } finally {
      setLoading(false)
    }
  }
  
  const getChannels = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.functions.invoke('slack-data', {
        body: {
          action: 'getChannels'
        }
      })
      
      if (error) throw new Error(error.message)
      if (data.error) throw new Error(data.error)
      
      setChannels(data.channels || [])
      return data.channels || []
    } catch (err) {
      console.error("Error fetching Slack channels:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch Slack channels"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Slack Error",
        description: errorMessage,
      })
      return []
    } finally {
      setLoading(false)
    }
  }
  
  const getChannelHistory = async (channelId: string, limit: number = 50) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.functions.invoke('slack-data', {
        body: {
          action: 'getChannelHistory',
          channelId,
          limit
        }
      })
      
      if (error) throw new Error(error.message)
      if (data.error) throw new Error(data.error)
      
      setMessages(data.messages || [])
      return data.messages || []
    } catch (err) {
      console.error("Error fetching channel history:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch channel history"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Slack Error",
        description: errorMessage,
      })
      return []
    } finally {
      setLoading(false)
    }
  }
  
  const getThreadReplies = async (channelId: string, threadTs: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.functions.invoke('slack-data', {
        body: {
          action: 'getThreadReplies',
          channelId,
          threadTs
        }
      })
      
      if (error) throw new Error(error.message)
      if (data.error) throw new Error(data.error)
      
      return data.messages || []
    } catch (err) {
      console.error("Error fetching thread replies:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch thread replies"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Slack Error",
        description: errorMessage,
      })
      return []
    } finally {
      setLoading(false)
    }
  }
  
  return {
    messages,
    channels,
    loading,
    error,
    searchMessages,
    getChannels,
    getChannelHistory,
    getThreadReplies,
    hasSlackToken: getSlackToken
  }
}
