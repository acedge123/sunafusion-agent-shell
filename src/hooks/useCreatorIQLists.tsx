
import { useState, useCallback, useEffect } from 'react';
import { fetchListsByPage, searchListsByName } from '../services/api';
import { toast } from 'sonner';

export function useCreatorIQLists() {
  const [isLoading, setIsLoading] = useState(false);
  const [listsData, setListsData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [listNames, setListNames] = useState<string[]>([]);
  const [attemptedFullLoad, setAttemptedFullLoad] = useState(false);
  
  // Debug effect to log list names when data changes
  useEffect(() => {
    if (listsData?.data?.ListsCollection) {
      const names = listsData.data.ListsCollection
        .map((item: any) => {
          // Handle nested List structures
          if (item.List && item.List.List) {
            return item.List.List.Name;
          } else if (item.List) {
            return item.List.Name;
          }
          return null;
        })
        .filter(Boolean);
      
      setListNames(names);
      console.log(`Current lists in state (${names.length}):`, names.slice(0, 10));
      
      // Enhanced debug logging
      console.log(`Total lists claimed by API: ${listsData.data.total || 'unknown'}`);
      console.log(`Lists actually in collection: ${listsData.data.ListsCollection.length}`);
      
      // Check if we might be missing data
      const totalLists = listsData.data.total || 0;
      if (totalLists > names.length && !attemptedFullLoad && !listsData.data._all_pages_fetched) {
        console.warn(`Data discrepancy: API reports ${totalLists} total lists but we only have ${names.length} in our collection`);
        // This will trigger a retry with more aggressive parameters if we detect missing data
        setAttemptedFullLoad(true);
      }
    }
  }, [listsData, attemptedFullLoad]);
  
  // Fetch lists - always fetch all lists with a large limit
  const fetchLists = useCallback(async (page = 1, search = searchTerm, limit = 2000) => {
    setIsLoading(true);
    
    try {
      console.log(`Fetching all lists${search ? ` with search "${search}"` : ''} with limit ${limit}`);
      const data = await fetchListsByPage(page, search, limit, true);
      
      const creatorIQSource = data?.sources?.find(source => source.source === 'creator_iq');
      if (creatorIQSource) {
        const listsEndpoint = creatorIQSource.results?.find(
          result => result.name === 'Get Lists' || result.endpoint === '/lists'
        );
        
        if (listsEndpoint) {
          const listCount = listsEndpoint.data?.ListsCollection?.length || 0;
          console.log(`Retrieved lists endpoint with ${listCount} items`);
          console.log(`Lists metadata:`, {
            total: listsEndpoint.data?.total,
            page: listsEndpoint.data?.page,
            total_pages: listsEndpoint.data?.total_pages,
            limit: listsEndpoint.data?.limit,
            all_pages_fetched: listsEndpoint.data?._all_pages_fetched
          });
          
          // If we got data but don't have all pages and the metadata says there are more pages,
          // but we should have fetched them all, log a warning
          if (listCount > 0 && 
              listsEndpoint.data?.total_pages > 1 && 
              !listsEndpoint.data?._all_pages_fetched) {
            console.warn("Warning: Expected all pages to be fetched but the metadata indicates otherwise");
            // Retry with a larger limit
            return fetchLists(1, search, 5000);
          }
          
          setListsData(listsEndpoint);
          return listsEndpoint;
        }
      }
      
      throw new Error('No lists data found in response');
    } catch (error) {
      console.error('Error fetching lists:', error);
      toast.error('Failed to load lists');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);
  
  // If we detect missing data, retry with more aggressive parameters
  useEffect(() => {
    if (attemptedFullLoad && !isLoading) {
      console.log("Attempting to reload all data with more aggressive parameters");
      // Using a very large limit and ensuring we get all pages
      fetchLists(1, '', 5000);
    }
  }, [attemptedFullLoad, isLoading, fetchLists]);
  
  // Search lists with enhanced error handling - always fetch all results
  const searchLists = useCallback(async (term: string, limit = 5000) => {
    if (!term.trim()) {
      setSearchTerm('');
      return fetchLists(1, '', limit);
    }
    
    setIsLoading(true);
    setSearchTerm(term);
    
    try {
      console.log(`Searching all lists with term: ${term} and limit: ${limit}`);
      const data = await searchListsByName(term, limit, true);
      
      const creatorIQSource = data?.sources?.find(source => source.source === 'creator_iq');
      if (creatorIQSource) {
        const listsEndpoint = creatorIQSource.results?.find(
          result => result.name === 'Get Lists' || result.endpoint === '/lists'
        );
        
        if (listsEndpoint) {
          const listCount = listsEndpoint.data?.ListsCollection?.length || 0;
          console.log(`Retrieved search results with ${listCount} items`);
          
          setListsData(listsEndpoint);
          return listsEndpoint;
        }
      }
      
      throw new Error('No search results found');
    } catch (error) {
      console.error('Error searching lists:', error);
      toast.error('Failed to search lists');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchLists]);
  
  // Load all lists on component mount with aggressive parameters
  useEffect(() => {
    fetchLists(1, '', 5000);
  }, [fetchLists]);
  
  return {
    isLoading,
    listsData,
    searchTerm,
    listNames,
    fetchLists,
    searchLists
  };
}
