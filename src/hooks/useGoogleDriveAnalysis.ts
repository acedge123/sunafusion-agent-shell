
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useGoogleDrive } from "@/hooks/useGoogleDrive"
import { withRetry, parseGoogleDriveError, displayDriveError, GoogleDriveErrorType } from "@/utils/googleDriveErrors"

export const useGoogleDriveAnalysis = () => {
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { getToken } = useGoogleDrive()

  const analyzeFile = async (fileId: string) => {
    setAnalyzing(fileId)
    setError(null)
    
    try {
      // Get the token with retry logic
      const { token: driveToken, isValid, session } = await getToken()
      const authToken = session?.access_token
      
      if (!driveToken) {
        const errorMessage = "No Google Drive token found. Please connect your Google Drive account."
        setError(errorMessage)
        throw new Error(errorMessage)
      }
      
      if (!isValid) {
        const errorMessage = "Your Google Drive token has insufficient permissions or is invalid. Please reconnect."
        setError(errorMessage)
        throw new Error(errorMessage)
      }
      
      console.log("Calling drive-ai-assistant edge function...")
      console.log("File ID:", fileId)
      console.log("Auth token present:", !!authToken)
      console.log("Drive token present:", !!driveToken)
      
      // Use retry for the API call
      const response = await withRetry(
        () => supabase.functions.invoke('drive-ai-assistant', {
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
        }),
        3, // max retries
        1000 // base delay
      )

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
      
      // Parse and handle the error
      const parsedError = parseGoogleDriveError(error)
      
      // Set error message based on error type
      let errorMessage = parsedError.message
      
      if (parsedError.type === GoogleDriveErrorType.AUTH_ERROR) {
        errorMessage = "Authentication error. Please reconnect your Google Drive account."
      } else if (parsedError.type === GoogleDriveErrorType.PERMISSION_ERROR) {
        errorMessage = "You don't have permission to access this file. Check your Google Drive permissions."
      } else if (parsedError.type === GoogleDriveErrorType.RATE_LIMIT_ERROR) {
        errorMessage = "Google Drive API rate limit reached. Please try again in a few moments."
      }
      
      setError(errorMessage)
      
      // Don't display toast if error was already set explicitly (due to token validation)
      if (!error.message?.includes("No Google Drive token") && 
          !error.message?.includes("insufficient permissions")) {
        displayDriveError(parsedError)
      }
      
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
