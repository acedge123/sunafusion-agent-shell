import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { errMsg } from "../_shared/error.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type = 'static' } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Use the correct Imagen 3.0 endpoint
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage';

    const requestBody = {
      prompt: {
        text: prompt
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_LOW_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_LOW_AND_ABOVE"
        }
      ],
      personGeneration: "ALLOW_ADULT",
      aspectRatio: "ASPECT_RATIO_1_1"
    };

    // Note: Video generation might not be available in Imagen 3.0
    // For now, we'll generate static images only
    if (type === 'video') {
      return new Response(
        JSON.stringify({ error: 'Video generation is not currently supported' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Calling Gemini Imagen API with:', { prompt, type, endpoint });

    const response = await fetch(`${endpoint}?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('Gemini API response status:', response.status);
    console.log('Gemini API response:', responseText);

    if (!response.ok) {
      console.error('Gemini API error:', responseText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate image',
          details: responseText,
          status: response.status
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini API response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from Gemini API',
          details: 'Failed to parse JSON response'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Gemini API response received successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        data: data,
        type: type
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in imagen-generator function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: errMsg(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
