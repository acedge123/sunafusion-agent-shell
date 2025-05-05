
// Utility functions for endpoint determination

/**
 * Extracts list name from a query text and context
 */
export function extractListNameFromContext(query: string): string | null {
  const patterns = [
    // "list called X"
    /list\s+(?:called|named|titled)?\s+["']([^"']+)["']/i,
    // "X list"
    /["']([^"']+)["'](?:\s+list)/i,
    // List name without quotes
    /(?:create|make)\s+(?:a\s+)?(?:new\s+)?list\s+(?:called|named|titled)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
  ];
  
  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      console.log(`Extracted list name: "${match[1].trim()}"`);
      return match[1].trim();
    }
  }
  
  // Capitalize word match
  const capitalizedMatch = query.match(/(?:create|make)\s+(?:a\s+)?(?:new\s+)?list\s+(?:called|named|titled)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (capitalizedMatch && capitalizedMatch[1]) {
    console.log(`Extracted potential list name from capitalized words: "${capitalizedMatch[1].trim()}"`);
    return capitalizedMatch[1].trim();
  }
  
  return null;
}

/**
 * Finds a list in the previous state by name
 */
export function findListInState(listName: string, previousState: any): string | null {
  if (!previousState?.lists || !listName) return null;
  
  const list = previousState.lists.find((list: any) => 
    list.name.toLowerCase().includes(listName.toLowerCase())
  );
  
  if (list) {
    console.log(`Found list ID: ${list.id} for "${listName}"`);
    return list.id;
  }
  
  return null;
}

/**
 * Finds a campaign in the previous state by name
 */
export function findCampaignInState(campaignName: string, previousState: any): string | null {
  if (!previousState?.campaigns || !campaignName) return null;
  
  const campaign = previousState.campaigns.find((campaign: any) => 
    campaign.name.toLowerCase().includes(campaignName.toLowerCase())
  );
  
  if (campaign) {
    console.log(`Found campaign ID: ${campaign.id} for "${campaignName}"`);
    return campaign.id;
  }
  
  return null;
}

/**
 * Extract a name from query using a phrase pattern
 */
export function extractNameAfterPhrase(query: string, phrase: string): string | null {
  if (!query.toLowerCase().includes(phrase.toLowerCase())) return null;
  
  const afterPhrase = query.substring(query.toLowerCase().indexOf(phrase.toLowerCase()) + phrase.length).trim();
  const nameMatch = afterPhrase.match(/["']([^"']+)["']/) || 
                    afterPhrase.match(/(\b[A-Z][a-zA-Z0-9\s-]+)/);
  
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1].trim();
  }
  
  return null;
}

/**
 * Extract publisher ID from query
 */
export function extractPublisherIdFromQuery(query: string): string | null {
  const publisherIdPatterns = [
    // "publisher 12345" or "publisher ID 12345"
    /publisher\s+(?:id\s+)?(\d+)/i,
    // "send message to publisher 12345"
    /(?:send|message)(?:\s+to)?\s+publisher\s+(?:id\s+)?(\d+)/i,
    // "publisher with id 12345" 
    /publisher\s+(?:with\s+id\s+)?(\d+)/i,
    // "this publisher 12345"
    /this\s+publisher\s+(\d+)/i,
    // Standalone number that could be a publisher ID
    /\b(\d{6,10})\b/ // Looking for 6-10 digit numbers that are likely publisher IDs
  ];
  
  for (const pattern of publisherIdPatterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      const publisherId = match[1].trim();
      console.log(`Found publisher ID using pattern ${pattern}: ${publisherId}`);
      return publisherId;
    }
  }
  
  return null;
}
