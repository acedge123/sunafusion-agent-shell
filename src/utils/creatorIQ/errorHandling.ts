
import { toast } from "@/hooks/use-toast";

// Error types for Creator IQ operations
export enum CreatorIQErrorType {
  AUTH_ERROR = "auth_error",
  PERMISSION_ERROR = "permission_error",
  CONNECTION_ERROR = "connection_error",
  DATA_FORMAT_ERROR = "data_format_error",
  STATE_ERROR = "state_error",
  INCOMPLETE_DATA = "incomplete_data",
  UNKNOWN_ERROR = "unknown_error",
}

export interface CreatorIQError {
  type: CreatorIQErrorType;
  message: string;
  originalError?: any;
  isRetryable: boolean;
  context?: any; // Additional context for debugging
}

// Parse errors from various sources into a standardized format
export const parseCreatorIQError = (error: any, context?: any): CreatorIQError => {
  // Try to parse API response errors
  const errorText = error?.message || error?.toString() || "Unknown error";
  
  // Check for specific error patterns
  if (errorText.includes("401") || errorText.includes("unauthorized") || errorText.includes("invalid_token")) {
    return {
      type: CreatorIQErrorType.AUTH_ERROR,
      message: "Authentication error with Creator IQ. Please reconnect your account.",
      originalError: error,
      isRetryable: false,
      context
    };
  }
  
  if (errorText.includes("403") || errorText.includes("permission") || errorText.includes("access denied")) {
    return {
      type: CreatorIQErrorType.PERMISSION_ERROR,
      message: "You don't have permission to access this Creator IQ resource.",
      originalError: error,
      isRetryable: false,
      context
    };
  }
  
  if (errorText.includes("network") || errorText.includes("connection") || errorText.includes("timeout") || 
      errorText.includes("unreachable") || errorText.includes("failed to fetch")) {
    return {
      type: CreatorIQErrorType.CONNECTION_ERROR,
      message: "Unable to connect to Creator IQ. Please check your internet connection and try again.",
      originalError: error,
      isRetryable: true,
      context
    };
  }
  
  if (errorText.includes("format") || errorText.includes("parse") || errorText.includes("invalid data") || 
      errorText.includes("unexpected") || errorText.includes("schema")) {
    return {
      type: CreatorIQErrorType.DATA_FORMAT_ERROR,
      message: "The data received from Creator IQ was in an unexpected format.",
      originalError: error,
      isRetryable: false,
      context
    };
  }

  if (errorText.includes("state") || errorText.includes("not found") || errorText.includes("missing state")) {
    return {
      type: CreatorIQErrorType.STATE_ERROR,
      message: "Could not retrieve or save state data for your Creator IQ request.",
      originalError: error,
      isRetryable: false,
      context
    };
  }
  
  // Default to unknown error
  return {
    type: CreatorIQErrorType.UNKNOWN_ERROR,
    message: `Creator IQ error: ${errorText.substring(0, 100)}`,
    originalError: error,
    isRetryable: true,
    context
  };
};

// Helper to handle retry logic with exponential backoff
export const withCreatorIQRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
  context?: any
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const parsedError = parseCreatorIQError(error, context);
      
      // Only retry if the error is retryable
      if (!parsedError.isRetryable) {
        throw parsedError;
      }
      
      // Last attempt - don't wait, just throw
      if (attempt === maxRetries - 1) {
        throw parsedError;
      }
      
      // Wait before retry with exponential backoff
      const waitTime = initialDelay * Math.pow(2, attempt);
      console.log(`Retrying Creator IQ operation in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})...`, context);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  // This should never execute due to the throw in the loop, but TypeScript needs it
  throw parseCreatorIQError(lastError, context);
};

// Helper to display Creator IQ errors to users with appropriate messaging
export const displayCreatorIQError = (error: any) => {
  const parsedError = error.type ? error : parseCreatorIQError(error);
  
  toast({
    variant: "destructive",
    title: getCreatorIQErrorTitle(parsedError.type),
    description: parsedError.message
  });
  
  // Log detailed error for debugging
  console.error("Creator IQ Error:", {
    type: parsedError.type,
    message: parsedError.message,
    context: parsedError.context,
    originalError: parsedError.originalError
  });
  
  return parsedError;
};

// Get appropriate error title based on error type
const getCreatorIQErrorTitle = (errorType: CreatorIQErrorType): string => {
  switch (errorType) {
    case CreatorIQErrorType.AUTH_ERROR:
      return "Authentication Error";
    case CreatorIQErrorType.PERMISSION_ERROR:
      return "Permission Error"; 
    case CreatorIQErrorType.CONNECTION_ERROR:
      return "Connection Error";
    case CreatorIQErrorType.DATA_FORMAT_ERROR:
      return "Data Format Error";
    case CreatorIQErrorType.STATE_ERROR:
      return "State Retrieval Error";
    case CreatorIQErrorType.INCOMPLETE_DATA:
      return "Incomplete Data Warning";
    default:
      return "Creator IQ Error";
  }
};

// Helper for handling partial data scenarios
export const handlePartialData = <T>(
  data: Partial<T> | null | undefined,
  defaults: T,
  label: string
): { data: T; isComplete: boolean } => {
  if (!data) {
    console.warn(`No ${label} data available, using defaults`);
    return { data: defaults, isComplete: false };
  }
  
  const mergedData = { ...defaults, ...data };
  const isComplete = Object.keys(defaults).every(key => 
    data.hasOwnProperty(key) && data[key as keyof Partial<T>] !== null && data[key as keyof Partial<T>] !== undefined
  );
  
  if (!isComplete) {
    console.warn(`Incomplete ${label} data, some values are using defaults`, {
      missing: Object.keys(defaults).filter(key => 
        !data.hasOwnProperty(key) || data[key as keyof Partial<T>] === null || data[key as keyof Partial<T>] === undefined
      )
    });
  }
  
  return { data: mergedData, isComplete };
};

// Simple cache implementation for fallback data
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  source: 'api' | 'local' | 'fallback';
}

export class CreatorIQDataCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly maxAge: number; // in milliseconds
  
  constructor(maxAgeMinutes: number = 30) {
    this.maxAge = maxAgeMinutes * 60 * 1000;
  }
  
  set<T>(key: string, data: T, source: 'api' | 'local' | 'fallback' = 'api'): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      source
    });
  }
  
  get<T>(key: string): { data: T | null; isFresh: boolean; source: string } {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return { data: null, isFresh: false, source: 'none' };
    }
    
    const isFresh = (Date.now() - entry.timestamp) < this.maxAge;
    
    return { 
      data: entry.data,
      isFresh,
      source: entry.source
    };
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance for Creator IQ data
export const creatorIQCache = new CreatorIQDataCache();
