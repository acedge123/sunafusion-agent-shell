
// Helper function to build context from results
export function buildContextFromResults(results, previousState = null) {
  try {
    let context = "--- CONTEXT START ---\n\n";
    
    // Add previous state context if available
    if (previousState) {
      context += "PREVIOUS CONTEXT:\n";
      
      // Add campaign information
      if (previousState.campaigns && previousState.campaigns.length > 0) {
        context += "Previously identified campaigns:\n";
        previousState.campaigns.forEach((campaign, idx) => {
          context += `[${idx + 1}] ${campaign.name} (ID: ${campaign.id})`;
          if (campaign.publishersCount !== undefined) {
            context += ` with ${campaign.publishersCount} publishers`;
          }
          context += "\n";
        });
        context += "\n";
      }
      
      // Add publisher information if available
      if (previousState.publishers && previousState.publishers.length > 0) {
        context += "Previously identified publishers:\n";
        context += `Total: ${previousState.publishers.length} publishers\n\n`;
      }
      
      // Add list information if available
      if (previousState.lists && previousState.lists.length > 0) {
        context += "Previously identified lists:\n";
        context += `Total: ${previousState.lists.length} lists\n\n`;
      }
    }
    
    // Process web search results
    const webResults = results.find(r => r.source === "web_search");
    if (webResults && webResults.results && webResults.results.length > 0) {
      context += "WEB SEARCH RESULTS:\n";
      webResults.results.forEach((result, index) => {
        context += `[${index + 1}] Title: ${result.title}\n`;
        context += `URL: ${result.url}\n`;
        context += `Content: ${result.content}\n\n`;
      });
    }
    
    // Process Google Drive results
    const driveResults = results.find(r => r.source === "google_drive");
    if (driveResults && driveResults.results && driveResults.results.length > 0) {
      context += "GOOGLE DRIVE RESULTS:\n";
      driveResults.results.forEach((file, index) => {
        context += `[${index + 1}] ${file.name} (${file.mimeType})\n`;
      });
      context += "\n";
    }
    
    // Process file analysis results
    const analysisResults = results.find(r => r.source === "file_analysis");
    if (analysisResults && analysisResults.results && analysisResults.results.length > 0) {
      context += "FILE ANALYSIS RESULTS:\n";
      analysisResults.results.forEach((analysis, index) => {
        context += `[${index + 1}] File: ${analysis.file_name}\n`;
        if (typeof analysis.analysis === 'string') {
          context += `Content: ${analysis.analysis.substring(0, 500)}...\n\n`;
        } else if (analysis.analysis && analysis.analysis.content) {
          context += `Content: ${analysis.analysis.content.substring(0, 500)}...\n\n`;
        }
      });
    }
    
    // Process Slack results
    const slackResults = results.find(r => r.source === "slack");
    if (slackResults && slackResults.results && slackResults.results.length > 0) {
      context += "SLACK MESSAGES:\n";
      slackResults.results.forEach((message, index) => {
        context += `[${index + 1}] From: ${message.user || 'Unknown'}\n`;
        context += `Message: ${message.text}\n`;
        if (message.timestamp) context += `Time: ${new Date(message.timestamp * 1000).toISOString()}\n`;
        context += "\n";
      });
    }
    
    // Process Creator IQ results
    const creatorIQResults = results.find(r => r.source === "creator_iq");
    if (creatorIQResults && creatorIQResults.results && creatorIQResults.results.length > 0) {
      context += "CREATOR IQ DATA:\n";
      
      creatorIQResults.results.forEach((result, index) => {
        context += `[${index + 1}] Endpoint: ${result.name || result.endpoint}\n`;
        
        // Handle campaign data
        if (result.data && result.data.CampaignCollection) {
          context += `Found ${result.data.CampaignCollection.length} campaigns`;
          if (result.data.filtered_by) {
            context += ` matching "${result.data.filtered_by}"`;
          }
          context += `\n`;
          
          // Add campaign details
          result.data.CampaignCollection.forEach((campaign, cIdx) => {
            if (campaign.Campaign) {
              const c = campaign.Campaign;
              context += `  Campaign ${cIdx + 1}: ${c.CampaignName || 'Unnamed'} (ID: ${c.CampaignId})\n`;
              if (c.CampaignStatus) context += `    Status: ${c.CampaignStatus}\n`;
              if (c.StartDate) context += `    Start: ${c.StartDate}\n`;
              if (c.EndDate) context += `    End: ${c.EndDate}\n`;
              if (c.PublishersCount !== undefined) context += `    Publishers: ${c.PublishersCount}\n`;
            }
          });
          context += "\n";
        }
        
        // Handle publisher data - enhanced for campaign context
        if (result.data && result.data.PublisherCollection) {
          // If we have campaign context for these publishers, include it
          if (result.data.campaignName) {
            context += `Found ${result.data.PublisherCollection.length} publishers for campaign "${result.data.campaignName}"\n`;
            context += `Total publishers in campaign: ${result.data.publishersCount || result.data.PublisherCollection.length}\n`;
          } else {
            context += `Found ${result.data.PublisherCollection.length} publishers\n`;
          }
          
          // Add publisher details
          result.data.PublisherCollection.slice(0, 5).forEach((publisher, pIdx) => {
            if (publisher.Publisher) {
              const p = publisher.Publisher;
              context += `  Publisher ${pIdx + 1}: ${p.PublisherName || 'Unnamed'} (ID: ${p.Id})\n`;
              if (p.Status) context += `    Status: ${p.Status}\n`;
              if (p.TotalSubscribers) context += `    Subscribers: ${p.TotalSubscribers}\n`;
            }
          });
          if (result.data.PublisherCollection.length > 5) {
            context += `  ... and ${result.data.PublisherCollection.length - 5} more publishers\n`;
          }
          context += "\n";
        }
        
        // Handle lists data
        if (result.data && result.data.ListsCollection) {
          context += `Found ${result.data.ListsCollection.length} lists\n`;
          
          // Add list details
          result.data.ListsCollection.slice(0, 5).forEach((list, lIdx) => {
            if (list.List) {
              const l = list.List;
              context += `  List ${lIdx + 1}: ${l.Name || 'Unnamed'} (ID: ${l.Id})\n`;
              if (l.Description) context += `    Description: ${l.Description}\n`;
              if (l.Publishers) context += `    Publishers: ${l.Publishers.length}\n`;
            }
          });
          if (result.data.ListsCollection.length > 5) {
            context += `  ... and ${result.data.ListsCollection.length - 5} more lists\n`;
          }
          context += "\n";
        }
      });
    }
    
    context += "--- CONTEXT END ---";
    
    return context;
  } catch (error) {
    console.error("Error building context from results:", error);
    return "Error building context from search results.";
  }
}
