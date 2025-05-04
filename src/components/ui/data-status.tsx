
import { Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface DataStatusProps {
  status: 'complete' | 'partial' | 'error' | 'cached' | 'loading';
  message?: string;
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export function DataStatus({ 
  status, 
  message, 
  className,
  showIcon = true,
  showText = false
}: DataStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'complete':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          label: "Data Complete",
          defaultMessage: "All data is available and up to date."
        };
      case 'partial':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
          label: "Partial Data",
          defaultMessage: "Some data is missing or incomplete."
        };
      case 'error':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
          label: "Data Error",
          defaultMessage: "There was an error retrieving data."
        };
      case 'cached':
        return {
          icon: <Info className="h-4 w-4 text-blue-500" />,
          label: "Cached Data",
          defaultMessage: "Using previously saved data which may not be current."
        };
      case 'loading':
      default:
        return {
          icon: <span className="h-4 w-4 animate-pulse bg-gray-300 rounded-full"></span>,
          label: "Loading",
          defaultMessage: "Loading data..."
        };
    }
  };

  const { icon, label, defaultMessage } = getStatusConfig();
  const displayMessage = message || defaultMessage;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            {showIcon && icon}
            {showText && (
              <span className="text-xs text-muted-foreground">{label}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{displayMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper function to determine data status from metadata
export function getDataStatus(data: any): DataStatusProps['status'] {
  if (!data) return 'error';
  
  // Check for loading state
  if (data._loading) return 'loading';
  
  // Check for error state
  if (data._error || data._metadata?.error) return 'error';
  
  // Check for cached state
  if (data._metadata?.source === 'local' || data._metadata?.source === 'fallback') {
    return 'cached';
  }
  
  // Check for partial state
  if (data._metadata?.isComplete === false || 
      (Array.isArray(data) && data.some(item => item._metadata?.isComplete === false))) {
    return 'partial';
  }
  
  // Default to complete
  return 'complete';
}
