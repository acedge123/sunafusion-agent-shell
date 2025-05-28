
// Handlers for list-related endpoints
import { CreatorIQEndpoint, PreviousState } from './types.ts';
import { extractListNameFromContext, findListInState } from './utils.ts';

/**
 * Handle list creation endpoints
 */
export function handleListCreationEndpoints(query: string): CreatorIQEndpoint[] {
  const lowerQuery = query.toLowerCase();
  
  if ((lowerQuery.includes('create') || lowerQuery.includes('make')) && 
      lowerQuery.includes('list')) {
    console.log("Detected list creation request");
    return [{
      route: "/lists",
      method: "POST",
      name: "Create List"
    }];
  }
  
  return [];
}

/**
 * Handle list query endpoints
 */
export function handleListQueryEndpoints(query: string, previousState: any): CreatorIQEndpoint[] {
  const lowerQuery = query.toLowerCase();
  const endpoints: CreatorIQEndpoint[] = [];
  
  // Check for various list-related queries
  if (lowerQuery.includes('list') || 
      lowerQuery.includes('all lists') ||
      lowerQuery.includes('show lists') ||
      lowerQuery.includes('get lists') ||
      (lowerQuery.includes('find') && lowerQuery.includes('influencer'))) {
    console.log("Adding list endpoints based on keywords");
    endpoints.push({
      route: "/lists",
      method: "GET",
      name: "Get Lists"
    });
    
    // If we detect a specific list name, add endpoint for that list's publishers
    const listNameMatch = query.match(/list(?:\s+called|\s+named|\s+titled)?\s+["']([^"']+)["']/i);
    if (listNameMatch && listNameMatch[1]) {
      const listName = listNameMatch[1];
      console.log(`Detected list name: "${listName}", will search for it`);
      
      // If we have previous state with lists, try to find the list ID
      const listId = findListInState(listName, previousState);
      if (listId) {
        console.log(`Found matching list in previous state: ${listName} (${listId})`);
        endpoints.push({
          route: `/lists/${listId}/publishers`,
          method: "GET",
          name: "Get Publishers in List"
        });
      }
    }
  }
  
  return endpoints;
}
