
import { supabase } from "@/integrations/supabase/client"

export const getStoredToken = async (userId: string | undefined): Promise<{
  accessToken: string | null
  refreshToken: string | null
}> => {
  if (!userId) return { accessToken: null, refreshToken: null }
  
  try {
    const { data: tokenData, error } = await supabase
      .from('google_drive_access')
      .select('access_token, refresh_token, token_expires_at')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching token:', error)
      return { accessToken: null, refreshToken: null }
    }

    if (!tokenData) {
      return { accessToken: null, refreshToken: null }
    }

    // Check if token is expired
    const tokenExpiresAt = tokenData.token_expires_at ? new Date(tokenData.token_expires_at) : null
    const isExpired = tokenExpiresAt && tokenExpiresAt < new Date()

    if (isExpired) {
      console.log('Token expired, will attempt refresh')
      if (tokenData.refresh_token) {
        return { accessToken: null, refreshToken: tokenData.refresh_token }
      }
      return { accessToken: null, refreshToken: null }
    }
    
    return { 
      accessToken: tokenData.access_token || null,
      refreshToken: tokenData.refresh_token || null
    }
  } catch (error) {
    console.error('Error in getStoredToken:', error)
    return { accessToken: null, refreshToken: null }
  }
}

export const storeToken = async (userId: string, accessToken: string, refreshToken?: string | null) => {
  try {
    const { error } = await supabase
      .from('google_drive_access')
      .upsert({
        user_id: userId,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error("Error storing token:", error)
      return false
    }
    return true
  } catch (error) {
    console.error("Error in storeToken:", error)
    return false
  }
}
