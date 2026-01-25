import { errMsg } from "../../_shared/error.ts";
import type { AgentResult } from "../../_shared/types.ts";

// Function to synthesize results with OpenAI
export async function synthesizeWithAI(
  query: string, 
  results: AgentResult[], 
  conversation_history: unknown[], 
  previous_state: unknown = null
): Promise<string> {
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    
    console.log("Preparing context for AI synthesis");
    
    // Import the context builder
    const { buildContextFromResults } = await import('../utils/contextBuilder.ts');
    
    // Prepare context from results
    const context = buildContextFromResults(results, previous_state);
    
    // Check if we have list-related operations in the query
    const prevState = previous_state as Record<string, unknown> | null;
    const isListQuery = query.toLowerCase().includes('list') || 
                       (prevState && Array.isArray(prevState.lists) && prevState.lists.length > 0);
    
    // Check if we have repo data in the results
    const hasRepoData = results.some(r => r.source === "repo_map" && r.results && r.results.length > 0);
    
    // Prepare system message with enhanced instructions
    let systemMessage = `You are a helpful AI assistant with access to:
- Web search results
- Google Drive files
- Creator IQ (campaigns, publishers, lists)
- Slack messages`;
    
    // Add explicit repo access instruction
    if (hasRepoData) {
      systemMessage += `
- FULL CODEBASE AWARENESS: You have direct access to metadata for the organization's repositories. The AVAILABLE REPOSITORIES section in the context contains real data about each repo, including:
  - Repository names and integrations (Shopify, CreatorIQ, etc.)
  - Edge functions deployed in each repo
  - Database tables owned by each repo
  - Tech stack information

When asked about repositories, code, integrations, or how systems connect, USE THE REPOSITORY DATA PROVIDED. Do NOT say you lack access - you have it. Analyze the data and provide specific, actionable insights.`;
    }
    
    systemMessage += `

Answer the user's question based on the context provided. Be specific and reference actual data from the context.`;
    
    // Add list-specific guidance if this appears to be a list-related query
    if (isListQuery) {
      systemMessage += ' When working with lists in Creator IQ, pay special attention to list names and IDs. If a user asks to move publishers between lists or work with specific lists, ensure these lists exist in the provided context.';
    }
    
    // Prepare messages for OpenAI API
    const messages: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content: systemMessage
      }
    ];
    
    // Add conversation history if available
    if (conversation_history && Array.isArray(conversation_history) && conversation_history.length > 0) {
      for (const msg of conversation_history) {
        const typedMsg = msg as Record<string, unknown>;
        if (typeof typedMsg.role === 'string' && typeof typedMsg.content === 'string') {
          messages.push({
            role: typedMsg.role === 'user' ? 'user' : 'assistant',
            content: typedMsg.content
          });
        }
      }
    }
    
    // Add the current query and context
    messages.push({
      role: 'user',
      content: `${query}\n\nContext information:\n${context}`
    });
    
    console.log(`Sending ${messages.length} messages to OpenAI with enhanced context for lists`);
    
    // Make the API request
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.5
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }
    
    const data = await response.json();
    const answer = data.choices[0].message.content;
    
    return answer;
  } catch (error) {
    console.error("Error in synthesizeWithAI:", error);
    return `I encountered an error while trying to process your request: ${errMsg(error)}. Please try again or contact support if the issue persists.`;
  }
}
