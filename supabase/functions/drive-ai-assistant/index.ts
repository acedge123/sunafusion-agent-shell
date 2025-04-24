
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = "https://nljlsqgldgmxlbylqazg.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Cache to reduce API token validation calls
const tokenValidationCache = new Map<string, {
  isValid: boolean,
  scopes: string[],
  expires: number
}>()

const CACHE_VALIDITY_MS = 5 * 60 * 1000 // 5 minutes

// Required scopes for full Drive functionality
const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.file'
]

async function validateGoogleToken(token: string): Promise<{ isValid: boolean, scopes: string[] }> {
  try {
    // Check cache first
    const cachedValidation = tokenValidationCache.get(token)
    if (cachedValidation && cachedValidation.expires > Date.now()) {
      console.log("Using cached token validation result")
      return { 
        isValid: cachedValidation.isValid, 
        scopes: cachedValidation.scopes 
      }
    }
    
    console.log("Validating Google token with tokeninfo endpoint")
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`)
    
    if (!response.ok) {
      console.error(`Token validation failed: ${response.status} ${response.statusText}`)
      tokenValidationCache.set(token, { 
        isValid: false, 
        scopes: [], 
        expires: Date.now() + CACHE_VALIDITY_MS 
      })
      return { isValid: false, scopes: [] }
    }
    
    const data = await response.json()
    
    if (!data.scope) {
      console.error("Token has no scopes defined")
      tokenValidationCache.set(token, { 
        isValid: false, 
        scopes: [], 
        expires: Date.now() + CACHE_VALIDITY_MS 
      })
      return { isValid: false, scopes: [] }
    }
    
    const scopes = data.scope.split(' ')
    
    // Check for required scopes
    const hasAllRequiredScopes = REQUIRED_SCOPES.every(requiredScope => 
      scopes.some(scope => scope.includes(requiredScope))
    )
    
    console.log(`Token validation: isValid=${hasAllRequiredScopes}, scopes=${scopes.join(',')}`)
    
    // Cache the result
    tokenValidationCache.set(token, {
      isValid: hasAllRequiredScopes,
      scopes,
      expires: Date.now() + CACHE_VALIDITY_MS
    })
    
    return { isValid: hasAllRequiredScopes, scopes }
  } catch (error) {
    console.error("Error validating token:", error)
    return { isValid: false, scopes: [] }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID()
  console.log(`[${requestId}] Request received`)
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Process regular API requests
    const requestData = await req.json()
    console.log(`[${requestId}] Request data:`, JSON.stringify(requestData, null, 2))
    
    const { action, fileId, provider_token, debug_token_info } = requestData
    const authHeader = req.headers.get('Authorization')
    
    console.log(`[${requestId}] Debug token info:`, debug_token_info || {})
    console.log(`[${requestId}] Provider token present:`, !!provider_token)
    console.log(`[${requestId}] Auth header present:`, !!authHeader)
    
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user from the auth header
    console.log(`[${requestId}] Getting user from auth header`)
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) {
      console.error(`[${requestId}] User auth error:`, userError)
      throw new Error('Unauthorized')
    }
    console.log(`[${requestId}] User authenticated: ${user.id}`)

    // Get the user's Google access token
    console.log(`[${requestId}] Checking provider token`)
    if (!provider_token) {
      console.error(`[${requestId}] No provider token in request`)
      throw new Error('No Google Drive access token found. Please authenticate again.')
    }

    // Validate the token
    console.log(`[${requestId}] Validating Google token`)
    const { isValid, scopes } = await validateGoogleToken(provider_token)
    
    if (!isValid) {
      console.error(`[${requestId}] Token validation failed. Missing required scopes.`)
      throw new Error('Google Drive token is missing required permissions. Please reconnect your Google Drive account.')
    }
    
    console.log(`[${requestId}] Token validated successfully. Scopes: ${scopes.join(', ')}`)

    // Store the token in our database for future use
    console.log(`[${requestId}] Storing token in database`)
    const { error: upsertError } = await supabase
      .from('google_drive_access')
      .upsert({
        user_id: user.id,
        access_token: provider_token,
        updated_at: new Date().toISOString(),
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
      }, {
        onConflict: 'user_id'
      })
    
    if (upsertError) {
      console.error(`[${requestId}] Error storing token:`, upsertError)
    } else {
      console.log(`[${requestId}] Token stored successfully`)
    }

    // Call Google Drive API
    console.log(`[${requestId}] Fetching file ${fileId} from Google Drive`)
    const driveResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${provider_token}`,
      },
    })

    if (!driveResponse.ok) {
      const errorText = await driveResponse.text()
      console.error(`[${requestId}] Drive API error: ${driveResponse.status} ${driveResponse.statusText}`)
      console.error(`[${requestId}] Drive API error details:`, errorText)
      throw new Error(`Failed to fetch file from Google Drive: ${driveResponse.status} ${driveResponse.statusText}`)
    }

    const fileContent = await driveResponse.text()
    console.log(`[${requestId}] File fetched successfully, content length: ${fileContent.length}`)

    // Process with OpenAI
    if (!OPENAI_API_KEY) {
      console.error(`[${requestId}] OPENAI_API_KEY not configured`)
      throw new Error('OpenAI API key is not configured')
    }
    
    console.log(`[${requestId}] Sending content to OpenAI for analysis`)
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes documents and helps users understand them better.'
          },
          {
            role: 'user',
            content: `${action}\n\nDocument content:\n${fileContent}`
          }
        ],
      })
    })

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error(`[${requestId}] OpenAI API error: ${openAIResponse.status} ${openAIResponse.statusText}`)
      console.error(`[${requestId}] OpenAI error details:`, errorText)
      throw new Error(`OpenAI API error: ${openAIResponse.status} ${openAIResponse.statusText}`)
    }

    const aiResult = await openAIResponse.json()
    console.log(`[${requestId}] Analysis completed successfully`)
    
    return new Response(
      JSON.stringify({
        result: aiResult.choices[0].message.content,
        request_id: requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error(`[${requestId}] Error in drive-ai-assistant function:`, error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to analyze file",
        request_id: requestId
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
