
import { useState, useCallback, useEffect } from 'react';
import { fetchListsByPage, searchListsByName } from '../services/api';
import { toast } from 'sonner';

export function useCreatorIQLists() {
  const [isLoading, setIsLoading] = useState(false);
  const [listsData, setListsData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [listNames, setListNames] = useState<string[]>([]);
  
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
      console.log(`All pages fetched: ${listsData.data._all_pages_fetched ? 'Yes' : 'No'}`);
    }
  }, [listsData]);
  
  // Fetch lists - use maximum allowed limit of 1000
  const fetchLists = useCallback(async (page = 1, search = searchTerm, limit = 1000, fetchAll = true) => {
    setIsLoading(true);
    
    try {
      // Cap the limit at 1000 (API maximum)
      const cappedLimit = Math.min(limit, 1000);
      console.log(`Fetching all lists${search ? ` with search "${search}"` : ''} with limit ${cappedLimit}, fetchAll: ${fetchAll}`);
      const data = await fetchListsByPage(page, search, cappedLimit, fetchAll);
      
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
  
  // Search lists with enhanced error handling - use maximum allowed limit of 1000
  const searchLists = useCallback(async (term: string, limit = 1000, fetchAll = true) => {
    if (!term.trim()) {
      setSearchTerm('');
      return fetchLists(1, '', Math.min(limit, 1000), fetchAll);
    }
    
    setIsLoading(true);
    setSearchTerm(term);
    
    try {
      // Cap the limit at 1000 (API maximum)
      const cappedLimit = Math.min(limit, 1000);
      console.log(`Searching all lists with term: ${term} and limit: ${cappedLimit}, fetchAll: ${fetchAll}`);
      const data = await searchListsByName(term, cappedLimit, fetchAll);
      
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
  
  // Load all lists on component mount with full pagination enabled and capped limit
  useEffect(() => {
    fetchLists(1, '', 1000, true);
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
