
import { Button } from "@/components/ui/button"
import { RefreshCw, LogIn } from "lucide-react"

interface StatusActionsProps {
  isChecking: boolean
  hasInvalidStatus: boolean
  onCheck: () => void
  onReconnect: () => void
}

export const StatusActions = ({ isChecking, hasInvalidStatus, onCheck, onReconnect }: StatusActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      {hasInvalidStatus && (
        <Button 
          variant="default"
          onClick={onReconnect}
          disabled={isChecking}
          className="bg-primary"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Reconnect to Google Drive
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onCheck}
        disabled={isChecking}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
        Check Status
      </Button>
    </div>
  )
}
