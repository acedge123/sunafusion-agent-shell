import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { GoogleDriveState, TokenCacheItem, TokenInfo } from "@/types/googleDrive"
import { validateGoogleToken, hasRequiredScopes } from "@/utils/googleDriveValidation"
import { getStoredToken, storeToken } from "@/utils/googleDriveStorage"
import { withRetry, parseGoogleDriveError, displayDriveError, GoogleDriveErrorType } from "@/utils/googleDriveErrors"

export const useGoogleDrive = () => {
  const navigate = useNavigate()
  const [state, setState] = useState<GoogleDriveState>({
    isAuthorizing: false,
    isAuthenticated: false,
    tokenStatus: 'checking',
    scopeStatus: 'checking'
  })
  const { user } = useAuth()
  const { toast } = useToast()
  const tokenCache = useRef<Map<string, TokenCacheItem>>(new Map())
  const retryCount = useRef<number>(0)
  const maxRetries = 3

  const getToken = useCallback(async (): Promise<TokenInfo> => {
    try {
      setState(prev => ({ ...prev, tokenStatus: 'checking', scopeStatus: 'checking' }))
      
      const { data: sessionData } = await supabase.auth.getSession()
      let finalToken = sessionData?.session?.provider_token || null
      
      if (!finalToken && user) {
        try {
          const { accessToken } = await getStoredToken(user.id)
          if (accessToken) {
            finalToken = accessToken
          }
        } catch (storageError) {
          console.error("Error retrieving stored token:", storageError)
          // Continue with null token - will be handled below
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
      
      try {
        const { isValid, scopes } = await withRetry(
          () => validateGoogleToken(finalToken!, tokenCache.current),
          maxRetries
        )
        
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
      } catch (validationError) {
        const parsedError = parseGoogleDriveError(validationError)
        console.error("Token validation error:", parsedError)
        
        if (parsedError.type !== GoogleDriveErrorType.AUTH_ERROR) {
          displayDriveError(parsedError)
        }
        
        setState(prev => ({ 
          ...prev, 
          tokenStatus: 'invalid', 
          scopeStatus: 'unknown',
          isAuthenticated: false 
        }))
        return { token: null, isValid: false, session: sessionData?.session }
      }
    } catch (error) {
      console.error("Error in getToken:", error)
      
      const parsedError = parseGoogleDriveError(error)
      displayDriveError(parsedError)
      
      setState(prev => ({ 
        ...prev, 
        tokenStatus: 'unknown', 
        scopeStatus: 'unknown',
        isAuthenticated: false 
      }))
      return { token: null, isValid: false, session: null }
    }
  }, [user, toast])

  const initiateAuth = async () => {
    setState(prev => ({ ...prev, isAuthorizing: true }))
    retryCount.current = 0
    
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
      const parsedError = parseGoogleDriveError(error)
      console.error("Authorization error:", parsedError)
      
      displayDriveError({
        type: GoogleDriveErrorType.AUTH_ERROR,
        message: parsedError.message || "Failed to start Google authorization",
        isRetryable: false
      })
    } finally {
      setState(prev => ({ ...prev, isAuthorizing: false }))
    }
  }

  useEffect(() => {
    if (!user) return

    const handleOAuthResponse = async () => {
      if (window.location.hash || window.location.search.includes('code=')) {
        setState(prev => ({ ...prev, isAuthorizing: true }))
        
        try {
          const { data: sessionData } = await supabase.auth.getSession()
          
          if (sessionData?.session?.provider_token && user.id) {
            await storeToken(
              user.id,
              sessionData.session.provider_token,
              sessionData.session.refresh_token
            )

            try {
              const { isValid, scopes } = await validateGoogleToken(
                sessionData.session.provider_token,
                tokenCache.current
              )

              setState(prev => ({ 
                ...prev, 
                isAuthenticated: isValid && hasRequiredScopes(scopes),
                tokenStatus: isValid ? 'valid' : 'invalid',
                scopeStatus: hasRequiredScopes(scopes) ? 'valid' : 'invalid'
              }))

              window.history.replaceState({}, document.title, window.location.pathname)
              
              if (isValid && hasRequiredScopes(scopes)) {
                navigate('/')
                setTimeout(() => {
                  toast({
                    title: "Google Drive Connected",
                    description: "Your Google Drive is now connected successfully."
                  })
                }, 100)
              } else if (!isValid) {
                displayDriveError({
                  type: GoogleDriveErrorType.AUTH_ERROR,
                  message: "Invalid authentication token received from Google.",
                  isRetryable: false
                })
              } else if (!hasRequiredScopes(scopes)) {
                displayDriveError({
                  type: GoogleDriveErrorType.PERMISSION_ERROR,
                  message: "Insufficient permissions granted. Please reconnect with all required permissions.",
                  isRetryable: false
                })
              }
            } catch (validationError) {
              displayDriveError(validationError)
            }
          }
        } catch (error) {
          displayDriveError(error)
        } finally {
          setState(prev => ({ ...prev, isAuthorizing: false }))
        }
      }
    }

    handleOAuthResponse()
  }, [user, toast, navigate])

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
