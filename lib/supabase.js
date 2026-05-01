import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase not configured — falling back to localStorage');
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ═══ Storage adapter — uses Supabase if available, localStorage as fallback ═══
export const storage = {
  async get(key) {
    if (supabase) {
      // Map keys to tables
      const table = keyToTable(key);
      if (table) {
        const { data, error } = await supabase.from(table).select('*');
        if (!error && data && data.length > 0) {
          // Reverse-map DB column names back to app field names
          const mapped = data.map(row => reverseTableMapper(table, row));
          // Single-object tables (company_info, api_keys) return the object directly
          const singleTables = ['company_info', 'api_keys'];
          const result = singleTables.includes(table) ? mapped[0] : mapped;
          return { key, value: JSON.stringify(result) };
        }
      }
    }
    // Fallback to localStorage
    try {
      const val = localStorage.getItem(`kap_${key}`);
      return val ? { key, value: val } : null;
    } catch { return null; }
  },

  async set(key, value) {
    if (supabase) {
      const table = keyToTable(key);
      if (table) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          // Upsert array data
          const { error } = await supabase.from(table).upsert(
            parsed.map(row => tableMapper(table, row)),
            { onConflict: 'id' }
          );
          if (!error) return { key, value };
        } else {
          // Single object (company_info, api_keys)
          const { error } = await supabase.from(table).upsert(
            { id: 1, ...tableMapper(table, parsed) },
            { onConflict: 'id' }
          );
          if (!error) return { key, value };
        }
      }
    }
    // Fallback
    try {
      localStorage.setItem(`kap_${key}`, value);
      return { key, value };
    } catch { return null; }
  },

  async delete(key) {
    try { localStorage.removeItem(`kap_${key}`); return { key, deleted: true }; }
    catch { return null; }
  },

  async list(prefix) {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(`kap_${prefix || ''}`)) keys.push(k.replace('kap_', ''));
      }
      return { keys };
    } catch { return { keys: [] }; }
  }
};

// Map storage keys to Supabase table names
function keyToTable(key) {
  const map = {
    'k8-ag': 'agents',
    'k7-ld': 'leads',
        'k10-ld': 'leads',
    'k8-inv': 'investors',
        'k10-inv': 'investors',
    'k7-pr': 'pricing',
    'k7-cm': 'campaigns',
    'k7-scripts': null, // scripts are structured differently
    'k7-so': 'social_accounts',
        'k8-so': 'social_accounts',
        'k8-so2': 'social_accounts',
    'k7-co': 'company_info',
    'k7-ak': null, // API keys stored in localStorage — DB schema only has 3 columns
  };
  return map[key] || null;
}

// Map app field names to database column names
function tableMapper(table, row) {
  if (table === 'leads') {
    return {
      id: row.id, name: row.name, website: row.website, industry: row.ind,
      stage: row.stage, contact_name: row.contactName, contact_title: row.contactTitle,
      email: row.email, phone: row.phone, instagram: row.ig, linkedin: row.linkedin,
      value: row.val, notes: row.notes, requirements: row.requirements,
      source: row.src, source_type: row.srcType, assigned_to: row.assignedTo,
      service_type: row.serviceType, logs: row.logs,
    };
  }
  if (table === 'investors') {
    return {
      id: row.id, fund: row.fund, fund_size: row.size, thesis: row.thesis,
      stage_focus: row.stageFocus, partner_name: row.partner, partner_title: row.partnerTitle,
      email: row.email, phone: row.phone, linkedin: row.linkedin,
      check_min: row.checkMin, check_max: row.checkMax, portfolio: row.portfolio,
      stage: row.stage, pitch_deck: row.pitchDeck, dd_status: row.ddStatus,
      term_sheet: row.termSheet, meeting_notes: row.meetingNotes,
      next_follow_up: row.nextFollowUp, assigned_to: row.assignedTo,
    };
  }
  if (table === 'company_info') {
    return {
      id: 1, name: row.name, tagline: row.tagline, owner_name: row.owner,
      owner_title: row.ownerTitle, owner_email: row.ownerEmail, owner_phone: row.ownerPhone,
      email: row.email, phone: row.phone, website: row.website, address: row.address,
      license: row.license, instagram: row.instagram, linkedin: row.linkedin,
      tiktok: row.tiktok, youtube: row.youtube, facebook: row.facebook,
      about: row.about, usp: row.usp, founded: row.founded, team_size: row.team,
    };
  }
  if (table === 'api_keys') {
    return { id: 1, gemini_key: row.gemini, bland_key: row.bland, bland_phone: row.blandPhone };
  }
  // Default: pass through (agents, pricing, campaigns, social_accounts)
  return row;
}

// Reverse-map database column names back to app field names
function reverseTableMapper(table, row) {
  if (table === 'leads') {
    return {
      id: row.id, name: row.name, website: row.website, ind: row.industry,
      stage: row.stage, contactName: row.contact_name, contactTitle: row.contact_title,
      email: row.email, phone: row.phone, ig: row.instagram, linkedin: row.linkedin,
      val: row.value, notes: row.notes, requirements: row.requirements,
      src: row.source, srcType: row.source_type, assignedTo: row.assigned_to,
      serviceType: row.service_type, logs: row.logs, createdAt: row.created_at,
    };
  }
  if (table === 'investors') {
    return {
      id: row.id, fund: row.fund, size: row.fund_size, thesis: row.thesis,
      stageFocus: row.stage_focus, partner: row.partner_name, partnerTitle: row.partner_title,
      email: row.email, phone: row.phone, linkedin: row.linkedin,
      checkMin: row.check_min, checkMax: row.check_max, portfolio: row.portfolio,
      stage: row.stage, pitchDeck: row.pitch_deck, ddStatus: row.dd_status,
      termSheet: row.term_sheet, meetingNotes: row.meeting_notes,
      nextFollowUp: row.next_follow_up, assignedTo: row.assigned_to,
    };
  }
  if (table === 'company_info') {
    return {
      name: row.name, tagline: row.tagline, owner: row.owner_name,
      ownerTitle: row.owner_title, ownerEmail: row.owner_email, ownerPhone: row.owner_phone,
      email: row.email, phone: row.phone, website: row.website, address: row.address,
      license: row.license, instagram: row.instagram, linkedin: row.linkedin,
      tiktok: row.tiktok, youtube: row.youtube, facebook: row.facebook,
      about: row.about, usp: row.usp, founded: row.founded, team: row.team_size,
    };
  }
  if (table === 'api_keys') {
    return { gemini: row.gemini_key, bland: row.bland_key, blandPhone: row.bland_phone };
  }
  // Default: pass through
  return row;
}
