
import { CampaignData, PublisherData, ListData } from "./types";

// Extract campaign data from Creator IQ API response
export const extractCampaignData = (responseData: any): CampaignData[] => {
  if (!responseData || !responseData.CampaignCollection) {
    return [];
  }

  return responseData.CampaignCollection.map((item: any) => {
    if (!item.Campaign) return null;
    
    return {
      id: item.Campaign.CampaignId,
      name: item.Campaign.CampaignName || 'Unnamed Campaign',
      status: item.Campaign.CampaignStatus,
      publishersCount: item.Campaign.PublishersCount
    };
  }).filter(Boolean);
};

// Extract publisher data from Creator IQ API response
export const extractPublisherData = (responseData: any): PublisherData[] => {
  if (!responseData || !responseData.PublisherCollection) {
    return [];
  }

  return responseData.PublisherCollection.map((item: any) => {
    if (!item.Publisher) return null;
    
    return {
      id: item.Publisher.Id,
      name: item.Publisher.PublisherName || 'Unnamed Publisher',
      status: item.Publisher.Status
    };
  }).filter(Boolean);
};

// Extract list data from Creator IQ API response
export const extractListData = (responseData: any): ListData[] => {
  if (!responseData || !responseData.ListsCollection) {
    return [];
  }

  return responseData.ListsCollection.map((item: any) => {
    if (!item.List) return null;
    
    return {
      id: item.List.Id,
      name: item.List.Name || 'Unnamed List',
      publishersCount: item.List.Publishers?.length
    };
  }).filter(Boolean);
};
