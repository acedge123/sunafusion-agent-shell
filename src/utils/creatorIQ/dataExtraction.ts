
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
    
    const lists = data.ListsCollection
      .filter((list: any) => list && list.List && list.List.Id)
      .map((list: any) => ({
        id: list.List.Id,
        name: list.List.Name || 'Unnamed List',
        description: list.List.Description || '',
        publishersCount: list.List.Publishers || 0,
        href: list.href,
        // Add pagination information
        page: data.page || 1,
        totalPages: data.total_pages || 1
      }));
    
    // Add pagination metadata
    if (data.total !== undefined) {
      console.log(`Extracted ${lists.length} lists (page ${data.page || 1} of ${data.total_pages || 1}, total: ${data.total})`);
    }
    
    return lists;
  } catch (error) {
    console.error("Error extracting list data:", error);
    return [];
  }
}

/**
 * Extract operation result data from write operations
 */
export function extractOperationResult(data: any): any {
  try {
    if (!data) return null;
    
    // If this is a write operation response with operation metadata
    if (data.operation) {
      return {
        successful: data.operation.successful === true,
        type: data.operation.type || 'Unknown operation',
        details: data.operation.details || '',
        timestamp: data.operation.timestamp || new Date().toISOString()
      };
    }
    
    // For list creation responses
    if (data.List && data.List.Id) {
      return {
        successful: true,
        type: 'Create List',
        details: `Created list: ${data.List.Name || 'New List'} (ID: ${data.List.Id})`,
        id: data.List.Id,
        name: data.List.Name,
        timestamp: new Date().toISOString()
      };
    }
    
    // For publisher status update responses
    if (data.Publisher && data.Publisher.Id && data.Publisher.Status) {
      return {
        successful: true,
        type: 'Update Publisher',
        details: `Updated publisher ${data.Publisher.PublisherName || data.Publisher.Id} status to ${data.Publisher.Status}`,
        id: data.Publisher.Id,
        status: data.Publisher.Status,
        timestamp: new Date().toISOString()
      };
    }
    
    // For adding publisher to list responses
    if (data.success === true && data.message && data.message.includes('added to list')) {
      return {
        successful: true,
        type: 'Add Publisher To List',
        details: data.message,
        listId: data.listId,
        publisherId: data.publisherId,
        timestamp: new Date().toISOString()
      };
    }
    
    // For adding publisher to campaign responses
    if (data.success === true && data.message && data.message.includes('added to campaign')) {
      return {
        successful: true,
        type: 'Add Publisher To Campaign',
        details: data.message,
        campaignId: data.campaignId,
        publisherId: data.publisherId,
        timestamp: new Date().toISOString()
      };
    }
    
    // For message sending responses
    if (data.success === true && data.messageId) {
      return {
        successful: true,
        type: 'Send Message',
        details: `Message sent successfully (ID: ${data.messageId})`,
        messageId: data.messageId,
        timestamp: new Date().toISOString()
      };
    }
    
    // Generic success response
    if (data.success === true) {
      return {
        successful: true,
        type: 'Operation',
        details: data.message || 'Operation completed successfully',
        timestamp: new Date().toISOString()
      };
    }
    
    // Unable to determine result format
    return null;
  } catch (error) {
    console.error("Error extracting operation result:", error);
    return null;
  }
}

/**
 * Check if a response contains a write operation result
 */
export function isWriteOperationResponse(data: any): boolean {
  if (!data) return false;
  
  return !!(
    (data.operation && typeof data.operation === 'object') || 
    (data.List && data.List.Id) ||
    (data.Publisher && data.Publisher.Id && data.Publisher.Status) ||
    (data.success === true && (data.messageId || data.message))
  );
}

/**
 * Extract the newly created list data from response
 */
export function extractCreatedList(data: any): any | null {
  try {
    if (!data || !data.List || !data.List.Id) return null;
    
    return {
      id: data.List.Id,
      name: data.List.Name || 'New List',
      description: data.List.Description || '',
      publishersCount: data.List.Publishers ? data.List.Publishers.length : 0,
      href: data.href
    };
  } catch (error) {
    console.error("Error extracting created list:", error);
    return null;
  }
}

/**
 * Extract pagination metadata from API response
 */
export function extractPaginationMetadata(data: any): any {
  try {
    if (!data) return null;
    
    return {
      total: data.total,
      currentPage: data.page || 1,
      totalPages: data.total_pages || 1,
      hasNextPage: data.page < data.total_pages,
      hasPreviousPage: data.page > 1,
      limit: data.limit || 50
    };
  } catch (error) {
    console.error("Error extracting pagination metadata:", error);
    return null;
  }
}
