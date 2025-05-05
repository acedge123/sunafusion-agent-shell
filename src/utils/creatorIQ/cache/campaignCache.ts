
import { cacheCore } from './cacheCore';

export const campaignCache = {
  // Store the complete campaigns list with pagination metadata
  storeAllCampaigns: (campaigns: any[], metadata: any): void => {
    try {
      cacheCore.set('all_campaigns', {
        campaigns,
        metadata: {
          ...metadata,
          timestamp: Date.now(),
          complete: true
        }
      }, 60 * 60 * 1000); // Keep complete campaign list for 1 hour
      
      console.log(`Stored complete campaign list with ${campaigns.length} campaigns`);
    } catch (error) {
      console.error("Error storing all campaigns:", error);
    }
  },
  
  // Retrieve complete campaigns list
  getAllCampaigns: (): { campaigns: any[], metadata: any } | null => {
    try {
      const result = cacheCore.get<{ campaigns: any[], metadata: any }>('all_campaigns');
      if (result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving all campaigns:", error);
      return null;
    }
  },
  
  // Search for a campaign by name in the complete list
  findCampaignByName: (name: string): any[] => {
    try {
      const allCampaigns = campaignCache.getAllCampaigns();
      if (!allCampaigns || !allCampaigns.campaigns) {
        return [];
      }
      
      const searchTerm = name.toLowerCase();
      console.log(`Searching cached campaigns for: "${searchTerm}"`);
      
      // Advanced search with fuzzy matching
      return allCampaigns.campaigns.filter(campaign => {
        if (!campaign.Campaign || !campaign.Campaign.CampaignName) return false;
        
        const campaignName = campaign.Campaign.CampaignName.toLowerCase();
        
        // Direct match
        if (campaignName.includes(searchTerm)) {
          return true;
        }
        
        // Ready Rocker special case
        if (searchTerm.includes("ready") && searchTerm.includes("rocker")) {
          return (
            (campaignName.includes("ready") && campaignName.includes("rocker")) ||
            (campaignName.includes("ambassador") && campaignName.includes("program"))
          );
        }
        
        // Word-by-word matching for multiple word searches
        const searchWords = searchTerm.split(/\s+/);
        if (searchWords.length > 1) {
          let matchCount = 0;
          for (const word of searchWords) {
            if (word.length > 2 && campaignName.includes(word)) {
              matchCount++;
            }
          }
          return matchCount >= Math.ceil(searchWords.length * 0.6);
        }
        
        return false;
      });
    } catch (error) {
      console.error("Error searching cached campaigns:", error);
      return [];
    }
  }
};
