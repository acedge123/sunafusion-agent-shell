// Tool Registry - Defines available tools with their OpenAI function calling schemas

export const tools = [
  {
    type: "function",
    function: {
      name: "fetch_more_creator_iq_data",
      description: "Fetches additional pages of Creator IQ data when pagination is detected. Use this when you see 'page X of Y' or 'showing N of M total items' in the results.",
      parameters: {
        type: "object",
        properties: {
          endpoint: {
            type: "string",
            enum: ["campaigns", "publishers", "lists"],
            description: "The type of data to fetch more of"
          },
          page: {
            type: "number",
            description: "The page number to fetch (default: next page)"
          },
          campaign_id: {
            type: "string",
            description: "Campaign ID if fetching campaign-specific data"
          },
          list_id: {
            type: "string",
            description: "List ID if fetching list-specific data"
          }
        },
        required: ["endpoint"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_creator_iq",
      description: "Searches Creator IQ for campaigns, publishers, or lists based on search criteria",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query or filter criteria"
          },
          endpoint: {
            type: "string",
            enum: ["campaigns", "publishers", "lists", "campaign_publishers"],
            description: "What to search for"
          },
          campaign_id: {
            type: "string",
            description: "Campaign ID when searching for campaign publishers"
          },
          filters: {
            type: "object",
            description: "Additional filters like status, date range, etc."
          }
        },
        required: ["endpoint"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_creator_iq_list",
      description: "Creates a new list in Creator IQ with specified publishers",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the list"
          },
          description: {
            type: "string",
            description: "Description of the list"
          },
          publisher_ids: {
            type: "array",
            items: { type: "string" },
            description: "Array of publisher IDs to add to the list"
          }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyze_data",
      description: "Analyzes the current data to extract insights, patterns, or answer specific questions. Use this when you need to synthesize information from multiple sources.",
      parameters: {
        type: "object",
        properties: {
          analysis_type: {
            type: "string",
            enum: ["summarize", "compare", "filter", "aggregate", "identify_patterns"],
            description: "Type of analysis to perform"
          },
          criteria: {
            type: "object",
            description: "Specific criteria for the analysis (e.g., status='active', date_range, etc.)"
          }
        },
        required: ["analysis_type"]
      }
    }
  }
];

export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResult {
  tool_call_id: string;
  role: string;
  name: string;
  content: string;
}
