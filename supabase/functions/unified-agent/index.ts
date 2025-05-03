import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? ''
const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY') ?? ''
const CREATOR_IQ_API_KEY = Deno.env.get('CREATOR_IQ_API_KEY') ?? ''

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify OpenAI API key is configured
    if (!OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY is not configured!')
      throw new Error('OPENAI_API_KEY is not configured in the environment')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const requestData = await req.json()
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
      task_mode = false, 
      tools = ["web_search", "file_search", "file_analysis", "slack_search", "creator_iq"],
      allow_iterations = true,
      max_iterations = 5, 
      reasoning_level = "medium"
    } = requestData
    
    if (!query) {
      throw new Error('Query is required')
    }

    // Extract the Authorization header
    const authHeader = req.headers.get('Authorization')
    let userId = null
    let userToken = null

    // Try to get user from auth header
    if (authHeader) {
      try {
        userToken = authHeader.replace('Bearer ', '')
        const { data: userData, error: userError } = await supabase.auth.getUser(userToken)
        if (!userError && userData.user) {
          userId = userData.user.id
          console.log(`Authenticated user: ${userId}`)
        } else {
          console.log('Invalid user token in auth header:', userError?.message)
        }
      } catch (authError) {
        console.error('Error processing auth header:', authError)
      }
    } else {
      console.log('No Authorization header provided')
    }

    // Initialize results array to store information from different sources
    const results = []
    
    // 1. Search Google Drive if requested and tool is enabled
    if (include_drive && tools.includes("file_search")) {
      try {
        console.log(`Starting Google Drive search ${userId ? `for user: ${userId}` : '(no user ID)'}`)
        
        // Log token presence and debug info
        console.log(`Debug token info:`, debug_token_info)
        console.log(`Provider token from request: ${provider_token ? 'Present' : 'Not present'}`)
        console.log(`User token: ${userToken ? 'Present' : 'Not present'}`)
        
        const driveResults = await searchGoogleDrive(supabase, userId, query, provider_token, userToken)
        console.log(`Google Drive search returned ${driveResults.length} results`)
        
        if (driveResults.length === 0) {
          console.log("No drive results returned - this could indicate a permission issue")
        }
        
        results.push({
          source: "google_drive",
          results: driveResults
        })

        // If file analysis is enabled and we have drive results, analyze the first few relevant files
        if (tools.includes("file_analysis") && driveResults.length > 0) {
          const filesToAnalyze = driveResults.slice(0, 3) // Analyze up to 3 most relevant files
          const analysisResults = []
          
          for (const file of filesToAnalyze) {
            try {
              // Use more detailed error handling for file analysis
              console.log(`Analyzing file: ${file.id} (${file.name})`)
              const analysis = await analyzeGoogleDriveFile(file.id, provider_token || userToken)
              if (typeof analysis === 'string' && analysis.includes('Error analyzing file')) {
                console.error(`Analysis error for file ${file.id}: ${analysis}`)
                analysisResults.push({
                  file_id: file.id,
                  file_name: file.name,
                  analysis: `Could not analyze file content: ${analysis}`
                })
              } else {
                console.log(`Successfully analyzed file ${file.id}`)
                analysisResults.push({
                  file_id: file.id,
                  file_name: file.name,
                  analysis
                })
              }
            } catch (error) {
              console.error(`Error analyzing file ${file.id}:`, error)
              analysisResults.push({
                file_id: file.id,
                file_name: file.name,
                analysis: `Error analyzing file: ${error.message || "Unknown error"}`
              })
            }
          }
          
          if (analysisResults.length > 0) {
            results.push({
              source: "file_analysis",
              results: analysisResults
            })
          }
        }
      } catch (error) {
        console.error("Google Drive search error:", error)
        results.push({
          source: "google_drive",
          error: error.message || "Failed to search Google Drive",
          details: typeof error === 'object' ? JSON.stringify(error) : 'No details available'
        })
      }
    }

    // 2. Search the web if requested and tool is enabled
    if (include_web && tools.includes("web_search")) {
      try {
        console.log("Starting web search")
        if (!TAVILY_API_KEY) {
          console.warn("TAVILY_API_KEY is not configured, web search will not work!")
        }
        const webResults = await searchWeb(query)
        console.log(`Web search returned ${webResults.length} results`)
        results.push({
          source: "web_search",
          results: webResults
        })
      } catch (error) {
        console.error("Web search error:", error)
        results.push({
          source: "web_search",
          error: error.message || "Failed to search the web"
        })
      }
    }

    // 3. Search Slack if requested and tool is enabled
    if (include_slack && tools.includes("slack_search")) {
      try {
        console.log(`Starting Slack search ${userId ? `for user: ${userId}` : '(no user ID)'}`)
        
        // Import the Slack search functionality
        const { searchSlack } = await import('./slack-tool.ts')
        
        // Search Slack for messages related to the query
        const slackResults = await searchSlack(userId, query, supabase)
        console.log(`Slack search returned ${slackResults.length} results`)
        
        if (slackResults.length === 0) {
          console.log("No Slack results returned - this could indicate no matching messages or a permission issue")
        }
        
        results.push({
          source: "slack",
          results: slackResults
        })
        
      } catch (error) {
        console.error("Slack search error:", error)
        results.push({
          source: "slack",
          error: error.message || "Failed to search Slack",
          details: typeof error === 'object' ? JSON.stringify(error) : 'No details available'
        })
      }
    }

    // 4. Query Creator IQ if requested and tool is enabled
    if (include_creator_iq && tools.includes("creator_iq")) {
      try {
        console.log(`Starting Creator IQ search ${userId ? `for user: ${userId}` : '(no user ID)'}`)
        
        if (!CREATOR_IQ_API_KEY) {
          console.warn("CREATOR_IQ_API_KEY is not configured, Creator IQ search will not work!")
          throw new Error("Creator IQ API key is not configured")
        }
        
        // Log the Creator IQ params received from the client
        console.log("Creator IQ params:", creator_iq_params);
        
        // Determine endpoints to query based on the query and creator_iq_params
        let endpoints = [];
        
        // If specific parameters indicate campaign search
        if (creator_iq_params.search_campaigns) {
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
          endpoints = determineCreatorIQEndpoints(query);
        }
        
        const creatorIQResults = await Promise.all(
          endpoints.map(async (endpoint) => {
            try {
              const payload = buildCreatorIQPayload(endpoint, query, creator_iq_params);
              return await queryCreatorIQEndpoint(endpoint, payload);
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
          results: creatorIQResults
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

    // 3. Use task mode if requested (full agent capabilities)
    if (task_mode) {
      try {
        console.log("Starting agent task mode execution")
        const agentResponse = await runAgentTask(
          query, 
          results, 
          conversation_history, 
          tools, 
          allow_iterations, 
          max_iterations, 
          reasoning_level
        )
        
        return new Response(
          JSON.stringify({
            answer: agentResponse.answer,
            reasoning: agentResponse.reasoning,
            steps_taken: agentResponse.steps,
            tools_used: agentResponse.tools_used,
            sources: results
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error("Agent task execution error:", error)
        return new Response(
          JSON.stringify({ 
            error: error.message || 'Failed to execute agent task',
            sources: results 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // For non-task mode, just synthesize with AI as before
    console.log("Synthesizing results with OpenAI")
    const answer = await synthesizeWithAI(query, results, conversation_history)

    // Return the combined results
    return new Response(
      JSON.stringify({
        answer,
        sources: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error in unified-agent:", error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Function to search Google Drive
async function searchGoogleDrive(supabase, userId, query, providerToken, userToken) {
  try {
    let driveToken = providerToken;
    
    // If no provider token, try to get from database
    if (!driveToken && userId) {
      const { data: tokenData } = await supabase
        .from('google_drive_access')
        .select('access_token')
        .eq('user_id', userId)
        .maybeSingle();
        
      driveToken = tokenData?.access_token;
    }
    
    if (!driveToken) {
      throw new Error('No Google Drive access token available');
    }
    
    // Validate the token first
    console.log("Validating Google Drive token...")
    try {
      const validationResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + driveToken
      );
      
      if (!validationResponse.ok) {
        const validationData = await validationResponse.text();
        console.error(`Token validation error (${validationResponse.status}): ${validationData}`);
        throw new Error(`Invalid Google Drive token (${validationResponse.status}): ${validationResponse.statusText}`);
      }
      
      const validationData = await validationResponse.json();
      console.log(`Token validated successfully with scope: ${validationData.scope}`);
    } catch (validationError) {
      console.error("Token validation failed:", validationError);
      throw new Error(`Token validation failed: ${validationError.message}`);
    }
    
    // Build search query with improved error handling
    console.log(`Building Google Drive search query for: "${query}"`);
    try {
      // Removed the problematic 'orderBy' parameter
      const queryParams = new URLSearchParams({
        q: `fullText contains '${query}'`,
        fields: 'files(id,name,mimeType,description,thumbnailLink,webViewLink,modifiedTime,size,iconLink,fileExtension,parents)',
        pageSize: '10'
      });
      
      console.log(`Making request to Google Drive API: /drive/v3/files?${queryParams}`);
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?${queryParams}`, 
        {
          headers: { 'Authorization': `Bearer ${driveToken}` }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Google Drive API error (${response.status}): ${errorText}`);
        throw new Error(`Google Drive API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`Google Drive search completed successfully with ${data.files?.length || 0} results`);
      return data.files || [];
    } catch (searchError) {
      console.error("Error in Drive search:", searchError);
      throw searchError;
    }
  } catch (error) {
    console.error("Error in searchGoogleDrive:", error);
    throw error;
  }
}

// Function to analyze Google Drive file content
async function analyzeGoogleDriveFile(fileId, accessToken) {
  try {
    if (!accessToken) {
      throw new Error('No access token available for file analysis');
    }
    
    // Get file metadata to determine type
    console.log(`Getting metadata for file: ${fileId}`);
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType,name`, 
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error(`Failed to get file metadata (${metadataResponse.status}): ${errorText}`);
      throw new Error(`Failed to get file metadata: ${metadataResponse.status} ${metadataResponse.statusText}`);
    }
    
    const metadata = await metadataResponse.json();
    const { mimeType, name } = metadata;
    console.log(`File ${fileId} (${name}) is of type: ${mimeType}`);
    
    // For Google Docs, Sheets, Slides, use the export API
    if (mimeType.includes('application/vnd.google-apps.')) {
      let exportMimeType = 'text/plain';
      let exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${exportMimeType}`;
      
      console.log(`Exporting Google Workspace file using URL: ${exportUrl}`);
      const contentResponse = await fetch(exportUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!contentResponse.ok) {
        // If export fails, try to get at least the metadata
        const errorText = await contentResponse.text();
        console.error(`Export API error (${contentResponse.status}): ${errorText}`);
        return {
          type: 'google-workspace',
          fileName: name,
          mimeType: mimeType,
          contentInfo: `Could not export content: ${contentResponse.status} ${contentResponse.statusText}`
        };
      }
      
      const content = await contentResponse.text();
      console.log(`Successfully exported ${content.length} characters of content`);
      
      // Limit content length to avoid overwhelming the AI
      const maxContentLength = 5000;
      const truncatedContent = content.length > maxContentLength 
        ? content.substring(0, maxContentLength) + '...[content truncated]'
        : content;
      
      return {
        type: 'google-workspace',
        content: truncatedContent,
        fileName: name,
        mimeType: mimeType
      };
    }
    
    // For text-based files, get content directly
    else if (mimeType.includes('text/') || 
        mimeType.includes('application/json') || 
        mimeType.includes('application/xml')) {
      
      console.log(`Getting content for text-based file: ${fileId}`);
      const contentResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!contentResponse.ok) {
        const errorText = await contentResponse.text();
        console.error(`Content retrieval error (${contentResponse.status}): ${errorText}`);
        return `Could not download file content: ${contentResponse.status}`;
      }
      
      const content = await contentResponse.text();
      console.log(`Successfully retrieved ${content.length} characters of content`);
      
      // Limit content length to avoid overwhelming the AI
      const maxContentLength = 5000;
      const truncatedContent = content.length > maxContentLength 
        ? content.substring(0, maxContentLength) + '...[content truncated]'
        : content;
      
      return {
        type: 'text',
        content: truncatedContent,
        fileName: name,
        mimeType: mimeType
      };
    }
    
    // For PDF files
    else if (mimeType.includes('application/pdf')) {
      console.log(`PDF file detected: ${fileId}. PDFs require special handling.`);
      return {
        type: 'pdf',
        fileName: name,
        mimeType: mimeType,
        contentInfo: 'PDF content extraction not supported. For best results, convert PDF to Google Docs.'
      };
    }
    
    // For other files, just return metadata
    console.log(`Non-text file detected: ${fileId}. Returning metadata only.`);
    return {
      type: 'non-text',
      fileName: name,
      mimeType: mimeType,
      contentInfo: 'Content not extracted - non-text file type'
    };
  } catch (error) {
    console.error("Error analyzing file:", error);
    return `Error analyzing file: ${error.message}`;
  }
}

// Function to search the web using Tavily API
async function searchWeb(query) {
  try {
    if (!TAVILY_API_KEY) {
      return [];
    }
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        query: query,
        search_depth: 'advanced',
        include_domains: [],
        exclude_domains: [],
        include_answer: false,
        max_results: 10
      })
    });
    
    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error in web search:", error);
    return [];
  }
}

// Updated function to query Creator IQ endpoints
async function queryCreatorIQEndpoint(endpoint: any, payload: any) {
  try {
    if (!CREATOR_IQ_API_KEY) {
      throw new Error("CREATOR_IQ_API_KEY is not set");
    }

    // Updated base URL
    const baseUrl = 'https://apis.creatoriq.com/crm/v1/api';
    const url = `${baseUrl}${endpoint.route}`;
    
    // Set up headers for Creator IQ API
    const headers = {
      'Authorization': `Bearer ${CREATOR_IQ_API_KEY}`,
      'Content-Type': 'application/json'
    };
    
    console.log(`Querying Creator IQ endpoint: ${endpoint.route} with payload:`, payload);

    // Improved request handling
    let response;
    if (endpoint.method === 'POST') {
      console.log(`Making POST request to ${url}`);
      response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });
    } else {
      // For GET requests, properly build URL with query parameters
      const urlParams = new URLSearchParams();
      if (payload) {
        Object.entries(payload).forEach(([key, value]) => {
          if (!endpoint.route.includes(`{${key}}`) && value !== undefined) {
            urlParams.append(key, value.toString());
          }
        });
      }
      
      const fullUrl = `${url}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
      console.log(`Making GET request to ${fullUrl}`);
      response = await fetch(fullUrl, {
        method: 'GET',
        headers: headers
      });
    }
    
    // Log response status and handle errors
    console.log(`Creator IQ API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Creator IQ API error (${response.status}): ${errorText}`);
      throw new Error(`Creator IQ API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Creator IQ response from ${endpoint.route}:`, data);
    
    // Special handling for campaign searches
    if (endpoint.route === "/campaigns" && payload.search && data.CampaignCollection) {
      const searchTerm = payload.search.toLowerCase();
      console.log(`Filtering campaigns by search term: ${searchTerm}`);
      
      // Filter campaigns by name
      const filteredCampaigns = data.CampaignCollection.filter((campaign: any) => {
        if (campaign.Campaign && campaign.Campaign.CampaignName) {
          const campaignName = campaign.Campaign.CampaignName.toLowerCase();
          return campaignName.includes(searchTerm);
        }
        return false;
      });
      
      console.log(`Found ${filteredCampaigns.length} campaigns matching "${searchTerm}"`);
      
      // Update the response with filtered results
      data.CampaignCollection = filteredCampaigns;
      data.filtered_by = payload.search;
      data.count = filteredCampaigns.length;
      
      // For each campaign, get publisher counts
      for (const campaign of filteredCampaigns) {
        if (campaign.Campaign && campaign.Campaign.CampaignId) {
          try {
            const campaignId = campaign.Campaign.CampaignId;
            const publishersUrl = `${baseUrl}/campaigns/${campaignId}/publishers`;
            const publishersResponse = await fetch(publishersUrl, {
              method: 'GET',
              headers: headers
            });
            
            if (publishersResponse.ok) {
              const publishersData = await publishersResponse.json();
              campaign.Campaign.PublishersCount = publishersData.count || 0;
              console.log(`Campaign ${campaignId} has ${campaign.Campaign.PublishersCount} publishers`);
            }
          } catch (error) {
            console.error("Error getting publisher count:", error);
          }
        }
      }
    }
    
    return {
      endpoint: endpoint.route,
      name: endpoint.name,
      data: data
    };
    
  } catch (error) {
    console.error(`Error querying Creator IQ endpoint ${endpoint.route}:`, error);
    return {
      endpoint: endpoint.route,
      name: endpoint.name,
      error: error.message || "Unknown error"
    };
  }
}

// Helper function to determine which Creator IQ endpoint(s) to query based on the query
function determineCreatorIQEndpoints(query: string) {
  const lowerQuery = query.toLowerCase();
  const endpoints = [];
  
  // Define all available endpoints with updated terminology
  const availableEndpoints = {
    publishers: {
      route: "/publishers",
      method: "GET",
      name: "List Publishers",
      keywords: ["publishers", "influencers", "list publishers", "find influencers", "influencer list"]
    },
    publisher_details: {
      route: "/publishers/{publisher_id}",
      method: "GET",
      name: "Get Publisher Details",
      keywords: ["publisher details", "influencer details", "creator profile", "influencer information"]
    },
    publisher_performance: {
      route: "/publishers/{publisher_id}/performance",
      method: "GET",
      name: "Get Publisher Performance",
      keywords: ["publisher performance", "influencer performance", "performance metrics", "engagement stats"]
    },
    campaigns: {
      route: "/campaigns",
      method: "GET",
      name: "List Campaigns",
      keywords: ["campaigns", "marketing campaigns", "influencer campaigns", "list campaigns", "ready rocker", "ambassador program"]
    },
    campaign_details: {
      route: "/campaigns/{campaign_id}",
      method: "GET",
      name: "Get Campaign Details",
      keywords: ["campaign details", "campaign information", "campaign stats"]
    },
    content: {
      route: "/content",
      method: "GET",
      name: "List Content",
      keywords: ["content", "posts", "influencer content", "campaign content", "creator posts"]
    },
    // New List endpoints with keywords
    lists: {
      route: "/lists",
      method: "GET",
      name: "Get Lists",
      keywords: ["lists", "publisher lists", "influencer lists", "get lists", "search lists", "list", "find list"]
    },
    list_details: {
      route: "/lists/{list_id}",
      method: "GET", 
      name: "Get List Details",
      keywords: ["list details", "list information", "specific list", "list data"]
    },
    list_publishers: {
      route: "/lists/{list_id}/publishers",
      method: "GET",
      name: "Get Publishers in List",
      keywords: ["list members", "publishers in list", "list publishers", "influencers in list", "count publishers", "list count"]
    }
  };
  
  // Check if query is asking for a specific list by name
  const listNameMatch = lowerQuery.match(/list\s+([a-z0-9\s]+)/i) || 
                        lowerQuery.match(/([a-z0-9\s]+)\s+list/i);
  
  let listName = null;
  if (listNameMatch && listNameMatch[1]) {
    listName = listNameMatch[1].trim();
    console.log(`Detected possible list name: "${listName}"`);
  }
  
  // Check which endpoints match the query
  let matchedEndpoints = false;
  for (const [key, endpoint] of Object.entries(availableEndpoints)) {
    const isRelevant = endpoint.keywords.some(keyword => lowerQuery.includes(keyword.toLowerCase()));
    if (isRelevant) {
      endpoints.push(endpoint);
      matchedEndpoints = true;
      console.log(`Matched endpoint: ${key} based on keywords`);
    }
  }
  
  // Special handling for "Ready Rocker" queries
  if (lowerQuery.includes("ready rocker") || lowerQuery.includes("ambassador program")) {
    console.log("Adding campaigns endpoint for Ready Rocker search");
    const campaignsEndpoint = availableEndpoints.campaigns;
    if (!endpoints.some(e => e.route === campaignsEndpoint.route)) {
      endpoints.push(campaignsEndpoint);
      matchedEndpoints = true;
    }
  }
  
  // Special handling for list-related queries
  if ((lowerQuery.includes("list") && !matchedEndpoints) || listName) {
    // If there's a specific list name mentioned, prioritize list_details and list_publishers
    if (listName) {
      console.log(`Adding list endpoints for list name: "${listName}"`);
      endpoints.push(availableEndpoints.lists);
      
      // If query is about counting or finding publishers in a list, add list_publishers endpoint
      if (lowerQuery.includes("count") || 
          lowerQuery.includes("publishers") || 
          lowerQuery.includes("influencers")) {
        endpoints.push(availableEndpoints.list_publishers);
      }
    } else {
      // Generic list query without specific list name
      endpoints.push(availableEndpoints.lists);
    }
  }
  
  // If no specific endpoints matched, return a default set
  if (endpoints.length === 0) {
    // Default to lists endpoint for this request as it's likely list related
    if (lowerQuery.includes("list")) {
      console.log("No specific endpoints matched, defaulting to lists endpoint");
      endpoints.push(availableEndpoints.lists);
    } else {
      // Fall back to publishers and campaigns as most common use cases
      console.log("No specific endpoints matched, defaulting to publishers and campaigns");
      endpoints.push(availableEndpoints.publishers);
      endpoints.push(availableEndpoints.campaigns);
    }
  }
  
  console.log(`Selected ${endpoints.length} endpoints for the query`);
  return endpoints;
}

// Helper function to build the payload for Creator IQ API calls
function buildCreatorIQPayload(endpoint: any, query: string, creator_iq_params: any = {}) {
  const lowerQuery = query.toLowerCase();
  
  // Start with basic parameters
  const payload: any = {
    limit: 50 // Increase default limit to get more results
  };
  
  // Apply any params passed explicitly from the frontend
  if (creator_iq_params) {
    // If we have a campaign search term from frontend
    if (creator_iq_params.campaign_search_term) {
      payload.search = creator_iq_params.campaign_search_term;
      console.log(`Using campaign search term from params: "${payload.search}"`);
    }
    
    // Copy other relevant params
    if (creator_iq_params.limit) payload.limit = creator_iq_params.limit;
    if (creator_iq_params.offset) payload.offset = creator_iq_params.offset;
    if (creator_iq_params.status) payload.status = creator_iq_params.status;
  }
  
  // Check for list name in the query
  const listNameMatch = lowerQuery.match(/list\s+([a-z0-9\s]+)/i) || 
                        lowerQuery.match(/([a-z0-9\s]+)\s+list/i);
  
  if (listNameMatch && listNameMatch[1] && !payload.search) {
    const listName = listNameMatch[1].trim();
    console.log(`Adding search parameter for list name: "${listName}"`);
    payload.search = listName;
  }
  
  // Check for campaign name in the query
  const campaignNameMatch = lowerQuery.match(/campaign(?:\s+called|\s+named|\s+titled)?\s+["']([^"']+)["']/i) || 
                           lowerQuery.match(/["']([^"']+)["'](?:\s+campaign)/i);
  
  if (campaignNameMatch && campaignNameMatch[1] && !payload.search) {
    const campaignName = campaignNameMatch[1].trim();
    console.log(`Adding search parameter for campaign name: "${campaignName}"`);
