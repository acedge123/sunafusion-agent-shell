
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

export const DriveFileList = () => {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const { toast } = useToast()

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

  useEffect(() => {
    fetchFiles()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Google Drive Files</h2>
        <Button onClick={fetchFiles} variant="outline">Refresh</Button>
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
