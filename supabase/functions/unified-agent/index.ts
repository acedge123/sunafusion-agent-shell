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

    // Initialize results array to store information from different sources
    const results = [];
    
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
                  .filter(c => c.Campaign && c.Campaign.CampaignId && c.Campaign.CampaignName)
                  .map(c => ({
                    id: c.Campaign.CampaignId,
                    name: c.Campaign.CampaignName,
                    status: c.Campaign.CampaignStatus,
                    publishersCount: c.Campaign.PublishersCount
                  }));
                  
                stateData.newData.campaigns = campaigns;
                console.log(`Processed ${campaigns.length} campaigns for state storage`);
              }
              
              // Process publisher results
              if (endpoint.route.includes('/publishers') && result.data && result.data.PublisherCollection) {
                const publishers = result.data.PublisherCollection
                  .filter(p => p.Publisher && p.Publisher.Id)
                  .map(p => ({
                    id: p.Publisher.Id,
                    name: p.Publisher.PublisherName || 'Unnamed',
                    status: p.Publisher.Status
                  }));
                  
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

    // Use task mode if requested (full agent capabilities)
    if (task_mode) {
      try {
        console.log("Starting agent task mode execution");
        const agentResponse = await runAgentTask(
          query, 
          results, 
          conversation_history, 
          tools, 
          allow_iterations, 
          max_iterations, 
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
        console.error("Agent task execution error:", error);
        return new Response(
          JSON.stringify({ 
            error: error.message || 'Failed to execute agent task',
            sources: results 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // For non-task mode, just synthesize with AI as before
    console.log("Synthesizing results with OpenAI");
    const answer = await synthesizeWithAI(query, results, conversation_history, previous_state);

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
        console.log("Saving Creator IQ state to database");
        
        const { error } = await supabase
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
          });
          
        if (error) {
          console.error("Error saving state to database:", error);
        } else {
          console.log("Successfully saved state to database");
        }
      } catch (stateError) {
        console.error("Error in state storage:", stateError);
      }
    }
    
    // Return the combined results
    return new Response(
      JSON.stringify({
        answer,
        sources: results,
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
