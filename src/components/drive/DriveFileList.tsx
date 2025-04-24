
import { Button } from "@/components/ui/button"
import { RefreshCw, Search } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { GoogleDriveAuth } from "./GoogleDriveAuth"
import { DriveBatchQuery } from "./DriveBatchQuery"
import { DriveFilesList } from "./DriveFilesList"
import { useGoogleDriveFiles } from "@/hooks/useGoogleDriveFiles"
import { useGoogleDriveAnalysis } from "@/hooks/useGoogleDriveAnalysis"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"

export const DriveFileList = () => {
  const { user } = useAuth()
  const { files, loading, fetchFiles } = useGoogleDriveFiles()
  const { analyzing, analyzeFile } = useGoogleDriveAnalysis()
  const [searchQuery, setSearchQuery] = useState("")
  
  // Auto-fetch files when component mounts
  useEffect(() => {
    if (user) {
      fetchFiles()
    }
  }, [user])
  
  const handleSearch = () => {
    fetchFiles(searchQuery)
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
              onClick={() => fetchFiles()} 
              variant="outline" 
              disabled={loading}
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
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
      </div>
    </div>
  )
}
