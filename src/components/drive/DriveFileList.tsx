
import { Button } from "@/components/ui/button"
import { RefreshCw, Search, FileType, Loader2, AlertTriangle } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { GoogleDriveAuth } from "./GoogleDriveAuth"
import { DriveBatchQuery } from "./DriveBatchQuery"
import { DriveFilesList } from "./DriveFilesList"
import { useGoogleDriveFiles } from "@/hooks/useGoogleDriveFiles"
import { useGoogleDriveAnalysis } from "@/hooks/useGoogleDriveAnalysis"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useGoogleDriveToken } from "@/hooks/useGoogleDriveToken"
import { SearchParams } from "@/hooks/useGoogleDriveFiles" // Import the SearchParams type

const MIME_TYPE_FILTERS = {
  'All Files': 'all_files',
  'Documents': 'application/vnd.google-apps.document',
  'Spreadsheets': 'application/vnd.google-apps.spreadsheet',
  'PDFs': 'application/pdf',
  'Images': 'image/',
  'Videos': 'video/',
}

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
      <GoogleDriveAuth /> {/* Removed the onReconnectSuccess prop */}
      
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

          {tokenError && (
            <Alert variant="destructive" className="mb-2">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription className="flex justify-between items-center">
                <span>{tokenError}</span>
                <Button size="sm" onClick={handleReconnect}>Reconnect</Button>
              </AlertDescription>
            </Alert>
          )}

          {filesError && (
            <Alert variant="destructive" className="mb-2">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertTitle>Error Loading Files</AlertTitle>
              <AlertDescription>
                {typeof filesError === 'string' ? filesError : 'Failed to load Drive files. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

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
              onValueChange={handleMimeTypeChange}
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
