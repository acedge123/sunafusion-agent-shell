
import { cacheCore } from './cacheCore';
import { campaignCache } from './campaignCache';
import { listCache } from './listCache';

export const publisherCache = {
  // Store all publishers with pagination metadata
  storeAllPublishers: (publishers: any[], metadata: any): void => {
    try {
      cacheCore.set('all_publishers', {
        publishers,
        metadata: {
          ...metadata,
          timestamp: Date.now(),
          complete: true
        }
      }, 60 * 60 * 1000); // Keep complete publishers list for 1 hour
      
      console.log(`Stored complete publishers list with ${publishers.length} publishers`);
    } catch (error) {
      console.error("Error storing all publishers:", error);
    }
  },
  
  // Retrieve all publishers
  getAllPublishers: (): { publishers: any[], metadata: any } | null => {
    try {
      const result = cacheCore.get<{ publishers: any[], metadata: any }>('all_publishers');
      if (result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving all publishers:", error);
      return null;
    }
  },
  
  // Find cached publisher by ID
  findPublisherById: (publisherId: string): any => {
    try {
      // Check in the publisher cache
      const cached = cacheCore.get<any[]>('all_publishers');
      if (cached.data) {
        const match = cached.data.find(p => p.id === publisherId);
        if (match) return match;
      }
      
      // Check all publishers cache
      const allPublishers = publisherCache.getAllPublishers();
      if (allPublishers && allPublishers.publishers) {
        const match = allPublishers.publishers.find(p => {
          if (p.Publisher && p.Publisher.Id === publisherId) return true;
          return p.id === publisherId;
        });
        if (match) return match;
      }
      
      // If not found, check through campaign publishers
      const campaigns = campaignCache.getAllCampaigns();
      if (campaigns && campaigns.campaigns) {
        for (const campaign of campaigns.campaigns) {
          const publishers = cacheCore.get<any[]>(`campaign_publishers_${campaign.Campaign.CampaignId}`);
          if (publishers.data) {
            const match = publishers.data.find(p => p.id === publisherId);
            if (match) return match;
          }
        }
      }
      
      // If not found, check through list publishers
      const lists = listCache.getAllLists();
      if (lists && lists.lists) {
        for (const list of lists.lists) {
          const publishers = cacheCore.get<any[]>(`list_publishers_${list.List.Id}`);
          if (publishers.data) {
            const match = publishers.data.find(p => p.id === publisherId);
            if (match) return match;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error finding publisher by ID:", error);
      return null;
    }
  },
  
  // Search for a publisher by name
  findPublisherByName: (name: string): any[] => {
    try {
      // First check all publishers collection
      const allPublishers = publisherCache.getAllPublishers();
      const searchTerm = name.toLowerCase();
      let results: any[] = [];
      
      console.log(`Searching cached publishers for: "${searchTerm}"`);
      
      if (allPublishers && allPublishers.publishers) {
        // Advanced search with fuzzy matching
        results = allPublishers.publishers.filter(publisher => {
          if (!publisher.Publisher) return false;
          
          // Check different possible name fields
          const publisherName = (
            publisher.Publisher.PublisherName || 
            publisher.Publisher.Username || 
            publisher.Publisher.Name || 
            ''
          ).toLowerCase();
          
          // Direct match
          if (publisherName.includes(searchTerm)) {
            return true;
          }
          
          // Word-by-word matching for multiple word searches
          const searchWords = searchTerm.split(/\s+/);
          if (searchWords.length > 1) {
            let matchCount = 0;
            for (const word of searchWords) {
              if (word.length > 2 && publisherName.includes(word)) {
                matchCount++;
              }
            }
            return matchCount >= Math.ceil(searchWords.length * 0.6);
          }
          
          return false;
        });
      }
      
      // If we have results from the all publishers collection, return them
      if (results.length > 0) {
        return results;
      }
      
      // If no results from all publishers, try looking in campaign and list publishers
      let combinedResults: any[] = [];
      
      // Check campaign publishers
      const campaigns = campaignCache.getAllCampaigns();
      if (campaigns && campaigns.campaigns) {
        for (const campaign of campaigns.campaigns) {
          if (!campaign.Campaign || !campaign.Campaign.CampaignId) continue;
          
          const campaignId = campaign.Campaign.CampaignId;
          const publishers = cacheCore.get<any[]>(`campaign_publishers_${campaignId}`);
          
          if (publishers.data) {
            const matches = publishers.data.filter(p => {
              const publisherName = (p.name || p.username || '').toLowerCase();
              return publisherName.includes(searchTerm);
            });
            
            if (matches.length > 0) {
              combinedResults = [...combinedResults, ...matches];
            }
          }
        }
      }
      
      // Check list publishers
      const lists = listCache.getAllLists();
      if (lists && lists.lists) {
        for (const list of lists.lists) {
          if (!list.List || !list.List.Id) continue;
          
          const listId = list.List.Id;
          const publishers = cacheCore.get<any[]>(`list_publishers_${listId}`);
          
          if (publishers.data) {
            const matches = publishers.data.filter(p => {
              const publisherName = (p.name || p.username || '').toLowerCase();
              return publisherName.includes(searchTerm);
            });
            
            if (matches.length > 0) {
              combinedResults = [...combinedResults, ...matches];
            }
          }
        }
      }
      
      // Remove duplicates based on publisher ID
      const uniquePublishers = [];
      const idSet = new Set();
      
      for (const publisher of combinedResults) {
        const id = publisher.id || (publisher.Publisher && publisher.Publisher.Id);
        if (id && !idSet.has(id)) {
          idSet.add(id);
          uniquePublishers.push(publisher);
        }
      }
      
      return uniquePublishers;
    } catch (error) {
      console.error("Error searching cached publishers:", error);
      return [];
    }
  }
};
