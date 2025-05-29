import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/corsUtils.ts";
import { searchWeb } from "./sources/webSearch.ts";
import { searchGoogleDrive } from "./sources/googleDrive.ts";
import { searchCreatorIQ } from "./sources/creatorIQ/index.ts";
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
      try {
        const webResults = await searchWeb(query);
        results.push(webResults);
      } catch (error) {
        console.error('Web search error:', error);
        results.push({
          source: 'web',
          results: [],
          error: `Web search failed: ${error.message}`
        });
      }
    }

    // Search Google Drive if requested and token is available
    if (include_drive && provider_token) {
      console.log('Searching Google Drive...');
      try {
        const driveResults = await searchGoogleDrive(query, provider_token);
        results.push(driveResults);
      } catch (error) {
        console.error('Google Drive search error:', error);
        results.push({
          source: 'google_drive',
          results: [],
          error: `Google Drive search failed: ${error.message}`
        });
      }
    }

    // Search Product Feeds if requested
    if (include_product_feeds) {
      console.log('Searching product feeds...');
      try {
        const productFeedResults = await searchProductFeeds(query, authToken);
        results.push(productFeedResults);
      } catch (error) {
        console.error('Product feed search error:', error);
        results.push({
          source: 'product_feeds',
          results: [],
          error: `Product feed search failed: ${error.message}`
        });
      }
    }

    // Search Creator IQ if requested
    if (include_creator_iq) {
      console.log('Searching Creator IQ...');
      try {
        const creatorIQResults = await searchCreatorIQ(query, authToken);
        results.push(creatorIQResults);
      } catch (error) {
        console.error('Creator IQ search error:', error);
        results.push({
          source: 'creator_iq',
          results: [],
          error: `Creator IQ search failed: ${error.message}`
        });
      }
    }

    // If task mode is enabled, use the task runner
    if (task_mode) {
      console.log('Running in task mode with tools:', tools);
      try {
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
      } catch (error) {
        console.error('Task runner error:', error);
        return new Response(
          JSON.stringify({
            answer: `I encountered an error while processing your task: ${error.message}. Please try again or contact support if the issue persists.`,
            reasoning: "An error occurred during task processing.",
            steps: [],
            tools_used: tools,
            sources: results,
            error: error.message
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Otherwise, use regular AI synthesis
    try {
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
      console.error('AI synthesis error:', error);
      return new Response(
        JSON.stringify({
          answer: `I encountered an error while generating a response: ${error.message}. Please try again.`,
          sources: results,
          error: error.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in unified-agent:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An unexpected error occurred while processing your request.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
