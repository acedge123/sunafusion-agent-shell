
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { GoogleDriveAuth } from "./GoogleDriveAuth"
import { DriveBatchQuery } from "./DriveBatchQuery"
import { DriveFilesList } from "./DriveFilesList"
import { useGoogleDriveFiles } from "@/hooks/useGoogleDriveFiles"
import { useGoogleDriveAnalysis } from "@/hooks/useGoogleDriveAnalysis"
import { useEffect } from "react"

export const DriveFileList = () => {
  const { user } = useAuth()
  const { files, loading, fetchFiles } = useGoogleDriveFiles()
  const { analyzing, analyzeFile } = useGoogleDriveAnalysis()
  
  // Auto-fetch files when component mounts
  useEffect(() => {
    if (user) {
      fetchFiles()
    }
  }, [user])
  
  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <GoogleDriveAuth />
      
      <div className="p-4 border rounded-lg bg-card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Google Drive Files</h2>
          <Button 
            onClick={fetchFiles} 
            variant="outline" 
            disabled={loading}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
