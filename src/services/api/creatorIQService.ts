
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
