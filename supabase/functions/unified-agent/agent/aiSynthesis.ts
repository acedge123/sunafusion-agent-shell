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
    const isRepoQuestion = [
      'repo', 'repository', 'codebase', 'code', 'function', 'edge function',
      'integration', 'table', 'schema', 'where is', 'what handles', 'which repo',
      'how does', 'what owns', 'licensing', 'creator', 'hub', 'marketplace',
      'supabase', 'stack', 'architecture', 'system'
    ].some(keyword => queryLower.includes(keyword));
    
    // Check if we have repo data in the results
    const repoResult = results.find(r => r.source === "repo_map");
    const hasRepoData = repoResult && repoResult.results && repoResult.results.length > 0;
    const repoCount = hasRepoData ? repoResult.results.length : 0;
    
    // Build strict system message
    let systemMessage = `You are an INTERNAL SYSTEM OPERATOR for this organization's codebase. You have access to:
- Web search results (external info)
- Google Drive files (documents)
- Creator IQ API (campaigns, publishers, lists)
- Slack messages
- Repository metadata (${repoCount} repos loaded)`;

    // CRITICAL: Enforce strict grounding for repo questions
    if (isRepoQuestion && hasRepoData) {
      systemMessage += `

## STRICT GROUNDING RULES (YOU MUST FOLLOW THESE):
1. You have REAL DATA about ${repoCount} repositories in the AVAILABLE REPOSITORIES section
2. Answer ONLY using facts from the retrieved repo_map data
3. DO NOT explain general industry concepts or definitions
4. DO NOT speculate about what systems "might" do
5. Cite specific repos, edge functions, tables, and integrations BY NAME from the data
6. If something is NOT in the repo_map results, say "not found in repo data"
7. If the user's question is ambiguous (e.g., "licensed creator"), first clarify what repos match, then describe their actual purpose based on the data

## ANSWER FORMAT FOR REPO QUESTIONS:
- Start with the specific repo(s) that match
- List concrete facts: edge functions, tables, integrations
- Show relationships to other repos if relevant
- Be terse and factual, not explanatory`;
    } else if (isRepoQuestion && !hasRepoData) {
      // No repo data but asking about repos - be explicit
      systemMessage += `

## IMPORTANT: 
The user is asking about repositories/code, but no matching repo data was found.
- Say explicitly: "I don't see repos matching [X] in the repo_map data"
- List what repos ARE available if relevant
- Ask for clarification if the question is ambiguous
- DO NOT invent or speculate about repos that aren't in the data`;
    }
    
    systemMessage += `

Answer the user's question based ONLY on the context provided. Be specific and cite actual data.`;
    
    // Add list-specific guidance if this appears to be a list-related query
    if (isListQuery) {
      systemMessage += ' When working with lists in Creator IQ, pay special attention to list names and IDs.';
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
