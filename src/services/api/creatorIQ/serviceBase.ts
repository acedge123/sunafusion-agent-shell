
import { supabase } from "@/integrations/supabase/client";
import { buildCreatorIQParams } from "../paramBuilder";
import { prepareCreatorIQState } from "../messageHelpers";

// Function to process Creator IQ responses
export function processCreatorIQResponse(data: any) {
  if (!data) return null;
  
  // Find Creator IQ source in the response
  const creatorIQSource = data.sources?.find((source: any) => source.source === "creator_iq");
  if (!creatorIQSource) return null;
  
  return creatorIQSource;
}

// Base function to make API requests to CreatorIQ
export async function makeCreatorIQRequest(message: string, customParams: Record<string, any> = {}) {
  try {
    // Build base parameters for the request
    let params = buildCreatorIQParams(message);
    
    // Override with custom parameters
    params = {
      ...params,
      ...customParams
    };
    
    console.log(`Making CreatorIQ request with params:`, params);
    
    // Call the endpoint
    const { data, error } = await supabase.functions.invoke("unified-agent", {
      body: { 
        query: message,
        tools: ["creator_iq"],
        params
      }
    });
    
    if (error) {
      console.error("Error in CreatorIQ request:", error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error("Error in makeCreatorIQRequest:", error);
    throw error;
  }
}
