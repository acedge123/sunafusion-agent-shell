
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
      
      const { data: accessData } = await supabase
        .from('google_drive_access')
        .select('access_token')
        .eq('user_id', userData.user.id)
        .single()
      
      let accessToken = accessData?.access_token
      
      if (!accessToken) {
        const { data: sessionData } = await supabase.auth.getSession()
        accessToken = sessionData.session?.provider_token
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
      const response = await supabase.functions.invoke('drive-ai-assistant', {
        body: {
          action: "Please analyze this document and provide a summary.",
          fileId
        }
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
