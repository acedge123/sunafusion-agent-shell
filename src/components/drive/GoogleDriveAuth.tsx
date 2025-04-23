
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth/AuthProvider"
import { LogIn, Loader2, ExternalLink, AlertTriangle, Check } from "lucide-react"
import { useState, useEffect } from "react"

export const GoogleDriveAuth = () => {
  const [isAuthorizing, setIsAuthorizing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  
  // Production domain to display in guidance
  const productionDomain = "www.gigagencygroup.com"

  // Check if we have a token in the URL after redirect
  useEffect(() => {
    const checkForOAuthResponse = async () => {
      // Check if we're on the right page and have a hash in the URL
      if (window.location.pathname === "/drive" && window.location.hash) {
        console.log("Detected OAuth redirect with hash:", window.location.hash)
        
        try {
          // Let Supabase handle the hash and extract the session
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error("Error getting session after OAuth redirect:", error)
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: "Failed to process Google authentication response"
            })
            return
          }
          
          if (data?.session) {
            console.log("Successfully authenticated with Google")
            toast({
              title: "Google Drive Connected",
              description: "Your Google Drive account has been successfully connected",
              icon: <Check className="h-4 w-4 text-green-500" />
            })
            setIsAuthenticated(true)
          }
        } catch (error) {
          console.error("Error processing OAuth response:", error)
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Failed to process authentication response"
          })
        }
      }
    }
    
    checkForOAuthResponse()
  }, [toast])
  
  // Check if user already has Google Drive access
  useEffect(() => {
    const checkGoogleDriveAccess = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('google_drive_access')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
          
        if (data && !error) {
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Error checking Google Drive access:", error)
      }
    }
    
    checkGoogleDriveAccess()
  }, [user])

  const initiateGoogleAuth = async () => {
    setIsAuthorizing(true)
    try {
      console.log("Starting Google authorization flow")
      console.log("Current origin:", window.location.origin)
      
      // Use current domain for redirects
      const currentDomain = window.location.origin
      console.log("Using domain for redirect:", currentDomain)
      
      const redirectUrl = `${currentDomain}/drive`
      console.log("Redirect URL:", redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly',
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
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
            description: `Google refused the connection. Verify that both ${currentDomain} and ${productionDomain} are correctly added as authorized origins in Google Cloud Console.`
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

  // Check if the URL contains localhost, which indicates a redirect issue
  const hasRedirectError = window.location.href.includes("localhost") || 
                          (window.location.search && window.location.search.includes("error="));

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold">Connect Google Drive</h3>
      
      {isAuthenticated ? (
        <div className="bg-green-50 border border-green-200 p-3 rounded-md flex items-start gap-3 w-full">
          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium">Google Drive Connected</p>
            <p>Your Google Drive account has been successfully connected.</p>
          </div>
        </div>
      ) : (
        <>
          {hasRedirectError && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-start gap-3 w-full">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Redirect URL Issue Detected</p>
                <p>Your OAuth flow seems to be redirecting to localhost instead of your app's URL.</p>
                <p className="mt-2 font-medium">To fix this:</p>
                <ol className="list-decimal list-inside pl-2 space-y-1">
                  <li>Go to your Supabase Authentication settings</li>
                  <li>Verify Site URL is set to: <code className="bg-amber-100 px-1 rounded">{window.location.origin}</code></li>
                  <li>Add <code className="bg-amber-100 px-1 rounded">{window.location.origin}/drive</code> to Redirect URLs</li>
                </ol>
              </div>
            </div>
          )}
          
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
              Production URL: <code className="bg-muted px-1 rounded text-xs">https://{productionDomain}</code>
            </p>
            <p>
              Add both URLs as authorized JavaScript origins in Google Cloud Console
            </p>
            <p>
              Redirect URLs for Google Cloud: 
            </p>
            <ul className="list-disc list-inside pl-2">
              <li><code className="bg-muted px-1 rounded text-xs">{`${window.location.origin}/drive`}</code></li>
              <li><code className="bg-muted px-1 rounded text-xs">{`https://${productionDomain}/drive`}</code></li>
            </ul>
            <div className="bg-muted/50 p-2 rounded-md mt-3">
              <p className="font-medium mb-1">⚠️ Important: Supabase URL Configuration</p>
              <p>Make sure to set these in Supabase Authentication settings:</p>
              <ul className="list-disc list-inside pl-2">
                <li>Site URL: <code className="bg-muted px-1 rounded text-xs">{window.location.origin}</code></li>
                <li>Redirect URLs:</li>
                <ul className="list-disc list-inside pl-5">
                  <li><code className="bg-muted px-1 rounded text-xs">{`${window.location.origin}/drive`}</code></li>
                  <li><code className="bg-muted px-1 rounded text-xs">{`https://${productionDomain}/drive`}</code></li>
                </ul>
              </ul>
            </div>
            <p className="pt-2 flex gap-2">
              <a 
                href="https://console.cloud.google.com/apis/credentials" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-blue-500 hover:underline"
              >
                Open Google Cloud Console <ExternalLink className="ml-1 h-3 w-3" />
              </a>
              <a 
                href="https://supabase.com/dashboard/project/nljlsqgldgmxlbylqazg/auth/providers" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-blue-500 hover:underline"
              >
                Supabase Auth Settings <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  )
}
