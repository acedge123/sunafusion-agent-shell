
import { supabase } from "@/integrations/supabase/client";

// Save state data to database for persistent access across sessions
export const saveStateToDatabase = async (
  userId: string,
  key: string,
  data: any,
  expiryMinutes: number = 60
): Promise<boolean> => {
  try {
    // Calculate expiry time
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    
    // Use type assertion to bypass type checking for this specific query
    // since we know the table exists but TypeScript doesn't
    const { error } = await (supabase as any)
      .from('creator_iq_state')
      .upsert({
        key,
        user_id: userId,
        data,
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'key'
      });

    if (error) {
      console.error("Error saving state to database:", error);
      return false;
    }
    console.log(`State saved to database with key: ${key}`);
    return true;
  } catch (error) {
    console.error("Error in saveStateToDatabase:", error);
    return false;
  }
};

// Get state data from database
export const getStateFromDatabase = async (
  userId: string,
  key: string
): Promise<any> => {
  try {
    // Get state data using type assertion to bypass TypeScript limitations
    const { data, error } = await (supabase as any)
      .from('creator_iq_state')
      .select('data')
      .eq('user_id', userId)
      .eq('key', key)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error("Error retrieving state from database:", error);
      return null;
    }

    if (!data) {
      console.log(`No valid state found for key: ${key}`);
      return null;
    }

    return data.data;
  } catch (error) {
    console.error("Error in getStateFromDatabase:", error);
    return null;
  }
};

// Find state by query content - useful for follow-up questions
export const findStateByQuery = async (
  userId: string,
  queryParts: string[]
): Promise<any> => {
  try {
    // Get all state data for the user
    const { data, error } = await (supabase as any)
      .from('creator_iq_state')
      .select('key, data')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error retrieving state from database:", error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('No state data found for user');
      return null;
    }

    // Search for state that matches the query
    // This is a simple implementation - in practice, you might want to use
    // more sophisticated matching logic
    for (const state of data) {
      const stateString = JSON.stringify(state.data).toLowerCase();
      // Check if all query parts are in the state
      const isMatch = queryParts.every(part => 
        stateString.includes(part.toLowerCase())
      );
      
      if (isMatch) {
        console.log(`Found matching state: ${state.key}`);
        return state.data;
      }
    }

    console.log('No matching state found');
    return null;
  } catch (error) {
    console.error("Error in findStateByQuery:", error);
    return null;
  }
};
