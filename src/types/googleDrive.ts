
export interface GoogleDriveState {
  isAuthorizing: boolean
  isAuthenticated: boolean
  tokenStatus: 'valid' | 'invalid' | 'checking' | 'unknown'
  scopeStatus: 'valid' | 'invalid' | 'checking' | 'unknown'
}

export interface TokenCacheItem {
  token: string
  isValid: boolean
  scopes: string[]
  expires: number
}

export interface TokenInfo {
  token: string | null
  isValid: boolean
  session: any
}
