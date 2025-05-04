
// Extract structured data from API responses

/**
 * Extract campaign data from API response
 */
export function extractCampaignData(data: any): any[] {
  try {
    if (!data || !data.CampaignCollection) return [];
    
    return data.CampaignCollection
      .filter((campaign: any) => campaign && campaign.Campaign && campaign.Campaign.CampaignId)
      .map((campaign: any) => ({
        id: campaign.Campaign.CampaignId,
        name: campaign.Campaign.CampaignName || 'Unnamed Campaign',
        status: campaign.Campaign.CampaignStatus || 'Unknown',
        publishersCount: campaign.Campaign.PublishersCount || 0,
        startDate: campaign.Campaign.StartDate,
        endDate: campaign.Campaign.EndDate,
        href: campaign.href,
        advertiserId: campaign.Campaign.AdvertiserId
      }));
  } catch (error) {
    console.error("Error extracting campaign data:", error);
    return [];
  }
}

/**
 * Extract publisher data from API response
 */
export function extractPublisherData(data: any): any[] {
  try {
    if (!data) return [];
    
    // Handle campaign publishers response format
    if (data.PublisherCollection) {
      return data.PublisherCollection
        .filter((publisher: any) => publisher && publisher.Publisher && publisher.Publisher.Id)
        .map((publisher: any) => ({
          id: publisher.Publisher.Id,
          name: publisher.Publisher.PublisherName || 'Unnamed',
          status: publisher.Publisher.Status || 'Unknown',
          href: publisher.href,
          // Add campaign context if available
          campaignId: data.campaignId,
          campaignName: data.campaignName
        }));
    } 
    // Handle list publishers response format
    else if (data.PublishersCollection) {
      return data.PublishersCollection
        .filter((publisher: any) => publisher && publisher.Publisher && publisher.Publisher.Id)
        .map((publisher: any) => ({
          id: publisher.Publisher.Id,
          name: publisher.Publisher.PublisherName || 'Unnamed',
          status: publisher.Publisher.Status || 'Unknown',
          href: publisher.href,
          // Add list context if available
          listId: data.listId,
          listName: data.listName
        }));
    }
    
    return [];
  } catch (error) {
    console.error("Error extracting publisher data:", error);
    return [];
  }
}

/**
 * Extract list data from API response
 */
export function extractListData(data: any): any[] {
  try {
    if (!data || !data.ListsCollection) return [];
    
    return data.ListsCollection
      .filter((list: any) => list && list.List && list.List.Id)
      .map((list: any) => ({
        id: list.List.Id,
        name: list.List.Name || 'Unnamed List',
        description: list.List.Description || '',
        publishersCount: list.List.Publishers || 0,
        href: list.href
      }));
  } catch (error) {
    console.error("Error extracting list data:", error);
    return [];
  }
}
