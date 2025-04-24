
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth/AuthProvider"
import { useNavigate } from "react-router-dom"

export const useGoogleDriveAuth = () => {
  const [isAuthorizing, setIsAuthorizing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

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
          console.log("Found existing Google Drive token in database")
          setIsAuthenticated(true)
        } else {
          console.log("No Google Drive token found in database")
        }
      } catch (error) {
        console.error("Error checking Google Drive access:", error)
      }
    }
    
    checkGoogleDriveAccess()
  }, [user])

  // Check for OAuth response
  useEffect(() => {
    const checkForOAuthResponse = async () => {
      // Check for hash in URL which indicates OAuth response
      if ((window.location.pathname === "/drive" || window.location.pathname === "/") && window.location.hash) {
        console.log("Detected OAuth redirect with hash:", window.location.hash)
        
        try {
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
            console.log("Successfully authenticated with Google. Provider token available:", !!data.session.provider_token)
            
            // Store the provider token in database for later use - using UPSERT with unique constraint
            if (data.session.provider_token && user?.id) {
              try {
                const { error: upsertError } = await supabase
                  .from('google_drive_access')
                  .upsert({
                    user_id: user.id,
                    access_token: data.session.provider_token,
                    refresh_token: data.session.refresh_token, // Store refresh token if available
                    token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                  }, {
                    onConflict: 'user_id'
                  });
                
                if (upsertError) {
                  console.error("Error storing Google Drive token:", upsertError);
                } else {
                  console.log("Successfully stored Google Drive token");
                }
              } catch (storeError) {
                console.error("Error during token storage:", storeError)
              }
            }
            
            toast({
              title: "Google Drive Connected",
              description: "Your Google Drive account has been successfully connected",
            })
            setIsAuthenticated(true)
            
            // Clean URL by removing hash and navigating to the /drive page
            if (window.location.hash) {
              const cleanUrl = window.location.pathname;
              navigate('/drive', { replace: true });
            }
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
  }, [toast, user, navigate])

  const initiateGoogleAuth = async () => {
    setIsAuthorizing(true)
    try {
      const currentDomain = window.location.origin
      const redirectUrl = `${currentDomain}/drive`
      
      // Enhanced scope request for full access to drive content
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.file',
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            include_granted_scopes: 'true'
          }
        }
      })

      if (error) {
        console.error("Full OAuth error object:", error)
        
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
            description: `Google refused the connection. Verify domain configuration in Google Cloud Console.`
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
      
      if (data?.url) {
        console.log("Redirecting to OAuth URL:", data.url)
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

  return {
    isAuthorizing,
    isAuthenticated,
    initiateGoogleAuth
  }
}
