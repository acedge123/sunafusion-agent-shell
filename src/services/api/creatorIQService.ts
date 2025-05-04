
import { saveStateToDatabase, extractCampaignData } from "@/utils/creatorIQ";

// Process Creator IQ response and store data for future reference
export async function processCreatorIQResponse(stateKey: string, userId: string, sources: any[]) {
  const creatorIQSource = sources.find(s => s.source === "creator_iq");
  if (!creatorIQSource?.results) {
    return;
  }
  
  console.log("Storing Creator IQ results for future reference");
  
  // Process and extract structured data from the response
  const processedData = {
    campaigns: [],
    publishers: [],
    lists: []
  };
  
  // Process each endpoint result
  for (const result of creatorIQSource.results) {
    if (result.endpoint === "/campaigns" && result.data) {
      processedData.campaigns = extractCampaignData(result.data);
      console.log(`Extracted ${processedData.campaigns.length} campaigns`);
    }
    
    // Add processing for other endpoints as needed
    // ...
  }
  
  // Store the extracted data if we have any
  if (processedData.campaigns.length > 0 || 
      processedData.publishers.length > 0 || 
      processedData.lists.length > 0) {
    await saveStateToDatabase(userId, stateKey, processedData);
  }
}
