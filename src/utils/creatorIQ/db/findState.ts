
import { supabase } from "@/integrations/supabase/client";
import { CreatorIQState } from "../types";

/**
 * Find recent state by query terms
 * @param userId The user ID
 * @param queryTerms Array of query terms to match
 * @param maxAge Maximum age in milliseconds (default 1 hour)
 * @returns The state data if found
 */
export async function findStateByQuery(
  userId: string,
  queryTerms: string[],
  maxAge: number = 60 * 60 * 1000 // 1 hour default
): Promise<CreatorIQState | null> {
  try {
    if (!userId || !queryTerms.length) {
      return null;
    }
    
    console.log(`Finding state for user ${userId} with query terms:`, queryTerms);
    
    // Get recent states for the user
    const { data: states, error } = await supabase
      .from('creator_iq_state')
      .select('key, data, query_context, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error("Error finding states by query:", error);
      return null;
    }
    
    if (!states || states.length === 0) {
      console.log("No recent states found for user");
      return null;
    }
    
    // First try an exact match with query_context
    for (const state of states) {
      if (!state.query_context) continue;
      
      const context = state.query_context.toLowerCase();
      for (const term of queryTerms) {
        if (context.includes(term.toLowerCase())) {
          console.log(`Found state with matching context for term "${term}"`);
          
          // Check if state is fresh enough
          const stateTime = new Date(state.updated_at).getTime();
          const currentTime = Date.now();
          if (currentTime - stateTime <= maxAge) {
            return state.data as CreatorIQState;
          } else {
            console.log(`State found but too old (${Math.round((currentTime - stateTime) / 60000)} minutes old)`);
          }
        }
      }
    }
    
    // If no direct match in context, look at keys instead
    for (const state of states) {
      for (const term of queryTerms) {
        if (state.key.toLowerCase().includes(term.toLowerCase())) {
          console.log(`Found state with matching key for term "${term}"`);
          
          // Check if state is fresh enough
          const stateTime = new Date(state.updated_at).getTime();
          const currentTime = Date.now();
          if (currentTime - stateTime <= maxAge) {
            return state.data as CreatorIQState;
          }
        }
      }
    }
    
    console.log("No matching state found for query terms");
    return null;
    
  } catch (error) {
    console.error("Error in findStateByQuery:", error);
    return null;
  }
}
