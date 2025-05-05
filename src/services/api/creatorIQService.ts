
import { createClient } from '@supabase/supabase-js';

// Process the Creator IQ API response
export function processCreatorIQResponse(response) {
  if (!response || !response.sources) return null;
  
  // Find the Creator IQ results
  const creatorIQSource = response.sources.find(source => source.source === 'creator_iq');
  if (!creatorIQSource) return null;
  
  return creatorIQSource;
}

// Get publishers from a specific campaign
export async function getCampaignPublishers(campaignId, campaignName) {
  try {
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.functions.invoke('unified-agent', {
      body: {
        include_web: false,
        include_drive: false,
        include_slack: false,
        query: `Get publishers for campaign ${campaignId}`,
        creator_iq_params: {
          campaign_id: campaignId,
          campaign_name: campaignName,
          all_pages: true,  // Request all pages
          limit: 1000,      // Request a large limit
          max_pages: 50     // Increase max pages to fetch
        },
        task_mode: false
      }
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error fetching campaign publishers:', error);
    throw error;
  }
}

// Get publishers from a specific list
export async function getListPublishers(listId, listName) {
  try {
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.functions.invoke('unified-agent', {
      body: {
        include_web: false,
        include_drive: false,
        include_slack: false,
        query: `Get publishers for list ${listId}`,
        creator_iq_params: {
          list_id: listId,
          list_name: listName,
          all_pages: true,  // Request all pages
          limit: 1000,      // Request a large limit
          max_pages: 50     // Increase max pages to fetch
        },
        task_mode: false
      }
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error fetching list publishers:', error);
    throw error;
  }
}

// Fetch lists by page number
export async function fetchListsByPage(page = 1, searchTerm = '', limit = 1000) {
  try {
    console.log(`Fetching lists page ${page}${searchTerm ? ` with search term "${searchTerm}"` : ''} with limit ${limit}`);
    
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    
    const params = {
      list_search_term: searchTerm || undefined,
      page: page,
      limit: limit || 1000, // Ensure a large limit is used
      _fullSearch: Boolean(searchTerm) || true,  // Always enable full search for complete data
      all_pages: true,                  // Always request all pages
      max_pages: 100                    // Increase max pages to fetch more data
    };
    
    console.log('Requesting lists with params:', JSON.stringify(params));
    
    const { data, error } = await supabase.functions.invoke('unified-agent', {
      body: {
        include_web: false,
        include_drive: false,
        include_slack: false,
        query: `Get lists page ${page}${searchTerm ? ` containing "${searchTerm}"` : ''} with limit ${limit}`,
        creator_iq_params: params,
        task_mode: false
      }
    });
    
    if (error) throw new Error(error.message);
    console.log(`Retrieved data with ${data?.sources?.length || 0} sources`);
    
    // Debug logging to see what's in the response
    const creatorIQSource = data?.sources?.find(source => source.source === 'creator_iq');
    const listsEndpoint = creatorIQSource?.results?.find(
      result => result.name === 'Get Lists' || result.endpoint === '/lists'
    );
    
    if (listsEndpoint) {
      const listCount = listsEndpoint.data?.ListsCollection?.length || 0;
      const listNames = listsEndpoint.data?.ListsCollection?.map(item => item.List?.Name).filter(Boolean);
      console.log(`Retrieved ${listCount} lists. Names sample:`, listNames?.slice(0, 5));
      
      // Check if TestList is in the data
      const hasTestList = listNames?.some(name => name.toLowerCase() === 'testlist');
      console.log(`TestList found in data: ${hasTestList}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching lists by page:', error);
    throw error;
  }
}

// Fetch publishers by page number
export async function fetchPublishersByPage(page = 1, searchTerm = '', limit = 1000) {
  try {
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.functions.invoke('unified-agent', {
      body: {
        include_web: false,
        include_drive: false,
        include_slack: false,
        query: `Get publishers page ${page}${searchTerm ? ` containing "${searchTerm}"` : ''} with limit ${limit}`,
        creator_iq_params: {
          publisher_search_term: searchTerm || undefined,
          page: page,
          limit: limit || 1000,
          all_pages: true,  // Always request all pages
          max_pages: 50,    // Increase max pages to fetch
          _fullSearch: true // Enable full search
        },
        task_mode: false
      }
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error fetching publishers by page:', error);
    throw error;
  }
}

// Search for publishers by name
export async function searchPublishersByName(name, limit = 1000) {
  try {
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.functions.invoke('unified-agent', {
      body: {
        include_web: false,
        include_drive: false,
        include_slack: false,
        query: `Find publishers with name containing "${name}"`,
        creator_iq_params: {
          publisher_search_term: name,
          limit: limit || 1000,
          all_pages: true,   // Always request all pages
          _fullSearch: true,  // Enable full search
          max_pages: 50      // Increase max pages to fetch
        },
        task_mode: false
      }
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error searching publishers by name:', error);
    throw error;
  }
}

// Search for lists by name
export async function searchListsByName(name, limit = 1000) {
  try {
    console.log(`Searching for lists with name containing "${name}" with limit ${limit}`);
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.functions.invoke('unified-agent', {
      body: {
        include_web: false,
        include_drive: false,
        include_slack: false,
        query: `Find lists with name containing "${name}" with limit ${limit}`,
        creator_iq_params: {
          list_search_term: name,
          _fullSearch: true,   // Enable full search across all pages
          all_pages: true,     // Always request all pages
          limit: limit || 1000,
          max_pages: 100       // Increase max pages to fetch more lists
        },
        task_mode: false
      }
    });
    
    if (error) throw new Error(error.message);
    
    // Debug the search results
    const creatorIQSource = data?.sources?.find(source => source.source === 'creator_iq');
    const listsEndpoint = creatorIQSource?.results?.find(
      result => result.name === 'Get Lists' || result.endpoint === '/lists'
    );
    
    if (listsEndpoint) {
      const listCount = listsEndpoint.data?.ListsCollection?.length || 0;
      const listNames = listsEndpoint.data?.ListsCollection?.map(item => item.List?.Name).filter(Boolean);
      console.log(`Search returned ${listCount} lists. Names sample:`, listNames?.slice(0, 5));
      
      // Check if TestList is in the data
      const hasTestList = listNames?.some(n => n.toLowerCase().includes(name.toLowerCase()));
      console.log(`List containing "${name}" found in search results: ${hasTestList}`);
    } else {
      console.log('No lists endpoint found in search results');
    }
    
    return data;
  } catch (error) {
    console.error('Error searching lists by name:', error);
    throw error;
  }
}
