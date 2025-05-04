
import { supabase } from "@/integrations/supabase/client";
import { CreatorIQStateRow, CreatorIQState } from "./types";
import { CreatorIQErrorType, displayCreatorIQError, withCreatorIQRetry, creatorIQCache } from "./errorHandling";

// Save state data to Supabase database for persistence
export const saveStateToDatabase = async (
  userId: string, 
  stateKey: string, 
  data: any,
  queryContext: string = ''
): Promise<boolean> => {
  try {
    // First try to save to cache as a fallback mechanism
    creatorIQCache.set(`state_${stateKey}`, data);
    
    const { error } = await withCreatorIQRetry(
      async () => await supabase
        .from('creator_iq_state')
        .upsert({
          key: stateKey,
          user_id: userId,
          data,
          query_context: queryContext,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour expiry
        }, {
          onConflict: 'key'
        }),
      3,
      1000,
      { operation: 'saveStateToDatabase', stateKey, userId }
    );
    
    if (error) {
      console.error("Error saving state to database:", error);
      throw error;
    }
    
    console.log(`State saved to database with key: ${stateKey}`);
    return true;
  } catch (error) {
    displayCreatorIQError({
      type: CreatorIQErrorType.STATE_ERROR,
      message: "Unable to save your Creator IQ data. Some information may be lost when you refresh.",
      originalError: error,
      isRetryable: false,
      context: { operation: 'saveStateToDatabase', stateKey }
    });
    return false;
  }
};

// Get state data from Supabase database with robust error handling
export const getStateFromDatabase = async (stateKey: string): Promise<CreatorIQState | null> => {
  try {
    // Try to retrieve from database
    const { data, error } = await withCreatorIQRetry(
      async () => await supabase
        .from('creator_iq_state')
        .select('*')
        .eq('key', stateKey)
        .single(),
      3,
      1000,
      { operation: 'getStateFromDatabase', stateKey }
    );
    
    if (error) {
      // Check if we have a cached copy
      const cached = creatorIQCache.get<any>(`state_${stateKey}`);
      if (cached.data) {
        console.log(`Retrieved state from cache for key: ${stateKey} (${cached.isFresh ? 'fresh' : 'stale'})`);
        
        // If not fresh, display a warning
        if (!cached.isFresh) {
          displayCreatorIQError({
            type: CreatorIQErrorType.INCOMPLETE_DATA,
            message: "Using cached Creator IQ data that may be outdated. Some information might not be current.",
            isRetryable: false,
            context: { operation: 'getStateFromDatabase', stateKey, source: 'cache' }
          });
        }
        
        // Return cached data with a synthesized state structure
        return {
          key: stateKey,
          userId: 'unknown', // We don't have user ID in cache
          data: cached.data,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // Give it 30 more minutes
          createdAt: new Date()
        };
      }
      
      console.error("Error getting state from database:", error);
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    const stateRow = data as CreatorIQStateRow;
    
    // Convert the database row to our internal state format
    const state: CreatorIQState = {
      key: stateRow.key,
      userId: stateRow.user_id,
      data: stateRow.data,
      expiresAt: new Date(stateRow.expires_at),
      createdAt: new Date(stateRow.created_at)
    };
    
    // Save to cache for future fallback
    creatorIQCache.set(`state_${stateKey}`, state.data, 'api');
    
    console.log(`Retrieved state from database for key: ${stateKey}`);
    return state;
  } catch (error) {
    displayCreatorIQError({
      type: CreatorIQErrorType.STATE_ERROR,
      message: "Unable to retrieve your previous Creator IQ data. Some context from your previous requests may be lost.",
      originalError: error,
      isRetryable: true,
      context: { operation: 'getStateFromDatabase', stateKey }
    });
    return null;
  }
};

// Find state by query keywords with improved error handling
export const findStateByQuery = async (userId: string, queryTerms: string[]): Promise<any | null> => {
  try {
    // Check the cache first for quick access
    for (const term of queryTerms) {
      const cached = creatorIQCache.get<any>(`query_${userId}_${term.toLowerCase()}`);
      if (cached.data) {
        console.log(`Found cached state for query term: ${term}`);
        return cached.data;
      }
    }
    
    // If not found in cache, search the database
    const { data, error } = await withCreatorIQRetry(
      async () => await supabase
        .from('creator_iq_state')
        .select('*')
        .eq('user_id', userId)
        .is('query_context', 'not.null')
        .order('created_at', { ascending: false })
        .limit(10),
      2,
      1000,
      { operation: 'findStateByQuery', userId, queryTerms }
    );
    
    if (error) {
      console.error("Error finding state by query:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return null;
    }
    
    // Find the most relevant state based on query terms
    let bestMatch: CreatorIQStateRow | null = null;
    let bestScore = 0;
    
    for (const stateRow of data) {
      if (!stateRow.query_context) continue;
      
      // Calculate relevance score
      const queryContext = stateRow.query_context.toLowerCase();
      let score = 0;
      
      for (const term of queryTerms) {
        if (queryContext.includes(term.toLowerCase())) {
          // More specific terms get higher scores
          score += 1 + (term.length / 10); 
        }
      }
      
      // Prefer more recent states
      const recencyBoost = (Date.now() - new Date(stateRow.created_at).getTime()) < 24 * 60 * 60 * 1000 ? 0.5 : 0;
      score += recencyBoost;
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = stateRow;
      }
    }
    
    if (!bestMatch || bestScore < 0.5) {
      console.log("No relevant state found for query terms:", queryTerms);
      return null;
    }
    
    console.log(`Found relevant state with score ${bestScore} for query terms:`, queryTerms);
    
    // Save to cache for future queries
    for (const term of queryTerms) {
      creatorIQCache.set(`query_${userId}_${term.toLowerCase()}`, bestMatch.data, 'api');
    }
    
    return bestMatch.data;
  } catch (error) {
    // Log but don't display to user as this is a background operation
    console.error("Error finding state by query:", error);
    return null;
  }
};
