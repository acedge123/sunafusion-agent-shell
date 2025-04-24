
import { TokenCacheItem } from "@/types/googleDrive"

const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.file'
]

export const validateGoogleToken = async (
  token: string,
  tokenCache: Map<string, TokenCacheItem>
): Promise<{ isValid: boolean; scopes: string[] }> => {
  try {
    // Check cache first
    const cached = tokenCache.get(token)
    if (cached && cached.expires > Date.now()) {
      console.log('Using cached token validation')
      return { 
        isValid: cached.isValid,
        scopes: cached.scopes
      }
    }

    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`
    )
    
    if (!response.ok) {
      tokenCache.set(token, {
        token,
        isValid: false,
        scopes: [],
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes cache
      })
      return { isValid: false, scopes: [] }
    }
    
    const data = await response.json()
    const scopes = data.scope ? data.scope.split(' ') : []
    const isValid = true

    // Cache the result
    tokenCache.set(token, {
      token,
      isValid,
      scopes,
      expires: Date.now() + 5 * 60 * 1000
    })
    
    return { isValid, scopes }
  } catch (error) {
    console.error('Error validating token:', error)
    return { isValid: false, scopes: [] }
  }
}

export const hasRequiredScopes = (scopes: string[]): boolean => {
  return REQUIRED_SCOPES.every(requiredScope =>
    scopes.some(scope => scope.includes(requiredScope))
  )
}
