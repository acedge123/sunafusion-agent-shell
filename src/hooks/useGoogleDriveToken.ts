
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

export const useGoogleDriveToken = () => {
  const { user } = useAuth()
  const { toast } = useToast()

  // Required scopes for full Drive functionality
  const REQUIRED_SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive.file'
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
      
      // Check if all required scopes are included
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
          description: "Your Google Drive token is missing some required permissions. Please reconnect."
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
      
      // Get the current session for the auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("Error getting session:", sessionError)
        throw new Error("Failed to get authentication session")
      }
      
      const providerToken = sessionData?.session?.provider_token
      console.log("Provider token available from session:", !!providerToken)
      
      // If no provider token in session, try to get from database
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

      // Use provider token if available, otherwise use stored token
      let finalToken = providerToken || storedToken
      
      // Validate token scopes if we have a token
      let isValidToken = false
      if (finalToken) {
        isValidToken = await validateTokenScopes(finalToken)
        
        // If token is invalid but we have a refresh token, try to refresh
        if (!isValidToken && storedRefreshToken && sessionData?.session?.user) {
          const refreshedToken = await refreshToken(sessionData.session.user.id, storedRefreshToken)
          if (refreshedToken) {
            finalToken = refreshedToken
            isValidToken = true
            
            // Store the new token in database
            if (sessionData.session.user.id) {
              try {
                await supabase
                  .from('google_drive_access')
                  .upsert({
                    user_id: sessionData.session.user.id,
                    access_token: refreshedToken,
                    token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                  }, {
                    onConflict: 'user_id'
                  })
                  
                console.log("Updated token in database after refresh")
              } catch (storeError) {
                console.error("Error storing refreshed token:", storeError)
              }
            }
          }
        }
      }

      // Store provider token if available and valid
      if (providerToken && sessionData?.session?.user?.id) {
        try {
          const { error: upsertError } = await supabase
            .from('google_drive_access')
            .upsert({
              user_id: sessionData.session.user.id,
              access_token: providerToken,
              token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            })
            
          if (upsertError) {
            console.error("Error storing Google Drive token:", upsertError)
          } else {
            console.log("Successfully stored Google Drive token")
          }
        } catch (storeError) {
          console.error("Error in token storage:", storeError)
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
