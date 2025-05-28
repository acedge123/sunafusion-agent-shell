
// Handler for GET requests to Creator IQ API
import { CreatorIQEndpoint, QueryResult } from './types.ts';
import { logRequest, logResponse, createErrorResult } from './utils.ts';

const CREATOR_IQ_BASE_URL = 'https://apis.creatoriq.com/crm/v1/api';

/**
 * Execute GET requests to Creator IQ API
 */
export async function executeGetRequest(
  endpoint: CreatorIQEndpoint, 
  payload: any = {}
): Promise<QueryResult> {
  const apiKey = Deno.env.get('CREATOR_IQ_API_KEY');
  
  if (!apiKey) {
    console.error('CREATOR_IQ_API_KEY is not configured');
    return createErrorResult(endpoint, 'API key not configured');
  }
  
  try {
    // Handle lists endpoint with enhanced pagination
    if (endpoint.route === '/lists') {
      return await fetchAllLists(endpoint, payload, apiKey);
    }
    
    // Handle other GET endpoints normally
    const url = buildUrl(endpoint.route, payload);
    
    logRequest(endpoint.method, url, payload);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    const responseData = await response.json();
    logResponse(response.status, responseData);
    
    if (!response.ok) {
      return createErrorResult(endpoint, `HTTP ${response.status}: ${responseData.message || 'Request failed'}`);
    }
    
    return {
      endpoint: endpoint.route,
      method: endpoint.method,
      name: endpoint.name,
      data: responseData,
      success: true
    };
    
  } catch (error) {
    console.error(`Error executing GET request to ${endpoint.route}:`, error);
    return createErrorResult(endpoint, error.message || 'Unknown error');
  }
}

/**
 * Fetch all lists with proper pagination handling
 */
async function fetchAllLists(
  endpoint: CreatorIQEndpoint,
  payload: any,
  apiKey: string
): Promise<QueryResult> {
  try {
    // Determine if we should fetch all pages
    const shouldFetchAll = payload._fullSearch === true || payload.all_pages === true;
    const limit = payload.limit || (shouldFetchAll ? 100 : 20); // Use larger page size for full fetch
    
    let allLists: any[] = [];
    let currentPage = payload.page || 1;
    let totalPages = 1;
    let totalCount = 0;
    
    console.log(`Starting to fetch lists with limit: ${limit}, fetchAll: ${shouldFetchAll}`);
    
    do {
      const pageParams = {
        page: currentPage,
        limit: limit
      };
      
      // Add search parameter if provided
      if (payload.search) {
        pageParams.search = payload.search;
      }
      
      const url = buildUrl('/lists', pageParams);
      console.log(`Fetching from ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Request failed'}`);
      }
      
      const data = await response.json();
      
      // Extract lists from the response
      const listsCollection = data.ListsCollection || [];
      console.log(`Processing ${listsCollection.length} lists from page ${currentPage}`);
      
      allLists = allLists.concat(listsCollection);
      
      // Update pagination info
      totalCount = data.total || listsCollection.length;
      totalPages = Math.ceil(totalCount / limit);
      
      console.log(`Page ${currentPage}/${totalPages}, Total items: ${totalCount}, Current collection size: ${allLists.length}`);
      
      // If we're not fetching all pages, break after first page
      if (!shouldFetchAll) {
        break;
      }
      
      currentPage++;
      
      // Safety check to prevent infinite loops
      if (currentPage > 100) {
        console.warn("Reached maximum page limit (100), stopping pagination");
        break;
      }
      
    } while (currentPage <= totalPages);
    
    console.log(`Finished fetching lists. Total collected: ${allLists.length}`);
    
    // Construct the final response
    const finalData = {
      type: "ListsCollection",
      href: `${CREATOR_IQ_BASE_URL}/lists`,
      count: allLists.length,
      total: totalCount,
      page: payload.page || 1,
      total_pages: totalPages,
      limit: limit,
      _all_pages_fetched: shouldFetchAll,
      ListsCollection: allLists
    };
    
    return {
      endpoint: endpoint.route,
      method: endpoint.method,
      name: endpoint.name,
      data: finalData,
      success: true
    };
    
  } catch (error) {
    console.error(`Error fetching all lists:`, error);
    return createErrorResult(endpoint, error.message || 'Unknown error');
  }
}

/**
 * Build URL with query parameters
 */
function buildUrl(route: string, params: any = {}): string {
  const url = new URL(`${CREATOR_IQ_BASE_URL}${route}`);
  
  Object.entries(params).forEach(([key, value]) => {
    // Skip internal parameters
    if (key.startsWith('_') || key === 'all_pages') {
      return;
    }
    
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.toString();
}
