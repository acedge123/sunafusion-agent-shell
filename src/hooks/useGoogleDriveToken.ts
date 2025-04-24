import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

export const useGoogleDriveToken = () => {
  const { user } = useAuth()
  const { toast } = useToast()

  // Updated required scopes for full access
  const REQUIRED_SCOPES = [
    'https://www.googleapis.com/auth/drive',           // Full access to all files
    'https://www.googleapis.com/auth/drive.appdata',   // Access to application-specific data
    'https://www.googleapis.com/auth/drive.file',      // Access to files created by the app
    'https://www.googleapis.com/auth/drive.metadata',  // View and manage metadata
    'https://www.googleapis.com/auth/drive.scripts'    // Access to Apps Script files
  ]

  // Validate token scopes
  const validateTokenScopes = async (accessToken: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
      )

      if (!response.ok) {
        console.error(`Token validation error: ${response.status} ${response.statusText}`)
        return false
      }

      const data = await response.json()
      console.log("Token validation response:", data)
      
      if (!data.scope) return false
      
      const scopes = data.scope.split(' ')
      const hasAllRequiredScopes = REQUIRED_SCOPES.every(requiredScope => 
        scopes.some(scope => scope.includes(requiredScope))
      )
      
      console.log("Token has all required scopes:", hasAllRequiredScopes)
      
      if (!hasAllRequiredScopes) {
        toast({
          variant: "destructive",
          title: "Google Drive Authorization Issue",
          description: "Your Google Drive token is missing some required permissions. Please reconnect with full access."
        })
      }
      
      return hasAllRequiredScopes
    } catch (error) {
      console.error("Error validating token scopes:", error)
      return false
    }
  }

  // Attempt to refresh the token if possible
  const refreshToken = async (userId: string, refreshToken: string): Promise<string | null> => {
    try {
      console.log("Attempting to refresh Google Drive token")
      
      // In a real implementation, you would make a server call to refresh the token
      // For now, we'll just log it and return null
      console.log("Token refresh functionality needs server-side implementation")
      
      return null
    } catch (error) {
      console.error("Error refreshing token:", error)
      return null
    }
  }

  const getTokens = async () => {
    try {
      console.log("Getting Google Drive tokens...")
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("Error getting session:", sessionError)
        throw new Error("Failed to get authentication session")
      }
      
      const providerToken = sessionData?.session?.provider_token
      console.log("Provider token available from session:", !!providerToken)
      
      let storedToken = null
      let storedRefreshToken = null
      if (sessionData?.session?.user) {
        try {
          const { data: tokenData, error: tokenError } = await supabase
            .from('google_drive_access')
            .select('access_token, refresh_token')
            .eq('user_id', sessionData.session.user.id)
            .maybeSingle()
            
          if (tokenError) {
            console.error("Error querying token from database:", tokenError)
          } else {
            storedToken = tokenData?.access_token
            storedRefreshToken = tokenData?.refresh_token
            console.log("Retrieved stored token from database:", !!storedToken)
          }
        } catch (dbError) {
          console.error("Error retrieving token from database:", dbError)
        }
      }

      let finalToken = providerToken || storedToken
      
      let isValidToken = false
      if (finalToken) {
        isValidToken = await validateTokenScopes(finalToken)
        
        if (!isValidToken && storedRefreshToken && sessionData?.session?.user) {
          const refreshedToken = await refreshToken(sessionData.session.user.id, storedRefreshToken)
          if (refreshedToken) {
            finalToken = refreshedToken
            isValidToken = true
          }
        }
      }

      return {
        authToken: sessionData?.session?.access_token,
        driveToken: finalToken,
        isValidToken,
        session: sessionData?.session
      }
    } catch (error) {
      console.error("Error getting tokens:", error)
      throw error
    }
  }

  return { getTokens }
}
