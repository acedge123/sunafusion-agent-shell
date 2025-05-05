
import { supabase } from "@/integrations/supabase/client";

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
