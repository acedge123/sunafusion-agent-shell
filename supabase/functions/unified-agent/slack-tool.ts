import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SlackMessage {
  text: string;
  user: string;
  channel?: string;
  permalink?: string;
  timestamp: string;
  threadTs?: string;
}

// Slack tool implementation for the unified agent
export async function searchSlack(userId: string, query: string, supabaseClient: SupabaseClient): Promise<SlackMessage[]> {
  try {
    console.log(`Searching Slack for: "${query}" for user: ${userId}`);

    // Get the user's Slack token
    const { data: tokenData } = await supabaseClient
      .from('slack_access')
      .select('access_token')
      .eq('user_id', userId)
      .maybeSingle();

    if (!tokenData?.access_token) {
      console.log('No Slack access token found for user');
      return [];
    }

    // Call Slack API to search messages
    const slackApiUrl = 'https://slack.com/api/search.messages';
    const searchParams = new URLSearchParams({
      query,
      count: '20',
      sort: 'timestamp',
      sort_dir: 'desc'
    });

    const response = await fetch(`${slackApiUrl}?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await response.json();

    if (!data.ok) {
      console.error(`Slack API error: ${data.error}`);
      return [];
    }

    // Process and format messages
    const messages: SlackMessage[] = data.messages.matches.map((match: Record<string, unknown>) => ({
      text: match.text,
      user: match.username || match.user,
      channel: (match.channel as Record<string, unknown>)?.name,
      permalink: match.permalink,
      timestamp: new Date(parseInt(String(match.ts).split('.')[0]) * 1000).toISOString(),
      threadTs: match.thread_ts
    }));

    console.log(`Found ${messages.length} Slack messages matching query "${query}"`);
    return messages;
  } catch (error: unknown) {
    console.error('Error searching Slack:', error);
    return [];
  }
}

export async function getSlackChannelHistory(userId: string, channelName: string, limit = 20, supabaseClient: SupabaseClient): Promise<SlackMessage[]> {
  try {
    console.log(`Getting Slack channel history for ${channelName} for user: ${userId}`);

    // Get the user's Slack token
    const { data: tokenData } = await supabaseClient
      .from('slack_access')
      .select('access_token')
      .eq('user_id', userId)
      .maybeSingle();

    if (!tokenData?.access_token) {
      console.log('No Slack access token found for user');
      return [];
    }

    // First get channel ID from name
    const channelsResponse = await fetch('https://slack.com/api/conversations.list', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const channelsData = await channelsResponse.json();

    if (!channelsData.ok) {
      console.error(`Slack API error: ${channelsData.error}`);
      return [];
    }

    const channel = channelsData.channels.find((ch: Record<string, unknown>) => ch.name === channelName);

    if (!channel) {
      console.log(`Channel ${channelName} not found`);
      return [];
    }

    // Now get channel history
    const historyParams = new URLSearchParams({
      channel: channel.id as string,
      limit: limit.toString()
    });

    const historyResponse = await fetch(`https://slack.com/api/conversations.history?${historyParams}`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const historyData = await historyResponse.json();

    if (!historyData.ok) {
      console.error(`Slack API error: ${historyData.error}`);
      return [];
    }

    // Process and format messages
    const messages: SlackMessage[] = historyData.messages.map((message: Record<string, unknown>) => ({
      text: message.text,
      user: message.user,
      timestamp: new Date(parseInt(String(message.ts).split('.')[0]) * 1000).toISOString(),
      threadTs: message.thread_ts
    }));

    console.log(`Retrieved ${messages.length} messages from channel ${channelName}`);
    return messages;
  } catch (error: unknown) {
    console.error('Error getting channel history:', error);
    return [];
  }
}
