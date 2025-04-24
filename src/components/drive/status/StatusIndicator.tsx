
import { Check, AlertCircle, AlertTriangle } from "lucide-react"

export type StatusState = 'valid' | 'invalid' | 'checking' | 'unknown'

interface StatusIndicatorProps {
  status: StatusState
  title: string
  description: {
    valid: string
    invalid: string
    checking: string
    unknown: string
  }
}

export const StatusIndicator = ({ status, title, description }: StatusIndicatorProps) => {
  return (
    <div className="flex items-center gap-2">
      {status === 'valid' && (
        <Check className="text-green-500 h-5 w-5" />
      )}
      {status === 'invalid' && (
        <AlertCircle className="text-red-500 h-5 w-5" />
      )}
      {(status === 'checking' || status === 'unknown') && (
        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/20"></div>
      )}
      
      <div>
        <p className="font-medium">
          {title}
        </p>
        <p className="text-xs text-muted-foreground">
          {description[status]}
        </p>
      </div>
    </div>
  )
}
