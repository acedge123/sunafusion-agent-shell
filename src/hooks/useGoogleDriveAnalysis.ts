
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useGoogleDrive } from "@/hooks/useGoogleDrive"

export const useGoogleDriveAnalysis = () => {
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { getToken } = useGoogleDrive()

  const analyzeFile = async (fileId: string) => {
    setAnalyzing(fileId)
    setError(null)
    
    try {
      const { token: driveToken, isValid, session } = await getToken()
      const authToken = session?.access_token
      
      if (!driveToken) {
        setError("No Google Drive token found. Please connect your Google Drive account.")
        throw new Error("No Google Drive token available")
      }
      
      if (!isValid) {
        setError("Your Google Drive token has insufficient permissions or is invalid. Please reconnect.")
        throw new Error("Invalid Google Drive token")
      }
      
      console.log("Calling drive-ai-assistant edge function...")
      console.log("File ID:", fileId)
      console.log("Auth token present:", !!authToken)
      console.log("Drive token present:", !!driveToken)
      
      const response = await supabase.functions.invoke('drive-ai-assistant', {
        body: {
          action: "Please analyze this document and provide a summary.",
          fileId,
          provider_token: driveToken,
          debug_token_info: {
            hasProviderToken: !!session?.provider_token,
            hasStoredToken: !!driveToken,
            tokenSource: session?.provider_token ? 'provider_token' : (driveToken ? 'database' : 'none')
          }
        },
        headers: authToken ? {
          Authorization: `Bearer ${authToken}`
        } : undefined
      })

      if (response.error) {
        console.error("Edge function error:", response.error)
        setError(`Analysis failed: ${response.error.message || "Unknown error"}`)
        throw response.error
      }

      toast({
        title: "Analysis Complete",
        description: response.data.result
      })
      
      return response.data.result
    } catch (error) {
      console.error("Error analyzing file:", error)
      
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      
      // Don't display toast if error was already set (due to token validation)
      if (!error) {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: errorMessage
        })
      }
      
      setError(errorMessage)
      return null
    } finally {
      setAnalyzing(null)
    }
  }

  return {
    analyzing,
    analyzeFile,
    error
  }
}
