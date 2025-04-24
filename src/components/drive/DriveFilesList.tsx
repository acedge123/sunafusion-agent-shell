
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, HardDrive } from "lucide-react"
import type { DriveFile } from "@/hooks/useGoogleDriveFiles"
import { format } from "date-fns"

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
            {file.thumbnailLink ? (
              <img 
                src={file.thumbnailLink} 
                alt={file.name}
                className="w-10 h-10 object-cover rounded"
              />
            ) : file.iconLink ? (
              <img 
                src={file.iconLink} 
                alt={file.mimeType}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                <HardDrive className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
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
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{file.mimeType}</span>
                {file.modifiedTime && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(file.modifiedTime), 'MMM d, yyyy')}
                  </span>
                )}
                {file.size && (
                  <span>
                    {formatFileSize(parseInt(file.size))}
                  </span>
                )}
              </div>
              {file.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {file.description}
                </p>
              )}
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

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
