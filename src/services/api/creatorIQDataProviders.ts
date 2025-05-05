
import { creatorIQCache, PaginatedResult } from "@/utils/creatorIQ";

// Retrieve campaign publishers with fallback support
export async function getCampaignPublishers(campaignId: string, campaignName?: string) {
  try {
    // Check cache first for immediate response
    const cached = creatorIQCache.get<any>(`campaign_publishers_${campaignId}`);
    if (cached.data) {
      // Return with metadata indicating source
      return {
        publishers: cached.data,
        _metadata: {
          source: cached.source,
          isFresh: cached.isFresh,
          timestamp: Date.now()
        }
      };
    }
    
    // Nothing in cache, return empty array with metadata
    return {
      publishers: [],
      _metadata: {
        source: "none",
        error: "Publishers not found in cache",
        campaignDetails: {
          id: campaignId,
          name: campaignName || "Unknown"
        }
      }
    };
  } catch (error) {
    console.error("Error retrieving campaign publishers:", error);
    return {
      publishers: [],
      _metadata: {
        source: "error",
        error: String(error)
      }
    };
  }
}

// Retrieve list publishers with fallback support
export async function getListPublishers(listId: string, listName?: string) {
  try {
    // Check cache first for immediate response
    const cached = creatorIQCache.get<any>(`list_publishers_${listId}`);
    if (cached.data) {
      // Return with metadata indicating source
      return {
        publishers: cached.data,
        _metadata: {
          source: cached.source,
          isFresh: cached.isFresh,
          timestamp: Date.now()
        }
      };
    }
    
    // Nothing in cache, return empty array with metadata
    return {
      publishers: [],
      _metadata: {
        source: "none",
        error: "Publishers not found in cache",
        listDetails: {
          id: listId,
          name: listName || "Unknown"
        }
      }
    };
  } catch (error) {
    console.error("Error retrieving list publishers:", error);
    return {
      publishers: [],
      _metadata: {
        source: "error",
        error: String(error)
      }
    };
  }
}

// Fetch lists with pagination support
export async function fetchListsByPage(page: number = 1, limit: number = 50) {
  try {
    // Check if we already have this page in cache
    const cacheKey = `lists_page_${page}_limit_${limit}`;
    const cached = creatorIQCache.get<any>(cacheKey);
    
    if (cached.data && cached.isFresh) {
      console.log(`Using cached lists for page ${page}`);
      return cached.data;
    }
    
    // Check if we have all lists cached
    const allLists = creatorIQCache.getAllLists();
    if (allLists && allLists.lists && allLists.lists.length > 0) {
      console.log(`Using complete cached lists collection instead of fetching page ${page}`);
      
      // Paginate from the complete collection
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLists = allLists.lists.slice(startIndex, endIndex);
      
      // Prepare pagination metadata
      const totalItems = allLists.lists.length;
      const totalPages = Math.ceil(totalItems / limit);
      
      const result = {
        ListsCollection: paginatedLists,
        page,
        limit,
        total: totalItems,
        total_pages: totalPages,
        _metadata: {
          source: 'cache',
          isFresh: true,
          timestamp: Date.now(),
          isPaginated: true,
          completeCollection: true
        }
      };
      
      // Cache this specific page result
      creatorIQCache.set(cacheKey, result);
      
      return result;
    }
    
    console.log(`Lists cache miss for page ${page}, would need to fetch from API`);
    
    // In a real implementation, we would fetch from API here
    // For now, we'll return a message that API fetching would be done
    return {
      lists: [],
      _metadata: {
        source: "none",
        message: `Would fetch page ${page} with limit ${limit} from API`,
        needsApiCall: true
      }
    };
  } catch (error) {
    console.error(`Error fetching lists page ${page}:`, error);
    return {
      lists: [],
      _metadata: {
        source: "error",
        error: String(error)
      }
    };
  }
}

// Fetch publishers with pagination support
export async function fetchPublishersByPage(page: number = 1, limit: number = 50) {
  try {
    // Check if we already have this page in cache
    const cacheKey = `publishers_page_${page}_limit_${limit}`;
    const cached = creatorIQCache.get<any>(cacheKey);
    
    if (cached.data && cached.isFresh) {
      console.log(`Using cached publishers for page ${page}`);
      return cached.data;
    }
    
    // Check if we have all publishers cached
    const allPublishers = creatorIQCache.getAllPublishers();
    if (allPublishers && allPublishers.publishers && allPublishers.publishers.length > 0) {
      console.log(`Using complete cached publishers collection instead of fetching page ${page}`);
      
      // Paginate from the complete collection
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPublishers = allPublishers.publishers.slice(startIndex, endIndex);
      
      // Prepare pagination metadata
      const totalItems = allPublishers.publishers.length;
      const totalPages = Math.ceil(totalItems / limit);
      
      const result = {
        PublisherCollection: paginatedPublishers,
        page,
        limit,
        total: totalItems,
        total_pages: totalPages,
        _metadata: {
          source: 'cache',
          isFresh: true,
          timestamp: Date.now(),
          isPaginated: true,
          completeCollection: true
        }
      };
      
      // Cache this specific page result
      creatorIQCache.set(cacheKey, result);
      
      return result;
    }
    
    console.log(`Publishers cache miss for page ${page}, would need to fetch from API`);
    
    // In a real implementation, we would fetch from API here
    // For now, we'll return a message that API fetching would be done
    return {
      publishers: [],
      _metadata: {
        source: "none",
        message: `Would fetch page ${page} with limit ${limit} from API`,
        needsApiCall: true
      }
    };
  } catch (error) {
    console.error(`Error fetching publishers page ${page}:`, error);
    return {
      publishers: [],
      _metadata: {
        source: "error",
        error: String(error)
      }
    };
  }
}

// Search for publishers by name in cache
export async function searchPublishersByName(searchTerm: string) {
  try {
    console.log(`Searching for publishers with name: ${searchTerm}`);
    
    const results = creatorIQCache.findPublisherByName(searchTerm);
    
    return {
      publishers: results,
      _metadata: {
        source: 'cache',
        timestamp: Date.now(),
        searchTerm,
        count: results.length
      }
    };
  } catch (error) {
    console.error(`Error searching publishers by name:`, error);
    return {
      publishers: [],
      _metadata: {
        source: "error",
        error: String(error)
      }
    };
  }
}

// Search for lists by name in cache
export async function searchListsByName(searchTerm: string) {
  try {
    console.log(`Searching for lists with name: ${searchTerm}`);
    
    const results = creatorIQCache.findListByName(searchTerm);
    
    return {
      lists: results,
      _metadata: {
        source: 'cache',
        timestamp: Date.now(),
        searchTerm,
        count: results.length
      }
    };
  } catch (error) {
    console.error(`Error searching lists by name:`, error);
    return {
      lists: [],
      _metadata: {
        source: "error",
        error: String(error)
      }
    };
  }
}
