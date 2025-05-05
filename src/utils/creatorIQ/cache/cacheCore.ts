
import { CachedData } from '../types';

// Key for session storage
const CREATOR_IQ_CACHE_KEY = "creator_iq_cache";

// Basic cache operations
export const cacheCore = {
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
  }
};
