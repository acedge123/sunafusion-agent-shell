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
    
    // Detect if this is a repo/codebase question
    const queryLower = query.toLowerCase();
    
    // Meta questions = asking about the codebase in general, not a specific repo
    const isMetaQuestion = [
      'understand', 'know about', 'tell me about', 'overview', 'summary',
      'what repos', 'all repos', 'our repos', 'the repos', 'list repos',
      'codebase', 'our code', 'the code', 'systems we have', 'what do we have'
    ].some(phrase => queryLower.includes(phrase));
    
    const isRepoQuestion = isMetaQuestion || [
      'repo', 'repository', 'function', 'edge function',
      'integration', 'table', 'schema', 'where is', 'what handles', 'which repo',
      'how does', 'what owns', 'licensing', 'creator', 'hub', 'marketplace',
      'supabase', 'stack', 'architecture', 'system'
    ].some(keyword => queryLower.includes(keyword));
    
    // Check if we have repo data in the results
    const repoResult = results.find(r => r.source === "repo_map");
    const hasRepoData = repoResult && repoResult.results && repoResult.results.length > 0;
    const repoCount = hasRepoData ? repoResult.results.length : 0;
    
    // Core instruction for all responses
    const coreInstruction = "Be brief. Be bright. And be gone.";
    
    // Build strict system message
    let systemMessage: string;
    
    // CRITICAL: Enforce strict grounding for repo questions
    if (isRepoQuestion && hasRepoData) {
      // Extract repo names for explicit grounding
      const repoNames = repoResult.results.slice(0, 10).map((r: Record<string, unknown>) => r.repo_name).join(', ');
      
      // Different prompt for meta questions vs specific searches
      if (isMetaQuestion) {
        systemMessage = `${coreInstruction}

You are a CODEBASE NAVIGATOR. The user wants an overview of the organization's repositories.

You have access to REAL METADATA for ${repoCount} repositories.

FOR META/OVERVIEW QUESTIONS ("do you understand the codebase", "tell me about the repos", etc.):
1. Confirm: "Yes, I have metadata for ${repoCount} repositories."
2. Give a quick categorized summary (group by purpose if apparent from names)
3. Offer to dive deeper into any specific area

Keep it brief - a few bullet points or a short list. Don't dump everything.

Available repos include: ${repoNames}`;
      } else {
        systemMessage = `${coreInstruction}

You are a FACTUAL DATABASE QUERY INTERFACE. You ONLY report facts from the provided data.

CRITICAL CONSTRAINT: You are FORBIDDEN from providing general definitions, industry explanations, or conceptual overviews.

You have access to REAL METADATA for ${repoCount} repositories. Some examples: ${repoNames}

WHEN THE USER ASKS ABOUT SPECIFIC REPOS, CODE, OR SYSTEMS:
1. FIRST: Identify which repos in the AVAILABLE REPOSITORIES section match their query
2. SECOND: List ONLY the concrete facts from that data:
   - Repo name
   - Edge functions (by name)
   - Database tables (by name)  
   - Integrations (by name)
3. THIRD: If asked about purpose, infer ONLY from the function/table names - do not explain industry concepts

FORBIDDEN RESPONSES:
- "Creator licensing is a marketing strategy that allows brands to..."
- "The term X refers to content creators who..."
- Any definition or explanation not derived from repo_map data

Be terse. List facts. No fluff.`;
      }
    } else if (isRepoQuestion && !hasRepoData) {
      systemMessage = `${coreInstruction}

You are a FACTUAL DATABASE QUERY INTERFACE. 
      
The user is asking about repositories/code, but the repo_map search returned no results.

REQUIRED RESPONSE:
"I searched the repo_map but found no repositories matching '[user query term]'. 
To help you, I need more context - are you looking for a specific repo name, an integration, or a feature?"

DO NOT provide general definitions or industry explanations.`;
    } else {
      // Non-repo questions - standard helpful mode
      systemMessage = `${coreInstruction}

You are a helpful AI assistant with access to:
- Web search results (external info)
- Google Drive files (documents)
- Creator IQ API (campaigns, publishers, lists)
- Slack messages
- Repository metadata (${repoCount} repos available)

Answer the user's question based on the context provided. Be specific and cite actual data.`;
      
      if (isListQuery) {
        systemMessage += ' When working with lists in Creator IQ, pay special attention to list names and IDs.';
      }
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
        temperature: isRepoQuestion ? 0.1 : 0.5 // Very low temp for factual repo queries
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
