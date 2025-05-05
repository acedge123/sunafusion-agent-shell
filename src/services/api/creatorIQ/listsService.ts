
import { toast } from "sonner";
import { makeCreatorIQRequest, processCreatorIQResponse } from "./serviceBase";

/**
 * Fetch lists with pagination support
 */
export async function fetchListsByPage(page = 1, search = '', limit = 100, fetchAll = true) {
  try {
    // Construct the message with specific instructions for pagination
    const message = search 
      ? `Get lists matching "${search}"`
      : "Get all lists";
    
    // Override with explicit pagination parameters
    const params = {
      page,
      limit,
      all_pages: fetchAll,
      list_search_term: search || undefined
    };
    
    console.log(`Fetching lists page ${page} with params:`, params);
    
    const data = await makeCreatorIQRequest(message, params);
    return data;
  } catch (error) {
    console.error("Error fetching lists:", error);
    toast.error("Failed to fetch lists");
    throw error;
  }
}

/**
 * Search for lists by name
 */
export async function searchListsByName(searchTerm: string, limit = 100, fetchAll = true) {
  try {
    const message = `Find lists matching "${searchTerm}"`;
    
    // Override with explicit search parameters
    const params = {
      list_search_term: searchTerm,
      limit,
      all_pages: fetchAll
    };
    
    console.log(`Searching lists with term "${searchTerm}" and params:`, params);
    
    const data = await makeCreatorIQRequest(message, params);
    return data;
  } catch (error) {
    console.error("Error searching lists:", error);
    toast.error("Failed to search lists");
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
    
    const data = await makeCreatorIQRequest(message, params);
    return data;
  } catch (error) {
    console.error(`Error fetching publishers for list ${listId}:`, error);
    toast.error("Failed to fetch list publishers");
    throw error;
  }
}
