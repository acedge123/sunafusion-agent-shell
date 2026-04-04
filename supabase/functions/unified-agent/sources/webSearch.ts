import { errMsg } from "../../_shared/error.ts";

interface TavilyResult {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
}

// Function to search the web using Tavily API
export async function searchWeb(query: string): Promise<TavilyResult[]> {
  try {
    const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY');
    if (!TAVILY_API_KEY) {
      return [];
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        query,
        search_depth: 'advanced',
        include_domains: [],
        exclude_domains: [],
        include_answer: false,
        max_results: 10
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error: unknown) {
    console.error("Error in web search:", errMsg(error));
    return [];
  }
}
