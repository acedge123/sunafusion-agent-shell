
import { cacheCore } from './cacheCore';
import { CreatorIQOperationResult } from '../types';

export const operationsCache = {
  // Store operation results from write operations
  storeOperationResult: (operationResult: CreatorIQOperationResult): void => {
    try {
      // Get existing operation results
      const cached = cacheCore.get<CreatorIQOperationResult[]>('operation_results');
      const results = cached.data || [];
      
      // Add new result to the beginning of the array
      const updatedResults = [operationResult, ...results].slice(0, 20); // Keep only the 20 most recent operations
      
      cacheCore.set('operation_results', updatedResults, 24 * 60 * 60 * 1000); // Store for 24 hours
      console.log(`Stored operation result: ${operationResult.type}`);
    } catch (error) {
      console.error("Error storing operation result:", error);
    }
  },
  
  // Get recent operation results
  getOperationResults: (): CreatorIQOperationResult[] => {
    try {
      const result = cacheCore.get<CreatorIQOperationResult[]>('operation_results');
      return result.data || [];
    } catch (error) {
      console.error("Error retrieving operation results:", error);
      return [];
    }
  }
};
