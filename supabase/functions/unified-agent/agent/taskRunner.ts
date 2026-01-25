/**
 * @deprecated Use iterativeTaskRunner.ts instead - this uses legacy OpenAI endpoints
 * Kept for reference only - should not be called in production
 */

import { errMsg } from "../../_shared/error.ts";
import type { AgentResult, TaskResult } from "../../_shared/types.ts";

// Function to execute an agent task with more advanced capabilities
export async function runAgentTask(
  query: string, 
  results: AgentResult[], 
  conversation_history: unknown[] = [], 
  tools: string[] = [], 
  allow_iterations = true, 
  max_iterations = 3, 
  reasoning_level = "medium"
): Promise<TaskResult> {
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    
    console.log(`Running agent task for query: "${query}"`);
    console.log(`Tools enabled: ${tools.join(', ')}`);
    console.log(`Reasoning level: ${reasoning_level}`);
    
    // Import the context builder
    const { buildContextFromResults } = await import('../utils/contextBuilder.ts');
    
    // Prepare the initial context
    const initialContext = buildContextFromResults(results);
    
    // Configure the reasoning prompt based on the reasoning level
    let reasoningPrompt = "";
    switch(reasoning_level) {
      case "high":
        reasoningPrompt = "Explain your reasoning process in detail. Consider multiple perspectives, evaluate evidence critically, and justify your conclusions thoroughly.";
        break;
      case "medium":
        reasoningPrompt = "Explain your key reasoning steps clearly. Share how you evaluated the information to reach your conclusions.";
        break;
      case "low":
        reasoningPrompt = "Provide minimal explanation of your reasoning process, focusing primarily on your conclusion.";
        break;
      default:
        reasoningPrompt = "Explain your key reasoning steps clearly. Share how you evaluated the information to reach your conclusions.";
    }
    
    // Make the request to OpenAI
    const response = await getAgentResponse(query, initialContext, tools, reasoningPrompt);
    
    return response;
  } catch (error) {
    console.error("Error in runAgentTask:", error);
    return {
      answer: `I encountered an error while trying to process your task: ${errMsg(error)}. Please try again or contact support if the issue persists.`,
      reasoning: "An error occurred during processing.",
      steps: [],
      tools_used: []
    };
  }
}

// Helper function to get an agent response from OpenAI
export async function getAgentResponse(
  query: string, 
  context: string, 
  tools: string[], 
  reasoningPrompt: string
): Promise<TaskResult> {
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    console.log("Getting agent response from OpenAI");
    
    // Build system prompt
    const systemPrompt = `You are an advanced AI agent capable of solving complex tasks using multiple tools.
${reasoningPrompt}

Available tools: ${tools.join(', ')}

For your response, format it as follows:
1. REASONING: Explain your thought process
2. STEPS_TAKEN: List the steps you took to solve the problem, numbered
3. ANSWER: Provide your final answer to the user's query
4. TOOLS_USED: List which tools you used

Base your response only on the provided context information. If you don't have enough information to answer confidently, say so clearly.`;
    
    // Build user prompt
    const userPrompt = `Task: ${query}

Context information:
${context}

Remember to format your response according to the instructions.`;
    
    // Make the API request
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }
    
    const data = await response.json();
    const responseText = data.choices[0].message.content;
    
    // Parse the structured response
    const parsed = parseStructuredResponse(responseText);
    
    return parsed;
  } catch (error) {
    console.error("Error in getAgentResponse:", error);
    throw error;
  }
}

// Helper function to parse the structured response from the agent
export function parseStructuredResponse(responseText: string): TaskResult {
  // Default structure
  const result: TaskResult = {
    reasoning: "",
    steps: [],
    answer: "",
    tools_used: []
  };
  
  try {
    // Extract reasoning
    const reasoningMatch = responseText.match(/REASONING:(.*?)(?:STEPS_TAKEN:|ANSWER:|TOOLS_USED:|$)/s);
    if (reasoningMatch) {
      result.reasoning = reasoningMatch[1].trim();
    }
    
    // Extract steps taken
    const stepsMatch = responseText.match(/STEPS_TAKEN:(.*?)(?:ANSWER:|TOOLS_USED:|$)/s);
    if (stepsMatch) {
      const stepsText = stepsMatch[1].trim();
      const stepLines = stepsText.split('\n').filter((line: string) => line.trim());
      
      // Parse steps with numbers and descriptions
      for (const line of stepLines) {
        const stepMatch = line.match(/(\d+)[\.\)\]]+\s*(.*)/);
        if (stepMatch) {
          result.steps.push({
            step: parseInt(stepMatch[1], 10),
            action: stepMatch[2].trim(),
            result: "" // We don't have results for individual steps in this format
          });
        } else if (result.steps.length > 0) {
          // Append to the previous step's action if it's a continuation
          result.steps[result.steps.length - 1].action += " " + line.trim();
        }
      }
    }
    
    // Extract answer
    const answerMatch = responseText.match(/ANSWER:(.*?)(?:TOOLS_USED:|$)/s);
    if (answerMatch) {
      result.answer = answerMatch[1].trim();
    } else {
      // If we can't find an explicit ANSWER section, use the entire response as the answer
      result.answer = responseText.trim();
    }
    
    // Extract tools used
    const toolsMatch = responseText.match(/TOOLS_USED:(.*?)$/s);
    if (toolsMatch) {
      const toolsText = toolsMatch[1].trim();
      // Split by commas, newlines, or bullet points and clean up
      result.tools_used = toolsText
        .split(/[,\n•\-]+/)
        .map((tool: string) => tool.trim())
        .filter((tool: string) => tool.length > 0);
    }
    
    return result;
  } catch (error) {
    console.error("Error parsing structured response:", error);
    return {
      reasoning: "Error parsing response.",
      steps: [],
      answer: responseText, // Return the full text as the answer in case of parsing errors
      tools_used: []
    };
  }
}
