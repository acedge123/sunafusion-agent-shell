
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { GoogleDriveAuth } from "./GoogleDriveAuth"
import { DriveBatchQuery } from "./DriveBatchQuery"
import { DriveFilesList } from "./DriveFilesList"
import { useGoogleDriveFiles } from "@/hooks/useGoogleDriveFiles"
import { useGoogleDriveAnalysis } from "@/hooks/useGoogleDriveAnalysis"
import { useToast } from "@/components/ui/use-toast"
import { SearchParams } from "@/hooks/useGoogleDriveFiles" // Import the SearchParams type
import { DriveSearchBar } from "./search/DriveSearchBar"
import { DriveErrorAlert } from "./error/DriveErrorAlert"
import { MIME_TYPE_FILTERS } from "./utils/driveConstants"
import { useGoogleDriveToken } from "@/hooks/useGoogleDriveToken"

export const DriveFileList = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const { files, loading, hasMore, fetchFiles, loadMore } = useGoogleDriveFiles()
  const { analyzing, analyzeFile, error: analysisError } = useGoogleDriveAnalysis()
  const { getTokens } = useGoogleDriveToken()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMimeType, setSelectedMimeType] = useState("")
  const [loadingMore, setLoadingMore] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [filesError, setFilesError] = useState<string | null>(null)
  
  useEffect(() => {
    if (user) {
      checkTokenAndFetchFiles()
    }
  }, [user])
  
  const checkTokenAndFetchFiles = async () => {
    try {
      const { driveToken, isValidToken } = await getTokens()
      
      if (!driveToken) {
        setTokenError("No Google Drive token found. Please connect your Google Drive account.")
        return
      }
      
      if (!isValidToken) {
        setTokenError("Your Google Drive token has insufficient permissions or is invalid. Please reconnect.")
        return
      }
      
      setTokenError(null)
      fetchFiles()
    } catch (error) {
      console.error("Error checking token:", error)
      setTokenError("Error validating Google Drive connection. Please try reconnecting.")
    }
  }

  const handleSearch = () => {
    const searchParams: SearchParams = {}
    if (searchQuery) searchParams.query = searchQuery
    if (selectedMimeType && selectedMimeType !== 'all_files') {
      searchParams.mimeType = selectedMimeType
    }
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

  const handleMimeTypeChange = (value: string) => {
    setSelectedMimeType(value)
  }
  
  const handleReconnect = async () => {
    setTokenError(null)
    toast({
      title: "Reconnecting to Google Drive",
      description: "Please complete the authorization process."
    })
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
              onClick={() => fetchFiles({
                mimeType: selectedMimeType !== 'all_files' ? selectedMimeType : ''
              })} 
              variant="outline" 
              disabled={loading}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <DriveErrorAlert error={tokenError} onReconnect={handleReconnect} />
          <DriveErrorAlert error={filesError} />

          <DriveSearchBar
            searchQuery={searchQuery}
            selectedMimeType={selectedMimeType}
            loading={loading}
            onSearchQueryChange={setSearchQuery}
            onMimeTypeChange={setSelectedMimeType}
            onSearch={handleSearch}
          />
        </div>
        
        <DriveBatchQuery />
        
        <DriveFilesList
          files={files}
          loading={loading}
          analyzing={analyzing}
          onAnalyze={analyzeFile}
          analysisError={analysisError}
          error={filesError}
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
