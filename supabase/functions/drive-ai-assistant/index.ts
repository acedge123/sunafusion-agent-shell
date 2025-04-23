
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = "https://nljlsqgldgmxlbylqazg.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const REDIRECT_URI = Deno.env.get('REDIRECT_URI') || 'https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/drive-ai-assistant/callback'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const url = new URL(req.url)
    const path = url.pathname.split('/').filter(Boolean).pop()
    
    // Handle OAuth callback
    if (path === 'callback') {
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')
      
      if (!code) {
        throw new Error('No authorization code received')
      }
      
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID || '',
          client_secret: GOOGLE_CLIENT_SECRET || '',
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      })
      
      const tokenData = await tokenResponse.json()
      
      if (!tokenData.access_token) {
        throw new Error('Failed to get access token')
      }
      
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        // Since this is a callback, we may not have auth header
        // Use state as user ID if present, otherwise redirect to login
        if (!state) {
          return new Response(
            `<html><body><script>window.location.href = '/'</script></body></html>`,
            { headers: { 'Content-Type': 'text/html' } }
          )
        }
      }
      
      // Try to get user from auth header or state parameter
      let user
      if (authHeader) {
        const { data, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
        if (error || !data.user) {
          throw new Error('Invalid user token')
        }
        user = data.user
      } else if (state) {
        // State should contain user ID when we implement it fully
        user = { id: state }
      } else {
        throw new Error('No user identification available')
      }
      
      // Store tokens in database
      const { error: upsertError } = await supabase
        .from('google_drive_access')
        .upsert({
          user_id: user.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        })
      
      if (upsertError) {
        throw new Error(`Failed to store access token: ${upsertError.message}`)
      }
      
      // Redirect back to app
      return new Response(
        `<html><body><script>window.location.href = '/drive'</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    // Process regular API requests
    const { action, fileId } = await req.json()
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) throw new Error('Unauthorized')

    // Handle get auth URL action
    if (action === "getAuthUrl") {
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('GOOGLE_CLIENT_ID not configured')
      }
      
      // Create OAuth URL for Google
      const scopes = [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
      ]
      
      const authUrl = new URL('https://accounts.google.com/o/oauth2/auth')
      authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', scopes.join(' '))
      authUrl.searchParams.set('access_type', 'offline')
      authUrl.searchParams.set('prompt', 'consent')
      authUrl.searchParams.set('state', user.id) // Pass user ID in state
      
      return new Response(
        JSON.stringify({ url: authUrl.toString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get the user's Google access token
    const { data: accessData, error: accessError } = await supabase
      .from('google_drive_access')
      .select('access_token')
      .eq('user_id', user.id)
      .single()

    if (accessError || !accessData?.access_token) {
      throw new Error('No Google Drive access token found')
    }

    // Call Google Drive API
    const driveResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${accessData.access_token}`,
      },
    })

    if (!driveResponse.ok) {
      throw new Error('Failed to fetch file from Google Drive')
    }

    const fileContent = await driveResponse.text()

    // Process with OpenAI
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

    const aiResult = await openAIResponse.json()
    
    return new Response(
      JSON.stringify({
        result: aiResult.choices[0].message.content,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in drive-ai-assistant function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
