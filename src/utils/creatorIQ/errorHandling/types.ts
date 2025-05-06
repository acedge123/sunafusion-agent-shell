
import { CreatorIQErrorType } from "../types";

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
