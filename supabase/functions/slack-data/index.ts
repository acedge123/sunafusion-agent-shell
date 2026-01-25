import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { errMsg } from "../_shared/error.ts";

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
    let userId: string | null = null;
    let slackToken: string | undefined;

    // Only require authentication for actions that need it
    if (action !== 'exchangeCodeForToken') {
      // Try to get user from auth header
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
        if (!userError && userData?.user) {
          userId = userData.user.id;
        } else {
          console.log('Invalid user token in auth header:', errMsg(userError, 'Unknown auth error'));
        }
      }
  
      if (!userId) {
        throw new Error('Unauthorized: Invalid or missing authentication');
      }
  
      // Retrieve the Slack access token for the user (for authenticated endpoints only)
      const { data: tokenData, error: tokenError } = await supabaseClient
        .from('slack_access')
        .select('access_token')
        .eq('user_id', userId)
        .maybeSingle();
  
      if (tokenError || !tokenData?.access_token) {
        throw new Error('Slack access token not found for user');
      }
  
      slackToken = tokenData.access_token;
    }

    // Handle different Slack API actions
    let result;
    switch (action) {
      case 'exchangeCodeForToken':
        result = await exchangeCodeForToken(requestData);
        break;
      case 'search':
        result = await searchMessages(slackToken!, requestData);
        break;
      case 'getChannels':
        result = await getChannels(slackToken!);
        break;
      case 'getChannelHistory':
        result = await getChannelHistory(slackToken!, requestData);
        break;
      case 'getThreadReplies':
        result = await getThreadReplies(slackToken!, requestData);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Error in slack-data function: ${errMsg(error)}`);
    return new Response(
      JSON.stringify({
        error: errMsg(error, 'An unexpected error occurred'),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// New function to exchange code for token
async function exchangeCodeForToken(params: Record<string, unknown>) {
  const { code, redirectUri } = params;
  const clientId = "105581126916.8801648634339";
  const clientSecret = Deno.env.get('SLACK_CLIENT_SECRET');
  
  if (!clientSecret) {
    throw new Error('SLACK_CLIENT_SECRET environment variable is not set');
  }
  
  console.log(`Exchanging code for token with redirect URI: ${redirectUri}`);

  const formData = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: code as string,
    redirect_uri: redirectUri as string
  });

  const response = await fetch(`${SLACK_API_BASE_URL}/oauth.v2.access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  });

  const data = await response.json();

  if (!data.ok) {
    console.error('Slack OAuth error:', data.error);
    throw new Error(`Slack API error: ${data.error}`);
  }

  console.log('Successfully exchanged code for token');
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_in ? new Date(Date.now() + (data.expires_in * 1000)).toISOString() : null
  };
}

// Function to search Slack messages
async function searchMessages(token: string, params: Record<string, unknown>) {
  const { query, channels, limit = 20 } = params;
  
  const searchParams = new URLSearchParams({
    query: query as string,
    count: (limit as number).toString(),
    sort: 'timestamp',
    sort_dir: 'desc',
  });

  if (channels && Array.isArray(channels) && channels.length > 0) {
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
  const messages = data.messages.matches.map((match: Record<string, unknown>) => ({
    id: match.ts,
    text: match.text,
    user: match.user,
    ts: match.ts,
    channel: (match.channel as Record<string, unknown>).id,
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
  const channels = data.channels.map((channel: Record<string, unknown>) => ({
    id: channel.id,
    name: channel.name,
    is_private: channel.is_private,
    is_archived: channel.is_archived,
    num_members: channel.num_members,
  }));

  return { channels };
}

// Function to get channel history
async function getChannelHistory(token: string, params: Record<string, unknown>) {
  const { channelId, limit = 50 } = params;
  
  const searchParams = new URLSearchParams({
    channel: channelId as string,
    limit: (limit as number).toString(),
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
  const messages = data.messages.map((message: Record<string, unknown>) => ({
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
async function getThreadReplies(token: string, params: Record<string, unknown>) {
  const { channelId, threadTs } = params;
  
  const searchParams = new URLSearchParams({
    channel: channelId as string,
    ts: threadTs as string,
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
  const messages = data.messages.map((message: Record<string, unknown>) => ({
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
            eq: (column: string, value: string) => {
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
