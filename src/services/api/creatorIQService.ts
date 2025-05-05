
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
          campaign_name: campaignName
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
          list_name: listName
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
export async function fetchListsByPage(page = 1, searchTerm = '') {
  try {
    console.log(`Fetching lists page ${page}${searchTerm ? ` with search term "${searchTerm}"` : ''}`);
    
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    
    const params = {
      list_search_term: searchTerm || undefined,
      page: page,
      _fullSearch: Boolean(searchTerm) // Enable full search when searching for specific lists
    };
    
    console.log('Requesting with params:', params);
    
    const { data, error } = await supabase.functions.invoke('unified-agent', {
      body: {
        include_web: false,
        include_drive: false,
        include_slack: false,
        query: `Get lists page ${page}${searchTerm ? ` containing "${searchTerm}"` : ''}`,
        creator_iq_params: params,
        task_mode: false
      }
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error fetching lists by page:', error);
    throw error;
  }
}

// Fetch publishers by page number
export async function fetchPublishersByPage(page = 1, searchTerm = '') {
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
        query: `Get publishers page ${page}${searchTerm ? ` containing "${searchTerm}"` : ''}`,
        creator_iq_params: {
          publisher_search_term: searchTerm || undefined,
          page: page
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
export async function searchPublishersByName(name) {
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
          publisher_search_term: name
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
export async function searchListsByName(name) {
  try {
    console.log(`Searching for lists with name containing "${name}"`);
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.functions.invoke('unified-agent', {
      body: {
        include_web: false,
        include_drive: false,
        include_slack: false,
        query: `Find lists with name containing "${name}"`,
        creator_iq_params: {
          list_search_term: name,
          _fullSearch: true // Enable full search across all pages
        },
        task_mode: false
      }
    });
    
    if (error) throw new Error(error.message);
    console.log('Search results:', data);
    return data;
  } catch (error) {
    console.error('Error searching lists by name:', error);
    throw error;
  }
}
