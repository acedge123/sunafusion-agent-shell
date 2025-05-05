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
 * Extract detailed list data from API response
 */
export function extractListData(responseData: any): any[] {
  try {
    if (!responseData.ListsCollection || !Array.isArray(responseData.ListsCollection)) {
      console.warn("No lists collection found in response data");
      return [];
    }
    
    // Map the lists to a standardized format with more details
    return responseData.ListsCollection.map((listItem: any) => {
      const list = listItem.List || {};
      
      // Extract publisher data if available
      let publisherCount = 0;
      let publisherIds: any[] = [];
      
      if (list.Publishers && Array.isArray(list.Publishers)) {
        publisherCount = list.Publishers.length;
        publisherIds = list.Publishers.map((p: any) => p.Id || p.id).filter(Boolean);
      }
      
      return {
        id: list.Id || list.id || null,
        name: list.Name || list.name || "Unnamed List",
        description: list.Description || list.description || null,
        publisherCount, 
        publisherIds,
        rawData: list // Keep the raw data for reference
      };
    }).filter((list: any) => list.id); // Filter out any lists without IDs
  } catch (error) {
    console.error("Error extracting list data:", error);
    return [];
  }
}

/**
 * Extract pagination metadata from API response
 */
export function extractPaginationMetadata(responseData: any): any {
  try {
    const totalItems = responseData.total || 0;
    const currentPage = responseData.page || 1;
    const totalPages = responseData.total_pages || 1;
    const itemsPerPage = responseData.limit || 50;
    
    return {
      total: totalItems,
      currentPage, 
      totalPages,
      itemsPerPage,
      hasMore: currentPage < totalPages
    };
  } catch (error) {
    console.error("Error extracting pagination metadata:", error);
    return null;
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
 * Recursively navigate and normalize a deeply nested response structure
 * to extract data from nested objects like the one shown in the example
 */
export function normalizeNestedData(data: any): any {
  if (!data) return null;
  
  // Handle case where data is nested inside another object with same key
  if (data.List && data.List.List) {
    return normalizeNestedData(data.List);
  }
  
  // Handle Publisher nested data
  if (data.Publisher && data.Publisher.Publisher) {
    return normalizeNestedData(data.Publisher);
  }
  
  // Handle Campaign nested data
  if (data.Campaign && data.Campaign.Campaign) {
    return normalizeNestedData(data.Campaign);
  }
  
  // Extract publishers array if it exists
  if (data.List && Array.isArray(data.List.Publishers)) {
    return {
      ...data.List,
      PublisherIds: data.List.Publishers // Keep the publisher IDs accessible
    };
  }
  
  // If the object has a List property, return that
  if (data.List) {
    return data.List;
  }
  
  // If the object has a Publisher property, return that
  if (data.Publisher) {
    return data.Publisher;
  }
  
  // If the object has a Campaign property, return that
  if (data.Campaign) {
    return data.Campaign;
  }
  
  // Otherwise return the original data
  return data;
}

/**
 * Extract publisher IDs from a response that may have nested data
 */
export function extractPublisherIds(data: any): number[] {
  try {
    // Normalize nested data structure first
    const normalizedData = normalizeNestedData(data);
    
    // Check if we have a Publishers array directly
    if (Array.isArray(normalizedData.Publishers)) {
      return normalizedData.Publishers.map((id: any) => 
        typeof id === 'object' ? (id.Id || id.id) : id
      ).filter(Boolean);
    }
    
    // Check if we have PublisherCollection
    if (normalizedData.PublisherCollection) {
      return normalizedData.PublisherCollection
        .map((pub: any) => {
          const publisher = pub.Publisher || pub;
          return publisher.Id || publisher.id;
        })
        .filter(Boolean);
    }
    
    // Check if we have PublishersCollection
    if (normalizedData.PublishersCollection) {
      return normalizedData.PublishersCollection
        .map((pub: any) => {
          const publisher = pub.Publisher || pub;
          return publisher.Id || publisher.id;
        })
        .filter(Boolean);
    }
    
    return [];
  } catch (error) {
    console.error("Error extracting publisher IDs:", error);
    return [];
  }
}
