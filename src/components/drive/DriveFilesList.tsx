import { FileIcon, AlertTriangle } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"

interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
  modifiedTime?: string
}

interface DriveFilesListProps {
  files: DriveFile[]
  loading: boolean
  analyzing: string | null
  onAnalyze: (fileId: string) => void
  analysisError?: string | null
  error?: string | null
}

export const DriveFilesList = ({ files, loading, analyzing, onAnalyze, analysisError, error }: DriveFilesListProps) => {
  // Helper to render file type icon based on MIME type
  const renderFileIcon = (mimeType: string) => {
    return <FileIcon className="h-4 w-4 text-muted-foreground" />
  }

  const columns = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: { row: any }) => renderFileIcon(row.original.mimeType)
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: { row: any }) => (
        <div className="max-w-[300px] truncate font-medium">
          {row.original.webViewLink ? (
            <a 
              href={row.original.webViewLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline text-blue-600 dark:text-blue-400"
            >
              {row.original.name}
            </a>
          ) : (
            row.original.name
          )}
        </div>
      )
    },
    {
      accessorKey: "mimeType",
      header: "File Type",
      cell: ({ row }: { row: any }) => (
        <div className="text-xs text-muted-foreground">
          {row.original.mimeType.replace('application/', '')}
        </div>
      )
    },
    {
      accessorKey: "modifiedTime",
      header: "Modified",
      cell: ({ row }: { row: any }) => (
        <div className="text-xs text-muted-foreground">
          {row.original.modifiedTime ? 
            format(new Date(row.original.modifiedTime), 'MMM d, yyyy') : 
            'Unknown'}
        </div>
      )
    },
    {
      id: "actions",
      cell: ({ row }: { row: any }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAnalyze(row.original.id)}
            disabled={analyzing === row.original.id}
          >
            {analyzing === row.original.id ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              "Analyze with AI"
            )}
          </Button>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Loading Drive files...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4 px-4 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 rounded-md text-center">
        <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-red-500" />
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No files found in your Google Drive with the current filters.</p>
      </div>
    )
  }

  if (analysisError) {
    return (
      <div className="py-4 px-4 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 rounded-md text-center">
        <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-red-500" />
        <p className="text-sm text-red-600 dark:text-red-400">{analysisError}</p>
      </div>
    )
  }

  return (
    <div className="mt-6 border rounded-md">
      <DataTable columns={columns} data={files} />
    </div>
  )
}
