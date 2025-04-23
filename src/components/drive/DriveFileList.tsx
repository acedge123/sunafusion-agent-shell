
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Loader2, Search, LogIn } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

export const DriveFileList = () => {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [batchQuery, setBatchQuery] = useState("")
  const [batchProcessing, setBatchProcessing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { toast } = useToast()

  const initiateGoogleAuth = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('drive-ai-assistant', {
        body: {
          action: "getAuthUrl"
        }
      })

      if (error) throw error
      
      // Open Google's auth page in a new window
      window.location.href = data.url
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to start Google authentication"
      })
    }
  }

  const checkGoogleAuth = async () => {
    try {
      const { data: accessData, error } = await supabase
        .from('google_drive_access')
        .select('access_token')
        .eq('user_id', supabase.auth.getUser().then(({ data }) => data.user?.id))
        .maybeSingle()

      setIsAuthenticated(!!accessData?.access_token)
    } catch (error) {
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    checkGoogleAuth()
  }, [])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const { data: accessData } = await supabase
        .from('google_drive_access')
        .select('access_token')
        .single()

      if (accessData?.access_token) {
        const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType)', {
          headers: {
            'Authorization': `Bearer ${accessData.access_token}`
          }
        })
        const data = await response.json()
        setFiles(data.files || [])
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch files"
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

  const handleBatchQuery = async () => {
    if (!batchQuery.trim()) {
      toast({
        variant: "destructive",
        title: "Query Required",
        description: "Please enter a query to analyze files"
      })
      return
    }

    setBatchProcessing(true)
    try {
      const response = await supabase.functions.invoke('unified-agent', {
        body: {
          query: batchQuery,
          include_web: true,
          include_drive: true
        }
      })

      if (response.error) throw response.error

      toast({
        title: "Analysis Complete",
        description: "The agent has processed your query successfully."
      })

      // Redirect to the Chat page with the result
      window.location.href = `/chat?query=${encodeURIComponent(batchQuery)}&result=${encodeURIComponent(JSON.stringify(response.data))}`
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Query Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    } finally {
      setBatchProcessing(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles()
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4 space-y-4">
        <h2 className="text-xl font-semibold">Connect to Google Drive</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Sign in with your team@thegig.agency account to access and analyze documents from Google Drive
        </p>
        <Button onClick={initiateGoogleAuth} size="lg">
          <LogIn className="mr-2 h-4 w-4" />
          Sign in with Google
        </Button>
      </div>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Google Drive Files</h2>
        <div className="space-x-2">
          <Button onClick={fetchFiles} variant="outline">Refresh</Button>
          <Button onClick={initiateGoogleAuth} variant="outline">
            <LogIn className="mr-2 h-4 w-4" />
            Change Account
          </Button>
        </div>
      </div>
      
      <div className="p-4 border border-muted rounded-lg bg-muted/50">
        <h3 className="font-medium mb-2">Ask about your documents</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter a question about your documents..."
            value={batchQuery}
            onChange={(e) => setBatchQuery(e.target.value)}
            disabled={batchProcessing}
            className="flex-1"
          />
          <Button 
            onClick={handleBatchQuery}
            disabled={batchProcessing || !batchQuery.trim()}
          >
            {batchProcessing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              <><Search className="mr-2 h-4 w-4" /> Search</>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Ask questions about your documents or search for specific information across your files.
        </p>
      </div>
      
      <div className="grid gap-4">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
            <span>{file.name}</span>
            <Button 
              onClick={() => analyzeFile(file.id)}
              disabled={analyzing === file.id}
            >
              {analyzing === file.id ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                'Analyze with AI'
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
