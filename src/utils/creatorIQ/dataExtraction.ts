
import { CampaignData, PublisherData, ListData } from "./types";
import { handlePartialData } from "./errorHandling";

// Default empty objects for fallback
const DEFAULT_CAMPAIGN: CampaignData = {
  id: "unknown",
  name: "Unknown Campaign",
  status: "unknown",
  publishersCount: 0
};

const DEFAULT_PUBLISHER: PublisherData = {
  id: "unknown",
  name: "Unknown Publisher",
  status: "unknown"
};

const DEFAULT_LIST: ListData = {
  id: "unknown",
  name: "Unknown List",
  publishersCount: 0
};

// Extract campaign data from Creator IQ API response with better error handling and fallbacks
export const extractCampaignData = (responseData: any): CampaignData[] => {
  // Handle missing or null response
  if (!responseData) {
    console.warn("No response data provided to extractCampaignData");
    return [];
  }
  
  // Handle missing campaign collection
  if (!responseData.CampaignCollection) {
    console.warn("No CampaignCollection found in response data", responseData);
    return [];
  }

  return responseData.CampaignCollection
    .map((item: any) => {
      // Skip null items
      if (!item) return null;
      
      // Handle missing Campaign object
      if (!item.Campaign) {
        console.warn("Campaign object missing in collection item", item);
        return null;
      }
      
      const campaign = item.Campaign;
      
      // Process with fallbacks using handlePartialData helper
      const partialData: Partial<CampaignData> = {
        id: campaign.CampaignId || undefined,
        name: campaign.CampaignName || undefined,
        status: campaign.CampaignStatus || undefined,
        publishersCount: typeof campaign.PublishersCount === 'number' ? campaign.PublishersCount : undefined
      };
      
      // Create a new id-specific default
      const idSpecificDefault = {
        ...DEFAULT_CAMPAIGN,
        id: campaign.CampaignId || "unknown",
        name: `Campaign ${campaign.CampaignId ? `#${campaign.CampaignId}` : ""}`
      };
      
      const { data, isComplete } = handlePartialData(
        partialData, 
        idSpecificDefault,
        `Campaign ${campaign.CampaignId || ""}`
      );
      
      // Add metadata for UI display
      (data as any)._metadata = {
        isComplete,
        missingFields: !isComplete ? 
          Object.keys(partialData).filter(k => partialData[k as keyof CampaignData] === undefined) : 
          []
      };
      
      return data;
    })
    .filter(Boolean) as CampaignData[];
};

// Extract publisher data from Creator IQ API response with better error handling
export const extractPublisherData = (responseData: any): PublisherData[] => {
  if (!responseData || !responseData.PublisherCollection) {
    console.warn("No PublisherCollection found in response data", responseData);
    return [];
  }

  return responseData.PublisherCollection
    .map((item: any) => {
      if (!item) return null;
      
      if (!item.Publisher) {
        console.warn("Publisher object missing in collection item", item);
        return null;
      }
      
      const publisher = item.Publisher;
      
      const partialData: Partial<PublisherData> = {
        id: publisher.Id || undefined,
        name: publisher.PublisherName || undefined,
        status: publisher.Status || undefined
      };
      
      const idSpecificDefault = {
        ...DEFAULT_PUBLISHER,
        id: publisher.Id || "unknown",
        name: `Publisher ${publisher.Id ? `#${publisher.Id}` : ""}`
      };
      
      const { data, isComplete } = handlePartialData(
        partialData,
        idSpecificDefault,
        `Publisher ${publisher.Id || ""}`
      );
      
      // Add metadata for UI display
      (data as any)._metadata = {
        isComplete,
        missingFields: !isComplete ? 
          Object.keys(partialData).filter(k => partialData[k as keyof PublisherData] === undefined) : 
          []
      };
      
      return data;
    })
    .filter(Boolean) as PublisherData[];
};

// Extract list data from Creator IQ API response with better error handling
export const extractListData = (responseData: any): ListData[] => {
  if (!responseData || !responseData.ListsCollection) {
    console.warn("No ListsCollection found in response data", responseData);
    return [];
  }

  return responseData.ListsCollection
    .map((item: any) => {
      if (!item) return null;
      
      if (!item.List) {
        console.warn("List object missing in collection item", item);
        return null;
      }
      
      const list = item.List;
      
      const partialData: Partial<ListData> = {
        id: list.Id || undefined,
        name: list.Name || undefined,
        publishersCount: list.Publishers?.length !== undefined ? list.Publishers.length : undefined
      };
      
      const idSpecificDefault = {
        ...DEFAULT_LIST,
        id: list.Id || "unknown",
        name: `List ${list.Id ? `#${list.Id}` : ""}`
      };
      
      const { data, isComplete } = handlePartialData(
        partialData,
        idSpecificDefault,
        `List ${list.Id || ""}`
      );
      
      // Add metadata for UI display
      (data as any)._metadata = {
        isComplete,
        missingFields: !isComplete ? 
          Object.keys(partialData).filter(k => partialData[k as keyof ListData] === undefined) : 
          []
      };
      
      return data;
    })
    .filter(Boolean) as ListData[];
};

// Helper to extract meaningful debug information from responses
export const extractDebugInfo = (response: any): any => {
  if (!response) return { error: "Empty response" };
  
  try {
    // Extract only useful debugging information to avoid clutter
    const debugInfo = {
      status: response.status || "unknown",
      endpoints: response.results ? response.results.map((r: any) => ({
        endpoint: r.endpoint || "unknown",
        success: !!r.data,
        error: r.error || null,
        dataPresent: !!r.data,
        recordCount: r.data?.count || 0
      })) : [],
      errors: response.error || null
    };
    
    return debugInfo;
  } catch (error) {
    return { error: "Failed to extract debug info", details: String(error) };
  }
};
