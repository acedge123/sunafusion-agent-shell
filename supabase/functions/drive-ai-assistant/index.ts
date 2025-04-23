
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Process regular API requests
    const { action, fileId } = await req.json()
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) throw new Error('Unauthorized')

    // Get the user's Google access token from their provider token
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession(authHeader.replace('Bearer ', ''))
    if (sessionError) throw new Error('Session error: ' + sessionError.message)
    
    const providerToken = sessionData?.session?.provider_token
    if (!providerToken) {
      throw new Error('No Google Drive access token found. Please authenticate again.')
    }

    // Store the token in our database for future use
    const { error: upsertError } = await supabase
      .from('google_drive_access')
      .upsert({
        user_id: user.id,
        access_token: providerToken,
        updated_at: new Date().toISOString(),
      })
    
    if (upsertError) {
      console.error('Error storing token:', upsertError)
    }

    // Call Google Drive API
    const driveResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${providerToken}`,
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
