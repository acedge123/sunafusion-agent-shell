
import { cacheCore } from './cacheCore';

export const listCache = {
  // Store the complete lists collection with pagination metadata
  storeAllLists: (lists: any[], metadata: any): void => {
    try {
      cacheCore.set('all_lists', {
        lists,
        metadata: {
          ...metadata,
          timestamp: Date.now(),
          complete: true
        }
      }, 60 * 60 * 1000); // Keep complete lists collection for 1 hour
      
      console.log(`Stored complete lists collection with ${lists.length} lists`);
    } catch (error) {
      console.error("Error storing all lists:", error);
    }
  },
  
  // Retrieve complete lists collection
  getAllLists: (): { lists: any[], metadata: any } | null => {
    try {
      const result = cacheCore.get<{ lists: any[], metadata: any }>('all_lists');
      if (result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving all lists:", error);
      return null;
    }
  },
  
  // Find cached list by ID
  findListById: (listId: string): any => {
    try {
      const allLists = listCache.getAllLists();
      if (!allLists || !allLists.lists) {
        return null;
      }
      
      for (const list of allLists.lists) {
        if (list.List && list.List.Id === listId) {
          return list;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error finding list by ID:", error);
      return null;
    }
  },
  
  // Search for a list by name in the complete collection
  findListByName: (name: string): any[] => {
    try {
      const allLists = listCache.getAllLists();
      if (!allLists || !allLists.lists) {
        return [];
      }
      
      const searchTerm = name.toLowerCase();
      console.log(`Searching cached lists for: "${searchTerm}"`);
      
      // Advanced search with fuzzy matching
      return allLists.lists.filter(list => {
        if (!list.List || !list.List.Name) return false;
        
        const listName = list.List.Name.toLowerCase();
        
        // Direct match
        if (listName.includes(searchTerm)) {
          return true;
        }
        
        // Word-by-word matching for multiple word searches
        const searchWords = searchTerm.split(/\s+/);
        if (searchWords.length > 1) {
          let matchCount = 0;
          for (const word of searchWords) {
            if (word.length > 2 && listName.includes(word)) {
              matchCount++;
            }
          }
          return matchCount >= Math.ceil(searchWords.length * 0.6);
        }
        
        return false;
      });
    } catch (error) {
      console.error("Error searching cached lists:", error);
      return [];
    }
  }
};
