
import { CreatorIQState, CreatorIQOperationResult } from "./types";

// Key for session storage
const CREATOR_IQ_CACHE_KEY = "creator_iq_cache";

// Type for cache entries
interface CachedData<T> {
  data: T;
  timestamp: number;
  source: 'cache' | 'db';
  isFresh: boolean;
}

// Define the cache structure
export const creatorIQCache = {
  // Set an item in the cache with TTL
  set: <T>(key: string, data: T, ttl: number = 10 * 60 * 1000): void => { // Default 10 min TTL
    try {
      const cacheItem: CachedData<T> = {
        data,
        timestamp: Date.now(),
        source: 'cache',
        isFresh: true
      };
      
      const cacheData = JSON.parse(sessionStorage.getItem(CREATOR_IQ_CACHE_KEY) || '{}');
      cacheData[key] = cacheItem;
      sessionStorage.setItem(CREATOR_IQ_CACHE_KEY, JSON.stringify(cacheData));
      
      console.log(`Cached data for key: ${key}`);
    } catch (error) {
      console.error("Error caching data:", error);
    }
  },
  
  // Get an item from the cache
  get: <T>(key: string): CachedData<T> | { data: null, source: 'none', isFresh: false } => {
    try {
      const cacheData = JSON.parse(sessionStorage.getItem(CREATOR_IQ_CACHE_KEY) || '{}');
      const cacheItem = cacheData[key] as CachedData<T>;
      
      if (cacheItem && cacheItem.data) {
        const now = Date.now();
        const age = now - cacheItem.timestamp;
        const isFresh = age < 10 * 60 * 1000; // Consider data fresh if less than 10 min old
        
        console.log(`Cache hit for key: ${key}, age: ${Math.round(age/1000)}s, fresh: ${isFresh}`);
        
        return {
          ...cacheItem,
          isFresh
        };
      }
      
      console.log(`Cache miss for key: ${key}`);
      return { data: null, source: 'none', isFresh: false };
    } catch (error) {
      console.error("Error retrieving cached data:", error);
      return { data: null, source: 'none', isFresh: false };
    }
  },
  
  // Flush all cache data
  flush: (): void => {
    try {
      sessionStorage.removeItem(CREATOR_IQ_CACHE_KEY);
      console.log("Creator IQ cache flushed");
    } catch (error) {
      console.error("Error flushing cache:", error);
    }
  },
  
  // Store the complete campaigns list with pagination metadata
  storeAllCampaigns: (campaigns: any[], metadata: any): void => {
    try {
      creatorIQCache.set('all_campaigns', {
        campaigns,
        metadata: {
          ...metadata,
          timestamp: Date.now(),
          complete: true
        }
      }, 60 * 60 * 1000); // Keep complete campaign list for 1 hour
      
      console.log(`Stored complete campaign list with ${campaigns.length} campaigns`);
    } catch (error) {
      console.error("Error storing all campaigns:", error);
    }
  },
  
  // Retrieve complete campaigns list
  getAllCampaigns: (): { campaigns: any[], metadata: any } | null => {
    try {
      const result = creatorIQCache.get<{ campaigns: any[], metadata: any }>('all_campaigns');
      if (result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving all campaigns:", error);
      return null;
    }
  },
  
  // Store the complete lists collection with pagination metadata
  storeAllLists: (lists: any[], metadata: any): void => {
    try {
      creatorIQCache.set('all_lists', {
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
      const result = creatorIQCache.get<{ lists: any[], metadata: any }>('all_lists');
      if (result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving all lists:", error);
      return null;
    }
  },

  // Store operation results from write operations
  storeOperationResult: (operationResult: CreatorIQOperationResult): void => {
    try {
      // Get existing operation results
      const cached = creatorIQCache.get<CreatorIQOperationResult[]>('operation_results');
      const results = cached.data || [];
      
      // Add new result to the beginning of the array
      const updatedResults = [operationResult, ...results].slice(0, 20); // Keep only the 20 most recent operations
      
      creatorIQCache.set('operation_results', updatedResults, 24 * 60 * 60 * 1000); // Store for 24 hours
      console.log(`Stored operation result: ${operationResult.type}`);
    } catch (error) {
      console.error("Error storing operation result:", error);
    }
  },
  
  // Get recent operation results
  getOperationResults: (): CreatorIQOperationResult[] => {
    try {
      const result = creatorIQCache.get<CreatorIQOperationResult[]>('operation_results');
      return result.data || [];
    } catch (error) {
      console.error("Error retrieving operation results:", error);
      return [];
    }
  },
  
  // Find cached list by ID
  findListById: (listId: string): any => {
    try {
      const allLists = creatorIQCache.getAllLists();
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
  
  // Find cached publisher by ID
  findPublisherById: (publisherId: string): any => {
    try {
      // Check in the publisher cache
      const cached = creatorIQCache.get<any[]>('all_publishers');
      if (cached.data) {
        const match = cached.data.find(p => p.id === publisherId);
        if (match) return match;
      }
      
      // If not found, check through campaign publishers
      const campaigns = creatorIQCache.getAllCampaigns();
      if (campaigns && campaigns.campaigns) {
        for (const campaign of campaigns.campaigns) {
          const publishers = creatorIQCache.get<any[]>(`campaign_publishers_${campaign.Campaign.CampaignId}`);
          if (publishers.data) {
            const match = publishers.data.find(p => p.id === publisherId);
            if (match) return match;
          }
        }
      }
      
      // If not found, check through list publishers
      const lists = creatorIQCache.getAllLists();
      if (lists && lists.lists) {
        for (const list of lists.lists) {
          const publishers = creatorIQCache.get<any[]>(`list_publishers_${list.List.Id}`);
          if (publishers.data) {
            const match = publishers.data.find(p => p.id === publisherId);
            if (match) return match;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error finding publisher by ID:", error);
      return null;
    }
  },
  
  // Search for a campaign by name in the complete list (if available)
  findCampaignByName: (name: string): any[] => {
    try {
      const allCampaigns = creatorIQCache.getAllCampaigns();
      if (!allCampaigns || !allCampaigns.campaigns) {
        return [];
      }
      
      const searchTerm = name.toLowerCase();
      console.log(`Searching cached campaigns for: "${searchTerm}"`);
      
      // Advanced search with fuzzy matching
      return allCampaigns.campaigns.filter(campaign => {
        if (!campaign.Campaign || !campaign.Campaign.CampaignName) return false;
        
        const campaignName = campaign.Campaign.CampaignName.toLowerCase();
        
        // Direct match
        if (campaignName.includes(searchTerm)) {
          return true;
        }
        
        // Ready Rocker special case
        if (searchTerm.includes("ready") && searchTerm.includes("rocker")) {
          return (
            (campaignName.includes("ready") && campaignName.includes("rocker")) ||
            (campaignName.includes("ambassador") && campaignName.includes("program"))
          );
        }
        
        // Word-by-word matching for multiple word searches
        const searchWords = searchTerm.split(/\s+/);
        if (searchWords.length > 1) {
          let matchCount = 0;
          for (const word of searchWords) {
            if (word.length > 2 && campaignName.includes(word)) {
              matchCount++;
            }
          }
          return matchCount >= Math.ceil(searchWords.length * 0.6);
        }
        
        return false;
      });
    } catch (error) {
      console.error("Error searching cached campaigns:", error);
      return [];
    }
  },
  
  // Search for a list by name in the complete collection (if available)
  findListByName: (name: string): any[] => {
    try {
      const allLists = creatorIQCache.getAllLists();
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
