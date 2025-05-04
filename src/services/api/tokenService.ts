
import { supabase } from "@/integrations/supabase/client";

// Get provider token from database if not in session
export async function getProviderToken(sessionData: any): Promise<string | null> {
  let storedToken = null;
  
  if (!sessionData?.session?.provider_token && sessionData?.session?.user) {
    try {
      const { data: tokenData, error: tokenError } = await supabase
        .from('google_drive_access')
        .select('access_token')
        .eq('user_id', sessionData.session.user.id)
        .maybeSingle();
        
      if (tokenError) {
        console.error("Error querying token from database:", tokenError);
      } else {
        storedToken = tokenData?.access_token;
        console.log("Retrieved stored token from database:", !!storedToken);
      }
    } catch (dbError) {
      console.error("Error retrieving token from database:", dbError);
    }
  }
  
  return storedToken;
}

// Store provider token in database
export async function storeProviderToken(sessionData: any, providerToken: string): Promise<void> {
  if (!sessionData?.session?.user?.id) {
    return;
  }
  
  try {
    const { error: upsertError } = await supabase
      .from('google_drive_access')
      .upsert({
        user_id: sessionData.session.user.id,
        access_token: providerToken,
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
        
    if (upsertError) {
      console.error("Error storing Google Drive token:", upsertError);
    } else {
      console.log("Successfully stored Google Drive token from session");
    }
  } catch (storeError) {
    console.error("Error in token storage:", storeError);
  }
}
