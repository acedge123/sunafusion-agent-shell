
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface GoogleDriveState {
  isAuthorizing: boolean
  isAuthenticated: boolean
  tokenStatus: 'valid' | 'invalid' | 'checking' | 'unknown'
  scopeStatus: 'valid' | 'invalid' | 'checking' | 'unknown'
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

  // Required scopes for full Drive functionality
  const REQUIRED_SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive.file'
  ]

  // Check if stored token exists and is valid
  const checkStoredToken = async () => {
    if (!user) return false
    
    try {
      const { data: tokenData } = await supabase
        .from('google_drive_access')
        .select('access_token')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (!tokenData?.access_token) return false
      
      return validateToken(tokenData.access_token)
    } catch (error) {
      console.error('Error checking stored token:', error)
      return false
    }
  }

  // Validate token and its scopes
  const validateToken = async (token: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`
      )
      
      if (!response.ok) {
        setState(prev => ({ ...prev, tokenStatus: 'invalid', scopeStatus: 'unknown' }))
        return false
      }
      
      const data = await response.json()
      if (!data.scope) {
        setState(prev => ({ ...prev, tokenStatus: 'valid', scopeStatus: 'invalid' }))
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
  }

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
  }, [user])

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
  }, [user])

  return {
    ...state,
    initiateAuth,
    validateToken,
    checkStoredToken
  }
}
