
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth/AuthProvider"
import { LogIn, Loader2 } from "lucide-react"
import { useState } from "react"

export const GoogleDriveAuth = () => {
  const [isAuthorizing, setIsAuthorizing] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const initiateGoogleAuth = async () => {
    setIsAuthorizing(true)
    try {
      console.log("Starting Google authorization flow")
      console.log("Current origin:", window.location.origin)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly',
          redirectTo: `${window.location.origin}/drive`,
        }
      })

      if (error) {
        console.error("Full OAuth error object:", error)
        
        // Detailed error handling
        if (error.message.includes("provider is not enabled")) {
          toast({
            variant: "destructive",
            title: "Google Provider Not Enabled",
            description: "Please enable the Google provider in your Supabase project authentication settings."
          })
        } else if (error.message.includes("refusing to connect")) {
          toast({
            variant: "destructive",
            title: "Connection Refused",
            description: `Google refused the connection. Verify that ${window.location.origin} is correctly added as an authorized origin in Google Cloud Console.`
          })
        } else {
          toast({
            variant: "destructive",
            title: "Authorization Error",
            description: error.message || "Failed to initiate Google authorization"
          })
        }
        return
      }
      
      console.log("OAuth response:", data)
      
      // The user will be redirected to Google's auth page
      if (data?.url) {
        window.location.href = data.url
      } else {
        throw new Error("No redirect URL returned from OAuth provider")
      }
    } catch (error) {
      console.error("Full authorization error:", error)
      toast({
        variant: "destructive",
        title: "Authorization Error",
        description: error instanceof Error ? error.message : "Failed to start Google authorization"
      })
    } finally {
      setIsAuthorizing(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold">Connect Google Drive</h3>
      <p className="text-sm text-muted-foreground text-center">
        To enable the AI assistant to search your Google Drive files, you need to authorize access.
      </p>
      <Button 
        onClick={initiateGoogleAuth} 
        disabled={isAuthorizing}
      >
        {isAuthorizing ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authorizing...</>
        ) : (
          <><LogIn className="mr-2 h-4 w-4" /> Authorize Google Drive</>
        )}
      </Button>
      <div className="space-y-2 text-xs text-muted-foreground mt-1">
        <p>
          Make sure you've enabled the Google provider in your Supabase project
        </p>
        <p>
          Current URL: <code className="bg-muted px-1 rounded text-xs">{window.location.origin}</code>
        </p>
        <p>
          Add this URL as an authorized JavaScript origin in Google Cloud Console
        </p>
        <p>
          Redirect URL for Google Cloud: <code className="bg-muted px-1 rounded text-xs">{`${window.location.origin}/drive`}</code>
        </p>
      </div>
    </div>
  )
}
