
export interface SearchParams {
  query?: string
  mimeType?: string
  pageToken?: string
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
  modifiedTime?: string
}
