
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    // Video generation is not supported in current Imagen API
    if (type === 'video') {
      return new Response(
        JSON.stringify({ error: 'Video generation is not currently supported by the Imagen API' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Use the Gemini API for image generation
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `Generate a detailed image description for an advertisement based on this prompt: ${prompt}. Make it professional and suitable for commercial use.`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    console.log('Calling Gemini API with:', { prompt, type, endpoint });

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
          error: 'Failed to generate content with Gemini API',
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

    // For now, return the generated text since Imagen 3.0 direct access might not be available
    // This gives users a detailed description they can use with other image generation tools
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Generated content not available';

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          candidates: [{
            generatedText: generatedText,
            description: "Generated detailed ad description (Imagen API not directly accessible)"
          }]
        },
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
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
