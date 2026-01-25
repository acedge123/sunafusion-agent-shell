// Iterative Task Runner - Implements the iterative loop with tool calling

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { tools, type ToolResult } from "./toolRegistry.ts";
import { executeTool } from "./toolExecutor.ts";
import { buildContextFromResults } from "../utils/contextBuilder.ts";
import { errMsg } from "../../_shared/error.ts";
import type { AgentResult } from "../../_shared/types.ts";

export interface IterativeTaskConfig {
  query: string;
  initialResults: AgentResult[];
  conversationHistory?: unknown[];
  maxIterations?: number;
  reasoningLevel?: string;
  previousState?: Record<string, unknown> | null;
}

export interface IterativeTaskResult {
  answer: string;
  reasoning: string;
  steps: Array<{
    iteration: number;
    action: string;
    tool_calls: string[];
    result: string;
  }>;
  tools_used: string[];
  iterations_used: number;
  total_data_fetched: unknown;
}

export async function runIterativeTask(config: IterativeTaskConfig): Promise<IterativeTaskResult> {
  const {
    query,
    initialResults,
    conversationHistory = [],
    maxIterations = 5,
    reasoningLevel = "medium",
    previousState = null
  } = config;

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    throw new Error('Lovable AI key is not configured - ensure Lovable Cloud is enabled');
  }

  console.log(`Starting iterative task with max ${maxIterations} iterations`);
  console.log(`Reasoning level: ${reasoningLevel}`);

  // Configure reasoning prompt
  let reasoningPrompt = "";
  switch(reasoningLevel) {
    case "high":
      reasoningPrompt = "Provide detailed reasoning for each decision. Explain why you chose specific tools and how you evaluated the results.";
      break;
    case "medium":
      reasoningPrompt = "Explain your key decisions and reasoning steps clearly.";
      break;
    case "low":
      reasoningPrompt = "Provide minimal reasoning, focus on results.";
      break;
    default:
      reasoningPrompt = "Explain your key decisions and reasoning steps clearly.";
  }

  // Build initial context
  let currentContext = buildContextFromResults(initialResults, previousState);
  const allData: AgentResult[] = [...initialResults];
  const steps: Array<{
    iteration: number;
    action: string;
    tool_calls: string[];
    result: string;
  }> = [];
  const toolsUsed = new Set<string>();

  // Prepare conversation messages
  const messages: Array<{ role: string; content?: string; tool_calls?: unknown[]; tool_call_id?: string; name?: string }> = [
    {
      role: "system",
      content: `You are an advanced AI agent with iterative tool-calling capabilities. You can call tools multiple times to gather complete information before answering.

${reasoningPrompt}

KEY CAPABILITIES:
1. **Pagination Awareness**: When you see "page 1 of 4" or "20 of 64 items", automatically fetch remaining pages
2. **Multi-step Reasoning**: Break complex tasks into steps, use tools iteratively
3. **Data Synthesis**: Combine information from multiple tool calls to provide comprehensive answers

IMPORTANT RULES:
- When you detect pagination (e.g., "showing 20 of 64"), ALWAYS use fetch_more_creator_iq_data to get remaining pages
- Continue calling tools until you have complete information
- Only provide your final answer when you're confident you have all necessary data
- If a task requires multiple steps, execute them sequentially using tool calls

Available tools: ${tools.map(t => t.function.name).join(", ")}`
    }
  ];

  // Add conversation history
  if (conversationHistory.length > 0) {
    for (const msg of conversationHistory) {
      const typedMsg = msg as Record<string, unknown>;
      if (typedMsg.role && typedMsg.content) {
        messages.push({
          role: typedMsg.role as string,
          content: typedMsg.content as string
        });
      }
    }
  }

  // Add the user query
  messages.push({
    role: "user",
    content: `Task: ${query}

Initial Context:
${currentContext}

Please analyze the information and use tools as needed to complete this task. Pay special attention to pagination - if you see partial results, fetch the complete dataset before answering.`
  });

  let iteration = 0;
  let shouldContinue = true;

  while (shouldContinue && iteration < maxIterations) {
    iteration++;
    console.log(`\n=== Iteration ${iteration}/${maxIterations} ===`);

    try {
      // Call Lovable AI Gateway with function calling
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LOVABLE_API_KEY}`
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: messages,
          tools: tools,
          tool_choice: "auto",
          temperature: 0.7
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded for Lovable AI. Please try again in a moment.');
        }
        if (response.status === 402) {
          throw new Error('Lovable AI credits depleted. Please add credits to your workspace.');
        }
        const errorData = await response.text();
        throw new Error(`Lovable AI error: ${errorData}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message;

      console.log(`Assistant message:`, JSON.stringify(assistantMessage, null, 2));

      // Check if the model wants to call tools
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log(`Model requested ${assistantMessage.tool_calls.length} tool call(s)`);

        // Add assistant message to conversation
        messages.push(assistantMessage);

        // Execute all tool calls
        const toolResults: ToolResult[] = [];
        const toolCallNames: string[] = [];

        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);
          
          console.log(`Executing tool: ${toolName}`);
          toolsUsed.add(toolName);
          toolCallNames.push(toolName);

          // Execute the tool
          const context = {
            all_data: allData,
            current_results: initialResults,
            previous_state: previousState,
            pagination: extractPaginationInfo(currentContext)
          };

          const result = await executeTool(toolName, toolArgs, context);

          // Store the result data
          const resultRecord = result as Record<string, unknown>;
          if (resultRecord.data) {
            allData.push(result as AgentResult);
          }

          // Add tool result to messages
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolName,
            content: JSON.stringify(result, null, 2)
          });
        }

        // Add all tool results to messages
        messages.push(...toolResults);

        // Record this step
        steps.push({
          iteration,
          action: `Called tools: ${toolCallNames.join(", ")}`,
          tool_calls: toolCallNames,
          result: `Executed ${toolCallNames.length} tool call(s)`
        });

        // Update context with new data
        currentContext = buildContextFromResults(allData, previousState);

      } else {
        // Model provided a final answer without tool calls
        console.log("Model provided final answer");
        shouldContinue = false;

        const finalAnswer = assistantMessage.content || "I was unable to generate a response.";

        // Extract reasoning if present
        let reasoning = "";
        const reasoningMatch = finalAnswer.match(/REASONING:(.*?)(?:ANSWER:|$)/s);
        if (reasoningMatch) {
          reasoning = reasoningMatch[1].trim();
        } else {
          reasoning = `Completed task in ${iteration} iteration(s)`;
        }

        return {
          answer: finalAnswer,
          reasoning: reasoning,
          steps: steps,
          tools_used: Array.from(toolsUsed),
          iterations_used: iteration,
          total_data_fetched: allData
        };
      }

    } catch (error) {
      console.error(`Error in iteration ${iteration}:`, error);
      
      return {
        answer: `Error during task execution: ${errMsg(error)}`,
        reasoning: `Failed at iteration ${iteration}: ${errMsg(error)}`,
        steps: steps,
        tools_used: Array.from(toolsUsed),
        iterations_used: iteration,
        total_data_fetched: allData
      };
    }
  }

  // Max iterations reached
  console.log(`Reached max iterations (${maxIterations})`);
  
  return {
    answer: "I reached the maximum number of iterations while processing your request. Here's what I found so far:\n\n" + 
            buildContextFromResults(allData, previousState),
    reasoning: `Reached maximum iterations (${maxIterations})`,
    steps: steps,
    tools_used: Array.from(toolsUsed),
    iterations_used: iteration,
    total_data_fetched: allData
  };
}

function extractPaginationInfo(context: string): Record<string, unknown> | null {
  // Extract pagination information from context
  const pageMatch = context.match(/page (\d+) of (\d+)/i);
  const itemsMatch = context.match(/(\d+) of (\d+) (?:total )?(?:items|campaigns|publishers|lists)/i);
  
  if (pageMatch) {
    return {
      current_page: parseInt(pageMatch[1]),
      total_pages: parseInt(pageMatch[2])
    };
  }
  
  if (itemsMatch) {
    return {
      items_shown: parseInt(itemsMatch[1]),
      total_items: parseInt(itemsMatch[2])
    };
  }
  
  return null;
}
