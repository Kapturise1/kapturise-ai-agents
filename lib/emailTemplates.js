// Email templates for industry-specific outreach
// Short, professional cold outreach — AI Video Retainer is PRIORITY pitch
// All prices are STARTING FROM prices, exclude 5% VAT

const PROFILE_PDF = 'https://kapturise-ai-agents.vercel.app/Kapturise-Company-Profile.pdf';

const PORTFOLIO = {
  emigala: 'https://www.youtube.com/watch?v=J_nMQ-1o6vo',
  stepDubai: 'https://www.youtube.com/watch?v=LsyMQSAsHKU',
  mastercard: 'https://www.youtube.com/watch?v=ITlaVqPHI3U',
  talabat: 'https://www.youtube.com/watch?v=kMhvLgf5MTQ',
};

// ── Reusable HTML components ──
const S = {
  wrap: 'font-family:Arial,sans-serif;color:#333;line-height:1.7;max-width:600px;',
  tbl: 'width:100%;border-collapse:collapse;margin:12px 0;',
  th: 'padding:8px 10px;text-align:left;border:1px solid #333;font-size:14px;',
  thR: 'padding:8px 10px;text-align:right;border:1px solid #333;font-size:14px;',
  td: 'padding:8px 10px;border:1px solid #ddd;font-size:14px;',
  tdR: 'padding:8px 10px;border:1px solid #ddd;text-align:right;white-space:nowrap;font-size:14px;',
  alt: 'background:#f9f9f9;',
  hl: 'background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;padding:16px;border-radius:8px;margin:16px 0;',
};

function row(svc, inc, price, alt) {
  return `<tr${alt ? ` style="${S.alt}"` : ''}><td style="${S.td}"><strong>${svc}</strong></td><td style="${S.td}">${inc}</td><td style="${S.tdR}"><strong>${price}</strong></td></tr>`;
}

function hdr() {
  return `<tr style="background:#1a1a2e;color:#fff;"><th style="${S.th}">Service</th><th style="${S.th}">What's Included</th><th style="${S.thR}">Starting From</th></tr>`;
}

// AI Video Retainer — PRIORITY highlight box
function aiVideoBlock() {
  return `<div style="${S.hl}">
  <p style="margin:0 0 8px;font-size:17px;"><strong>&#129302; AI Video Monthly Retainer — NEW</strong></p>
  <table style="width:100%;border-collapse:collapse;margin:8px 0;">
    <tr><td style="color:#fff;padding:4px 0;"><strong>Standard</strong> — 15 AI videos/month (30-60s each)</td><td style="color:#25D366;text-align:right;padding:4px 0;white-space:nowrap;"><strong>AED 20,000/mo</strong></td></tr>
    <tr><td style="color:#fff;padding:4px 0;"><strong>Premium</strong> — 30 AI videos/month (30-60s each)</td><td style="color:#25D366;text-align:right;padding:4px 0;white-space:nowrap;"><strong>AED 35,000/mo</strong></td></tr>
  </table>
  <p style="margin:8px 0 0;font-size:13px;color:#ccc;">Includes: professional scripts, motion graphics, royalty-free music, brand-consistent style. 6-month retainer commitment. Prices excl. 5% VAT.</p>
</div>`;
}

function cta(subject) {
  const wa = '971559137354';
  const msg = encodeURIComponent(`Hi Kapturise! I'm interested in ${subject}. Can we chat?`);
  return `<p style="margin:16px 0 8px;"><a href="https://wa.me/${wa}?text=${msg}" style="background:#25D366;color:#fff;padding:10px 24px;text-decoration:none;border-radius:5px;font-weight:bold;font-size:14px;">&#128172; Let's Chat on WhatsApp</a></p>`;
}

function sig() {
  return `<p style="margin-top:20px;">Best regards,</p>
<p style="margin:0;"><strong>{{agentName}}</strong></p>
<p style="margin:0;color:#888;font-size:13px;">{{agentTitle}}, Kapturise</p>
<p style="margin:0;color:#888;font-size:13px;">contact@kapturise.com | +971 55 913 7354 | <a href="https://www.kapturise.com">kapturise.com</a></p>`;
}

function portfolio(items) {
  return `<p style="font-size:13px;margin:12px 0 4px;"><strong>See our work:</strong> ${items.map(([n, u]) => `<a href="${u}" style="color:#e74c3c;">${n}</a>`).join(' &bull; ')}</p>`;
}

function profileLink() {
  return `<p style="font-size:13px;">&#128206; <a href="${PROFILE_PDF}" style="color:#e74c3c;">Download Our Company Profile (PDF)</a></p>`;
}

// ════════════════════════════════════════════
// TEMPLATES — short cold outreach, AI Video first
// ════════════════════════════════════════════

export const EMAIL_TEMPLATES = {

  "food-and-beverage": {
    name: "Food & Beverage",
    subject: "AI videos + food content for {{company}} — from AED 1,500",
    body: `<div style="${S.wrap}">
<p>Hi {{contactName}},</p>
<p>I'm {{agentName}} from <strong>Kapturise</strong> — the UAE's largest on-demand creative platform. Official media partner for Emigala, Step Conference, and Dubai Fitness Challenge. Clients include Mastercard, Talabat, and 200+ brands.</p>
<p>We help F&B brands like {{company}} create scroll-stopping content that drives orders — and our new <strong>AI Video Retainer</strong> is perfect for consistent social media content.</p>
${aiVideoBlock()}
<p><strong>We also offer:</strong></p>
<table style="${S.tbl}">
${hdr()}
${row('&#128248; Food Photography', '10 dishes, 3hr shoot, edited images, styling, professional camera', 'AED 2,500 + VAT', true)}
${row('&#127916; Food Videography', '5 dishes, 3 social clips (15-30s), editing + music', 'AED 3,500 + VAT', false)}
${row('&#129302; AI Product Video', 'AI video with real people (30-60s), script, motion graphics, music', 'AED 1,500 + VAT', true)}
</table>
<p style="color:#888;font-size:12px;">* Starting prices, excl. 5% VAT. Customized based on scope.</p>
${portfolio([['Talabat Campaign', PORTFOLIO.talabat], ['Emigala Event', PORTFOLIO.emigala]])}
${profileLink()}
<p>Would love to chat about how we can help {{company}} — even a quick 5-minute call works.</p>
${cta('F&B Content for ' + '{{company}}')}
${sig()}
</div>`
  },

  "real-estate": {
    name: "Real Estate",
    subject: "AI property videos + photography for {{company}} — from AED 1,500",
    body: `<div style="${S.wrap}">
<p>Hi {{contactName}},</p>
<p>I'm {{agentName}} from <strong>Kapturise</strong> — the UAE's largest on-demand creative platform. Official media partner for Emigala, Step Conference, and Dubai Fitness Challenge.</p>
<p>We help real estate companies like {{company}} showcase properties with professional visuals that sell — and our new <strong>AI Video Retainer</strong> is ideal for listing videos and social content at scale.</p>
${aiVideoBlock()}
<p><strong>We also offer:</strong></p>
<table style="${S.tbl}">
${hdr()}
${row('&#127968; Real Estate Photography', 'Set up, post-production, edited images, professional camera', 'AED 3,000 + VAT', true)}
${row('&#127916; Property Video Walkthrough', 'Cinematic walkthrough (60-90s), gimbal, drone available', 'AED 3,500 + VAT', false)}
${row('&#129302; AI Property Video', 'AI listing video (30-60s), script, motion graphics, music', 'AED 1,500 + VAT', true)}
</table>
<p style="color:#888;font-size:12px;">* Starting prices, excl. 5% VAT.</p>
${portfolio([['Emigala Event', PORTFOLIO.emigala], ['Mastercard Event', PORTFOLIO.mastercard]])}
${profileLink()}
<p>Properties with professional content sell 32% faster. Quick call this week?</p>
${cta('Real Estate Content for ' + '{{company}}')}
${sig()}
</div>`
  },

  "events": {
    name: "Events & Conferences",
    subject: "Event coverage + AI video content for {{company}} — from AED 1,500",
    body: `<div style="${S.wrap}">
<p>Hi {{contactName}},</p>
<p>I'm {{agentName}} from <strong>Kapturise</strong> — official media partner for Emigala, Step Conference, and Dubai Fitness Challenge. We've covered 500+ events across the UAE.</p>
<p>We provide end-to-end event coverage for {{company}} — and our new <strong>AI Video Retainer</strong> is perfect for pre-event promos and post-event content.</p>
${aiVideoBlock()}
<p><strong>Event coverage:</strong></p>
<table style="${S.tbl}">
${hdr()}
${row('&#127910; Event Coverage (Photo+Video)', '1 photographer + 1 videographer, 4hrs, 50 edited images + highlight video (60s)', 'AED 3,000 + VAT', true)}
${row('&#129302; AI Event Promo Video', 'AI promo/recap video (30-60s), script, motion graphics, music', 'AED 1,500 + VAT', false)}
</table>
<p style="color:#888;font-size:12px;">* Starting prices, excl. 5% VAT. Add-ons: extra crew, live streaming, stage build.</p>
${portfolio([['Emigala Event', PORTFOLIO.emigala], ['Step Conference', PORTFOLIO.stepDubai]])}
${profileLink()}
<p>Would love to help {{company}} capture your next event. Quick call?</p>
${cta('Event Coverage for ' + '{{company}}')}
${sig()}
</div>`
  },

  "corporate": {
    name: "Corporate & Branding",
    subject: "AI video content + corporate photography for {{company}} — from AED 1,500",
    body: `<div style="${S.wrap}">
<p>Hi {{contactName}},</p>
<p>I'm {{agentName}} from <strong>Kapturise</strong> — the UAE's largest on-demand creative platform. We work with brands like Mastercard, Talabat, and 200+ companies across Dubai.</p>
<p>We help corporate brands like {{company}} build a strong visual identity — and our new <strong>AI Video Retainer</strong> is ideal for LinkedIn content, internal comms, and brand videos at scale.</p>
${aiVideoBlock()}
<p><strong>We also offer:</strong></p>
<table style="${S.tbl}">
${hdr()}
${row('&#128084; Corporate Photography', '40 edited images, lifestyle + headshots, professional camera', 'AED 1,600 + VAT', true)}
${row('&#127916; Corporate Video', 'Script, TVC video (1 min), music, gimbal, wireless mic', 'AED 3,000 + VAT', false)}
${row('&#129302; AI Brand Video', 'AI video (30-60s), script, motion graphics, music', 'AED 1,500 + VAT', true)}
</table>
<p style="color:#888;font-size:12px;">* Starting prices, excl. 5% VAT.</p>
${portfolio([['Mastercard Event', PORTFOLIO.mastercard], ['Step Conference', PORTFOLIO.stepDubai]])}
${profileLink()}
<p>Would love to help {{company}} elevate your brand visuals. Quick call this week?</p>
${cta('Corporate Content for ' + '{{company}}')}
${sig()}
</div>`
  },

  "ecommerce": {
    name: "Ecommerce & Retail",
    subject: "AI product videos + photography for {{company}} — from AED 1,500",
    body: `<div style="${S.wrap}">
<p>Hi {{contactName}},</p>
<p>I'm {{agentName}} from <strong>Kapturise</strong> — the UAE's largest on-demand creative platform. Clients include Talabat, Mastercard, and 200+ brands.</p>
<p>We help ecommerce brands like {{company}} increase conversions with professional product content — and our new <strong>AI Video Retainer</strong> is perfect for product demos, ads, and social content at scale.</p>
${aiVideoBlock()}
<p><strong>We also offer:</strong></p>
<table style="${S.tbl}">
${hdr()}
${row('&#127912; Product Photography', '20 SKUs, 3 angles, 4hr shoot, edited images, white bg + styled', 'AED 3,000 + VAT', true)}
${row('&#127916; Product Videography', '5 products, 3 social clips (15-30s), editing + music', 'AED 3,500 + VAT', false)}
${row('&#129302; AI Product Video', 'AI product video (30-60s), script, motion graphics, music', 'AED 1,500 + VAT', true)}
</table>
<p style="color:#888;font-size:12px;">* Starting prices, excl. 5% VAT.</p>
${portfolio([['Talabat Campaign', PORTFOLIO.talabat], ['Emigala Event', PORTFOLIO.emigala]])}
${profileLink()}
<p>Professional product content can boost conversions by 40%. Quick call?</p>
${cta('Product Content for ' + '{{company}}')}
${sig()}
</div>`
  },

  "hospitality": {
    name: "Hospitality & Hotels",
    subject: "AI video content + hotel photography for {{company}} — from AED 1,500",
    body: `<div style="${S.wrap}">
<p>Hi {{contactName}},</p>
<p>I'm {{agentName}} from <strong>Kapturise</strong> — the UAE's largest on-demand creative platform. Official media partner for Emigala, Step Conference, and Dubai Fitness Challenge.</p>
<p>We help hospitality brands like {{company}} attract guests with premium visuals — and our new <strong>AI Video Retainer</strong> is perfect for property showcases, social content, and seasonal promos.</p>
${aiVideoBlock()}
<p><strong>We also offer:</strong></p>
<table style="${S.tbl}">
${hdr()}
${row('&#127968; Property Photography', 'Set up, post-production, edited images, professional camera', 'AED 3,000 + VAT', true)}
${row('&#127860; Food Photography', '10 dishes, 3hr shoot, edited images, styling', 'AED 2,500 + VAT', false)}
${row('&#129302; AI Hotel Video', 'AI showcase video (30-60s), script, motion graphics, music', 'AED 1,500 + VAT', true)}
</table>
<p style="color:#888;font-size:12px;">* Starting prices, excl. 5% VAT. Add-ons: drone, 360° VR tour, food stylist.</p>
${portfolio([['Emigala Event', PORTFOLIO.emigala], ['Mastercard Event', PORTFOLIO.mastercard]])}
${profileLink()}
<p>Would love to help {{company}} create content that inspires bookings. Quick call?</p>
${cta('Hospitality Content for ' + '{{company}}')}
${sig()}
</div>`
  },

  "investor": {
    name: "Investor Relations",
    subject: "Kapturise — Region's largest on-demand creative platform",
    body: `<div style="${S.wrap}">
<p>Hi {{contactName}},</p>
<p>I'm {{agentName}} from <strong>Kapturise</strong> — the region's first and largest on-demand platform for photographers, videographers, models, makeup artists, influencers, and studio rentals.</p>
<table style="${S.tbl}">
<tr style="background:#1a1a2e;color:#fff;"><th style="${S.th}">Highlight</th><th style="${S.th}">Details</th></tr>
${row('&#127942; Awards', 'Media Company of the Year 2023, Community App 2022, Tech Startup 2021', '', true)}
${row('&#128241; Platform', 'On-demand app on App Store & Google Play', '', false)}
${row('&#128101; Network', '400+ vetted creatives across UAE & GCC', '', true)}
${row('&#127910; Partnerships', 'Emigala, Step Conference, Dubai Fitness Challenge', '', false)}
${row('&#129302; AI Tech', 'AI-powered sales ops + AI Video Production', '', true)}
</table>
${portfolio([['Emigala Event', PORTFOLIO.emigala], ['Talabat Campaign', PORTFOLIO.talabat], ['Mastercard Event', PORTFOLIO.mastercard]])}
${profileLink()}
<p>We're building the "Uber for Photographers." Would love to share our growth story.</p>
${cta('Investor Inquiry - Kapturise')}
${sig()}
</div>`
  },

  "general": {
    name: "General / Fallback",
    subject: "AI video content + creative services for {{company}} — from AED 1,500",
    body: `<div style="${S.wrap}">
<p>Hi {{contactName}},</p>
<p>I'm {{agentName}} from <strong>Kapturise</strong> — the UAE's largest on-demand creative platform. Official media partner for Emigala, Step Conference, and Dubai Fitness Challenge. Clients include Mastercard, Talabat, and 200+ brands.</p>
<p>We provide end-to-end creative content for businesses like {{company}} — and our new <strong>AI Video Retainer</strong> is the fastest way to get consistent, professional video content for your brand.</p>
${aiVideoBlock()}
<p><strong>We also offer:</strong></p>
<table style="${S.tbl}">
${hdr()}
${row('&#128248; Photography', 'Professional shoots — food, real estate, corporate, product', 'From AED 1,600 + VAT', true)}
${row('&#127916; Videography', 'Edited video, music, gimbal, wireless mic', 'From AED 3,000 + VAT', false)}
${row('&#127910; Event Coverage', 'Photo + video, 4hrs, 50 images + highlight reel', 'AED 3,000 + VAT', true)}
${row('&#129302; AI Video (One-off)', 'AI video (30-60s), script, motion graphics, music', 'AED 1,500 + VAT', false)}
</table>
<p style="color:#888;font-size:12px;">* Starting prices, excl. 5% VAT. Customized based on scope.</p>
${portfolio([['Emigala Event', PORTFOLIO.emigala], ['Talabat Campaign', PORTFOLIO.talabat], ['Step Conference', PORTFOLIO.stepDubai]])}
${profileLink()}
<p>Would love to chat about how we can help {{company}}. Even a quick 5-minute call works.</p>
${cta('Content Inquiry for ' + '{{company}}')}
${sig()}
</div>`
  }
};

// Industry keyword mapping
const INDUSTRY_KEYWORDS = {
  "investor": ["venture capital", "vc", "angel invest", "family office", "accelerator", "incubator", "startup fund", "private equity", "investment fund", "seed fund", "growth equity", "innovation hub"],
  "food-and-beverage": ["food", "restaurant", "cafe", "bakery", "dining", "f&b", "hospitality food", "cloud kitchen", "delivery", "catering", "bistro", "bar", "lounge", "brunch", "kitchen"],
  "real-estate": ["real estate", "property", "realty", "realtor", "developer", "construction", "real estate broker", "real estate agent", "properties", "brokerage"],
  "events": ["event", "conference", "wedding", "gala", "summit", "expo", "festival", "production", "event organizer", "event management", "exhibition", "trade show", "concert"],
  "corporate": ["corporate", "tech", "consulting", "finance", "bank", "insurance", "law firm", "accounting", "b2b", "saas", "fintech", "legal"],
  "ecommerce": ["ecommerce", "retail", "shop", "store", "marketplace", "amazon", "commerce", "shopify", "online store", "fashion", "beauty", "luxury goods", "boutique store"],
  "hospitality": ["hotel", "resort", "spa", "wellness", "accommodation", "luxury hotel", "serviced apartments"],
};

/**
 * Get the appropriate email template based on industry
 */
export function getTemplateForIndustry(industry) {
  if (!industry) return EMAIL_TEMPLATES.general;
  const lower = industry.toLowerCase();
  for (const [key, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return EMAIL_TEMPLATES[key];
    }
  }
  return EMAIL_TEMPLATES.general;
}

/**
 * Render a template by replacing placeholders with actual data
 */
export function renderTemplate(template, data) {
  const { subject, body } = template;
  let renderedSubject = subject;
  let renderedBody = body;
  const placeholderRegex = /\{\{(\w+)\}\}/g;
  renderedSubject = renderedSubject.replace(placeholderRegex, (match, key) => data[key] || match);
  renderedBody = renderedBody.replace(placeholderRegex, (match, key) => data[key] || match);
  return { subject: renderedSubject, body: renderedBody };
}

export default EMAIL_TEMPLATES;
