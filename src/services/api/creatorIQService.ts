
import { 
  saveStateToDatabase, 
  extractCampaignData,
  extractPublisherData,
  extractListData,
  extractPaginationMetadata,
  displayCreatorIQError,
  CreatorIQErrorType,
  withCreatorIQRetry,
  creatorIQCache
} from "@/utils/creatorIQ";

// Process Creator IQ response and store data for future reference
export async function processCreatorIQResponse(stateKey: string, userId: string, sources: any[]) {
  try {
    const creatorIQSource = sources.find(s => s.source === "creator_iq");
    if (!creatorIQSource?.results) {
      console.log("No Creator IQ results found in sources");
      return;
    }
    
    console.log("Storing Creator IQ results for future reference");
    
    // Process and extract structured data from the response with improved error handling
    const processedData: {
      campaigns: any[];
      publishers: any[];
      lists: any[];
    } = {
      campaigns: [],
      publishers: [],
      lists: []
    };
    
    let hasErrors = false;
    let context = "";
    
    // Process each endpoint result with better error handling
    for (const result of creatorIQSource.results) {
      try {
        if (result.endpoint === "/campaigns" && result.data) {
          processedData.campaigns = extractCampaignData(result.data);
          console.log(`Extracted ${processedData.campaigns.length} campaigns`);
          
          if (processedData.campaigns.length > 0) {
            context += `campaigns:${processedData.campaigns.length},`;
          }
          
          // Store complete campaign list in cache if available
          if (result.data.searched_all_pages && result.data.CampaignCollection?.length > 0) {
            creatorIQCache.storeAllCampaigns(
              result.data.CampaignCollection,
              {
                total: result.data.total,
                pages: result.data.pages_searched,
                total_pages: result.data.total_pages_available
              }
            );
          }
        } else if (result.endpoint.includes("/publishers") && result.data) {
          const publishers = extractPublisherData(result.data);
          processedData.publishers = publishers;
          console.log(`Extracted ${publishers.length} publishers`);
          
          if (publishers.length > 0) {
            context += `publishers:${publishers.length},`;
          }
          
          // Store all publishers in cache if this is the main publishers request
          if (result.endpoint === "/publishers" && result.data.searched_all_pages && result.data.PublisherCollection?.length > 0) {
            creatorIQCache.storeAllPublishers(
              result.data.PublisherCollection,
              {
                total: result.data.total,
                pages: result.data.pages_searched,
                total_pages: result.data.total_pages_available
              }
            );
          }
          
          // Also cache publishers by campaign if this is a campaign-specific request
          if (result.endpoint.includes("/campaigns/") && result.data.campaignId) {
            creatorIQCache.set(
              `campaign_publishers_${result.data.campaignId}`, 
              publishers
            );
          }
          
          // Also cache publishers by list if this is a list-specific request
          if (result.endpoint.includes("/lists/") && result.data.listId) {
            creatorIQCache.set(
              `list_publishers_${result.data.listId}`, 
              publishers
            );
          }
        } else if (result.endpoint === "/lists" && result.data) {
          processedData.lists = extractListData(result.data);
          console.log(`Extracted ${processedData.lists.length} lists`);
          
          if (processedData.lists.length > 0) {
            const pagination = extractPaginationMetadata(result.data);
            if (pagination) {
              context += `lists:${processedData.lists.length}:page=${pagination.currentPage}:total=${pagination.total},`;
            } else {
              context += `lists:${processedData.lists.length},`;
            }
          }
          
          // Store complete list collection in cache if available
          if (result.data.searched_all_pages && result.data.ListsCollection?.length > 0) {
            creatorIQCache.storeAllLists(
              result.data.ListsCollection,
              {
                total: result.data.total,
                pages: result.data.pages_searched,
                total_pages: result.data.total_pages
              }
            );
          }
        }
        
        // Check for specific operation results (add publishers to campaign)
        if (result.data && result.data.operation && 
            result.data.operation.type === "Add Publishers To Campaign") {
          console.log("Found campaign operation results to process");
          context += `operation:add_publishers_to_campaign,`;
        }
        
        // If we have an error in this result, track it
        if (result.error) {
          hasErrors = true;
          console.warn(`Error in Creator IQ result (${result.endpoint}):`, result.error);
        }
      } catch (extractError) {
        console.error(`Error processing ${result.endpoint} data:`, extractError);
        hasErrors = true;
      }
    }
    
    // Store the extracted data if we have any
    if (processedData.campaigns.length > 0 || 
        processedData.publishers.length > 0 || 
        processedData.lists.length > 0) {
      
      const success = await saveStateToDatabase(userId, stateKey, processedData, context);
      
      // If we had errors but still got some data, show a warning
      if (hasErrors && success) {
        displayCreatorIQError({
          type: CreatorIQErrorType.INCOMPLETE_DATA,
          message: "Some Creator IQ data couldn't be retrieved. You may see partial results.",
          isRetryable: false
        });
      }
    } else if (hasErrors) {
      // If we had errors and got no data, show an error
      displayCreatorIQError({
        type: CreatorIQErrorType.DATA_FORMAT_ERROR,
        message: "Unable to retrieve Creator IQ data. Please try a different query.",
        isRetryable: true
      });
    }
  } catch (error) {
    console.error("Error processing Creator IQ response:", error);
    displayCreatorIQError({
      type: CreatorIQErrorType.UNKNOWN_ERROR,
      message: "An unexpected error occurred while processing Creator IQ data.",
      originalError: error,
      isRetryable: false
    });
  }
}

// Retrieve campaign publishers with fallback support
export async function getCampaignPublishers(campaignId: string, campaignName?: string) {
  try {
    // Check cache first for immediate response
    const cached = creatorIQCache.get<any>(`campaign_publishers_${campaignId}`);
    if (cached.data) {
      // Return with metadata indicating source
      return {
        publishers: cached.data,
        _metadata: {
          source: cached.source,
          isFresh: cached.isFresh,
          timestamp: Date.now()
        }
      };
    }
    
    // Nothing in cache, return empty array with metadata
    return {
      publishers: [],
      _metadata: {
        source: "none",
        error: "Publishers not found in cache",
        campaignDetails: {
          id: campaignId,
          name: campaignName || "Unknown"
        }
      }
    };
  } catch (error) {
    console.error("Error retrieving campaign publishers:", error);
    return {
      publishers: [],
      _metadata: {
        source: "error",
        error: String(error)
      }
    };
  }
}

// Retrieve list publishers with fallback support
export async function getListPublishers(listId: string, listName?: string) {
  try {
    // Check cache first for immediate response
    const cached = creatorIQCache.get<any>(`list_publishers_${listId}`);
    if (cached.data) {
      // Return with metadata indicating source
      return {
        publishers: cached.data,
        _metadata: {
          source: cached.source,
          isFresh: cached.isFresh,
          timestamp: Date.now()
        }
      };
    }
    
    // Nothing in cache, return empty array with metadata
    return {
      publishers: [],
      _metadata: {
        source: "none",
        error: "Publishers not found in cache",
        listDetails: {
          id: listId,
          name: listName || "Unknown"
        }
      }
    };
  } catch (error) {
    console.error("Error retrieving list publishers:", error);
    return {
      publishers: [],
      _metadata: {
        source: "error",
        error: String(error)
      }
    };
  }
}

// Fetch lists with pagination support
export async function fetchListsByPage(page: number = 1, limit: number = 50) {
  try {
    // Check if we already have this page in cache
    const cacheKey = `lists_page_${page}_limit_${limit}`;
    const cached = creatorIQCache.get<any>(cacheKey);
    
    if (cached.data && cached.isFresh) {
      console.log(`Using cached lists for page ${page}`);
      return cached.data;
    }
    
    // Check if we have all lists cached
    const allLists = creatorIQCache.getAllLists();
    if (allLists && allLists.lists && allLists.lists.length > 0) {
      console.log(`Using complete cached lists collection instead of fetching page ${page}`);
      
      // Paginate from the complete collection
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLists = allLists.lists.slice(startIndex, endIndex);
      
      // Prepare pagination metadata
      const totalItems = allLists.lists.length;
      const totalPages = Math.ceil(totalItems / limit);
      
      const result = {
        ListsCollection: paginatedLists,
        page,
        limit,
        total: totalItems,
        total_pages: totalPages,
        _metadata: {
          source: 'cache',
          isFresh: true,
          timestamp: Date.now(),
          isPaginated: true,
          completeCollection: true
        }
      };
      
      // Cache this specific page result
      creatorIQCache.set(cacheKey, result);
      
      return result;
    }
    
    console.log(`Lists cache miss for page ${page}, would need to fetch from API`);
    
    // In a real implementation, we would fetch from API here
    // For now, we'll return a message that API fetching would be done
    return {
      lists: [],
      _metadata: {
        source: "none",
        message: `Would fetch page ${page} with limit ${limit} from API`,
        needsApiCall: true
      }
    };
  } catch (error) {
    console.error(`Error fetching lists page ${page}:`, error);
    return {
      lists: [],
      _metadata: {
        source: "error",
        error: String(error)
      }
    };
  }
}

// Fetch publishers with pagination support
export async function fetchPublishersByPage(page: number = 1, limit: number = 50) {
  try {
    // Check if we already have this page in cache
    const cacheKey = `publishers_page_${page}_limit_${limit}`;
    const cached = creatorIQCache.get<any>(cacheKey);
    
    if (cached.data && cached.isFresh) {
      console.log(`Using cached publishers for page ${page}`);
      return cached.data;
    }
    
    // Check if we have all publishers cached
    const allPublishers = creatorIQCache.getAllPublishers();
    if (allPublishers && allPublishers.publishers && allPublishers.publishers.length > 0) {
      console.log(`Using complete cached publishers collection instead of fetching page ${page}`);
      
      // Paginate from the complete collection
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPublishers = allPublishers.publishers.slice(startIndex, endIndex);
      
      // Prepare pagination metadata
      const totalItems = allPublishers.publishers.length;
      const totalPages = Math.ceil(totalItems / limit);
      
      const result = {
        PublisherCollection: paginatedPublishers,
        page,
        limit,
        total: totalItems,
        total_pages: totalPages,
        _metadata: {
          source: 'cache',
          isFresh: true,
          timestamp: Date.now(),
          isPaginated: true,
          completeCollection: true
        }
      };
      
      // Cache this specific page result
      creatorIQCache.set(cacheKey, result);
      
      return result;
    }
    
    console.log(`Publishers cache miss for page ${page}, would need to fetch from API`);
    
    // In a real implementation, we would fetch from API here
    // For now, we'll return a message that API fetching would be done
    return {
      publishers: [],
      _metadata: {
        source: "none",
        message: `Would fetch page ${page} with limit ${limit} from API`,
        needsApiCall: true
      }
    };
  } catch (error) {
    console.error(`Error fetching publishers page ${page}:`, error);
    return {
      publishers: [],
      _metadata: {
        source: "error",
        error: String(error)
      }
    };
  }
}

// Search for publishers by name in cache
export async function searchPublishersByName(searchTerm: string) {
  try {
    console.log(`Searching for publishers with name: ${searchTerm}`);
    
    const results = creatorIQCache.findPublisherByName(searchTerm);
    
    return {
      publishers: results,
      _metadata: {
        source: 'cache',
        timestamp: Date.now(),
        searchTerm,
        count: results.length
      }
    };
  } catch (error) {
    console.error(`Error searching publishers by name:`, error);
    return {
      publishers: [],
      _metadata: {
        source: "error",
        error: String(error)
      }
    };
  }
}

// Search for lists by name in cache
export async function searchListsByName(searchTerm: string) {
  try {
    console.log(`Searching for lists with name: ${searchTerm}`);
    
    const results = creatorIQCache.findListByName(searchTerm);
    
    return {
      lists: results,
      _metadata: {
        source: 'cache',
        timestamp: Date.now(),
        searchTerm,
        count: results.length
      }
    };
  } catch (error) {
    console.error(`Error searching lists by name:`, error);
    return {
      lists: [],
      _metadata: {
        source: "error",
        error: String(error)
      }
    };
  }
}

