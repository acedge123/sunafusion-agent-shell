
import { useState, useEffect } from 'react'
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

export interface DriveFile {
  id: string
  name: string
  mimeType: string
}

export const useGoogleDriveFiles = () => {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error("User not authenticated")
      }
      
      // First get the session to check for provider_token
      const { data: sessionData } = await supabase.auth.getSession()
      let accessToken = sessionData?.session?.provider_token
      
      // If no provider token available, try to get from the database
      if (!accessToken) {
        const { data: accessData } = await supabase
          .from('google_drive_access')
          .select('access_token')
          .eq('user_id', userData.user.id)
          .maybeSingle()
        
        accessToken = accessData?.access_token
      }
      
      // If we have a provider token, store it in the database for future use
      if (sessionData?.session?.provider_token && userData.user.id) {
        try {
          // Store the token in the database for future use by other components
          const { error: upsertError } = await supabase
            .from('google_drive_access')
            .upsert({
              user_id: userData.user.id,
              access_token: sessionData.session.provider_token,
              // Store the current timestamp plus token expiration time
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

      if (accessToken) {
        const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType)', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`Google API error: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        setFiles(data.files || [])
      } else {
        console.log("No access token found")
        setFiles([])
      }
    } catch (error) {
      console.error("Error fetching files:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch files. Please reconnect your Google Drive."
      })
    } finally {
      setLoading(false)
    }
  }

  const analyzeFile = async (fileId: string) => {
    setAnalyzing(fileId)
    try {
      // Get the current session for the auth token
      const { data: sessionData } = await supabase.auth.getSession()
      const authToken = sessionData?.session?.access_token
      const providerToken = sessionData?.session?.provider_token
      
      const response = await supabase.functions.invoke('drive-ai-assistant', {
        body: {
          action: "Please analyze this document and provide a summary.",
          fileId,
          provider_token: providerToken // Pass provider token explicitly
        },
        headers: authToken ? {
          Authorization: `Bearer ${authToken}`
        } : undefined
      })

      if (response.error) throw response.error

      toast({
        title: "Analysis Complete",
        description: response.data.result
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    } finally {
      setAnalyzing(null)
    }
  }

  return {
    files,
    loading,
    analyzing,
    fetchFiles,
    analyzeFile
  }
}
