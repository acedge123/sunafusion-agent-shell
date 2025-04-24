
import { Button } from "@/components/ui/button"
import { RefreshCw, Search, FileType, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { GoogleDriveAuth } from "./GoogleDriveAuth"
import { DriveBatchQuery } from "./DriveBatchQuery"
import { DriveFilesList } from "./DriveFilesList"
import { useGoogleDriveFiles, type SearchParams } from "@/hooks/useGoogleDriveFiles"
import { useGoogleDriveAnalysis } from "@/hooks/useGoogleDriveAnalysis"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Common MIME types for filtering
const MIME_TYPE_FILTERS = {
  'All Files': '',
  'Documents': 'application/vnd.google-apps.document',
  'Spreadsheets': 'application/vnd.google-apps.spreadsheet',
  'PDFs': 'application/pdf',
  'Images': 'image/',
  'Videos': 'video/',
}

export const DriveFileList = () => {
  const { user } = useAuth()
  const { files, loading, hasMore, fetchFiles, loadMore } = useGoogleDriveFiles()
  const { analyzing, analyzeFile } = useGoogleDriveAnalysis()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMimeType, setSelectedMimeType] = useState("")
  const [loadingMore, setLoadingMore] = useState(false)
  
  useEffect(() => {
    if (user) {
      fetchFiles()
    }
  }, [user])
  
  const handleSearch = () => {
    const searchParams: SearchParams = {}
    if (searchQuery) searchParams.query = searchQuery
    if (selectedMimeType) searchParams.mimeType = selectedMimeType
    fetchFiles(searchParams)
  }

  const handleLoadMore = async () => {
    setLoadingMore(true)
    try {
      await loadMore()
    } finally {
      setLoadingMore(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <GoogleDriveAuth />
      
      <div className="p-4 border rounded-lg bg-card">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Google Drive Files</h2>
            <Button 
              onClick={() => fetchFiles({ mimeType: selectedMimeType })} 
              variant="outline" 
              disabled={loading}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select
              value={selectedMimeType}
              onValueChange={setSelectedMimeType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="File type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MIME_TYPE_FILTERS).map(([label, value]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center">
                      <FileType className="h-4 w-4 mr-2" />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleSearch}
              disabled={loading}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
        
        <DriveBatchQuery />
        
        <DriveFilesList
          files={files}
          loading={loading}
          analyzing={analyzing}
          onAnalyze={analyzeFile}
        />

        {hasMore && !loading && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outline"
            >
              {loadingMore ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading more...</>
              ) : (
                'Load More Files'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
