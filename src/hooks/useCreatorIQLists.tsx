
import { useState, useCallback } from 'react';
import { fetchListsByPage, searchListsByName } from '../services/api';
import { toast } from 'sonner';

export function useCreatorIQLists() {
  const [isLoading, setIsLoading] = useState(false);
  const [listsData, setListsData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch lists by page
  const fetchLists = useCallback(async (page = 1, search = searchTerm) => {
    setIsLoading(true);
    try {
      console.log(`Fetching lists page ${page}${search ? ` with search "${search}"` : ''}`);
      const data = await fetchListsByPage(page, search);
      
      const creatorIQSource = data?.sources?.find(source => source.source === 'creator_iq');
      if (creatorIQSource) {
        const listsEndpoint = creatorIQSource.results?.find(
          result => result.name === 'Get Lists' || result.endpoint === '/lists'
        );
        
        if (listsEndpoint) {
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
  const searchLists = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchTerm('');
      return fetchLists(1, '');
    }
    
    setIsLoading(true);
    setSearchTerm(term);
    
    try {
      console.log(`Searching lists with term: ${term}`);
      const data = await searchListsByName(term);
      
      const creatorIQSource = data?.sources?.find(source => source.source === 'creator_iq');
      if (creatorIQSource) {
        const listsEndpoint = creatorIQSource.results?.find(
          result => result.name === 'Get Lists' || result.endpoint === '/lists'
        );
        
        if (listsEndpoint) {
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
  const changePage = useCallback(async (page: number) => {
    return await fetchLists(page);
  }, [fetchLists]);
  
  return {
    isLoading,
    listsData,
    currentPage,
    searchTerm,
    fetchLists,
    searchLists,
    changePage
  };
}
