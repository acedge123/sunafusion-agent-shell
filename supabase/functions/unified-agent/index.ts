
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? ''
const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY') ?? ''

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
      provider_token = null,
      debug_token_info = {},
      task_mode = false, // New parameter to enable full agent capabilities
      tools = ["web_search", "file_search", "file_analysis"], // Tools to use
      allow_iterations = true, // Allow multiple iterations for complex tasks
      max_iterations = 5, // Maximum number of iterations
      reasoning_level = "medium" // How much reasoning to show
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
              const analysis = await analyzeGoogleDriveFile(file.id, provider_token || userToken)
              analysisResults.push({
                file_id: file.id,
                file_name: file.name,
                analysis
              })
            } catch (error) {
              console.error(`Error analyzing file ${file.id}:`, error)
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
    const validationResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + driveToken
    );
    
    if (!validationResponse.ok) {
      throw new Error(`Invalid Google Drive token: ${validationResponse.status}`);
    }
    
    // Build search query
    const queryParams = new URLSearchParams({
      q: `fullText contains '${query}'`,
      fields: 'files(id,name,mimeType,description,thumbnailLink,webViewLink,modifiedTime,size,iconLink,fileExtension,parents)',
      orderBy: 'relevance',
      pageSize: '10'
    });
    
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?${queryParams}`, 
      {
        headers: { 'Authorization': `Bearer ${driveToken}` }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.files || [];
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
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType,name`, 
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    if (!metadataResponse.ok) {
      throw new Error(`Failed to get file metadata: ${metadataResponse.status}`);
    }
    
    const metadata = await metadataResponse.json();
    const { mimeType, name } = metadata;
    
    // For text-based files, get content
    if (mimeType.includes('text/') || 
        mimeType.includes('application/json') || 
        mimeType.includes('application/xml') ||
        mimeType.includes('application/vnd.google-apps.document')) {
      
      const exportMimeType = mimeType.includes('application/vnd.google-apps.') 
        ? 'text/plain' 
        : mimeType;
      
      const contentUrl = mimeType.includes('application/vnd.google-apps.')
        ? `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`
        : `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      
      const contentResponse = await fetch(contentUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!contentResponse.ok) {
        return `Could not download file content: ${contentResponse.status}`;
      }
      
      const content = await contentResponse.text();
      
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
    
    // For other files, just return metadata
    return {
      type: 'non-text',
      fileName: name,
      mimeType: mimeType,
      contentInfo: 'Content not extracted - non-text file'
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

// Function to run full agent task
async function runAgentTask(query, initialResults, conversationHistory, tools, allowIterations, maxIterations, reasoningLevel) {
  try {
    // In a real implementation, this would call the agent backend
    // For now, we'll simulate with OpenAI
    
    const systemPrompt = `You are an autonomous agent that can solve complex tasks.
Given a task, you should break it down into steps and work through it systematically.
You can use tools like web search and file analysis to gather information.
${reasoningLevel === 'high' ? 'Show your detailed reasoning for each step.' : 
  reasoningLevel === 'medium' ? 'Show basic reasoning for important decisions.' :
  'Focus on results with minimal explanation.'}`;
    
    // Format initial results as context
    let initialContext = "Information gathered so far:\n";
    
    for (const source of initialResults) {
      initialContext += `\n--- ${source.source.toUpperCase()} RESULTS ---\n`;
      
      if (source.results && source.results.length > 0) {
        for (const result of source.results.slice(0, 3)) { // Limit to first 3 for brevity
          if (source.source === "google_drive") {
            initialContext += `File: ${result.name} (${result.mimeType})\n`;
            if (result.description) initialContext += `Description: ${result.description}\n`;
          } else if (source.source === "web_search") {
            initialContext += `Title: ${result.title}\n`;
            initialContext += `Content: ${result.snippet}\n`;
            initialContext += `URL: ${result.url}\n`;
          } else if (source.source === "file_analysis") {
            initialContext += `File Analysis - ${result.file_name}:\n`;
            if (typeof result.analysis === 'string') {
              initialContext += result.analysis.substring(0, 500) + '...\n';
            } else {
              initialContext += `Type: ${result.analysis.type}, ${result.analysis.contentInfo || ''}\n`;
              if (result.analysis.content) {
                initialContext += result.analysis.content.substring(0, 500) + '...\n';
              }
            }
          }
          initialContext += '\n';
        }
      } else if (source.error) {
        initialContext += `Error: ${source.error}\n`;
      } else {
        initialContext += `No results found.\n`;
      }
    }
    
    // Simulate iterations if needed
    const iterations = allowIterations ? Math.min(Math.ceil(query.length / 50), maxIterations) : 1;
    const steps = [];
    const toolsUsed = new Set();
    
    for (let i = 0; i < iterations; i++) {
      // In a real implementation, this would call the backend agent system
      // but for now we'll just simulate progress
      const stepTool = tools[i % tools.length];
      toolsUsed.add(stepTool);
      
      steps.push({
        step: i + 1,
        action: `Used ${stepTool} to gather information`,
        result: `Found relevant information for the query through ${stepTool}`
      });
    }
    
    // Use OpenAI to synthesize a final answer
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Task: ${query}\n\n${initialContext}` }
    ];
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const aiResponse = await response.json();
    const answer = aiResponse.choices[0].message.content;
    
    // Split into reasoning and answer if reasoningLevel is high
    let reasoning = '';
    let finalAnswer = answer;
    
    if (reasoningLevel === 'high' || reasoningLevel === 'medium') {
      const parts = answer.split(/(?:^|\n)(?:In conclusion:|To summarize:|Therefore:|In sum:|Summary:|Final answer:|Answer:)/i);
      if (parts.length > 1) {
        reasoning = parts[0].trim();
        finalAnswer = parts.slice(1).join('\n').trim();
      }
    }
    
    return {
      answer: finalAnswer,
      reasoning: reasoning,
      steps: steps,
      tools_used: Array.from(toolsUsed)
    };
  } catch (error) {
    console.error("Error in agent task execution:", error);
    throw error;
  }
}

// Function to synthesize information using OpenAI
async function synthesizeWithAI(query, results, conversationHistory) {
  try {
    // Format results for the AI
    let formattedResults = '';
    for (const source of results) {
      formattedResults += `\n--- ${source.source.toUpperCase()} RESULTS ---\n`;
      
      if (source.results && source.results.length > 0) {
        for (const result of source.results) {
          if (source.source === "google_drive") {
            formattedResults += `File: ${result.name} (${result.mimeType})\n`;
            if (result.description) formattedResults += `Description: ${result.description}\n`;
          } else if (source.source === "web_search") {
            formattedResults += `Title: ${result.title}\n`;
            formattedResults += `Content: ${result.snippet}\n`;
            formattedResults += `URL: ${result.url}\n`;
          } else if (source.source === "file_analysis") {
            formattedResults += `File Analysis - ${result.file_name}:\n`;
            if (typeof result.analysis === 'string') {
              formattedResults += result.analysis + '\n';
            } else {
              formattedResults += `Type: ${result.analysis.type}\n`;
              if (result.analysis.content) {
                formattedResults += result.analysis.content + '\n';
              }
            }
          }
          formattedResults += '\n';
        }
      } else if (source.error) {
        formattedResults += `Error: ${source.error}\n`;
      } else {
        formattedResults += `No results found.\n`;
      }
    }
    
    // Create messages array for the OpenAI API
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant with access to Google Drive files and web search results. " +
          "Provide comprehensive, accurate answers based on the information available to you. " +
          "If the information to answer the query is not available in the provided results, " +
          "acknowledge this limitation and provide the best possible answer with the information you have. " +
          "If relevant, mention the source of information (Google Drive or web search)."
      }
    ];
    
    // Add previous conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }
    
    // Add the current query and results
    messages.push({
      role: "user",
      content: `${query}\n\nHere are the search results:\n${formattedResults}`
    });
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',  // Using a more capable model for synthesis
        messages: messages,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error in synthesizeWithAI:", error);
    throw error;
  }
}
