
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/integrations/supabase/client"

export const useGoogleDriveToken = () => {
  const { user } = useAuth()

  const getTokens = async () => {
    try {
      // Get the current session for the auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("Error getting session:", sessionError)
        throw new Error("Failed to get authentication session")
      }
      
      const providerToken = sessionData?.session?.provider_token
      
      // If no provider token in session, try to get from database
      let storedToken = null
      if (!providerToken && sessionData?.session?.user) {
        try {
          const { data: tokenData, error: tokenError } = await supabase
            .from('google_drive_access')
            .select('access_token')
            .eq('user_id', sessionData.session.user.id)
            .maybeSingle()
            
          if (tokenError) {
            console.error("Error querying token from database:", tokenError)
          } else {
            storedToken = tokenData?.access_token
            console.log("Retrieved stored token from database:", !!storedToken)
          }
        } catch (dbError) {
          console.error("Error retrieving token from database:", dbError)
        }
      }

      // Store provider token if available
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
        driveToken: providerToken || storedToken,
        session: sessionData?.session
      }
    } catch (error) {
      console.error("Error getting tokens:", error)
      throw error
    }
  }

  return { getTokens }
}
