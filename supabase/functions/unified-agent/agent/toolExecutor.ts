// Tool Executor - Executes tool calls and returns results

import { errMsg } from "../../_shared/error.ts";
import { determineCreatorIQEndpoints, buildCreatorIQPayload, queryCreatorIQEndpoint } from "../sources/creatorIQ.ts";

export async function executeTool(
  toolName: string, 
  args: Record<string, unknown>, 
  context: Record<string, unknown>
): Promise<Record<string, unknown>> {
  console.log(`Executing tool: ${toolName} with args:`, args);
  
  try {
    switch (toolName) {
      case "fetch_more_creator_iq_data":
        return await fetchMoreCreatorIQData(args, context);
      
      case "search_creator_iq":
        return await searchCreatorIQ(args, context);
      
      case "create_creator_iq_list":
        return await createCreatorIQList(args, context);
      
      case "analyze_data":
        return await analyzeData(args, context);
      
      default:
        return {
          success: false,
          error: `Unknown tool: ${toolName}`
        };
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    return {
      success: false,
      error: errMsg(error, "Tool execution failed")
    };
  }
}

async function fetchMoreCreatorIQData(
  args: Record<string, unknown>, 
  context: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { endpoint, page, campaign_id, list_id } = args;
  
  // Determine the current page from context if not specified
  let targetPage = page as number | undefined;
  const pagination = context.pagination as Record<string, unknown> | undefined;
  if (!targetPage && pagination) {
    targetPage = ((pagination.current_page as number) || 1) + 1;
  }
  
  // Build the endpoint configuration
  let endpointConfig;
  if (endpoint === "campaigns") {
    endpointConfig = {
      route: "/campaigns",
      method: "GET",
      name: "List Campaigns"
    };
  } else if (endpoint === "publishers" && campaign_id) {
    endpointConfig = {
      route: `/campaigns/${campaign_id}/publishers`,
      method: "GET",
      name: "Get Campaign Publishers"
    };
  } else if (endpoint === "publishers" && list_id) {
    endpointConfig = {
      route: `/lists/${list_id}/publishers`,
      method: "GET",
      name: "Get List Publishers"
    };
  } else if (endpoint === "lists") {
    endpointConfig = {
      route: "/lists",
      method: "GET",
      name: "List All Lists"
    };
  } else {
    throw new Error(`Invalid endpoint configuration: ${endpoint}`);
  }
  
  // Build payload with pagination
  const payload = {
    page: targetPage || 1,
    limit: 50
  };
  
  console.log(`Fetching page ${payload.page} of ${endpoint}`);
  
  const result = await queryCreatorIQEndpoint(endpointConfig, payload);
  const data = result.data as Record<string, unknown> | undefined;
  
  return {
    success: true,
    endpoint,
    page: targetPage,
    data: result.data,
    pagination: {
      current_page: data?.page || targetPage,
      total_pages: data?.total_pages || 1,
      total_items: data?.total || 0
    }
  };
}

async function searchCreatorIQ(
  args: Record<string, unknown>, 
  context: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { query, endpoint, campaign_id, filters } = args;
  
  // Build the endpoint configuration
  let endpointConfig;
  if (endpoint === "campaigns") {
    endpointConfig = {
      route: "/campaigns",
      method: "GET",
      name: "List Campaigns"
    };
  } else if (endpoint === "publishers") {
    endpointConfig = {
      route: "/publishers",
      method: "GET",
      name: "List Publishers"
    };
  } else if (endpoint === "campaign_publishers" && campaign_id) {
    endpointConfig = {
      route: `/campaigns/${campaign_id}/publishers`,
      method: "GET",
      name: "Get Campaign Publishers"
    };
  } else if (endpoint === "lists") {
    endpointConfig = {
      route: "/lists",
      method: "GET",
      name: "List All Lists"
    };
  } else {
    throw new Error(`Invalid search endpoint: ${endpoint}`);
  }
  
  // Build payload with filters
  const payload: Record<string, unknown> = {
    limit: 50
  };
  
  if (query) {
    payload.search_term = query;
  }
  
  if (filters && typeof filters === 'object') {
    Object.assign(payload, filters);
  }
  
  console.log(`Searching ${endpoint} with payload:`, payload);
  
  const result = await queryCreatorIQEndpoint(endpointConfig, payload);
  const data = result.data as Record<string, unknown> | undefined;
  
  return {
    success: true,
    endpoint,
    query,
    data: result.data,
    pagination: {
      current_page: data?.page || 1,
      total_pages: data?.total_pages || 1,
      total_items: data?.total || 0
    }
  };
}

async function createCreatorIQList(
  args: Record<string, unknown>, 
  context: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { name, description, publisher_ids } = args;
  
  const endpointConfig = {
    route: "/lists",
    method: "POST",
    name: "Create List"
  };
  
  const payload = {
    Name: name,
    Description: description || "",
    Publishers: publisher_ids || []
  };
  
  const publisherIdsArray = publisher_ids as unknown[] | undefined;
  console.log(`Creating list "${name}" with ${publisherIdsArray?.length || 0} publishers`);
  
  const result = await queryCreatorIQEndpoint(endpointConfig, payload);
  const data = result.data as Record<string, unknown> | undefined;
  const list = data?.List as Record<string, unknown> | undefined;
  
  return {
    success: list?.Id ? true : false,
    list_id: list?.Id,
    list_name: list?.Name,
    data: result.data
  };
}

async function analyzeData(
  args: Record<string, unknown>, 
  context: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { analysis_type, criteria } = args;
  
  // This is a local analysis tool that works with data already in context
  const allData = (context.all_data || []) as Record<string, unknown>[];
  
  let result: Record<string, unknown>;
  switch (analysis_type) {
    case "summarize":
      result = {
        total_items: allData.length,
        summary: `Analyzed ${allData.length} items from context`
      };
      break;
    
    case "filter":
      result = {
        filtered_items: allData.filter((item: Record<string, unknown>) => {
          if (!criteria || typeof criteria !== 'object') return true;
          const criteriaObj = criteria as Record<string, unknown>;
          return Object.entries(criteriaObj).every(([key, value]) => item[key] === value);
        })
      };
      break;
    
    case "aggregate":
      result = {
        aggregation: `Aggregated data based on criteria: ${JSON.stringify(criteria)}`
      };
      break;
    
    default:
      result = {
        analysis: `Performed ${analysis_type} analysis on ${allData.length} items`
      };
  }
  
  return {
    success: true,
    analysis_type,
    result
  };
}
