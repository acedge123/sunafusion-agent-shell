
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
      debug_token_info = {}
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
    
    // 1. Search Google Drive if requested
    if (include_drive) {
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
      } catch (error) {
        console.error("Google Drive search error:", error)
        results.push({
          source: "google_drive",
          error: error.message || "Failed to search Google Drive",
          details: typeof error === 'object' ? JSON.stringify(error) : 'No details available'
        })
      }
    }

    // 2. Search the web if requested
    if (include_web) {
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

    // 3. Use OpenAI to synthesize the information
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

// Function to search Google Drive - Enhanced with better error handling and token validation
async function searchGoogleDrive(supabase, userId, query, providerToken, userToken) {
  let accessToken = providerToken;
  let refreshToken = null;
  let tokenSource = 'request provider_token';
  let tokenDebugInfo = [];

  tokenDebugInfo.push(`Initial check - Provider token from request: ${accessToken ? 'Present' : 'Not present'}`);

  // If no provider token is provided in the request, try to get from auth session if user token exists
  if (!accessToken && userToken) {
    try {
      tokenDebugInfo.push('Trying to get token from auth session');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession(userToken)
      
      if (sessionError) {
        console.error('Error getting session:', sessionError.message)
        tokenDebugInfo.push(`Session error: ${sessionError.message}`);
      } else if (sessionData?.session?.provider_token) {
        accessToken = sessionData.session.provider_token
        tokenSource = 'auth session provider_token'
        tokenDebugInfo.push('Successfully retrieved token from auth session');
        console.log('Using provider token from auth session')
      } else {
        tokenDebugInfo.push('No provider token found in auth session');
      }
    } catch (error) {
      console.error('Error retrieving session:', error.message)
      tokenDebugInfo.push(`Error retrieving session: ${error.message}`);
    }
  }

  // If still no access token and we have a userId, try to get stored token from database
  if (!accessToken && userId) {
    try {
      tokenDebugInfo.push('Trying to get token from database');
      const { data: accessData, error: accessError } = await supabase
        .from('google_drive_access')
        .select('access_token, refresh_token')
        .eq('user_id', userId)
        .maybeSingle()

      if (accessError) {
        console.error(`Failed to get stored Google Drive access: ${accessError.message}`)
        tokenDebugInfo.push(`Database error: ${accessError.message}`);
      } else if (accessData?.access_token) {
        accessToken = accessData.access_token
        refreshToken = accessData.refresh_token
        tokenSource = 'database stored token'
        tokenDebugInfo.push('Successfully retrieved token from database');
        console.log('Using access token from database')
      } else {
        tokenDebugInfo.push('No token found in database');
      }
    } catch (dbError) {
      console.error('Database error while retrieving token:', dbError.message)
      tokenDebugInfo.push(`Database retrieval error: ${dbError.message}`);
    }
  }

  if (!accessToken) {
    console.error('No Google Drive access token found from any source')
    console.error('Token debug info:', tokenDebugInfo.join('; '));
    throw new Error(`No Google Drive access token found. Debug info: ${tokenDebugInfo.join('; ')}`)
  }
  
  console.log(`Using access token from ${tokenSource}`)

  // Call Google Drive API to search for files
  try {
    console.log('Validating token before API call');
    // Validate the token by making a simple API call first
    const validationResponse = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + accessToken);
    
    if (!validationResponse.ok) {
      const validationErrorText = await validationResponse.text();
      console.error(`Token validation failed: ${validationErrorText}`);
      tokenDebugInfo.push(`Token validation failed: ${validationErrorText}`);
      
      // If we have a refresh token, we could try to refresh here
      // This would require additional implementation
      
      throw new Error(`Invalid Google Drive token. Validation failed: ${validationResponse.status} ${validationResponse.statusText}`);
    }
    
    const validationData = await validationResponse.json();
    console.log('Token validation response:', JSON.stringify(validationData));
    
    if (!validationData.scope || !validationData.scope.includes('drive')) {
      console.error('Token does not have required Drive scopes:', validationData.scope);
      throw new Error(`Google Drive token lacks required scopes. Has: ${validationData.scope}`);
    }
    
    // FIXED: Removed the fullText search and orderBy parameter that were causing the 403 error
    const searchParams = new URLSearchParams({
      fields: 'files(id,name,mimeType,description,webViewLink)'
    })
    
    console.log('Making request to Google Drive API with token');
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Google Drive API error (${response.status}): ${errorText}`)
      
      // Additional debugging for common errors
      if (response.status === 401) {
        console.error('Token is unauthorized (401). Token may be expired or invalid.');
        tokenDebugInfo.push('Token is unauthorized (401).');
      } else if (response.status === 403) {
        console.error('Permission denied (403). Token may not have sufficient scope.');
        tokenDebugInfo.push('Permission denied (403).');
      }
      
      throw new Error(`Google Drive API error: ${response.statusText} (${response.status}) - ${errorText}`)
    }

    const data = await response.json()
    console.log(`Google Drive API returned ${data.files?.length || 0} files`);
    
    if (!data.files || data.files.length === 0) {
      console.log('No files found matching the query. This could be due to:');
      console.log('1. No matching files exist');
      console.log('2. Token does not have permission to access files');
      console.log('3. Search query did not match any content');
    }
    
    // For the most relevant files, also fetch their content
    const relevantFiles = data.files?.slice(0, 3) || []
    const filesWithContent = await Promise.all(
      relevantFiles.map(async (file) => {
        if (file.mimeType === 'application/vnd.google-apps.document' || 
            file.mimeType === 'text/plain') {
          try {
            console.log(`Fetching content for file: ${file.name} (${file.id})`);
            const contentResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            })
            
            if (contentResponse.ok) {
              const content = await contentResponse.text()
              return { ...file, content: content.substring(0, 5000) } // Limit content size
            } else {
              console.error(`Error fetching content for file ${file.id}: ${contentResponse.status} ${contentResponse.statusText}`)
              
              if (contentResponse.status === 403) {
                console.error('Permission denied for file content. This may be due to insufficient scopes.');
              }
            }
          } catch (error) {
            console.error(`Error fetching content for file ${file.id}:`, error)
          }
        }
        return file
      })
    )

    return filesWithContent
  } catch (error) {
    console.error('Error in searchGoogleDrive:', error)
    throw error
  }
}

// Function to search the web using Tavily API
async function searchWeb(query) {
  if (!TAVILY_API_KEY) {
    console.error('TAVILY_API_KEY is not configured!')
    return [] // Return empty results rather than failing
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
      include_answer: true,
      include_images: false,
      max_results: 5,
    })
  })

  if (!response.ok) {
    throw new Error(`Tavily API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.results || []
}

// Function to synthesize information using OpenAI
async function synthesizeWithAI(query, sources, conversationHistory) {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key is not configured!')
    throw new Error('OPENAI_API_KEY not configured')
  }

  // Format sources for prompt context
  let sourceContext = ''

  // Add Drive results
  const driveSource = sources.find(s => s.source === 'google_drive')
  if (driveSource?.results?.length > 0) {
    sourceContext += 'Google Drive documents:\n\n'
    driveSource.results.forEach((file, index) => {
      sourceContext += `Document ${index + 1}: "${file.name}"\n`
      if (file.content) {
        sourceContext += `Content: ${file.content.substring(0, 2000)}${file.content.length > 2000 ? '...' : ''}\n\n`
      } else {
        sourceContext += `No content available (${file.mimeType})\n\n`
      }
    })
  } else if (driveSource?.error) {
    sourceContext += `Google Drive search error: ${driveSource.error}\n\n`
    if (driveSource.details) {
      sourceContext += `Error details: ${driveSource.details}\n\n`
    }
  }

  // Add web search results
  const webSource = sources.find(s => s.source === 'web_search')
  if (webSource?.results?.length > 0) {
    sourceContext += 'Web search results:\n\n'
    webSource.results.forEach((result, index) => {
      sourceContext += `Result ${index + 1}: "${result.title}"\n`
      sourceContext += `URL: ${result.url}\n`
      sourceContext += `Content: ${result.content || result.snippet || 'No content available'}\n\n`
    })
  } else if (webSource?.error) {
    sourceContext += `Web search error: ${webSource.error}\n\n`
  }

  // Build conversation history
  const messages = [
    {
      role: "system",
      content: `You are a helpful assistant working for TheGig.Agency team. Your job is to help answer questions using information from Google Drive documents and web search results. Be as helpful, accurate, and detailed as possible. When referencing information, always cite your sources (e.g., "According to Document 1..." or "Based on the web search result from [source]..."). If you don't know something or the information isn't in the provided context, admit that you don't know rather than making up an answer. If there are errors accessing Google Drive, explain clearly what the issue is and suggest solutions like checking permissions or re-authorizing Google Drive access.`
    }
  ]

  // Add conversation history (previous messages)
  if (conversationHistory.length > 0) {
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      })
    })
  }

  // Add the current query with context
  messages.push({
    role: "user",
    content: `Question: ${query}\n\nHere is relevant information to help you answer:\n\n${sourceContext}`
  })

  console.log('Sending request to OpenAI API - model: gpt-4o')
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.3,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error response:', errorText)
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Successfully received response from OpenAI')
    return data.choices[0].message.content
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    throw new Error(`OpenAI API call failed: ${error.message}`)
  }
}
