
import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { GoogleDriveState, TokenCacheItem, TokenInfo } from "@/types/googleDrive"
import { validateGoogleToken, hasRequiredScopes } from "@/utils/googleDriveValidation"
import { getStoredToken, storeToken } from "@/utils/googleDriveStorage"

export const useGoogleDrive = () => {
  const [state, setState] = useState<GoogleDriveState>({
    isAuthorizing: false,
    isAuthenticated: false,
    tokenStatus: 'checking',
    scopeStatus: 'checking'
  })
  const { user } = useAuth()
  const { toast } = useToast()
  const tokenCache = useRef<Map<string, TokenCacheItem>>(new Map())

  // Get the token and validate it
  const getToken = useCallback(async (): Promise<TokenInfo> => {
    try {
      setState(prev => ({ ...prev, tokenStatus: 'checking', scopeStatus: 'checking' }))
      
      const { data: sessionData } = await supabase.auth.getSession()
      let finalToken = sessionData?.session?.provider_token || null
      
      if (!finalToken && user) {
        const { accessToken } = await getStoredToken(user.id)
        if (accessToken) {
          finalToken = accessToken
        }
      }
      
      if (!finalToken) {
        setState(prev => ({ 
          ...prev, 
          tokenStatus: 'invalid', 
          scopeStatus: 'unknown',
          isAuthenticated: false 
        }))
        return { token: null, isValid: false, session: sessionData?.session }
      }
      
      const { isValid, scopes } = await validateGoogleToken(finalToken, tokenCache.current)
      const hasValidScopes = hasRequiredScopes(scopes)
      
      setState(prev => ({
        ...prev,
        tokenStatus: isValid ? 'valid' : 'invalid',
        scopeStatus: hasValidScopes ? 'valid' : 'invalid',
        isAuthenticated: isValid && hasValidScopes
      }))
      
      return { 
        token: finalToken, 
        isValid: isValid && hasValidScopes,
        session: sessionData?.session 
      }
    } catch (error) {
      console.error("Error in getToken:", error)
      setState(prev => ({ 
        ...prev, 
        tokenStatus: 'unknown', 
        scopeStatus: 'unknown',
        isAuthenticated: false 
      }))
      return { token: null, isValid: false, session: null }
    }
  }, [user])

  // Initialize Google Drive authentication
  const initiateAuth = async () => {
    setState(prev => ({ ...prev, isAuthorizing: true }))
    
    try {
      const currentDomain = window.location.origin
      const redirectUrl = `${currentDomain}/drive`
      
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
        console.error("OAuth error:", error)
        toast({
          variant: "destructive",
          title: "Authorization Error",
          description: error.message
        })
        return
      }
      
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Authorization error:", error)
      toast({
        variant: "destructive",
        title: "Authorization Error",
        description: error instanceof Error ? error.message : "Failed to start Google authorization"
      })
    } finally {
      setState(prev => ({ ...prev, isAuthorizing: false }))
    }
  }

  // Handle OAuth response
  useEffect(() => {
    if (!user) return

    const handleOAuthResponse = async () => {
      if (window.location.hash || window.location.search.includes('code=')) {
        const { data: sessionData } = await supabase.auth.getSession()
        
        if (sessionData?.session?.provider_token && user.id) {
          await storeToken(
            user.id,
            sessionData.session.provider_token,
            sessionData.session.refresh_token
          )

          const { isValid, scopes } = await validateGoogleToken(
            sessionData.session.provider_token,
            tokenCache.current
          )

          setState(prev => ({ 
            ...prev, 
            isAuthenticated: isValid && hasRequiredScopes(scopes)
          }))

          // Clean URL after successful auth
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      }
    }

    handleOAuthResponse()
  }, [user])

  // Check authentication status on mount and when user changes
  useEffect(() => {
    if (!user) {
      setState(prev => ({ 
        ...prev, 
        isAuthenticated: false,
        tokenStatus: 'unknown',
        scopeStatus: 'unknown'
      }))
      return
    }

    getToken()
  }, [user, getToken])

  return {
    ...state,
    initiateAuth,
    validateToken: (token: string) => validateGoogleToken(token, tokenCache.current),
    getToken
  }
}
