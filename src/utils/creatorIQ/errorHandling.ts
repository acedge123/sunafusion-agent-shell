
// Error handling utilities for Creator IQ integration
import { CreatorIQError, CreatorIQErrorType } from "./types";
import { toast } from "@/components/ui/use-toast";

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
  }
  
  // Show toast message
  toast({
    title,
    description: message,
    variant: "destructive",
  });
}

// Retry function for Creator IQ operations
export async function withCreatorIQRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let retries = 0;
  let lastError: any = null;
  
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      retries++;
      
      // Only retry on certain errors
      const isRetriableError = isErrorRetriable(error);
      if (!isRetriableError || retries >= maxRetries) {
        break;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelayMs * Math.pow(2, retries - 1) + Math.random() * 1000;
      console.log(`Creator IQ operation failed, retry ${retries}/${maxRetries} in ${Math.round(delay)}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we've exhausted retries, throw the last error
  throw lastError;
}

// Helper to determine if an error is retriable
function isErrorRetriable(error: any): boolean {
  // Network errors are usually retriable
  if (error?.message?.includes("network") || 
      error?.message?.includes("timeout") ||
      error?.message?.includes("connection")) {
    return true;
  }
  
  // Rate limit errors are retriable after a delay
  if (error?.message?.includes("rate limit") ||
      error?.status === 429) {
    return true;
  }
  
  // Server errors might be temporary
  if (error?.status >= 500 && error?.status < 600) {
    return true;
  }
  
  return false;
}
