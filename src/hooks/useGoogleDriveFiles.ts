
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useGoogleDriveToken } from "./useGoogleDriveToken"

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  webViewLink?: string
  description?: string
  modifiedTime?: string
  size?: string
  iconLink?: string
  fileExtension?: string
  parents?: string[]
}

export interface SearchParams {
  query?: string
  mimeType?: string
}

export const useGoogleDriveFiles = () => {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { getTokens } = useGoogleDriveToken()

  const fetchFiles = async (searchParams?: SearchParams) => {
    setLoading(true)
    try {
      const { driveToken } = await getTokens()

      if (driveToken) {
        console.log("Making request to Google Drive API with enhanced parameters")
        try {
          // First validate the token
          const validationResponse = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + driveToken)
          
          if (!validationResponse.ok) {
            const validationErrorText = await validationResponse.text()
            console.error(`Token validation failed: ${validationErrorText}`)
            throw new Error(`Invalid Google Drive token. Validation failed: ${validationResponse.status} ${validationResponse.statusText}`)
          }
          
          const validationData = await validationResponse.json()
          console.log('Token validation response scope:', validationData.scope)
          
          // Build enhanced search query with more metadata fields
          let queryParams = new URLSearchParams({
            fields: 'files(id,name,mimeType,thumbnailLink,webViewLink,description,modifiedTime,size,iconLink,fileExtension,parents)',
            orderBy: 'modifiedTime desc',
            pageSize: '50' // Fetch more files per request
          })

          // Build search query string
          let searchQuery = []
          
          // Add text search if provided
          if (searchParams?.query) {
            // Search in both filename and full text
            searchQuery.push(`(name contains '${searchParams.query}' or fullText contains '${searchParams.query}')`)
          }

          // Add MIME type filter if provided
          if (searchParams?.mimeType) {
            searchQuery.push(`mimeType = '${searchParams.mimeType}'`)
          }

          // Combine search conditions
          if (searchQuery.length > 0) {
            queryParams.append('q', searchQuery.join(' and '))
          }
          
          // Make the enhanced files request
          const response = await fetch(`https://www.googleapis.com/drive/v3/files?${queryParams}`, {
            headers: {
              'Authorization': `Bearer ${driveToken}`
            }
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error(`Google API error (${response.status}): ${errorText}`)
            
            if (response.status === 401) {
              toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "Your Google Drive access token has expired. Please reconnect your Google Drive."
              })
            } else if (response.status === 403) {
              toast({
                variant: "destructive",
                title: "Permission Error",
                description: "You don't have permission to access Google Drive. Please reconnect with proper permissions."
              })
            } else {
              toast({
                variant: "destructive",
                title: "Google Drive Error",
                description: `Error accessing Google Drive: ${response.status} ${response.statusText}`
              })
            }
            
            throw new Error(`Google Drive API error: ${response.status} ${response.statusText} - ${errorText}`)
          }
          
          const data = await response.json()
          console.log(`Received ${data.files?.length || 0} files from Google Drive with enhanced metadata`)
          setFiles(data.files || [])
        } catch (apiError) {
          console.error("Error calling Google Drive API:", apiError)
          toast({
            variant: "destructive",
            title: "API Error",
            description: apiError instanceof Error ? apiError.message : "Failed to fetch files from Google Drive"
          })
          setFiles([])
        }
      } else {
        console.log("No access token found")
        setFiles([])
        toast({
          variant: "destructive",
          title: "Authorization Required",
          description: "Please connect your Google Drive account to access your files."
        })
      }
    } catch (error) {
      console.error("Error fetching files:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch files. Please reconnect your Google Drive."
      })
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  return {
    files,
    loading,
    fetchFiles
  }
}
