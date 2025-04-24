
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useGoogleDriveToken } from "./useGoogleDriveToken"

export const useGoogleDriveAnalysis = () => {
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const { toast } = useToast()
  const { getTokens } = useGoogleDriveToken()

  const analyzeFile = async (fileId: string) => {
    setAnalyzing(fileId)
    try {
      const { authToken, driveToken, session } = await getTokens()
      
      const response = await supabase.functions.invoke('drive-ai-assistant', {
        body: {
          action: "Please analyze this document and provide a summary.",
          fileId,
          provider_token: driveToken,
          debug_token_info: {
            hasProviderToken: !!session?.provider_token,
            hasStoredToken: !!driveToken,
            userHasSession: !!session,
            tokenSource: session?.provider_token ? 'provider_token' : (driveToken ? 'database' : 'none')
          }
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
      console.error("Error analyzing file:", error)
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
    analyzing,
    analyzeFile
  }
}
