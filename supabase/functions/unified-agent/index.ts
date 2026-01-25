import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "./utils/corsUtils.ts";
import { searchGoogleDrive, analyzeGoogleDriveFile } from "./sources/googleDrive.ts";
import { searchWeb } from "./sources/webSearch.ts";
import { determineCreatorIQEndpoints, buildCreatorIQPayload, queryCreatorIQEndpoint } from "./sources/creatorIQ.ts";
import { parseStructuredResponse, getAgentResponse, runAgentTask } from "./agent/taskRunner.ts";
import { synthesizeWithAI } from "./agent/aiSynthesis.ts";
import { buildContextFromResults } from "./utils/contextBuilder.ts";
import { searchSlack } from "./slack-tool.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';
const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY') ?? '';
const CREATOR_IQ_API_KEY = Deno.env.get('CREATOR_IQ_API_KEY') ?? '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify OpenAI API key is configured
    if (!OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY is not configured!');
      throw new Error('OPENAI_API_KEY is not configured in the environment');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const requestData = await req.json();
    const { 
      query, 
      conversation_history = [], 
      include_web = true, 
      include_drive = true,
      include_slack = true, 
      include_creator_iq = true,
      provider_token = null,
      debug_token_info = {},
      creator_iq_params = {},
      state_key = null,
      previous_state = null,
      task_mode = false, 
      tools = ["web_search", "file_search", "file_analysis", "slack_search", "creator_iq"],
      allow_iterations = true,
      max_iterations = 5, 
      reasoning_level = "medium"
    } = requestData;
    
    if (!query) {
      throw new Error('Query is required');
    }

    // Initialize results array BEFORE any usage
    const results: Array<{ source: string; results?: unknown[]; error?: string; details?: string; state?: unknown }> = [];
    // Extract the Authorization header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    let userToken = null;

    // Try to get user from auth header
    if (authHeader) {
      try {
        userToken = authHeader.replace('Bearer ', '');
        const { data: userData, error: userError } = await supabase.auth.getUser(userToken);
        if (!userError && userData.user) {
          userId = userData.user.id;
          console.log(`Authenticated user: ${userId}`);
        } else {
          console.log('Invalid user token in auth header:', userError?.message);
        }
      } catch (authError) {
        console.error('Error processing auth header:', authError);
      }
    } else {
      console.log('No Authorization header provided');
    }

    // Load user memories (durable facts/preferences) if authenticated
    let userMemories: any[] = [];
    if (userId) {
      try {
        const { data: memories, error: memError } = await supabase
          .from('agent_memories')
          .select('fact, tags, confidence')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(10); // Load most recent 10 memories
        
        if (!memError && memories) {
          userMemories = memories;
          console.log(`Loaded ${memories.length} user memories`);
          
          // Add memories to results as context
          if (memories.length > 0) {
            results.push({
              source: "memory",
              results: memories.map(m => ({
                fact: m.fact,
                tags: m.tags,
                confidence: m.confidence
              }))
            });
          }
        }
      } catch (error) {
        console.error("Error loading memories:", error);
        // Don't fail the request if memory loading fails
      }
    }
    
    // Initialize results array to store information from different sources
    // (memories already added above)
    
    // Initialize state data to be saved later
    const stateData = {
      userId,
      stateKey: state_key,
      previousState: previous_state,
      newData: {
        campaigns: [],
        publishers: [],
        lists: []
      },
      queryContext: query
    };
    
    // 1. Search Google Drive if requested and tool is enabled
    if (include_drive && tools.includes("file_search")) {
      try {
        console.log(`Starting Google Drive search ${userId ? `for user: ${userId}` : '(no user ID)'}`);
        
        // Log token presence and debug info
        console.log(`Debug token info:`, debug_token_info);
        console.log(`Provider token from request: ${provider_token ? 'Present' : 'Not present'}`);
        console.log(`User token: ${userToken ? 'Present' : 'Not present'}`);
        
        const driveResults = await searchGoogleDrive(supabase, userId, query, provider_token, userToken);
        console.log(`Google Drive search returned ${driveResults.length} results`);
        
        if (driveResults.length === 0) {
          console.log("No drive results returned - this could indicate a permission issue");
        }
        
        results.push({
          source: "google_drive",
          results: driveResults
        });

        // If file analysis is enabled and we have drive results, analyze the first few relevant files
        if (tools.includes("file_analysis") && driveResults.length > 0) {
          const filesToAnalyze = driveResults.slice(0, 3); // Analyze up to 3 most relevant files
          const analysisResults = [];
          
          for (const file of filesToAnalyze) {
            try {
              // Use more detailed error handling for file analysis
              console.log(`Analyzing file: ${file.id} (${file.name})`);
              const analysis = await analyzeGoogleDriveFile(file.id, provider_token || userToken);
              if (typeof analysis === 'string' && analysis.includes('Error analyzing file')) {
                console.error(`Analysis error for file ${file.id}: ${analysis}`);
                analysisResults.push({
                  file_id: file.id,
                  file_name: file.name,
                  analysis: `Could not analyze file content: ${analysis}`
                });
              } else {
                console.log(`Successfully analyzed file ${file.id}`);
                analysisResults.push({
                  file_id: file.id,
                  file_name: file.name,
                  analysis
                });
              }
            } catch (error) {
              console.error(`Error analyzing file ${file.id}:`, error);
              analysisResults.push({
                file_id: file.id,
                file_name: file.name,
                analysis: `Error analyzing file: ${error.message || "Unknown error"}`
              });
            }
          }
          
          if (analysisResults.length > 0) {
            results.push({
              source: "file_analysis",
              results: analysisResults
            });
          }
        }
      } catch (error) {
        console.error("Google Drive search error:", error);
        results.push({
          source: "google_drive",
          error: error.message || "Failed to search Google Drive",
          details: typeof error === 'object' ? JSON.stringify(error) : 'No details available'
        });
      }
    }

    // 2. Search the web if requested and tool is enabled
    if (include_web && tools.includes("web_search")) {
      try {
        console.log("Starting web search");
        if (!TAVILY_API_KEY) {
          console.warn("TAVILY_API_KEY is not configured, web search will not work!");
        }
        const webResults = await searchWeb(query);
        console.log(`Web search returned ${webResults.length} results`);
        results.push({
          source: "web_search",
          results: webResults
        });
      } catch (error) {
        console.error("Web search error:", error);
        results.push({
          source: "web_search",
          error: error.message || "Failed to search the web"
        });
      }
    }

    // 3. Search Slack if requested and tool is enabled
    if (include_slack && tools.includes("slack_search")) {
      try {
        console.log(`Starting Slack search ${userId ? `for user: ${userId}` : '(no user ID)'}`);
        
        // Search Slack for messages related to the query
        const slackResults = await searchSlack(userId, query, supabase);
        console.log(`Slack search returned ${slackResults.length} results`);
        
        if (slackResults.length === 0) {
          console.log("No Slack results returned - this could indicate no matching messages or a permission issue");
        }
        
        results.push({
          source: "slack",
          results: slackResults
        });
        
      } catch (error) {
        console.error("Slack search error:", error);
        results.push({
          source: "slack",
          error: error.message || "Failed to search Slack",
          details: typeof error === 'object' ? JSON.stringify(error) : 'No details available'
        });
      }
    }

    // 4. Query Creator IQ if requested and tool is enabled
    if (include_creator_iq && tools.includes("creator_iq")) {
      try {
        console.log(`Starting Creator IQ search ${userId ? `for user: ${userId}` : '(no user ID)'}`);
        
        if (!CREATOR_IQ_API_KEY) {
          console.warn("CREATOR_IQ_API_KEY is not configured, Creator IQ search will not work!");
          throw new Error("Creator IQ API key is not configured");
        }
        
        // Log the Creator IQ params received from the client
        console.log("Creator IQ params:", creator_iq_params);
        console.log("Previous state:", previous_state ? "Available" : "Not available");
        
        // Determine endpoints to query based on the query and creator_iq_params
        let endpoints = [];
        
        // Check if we have a specific campaign ID from previous state
        if (creator_iq_params.campaign_id) {
          console.log(`Using campaign ID from previous state: ${creator_iq_params.campaign_id}`);
          
          // Add endpoint to get publisher count for specific campaign
          endpoints.push({
            route: `/campaigns/${creator_iq_params.campaign_id}/publishers`,
            method: "GET",
            name: "Get Campaign Publishers"
          });
        } 
        // If specific parameters indicate campaign search
        else if (creator_iq_params.search_campaigns) {
          console.log("Adding campaigns endpoint based on creator_iq_params");
          endpoints.push({
            route: "/campaigns",
            method: "GET",
            name: "List Campaigns"
          });
          
          // If we have a specific campaign search term from the frontend
          if (creator_iq_params.campaign_search_term) {
            console.log(`Using campaign search term from params: "${creator_iq_params.campaign_search_term}"`);
          }
        } else {
          // Default behavior - determine endpoints based on query text
          endpoints = determineCreatorIQEndpoints(query, previous_state);
        }
        
        const creatorIQResults = await Promise.all(
          endpoints.map(async (endpoint) => {
            try {
              const payload = buildCreatorIQPayload(endpoint, query, creator_iq_params, previous_state);
              
              // Log the endpoint and payload for debugging
              console.log(`Querying endpoint ${endpoint.route} with payload:`, payload);
              
              const result = await queryCreatorIQEndpoint(endpoint, payload);
              
              // Process results for state storage
              if (endpoint.route === "/campaigns" && result.data && result.data.CampaignCollection) {
                const campaigns = result.data.CampaignCollection
                  .filter((c: Record<string, unknown>) => c.Campaign && (c.Campaign as Record<string, unknown>).CampaignId && (c.Campaign as Record<string, unknown>).CampaignName)
                  .map((c: Record<string, unknown>) => {
                    const campaign = c.Campaign as Record<string, unknown>;
                    return {
                      id: campaign.CampaignId,
                      name: campaign.CampaignName,
                      status: campaign.CampaignStatus,
                      publishersCount: campaign.PublishersCount
                    };
                  });
                  
                stateData.newData.campaigns = campaigns;
                console.log(`Processed ${campaigns.length} campaigns for state storage`);
              }
              
              // Process publisher results
              if (endpoint.route.includes('/publishers') && result.data && result.data.PublisherCollection) {
                const publishers = result.data.PublisherCollection
                  .filter((p: Record<string, unknown>) => p.Publisher && (p.Publisher as Record<string, unknown>).Id)
                  .map((p: Record<string, unknown>) => {
                    const publisher = p.Publisher as Record<string, unknown>;
                    return {
                      id: publisher.Id,
                      name: publisher.PublisherName || 'Unnamed',
                      status: publisher.Status,
                      campaignId: undefined as string | undefined,
                      listId: undefined as string | undefined
                    };
                  });
                  
                stateData.newData.publishers = publishers;
                console.log(`Processed ${publishers.length} publishers for state storage`);
                
                // Add publisher count to the result so it's easily accessible
                result.data.publishersCount = publishers.length;
                
                // If this is for a specific campaign, add that information
                if (endpoint.route.includes('/campaigns/') && creator_iq_params.campaign_name) {
                  result.data.campaignName = creator_iq_params.campaign_name;
                  result.data.campaignId = creator_iq_params.campaign_id;
                  
                  // Add this info to the campaign in state if it exists
                  const campaign = stateData.newData.campaigns.find(c => c.id === creator_iq_params.campaign_id);
                  if (campaign) {
                    campaign.publishersCount = publishers.length;
                  }
                }
                // Add campaign ID if this is from a campaign endpoint
                else if (endpoint.route.includes('/campaigns/')) {
                  const campaignId = endpoint.route.match(/\/campaigns\/(\d+)/)?.[1];
                  if (campaignId) {
                    result.data.campaignId = campaignId;
                    // Add campaign context to publishers
                    publishers.forEach(p => {
                      p.campaignId = campaignId;
                    });
                  }
                }
                // Add list ID if this is from a list endpoint
                else if (endpoint.route.includes('/lists/')) {
                  const listId = endpoint.route.match(/\/lists\/(\d+)/)?.[1];
                  if (listId) {
                    result.data.listId = listId;
                    // Add list context to publishers
                    publishers.forEach(p => {
                      p.listId = listId;
                    });
                  }
                }
              }
              
              return result;
            } catch (endpointError) {
              console.error(`Error querying endpoint ${endpoint.route}:`, endpointError);
              return {
                endpoint: endpoint.route,
                name: endpoint.name,
                error: endpointError.message || "Unknown error"
              };
            }
          })
        );
        
        // Filter out failed requests
        const validResults = creatorIQResults.filter(result => !result.error);
        console.log(`Creator IQ search returned ${validResults.length} results`);
        
        results.push({
          source: "creator_iq",
          results: creatorIQResults,
          state: {
            key: state_key,
            data: stateData.newData
          }
        });
      } catch (error) {
        console.error("Creator IQ search error:", error);
        results.push({
          source: "creator_iq",
          error: error.message || "Failed to search Creator IQ",
          details: typeof error === 'object' ? JSON.stringify(error) : 'No details available'
        });
      }
    }

    // Use task mode if requested (full agent capabilities with iterative tool calling)
    if (task_mode && allow_iterations) {
      try {
        console.log("Starting iterative agent task mode execution");
        
        // Import the iterative task runner
        const { runIterativeTask } = await import('./agent/iterativeTaskRunner.ts');
        
        const agentResponse = await runIterativeTask({
          query,
          initialResults: results,
          conversationHistory: conversation_history,
          maxIterations: max_iterations,
          reasoningLevel: reasoning_level,
          previousState: previous_state
        });
        
        return new Response(
          JSON.stringify({
            answer: agentResponse.answer,
            reasoning: agentResponse.reasoning,
            steps_taken: agentResponse.steps,
            tools_used: agentResponse.tools_used,
            iterations_used: agentResponse.iterations_used,
            sources: results,
            total_data: agentResponse.total_data_fetched
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error("Iterative agent task execution error:", error);
        return new Response(
          JSON.stringify({ 
            error: error.message || 'Failed to execute iterative agent task',
            sources: results 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    // Fallback to simple task mode (non-iterative) if iterations disabled
    else if (task_mode) {
      try {
        console.log("Starting simple agent task mode execution (no iterations)");
        const agentResponse = await runAgentTask(
          query, 
          results, 
          conversation_history, 
          tools, 
          false, // disable iterations in simple mode
          1, // single iteration
          reasoning_level
        );
        
        return new Response(
          JSON.stringify({
            answer: agentResponse.answer,
            reasoning: agentResponse.reasoning,
            steps_taken: agentResponse.steps,
            tools_used: agentResponse.tools_used,
            sources: results
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error("Simple agent task execution error:", error);
        return new Response(
          JSON.stringify({ 
            error: error.message || 'Failed to execute agent task',
            sources: results 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // 5. ALWAYS fetch repo-map context for full codebase awareness
    // Structured source data for UI
    const sourceData = {
      repos_mentioned: [] as Array<{ name: string; origin: string }>,
      tables_mentioned: [] as Array<{ table: string; owner_repo: string }>,
      functions_mentioned: [] as Array<{ function: string; repo: string; type: 'edge' | 'api' }>,
      sql_query: null as string | null
    };
    
    try {
      console.log("Fetching repo-map context for agent codebase awareness...");
      
      // 1. Always get a summary of all repositories for context
      const { data: allRepos, error: allReposError } = await supabase
        .from('repo_map')
        .select('repo_name, origin, integrations, supabase_functions, stack, tables')
        .order('repo_name');
      
      if (!allReposError && allRepos && allRepos.length > 0) {
        console.log(`Loaded ${allRepos.length} repositories for agent context`);
        
        // Build structured source data from all repos
        for (const r of allRepos) {
          if (r.repo_name) {
            sourceData.repos_mentioned.push({
              name: r.repo_name,
              origin: r.origin || ''
            });
          }
          
          // Tables
          if (r.tables && Array.isArray(r.tables)) {
            for (const table of r.tables) {
              sourceData.tables_mentioned.push({
                table: table,
                owner_repo: r.repo_name || ''
              });
            }
          }
          
          // Functions
          if (r.supabase_functions && Array.isArray(r.supabase_functions)) {
            for (const fn of r.supabase_functions) {
              sourceData.functions_mentioned.push({
                function: fn,
                repo: r.repo_name || '',
                type: 'edge' as const
              });
            }
          }
        }
        
        // Deduplicate
        sourceData.repos_mentioned = Array.from(
          new Map(sourceData.repos_mentioned.map(r => [r.name, r])).values()
        );
        sourceData.tables_mentioned = Array.from(
          new Map(sourceData.tables_mentioned.map(t => [t.table, t])).values()
        );
        sourceData.functions_mentioned = Array.from(
          new Map(sourceData.functions_mentioned.map(f => [f.function, f])).values()
        );
        
        // Add all repos to results for context building
        results.push({
          source: "repo_map",
          results: allRepos.map((r: any) => ({
            repo_name: r.repo_name,
            origin: r.origin,
            integrations: r.integrations || [],
            supabase_functions: r.supabase_functions || [],
            stack: r.stack || [],
            tables: r.tables || []
          }))
        });
      } else if (allReposError) {
        console.error("Error fetching all repos:", allReposError);
      }
      
      // 2. Additionally run relevance-scored search for code-specific queries
      const queryLower = query.toLowerCase();
      const codeKeywords = ['repo', 'function', 'table', 'integration', 'webhook', 'api', 'code', 'codebase', 'which', 'where'];
      const isCodeQuery = codeKeywords.some(k => queryLower.includes(k));
      
      if (isCodeQuery) {
        console.log("Running relevance-scored repo-map search for code query...");
        const { data: repoMapResults, error: repoMapError } = await supabase.rpc('search_repo_map', {
          query: query
        });
        
        if (!repoMapError && repoMapResults && repoMapResults.length > 0) {
          console.log(`Found ${repoMapResults.length} relevance-scored repo-map results`);
          
          // Merge relevance scores into the existing repo_map results
          const existingRepoMapResult = results.find(r => r.source === "repo_map");
          if (existingRepoMapResult && existingRepoMapResult.results) {
            // Add relevance scores to matching repos
            for (const scored of repoMapResults) {
              const existing = (existingRepoMapResult.results as any[]).find(
                (r: any) => r.repo_name === scored.repo_name
              );
              if (existing) {
                existing.relevance = scored.relevance;
              }
            }
            
            // Sort by relevance (highest first) for better context
            (existingRepoMapResult.results as any[]).sort((a: any, b: any) => 
              (b.relevance || 0) - (a.relevance || 0)
            );
          }
        } else if (repoMapError) {
          console.error("Repo-map relevance search error:", repoMapError);
        }
      }
    } catch (error) {
      console.error("Error fetching repo-map context:", error);
        // Continue without repo-map results
      }
    }

    // For non-task mode, just synthesize with AI as before
    console.log("Synthesizing results with OpenAI");
    const answer = await synthesizeWithAI(query, results, conversation_history, previous_state);
    
    // Extract and store memory if appropriate (lightweight facts layer)
    if (userId && answer) {
      try {
        const { extractMemory } = await import('./utils/memoryExtractor.ts');
        const memory = extractMemory(answer, query);
        
        if (memory) {
          // Store memory asynchronously (don't block response)
          supabase.from('agent_memories').insert({
            user_id: userId,
            fact: memory.fact,
            tags: memory.tags,
            confidence: memory.confidence
          }).then(({ error }) => {
            if (error) {
              console.error("Error storing memory:", error);
            } else {
              console.log("Stored memory:", memory.fact.substring(0, 50));
            }
          });
        }
      } catch (error) {
        console.error("Error in memory extraction:", error);
        // Don't fail the request if memory extraction fails
      }
    }
    
    // Return structured source data if repo-map was used
    const hasSourceData = sourceData.repos_mentioned.length > 0 || 
                         sourceData.tables_mentioned.length > 0 || 
                         sourceData.functions_mentioned.length > 0;

    // Process and store any write operation results
    const creatorIQResults = results.find(r => r.source === "creator_iq");
    if (creatorIQResults && creatorIQResults.results) {
      // Look for write operation results
      const writeOperationResults = creatorIQResults.results
        .filter(result => 
          result.data && 
          (result.data.operation || 
           (result.data.List && result.data.List.Id) ||
           (result.data.success === true))
        )
        .map(result => {
          // Extract operation result
          if (result.data.operation) {
            return {
              successful: result.data.operation.successful === true,
              type: result.data.operation.type || result.name || 'Unknown operation',
              details: result.data.operation.details || '',
              timestamp: result.data.operation.timestamp || new Date().toISOString()
            };
          } 
          // For list creation
          else if (result.data.List && result.data.List.Id) {
            const newList = {
              id: result.data.List.Id,
              name: result.data.List.Name || 'New List',
              description: result.data.List.Description || '',
              publishersCount: 0
            };
            
            // Add the newly created list to the state data
            if (stateData && stateData.newData && stateData.newData.lists) {
              stateData.newData.lists.push(newList);
              console.log(`Added newly created list to state: ${newList.name} (ID: ${newList.id})`);
            }
            
            return {
              successful: true,
              type: 'Create List',
              details: `Created list: ${newList.name} (ID: ${newList.id})`,
              id: newList.id,
              name: newList.name,
              timestamp: new Date().toISOString()
            };
          }
          // Generic success
          else if (result.data.success === true) {
            return {
              successful: true,
              type: result.name || 'Operation',
              details: result.data.message || 'Operation completed successfully',
              timestamp: new Date().toISOString()
            };
          }
          
          return null;
        })
        .filter(Boolean);
      
      // If we have operation results, store them in the state
      if (writeOperationResults && writeOperationResults.length > 0) {
        console.log(`Found ${writeOperationResults.length} write operation results to store`);
        
        // Add to state data
        if (stateData) {
          stateData.newData.operationResults = writeOperationResults;
        }
        
        // Also add to the results to be returned
        if (creatorIQResults.state && creatorIQResults.state.data) {
          creatorIQResults.state.data.operationResults = writeOperationResults;
        }
      }
    }

    // If state key and user ID are provided, save state data to the database
    if (state_key && userId && (stateData.newData.campaigns.length > 0 || 
                               stateData.newData.publishers.length > 0 || 
                               stateData.newData.lists.length > 0 ||
                               (stateData.newData.operationResults && stateData.newData.operationResults.length > 0))) {
      try {
        console.log("=== Creator IQ State Storage Debug ===");
        console.log("State storage parameters:", {
          state_key,
          userId,
          hasCampaigns: stateData.newData.campaigns.length > 0,
          hasPublishers: stateData.newData.publishers.length > 0,
          hasLists: stateData.newData.lists.length > 0,
          hasOperationResults: stateData.newData.operationResults?.length > 0
        });

        // Log detailed data counts
        console.log("Data counts:", {
          campaigns: stateData.newData.campaigns.length,
          publishers: stateData.newData.publishers.length,
          lists: stateData.newData.lists.length,
          operationResults: stateData.newData.operationResults?.length || 0
        });

        // Log sample data structure
        if (stateData.newData.campaigns.length > 0) {
          console.log("Sample campaign data:", {
            firstCampaign: stateData.newData.campaigns[0],
            totalCampaigns: stateData.newData.campaigns.length
          });
        }
        if (stateData.newData.publishers.length > 0) {
          console.log("Sample publisher data:", {
            firstPublisher: stateData.newData.publishers[0],
            totalPublishers: stateData.newData.publishers.length
          });
        }
        if (stateData.newData.lists.length > 0) {
          console.log("Sample list data:", {
            firstList: stateData.newData.lists[0],
            totalLists: stateData.newData.lists.length
          });
        }

        console.log("Attempting to save state to database...");
        
        const { data: savedData, error } = await supabase
          .from('creator_iq_state')
          .upsert({
            key: state_key,
            user_id: userId,
            data: stateData.newData,
            query_context: query,
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour expiry
            created_at: new Date().toISOString()
          }, {
            onConflict: 'key'
          })
          .select();
          
        if (error) {
          console.error("Error saving state to database:", {
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
        } else {
          console.log("Successfully saved state to database:", {
            savedKey: savedData?.[0]?.key,
            savedUserId: savedData?.[0]?.user_id,
            savedAt: savedData?.[0]?.created_at,
            expiresAt: savedData?.[0]?.expires_at
          });
        }
        console.log("=== End Creator IQ State Storage Debug ===");
      } catch (stateError) {
        console.error("Error in state storage:", {
          error: stateError,
          message: stateError.message,
          stack: stateError.stack
        });
      }
    } else {
      console.log("State not saved - missing required data:", {
        hasStateKey: !!state_key,
        hasUserId: !!userId,
        hasCampaigns: stateData.newData.campaigns.length > 0,
        hasPublishers: stateData.newData.publishers.length > 0,
        hasLists: stateData.newData.lists.length > 0,
        hasOperationResults: stateData.newData.operationResults?.length > 0
      });
    }
    
    // Return the combined results
    return new Response(
      JSON.stringify({
        answer,
        sources: results,
        ...(hasSourceData && { source_data: sourceData })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in unified-agent:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
