
import { DriveFileList } from "@/components/drive/DriveFileList"
import { useEffect, useState } from "react"
import { GoogleDriveAuth } from "@/components/drive/GoogleDriveAuth"
import { GoogleDriveStatus } from "@/components/drive/GoogleDriveStatus"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/components/auth/AuthProvider"

const Drive = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  
  // Add a delay to allow the auth flow to complete and components to initialize
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      {/* Auth status card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Google Drive Connection</CardTitle>
          <CardDescription>
            Connect your Google Drive account to access and analyze your files
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <>
              <GoogleDriveAuth />
              <div className="mt-4">
                <GoogleDriveStatus />
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">
              Please sign in to connect your Google Drive account
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* File list */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <DriveFileList />
      )}
    </div>
  )
}

export default Drive
