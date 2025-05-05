// Handlers for campaign-related endpoints
import { CreatorIQEndpoint, PreviousState } from './types.ts';

/**
 * Handle campaign query endpoints
 */
export function handleCampaignQueryEndpoints(query: string, previousState: any): CreatorIQEndpoint[] {
  const lowerQuery = query.toLowerCase();
  const endpoints: CreatorIQEndpoint[] = [];
  
  if (lowerQuery.includes('campaign') || 
      lowerQuery.includes('ready rocker') || 
      lowerQuery.includes('ambassador') || 
      lowerQuery.includes('program')) {
    console.log("Adding campaign endpoints based on keywords");
    endpoints.push({
      route: "/campaigns",
      method: "GET",
      name: "List Campaigns"
    });
    
    // If we detect a specific campaign or have one in state, add publishers endpoint
    if (previousState && previousState.campaigns && previousState.campaigns.length > 0) {
      // If query mentions specific campaign, look for it in state
      let targetCampaign = null;
      
      for (const campaign of previousState.campaigns) {
        if (lowerQuery.includes(campaign.name.toLowerCase())) {
          console.log(`Query mentions campaign: ${campaign.name}, will get its publishers`);
          targetCampaign = campaign;
          break;
        }
      }
      
      // If we found a specific campaign, add endpoint for its publishers
      if (targetCampaign) {
        endpoints.push({
          route: `/campaigns/${targetCampaign.id}/publishers`,
          method: "GET",
          name: "Get Campaign Publishers"
        });
      } 
      // Otherwise if query asks for publishers, use the first campaign
      else if (lowerQuery.includes('publisher') || lowerQuery.includes('influencer')) {
        console.log("Query mentions publishers but no specific campaign, using first campaign from state");
        endpoints.push({
          route: `/campaigns/${previousState.campaigns[0].id}/publishers`,
          method: "GET",
          name: "Get Campaign Publishers"
        });
      }
    }
  }
  
  return endpoints;
}
