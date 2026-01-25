import type { AgentResult } from "../../_shared/types.ts";

// Helper function to build context from results
export function buildContextFromResults(results: AgentResult[], previousState: Record<string, unknown> | null = null): string {
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
      const campaigns = previousState.campaigns as Array<{ name: string; id: string; publishersCount?: number }> | undefined;
      if (campaigns && campaigns.length > 0) {
        context += "Previously identified campaigns:\n";
        campaigns.forEach((campaign, idx) => {
          context += `[${idx + 1}] ${campaign.name} (ID: ${campaign.id})`;
          if (campaign.publishersCount !== undefined) {
            context += ` with ${campaign.publishersCount} publishers`;
          }
          context += "\n";
        });
        context += "\n";
      }
      
      // Add publisher information if available
      const publishers = previousState.publishers as Array<{ name?: string; id: string }> | undefined;
      if (publishers && publishers.length > 0) {
        context += "Previously identified publishers:\n";
        context += `Total: ${publishers.length} publishers\n\n`;
        
        // Add some sample publisher information
        const samplePublishers = publishers.slice(0, 5);
        samplePublishers.forEach((publisher, idx) => {
          context += `  Publisher ${idx + 1}: ${publisher.name || 'Unnamed'} (ID: ${publisher.id})\n`;
        });
        
        if (publishers.length > 5) {
          context += `  ... and ${publishers.length - 5} more publishers\n`;
        }
        context += "\n";
      }
      
      // Add list information if available with more details
      const lists = previousState.lists as Array<{ name: string; id: string; publisherCount?: number }> | undefined;
      if (lists && lists.length > 0) {
        context += "Previously identified lists:\n";
        lists.forEach((list, idx) => {
          context += `[${idx + 1}] List: "${list.name}" (ID: ${list.id})`;
          if (list.publisherCount !== undefined) {
            context += ` with ${list.publisherCount} publishers`;
          }
          context += "\n";
        });
        context += "\n";
      }
      
      // Add operation results if available
      const operationResults = previousState.operationResults as Array<{ type: string; details: string; successful: boolean }> | undefined;
      if (operationResults && operationResults.length > 0) {
        context += "Previously completed operations:\n";
        operationResults.forEach((operation, idx) => {
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
        const res = result as Record<string, unknown>;
        context += `[${index + 1}] Title: ${res.title}\n`;
        context += `URL: ${res.url}\n`;
        context += `Content: ${res.content}\n\n`;
      });
    }
    
    // Process Google Drive results
    const driveResults = results.find(r => r.source === "google_drive");
    if (driveResults && driveResults.results && driveResults.results.length > 0) {
      context += "GOOGLE DRIVE RESULTS:\n";
      driveResults.results.forEach((file, index) => {
        const f = file as Record<string, unknown>;
        context += `[${index + 1}] ${f.name} (${f.mimeType})\n`;
      });
      context += "\n";
    }
    
    // Process file analysis results
    const analysisResults = results.find(r => r.source === "file_analysis");
    if (analysisResults && analysisResults.results && analysisResults.results.length > 0) {
      context += "FILE ANALYSIS RESULTS:\n";
      analysisResults.results.forEach((analysis, index) => {
        const a = analysis as Record<string, unknown>;
        context += `[${index + 1}] File: ${a.file_name}\n`;
        if (typeof a.analysis === 'string') {
          context += `Content: ${a.analysis.substring(0, 500)}...\n\n`;
        } else if (a.analysis && typeof a.analysis === 'object') {
          const analysisObj = a.analysis as Record<string, unknown>;
          if (analysisObj.content && typeof analysisObj.content === 'string') {
            context += `Content: ${analysisObj.content.substring(0, 500)}...\n\n`;
          }
        }
      });
    }
    
    // Process Slack results
    const slackResults = results.find(r => r.source === "slack");
    if (slackResults && slackResults.results && slackResults.results.length > 0) {
      context += "SLACK MESSAGES:\n";
      slackResults.results.forEach((message, index) => {
        const msg = message as Record<string, unknown>;
        context += `[${index + 1}] From: ${msg.user || 'Unknown'}\n`;
        context += `Message: ${msg.text}\n`;
        if (msg.timestamp) context += `Time: ${new Date((msg.timestamp as number) * 1000).toISOString()}\n`;
        context += "\n";
      });
    }
    
    // Process memory results (durable facts/preferences)
    const memoryResults = results.find(r => r.source === "memory");
    if (memoryResults && memoryResults.results && memoryResults.results.length > 0) {
      context += "USER MEMORIES (Durable Facts & Preferences):\n";
      memoryResults.results.forEach((memory, index) => {
        const mem = memory as Record<string, unknown>;
        context += `[${index + 1}] ${mem.fact}`;
        if (mem.tags && Array.isArray(mem.tags) && mem.tags.length > 0) {
          context += ` [Tags: ${mem.tags.join(', ')}]`;
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
      const reposByCategory: Record<string, unknown[]> = {};
      
      repos.forEach((repo) => {
        const r = repo as Record<string, unknown>;
        const integrations = r.integrations as string[] | undefined;
        const stack = r.stack as string[] | undefined;
        const primaryIntegration = (integrations && integrations[0]) || 
                                    (stack && stack[0]) || 
                                    'general';
        if (!reposByCategory[primaryIntegration]) {
          reposByCategory[primaryIntegration] = [];
        }
        reposByCategory[primaryIntegration].push(repo);
      });
      
      // Display repos grouped by category (includes domain_summary for meta/exploratory questions)
      for (const [category, categoryRepos] of Object.entries(reposByCategory)) {
        context += `[${category.toUpperCase()}]\n`;
        categoryRepos.forEach((repo) => {
          const r = repo as Record<string, unknown>;
          context += `  - ${r.repo_name}`;
          if (r.relevance && (r.relevance as number) > 0) {
            context += ` (relevance: ${((r.relevance as number) * 100).toFixed(0)}%)`;
          }
          const supabaseFunctions = r.supabase_functions as string[] | undefined;
          if (supabaseFunctions && supabaseFunctions.length > 0) {
            context += ` | Edge functions: ${supabaseFunctions.join(', ')}`;
          }
          const tables = r.tables as string[] | undefined;
          if (tables && tables.length > 0) {
            context += ` | Tables: ${tables.slice(0, 3).join(', ')}${tables.length > 3 ? '...' : ''}`;
          }
          // Include domain summary if available (for meta/exploratory questions)
          if (r.domain_summary && typeof r.domain_summary === 'string') {
            context += `\n    Summary: ${r.domain_summary.split('\n').slice(0, 2).join(' ').substring(0, 150)}...`;
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
        const res = result as Record<string, unknown>;
        context += `[${index + 1}] Endpoint: ${res.name || res.endpoint}\n`;
        
        const data = res.data as Record<string, unknown> | undefined;
        
        // Handle campaign data
        if (data && data.CampaignCollection) {
          const campaigns = data.CampaignCollection as Array<Record<string, unknown>>;
          context += `Found ${campaigns.length} campaigns`;
          if (data.filtered_by) {
            context += ` matching "${data.filtered_by}"`;
          }
          context += `\n`;
          
          // Add campaign details
          campaigns.forEach((campaign, cIdx) => {
            if (campaign.Campaign) {
              const c = campaign.Campaign as Record<string, unknown>;
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
        if (data && data.PublisherCollection) {
          const publishers = data.PublisherCollection as Array<Record<string, unknown>>;
          // If we have campaign context for these publishers, include it
          if (data.campaignName) {
            context += `Found ${publishers.length} publishers for campaign "${data.campaignName}"\n`;
            context += `Total publishers in campaign: ${data.publishersCount || publishers.length}\n`;
          } else {
            context += `Found ${publishers.length} publishers\n`;
          }
          
          // Add publisher details
          publishers.slice(0, 5).forEach((publisher, pIdx) => {
            if (publisher.Publisher) {
              const p = publisher.Publisher as Record<string, unknown>;
              context += `  Publisher ${pIdx + 1}: ${p.PublisherName || 'Unnamed'} (ID: ${p.Id})\n`;
              if (p.Status) context += `    Status: ${p.Status}\n`;
              if (p.TotalSubscribers) context += `    Subscribers: ${p.TotalSubscribers}\n`;
            }
          });
          if (publishers.length > 5) {
            context += `  ... and ${publishers.length - 5} more publishers\n`;
          }
          context += "\n";
        }
        
        // Handle lists data with pagination information and more detail
        if (data && data.ListsCollection) {
          const lists = data.ListsCollection as Array<Record<string, unknown>>;
          const totalLists = data.total || lists.length;
          const currentPage = data.page || 1;
          const totalPages = data.total_pages || 1;
          
          context += `Found ${totalLists} lists (page ${currentPage} of ${totalPages})\n`;
          
          if (lists.length === 0) {
            context += "No lists found on this page. You can create a new list using the create list operation.\n";
          } else {
            // Add list details with publisher information
            lists.forEach((list, lIdx) => {
              if (list.List) {
                const l = list.List as Record<string, unknown>;
                context += `  List ${lIdx + 1}: "${l.Name || 'Unnamed'}" (ID: ${l.Id})\n`;
                if (l.Description) context += `    Description: ${l.Description}\n`;
                
                // Enhanced publisher information
                if (l.Publishers) {
                  const pubs = l.Publishers as Array<Record<string, unknown>>;
                  context += `    Publishers: ${pubs.length}\n`;
                  
                  // Add publisher IDs if available
                  if (pubs.length > 0) {
                    context += `    Publisher IDs: ${pubs.slice(0, 10).map(p => p.Id || p.id).join(", ")}`;
                    if (pubs.length > 10) {
                      context += ` and ${pubs.length - 10} more`;
                    }
                    context += "\n";
                  }
                }
              }
            });
            
            // Add pagination guidance
            if ((totalPages as number) > 1) {
              context += `  This is page ${currentPage} of ${totalPages}. There are ${totalLists} total lists.\n`;
              context += `  You can view other pages by specifying page number in your query.\n`;
            }
          }
          context += "\n";
        }
        
        // Add write operation results
        if (data && data.operation) {
          const op = data.operation as Record<string, unknown>;
          context += `WRITE OPERATION RESULT: ${op.type}\n`;
          context += `  Status: ${op.successful ? 'SUCCESS' : 'FAILED'}\n`;
          context += `  Details: ${op.details || 'No details provided'}\n`;
          if (data.List) {
            const list = data.List as Record<string, unknown>;
            context += `  Created/Modified list ID: ${list.Id}\n`;
            context += `  Created/Modified list name: ${list.Name}\n`;
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
