
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
    const { query, conversation_history = [], include_web = true, include_drive = true } = await req.json()
    
    if (!query) {
      throw new Error('Query is required')
    }

    // Extract the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    // Get user ID from auth token
    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    if (userError || !userData.user) {
      throw new Error('Invalid user token')
    }
    const userId = userData.user.id

    // Get the user's provider tokens if available
    const { data: sessionData } = await supabase.auth.getSession(token)
    const providerToken = sessionData?.session?.provider_token

    // Initialize results array to store information from different sources
    const results = []
    
    // 1. Search Google Drive if requested
    if (include_drive) {
      try {
        console.log(`Starting Google Drive search for user: ${userId}`)
        const driveResults = await searchGoogleDrive(supabase, userId, query, providerToken)
        console.log(`Google Drive search returned ${driveResults.length} results`)
        results.push({
          source: "google_drive",
          results: driveResults
        })
      } catch (error) {
        console.error("Google Drive search error:", error)
        results.push({
          source: "google_drive",
          error: error.message || "Failed to search Google Drive"
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

// Function to search Google Drive
async function searchGoogleDrive(supabase, userId, query, providerToken) {
  let accessToken = providerToken;

  // If no provider token is available, fall back to stored token
  if (!accessToken) {
    // Get the user's Google Drive access token
    const { data: accessData, error: accessError } = await supabase
      .from('google_drive_access')
      .select('access_token')
      .eq('user_id', userId)
      .maybeSingle()

    if (accessError) {
      throw new Error(`Failed to get Google Drive access: ${accessError.message}`)
    }

    if (!accessData?.access_token) {
      throw new Error('No Google Drive access token found')
    }
    
    accessToken = accessData.access_token;
  }

  // Call Google Drive API to search for files
  const searchParams = new URLSearchParams({
    q: `fullText contains '${query}'`,
    fields: 'files(id,name,mimeType,description,webViewLink)',
    orderBy: 'recency desc',
  })
  
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${searchParams}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`Google Drive API error: ${response.statusText}`)
  }

  const data = await response.json()
  
  // For the most relevant files, also fetch their content
  const relevantFiles = data.files?.slice(0, 3) || []
  const filesWithContent = await Promise.all(
    relevantFiles.map(async (file) => {
      if (file.mimeType === 'application/vnd.google-apps.document' || 
          file.mimeType === 'text/plain') {
        try {
          const contentResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
          
          if (contentResponse.ok) {
            const content = await contentResponse.text()
            return { ...file, content: content.substring(0, 5000) } // Limit content size
          }
        } catch (error) {
          console.error(`Error fetching content for file ${file.id}:`, error)
        }
      }
      return file
    })
  )

  return filesWithContent
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
      content: `You are a helpful assistant working for TheGig.Agency team. Your job is to help answer questions using information from Google Drive documents and web search results. Be as helpful, accurate, and detailed as possible. When referencing information, always cite your sources (e.g., "According to Document 1..." or "Based on the web search result from [source]..."). If you don't know something or the information isn't in the provided context, admit that you don't know rather than making up an answer.`
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
