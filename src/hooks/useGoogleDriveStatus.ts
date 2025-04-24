
import { useState, useEffect } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import type { StatusState } from "@/components/drive/status/StatusIndicator"

export const useGoogleDriveStatus = () => {
  const [tokenStatus, setTokenStatus] = useState<StatusState>('checking')
  const [scopeStatus, setScopeStatus] = useState<StatusState>('checking')
  const [isChecking, setIsChecking] = useState(false)
  const { toast } = useToast()

  const checkDriveToken = async () => {
    setIsChecking(true)
    setTokenStatus('checking')
    setScopeStatus('checking')
    
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      let accessToken = sessionData?.session?.provider_token
      
      if (!accessToken && sessionData?.session?.user) {
        try {
          const { data: tokenData } = await supabase
            .from('google_drive_access')
            .select('access_token')
            .eq('user_id', sessionData.session.user.id)
            .maybeSingle()
            
          accessToken = tokenData?.access_token
        } catch (dbError) {
          console.error('Error retrieving token from database:', dbError)
        }
      }
      
      if (!accessToken) {
        setTokenStatus('invalid')
        setScopeStatus('unknown')
        return
      }
      
      const response = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + accessToken)
      
      if (response.ok) {
        const data = await response.json()
        setTokenStatus('valid')
        
        const hasReadScope = data.scope && (
          data.scope.includes('https://www.googleapis.com/auth/drive.readonly') || 
          data.scope.includes('https://www.googleapis.com/auth/drive')
        )
        const hasMetadataScope = data.scope && data.scope.includes('https://www.googleapis.com/auth/drive.metadata.readonly')
        const hasFileScope = data.scope && data.scope.includes('https://www.googleapis.com/auth/drive.file')
        
        if (!hasReadScope || !hasMetadataScope || !hasFileScope) {
          setScopeStatus('invalid')
          toast({
            variant: "default",
            title: "Token Scope Issue",
            description: "Your Google Drive token is missing some required scopes. Consider reconnecting."
          })
        } else {
          setScopeStatus('valid')
          toast({
            title: "Token Valid",
            description: "Your Google Drive connection is working correctly"
          })
        }
        
        await testApiCall(accessToken)
      } else {
        setTokenStatus('invalid')
        setScopeStatus('unknown')
      }
    } catch (error) {
      console.error("Error checking token:", error)
      setTokenStatus('unknown')
      setScopeStatus('unknown')
    } finally {
      setIsChecking(false)
    }
  }

  const testApiCall = async (accessToken: string) => {
    try {
      const filesResponse = await fetch(
        'https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType)&pageSize=1',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )
      
      if (!filesResponse.ok) {
        setTokenStatus('invalid')
        console.error(`API test failed: ${filesResponse.status} ${filesResponse.statusText}`)
        const errorText = await filesResponse.text()
        console.error(`API error: ${errorText}`)
      }
    } catch (apiError) {
      console.error("API test error:", apiError)
      setTokenStatus('invalid')
    }
  }

  useEffect(() => {
    checkDriveToken()
  }, [])

  return {
    tokenStatus,
    scopeStatus,
    isChecking,
    checkDriveToken
  }
}
