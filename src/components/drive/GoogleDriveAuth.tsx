
import { Button } from "@/components/ui/button"
import { LogIn, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useGoogleDriveAuth } from "@/hooks/useGoogleDriveAuth"
import { GoogleDriveStatus } from "./GoogleDriveStatus"
import { GoogleDriveConfigGuide } from "./GoogleDriveConfigGuide"

interface GoogleDriveAuthProps {
  onReconnectSuccess?: () => Promise<void>
}

export const GoogleDriveAuth = ({ onReconnectSuccess }: GoogleDriveAuthProps = {}) => {
  const { user } = useAuth()
  const { isAuthorizing, isAuthenticated, initiateGoogleAuth } = useGoogleDriveAuth()
  
  // Production domain to display in guidance
  const productionDomain = "www.gigagencygroup.com"

  if (!user) {
    return null
  }

  // Check if the URL contains localhost, which indicates a redirect issue
  const hasRedirectError = window.location.href.includes("localhost") || 
                          (window.location.search && window.location.search.includes("error="))

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold">Connect Google Drive</h3>
      
      {isAuthenticated ? (
        <GoogleDriveStatus />
      ) : (
        <>
          <p className="text-sm text-muted-foreground text-center">
            To enable the AI assistant to search your Google Drive files, you need to authorize access.
          </p>
          <Button 
            onClick={initiateGoogleAuth} 
            disabled={isAuthorizing}
          >
            {isAuthorizing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authorizing...</>
            ) : (
              <><LogIn className="mr-2 h-4 w-4" /> Authorize Google Drive</>
            )}
          </Button>
          <GoogleDriveConfigGuide 
            hasRedirectError={hasRedirectError}
            productionDomain={productionDomain}
          />
        </>
      )}
    </div>
  )
}
