import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { errMsg } from "../_shared/error.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting cleanup of old data...')

    // 1. Clean up expired creator_iq_state
    const expiredStateResult = await supabase
      .from('creator_iq_state')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select()

    const expiredCount = expiredStateResult.data?.length || 0
    console.log(`Deleted ${expiredCount} expired creator_iq_state records`)

    // 2. Archive old completed agent_runs (older than 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const oldRunsResult = await supabase
      .from('agent_runs')
      .delete()
      .eq('status', 'completed')
      .lt('completed_at', thirtyDaysAgo.toISOString())
      .select()

    const oldRunsCount = oldRunsResult.data?.length || 0
    console.log(`Deleted ${oldRunsCount} old completed agent_runs`)

    // 3. Optional: Summarize/prune very old messages (older than 90 days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    // Get threads that haven't been updated in 90 days
    const { data: oldThreads } = await supabase
      .from('threads')
      .select('thread_id')
      .lt('updated_at', ninetyDaysAgo.toISOString())
      .limit(100)

    // Declare deletedMessagesCount OUTSIDE the if block
    let deletedMessagesCount = 0

    if (oldThreads && oldThreads.length > 0) {
      const threadIds = oldThreads.map(t => t.thread_id)
      
      const { data: messagesToKeep } = await supabase
        .from('messages')
        .select('message_id')
        .in('thread_id', threadIds)
        .or('type.eq.summary,created_at.gt.' + ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      const keepIds = new Set(messagesToKeep?.map(m => m.message_id) || [])
      
      const { data: deletedMessages } = await supabase
        .from('messages')
        .delete()
        .in('thread_id', threadIds)
        .not('message_id', 'in', `(${Array.from(keepIds).join(',')})`)
        .lt('created_at', ninetyDaysAgo.toISOString())
        .neq('type', 'summary')
        .select()

      deletedMessagesCount = deletedMessages?.length || 0
      console.log(`Pruned ${deletedMessagesCount} old messages from inactive threads`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        cleaned: {
          expired_creator_iq_state: expiredCount,
          old_agent_runs: oldRunsCount,
          old_messages: deletedMessagesCount
        },
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Cleanup error:', error)
    return new Response(
      JSON.stringify({ 
        error: errMsg(error, 'Cleanup failed'),
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
