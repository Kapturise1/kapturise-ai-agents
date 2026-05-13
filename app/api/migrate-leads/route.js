// One-time migration: remap leads from old cron-sales-* IDs to canonical agent IDs
// Uses batch SQL updates for speed (fits in Vercel 60s limit)
// Call: GET /api/migrate-leads

import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const CANONICAL_AGENTS = [
  { id: 'omar', name: 'Omar Al-Rashid', role: 'sales', title: 'Sr Sales Hunter', status: 'active', config: { targeting: { industries: ['Real Estate', 'Corporates', 'Events'], locations: ['Dubai, UAE'] } } },
  { id: 'sara', name: 'Sara Kapoor', role: 'sales', title: 'Social Outreach & Engagement', status: 'active', config: { targeting: { industries: ['F&B', 'Real Estate', 'Events', 'Corporates', 'Ecommerce', 'Lifestyle', 'Hospitality'], locations: ['Dubai, UAE'] } } },
  { id: 'raj', name: 'Raj Menon', role: 'sales', title: 'Deal Closer', status: 'active', config: { targeting: { industries: ['Events', 'Corporates', 'Food Aggregators'], locations: ['Dubai, UAE'] } } },
  { id: 'noor', name: 'Noor Al-Sayed', role: 'sales', title: 'DM & Social Outreach', status: 'active', config: { targeting: { industries: ['F&B', 'Lifestyle', 'Retail', 'Fashion'], locations: ['Dubai, UAE'] } } },
  { id: 'ali', name: 'Ali Okonkwo', role: 'sales', title: 'Social Engagement', status: 'active', config: { targeting: { industries: ['F&B', 'Events', 'Hospitality'], locations: ['Dubai, UAE'] } } },
  { id: 'maya', name: 'Maya Torres', role: 'sales', title: 'Call & Close Specialist', status: 'active', config: { targeting: { industries: ['Real Estate', 'Corporates', 'Ecommerce'], locations: ['Dubai, UAE'] } } },
  { id: 'layla', name: 'Layla Hassan', role: 'marketing', title: 'Brand Strategist', status: 'active', config: { targeting: { industries: ['Creative', 'Media', 'Photography'], locations: ['Dubai, UAE'] } } },
  { id: 'aiden', name: 'Aiden Murphy', role: 'marketing', title: 'Growth & Ads', status: 'active', config: { targeting: { industries: ['Paid Ads', 'SEO', 'Lead-gen'], locations: ['Dubai, UAE'] } } },
  { id: 'zara', name: 'Zara Petrova', role: 'marketing', title: 'Creative Director', status: 'active', config: { targeting: { industries: ['Creative', 'Design', 'Brand'], locations: ['Dubai, UAE'] } } },
  { id: 'kai', name: 'Kai Nakamura', role: 'marketing', title: 'Short-Form & Reels', status: 'active', config: { targeting: { industries: ['Social Media', 'Short-form Video'], locations: ['Dubai, UAE'] } } },
  { id: 'ravi', name: 'Ravi Sharma', role: 'marketing', title: 'Video Producer', status: 'active', config: { targeting: { industries: ['YouTube', 'Video Production'], locations: ['Dubai, UAE'] } } },
  { id: 'mia', name: 'Mia Williams', role: 'marketing', title: 'Shorts & Reels Creator', status: 'active', config: { targeting: { industries: ['YouTube Shorts', 'IG Reels', 'TikTok'], locations: ['Dubai, UAE'] } } },
  { id: 'diana', name: 'Diana Rossi', role: 'account', title: 'Client Success', status: 'active', config: { targeting: { industries: ['All existing Kapturise clients'], locations: ['Dubai, UAE'] } } },
  { id: 'sam', name: 'Sam Okafor', role: 'account', title: 'Retention', status: 'active', config: { targeting: { industries: ['All existing Kapturise clients'], locations: ['Dubai, UAE'] } } },
  { id: 'alex', name: 'Alex Kim', role: 'analytics', title: 'Data Analyst', status: 'active', config: { targeting: { industries: ['Internal'], locations: ['N/A'] } } },
  { id: 'yara', name: 'Yara Sheikh', role: 'investor', title: 'Investor Relations', status: 'active', config: { targeting: { industries: ['VC', 'Angel Investors', 'Family Offices', 'Accelerators'], locations: ['Dubai, UAE', 'Abu Dhabi, UAE', 'Riyadh, KSA'] } } },
  { id: 'marcus', name: 'Marcus Chen', role: 'investor', title: 'Pitch Strategist', status: 'active', config: { targeting: { industries: ['VC', 'Angel Investors', 'Strategic investors'], locations: ['Dubai, UAE', 'London, UK', 'New York, USA'] } } },
];

// Direct remap of old cron IDs
const DIRECT_REMAP = {
  'cron-sales-1': 'omar',
  'cron-sales-2': 'sara',
  'cron-sales-3': 'raj',
  'cron-investor-1': 'yara',
  'cron-marketing-1': 'layla',
  'cron-expo-1': 'ali',
};

// Industry keywords to agent
const IND_MAP = {
  'real estate': 'omar', 'property': 'omar', 'corporate': 'omar',
  'f&b': 'sara', 'food': 'sara', 'restaurant': 'sara', 'hospitality': 'sara', 'hotel': 'sara',
  'event': 'raj', 'conference': 'raj', 'wedding': 'raj',
  'ecommerce': 'noor', 'retail': 'noor', 'fashion': 'noor', 'lifestyle': 'noor',
  'tech': 'maya', 'healthcare': 'maya',
  'food aggregator': 'ali',
};

const SALES = ['omar', 'sara', 'raj', 'noor', 'ali', 'maya'];

function pickAgent(lead, i) {
  const ind = (lead.industry || '').toLowerCase();
  for (const [kw, ag] of Object.entries(IND_MAP)) {
    if (ind.includes(kw)) return ag;
  }
  return SALES[i % SALES.length];
}

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) return Response.json({ error: 'Supabase not configured' }, { status: 500 });

  try {
    // 1. Seed canonical agents
    await supabase.from('agents').upsert(CANONICAL_AGENTS, { onConflict: 'id' });

    // 2. Batch remap: direct SQL updates for each old cron ID
    const remapResults = {};
    for (const [oldId, newId] of Object.entries(DIRECT_REMAP)) {
      const { data, error } = await supabase
        .from('leads')
        .update({ assigned_to: newId })
        .eq('assigned_to', oldId)
        .select('id');
      remapResults[oldId + ' -> ' + newId] = error ? 'Error: ' + error.message : (data?.length || 0) + ' leads';
    }

    // 3. Load remaining leads that still have old IDs or need industry-based assignment
    const { data: remaining } = await supabase
      .from('leads')
      .select('id, industry, assigned_to')
      .or('assigned_to.is.null,assigned_to.like.cron-%');
    
    let fixed = 0;
    if (remaining && remaining.length > 0) {
      // Batch by target agent to minimize updates
      const batches = {};
      remaining.forEach((l, i) => {
        const ag = pickAgent(l, i);
        if (!batches[ag]) batches[ag] = [];
        batches[ag].push(l.id);
      });
      for (const [ag, ids] of Object.entries(batches)) {
        const { error } = await supabase.from('leads').update({ assigned_to: ag }).in('id', ids);
        if (!error) fixed += ids.length;
      }
    }

    // 4. Final distribution
    const { data: all } = await supabase.from('leads').select('assigned_to');
    const dist = {};
    (all || []).forEach(l => { const a = l.assigned_to || 'unassigned'; dist[a] = (dist[a] || 0) + 1; });

    return Response.json({ ok: true, agentsSeeded: CANONICAL_AGENTS.length, remapResults, remainingFixed: fixed, finalDistribution: dist, totalLeads: (all || []).length });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
