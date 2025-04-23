
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly',
          redirectTo: `${window.location.origin}/drive`,
        }
      })

      if (error) throw error
      
      // The user will be redirected to Google's auth page
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
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
    </div>
  )
}
