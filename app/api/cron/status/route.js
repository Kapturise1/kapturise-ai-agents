// Check recent cron activity — shows last 50 activity log entries
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return Response.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = createClient(url, key);

  const { data: logs, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const cronLogs = (logs || []).filter(l => l.message?.startsWith('[CRON'));
  const { data: agents } = await supabase.from('agents').select('id, name, role, status');
  const { count: leadCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });

  return Response.json({
    status: 'ok',
    activeAgents: (agents || []).filter(a => a.status === 'active').length,
    totalLeads: leadCount || 0,
    recentCronRuns: cronLogs.length,
    lastRun: cronLogs[0]?.created_at || null,
    lastMessage: cronLogs[0]?.message || null,
    logs: cronLogs.slice(0, 20),
  });
}
