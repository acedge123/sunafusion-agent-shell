
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
        <p className="text-sm mt-2">Try searching with different keywords or refresh the list.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 mt-4">
      {files.map((file) => (
        <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            {file.thumbnailLink && (
              <img 
                src={file.thumbnailLink} 
                alt={file.name}
                className="w-10 h-10 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <div className="font-medium">
                {file.webViewLink ? (
                  <a 
                    href={file.webViewLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {file.name}
                  </a>
                ) : (
                  file.name
                )}
              </div>
              <p className="text-xs text-muted-foreground">{file.mimeType}</p>
            </div>
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
