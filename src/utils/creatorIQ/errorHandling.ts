
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
  
  // Some write operations might be retriable
  if (error?.message?.includes("retry") ||
      error?.message?.includes("temporary")) {
    return true;
  }
  
  return false;
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

/**
 * Process the result of a Creator IQ write operation 
 * and return a structured result object
 */
export function processWriteOperationResult(data: any, operationType: string): any {
  try {
    // If operation metadata is available
    if (data.operation) {
      const result = {
        successful: data.operation.successful === true,
        type: operationType,
        details: data.operation.details || `${operationType} operation completed`,
        timestamp: new Date().toISOString()
      };
      
      // Add resource-specific data
      if (operationType.includes('List') && data.List) {
        return {
          ...result,
          id: data.List.Id,
          name: data.List.Name,
        };
      }
      
      // Add message-specific data
      if (operationType.includes('Message') && (data.messageId || data.MessageId)) {
        return {
          ...result,
          messageId: data.messageId || data.MessageId,
          publisherId: data.publisherId
        };
      }
      
      return result;
    }
    
    // For list creation responses
    if (operationType.includes('List') && data.List && data.List.Id) {
      return {
        successful: true,
        type: 'Create List',
        details: `Created list: ${data.List.Name || 'New List'} (ID: ${data.List.Id})`,
        id: data.List.Id,
        name: data.List.Name,
        timestamp: new Date().toISOString()
      };
    }
    
    // For message sending responses
    if (operationType.includes('Message') && data.success === true && (data.messageId || data.MessageId)) {
      return {
        successful: true,
        type: 'Send Message',
        details: `Message sent successfully to publisher ${data.publisherId || 'Unknown'}`,
        messageId: data.messageId || data.MessageId,
        publisherId: data.publisherId,
        timestamp: new Date().toISOString()
      };
    }
    
    // Generic success response when we can't determine specifics
    return {
      successful: true,
      type: operationType,
      details: `${operationType} completed successfully`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error processing write operation result:", error);
    return {
      successful: false,
      type: operationType,
      details: `Error processing result: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Create a structured error object for Creator IQ operations
 */
export function createCreatorIQError(
  type: CreatorIQErrorType,
  message: string,
  originalError?: any,
  isRetryable: boolean = false
): CreatorIQError {
  return {
    type,
    message,
    originalError,
    isRetryable
  };
}

/**
 * Format Creator IQ error messages to be more user-friendly
 */
export function formatCreatorIQErrorMessage(error: any): string {
  if (!error) return "Unknown error";
  
  // Handle specific error patterns
  
  // Publisher ID errors
  if (error.message?.includes('publisher_id') || error.message?.includes('Publisher not found')) {
    return "Publisher not found. Please specify a valid publisher ID.";
  }
  
  // Authentication errors
  if (error.message?.includes('authentication') || error.message?.includes('unauthorized')) {
    return "Authentication failed. Please check your Creator IQ credentials.";
  }
  
  // Not found errors
  if (error.message?.includes('404')) {
    if (error.message.includes('messages') || error.message.includes('/publishers/')) {
      return "Could not send message. The publisher was not found.";
    }
    return "The requested resource was not found.";
  }
  
  // Return the original message if no specific format is needed
  return error.message || "An error occurred with the Creator IQ operation";
}

/**
 * Handle specific publisher not found errors
 */
export function handlePublisherNotFoundError(publisherId: string | number): CreatorIQError {
  const message = `Publisher with ID ${publisherId} was not found. Please verify the ID and try again.`;
  
  return createCreatorIQError(
    CreatorIQErrorType.PUBLISHER_NOT_FOUND,
    message,
    { status: 404, message: `Publisher ${publisherId} not found` },
    false
  );
}

/**
 * Extract and log all available publisher IDs from a response or state
 * Useful for debugging and helping users find valid IDs
 */
export function logAvailablePublisherIds(data: any): void {
  try {
    const publishers: any[] = [];
    
    // Extract publishers from different data structures
    if (data.publishers && Array.isArray(data.publishers)) {
      publishers.push(...data.publishers);
    }
    
    if (data.results) {
      data.results.forEach((result: any) => {
        if (result.data && result.data.PublisherCollection) {
          const resultPublishers = Array.isArray(result.data.PublisherCollection) 
            ? result.data.PublisherCollection 
            : [];
          publishers.push(...resultPublishers);
        }
      });
    }
    
    if (publishers.length > 0) {
      console.log(`Found ${publishers.length} available publishers:`);
      
      // Extract and log IDs and names if available
      const publisherInfo = publishers.slice(0, 10).map(p => {
        if (p.id) return { id: p.id, name: p.name || 'Unknown' };
        if (p.Publisher && p.Publisher.Id) {
          return { 
            id: p.Publisher.Id, 
            name: p.Publisher.Name || p.Publisher.Username || 'Unknown'
          };
        }
        return null;
      }).filter(Boolean);
      
      console.table(publisherInfo);
      
      if (publishers.length > 10) {
        console.log(`... and ${publishers.length - 10} more publishers`);
      }
    } else {
      console.log("No publishers found in the provided data");
    }
  } catch (error) {
    console.error("Error logging publisher IDs:", error);
  }
}
