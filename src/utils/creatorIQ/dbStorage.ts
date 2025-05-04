
import { supabase } from "@/integrations/supabase/client";
import { CreatorIQState } from "./types";

/**
 * Saves Creator IQ state to the database
 * @param userId The user ID
 * @param stateKey The unique state key
 * @param data The state data to save
 * @param context Optional context about what this state contains
 * @returns Success status
 */
export async function saveStateToDatabase(
  userId: string,
  stateKey: string, 
  data: {
    campaigns: any[];
    publishers: any[];
    lists: any[];
  },
  context?: string
): Promise<boolean> {
  try {
    if (!userId || !stateKey) {
      console.error("Cannot save state: missing userId or stateKey");
      return false;
    }
    
    console.log(`Saving state ${stateKey} to database for user ${userId}`);

    const { data: insertData, error } = await supabase
      .from('creator_iq_state')
      .upsert({
        key: stateKey,
        user_id: userId,
        data: data as any,
        query_context: context || null,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h expiry
      }, {
        onConflict: 'key'
      });

    if (error) {
      console.error("Error saving state to database:", error);
      return false;
    }
    
    console.log(`Successfully saved state ${stateKey} to database`);
    return true;
  } catch (error) {
    console.error("Error in saveStateToDatabase:", error);
    return false;
  }
}

/**
 * Retrieves Creator IQ state from the database
 * @param userId The user ID
 * @param stateKey The unique state key
 * @returns The state data or null if not found
 */
export async function getStateFromDatabase(
  userId: string,
  stateKey: string
): Promise<CreatorIQState | null> {
  try {
    if (!userId || !stateKey) {
      console.error("Cannot retrieve state: missing userId or stateKey");
      return null;
    }
    
    console.log(`Retrieving state ${stateKey} from database for user ${userId}`);

    const { data, error } = await supabase
      .from('creator_iq_state')
      .select('data, expires_at, updated_at')
      .eq('key', stateKey)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error retrieving state from database:", error);
      return null;
    }
    
    if (!data) {
      console.log(`No state found for key ${stateKey}`);
      return null;
    }
    
    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      console.log(`State ${stateKey} has expired`);
      return null;
    }
    
    console.log(`Successfully retrieved state ${stateKey} from database, last updated at ${data.updated_at}`);
    return data.data as CreatorIQState;
  } catch (error) {
    console.error("Error in getStateFromDatabase:", error);
    return null;
  }
}

/**
 * Get a specific state from history by its key
 * @param userId The user ID
 * @param stateKey The unique state key
 * @returns The state data with metadata
 */
export async function getStateByKey(
  userId: string,
  stateKey: string
): Promise<{ data: CreatorIQState, metadata: any } | null> {
  try {
    const { data, error } = await supabase
      .from('creator_iq_state')
      .select('data, created_at, updated_at, query_context')
      .eq('key', stateKey)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error retrieving state by key:", error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    return {
      data: data.data as CreatorIQState,
      metadata: {
        created_at: data.created_at,
        updated_at: data.updated_at,
        query_context: data.query_context
      }
    };
  } catch (error) {
    console.error("Error in getStateByKey:", error);
    return null;
  }
}

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
