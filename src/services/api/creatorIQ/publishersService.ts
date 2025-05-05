
import { toast } from "sonner";
import { makeCreatorIQRequest } from "./serviceBase";

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
    
    const data = await makeCreatorIQRequest(message, params);
    return data;
  } catch (error) {
    console.error("Error fetching publishers:", error);
    toast.error("Failed to fetch publishers");
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
    
    const data = await makeCreatorIQRequest(message, params);
    return data;
  } catch (error) {
    console.error("Error searching publishers:", error);
    toast.error("Failed to search publishers");
    throw error;
  }
}
