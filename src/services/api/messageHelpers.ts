
import { findStateByQuery, generateStateKey } from "@/utils/creatorIQ";

/**
 * Helper function to prepare Creator IQ state for the current query
 */
export async function prepareCreatorIQState(userId: string | undefined, content: string) {
  let previousState = null;
  let stateKey = null;
  
  if (userId && (content.toLowerCase().includes('creator') || 
      content.toLowerCase().includes('campaign') || 
      content.toLowerCase().includes('publisher') || 
      content.toLowerCase().includes('list') ||
      content.toLowerCase().includes('ready rocker') ||
      content.toLowerCase().includes('message'))) {
    
    // Try to find relevant previous state based on query content
    const queryTerms = [
      'campaign', 'publisher', 'influencer', 'creator iq', 'ready rocker', 'list', 'message'
    ].filter(term => content.toLowerCase().includes(term));
    
    if (queryTerms.length > 0) {
      console.log("Looking for previous state with terms:", queryTerms);
      previousState = await findStateByQuery(userId, queryTerms);
      
      if (previousState) {
        console.log("Found previous Creator IQ state:", previousState);
        
        // Extract publisher IDs from previous state for potential message sending
        if (previousState.publishers && previousState.publishers.length > 0) {
          console.log(`Found ${previousState.publishers.length} publishers in previous state`);
          
          // Log first few publisher IDs for debugging
          const samplePublishers = previousState.publishers.slice(0, 3);
          console.log("Sample publishers from previous state:", samplePublishers.map(p => p.id));
        }
      }
    }
    
    // Generate a new state key for this query
    stateKey = generateStateKey(userId, content);
  }
  
  return { stateKey, previousState };
}

/**
 * Helper function to extract search terms from content
 */
export function extractSearchTerms(content: string, contextKeywords: string[]): string[] {
  const contentLower = content.toLowerCase();
  const terms: string[] = [];
  
  // First look for terms after contextKeywords with quotes
  for (const keyword of contextKeywords) {
    const quotedRegex = new RegExp(`${keyword}\\s+["']([^"']+)["']`, 'i');
    const quotedMatch = contentLower.match(quotedRegex);
    
    if (quotedMatch && quotedMatch[1]) {
      terms.push(quotedMatch[1].trim());
      continue;
    }
    
    // Then look for terms after contextKeywords without quotes
    const pattern = `${keyword}\\s+([^\\s,\\.\\?!]{3,}[\\s\\w]+)`;
    const regex = new RegExp(pattern, 'i');
    const match = contentLower.match(regex);
    
    if (match && match[1]) {
      // Extract up to the next punctuation
      const term = match[1].replace(/[,.!?].*$/, '').trim();
      if (term && term.length >= 3 && !terms.includes(term)) {
        terms.push(term);
      }
    }
  }
  
  return terms;
}
