
/**
 * Retry function for Creator IQ operations
 */
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

/**
 * Helper to determine if an error is retriable
 */
export function isErrorRetriable(error: any): boolean {
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
