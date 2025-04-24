import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define Slack API base URL
const SLACK_API_BASE_URL = "https://slack.com/api";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const requestData = await req.json();
    const { action } = requestData;

    // Create Supabase client for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Extract the Authorization header
    const authHeader = req.headers.get('Authorization');
    let userId = null;

    // Try to get user from auth header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (!userError && userData.user) {
        userId = userData.user.id;
      } else {
        console.log('Invalid user token in auth header:', userError?.message);
      }
    }

    if (!userId) {
      throw new Error('Unauthorized: Invalid or missing authentication');
    }

    // Retrieve the Slack access token for the user
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('slack_access')
      .select('access_token')
      .eq('user_id', userId)
      .maybeSingle();

    if (tokenError || !tokenData?.access_token) {
      throw new Error('Slack access token not found for user');
    }

    const slackToken = tokenData.access_token;

    // Handle different Slack API actions
    let result;
    switch (action) {
      case 'search':
        result = await searchMessages(slackToken, requestData);
        break;
      case 'getChannels':
        result = await getChannels(slackToken);
        break;
      case 'getChannelHistory':
        result = await getChannelHistory(slackToken, requestData);
        break;
      case 'getThreadReplies':
        result = await getThreadReplies(slackToken, requestData);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Error in slack-data function: ${error.message}`);
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Function to search Slack messages
async function searchMessages(token: string, params: any) {
  const { query, channels, limit = 20 } = params;
  
  const searchParams = new URLSearchParams({
    query,
    count: limit.toString(),
    sort: 'timestamp',
    sort_dir: 'desc',
  });

  if (channels && channels.length > 0) {
    searchParams.append('channel', channels.join(','));
  }

  const response = await fetch(`${SLACK_API_BASE_URL}/search.messages?${searchParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  // Process and format messages
  const messages = data.messages.matches.map((match: any) => ({
    id: match.ts,
    text: match.text,
    user: match.user,
    ts: match.ts,
    channel: match.channel.id,
    thread_ts: match.thread_ts,
  }));

  return { messages };
}

// Function to get list of channels
async function getChannels(token: string) {
  const response = await fetch(`${SLACK_API_BASE_URL}/conversations.list`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  // Process and format channels
  const channels = data.channels.map((channel: any) => ({
    id: channel.id,
    name: channel.name,
    is_private: channel.is_private,
    is_archived: channel.is_archived,
    num_members: channel.num_members,
  }));

  return { channels };
}

// Function to get channel history
async function getChannelHistory(token: string, params: any) {
  const { channelId, limit = 50 } = params;
  
  const searchParams = new URLSearchParams({
    channel: channelId,
    limit: limit.toString(),
  });

  const response = await fetch(`${SLACK_API_BASE_URL}/conversations.history?${searchParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  // Process and format messages
  const messages = data.messages.map((message: any) => ({
    id: message.ts,
    text: message.text,
    user: message.user,
    ts: message.ts,
    channel: channelId,
    thread_ts: message.thread_ts,
  }));

  return { messages };
}

// Function to get thread replies
async function getThreadReplies(token: string, params: any) {
  const { channelId, threadTs } = params;
  
  const searchParams = new URLSearchParams({
    channel: channelId,
    ts: threadTs,
  });

  const response = await fetch(`${SLACK_API_BASE_URL}/conversations.replies?${searchParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  // Process and format messages
  const messages = data.messages.map((message: any) => ({
    id: message.ts,
    text: message.text,
    user: message.user,
    ts: message.ts,
    channel: channelId,
    thread_ts: message.thread_ts,
  }));

  return { messages };
}

// Supabase client implementation
function createClient(supabaseUrl: string, supabaseKey: string) {
  return {
    auth: {
      getUser: async (token: string) => {
        try {
          const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'apikey': supabaseKey,
            },
          });
          
          if (!response.ok) {
            return { error: { message: `Auth error: ${response.statusText}` }, data: null };
          }
          
          const userData = await response.json();
          return { data: { user: userData }, error: null };
        } catch (error) {
          return { error, data: null };
        }
      },
    },
    from: (table: string) => {
      return {
        select: (columns: string) => {
          return {
            eq: (column: string, value: any) => {
              return {
                maybeSingle: async () => {
                  try {
                    const response = await fetch(
                      `${supabaseUrl}/rest/v1/${table}?select=${columns}&${column}=eq.${value}`,
                      {
                        headers: {
                          'apikey': supabaseKey,
                          'Authorization': `Bearer ${supabaseKey}`,
                          'Content-Type': 'application/json',
                        },
                      }
                    );
                    
                    if (!response.ok) {
                      return { error: { message: `Database error: ${response.statusText}` }, data: null };
                    }
                    
                    const results = await response.json();
                    return { data: results.length > 0 ? results[0] : null, error: null };
                  } catch (error) {
                    return { error, data: null };
                  }
                },
              };
            },
          };
        },
      };
    },
  };
}
