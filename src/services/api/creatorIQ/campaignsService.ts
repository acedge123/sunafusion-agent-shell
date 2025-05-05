
import { toast } from "sonner";
import { makeCreatorIQRequest } from "./serviceBase";

/**
 * Get publishers for a specific campaign
 */
export async function getCampaignPublishers(campaignId: string, limit = 100) {
  try {
    const message = `Get publishers for campaign with ID ${campaignId}`;
    const params = {
      campaign_id: campaignId,
      limit
    };
    
    const data = await makeCreatorIQRequest(message, params);
    return data;
  } catch (error) {
    console.error(`Error fetching publishers for campaign ${campaignId}:`, error);
    toast.error("Failed to fetch campaign publishers");
    throw error;
  }
}
