
// Function to synthesize results with OpenAI
export async function synthesizeWithAI(query, results, conversation_history, previous_state = null) {
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
    const isListQuery = query.toLowerCase().includes('list') || 
                       (previous_state && previous_state.lists && previous_state.lists.length > 0);
    
    // Prepare system message with enhanced instructions for list operations
    let systemMessage = 'You are a helpful assistant that can search the web, access Google Drive files, and query corporate data APIs like Creator IQ. Answer the user\'s question based on the context provided. If you cannot find the answer, say so clearly and provide your best suggestion.';
    
    // Add list-specific guidance if this appears to be a list-related query
    if (isListQuery) {
      systemMessage += ' When working with lists in Creator IQ, pay special attention to list names and IDs. If a user asks to move publishers between lists or work with specific lists, ensure these lists exist in the provided context. If you find lists with names that closely match what the user is asking for, work with those. If you cannot find an exact match for a list name but find something similar, suggest using that instead.';
      
      // Add specific instructions about pagination and search
      systemMessage += ' Also, when searching for lists, make sure to check all available pages of results as the specific list may be on a later page. If a list is not found in the initial results, consider that it might exist on another page.';
    }
    
    // Prepare messages for OpenAI API
    const messages = [
      {
        role: 'system',
        content: systemMessage
      }
    ];
    
    // Add conversation history if available
    if (conversation_history && conversation_history.length > 0) {
      for (const msg of conversation_history) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
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
        model: 'gpt-4o-mini', // Use a more powerful model
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
    return `I encountered an error while trying to process your request: ${error.message}. Please try again or contact support if the issue persists.`;
  }
}
