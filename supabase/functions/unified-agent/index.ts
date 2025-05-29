import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/corsUtils.ts";
import { searchWeb } from "./sources/webSearch.ts";
import { searchGoogleDrive } from "./sources/googleDrive.ts";
import { searchCreatorIQ } from "./sources/creatorIQ.ts";
import { searchProductFeeds } from "./sources/productFeeds.ts";
import { synthesizeWithAI } from "./agent/aiSynthesis.ts";
import { runAgentTask } from "./agent/taskRunner.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      query, 
      conversation_history = [], 
      include_web = false, 
      include_drive = false, 
      include_product_feeds = false,
      include_creator_iq = false,
      provider_token = null,
      task_mode = false,
      tools = [],
      allow_iterations = true,
      max_iterations = 3,
      reasoning_level = "medium"
    } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing query:', query);
    console.log('Includes - Web:', include_web, 'Drive:', include_drive, 'Product Feeds:', include_product_feeds, 'Creator IQ:', include_creator_iq);

    // Get auth token from the request
    const authToken = req.headers.get('Authorization')?.replace('Bearer ', '');

    // Collect results from different sources
    const results: any[] = [];
    
    // Search web if requested
    if (include_web) {
      console.log('Searching web...');
      const webResults = await searchWeb(query);
      results.push(webResults);
    }

    // Search Google Drive if requested and token is available
    if (include_drive && provider_token) {
      console.log('Searching Google Drive...');
      const driveResults = await searchGoogleDrive(query, provider_token);
      results.push(driveResults);
    }

    // Search Product Feeds if requested
    if (include_product_feeds) {
      console.log('Searching product feeds...');
      const productFeedResults = await searchProductFeeds(query, authToken);
      results.push(productFeedResults);
    }

    // Search Creator IQ if requested
    if (include_creator_iq) {
      console.log('Searching Creator IQ...');
      const creatorIQResults = await searchCreatorIQ(query, authToken);
      results.push(creatorIQResults);
    }

    // If task mode is enabled, use the task runner
    if (task_mode) {
      console.log('Running in task mode with tools:', tools);
      const taskResult = await runAgentTask(
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
          ...taskResult,
          sources: results
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Otherwise, use regular AI synthesis
    const answer = await synthesizeWithAI(query, results, conversation_history);

    return new Response(
      JSON.stringify({
        answer,
        sources: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in unified-agent:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
