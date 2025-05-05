
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

// Export main functions
export { 
  getCampaignPublishers,
  getListPublishers,
  fetchListsByPage,
  fetchPublishersByPage,
  searchPublishersByName,
  searchListsByName 
} from './creatorIQDataProviders';
