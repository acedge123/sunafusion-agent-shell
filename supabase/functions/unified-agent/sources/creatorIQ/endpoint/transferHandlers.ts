
// Handlers for transfer operations (list to list, list to campaign, etc)
import { CreatorIQEndpoint, PreviousState } from './types.ts';
import { extractNameAfterPhrase, findListInState, findCampaignInState } from './utils.ts';

/**
 * Handle publisher transfer between lists or campaigns
 */
export function handlePublisherTransferEndpoints(query: string, previousState: any): CreatorIQEndpoint[] {
  const lowerQuery = query.toLowerCase();
  const endpoints: CreatorIQEndpoint[] = [];
  
  if ((lowerQuery.includes('add') || lowerQuery.includes('copy') || lowerQuery.includes('move')) && 
     (lowerQuery.includes('publisher') || lowerQuery.includes('influencer'))) {
    
    // Determine if adding to list or campaign
    const isListTarget = lowerQuery.includes('list') && !lowerQuery.includes('from list to campaign');
    const isCampaignTarget = lowerQuery.includes('campaign') || lowerQuery.includes('from list to campaign');
    
    if (isListTarget) {
      console.log("Detected request to add publisher to list");
      
      // Extract source and target list names
      const sourcePhrases = ['from list', 'in list', 'list called', 'source list'];
      const targetPhrases = ['to list', 'into list', 'target list'];
      
      let sourceListName = null;
      let targetListName = null;
      
      // Extract source and target list names
      for (const phrase of sourcePhrases) {
        const extractedName = extractNameAfterPhrase(query, phrase);
        if (extractedName) {
          sourceListName = extractedName;
          console.log(`Found potential source list name: "${sourceListName}"`);
          break;
        }
      }
      
      for (const phrase of targetPhrases) {
        const extractedName = extractNameAfterPhrase(query, phrase);
        if (extractedName) {
          targetListName = extractedName;
          console.log(`Found potential target list name: "${targetListName}"`);
          break;
        }
      }
      
      // Find list IDs from names
      const sourceListId = findListInState(sourceListName, previousState);
      const targetListId = findListInState(targetListName, previousState);
      
      // If we found a source list, get its publishers
      if (sourceListId) {
        endpoints.push({
          route: `/lists/${sourceListId}/publishers`,
          method: "GET",
          name: "Get Source List Publishers",
          sourceListId: sourceListId
        });
      } else {
        // If no source list identified, we need to get all lists first
        endpoints.push({
          route: "/lists",
          method: "GET",
          name: "Get Lists"
        });
      }
      
      // If we found both source and target list IDs and they're different, add the endpoint to add publishers
      if (sourceListId && targetListId && sourceListId !== targetListId) {
        endpoints.push({
          route: `/lists/${targetListId}/publishers`,
          method: "POST",
          name: "Add Publishers To List",
          targetListId: targetListId,
          sourceListId: sourceListId
        });
      }
    }
    else if (isCampaignTarget) {
      console.log("Detected request to add publisher to campaign");
      
      // Extract source type indicators
      const isSourceList = lowerQuery.includes('from list') || lowerQuery.includes('from the list');
      const isSourceCampaign = lowerQuery.includes('from campaign') || lowerQuery.includes('from the campaign');
      let sourceType = null; // 'list' or 'campaign'
      
      // Find source and target names
      const sourcePhrases = [
        'from list', 'from the list', 'list called', 'source list',
        'from campaign', 'from the campaign', 'campaign called', 'source campaign'
      ];
      const targetPhrases = ['to campaign', 'into campaign', 'target campaign'];
      
      let sourceName = null;
      let targetCampaignName = null;
      
      // Extract source name
      for (const phrase of sourcePhrases) {
        const extractedName = extractNameAfterPhrase(query, phrase);
        if (extractedName) {
          sourceName = extractedName;
          // Set source type based on phrase
          if (phrase.includes('list')) {
            sourceType = 'list';
          } else if (phrase.includes('campaign')) {
            sourceType = 'campaign';
          }
          console.log(`Found potential source ${sourceType}: "${sourceName}"`);
          break;
        }
      }
      
      // Extract target campaign name
      for (const phrase of targetPhrases) {
        const extractedName = extractNameAfterPhrase(query, phrase);
        if (extractedName) {
          targetCampaignName = extractedName;
          console.log(`Found potential target campaign name: "${targetCampaignName}"`);
          break;
        }
      }
      
      // Find IDs based on names
      let sourceId = null;
      let targetCampaignId = null;
      
      // Find source ID based on type and name
      if (sourceName) {
        if ((sourceType === 'list' || !sourceType) && previousState?.lists?.length > 0) {
          const listId = findListInState(sourceName, previousState);
          if (listId) {
            sourceId = listId;
            sourceType = 'list';
            console.log(`Found source list ID: ${sourceId} for "${sourceName}"`);
          }
        }
        
        if ((sourceType === 'campaign' || (!sourceType && !sourceId)) && 
            previousState?.campaigns?.length > 0) {
          const campaignId = findCampaignInState(sourceName, previousState);
          if (campaignId) {
            sourceId = campaignId;
            sourceType = 'campaign';
            console.log(`Found source campaign ID: ${sourceId} for "${sourceName}"`);
          }
        }
      }
      
      // Find target campaign ID
      if (targetCampaignName && previousState?.campaigns?.length > 0) {
        targetCampaignId = findCampaignInState(targetCampaignName, previousState);
      }
      
      // Based on what we found, set up the endpoints
      // If we have a source list or campaign, get its publishers first
      if (sourceId && sourceType) {
        if (sourceType === 'list') {
          endpoints.push({
            route: `/lists/${sourceId}/publishers`,
            method: "GET",
            name: "Get Source List Publishers",
            sourceListId: sourceId
          });
        } else if (sourceType === 'campaign') {
          endpoints.push({
            route: `/campaigns/${sourceId}/publishers`,
            method: "GET",
            name: "Get Source Campaign Publishers",
            sourceCampaignId: sourceId
          });
        }
      } else {
        // If we don't have a source, get lists or campaigns first
        if (isSourceList) {
          endpoints.push({
            route: "/lists",
            method: "GET",
            name: "Get Lists"
          });
        } else if (isSourceCampaign) {
          endpoints.push({
            route: "/campaigns",
            method: "GET",
            name: "List Campaigns"
          });
        } else {
          // Try both
          endpoints.push({
            route: "/lists",
            method: "GET",
            name: "Get Lists"
          });
          endpoints.push({
            route: "/campaigns",
            method: "GET",
            name: "List Campaigns"
          });
        }
      }
      
      // If we have a target campaign ID and source, add endpoint to add publishers
      if (targetCampaignId && sourceId) {
        endpoints.push({
          route: `/campaigns/${targetCampaignId}/publishers`,
          method: "POST",
          name: "Add Publishers To Campaign",
          targetCampaignId: targetCampaignId,
          sourceId: sourceId,
          sourceType: sourceType
        });
      }
    }
  }
  
  return endpoints;
}
