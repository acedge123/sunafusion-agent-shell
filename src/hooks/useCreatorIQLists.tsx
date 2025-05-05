
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
        .map((item: any) => item.List?.Name)
        .filter(Boolean);
      
      setListNames(names);
      console.log(`Current lists in state (${names.length}):`, names.slice(0, 10));
      
      // Enhanced debug logging
      console.log(`Total lists claimed by API: ${listsData.data.total || 'unknown'}`);
      console.log(`Lists actually in collection: ${listsData.data.ListsCollection.length}`);
      
      // Check for TestList specifically
      const hasTestList = names.some((name: string) => 
        name.toLowerCase().includes('test')
      );
      console.log(`Test-related lists found in state data: ${hasTestList ? 'Yes' : 'No'}`);
      
      // Check if we might be missing data
      const totalLists = listsData.data.total || 0;
      if (totalLists > names.length && !attemptedFullLoad) {
        console.warn(`Data discrepancy: API reports ${totalLists} total lists but we only have ${names.length} in our collection`);
        // This will trigger a retry with more aggressive parameters if we detect missing data
        setAttemptedFullLoad(true);
      }
    }
  }, [listsData, attemptedFullLoad]);
  
  // Fetch lists by page with option to specify a large limit for "show all"
  const fetchLists = useCallback(async (page = 1, search = searchTerm, limit = 1000, fetchAll = true) => {
    setIsLoading(true);
    setShowingAllLists(fetchAll);
    
    try {
      console.log(`Fetching lists page ${page}${search ? ` with search "${search}"` : ''} with limit ${limit}${fetchAll ? ' (fetching all)' : ''}`);
      const data = await fetchListsByPage(page, search, limit);
      
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
          
          // Check for TestList specifically in the raw data
          if (listsEndpoint.data?.ListsCollection) {
            const listNames = listsEndpoint.data.ListsCollection
              .map((item: any) => item.List?.Name)
              .filter(Boolean);
            
            const testLists = listNames.filter((name: string) => 
              name.toLowerCase().includes('test')
            );
            
            if (testLists.length > 0) {
              console.log(`Test-related lists found in raw API data:`, testLists);
            } else {
              console.log(`No test-related lists found in raw API data`);
            }
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
  
  // If we detect missing data, retry with even more aggressive parameters
  useEffect(() => {
    if (attemptedFullLoad && !isLoading) {
      console.log("Attempting to reload all data with more aggressive parameters");
      // Using a very large limit and ensuring we get all pages
      fetchLists(1, '', 2000, true);
    }
  }, [attemptedFullLoad, isLoading, fetchLists]);
  
  // Search lists with enhanced error handling
  const searchLists = useCallback(async (term: string, limit = 1000, fetchAll = true) => {
    if (!term.trim()) {
      setSearchTerm('');
      return fetchLists(1, '', limit, fetchAll);
    }
    
    setIsLoading(true);
    setSearchTerm(term);
    setShowingAllLists(fetchAll);
    
    try {
      console.log(`Searching lists with term: ${term} and limit: ${limit}${fetchAll ? ' (fetching all)' : ''}`);
      const data = await searchListsByName(term, limit);
      
      const creatorIQSource = data?.sources?.find(source => source.source === 'creator_iq');
      if (creatorIQSource) {
        const listsEndpoint = creatorIQSource.results?.find(
          result => result.name === 'Get Lists' || result.endpoint === '/lists'
        );
        
        if (listsEndpoint) {
          const listCount = listsEndpoint.data?.ListsCollection?.length || 0;
          console.log(`Retrieved search results with ${listCount} items`);
          
          // Check if the search found our test list
          if (listsEndpoint.data?.ListsCollection) {
            const listNames = listsEndpoint.data.ListsCollection
              .map((item: any) => item.List?.Name)
              .filter(Boolean);
            
            const matchingLists = listNames.filter((name: string) => 
              name.toLowerCase().includes(term.toLowerCase())
            );
            
            console.log(`Lists matching "${term}" in search results:`, matchingLists.length > 0 ? matchingLists : 'None found');
          }
          
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
  
  // Handle page change
  const changePage = useCallback(async (page: number, limit = 1000, fetchAll = true) => {
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
