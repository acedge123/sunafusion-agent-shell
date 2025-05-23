
import { useGoogleDrive } from "@/hooks/useGoogleDrive"
import { StatusIndicator } from "./status/StatusIndicator"
import { StatusActions } from "./status/StatusActions"

export const GoogleDriveStatus = () => {
  const { tokenStatus, scopeStatus, isAuthorizing, initiateAuth, getToken } = useGoogleDrive()
  
  const tokenStatusDescriptions = {
    valid: "Your account is successfully connected to Google Drive",
    invalid: "Your connection has expired or is invalid",
    checking: "Verifying your Google Drive connection...",
    unknown: "Could not determine connection status"
  }

  const scopeStatusDescriptions = {
    valid: "Your connection has all required permissions",
    invalid: "Some required permissions are missing",
    checking: "Verifying access permissions...",
    unknown: "Could not determine permission status"
  }

  const hasInvalidStatus = tokenStatus === 'invalid' || scopeStatus === 'invalid'
  
  // Create a function to check token status using the getToken function
  const checkTokenStatus = async () => {
    await getToken()
  }
  
  return (
    <div className="p-4 bg-muted/40 rounded-lg">
      <div className="flex flex-col gap-3">
        <StatusIndicator 
          status={tokenStatus}
          title={
            tokenStatus === 'valid' ? "Google Drive Connected" :
            tokenStatus === 'invalid' ? "Google Drive Connection Invalid" :
            tokenStatus === 'checking' ? "Checking Connection..." :
            "Connection Status Unknown"
          }
          description={tokenStatusDescriptions}
        />
        
        <StatusIndicator 
          status={scopeStatus}
          title={
            scopeStatus === 'valid' ? "Access Permissions Valid" :
            scopeStatus === 'invalid' ? "Limited Permissions" :
            scopeStatus === 'checking' ? "Checking Permissions..." :
            "Permission Status Unknown"
          }
          description={scopeStatusDescriptions}
        />
        
        <StatusActions 
          isChecking={isAuthorizing}
          hasInvalidStatus={hasInvalidStatus}
          onCheck={checkTokenStatus}
          onReconnect={initiateAuth}
        />
      </div>
    </div>
  )
}
