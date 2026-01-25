import { errMsg } from "../../_shared/error.ts";
import type { AgentResult } from "../../_shared/types.ts";
import { buildContextFromResults } from "../utils/contextBuilder.ts";

// Function to synthesize results with OpenAI
export async function synthesizeWithAI(
  query: string, 
  results: AgentResult[], 
  conversation_history: unknown[], 
  previous_state: Record<string, unknown> | null = null
): Promise<string> {
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    
    console.log("Preparing context for AI synthesis");
    
    // Prepare context from results
    const context = buildContextFromResults(results, previous_state);
    
    // Check if we have list-related operations in the query
    const isListQuery = query.toLowerCase().includes('list') || 
                       (previous_state && Array.isArray(previous_state.lists) && previous_state.lists.length > 0);
    
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
      const repoNames = repoResult.results!.slice(0, 10).map((r) => (r as Record<string, unknown>).repo_name).join(', ');
      
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

You are a FACTUAL DATABASE QUERY INTERFACE. You may ONLY use facts explicitly present in the provided repo_map data (including Domain Summaries). Do NOT use general knowledge about software, marketing, or creator licensing.

You have access to REAL METADATA for ${repoCount} repositories. Some examples: ${repoNames}

FOR REPO/CODEBASE QUESTIONS:
1) Identify the repo(s) being asked about. Match repos by exact name OR close match (e.g., "licensed creator" matches "creator-licensing-hub").
2) If a repo has a Domain Summary, treat it as the PRIMARY source of truth.
3) Add ONLY concrete repo facts from the data: edge functions, tables, integrations, entrypoints, origins, API routes.
4) If upstream/downstream dependencies or change warnings appear in the Domain Summary, include them.
5) If the requested info is not present in the repo_map data, say: "Not found in repo_map."

RESPONSE FORMAT for: "What does <repo> do?"
- This repo exists to: <verbatim from Domain Summary if present>
- Primary flows: <bullets from Domain Summary if present>
- Key facts: <functions / tables / integrations>
- Change impact warnings: <from Domain Summary if present>
- If Domain Summary missing: answer using ONLY metadata; explicitly say "Domain Summary not available."

Be terse but complete. Domain Summary is authoritative when present.`;
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
