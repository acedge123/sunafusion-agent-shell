
/**
 * Utility functions for extracting and normalizing data from Creator IQ API responses
 */

/**
 * Normalizes nested data structures in Creator IQ API responses
 * Often the API returns doubly nested objects like List.List or Publisher.Publisher
 * @param data The API response data to normalize
 * @returns The normalized data structure
 */
export function normalizeNestedData(data: any): any {
  if (!data) return null;
  
  // Create a copy to avoid mutating the original
  const normalized = { ...data };
  
  // Handle List structure
  if (normalized.List && normalized.List.List) {
    normalized.List = normalized.List.List;
  }
  
  // Handle Publisher structure
  if (normalized.Publisher && normalized.Publisher.Publisher) {
    normalized.Publisher = normalized.Publisher.Publisher;
  }
  
  // Handle Campaign structure
  if (normalized.Campaign && normalized.Campaign.Campaign) {
    normalized.Campaign = normalized.Campaign.Campaign;
  }
  
  // Process collections
  if (normalized.ListsCollection && Array.isArray(normalized.ListsCollection)) {
    normalized.ListsCollection = normalized.ListsCollection.map((item: any) => {
      const normalizedItem = { ...item };
      if (normalizedItem.List && normalizedItem.List.List) {
        normalizedItem.List = normalizedItem.List.List;
      }
      return normalizedItem;
    });
  }
  
  if (normalized.PublisherCollection && Array.isArray(normalized.PublisherCollection)) {
    normalized.PublisherCollection = normalized.PublisherCollection.map((item: any) => {
      const normalizedItem = { ...item };
      if (normalizedItem.Publisher && normalizedItem.Publisher.Publisher) {
        normalizedItem.Publisher = normalizedItem.Publisher.Publisher;
      }
      return normalizedItem;
    });
  }
  
  // Handle alternate publisher collection name
  if (normalized.PublishersCollection && Array.isArray(normalized.PublishersCollection)) {
    normalized.PublishersCollection = normalized.PublishersCollection.map((item: any) => {
      const normalizedItem = { ...item };
      if (normalizedItem.Publisher && normalizedItem.Publisher.Publisher) {
        normalizedItem.Publisher = normalizedItem.Publisher.Publisher;
      }
      return normalizedItem;
    });
  }
  
  return normalized;
}

/**
 * Extract publisher IDs from a list or campaign response
 * @param data The API response data containing publishers
 * @returns Array of publisher IDs
 */
export function extractPublisherIds(data: any): number[] {
  if (!data) return [];
  
  // Case 1: Simple array of IDs
  if (data.Publishers && Array.isArray(data.Publishers) && 
      (typeof data.Publishers[0] === 'number' || typeof data.Publishers[0] === 'string')) {
    return data.Publishers.map(id => Number(id));
  }
  
  // Case 2: Array of publisher objects
  if (data.Publishers && Array.isArray(data.Publishers) && typeof data.Publishers[0] === 'object') {
    return data.Publishers
      .map(pub => pub.Id || pub.id)
      .filter(Boolean)
      .map(id => Number(id));
  }
  
  // Case 3: PublisherCollection
  if (data.PublisherCollection && Array.isArray(data.PublisherCollection)) {
    return data.PublisherCollection
      .map(item => {
        if (item.Publisher) {
          return item.Publisher.Id || item.Publisher.id;
        }
        return null;
      })
      .filter(Boolean)
      .map(id => Number(id));
  }
  
  // Case 4: PublishersCollection (alternate name)
  if (data.PublishersCollection && Array.isArray(data.PublishersCollection)) {
    return data.PublishersCollection
      .map(item => {
        if (item.Publisher) {
          return item.Publisher.Id || item.Publisher.id;
        }
        return null;
      })
      .filter(Boolean)
      .map(id => Number(id));
  }
  
  return [];
}

/**
 * Extract list details from potentially nested data
 * @param data The API response data
 * @returns Normalized list data
 */
export function extractListData(data: any): any {
  if (!data) return null;
  
  // Normalize the data first
  const normalized = normalizeNestedData(data);
  
  // Case 1: Direct list object
  if (normalized.List) {
    return normalized.List;
  }
  
  // Case 2: ListsCollection with single item
  if (normalized.ListsCollection && 
      Array.isArray(normalized.ListsCollection) && 
      normalized.ListsCollection.length === 1) {
    return normalized.ListsCollection[0].List;
  }
  
  return null;
}

/**
 * Process a lists response to ensure all lists are properly formatted
 * @param response The API response to process
 * @returns Processed response with normalized lists
 */
export function processListsResponse(response: any): any {
  if (!response || !response.data || !response.data.ListsCollection) {
    return response;
  }
  
  // Create a deep copy to avoid mutating the original
  const processed = JSON.parse(JSON.stringify(response));
  
  // Normalize each list in the collection
  processed.data.ListsCollection = processed.data.ListsCollection.map((item: any) => {
    // Handle doubly nested lists
    if (item.List && item.List.List) {
      item.List = item.List.List;
    }
    
    return item;
  });
  
  return processed;
}
