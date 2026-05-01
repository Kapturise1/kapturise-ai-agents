// Server-side auto-run engine â replaces client-side 45s interval
// Called by: Vercel daily cron (free tier) + external cron service (cron-job.org) every 2-5 min
// Reads/writes leads and agents from Supabase directly

import { createClient } from '@supabase/supabase-js';
import { getTemplateForIndustry, renderTemplate } from '../../../../lib/emailTemplates';

export const maxDuration = 60; // Vercel free tier = 60s max
export const dynamic = 'force-dynamic'; // Prevent Next.js from prerendering this route

// ââ Supabase client (server-side, uses env vars) ââ
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// ââ Task cycle per role (mirrors client-side TASK_CYCLE) ââ
const TASK_CYCLE = {
  sales: ['prospect', 'outreach', 'event-scout', 'follow-up', 'outreach', 'qualify'],
  marketing: ['content', 'engagement', 'content'],
  account: ['check-in', 'upsell'],
  analytics: ['report'],
  investor: ['prospect', 'outreach', 'follow-up'],
};

// ââ Industry pricing lookup (mirrors client-side getIndustryPricing) ââ
function getIndustryPricing(industry) {
  if (!industry) return { service: '', price: 'varies', note: '' };
  const lower = industry.toLowerCase();
  const pricing = {
    food: ['food-photo', 'food-video'], restaurant: ['food-photo', 'food-video'],
    'real estate': ['real-estate'], property: ['real-estate'],
    event: ['event'], conference: ['event'],
    corporate: ['headshots'], tech: ['headshots'],
    ecommerce: ['product-photo'], retail: ['product-photo'],
    hotel: ['retainer'], hospitality: ['retainer'],
  };
  const priceMap = {
    event: '5,500', 'food-photo': '3,500', 'food-video': '4,500', 'real-estate': '3,000',
    headshots: '2,000', 'product-photo': '3,000', smm: '4,500/mo', retainer: '8,000/mo',
  };
  const serviceMap = {
    event: 'Event Coverage', 'food-photo': 'Food Photography', 'food-video': 'Food Videography',
    'real-estate': 'Real Estate Photography', headshots: 'Corporate Headshots',
    'product-photo': 'Product Photography', smm: 'Social Media Management', retainer: 'Monthly Retainer',
  };
  for (const [k, v] of Object.entries(pricing)) {
    if (lower.includes(k)) {
      const svc = v[0];
      return { service: serviceMap[svc] || svc, price: priceMap[svc] || 'from AED 2,000', serviceId: svc };
    }
  }
  return { service: 'Creative Services', price: 'from AED 2,000', note: '' };
}

// ââ Parse AI prospect output into lead objects ââ
function parseProspects(aiOut, agId, ag) {
  const res = [];
  try {
    const jm = aiOut.match(/\[[\s\S]*?\]/);
    if (jm) {
      JSON.parse(jm[0]).forEach((p, i) => {
        const rawVal = parseInt(p.estimatedValue || p.val) || 5000;
        const cappedVal = Math.min(rawVal, 8000);
        res.push({
          name: p.company || p.name || p.handle || `Prospect ${i + 1}`,
          website: p.website || '',
          industry: p.industry || p.ind || ag.config?.targeting?.industries?.[0] || 'General',
          stage: 'Research',
          contact_name: p.contact || p.person || p.contactName || '',
          contact_title: p.title || p.contactTitle || '',
          email: p.email || '',
          phone: p.phone || '',
          instagram: p.instagram || p.ig || p.handle || '',
          linkedin: p.linkedin || '',
          value: cappedVal,
          notes: p.notes || `AI-discovered by ${ag.name}`,
          source: `${ag.name} (AI Auto-Server)`,
          source_type: 'ai-prospecting',
          assigned_to: agId,
          service_type: p.suggestedService || p.serviceType || '',
          logs: [{
            type: 'note',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            msg: `Server auto-prospecting by ${ag.name}`,
            summary: 'Auto-prospecting discovery',
            transcript: aiOut.slice(0, 1500),
          }],
        });
      });
    }
  } catch (e) { /* parse error â skip */ }
  return res;
}

// ââ Parse email subject and body from AI outreach text ââ
function parseEmailFromAI(result) {
  let subject = '', body = '';
  try {
    const subjectMatch = result.match(/(?:subject:|email\s+subject:)\s*(.+?)(?:\n|$)/i);
    if (subjectMatch) subject = subjectMatch[1].trim();
    const bodyStart = result.search(/(?:subject:|email\s+subject:)/i);
    if (bodyStart >= 0) {
      let bodyText = result.substring(bodyStart);
      const bodyMatch = bodyText.match(/(?:subject:|email\s+subject:)\s*.+?\n([\s\S]+?)(?:INSTAGRAM DM|2\.|---|\n\n[A-Z]|\$)/i);
      if (bodyMatch) body = bodyMatch[1].trim();
    }
    if (!subject || !body) {
      const lines = result.split('\n').filter(l => l.trim());
      if (lines.length > 0 && !subject) subject = lines[0].substring(0, 100);
      if (lines.length > 1 && !body) body = lines.slice(1).join('\n').substring(0, 2000);
    }
  } catch (e) { /* parse error */ }
  return { subject: subject || '(No subject parsed)', body: body || result.substring(0, 2000) };
}

// ââ Call AI: tries Gemini free tier first, then DeepSeek as fallback ââ
// Gemini free tier: gemini-2.5-flash = 20 RPD, 5 RPM
// DeepSeek: free credits on new accounts, ~$0.001/call after that
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

async function callGemini(system, prompt, geminiKey) {
  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: system }] },
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);
        if (response.status === 429 || response.status === 404) break;
        if (response.status === 503) {
          if (attempt === 0) { await new Promise(r => setTimeout(r, 3000)); continue; }
          break;
        }
        if (!response.ok) return null; // non-retryable error, try fallback
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } catch (e) {
        clearTimeout(timeout);
        if (e.name === 'AbortError') return null;
        return null;
      }
    }
  }
  return null; // all Gemini models failed
}

async function callDeepSeek(system, prompt, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (e) {
    clearTimeout(timeout);
    return null;
  }
}

async function callAI(system, prompt) {
  // 1. Try Gemini (free)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const result = await callGemini(system, prompt, geminiKey);
    if (result) return result;
  }

  // 2. Fallback: DeepSeek (free credits, then ~$0.001/call)
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (deepseekKey) {
    const result = await callDeepSeek(system, prompt, deepseekKey);
    if (result) return result;
  }

  // All providers failed
  const err = new Error('All AI providers unavailable (Gemini overloaded, DeepSeek failed) â will retry next cron cycle');
  err.isRateLimit = true;
  throw err;
}

// ââ Send email via configured provider ââ
async function sendEmail({ to, subject, body, provider, apiKey, from }) {
  if (provider === 'gmail' && apiKey) {
    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 587, secure: false,
      auth: { user: from || 'contact@kapturise.com', pass: apiKey },
    });
    const info = await transporter.sendMail({
      from: `Kapturise <${from || 'contact@kapturise.com'}>`,
      to, subject, html: body,
    });
    return { success: true, id: info.messageId, provider: 'gmail' };
  }
  if (provider === 'resend' && apiKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Kapturise <noreply@kapturise.com>', to: [to], subject, html: body }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Resend error');
    return { success: true, id: data.id, provider: 'resend' };
  }
  if (provider === 'sendgrid' && apiKey) {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'noreply@kapturise.com', name: 'Kapturise' },
        subject, content: [{ type: 'text/html', value: body }],
      }),
    });
    if (!res.ok) throw new Error('SendGrid error');
    return { success: true, provider: 'sendgrid' };
  }
  if (provider === 'mailgun' && apiKey) {
    const formData = new URLSearchParams();
    formData.append('from', 'Kapturise <noreply@kapturise.com>');
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('html', body);
    const res = await fetch(`https://api.mailgun.net/v3/kapturise.com/messages`, {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Mailgun error');
    return { success: true, id: data.id, provider: 'mailgun' };
  }
  throw new Error('No email provider configured');
}

// ââ Build system prompt for agent ââ
function buildSystemPrompt(agent) {
  return `You are ${agent.name}, ${agent.title || 'AI Agent'} at Kapturise â Dubai's first and largest on-demand platform for photographers, videographers, and content creators. You work professionally and efficiently. Your role: ${agent.role}. Always be specific, use real company details, and follow instructions precisely.`;
}

// ââââââââââââââââââââââââââââââââââââââââââ
// MAIN CRON HANDLER
// ââââââââââââââââââââââââââââââââââââââââââ
export async function GET(request) {
  // ââ Auth check disabled for free tier testing ââ
  // To re-enable: uncomment the block below and set CRON_SECRET env var
  // const cronSecret = process.env.CRON_SECRET;
  // if (cronSecret) {
  //   const authHeader = request.headers.get('authorization');
  //   const { searchParams } = new URL(request.url);
  //   const tokenParam = searchParams.get('token');
  //   const vercelCron = request.headers.get('x-vercel-cron');
  //   if (!vercelCron && authHeader !== `Bearer ${cronSecret}` && tokenParam !== cronSecret) {
  //     return Response.json({ error: 'Unauthorized' }, { status: 401 });
  //   }
  // }

  // ââ Throttle: run AI every other cron invocation (~10 min at 5-min intervals) ââ
  // With DeepSeek fallback, we can run much more frequently (~144 runs/day)
  // Gemini is tried first (free), DeepSeek catches overflow
  // Use ?force=true to bypass throttle for manual testing
  const now = new Date();
  const minuteOfDay = now.getUTCHours() * 60 + now.getUTCMinutes();
  const url = new URL(request.url);
  const forceRun = url.searchParams.get('force') === 'true';
  // Run if: forced OR every other 5-min window (skip alternating invocations)
  const shouldRun = forceRun || (minuteOfDay % 10 < 5);
  if (!shouldRun) {
    return Response.json({
      ok: true,
      skipped: true,
      reason: 'throttled',
      message: `Waiting for next run window (~every 10 min). Add ?force=true to run now.`,
      timestamp: now.toISOString(),
    });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return Response.json({ error: 'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY).' }, { status: 500 });
  }

  try {
    // ââ 1. Load agents â seed defaults if table is empty ââ
    let { data: agents, error: agErr } = await supabase
      .from('agents')
      .select('*')
      .eq('status', 'active');

    if (agErr) throw new Error(`Failed to load agents: ${agErr.message}`);

    // Auto-seed default agents if none exist
    if (!agents || agents.length === 0) {
      const defaultAgents = [
        { id: 'cron-sales-1', name: 'Aisha Al-Rashid', role: 'sales', title: 'Senior Sales Executive', status: 'active', config: { targeting: { industries: ['Real Estate', 'Events', 'Wedding Venues'], locations: ['Dubai, UAE'] } } },
        { id: 'cron-sales-2', name: 'Omar Hassan', role: 'sales', title: 'Business Development Manager', status: 'active', config: { targeting: { industries: ['Food & Beverage', 'Hospitality', 'Ecommerce'], locations: ['Dubai, UAE', 'Abu Dhabi, UAE'] } } },
        { id: 'cron-sales-3', name: 'Sara Khan', role: 'sales', title: 'Sales Representative', status: 'active', config: { targeting: { industries: ['Tech', 'Corporate', 'Healthcare'], locations: ['Dubai, UAE'] } } },
        { id: 'cron-investor-1', name: 'Khalid Mahmoud', role: 'investor', title: 'Investor Relations Manager', status: 'active', config: { targeting: { industries: ['VC', 'Angel Investors', 'Family Offices'], locations: ['Dubai, UAE', 'Riyadh, KSA'] } } },
        { id: 'cron-marketing-1', name: 'Layla Noor', role: 'marketing', title: 'Content Strategist', status: 'active', config: { targeting: { industries: ['Creative', 'Media', 'Photography'], locations: ['Dubai, UAE'] } } },
      ];
      const { error: seedErr } = await supabase.from('agents').upsert(defaultAgents, { onConflict: 'id' });
      if (seedErr) throw new Error(`Failed to seed agents: ${seedErr.message}`);
      agents = defaultAgents;
    }

    // ââ 2. Load leads ââ
    const { data: leads, error: ldErr } = await supabase.from('leads').select('*');
    if (ldErr) throw new Error(`Failed to load leads: ${ldErr.message}`);
    const allLeads = leads || [];

    // ââ 3. Load pricing ââ
    const { data: pricingRows } = await supabase.from('pricing').select('*');
    const pricingStr = (pricingRows || []).map(p => `${p.name}: AED ${p.base_price || 'varies'}`).join(', ');

    // ââ 4. Determine which agent + task to run ââ
    // Use minute-of-day to rotate through agents (1 agent per cron invocation)
    // (now and minuteOfDay already declared above in throttle check)
    const agentIndex = minuteOfDay % agents.length;
    const agent = agents[agentIndex];

    // Determine role bucket
    const role = (agent.role === 'marketing' || agent.role === 'content') ? 'marketing'
      : agent.role === 'account' ? 'account'
      : agent.role === 'analytics' ? 'analytics'
      : agent.role === 'investor' ? 'investor'
      : 'sales';

    const tasks = TASK_CYCLE[role] || TASK_CYCLE.sales;
    // Use a different rotation for task index (based on how many times this agent has been picked today)
    const taskIndex = Math.floor(minuteOfDay / agents.length) % tasks.length;
    const tType = tasks[taskIndex];

    const cfg = agent.config || { targeting: { industries: ['various'], locations: ['Dubai, UAE'] } };
    const inds = cfg.targeting?.industries?.join(', ') || 'various industries';
    const locs = cfg.targeting?.locations?.join(', ') || 'Dubai, UAE';

    // ââ 5. Build prompt based on task type ââ
    let prompt, label;
    const agentLeads = allLeads.filter(l => l.assigned_to === agent.id);


    // ── Cross-agent dedup: build exclusion list of ALL existing lead names ──
    const existingLeadNames = allLeads.map(l => l.name).filter(Boolean);
    const exclusionSnippet = existingLeadNames.length > 0
      ? '\n\nIMPORTANT — DO NOT suggest any of these companies (already in our CRM):\n' + existingLeadNames.slice(0, 40).join(', ') + '\nFind completely NEW companies not on this list.\n'
      : '';

    // ── Cross-agent industry guard: list other agents' industries so AI avoids overlap ──
    const otherAgents = agents.filter(a => a.id !== agent.id && (a.role === 'sales' || a.role === agent.role));
    const industryGuard = otherAgents.length > 0
      ? '\nNote: Other team members are handling these industries — STAY IN YOUR LANE and only prospect ' + inds + ':\n' + otherAgents.map(a => '- ' + a.name + ': ' + (a.config?.targeting?.industries || []).join(', ')).join('\n') + '\n'
      : '';

    // Rotate prospecting sources for variety
    const prospectSources = [
      { source: 'google-maps', label: 'Google Maps' },
      { source: 'exhibitions', label: 'Exhibition Events' },
      { source: 'general', label: 'Industry Research' },
    ];
    const sourceIdx = Math.floor(minuteOfDay / (agents.length * tasks.length)) % prospectSources.length;
    const prospectSource = prospectSources[sourceIdx];

    // Exhibition venues in UAE for event-based prospecting
    const EXHIBITION_VENUES = [
      'Dubai World Trade Centre (DWTC) â Sheikh Zayed Road, Dubai',
      'Abu Dhabi National Exhibition Centre (ADNEC) â Khaleej Al Arabi St, Abu Dhabi',
      'Expo City Dubai â Dubai South',
      'Sharjah Expo Centre â Al Taawun, Sharjah',
      'Dubai International Convention and Exhibition Centre (DICEC)',
      'Madinat Jumeirah Conference Centre â Dubai',
      'Meydan Racecourse & Events â Nad Al Sheba, Dubai',
      'Festival Arena by InterContinental â Dubai Festival City',
      'Atlantis The Palm â Events & Conferences',
      'Coca-Cola Arena â City Walk, Dubai',
    ];

    if (tType === 'prospect') {
      if (prospectSource.source === 'google-maps') {
        prompt = `You are ${agent.name}, ${agent.title} at Kapturise (Dubai creative media agency).

TASK: Search Google Maps in ${locs} for businesses in ${inds} that would need photography, videography, or content creation services.

Think like you're browsing Google Maps in these areas of Dubai/UAE: JBR, Downtown Dubai, DIFC, Business Bay, Marina, Al Quoz, Jumeirah, Deira, Karama, Al Barsha, Abu Dhabi Corniche, Yas Island, Sharjah Al Majaz.

Find 3 REAL businesses that actually exist on Google Maps. Prioritize:
- Newly opened restaurants, cafes, hotels (they need launch content)
- Real estate agencies and developers (they need property photography)
- Event venues and wedding halls (they need event coverage)
- Retail stores and e-commerce brands (they need product photography)
- Corporate offices opening new branches (they need headshots + office content)

For EACH, provide: company name, Google Maps area/neighborhood, contact person (realistic title), industry, likely email (info@company.com format), Instagram handle, estimated project value in AED (2000-8000), and why they need Kapturise services right now.
${exclusionSnippet}${industryGuard}
Services: ${pricingStr}
Respond ONLY with a JSON array: [{"company":"...","contact":"...","title":"...","industry":"...","email":"...","instagram":"...","linkedin":"...","estimatedValue":3500,"suggestedService":"...","website":"...","notes":"Found on Google Maps in [area] â [reason they need content]"}]`;
        label = `Scouting Google Maps in ${locs} for ${inds.split(',')[0]}`;

      } else if (prospectSource.source === 'exhibitions') {
        const venueSubset = EXHIBITION_VENUES.slice(0, 5 + (minuteOfDay % 5)).join('\n- ');
        prompt = `You are ${agent.name}, ${agent.title} at Kapturise (Dubai creative media agency).

TASK: Find businesses that are exhibiting at or organizing upcoming events/exhibitions/conferences in the UAE.

Major UAE exhibition venues:
- ${venueSubset}

Think about what events typically happen in ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} and the coming months at these venues: trade shows, tech conferences, food expos, property shows, fashion events, health & wellness expos, auto shows, education fairs, wedding exhibitions, art fairs.

Find 3 REAL companies that are likely exhibiting, sponsoring, or organizing events at these venues. These companies need:
- Event photography & videography coverage
- Exhibition booth content creation
- Speaker/panel video recording
- Social media content from their event
- Post-event highlight reels

For EACH, provide: company name, the event/exhibition they're connected to, contact person (Marketing Manager or Events Coordinator), industry, likely email, Instagram handle, estimated project value in AED (3000-8000 for event coverage), and which Kapturise service fits.
${exclusionSnippet}${industryGuard}
Services: ${pricingStr}
Respond ONLY with a JSON array: [{"company":"...","contact":"...","title":"...","industry":"...","email":"...","instagram":"...","linkedin":"...","estimatedValue":5500,"suggestedService":"Event Coverage","website":"...","notes":"Exhibiting at [venue/event] â needs [specific content type]"}]`;
        label = `Scouting exhibition events for prospects`;

      } else {
        prompt = `You are ${agent.name}, ${agent.title} at Kapturise (Dubai creative media agency). Find 3 NEW REAL business prospects in ${locs} in ${inds}. These must be REAL companies that actually exist â use your knowledge of businesses in Dubai/UAE. For EACH, provide: company name, contact person (use a realistic title like Marketing Manager, not a made-up name), title, industry, their likely email format (e.g. info@company.com), Instagram handle if known, LinkedIn URL if known, estimated project value in AED (use realistic Kapturise pricing: 2000-5000 for single shoots, 3000-8000 for packages), and suggested Kapturise service.\n${exclusionSnippet}${industryGuard}\nServices: ${pricingStr}\nRespond ONLY with a JSON array: [{"company":"...","contact":"...","title":"...","industry":"...","email":"...","instagram":"...","linkedin":"...","estimatedValue":3500,"suggestedService":"...","notes":"..."}]`;
        label = `Finding 3 prospects in ${inds.split(',')[0]}`;
      }

    } else if (tType === 'event-scout') {
      // Scrape exhibition venue websites for exhibitors & upcoming events
      const VENUE_URLS = [
        { name: 'Dubai World Trade Centre', url: 'https://www.dwtc.com/en/events', city: 'Dubai' },
        { name: 'ADNEC Abu Dhabi', url: 'https://adnec.ae/events', city: 'Abu Dhabi' },
        { name: 'Expo City Dubai', url: 'https://www.expocitydubai.com/en/events', city: 'Dubai' },
        { name: 'Sharjah Expo Centre', url: 'https://www.expo-centre.ae/events', city: 'Sharjah' },
      ];
      const venue = VENUE_URLS[minuteOfDay % VENUE_URLS.length];
      prompt = `You are ${agent.name}, ${agent.title} at Kapturise (Dubai creative media agency).

TASK: You are researching upcoming events at ${venue.name} (${venue.url}) in ${venue.city}.

Based on your knowledge of events typically held at ${venue.name}, identify 3 REAL companies/brands that are likely to be:
- Exhibiting at upcoming trade shows, conferences, or expos
- Organizing corporate events, product launches, or galas
- Sponsoring conferences or industry events

These companies need EVENT COVERAGE services from Kapturise:
- Event photography (AED 1,600+ for 2hrs, AED 3,000+ for photo+video package)
- Event videography with highlight reel (AED 2,000+ for 2hrs)
- Exhibition booth content creation
- Speaker/panel recording
- Social media content from their event
- Post-event highlight reels

For EACH company, provide: company name, the specific event/exhibition they're at, contact person (Events Coordinator or Marketing Manager), industry, email (use info@ or events@ format), Instagram, estimated value (AED 3,000-8,000), and what specific content they need.
${exclusionSnippet}
Respond ONLY with a JSON array: [{"company":"...","contact":"...","title":"Events Coordinator","industry":"Events","email":"...","instagram":"...","linkedin":"...","estimatedValue":5500,"suggestedService":"Event Coverage","website":"...","notes":"Exhibiting at ${venue.name} â [event name] â needs event photography + highlight reel"}]`;
      label = `Scouting exhibitors at ${venue.name}`;

    } else if (tType === 'outreach') {
      const eligibleLeads = agentLeads.filter(l =>
        ['Research', 'Warm-Up'].includes(l.stage) ||
        (l.stage === 'First Contact' && !(l.logs || []).some(lg => lg.type === 'email'))
      );
      if (eligibleLeads.length > 0) {
        const lead = eligibleLeads[Math.floor(Math.random() * eligibleLeads.length)];
        const indTemplate = getTemplateForIndustry(lead.industry || '');
        const rendered = renderTemplate(indTemplate, {
          contactName: lead.contact_name || 'there',
          company: lead.name || 'your company',
        });
        prompt = `You are ${agent.name} at Kapturise. Write personalized outreach for:\n\nCompany: ${lead.name}\nContact: ${lead.contact_name} (${lead.contact_title})\nIndustry: ${lead.industry}\nNotes: ${lead.notes || 'none'}\nWebsite: ${lead.website || 'not provided'}\n\nHere is the APPROVED email template for this industry. Use this as the base â personalize it with the prospect's specific details but keep the pricing, services, portfolio links, and contact info exactly as shown:\n\n--- APPROVED TEMPLATE ---\nSubject: ${rendered.subject}\n\n${rendered.body}\n--- END TEMPLATE ---\n\nNow write:\n1. EMAIL: Personalize the template above for ${lead.name}. Keep the pricing and services EXACT. Add 1-2 personalized sentences about their specific business.\n2. INSTAGRAM DM: Under 3 sentences, casual, reference their business by name, mention the most relevant service and starting price.\n3. LINKEDIN NOTE: Under 300 chars, professional tone, mention relevant service.\n\nIMPORTANT RULES:\n- Use EXACT pricing from the template (do NOT make up prices)\n- Include the company profile PDF link: https://kapturise-ai-agents.vercel.app/Kapturise-Company-Profile.pdf\n- Include portfolio video links from the template\n- Keep email under 200 words\n- Professional Dubai tone (friendly, direct, value-focused)\n- CTA: contact@kapturise.com / 055-913-7354`;
        label = `Writing ${indTemplate.name} outreach for ${lead.name}`;
      } else {
        const coldTemplate = getTemplateForIndustry(inds.split(',')[0]?.trim() || '');
        prompt = `You are ${agent.name} at Kapturise. Write 3 cold outreach templates for ${inds} businesses in ${locs}.\n\nUse this approved template style and pricing:\nTemplate: ${coldTemplate.name}\nSubject: ${coldTemplate.subject}\n\nFor each, include: email + Instagram DM + LinkedIn note.\nUse EXACT pricing from Kapturise templates. Include company profile link: https://kapturise-ai-agents.vercel.app/Kapturise-Company-Profile.pdf`;
        label = `Creating ${coldTemplate.name} outreach templates`;
      }

    } else if (tType === 'follow-up') {
      const nowMs = Date.now();
      const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
      const followUpLeads = agentLeads.filter(l => {
        if (['Qualify', 'Discovery Call', 'Proposal'].includes(l.stage)) return true;
        if (l.stage === 'First Contact' && (l.logs || []).some(lg => lg.type === 'email')) {
          const emailLog = (l.logs || []).filter(lg => lg.type === 'email').pop();
          if (emailLog?.date) {
            const logDate = new Date(emailLog.date + ' 2026');
            return !isNaN(logDate) && (nowMs - logDate.getTime()) >= THREE_DAYS;
          }
          return true;
        }
        return false;
      });
      if (followUpLeads.length > 0) {
        const lead = followUpLeads[0];
        const indTemplate = getTemplateForIndustry(lead.industry || '');
        const isFirstFollowUp = lead.stage === 'First Contact';
        const followUpContext = isFirstFollowUp
          ? `\n\nThis is a FIRST FOLLOW-UP â they were sent an initial outreach email but haven't replied yet. Be warm, reference the previous email, and add a new angle or value proposition.`
          : '';
        prompt = `You are ${agent.name} at Kapturise. Write a follow-up for:\n${lead.name} (${lead.contact_name}), Stage: ${lead.stage}, Value: AED ${lead.value}, Industry: ${lead.industry || 'general'}\nLast interaction: ${lead.logs?.[lead.logs.length - 1]?.msg || 'none'}\n\nUse pricing from the ${indTemplate.name} template:\n${indTemplate.body?.slice(0, 500) || 'Standard Kapturise pricing'}\n\nWrite a warm follow-up email that moves the deal forward. Reference specific services and pricing from the template above. Include the company profile link: https://kapturise-ai-agents.vercel.app/Kapturise-Company-Profile.pdf${followUpContext}`;
        label = `Following up with ${lead.name}`;
      } else {
        prompt = `Write 3 follow-up templates for prospects who haven't replied. Include company profile link: https://kapturise-ai-agents.vercel.app/Kapturise-Company-Profile.pdf`;
        label = 'Creating follow-up templates';
      }

    } else if (tType === 'qualify') {
      if (agentLeads.length > 0) {
        const lead = agentLeads[Math.floor(Math.random() * agentLeads.length)];
        prompt = `Analyze lead: ${lead.name}, ${lead.industry}, AED ${lead.value}, Stage: ${lead.stage}. Score 1-100, insights, next action, recommended service.`;
        label = `Qualifying ${lead.name}`;
      } else {
        prompt = `Analyze ${inds} market buying signals for creative services.`;
        label = 'Market analysis';
      }

    } else if (tType === 'content') {
      const plat = ['Instagram', 'LinkedIn', 'TikTok'][minuteOfDay % 3];
      const topics = ['Photography tips', 'Behind-the-scenes', 'Client success', 'Dubai creative industry', 'Portfolio showcase'];
      prompt = `You are ${agent.name}, ${agent.title} at Kapturise. Create 1 ${plat} post: caption, hashtags, posting time, visual description. Topic: ${topics[minuteOfDay % 5]}. Brand: Premium Dubai creative agency.`;
      label = `Creating ${plat} content`;

    } else if (tType === 'engagement') {
      prompt = `You are ${agent.name} at Kapturise. Write 5 genuine Instagram comments for ${inds} prospects and 2 story replies. No sales pitch.`;
      label = 'Engaging on social media';

    } else if (tType === 'check-in' || tType === 'upsell') {
      prompt = `You are ${agent.name} at Kapturise. Write 2 client ${tType === 'check-in' ? 'check-in' : 'upsell'} email templates.`;
      label = tType === 'check-in' ? 'Client check-in' : 'Finding upsell opportunities';

    } else {
      prompt = `Analyze pipeline: ${allLeads.length} leads, AED ${allLeads.reduce((s, l) => s + (l.value || 0), 0)}. Insights and recommendations.`;
      label = 'Pipeline analysis';
    }

    // ââ 6. Call AI ââ
    const systemPrompt = buildSystemPrompt(agent);
    const result = await callAI(systemPrompt, prompt);

    const actions = []; // Track what happened

    // ââ 7. Process results ââ

    // 7a. Parse prospects into new leads (prospect + event-scout both create leads)
    if (tType === 'prospect' || tType === 'event-scout') {
      const newLeads = parseProspects(result, agent.id, agent);
      if (newLeads.length > 0) {
        // Check for duplicates — fuzzy match to catch slight name variations
        const existingNamesArr = allLeads.map(l => (l.name || '').toLowerCase().trim());
        const normalize = (n) => (n || '').toLowerCase().trim().replace(/\b(llc|fz|fze|fzc|dmcc|co|inc|ltd|group|dubai|abu dhabi|uae)\b/g, '').replace(/[^a-z0-9]/g, '');
        const existingNorm = new Set(existingNamesArr.map(normalize));
        const unique = newLeads.filter(nl => {
          const norm = normalize(nl.name);
          if (existingNorm.has(norm)) return false;
          for (const en of existingNorm) {
            if (en && norm && (en.includes(norm) || norm.includes(en)) && Math.min(en.length, norm.length) > 4) return false;
          }
          return true;
        });
        if (unique.length > 0) {
          const { error: insertErr } = await supabase.from('leads').insert(unique);
          if (insertErr) {
            actions.push(`Failed to insert leads: ${insertErr.message}`);
          } else {
            actions.push(`Added ${unique.length} new leads`);
          }
        } else {
          actions.push('No new unique leads found');
        }
      } else {
        actions.push('No leads parsed from AI response');
      }
    }

    // 7b. Log outreach/follow-up to matched leads
    if (['outreach', 'follow-up', 'dm', 'connect', 'call'].includes(tType)) {
      if (agentLeads.length > 0) {
        const lead = agentLeads[0];
        const newLog = {
          type: 'note',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          msg: `Server auto: ${label}`,
          summary: label,
          transcript: result.slice(0, 2000),
        };
        const updatedLogs = [...(lead.logs || []), newLog];
        await supabase.from('leads').update({ logs: updatedLogs }).eq('id', lead.id);
        actions.push(`Logged activity to ${lead.name}`);
      }
    }

    // 7c. Send actual email if outreach
    if (tType === 'outreach') {
      const eligibleLeads = agentLeads.filter(l =>
        ['Research', 'Warm-Up'].includes(l.stage) ||
        (l.stage === 'First Contact' && !(l.logs || []).some(lg => lg.type === 'email'))
      );

      if (eligibleLeads.length > 0) {
        const lead = eligibleLeads[Math.floor(Math.random() * eligibleLeads.length)];
        const leadEmail = lead.email || '';

        // Email provider from env vars (uses existing Vercel env var names)
        const gmailPass = process.env.GMAIL_APP_PASSWORD;
        const gmailEmail = process.env.GMAIL_EMAIL || 'contact@kapturise.com';
        const emailProvider = gmailPass ? 'gmail' : process.env.EMAIL_PROVIDER;
        const emailApiKey = gmailPass || process.env.EMAIL_API_KEY;
        const emailFrom = gmailEmail || process.env.EMAIL_FROM || 'contact@kapturise.com';

        if (leadEmail && emailProvider && emailApiKey) {
          try {
            let { subject, body } = parseEmailFromAI(result);
            body = body.replace(/\{\{agentName\}\}/g, agent.name || 'Kapturise Team')
              .replace(/\{\{agentTitle\}\}/g, agent.title || 'Sales Representative');
            subject = subject.replace(/\{\{agentName\}\}/g, agent.name || 'Kapturise Team')
              .replace(/\{\{agentTitle\}\}/g, agent.title || 'Sales Representative');

            const emailResult = await sendEmail({
              to: leadEmail, subject, body,
              provider: emailProvider, apiKey: emailApiKey, from: emailFrom,
            });

            if (emailResult.success) {
              const emailLog = {
                type: 'email',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                msg: `Server: Email sent to ${leadEmail}`,
                summary: `Email: ${subject}`,
                transcript: `To: ${leadEmail}\nSubject: ${subject}\n\n${body}`,
              };
              const updatedLogs = [...(lead.logs || []), emailLog];
              const newStage = lead.stage === 'Research' ? 'First Contact' : lead.stage;
              await supabase.from('leads')
                .update({ logs: updatedLogs, stage: newStage })
                .eq('id', lead.id);
              actions.push(`Email sent to ${lead.name} (${leadEmail})`);
            }
          } catch (emailErr) {
            const errLog = {
              type: 'note',
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              msg: `Server email error: ${emailErr.message}`,
              summary: 'Email send error',
            };
            const updatedLogs = [...(lead.logs || []), errLog];
            await supabase.from('leads').update({ logs: updatedLogs }).eq('id', lead.id);
            actions.push(`Email failed for ${lead.name}: ${emailErr.message}`);
          }
        } else if (leadEmail && !emailProvider) {
          actions.push(`Email skipped for ${lead.name}: no GMAIL_APP_PASSWORD or EMAIL_PROVIDER env var set`);
        } else {
          actions.push(`Email skipped: lead has no email address`);
        }
      }
    }

    // 7d. Escalation detection
    if (result && ['outreach', 'follow-up', 'dm', 'connect', 'call', 'qualify'].includes(tType)) {
      const lower = result.toLowerCase();
      const escalationTriggers = [
        { pattern: /discount|lower price|too expensive|budget.{0,20}(tight|limited|small)/i, flag: 'Price Negotiation' },
        { pattern: /custom.{0,15}(package|plan|solution|request|need)/i, flag: 'Custom Request' },
        { pattern: /competitor|other.{0,10}(agency|company|option|quote)/i, flag: 'Competitor Threat' },
        { pattern: /urgent|asap|rush|last.{0,5}minute/i, flag: 'Urgent Request' },
        { pattern: /large.{0,10}(event|project|order|volume)|annual.{0,10}(contract|retainer)/i, flag: 'Enterprise Deal' },
        { pattern: /not.{0,5}interested|no.{0,5}thank|pass/i, flag: 'Declined' },
      ];
      if (agentLeads.length > 0) {
        const lead = agentLeads[0];
        const matchedFlags = escalationTriggers.filter(t => t.pattern.test(lower));
        if (matchedFlags.length > 0) {
          const flagNames = matchedFlags.map(f => f.flag);
          const escLog = {
            type: 'note',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            msg: `ESCALATION: ${flagNames.join(', ')}`,
          };
          const currentLogs = lead.logs || [];
          await supabase.from('leads')
            .update({ logs: [...currentLogs, escLog] })
            .eq('id', lead.id);
          actions.push(`Escalation flagged for ${lead.name}: ${flagNames.join(', ')}`);
        }
      }
    }

    // ââ 8. Log to activity_logs ââ
    await supabase.from('activity_logs').insert({
      agent_id: agent.id,
      message: `[CRON] ${label} | ${actions.join(' | ') || 'completed'}`,
    });

    return Response.json({
      ok: true,
      agent: agent.name,
      role,
      task: tType,
      label,
      actions,
      timestamp: now.toISOString(),
    });

  } catch (error) {
    // Log error
    try {
      const supabaseForLog = getSupabase();
      if (supabaseForLog) {
        await supabaseForLog.from('activity_logs').insert({
          agent_id: null,
          message: `[CRON ${error.isRateLimit ? 'RATE_LIMITED' : 'ERROR'}] ${error.message}`,
        });
      }
    } catch (_) { /* ignore logging errors */ }

    // Rate-limit â return 200 so cron-job.org doesn't flag failures
    if (error.isRateLimit) {
      return Response.json({
        ok: true,
        skipped: true,
        reason: 'rate_limited',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    return Response.json({
      ok: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
