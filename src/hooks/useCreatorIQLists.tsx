
import { useState, useCallback } from 'react';
import { fetchListsByPage, searchListsByName } from '../services/api';
import { toast } from 'sonner';

export function useCreatorIQLists() {
  const [isLoading, setIsLoading] = useState(false);
  const [listsData, setListsData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showingAllLists, setShowingAllLists] = useState(false);
  
  // Fetch lists by page with option to specify a large limit for "show all"
  const fetchLists = useCallback(async (page = 1, search = searchTerm, limit = 1000, fetchAll = false) => {
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
          console.log(`Retrieved lists endpoint with ${listsEndpoint.data?.ListsCollection?.length || 0} items`);
          console.log(`Lists metadata:`, {
            total: listsEndpoint.data?.total,
            page: listsEndpoint.data?.page,
            total_pages: listsEndpoint.data?.total_pages,
            limit: listsEndpoint.data?.limit
          });
          
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
  
  // Search lists
  const searchLists = useCallback(async (term: string, limit = 1000, fetchAll = false) => {
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
          console.log(`Retrieved search results with ${listsEndpoint.data?.ListsCollection?.length || 0} items`);
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
  const changePage = useCallback(async (page: number, limit = 1000, fetchAll = false) => {
    return await fetchLists(page, searchTerm, limit, fetchAll);
  }, [fetchLists, searchTerm]);
  
  return {
    isLoading,
    listsData,
    currentPage,
    searchTerm,
    showingAllLists,
    fetchLists,
    searchLists,
    changePage
  };
}
