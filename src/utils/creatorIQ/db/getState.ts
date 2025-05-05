
import { supabase } from "@/integrations/supabase/client";
import { CreatorIQState } from "../types";

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
