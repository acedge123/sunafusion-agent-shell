
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { DriveFile } from "@/hooks/useGoogleDriveFiles"

interface DriveFilesListProps {
  files: DriveFile[]
  loading: boolean
  analyzing: string | null
  onAnalyze: (fileId: string) => void
}

export const DriveFilesList = ({ files, loading, analyzing, onAnalyze }: DriveFilesListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading files...</span>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No files found in your Google Drive.</p>
        <p className="text-sm mt-2">Files you have access to will appear here.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {files.map((file) => (
        <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1 truncate mr-4">
            <span className="font-medium">{file.name}</span>
            <p className="text-xs text-muted-foreground">{file.mimeType}</p>
          </div>
          <Button 
            onClick={() => onAnalyze(file.id)}
            disabled={analyzing === file.id}
            size="sm"
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
  )
}
