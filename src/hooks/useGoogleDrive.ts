
import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface GoogleDriveState {
  isAuthorizing: boolean
  isAuthenticated: boolean
  tokenStatus: 'valid' | 'invalid' | 'checking' | 'unknown'
  scopeStatus: 'valid' | 'invalid' | 'checking' | 'unknown'
}

type TokenCacheItem = {
  token: string,
  isValid: boolean,
  scopes: string[],
  expires: number
}

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
  const CACHE_VALIDITY_MS = 5 * 60 * 1000 // 5 minutes

  // Required scopes for full Drive functionality
  const REQUIRED_SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive.file'
  ]

  // Get stored token from the database
  const getStoredToken = useCallback(async (): Promise<{accessToken: string | null, refreshToken: string | null}> => {
    if (!user) return { accessToken: null, refreshToken: null }
    
    try {
      const { data: tokenData, error } = await supabase
        .from('google_drive_access')
        .select('access_token, refresh_token, token_expires_at')
        .eq('user_id', user.id)
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
          // We should refresh the token if possible
          // But since this requires a server endpoint, we'll mark it as invalid for now
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
  }, [user])

  // Validate token and its scopes
  const validateToken = useCallback(async (token: string) => {
    try {
      // Check cache first
      const cached = tokenCache.current.get(token)
      if (cached && cached.expires > Date.now()) {
        console.log('Using cached token validation')
        setState(prev => ({ 
          ...prev, 
          tokenStatus: cached.isValid ? 'valid' : 'invalid',
          scopeStatus: cached.isValid && 
                        REQUIRED_SCOPES.every(scope => 
                          cached.scopes.some(s => s.includes(scope))) 
                        ? 'valid' : 'invalid',
          isAuthenticated: cached.isValid && 
                           REQUIRED_SCOPES.every(scope => 
                             cached.scopes.some(s => s.includes(scope)))
        }))
        return cached.isValid && REQUIRED_SCOPES.every(scope => cached.scopes.some(s => s.includes(scope)))
      }

      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`
      )
      
      if (!response.ok) {
        setState(prev => ({ ...prev, tokenStatus: 'invalid', scopeStatus: 'unknown' }))
        // Cache the invalid result
        tokenCache.current.set(token, {
          token,
          isValid: false,
          scopes: [],
          expires: Date.now() + CACHE_VALIDITY_MS
        })
        return false
      }
      
      const data = await response.json()
      if (!data.scope) {
        setState(prev => ({ ...prev, tokenStatus: 'valid', scopeStatus: 'invalid' }))
        // Cache the result
        tokenCache.current.set(token, {
          token,
          isValid: true,
          scopes: [],
          expires: Date.now() + CACHE_VALIDITY_MS
        })
        return false
      }
      
      const scopes = data.scope.split(' ')
      const hasAllRequiredScopes = REQUIRED_SCOPES.every(requiredScope =>
        scopes.some(scope => scope.includes(requiredScope))
      )
      
      setState(prev => ({
        ...prev,
        tokenStatus: 'valid',
        scopeStatus: hasAllRequiredScopes ? 'valid' : 'invalid',
        isAuthenticated: hasAllRequiredScopes
      }))
      
      // Cache the result
      tokenCache.current.set(token, {
        token,
        isValid: true,
        scopes,
        expires: Date.now() + CACHE_VALIDITY_MS
      })
      
      return hasAllRequiredScopes
    } catch (error) {
      console.error('Error validating token:', error)
      setState(prev => ({ 
        ...prev, 
        tokenStatus: 'unknown', 
        scopeStatus: 'unknown',
        isAuthenticated: false
      }))
      return false
    }
  }, [])

  // Unified token getter - gets session token or stored token
  const getToken = useCallback(async (): Promise<{
    token: string | null, 
    isValid: boolean,
    session: any
  }> => {
    try {
      console.log("Getting Google Drive token...")
      setState(prev => ({ ...prev, tokenStatus: 'checking', scopeStatus: 'checking' }))
      
      // First check for a session token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("Error getting session:", sessionError)
        setState(prev => ({ ...prev, tokenStatus: 'unknown', scopeStatus: 'unknown' }))
        return { token: null, isValid: false, session: null }
      }
      
      let finalToken = sessionData?.session?.provider_token || null
      let tokenSource = finalToken ? 'session' : null
      
      // If no session token, try stored token
      if (!finalToken) {
        const { accessToken } = await getStoredToken()
        if (accessToken) {
          finalToken = accessToken
          tokenSource = 'database'
        }
      }
      
      // If no token at all, return
      if (!finalToken) {
        console.log("No token found")
        setState(prev => ({ ...prev, tokenStatus: 'invalid', scopeStatus: 'unknown', isAuthenticated: false }))
        return { token: null, isValid: false, session: sessionData?.session }
      }
      
      console.log(`Token found from ${tokenSource}`)
      
      // Validate the token
      const isValid = await validateToken(finalToken)
      
      return { 
        token: finalToken, 
        isValid, 
        session: sessionData?.session 
      }
    } catch (error) {
      console.error("Error in getToken:", error)
      setState(prev => ({ ...prev, tokenStatus: 'unknown', scopeStatus: 'unknown', isAuthenticated: false }))
      return { token: null, isValid: false, session: null }
    }
  }, [getStoredToken, validateToken])

  // Check if stored token exists and is valid
  const checkStoredToken = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, isAuthenticated: false }))
      return false
    }
    
    setState(prev => ({ 
      ...prev,
      tokenStatus: 'checking',
      scopeStatus: 'checking' 
    }))
    
    const { token, isValid } = await getToken()
    
    return isValid
  }, [user, getToken])

  // Initialize Google Drive authentication
  const initiateAuth = async () => {
    setState(prev => ({ ...prev, isAuthorizing: true }))
    
    try {
      const currentDomain = window.location.origin
      const redirectUrl = `${currentDomain}/drive`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: REQUIRED_SCOPES.join(' '),
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

  // Handle OAuth response and token storage
  useEffect(() => {
    if (!user) return

    const handleOAuthResponse = async () => {
      if (window.location.hash || window.location.search.includes('code=')) {
        try {
          const { data: sessionData } = await supabase.auth.getSession()
          
          if (sessionData?.session?.provider_token) {
            const { error: upsertError } = await supabase
              .from('google_drive_access')
              .upsert({
                user_id: user.id,
                access_token: sessionData.session.provider_token,
                refresh_token: sessionData.session.refresh_token,
                token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id'
              })

            if (upsertError) {
              console.error("Error storing token:", upsertError)
              return
            }

            const isValid = await validateToken(sessionData.session.provider_token)
            setState(prev => ({ ...prev, isAuthenticated: isValid }))

            // Clean URL after successful auth
            window.history.replaceState({}, document.title, window.location.pathname)
          }
        } catch (error) {
          console.error("Error processing OAuth response:", error)
        }
      }
    }

    handleOAuthResponse()
  }, [user, validateToken])

  // Check authentication status on mount and when user changes
  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        setState(prev => ({ 
          ...prev, 
          isAuthenticated: false,
          tokenStatus: 'unknown',
          scopeStatus: 'unknown'
        }))
        return
      }

      setState(prev => ({ 
        ...prev,
        tokenStatus: 'checking',
        scopeStatus: 'checking'
      }))

      const isValid = await checkStoredToken()
      setState(prev => ({ ...prev, isAuthenticated: isValid }))
    }

    checkAuth()
  }, [user, checkStoredToken])

  return {
    ...state,
    initiateAuth,
    validateToken,
    checkStoredToken,
    getToken
  }
}
