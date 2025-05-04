
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
    
    // Prepare messages for OpenAI API
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that can search the web, access Google Drive files, and query corporate data APIs like Creator IQ. Answer the user\'s question based on the context provided. If you cannot find the answer, say so clearly and provide your best suggestion.'
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
    
    console.log(`Sending ${messages.length} messages to OpenAI`);
    
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
    return `I encountered an error while trying to process your request: ${error.message}. Please try again or contact support if the issue persists.`;
  }
}
