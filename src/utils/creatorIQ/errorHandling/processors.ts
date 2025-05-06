
import { CreatorIQOperationType } from "../types";

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
