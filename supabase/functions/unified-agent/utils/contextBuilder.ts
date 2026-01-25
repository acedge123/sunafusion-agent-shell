// Helper function to build context from results
export function buildContextFromResults(results, previousState = null) {
  try {
    let context = "--- CONTEXT START ---\n\n";
    
    // Add Creator IQ capabilities section at the very beginning
    context += "CREATOR IQ CAPABILITIES:\n";
    context += "This tool can perform both read and write operations in Creator IQ:\n";
    context += "- READ: Search for campaigns, publishers, and lists; get detailed information\n";
    context += "- WRITE: Create new lists, update publisher status, add publishers to lists, send messages\n";
    context += "When no search results are found, you can still create new resources (like lists) as needed.\n\n";
    context += "Example commands:\n";
    context += "- \"Create a new list called 'New Campaign Influencers'\" - Creates a new empty list\n";
    context += "- \"Update publisher status to active\" - Changes publisher status\n";
    context += "- \"Send a message to publisher with ID 12345\" - Sends a direct message\n\n";
    
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
        
        // Add some sample publisher information
        const samplePublishers = previousState.publishers.slice(0, 5);
        samplePublishers.forEach((publisher, idx) => {
          context += `  Publisher ${idx + 1}: ${publisher.name || 'Unnamed'} (ID: ${publisher.id})\n`;
        });
        
        if (previousState.publishers.length > 5) {
          context += `  ... and ${previousState.publishers.length - 5} more publishers\n`;
        }
        context += "\n";
      }
      
      // Add list information if available with more details
      if (previousState.lists && previousState.lists.length > 0) {
        context += "Previously identified lists:\n";
        previousState.lists.forEach((list, idx) => {
          context += `[${idx + 1}] List: "${list.name}" (ID: ${list.id})`;
          if (list.publisherCount !== undefined) {
            context += ` with ${list.publisherCount} publishers`;
          }
          context += "\n";
        });
        context += "\n";
      }
      
      // Add operation results if available
      if (previousState.operationResults && previousState.operationResults.length > 0) {
        context += "Previously completed operations:\n";
        previousState.operationResults.forEach((operation, idx) => {
          context += `[${idx + 1}] ${operation.type}: ${operation.details} (${operation.successful ? 'Success' : 'Failed'})\n`;
        });
        context += "\n";
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
    
    // Process memory results (durable facts/preferences)
    const memoryResults = results.find(r => r.source === "memory");
    if (memoryResults && memoryResults.results && memoryResults.results.length > 0) {
      context += "USER MEMORIES (Durable Facts & Preferences):\n";
      memoryResults.results.forEach((memory, index) => {
        context += `[${index + 1}] ${memory.fact}`;
        if (memory.tags && memory.tags.length > 0) {
          context += ` [Tags: ${memory.tags.join(', ')}]`;
        }
        context += "\n";
      });
      context += "\n";
    }
    
    // Process repo-map results - ALWAYS show repository awareness
    const repoMapResults = results.find(r => r.source === "repo_map");
    if (repoMapResults && repoMapResults.results && repoMapResults.results.length > 0) {
      const repos = repoMapResults.results;
      context += `AVAILABLE REPOSITORIES (${repos.length} total):\n`;
      context += "You have full awareness of the codebase. Here are the repositories:\n\n";
      
      // Group repos by primary integration/stack for better organization
      const reposByCategory: Record<string, any[]> = {};
      
      repos.forEach((repo: any) => {
        const primaryIntegration = (repo.integrations && repo.integrations[0]) || 
                                    (repo.stack && repo.stack[0]) || 
                                    'general';
        if (!reposByCategory[primaryIntegration]) {
          reposByCategory[primaryIntegration] = [];
        }
        reposByCategory[primaryIntegration].push(repo);
      });
      
      // Display repos grouped by category (includes domain_summary for meta/exploratory questions)
      for (const [category, categoryRepos] of Object.entries(reposByCategory)) {
        context += `[${category.toUpperCase()}]\n`;
        categoryRepos.forEach((repo: any) => {
          context += `  - ${repo.repo_name}`;
          if (repo.relevance && repo.relevance > 0) {
            context += ` (relevance: ${(repo.relevance * 100).toFixed(0)}%)`;
          }
          if (repo.supabase_functions && repo.supabase_functions.length > 0) {
            context += ` | Edge functions: ${repo.supabase_functions.join(', ')}`;
          }
          if (repo.tables && repo.tables.length > 0) {
            context += ` | Tables: ${repo.tables.slice(0, 3).join(', ')}${repo.tables.length > 3 ? '...' : ''}`;
          }
          // Include domain summary if available (for meta/exploratory questions)
          if (repo.domain_summary) {
            context += `\n    Summary: ${repo.domain_summary.split('\n').slice(0, 2).join(' ').substring(0, 150)}...`;
          }
          context += "\n";
        });
        context += "\n";
      }
      
      context += "Use this repository information to answer questions about the codebase accurately.\n\n";
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
        
        // Handle lists data with pagination information and more detail
        if (result.data && result.data.ListsCollection) {
          const totalLists = result.data.total || result.data.ListsCollection.length;
          const currentPage = result.data.page || 1;
          const totalPages = result.data.total_pages || 1;
          
          context += `Found ${totalLists} lists (page ${currentPage} of ${totalPages})\n`;
          
          if (result.data.ListsCollection.length === 0) {
            context += "No lists found on this page. You can create a new list using the create list operation.\n";
          } else {
            // Add list details with publisher information
            result.data.ListsCollection.forEach((list, lIdx) => {
              if (list.List) {
                const l = list.List;
                context += `  List ${lIdx + 1}: "${l.Name || 'Unnamed'}" (ID: ${l.Id})\n`;
                if (l.Description) context += `    Description: ${l.Description}\n`;
                
                // Enhanced publisher information
                if (l.Publishers) {
                  context += `    Publishers: ${l.Publishers.length}\n`;
                  
                  // Add publisher IDs if available
                  if (l.Publishers.length > 0) {
                    context += `    Publisher IDs: ${l.Publishers.slice(0, 10).map(p => p.Id || p.id).join(", ")}`;
                    if (l.Publishers.length > 10) {
                      context += ` and ${l.Publishers.length - 10} more`;
                    }
                    context += "\n";
                  }
                }
              }
            });
            
            // Add pagination guidance
            if (totalPages > 1) {
              context += `  This is page ${currentPage} of ${totalPages}. There are ${totalLists} total lists.\n`;
              context += `  You can view other pages by specifying page number in your query.\n`;
            }
          }
          context += "\n";
        }
        
        // Add write operation results
        if (result.data && result.data.operation) {
          const op = result.data.operation;
          context += `WRITE OPERATION RESULT: ${op.type}\n`;
          context += `  Status: ${op.successful ? 'SUCCESS' : 'FAILED'}\n`;
          context += `  Details: ${op.details || 'No details provided'}\n`;
          if (result.data.List) {
            context += `  Created/Modified list ID: ${result.data.List.Id}\n`;
            context += `  Created/Modified list name: ${result.data.List.Name}\n`;
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
