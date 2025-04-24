
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, MessageSquareText, Check } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/integrations/supabase/client"

export const SlackAuth = () => {
  const [connecting, setConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()
  
  useEffect(() => {
    if (!user) return
    
    const checkSlackConnection = async () => {
      try {
        setCheckingStatus(true)
        const { data, error } = await supabase
          .from('slack_access')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
          
        if (error) throw error
        setIsConnected(!!data)
      } catch (err) {
        console.error("Error checking Slack connection:", err)
      } finally {
        setCheckingStatus(false)
      }
    }
    
    checkSlackConnection()
    
    // Handle OAuth callback
    const handleOAuthCallback = async () => {
      const hash = window.location.hash
      if (hash) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        
        if (accessToken) {
          try {
            setConnecting(true)
            
            // Store the token in Supabase
            const { error } = await supabase
              .from('slack_access')
              .upsert({
                user_id: user.id,
                access_token: accessToken,
                token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id'
              })
              
            if (error) throw error
            
            // Clean the URL hash
            window.history.replaceState({}, document.title, window.location.pathname)
            
            setIsConnected(true)
            toast({
              title: "Slack connected successfully",
              description: "Your Slack workspace is now connected to the AI assistant.",
            })
          } catch (error) {
            console.error("Error storing Slack token:", error)
            toast({
              variant: "destructive",
              title: "Connection failed",
              description: "Could not connect to Slack. Please try again.",
            })
          } finally {
            setConnecting(false)
          }
        }
      }
    }
    
    handleOAuthCallback()
  }, [user, toast])
  
  const connectSlack = () => {
    setConnecting(true)
    
    // Slack OAuth client ID 
    const clientId = "105581126916.8801648634339"
    const redirectUri = window.location.origin
    const scopes = "channels:history,channels:read,search:read,users:read"
    
    // Redirect to Slack OAuth
    const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`
    window.location.href = slackAuthUrl
  }
  
  const disconnectSlack = async () => {
    if (!user) return
    
    try {
      setConnecting(true)
      
      const { error } = await supabase
        .from('slack_access')
        .delete()
        .eq('user_id', user.id)
        
      if (error) throw error
      
      setIsConnected(false)
      toast({
        title: "Slack disconnected",
        description: "Your Slack workspace has been disconnected.",
      })
    } catch (error) {
      console.error("Error disconnecting Slack:", error)
      toast({
        variant: "destructive",
        title: "Disconnection failed",
        description: "Could not disconnect from Slack. Please try again.",
      })
    } finally {
      setConnecting(false)
    }
  }
  
  if (checkingStatus) {
    return (
      <div className="w-full bg-muted/40 border rounded-lg p-4">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking Slack connection...</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full bg-muted/40 border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-purple-500" />
          <span className="font-medium">Slack Integration</span>
        </div>
        
        {isConnected ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-600 flex items-center">
              <Check className="h-4 w-4 mr-1" /> Connected
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={disconnectSlack} 
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  Disconnecting...
                </>
              ) : "Disconnect"}
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={connectSlack} 
            disabled={connecting}
          >
            {connecting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                Connecting...
              </>
            ) : "Connect Slack"}
          </Button>
        )}
      </div>
    </div>
  )
}
