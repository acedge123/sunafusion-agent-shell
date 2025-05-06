
import { toast } from "@/components/ui/use-toast";
import { CreatorIQError, CreatorIQErrorType } from "../types";

/**
 * Display Creator IQ errors to the user via toast notifications
 */
export function displayCreatorIQError(error: CreatorIQError): void {
  // Log the error for developers
  console.error(`Creator IQ Error (${error.type}):`, error.message, error.originalError);
  
  // Show a toast message to the user based on the error type
  let title = "Error accessing Creator IQ data";
  let message = error.message;
  
  switch (error.type) {
    case CreatorIQErrorType.API_ERROR:
      title = "Creator IQ API Error";
      break;
    case CreatorIQErrorType.AUTHENTICATION_ERROR:
      title = "Creator IQ Authentication Error";
      message = "Unable to authenticate with Creator IQ. Please check your credentials.";
      break;
    case CreatorIQErrorType.RATE_LIMIT_ERROR:
      title = "Rate Limit Exceeded";
      message = "Too many requests to Creator IQ. Please try again later.";
      break;
    case CreatorIQErrorType.NETWORK_ERROR:
      title = "Network Error";
      message = "Unable to connect to Creator IQ. Please check your internet connection.";
      break;
    case CreatorIQErrorType.INCOMPLETE_DATA:
      title = "Incomplete Data";
      break;
    case CreatorIQErrorType.DATA_FORMAT_ERROR:
      title = "Data Format Error";
      break;
    case CreatorIQErrorType.WRITE_OPERATION_ERROR:
      title = "Creator IQ Write Operation Failed";
      message = `Unable to perform the requested operation: ${error.message}`;
      break;
    case CreatorIQErrorType.PUBLISHER_NOT_FOUND:
      title = "Publisher Not Found";
      message = "The specified publisher ID was not found. Please verify the ID and try again.";
      break;
  }
  
  // Show toast message
  toast({
    title,
    description: message,
    variant: "destructive",
  });
}

/**
 * Handle success messages for Creator IQ operations
 */
export function displayCreatorIQSuccess(operation: string, details?: string): void {
  const message = details || `Operation completed successfully`;
  
  toast({
    title: `Creator IQ: ${operation}`,
    description: message,
    variant: "default",
  });
  
  // Log success for developers
  console.log(`Creator IQ Success (${operation}):`, message);
}
