
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
    
    // Handle OAuth callback with improved error handling
    const handleOAuthCallback = async () => {
      // Check both hash and query parameters for the code/token
      const hash = window.location.hash
      const searchParams = new URLSearchParams(window.location.search)
      const codeFromQuery = searchParams.get('code')
      
      if (hash && hash.includes('access_token')) {
        // Implicit grant flow - token in hash fragment
        console.log("Detected access token in URL hash")
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        
        if (accessToken) {
          try {
            setConnecting(true)
            
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
            
            // Clean URL after processing
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
      } else if (codeFromQuery) {
        // Authorization code flow - code in query parameter
        console.log("Detected authorization code in URL query")
        try {
          setConnecting(true)
          
          // Call edge function to exchange code for token
          const { data, error } = await supabase.functions.invoke('slack-data', {
            body: {
              action: 'exchangeCodeForToken',
              code: codeFromQuery,
              redirectUri: window.location.origin
            }
          })
          
          if (error) throw new Error(error.message)
          if (data.error) throw new Error(data.error)
          
          // Store the token
          if (data.access_token) {
            const { error: storeError } = await supabase
              .from('slack_access')
              .upsert({
                user_id: user.id,
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                token_expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id'
              })
              
            if (storeError) throw storeError
            
            // Clean URL after processing
            window.history.replaceState({}, document.title, window.location.pathname)
            
            setIsConnected(true)
            toast({
              title: "Slack connected successfully",
              description: "Your Slack workspace is now connected to the AI assistant.",
            })
          }
        } catch (error) {
          console.error("Error exchanging code for token:", error)
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
    
    handleOAuthCallback()
  }, [user, toast])
  
  const connectSlack = () => {
    setConnecting(true)
    
    // Use Authorization Code flow instead of Implicit Grant for better security
    const clientId = "105581126916.8801648634339"
    const redirectUri = window.location.origin
    const scopes = "channels:history,channels:read,search:read,users:read"
    
    // Use OAuth 2.0 authorization code flow
    const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&response_type=code`
    
    // Open in same window to ensure we get back to the app
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
