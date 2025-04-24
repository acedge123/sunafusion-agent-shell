
import { Message } from "@/components/chat/ChatContainer";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";

// Import useGoogleDrive hook from the correct location
// Note: Since this is a non-component file, we can't use hooks directly
// We'll need to modify how this function works

export async function sendMessage(content: string): Promise<Message> {
  try {
    // Get the current session for the auth token
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error("Error getting session:", sessionError);
      throw new Error("Failed to get authentication session");
    }
    
    const authToken = sessionData?.session?.access_token
    const providerToken = sessionData?.session?.provider_token
    
    console.log("Provider token available from session:", !!providerToken);
    
    // If no provider token in session, try to get from database
    let storedToken = null;
    if (!providerToken && sessionData?.session?.user) {
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

    // Store provider token if available
    if (providerToken && sessionData?.session?.user?.id) {
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

    // Use the unified-agent edge function to process the message
    const response = await supabase.functions.invoke('unified-agent', {
      body: {
        query: content,
        conversation_history: [],
        include_web: true,
        include_drive: true,
        provider_token: providerToken || storedToken, // Try both tokens
        debug_token_info: {
          hasProviderToken: !!providerToken,
          hasStoredToken: !!storedToken,
          userHasSession: !!sessionData?.session,
          tokenSource: providerToken ? 'provider_token' : (storedToken ? 'database' : 'none')
        }
      },
      headers: authToken ? {
        Authorization: `Bearer ${authToken}`
      } : undefined
    });

    if (response.error) {
      console.error("Edge function error:", response.error);
      throw new Error(response.error.message || "Failed to get AI response");
    }

    return {
      id: uuidv4(),
      content: response.data.answer,
      role: "assistant",
      timestamp: new Date()
    };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
}
