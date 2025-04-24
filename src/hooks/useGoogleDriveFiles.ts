
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useGoogleDrive } from "./useGoogleDrive"
import { withRetry, parseGoogleDriveError, displayDriveError } from "@/utils/googleDriveErrors"

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
  pageToken?: string
}

export const useGoogleDriveFiles = () => {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(false)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { getToken } = useGoogleDrive()

  const fetchFiles = async (searchParams?: SearchParams, append: boolean = false) => {
    setLoading(true)
    setError(null)
    
    try {
      const { token: driveToken, isValid } = await getToken()

      if (!driveToken) {
        throw new Error("No Google Drive access token available")
      }
      
      if (!isValid) {
        throw new Error("Invalid Google Drive token. Please reconnect your Google Drive account.")
      }

      console.log("Making request to Google Drive API with pagination")
      
      // Use retry logic for token validation
      await withRetry(async () => {
        // Validate token first
        const validationResponse = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + driveToken)
        
        if (!validationResponse.ok) {
          const validationErrorText = await validationResponse.text()
          console.error(`Token validation failed: ${validationErrorText}`)
          throw new Error(`Invalid Google Drive token. Validation failed: ${validationResponse.status} ${validationResponse.statusText}`)
        }
        
        const validationData = await validationResponse.json()
        console.log('Token validation response scope:', validationData.scope)
      }, 2)
      
      // Build enhanced search query with pagination
      let queryParams = new URLSearchParams({
        fields: 'nextPageToken, files(id,name,mimeType,thumbnailLink,webViewLink,description,modifiedTime,size,iconLink,fileExtension,parents)',
        pageSize: '25'
      })

      // Add page token if provided
      if (searchParams?.pageToken) {
        queryParams.append('pageToken', searchParams.pageToken)
      }

      // Build search query string
      let searchQuery = []
      
      if (searchParams?.query) {
        searchQuery.push(`(name contains '${searchParams.query}' or fullText contains '${searchParams.query}')`)
      }

      if (searchParams?.mimeType) {
        searchQuery.push(`mimeType = '${searchParams.mimeType}'`)
      }

      if (searchQuery.length > 0) {
        queryParams.append('q', searchQuery.join(' and '))
      }
      
      // Use retry logic for the API call
      const response = await withRetry(
        () => fetch(`https://www.googleapis.com/drive/v3/files?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${driveToken}`
          }
        }),
        3, // max retries
        1000 // base delay
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Google API error (${response.status}): ${errorText}`)
        
        throw new Error(`Google Drive API error: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log(`Received ${data.files?.length || 0} files from Google Drive with pagination`)
      
      // Update next page token
      setNextPageToken(data.nextPageToken || null)
      setHasMore(!!data.nextPageToken)
      
      // Update files list (append or replace)
      setFiles(prev => append ? [...prev, ...(data.files || [])] : (data.files || []))
      setError(null)
    } catch (error) {
      console.error("Error fetching files:", error)
      
      // Parse and display the error
      const parsedError = parseGoogleDriveError(error)
      setError(parsedError.message)
      displayDriveError(parsedError)
      
      // Clear files if not appending
      if (!append) {
        setFiles([])
      }
      
      setNextPageToken(null)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (nextPageToken && !loading) {
      await fetchFiles({ pageToken: nextPageToken }, true)
    }
  }

  return {
    files,
    loading,
    hasMore,
    error,
    fetchFiles,
    loadMore
  }
}
