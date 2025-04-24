import { toast } from "@/hooks/use-toast";

// Error types for Google Drive operations
export enum GoogleDriveErrorType {
  AUTH_ERROR = "auth_error",
  PERMISSION_ERROR = "permission_error",
  RATE_LIMIT_ERROR = "rate_limit_error",
  NETWORK_ERROR = "network_error",
  UNKNOWN_ERROR = "unknown_error",
}

export interface GoogleDriveError {
  type: GoogleDriveErrorType;
  message: string;
  originalError?: any;
  isRetryable: boolean;
}

export const parseGoogleDriveError = (error: any): GoogleDriveError => {
  // Try to parse API response errors
  const errorText = error?.message || error?.toString() || "Unknown error";
  
  // Check for specific error patterns
  if (errorText.includes("401") || errorText.includes("invalid_token") || errorText.includes("expired")) {
    return {
      type: GoogleDriveErrorType.AUTH_ERROR,
      message: "Your Google Drive authorization has expired or is invalid. Please reconnect.",
      originalError: error,
      isRetryable: false
    };
  }
  
  if (errorText.includes("403") || errorText.includes("insufficient permission") || errorText.includes("access denied")) {
    return {
      type: GoogleDriveErrorType.PERMISSION_ERROR,
      message: "You don't have permission to access this resource in Google Drive.",
      originalError: error,
      isRetryable: false
    };
  }
  
  if (errorText.includes("429") || errorText.includes("rate limit") || errorText.includes("quota")) {
    return {
      type: GoogleDriveErrorType.RATE_LIMIT_ERROR,
      message: "Google Drive API rate limit reached. Please try again in a few moments.",
      originalError: error,
      isRetryable: true
    };
  }
  
  if (errorText.includes("network") || errorText.includes("connection") || errorText.includes("timeout")) {
    return {
      type: GoogleDriveErrorType.NETWORK_ERROR,
      message: "Network error when connecting to Google Drive. Check your internet connection.",
      originalError: error,
      isRetryable: true
    };
  }
  
  // Default to unknown error
  return {
    type: GoogleDriveErrorType.UNKNOWN_ERROR,
    message: `Google Drive error: ${errorText.substring(0, 100)}`,
    originalError: error,
    isRetryable: true
  };
};

// Helper to handle retry logic
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const parsedError = parseGoogleDriveError(error);
      
      // Only retry if the error is retryable
      if (!parsedError.isRetryable) {
        throw parsedError;
      }
      
      // Last attempt - don't wait, just throw
      if (attempt === maxRetries - 1) {
        throw parsedError;
      }
      
      // Wait before retry with exponential backoff
      const waitTime = delay * Math.pow(2, attempt);
      console.log(`Retrying Google Drive operation in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  // This should never execute due to the throw in the loop, but TypeScript needs it
  throw parseGoogleDriveError(lastError);
};

// Helper to display Drive errors to users
export const displayDriveError = (error: any) => {
  const parsedError = error.type ? error : parseGoogleDriveError(error);
  
  toast({
    variant: "destructive",
    title: getDriveErrorTitle(parsedError.type),
    description: parsedError.message
  });
  
  return parsedError;
};

// Get appropriate error title based on error type
const getDriveErrorTitle = (errorType: GoogleDriveErrorType): string => {
  switch (errorType) {
    case GoogleDriveErrorType.AUTH_ERROR:
      return "Authentication Error";
    case GoogleDriveErrorType.PERMISSION_ERROR:
      return "Permission Error"; 
    case GoogleDriveErrorType.RATE_LIMIT_ERROR:
      return "Rate Limit Reached";
    case GoogleDriveErrorType.NETWORK_ERROR:
      return "Network Error";
    default:
      return "Google Drive Error";
  }
};
