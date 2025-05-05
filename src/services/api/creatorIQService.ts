import { supabase } from "@/integrations/supabase/client";
import { buildCreatorIQParams } from "./paramBuilder";
import { prepareCreatorIQState } from "./messageHelpers";

// Function to process Creator IQ responses
export function processCreatorIQResponse(data: any) {
  if (!data) return null;
  
  // Find Creator IQ source in the response
  const creatorIQSource = data.sources?.find((source: any) => source.source === "creator_iq");
  if (!creatorIQSource) return null;
  
  return creatorIQSource;
}

/**
 * Fetch lists with pagination support
 */
export async function fetchListsByPage(page = 1, search = '', limit = 100, fetchAll = true) {
  try {
    // Construct the message with specific instructions for pagination
    const message = search 
      ? `Get lists matching "${search}"`
      : "Get all lists";
    
    // Build parameters for the request
    let params = buildCreatorIQParams(message);
    
    // Override with explicit pagination parameters
    params = {
      ...params,
      page,
      limit,
      all_pages: fetchAll,
      list_search_term: search || undefined
    };
    
    console.log(`Fetching lists page ${page} with params:`, params);
    
    // Call the endpoint
    const { data, error } = await supabase.functions.invoke("unified-agent", {
      body: { 
        query: message,
        tools: ["creator_iq"],
        params
      }
    });
    
    if (error) {
      console.error("Error fetching lists:", error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching lists:", error);
    throw error;
  }
}

/**
 * Search for lists by name
 */
export async function searchListsByName(searchTerm: string, limit = 100, fetchAll = true) {
  try {
    const message = `Find lists matching "${searchTerm}"`;
    
    // Build parameters for the request
    let params = buildCreatorIQParams(message);
    
    // Override with explicit search parameters
    params = {
      ...params,
      list_search_term: searchTerm,
      limit,
      all_pages: fetchAll
    };
    
    console.log(`Searching lists with term "${searchTerm}" and params:`, params);
    
    // Call the endpoint
    const { data, error } = await supabase.functions.invoke("unified-agent", {
      body: { 
        query: message,
        tools: ["creator_iq"],
        params
      }
    });
    
    if (error) {
      console.error("Error searching lists:", error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error("Error searching lists:", error);
    throw error;
  }
}

/**
 * Fetch publishers with pagination support
 */
export async function fetchPublishersByPage(page = 1, limit = 100) {
  try {
    const message = "Get publishers";
    const params = {
      page,
      limit
    };
    
    const { data, error } = await supabase.functions.invoke("unified-agent", {
      body: { 
        query: message,
        tools: ["creator_iq"],
        params
      }
    });
    
    if (error) {
      console.error("Error fetching publishers:", error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching publishers:", error);
    throw error;
  }
}

/**
 * Search for publishers by name
 */
export async function searchPublishersByName(searchTerm: string, limit = 100) {
  try {
    const message = `Find publishers matching "${searchTerm}"`;
    const params = {
      search_term: searchTerm,
      limit
    };
    
    const { data, error } = await supabase.functions.invoke("unified-agent", {
      body: { 
        query: message,
        tools: ["creator_iq"],
        params
      }
    });
    
    if (error) {
      console.error("Error searching publishers:", error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error("Error searching publishers:", error);
    throw error;
  }
}

/**
 * Get publishers for a specific campaign
 */
export async function getCampaignPublishers(campaignId: string, limit = 100) {
  try {
    const message = `Get publishers for campaign with ID ${campaignId}`;
    const params = {
      campaign_id: campaignId,
      limit
    };
    
    const { data, error } = await supabase.functions.invoke("unified-agent", {
      body: { 
        query: message,
        tools: ["creator_iq"],
        params
      }
    });
    
    if (error) {
      console.error(`Error fetching publishers for campaign ${campaignId}:`, error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching publishers for campaign ${campaignId}:`, error);
    throw error;
  }
}

/**
 * Get publishers for a specific list
 */
export async function getListPublishers(listId: string, limit = 100) {
  try {
    const message = `Get publishers for list with ID ${listId}`;
    const params = {
      list_id: listId,
      limit
    };
    
    const { data, error } = await supabase.functions.invoke("unified-agent", {
      body: { 
        query: message,
        tools: ["creator_iq"],
        params
      }
    });
    
    if (error) {
      console.error(`Error fetching publishers for list ${listId}:`, error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching publishers for list ${listId}:`, error);
    throw error;
  }
}
