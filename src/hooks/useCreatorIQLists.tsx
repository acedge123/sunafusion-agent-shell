
import { useState, useCallback, useEffect } from 'react';
import { fetchListsByPage, searchListsByName } from '../services/api';
import { toast } from 'sonner';

export function useCreatorIQLists() {
  const [isLoading, setIsLoading] = useState(false);
  const [listsData, setListsData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showingAllLists, setShowingAllLists] = useState(true); // Default to showing all lists
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
  
  // Fetch lists by page with option to specify a large limit for "show all"
  const fetchLists = useCallback(async (page = 1, search = searchTerm, limit = 2000, fetchAll = true) => {
    setIsLoading(true);
    setShowingAllLists(fetchAll);
    
    try {
      console.log(`Fetching lists page ${page}${search ? ` with search "${search}"` : ''} with limit ${limit}${fetchAll ? ' (fetching all)' : ''}`);
      const data = await fetchListsByPage(page, search, limit, fetchAll);
      
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
              fetchAll && 
              !listsEndpoint.data?._all_pages_fetched) {
            console.warn("Warning: Expected all pages to be fetched but the metadata indicates otherwise");
          }
          
          setListsData(listsEndpoint);
          setCurrentPage(page);
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
      fetchLists(1, '', 2000, true);
    }
  }, [attemptedFullLoad, isLoading, fetchLists]);
  
  // Search lists with enhanced error handling
  const searchLists = useCallback(async (term: string, limit = 2000, fetchAll = true) => {
    if (!term.trim()) {
      setSearchTerm('');
      return fetchLists(1, '', limit, fetchAll);
    }
    
    setIsLoading(true);
    setSearchTerm(term);
    setShowingAllLists(fetchAll);
    
    try {
      console.log(`Searching lists with term: ${term} and limit: ${limit}${fetchAll ? ' (fetching all)' : ''}`);
      const data = await searchListsByName(term, limit, fetchAll);
      
      const creatorIQSource = data?.sources?.find(source => source.source === 'creator_iq');
      if (creatorIQSource) {
        const listsEndpoint = creatorIQSource.results?.find(
          result => result.name === 'Get Lists' || result.endpoint === '/lists'
        );
        
        if (listsEndpoint) {
          const listCount = listsEndpoint.data?.ListsCollection?.length || 0;
          console.log(`Retrieved search results with ${listCount} items`);
          
          setListsData(listsEndpoint);
          setCurrentPage(1);
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
  
  // Handle page change - ensure this always returns a Promise
  const changePage = useCallback(async (page: number, limit = 2000, fetchAll = true) => {
    return await fetchLists(page, searchTerm, limit, fetchAll);
  }, [fetchLists, searchTerm]);
  
  // Load all lists on component mount with aggressive parameters
  useEffect(() => {
    fetchLists(1, '', 2000, true);
  }, [fetchLists]);
  
  return {
    isLoading,
    listsData,
    currentPage,
    searchTerm,
    showingAllLists,
    listNames,
    fetchLists,
    searchLists,
    changePage
  };
}
