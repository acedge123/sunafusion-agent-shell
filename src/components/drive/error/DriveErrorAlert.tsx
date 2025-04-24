
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface DriveErrorAlertProps {
  error: string | null
  onReconnect?: () => void
}

export const DriveErrorAlert = ({ error, onReconnect }: DriveErrorAlertProps) => {
  if (!error) return null

  return (
    <Alert variant="destructive" className="mb-2">
      <AlertTriangle className="h-4 w-4 mr-2" />
      <AlertTitle>Error Loading Files</AlertTitle>
      <AlertDescription className="flex justify-between items-center">
        <span>{error}</span>
        {onReconnect && (
          <Button size="sm" onClick={onReconnect}>Reconnect</Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
