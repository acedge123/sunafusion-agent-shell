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

      console.log("Fetching files with search parameters:", searchParams)
      
      // Increase page size to retrieve more files
      let queryParams = new URLSearchParams({
        fields: 'nextPageToken, files(id,name,mimeType,thumbnailLink,webViewLink,description,modifiedTime,size,iconLink,fileExtension,parents)',
        pageSize: '100'  // Increased from 25 to 100
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
      
      const response = await withRetry(
        () => fetch(`https://www.googleapis.com/drive/v3/files?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${driveToken}`
          }
        }),
        3,
        1000
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Google API error (${response.status}): ${errorText}`)
        
        throw new Error(`Google Drive API error: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log(`Total files found: ${data.files?.length || 0}`)
      console.log('Files:', data.files || [])
      
      // Update next page token
      setNextPageToken(data.nextPageToken || null)
      setHasMore(!!data.nextPageToken)
      
      // Update files list (append or replace)
      setFiles(prev => append ? [...prev, ...(data.files || [])] : (data.files || []))
      setError(null)
    } catch (error) {
      console.error("Error fetching files:", error)
      
      const parsedError = parseGoogleDriveError(error)
      setError(parsedError.message)
      displayDriveError(parsedError)
      
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
