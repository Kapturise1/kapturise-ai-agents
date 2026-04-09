// Email templates for industry-specific outreach
// HTML format with pricing tables, company profile, portfolio, and CTA
// Pricing sourced from Official Kapturise Pricing 2025
// All prices are STARTING FROM prices. Photos are Edited (Enhanced). Retouching is an add-on.

const PROFILE_PDF = 'https://kapturise-ai-agents.vercel.app/Kapturise-Company-Profile.pdf';

const PORTFOLIO = {
  emigala: 'https://www.youtube.com/watch?v=J_nMQ-1o6vo',
  stepDubai: 'https://www.youtube.com/watch?v=LsyMQSAsHKU',
  stepKSA: 'https://www.youtube.com/watch?v=hO2c3_jmnM0',
  mastercard: 'https://www.youtube.com/watch?v=ITlaVqPHI3U',
  globalVentures: 'https://www.youtube.com/watch?v=xTFR1xf4fb8',
  talabat: 'https://www.youtube.com/watch?v=kMhvLgf5MTQ',
  agilityAwards: 'https://www.youtube.com/watch?v=AKRtoL2-zWA',
  techInnovation: 'https://www.youtube.com/watch?v=O3QFNmolUuQ',
  enterpriseAgility: 'https://www.youtube.com/watch?v=EU-fDjz5Ono',
};

// Reusable HTML components
const tableStyle = 'width:100%;border-collapse:collapse;margin:16px 0;';
const thStyle = 'padding:10px;text-align:left;border:1px solid #333;';
const thStyleR = 'padding:10px;text-align:right;border:1px solid #333;';
const tdStyle = 'padding:10px;border:1px solid #ddd;';
const tdStyleR = 'padding:10px;border:1px solid #ddd;text-align:right;white-space:nowrap;';
const headerRow = `<tr style="background:#1a1a2e;color:#fff;"><th style="${thStyle}">Service</th><th style="${thStyle}">What's Included</th><th style="${thStyleR}">Starting From</th></tr>`;
const altBg = 'background:#f9f9f9;';

const startingNote = '<p style="color:#888;font-size:13px;"><em>* All prices shown are starting prices and exclude 5% VAT. Final pricing is customized based on scope, duration, and specific requirements.</em></p>';

function makeAddOns(items) {
  return `<p><strong>Add-ons available:</strong> ${items.join(' | ')}</p>`;
}

function makePortfolio(links) {
  const items = links.map(([name, url]) => `<li><a href="${url}">${name}</a></li>`).join('');
  return `<p>Here's some of our work:</p><ul style="padding-left:20px;">${items}</ul>`;
}

function makeProfileLink() {
  return `<p>&#128206; <a href="${PROFILE_PDF}" style="color:#e74c3c;font-weight:bold;">Download Our Company Profile (PDF)</a></p>`;
}

function makeCTA(ctaText, ctaSubject) {
  return `<div style="background:#1a1a2e;color:#fff;padding:16px;border-radius:8px;margin:20px 0;text-align:center;">
    <p style="margin:0 0 8px 0;font-size:18px;"><strong>${ctaText}</strong></p>
    <p style="margin:0;">Let's set up a quick 15-min call this week to discuss your needs.</p>
    <p style="margin:12px 0 0 0;">
      <a href="mailto:contact@kapturise.com?subject=${encodeURIComponent(ctaSubject)}" style="background:#e74c3c;color:#fff;padding:10px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">Book a Call &#8594;</a>
    </p>
  </div>`;
}

function makeSignature() {
  return `<p style="margin-top:24px;">Best,</p>
  <p style="margin:0;"><strong>{{agentName}}</strong></p>
  <p style="margin:0;color:#888;">{{agentTitle}}, Kapturise</p>
  <p style="margin:0;color:#888;">&#128231; contact@kapturise.com | &#128222; +971 55 913 7354</p>
  <p style="margin:0;color:#888;">&#127760; www.kapturise.com</p>`;
}

function row(service, included, price, alt) {
  return `<tr${alt ? ` style="${altBg}"` : ''}><td style="${tdStyle}"><strong>${service}</strong></td><td style="${tdStyle}">${included}</td><td style="${tdStyleR}"><strong>${price}</strong></td></tr>`;
}

// Reusable monthly retainer table (Social Media + TikTok)
const monthlyHeaderRow = `<tr style="background:#1a1a2e;color:#fff;"><th style="${thStyle}">Monthly Retainer</th><th style="${thStyle}">What's Included</th><th style="${thStyleR}">Starting From</th></tr>`;

function makeMonthlyTable() {
  return `<p style="margin-top:24px;"><strong>&#128197; Monthly Content & Social Media Retainers</strong></p>
  <table style="${tableStyle}">
    ${monthlyHeaderRow}
    ${row('&#127909; TikTok / Reels — Basic', '4 days/month, 3hrs/day, 12 reels/tiktoks (30s), trending script, professional camera, wireless mic. <em>Includes videography & editing.</em>', 'AED 15,000/month', true)}
    ${row('&#127909; TikTok / Reels — Standard', '8 days/month, 4hrs/day, 25 reels/tiktoks (30s), trending script, professional camera, wireless mic. <em>Includes videography & editing.</em>', 'AED 25,000/month', false)}
    ${row('&#127909; TikTok / Reels — Premium', '12 days/month, 4hrs/day, 40 reels/tiktoks (30s), trending script, professional camera, wireless mic. <em>Includes videography & editing.</em>', 'AED 35,500/month', true)}
    ${row('&#128241; Social Media — Basic', '1 platform, 5 posts/week, 20 designed images, caption & hashtag research, scheduled posts, organic engagement. <em>Photography & videography not included.</em>', 'AED 15,000/month', false)}
    ${row('&#128241; Social Media — Standard', '2 platforms, 1 post/day, 30 posts/month, social grid design, caption & hashtag research, engagement. <em>Photography & videography not included.</em>', 'AED 25,000/month', true)}
    ${row('&#128241; Social Media — Premium', '4 platforms, 2 posts/day, 60 posts/month, social grid design, caption & hashtag research, engagement. <em>Photography & videography not included.</em>', 'AED 35,500/month', false)}
  </table>
  <p style="color:#888;font-size:13px;"><em>* Min 6 months retainer. Ad spend not included. Models, influencers, motion graphics, 3D VFX, voice over artists available as add-ons.</em></p>`;
}

export const EMAIL_TEMPLATES = {

  "food-and-beverage": {
    name: "Food & Beverage / Restaurants",
    subject: "Professional food content for {{company}} — starting from AED 2,500",
    body: `<div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
  <p>Hi {{contactName}},</p>
  <p>I'm reaching out from <strong>Kapturise</strong> — the region's first and largest on-demand platform for photographers, videographers, and content creators. We've been the official media partner for Emigala, Step Conference, and Dubai Fitness Challenge, and have worked with brands like Mastercard, Talabat, and more.</p>
  <p>I came across {{company}} and loved what you're doing — we help F&B brands across Dubai create scroll-stopping content that actually drives orders.</p>
  <p><strong>&#128248; Photography & Videography</strong></p>
  <table style="${tableStyle}">
    ${headerRow}
    ${row('&#128248; Food Photography', '10 dishes, 3-hour shoot, edited images (enhanced), basic styling, professional camera with strobe, backdrop', 'AED 2,500 + VAT', true)}
    ${row('&#127916; Food Videography', '5 dishes, 3 social clips (15-30s), 4-hour shoot, editing + royalty free music, wireless mic', 'AED 3,500 + VAT', false)}
  </table>
  ${startingNote}
  ${makeAddOns(['Food Stylist', 'Models', 'Influencers', 'Props', 'Studio Spaces', 'Retouching', 'Voice Over', 'AI Videos'])}
  ${makeMonthlyTable()}
  ${makePortfolio([['Talabat Campaign', PORTFOLIO.talabat], ['Emigala Event Coverage', PORTFOLIO.emigala], ['Step Conference Dubai', PORTFOLIO.stepDubai], ['Mastercard Event', PORTFOLIO.mastercard]])}
  ${makeProfileLink()}
  <p>We've worked with top F&B brands across Dubai and the UAE, and would love to help {{company}} showcase your dishes with content you can use across socials, delivery apps, menus, and your website.</p>
  ${makeCTA('Ready to make your food look irresistible?', 'F&B Content Inquiry - ' + '{{company}}')}
  ${makeSignature()}
</div>`
  },

  "real-estate": {
    name: "Real Estate",
    subject: "Professional property photography & video for {{company}} — starting from AED 3,000",
    body: `<div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
  <p>Hi {{contactName}},</p>
  <p>I'm reaching out from <strong>Kapturise</strong> — the region's first and largest on-demand platform for photographers, videographers, and content creators. We've been the official media partner for Emigala, Step Conference, and Dubai Fitness Challenge, and have worked with brands like Mastercard, Talabat, and more.</p>
  <p>We help real estate companies across Dubai showcase their properties with professional visuals that actually sell.</p>
  <p><strong>&#128248; Photography & Videography</strong></p>
  <table style="${tableStyle}">
    ${headerRow}
    ${row('&#127968; Real Estate Photography', 'Includes photography, set up & post-production, edited images (enhanced), professional camera with lenses', 'AED 3,000 + VAT', true)}
    ${row('&#127916; Property Video Walkthrough', 'Cinematic walkthrough video (60-90s), professional camera with gimbal, editing + royalty free music, drone footage available', 'AED 3,500 + VAT', false)}
  </table>
  ${startingNote}
  ${makeAddOns(['Real Estate Staging', 'Drone Shoot', '360° VR Virtual Tour', 'Retouching', 'Models', 'Voice Over', 'AI Videos'])}
  ${makeMonthlyTable()}
  ${makePortfolio([['Emigala Event Coverage', PORTFOLIO.emigala], ['Step Conference Dubai', PORTFOLIO.stepDubai], ['Global Ventures', PORTFOLIO.globalVentures], ['Mastercard Event', PORTFOLIO.mastercard]])}
  ${makeProfileLink()}
  <p>Properties with professional photography sell 32% faster. We've worked with top developers and brokerages across Dubai, and would love to help {{company}} stand out with content that converts.</p>
  ${makeCTA('Ready to showcase your properties professionally?', 'Real Estate Content Inquiry - ' + '{{company}}')}
  ${makeSignature()}
</div>`
  },

  "events": {
    name: "Events & Conferences",
    subject: "Professional event coverage for {{company}} — starting from AED 3,000",
    body: `<div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
  <p>Hi {{contactName}},</p>
  <p>I'm reaching out from <strong>Kapturise</strong> — the region's first and largest on-demand platform for photographers, videographers, and content creators. We've been the official media partner for Emigala, Step Conference, and Dubai Fitness Challenge, and have worked with brands like Mastercard, Talabat, and more.</p>
  <p>We provide professional event coverage across the UAE — from exhibitions and conferences to corporate galas and product launches.</p>
  <p><strong>&#128248; Event Photography & Videography</strong></p>
  <table style="${tableStyle}">
    ${headerRow}
    ${row('&#127910; Event Photography', '800 AED/hr, min 2hrs booking, 50 edited images (enhanced), professional camera with lenses', 'AED 1,600 + VAT', true)}
    ${row('&#127916; Event Videography', '1,000 AED/hr, min 2hrs booking, edited highlight video (60s), royalty free music, professional camera with gimbal, wireless mic', 'AED 2,000 + VAT', false)}
    ${row('&#127910; Event Coverage (Photo + Video)', '1 photographer + 1 videographer, 4 hours, 50 edited images + 1 highlight video (60s), delivered 24-48hrs', 'AED 3,000 + VAT', true)}
    ${row('&#128084; Corporate Headshots', '800 AED/hr, min 2hrs, edited images (enhanced), professional camera with lenses', 'AED 1,600 + VAT', false)}
  </table>
  ${startingNote}
  ${makeAddOns(['Extra Photographer', 'Extra Videographer', 'Live Streaming', 'Retouching', 'Models', 'Influencers / MC / Hosts', 'Stage Build', 'Voice Over', 'AI Videos'])}
  ${makeMonthlyTable()}
  ${makePortfolio([['Emigala Event', PORTFOLIO.emigala], ['Step Conference Dubai', PORTFOLIO.stepDubai], ['Step Conference KSA', PORTFOLIO.stepKSA], ['Agility Awards', PORTFOLIO.agilityAwards], ['Tech Innovation Awards', PORTFOLIO.techInnovation]])}
  ${makeProfileLink()}
  <p>We've been the official media partner for Emigala, Step Conference, and Dubai Fitness Challenge. Would love to help {{company}} capture your next event with content you can use across socials, PR, and internal reporting.</p>
  ${makeCTA('Ready to capture your next event?', 'Event Coverage Inquiry - ' + '{{company}}')}
  ${makeSignature()}
</div>`
  },

  "corporate": {
    name: "Corporate & Branding",
    subject: "Professional corporate content for {{company}} — starting from AED 1,600",
    body: `<div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
  <p>Hi {{contactName}},</p>
  <p>I'm reaching out from <strong>Kapturise</strong> — the region's first and largest on-demand platform for photographers, videographers, and content creators. We've been the official media partner for Emigala, Step Conference, and Dubai Fitness Challenge, and have worked with brands like Mastercard, Talabat, and more.</p>
  <p>We help corporate brands across Dubai build a professional visual identity — from headshots and office photography to full video production.</p>
  <p><strong>&#128248; Photography & Videography</strong></p>
  <table style="${tableStyle}">
    ${headerRow}
    ${row('&#128084; Corporate Photography', '800 AED/hr, min 2hrs, 40 edited images (enhanced), lifestyle & corporate headshots, professional camera with lenses', 'AED 1,600 + VAT', true)}
    ${row('&#127916; Corporate Videography', '1,000 AED/hr (starting from), script writing, TVC corporate video (1 min), royalty free music, professional camera with gimbal, wireless mic', 'AED 3,000 + VAT', false)}
    ${row('&#127912; Product Photography', '20 SKUs, 3 angles per SKU, 4-hour shoot, edited images (enhanced)', 'AED 3,000 + VAT', true)}
  </table>
  ${startingNote}
  ${makeAddOns(['Retouching', 'Models', 'Influencers / MC / Hosts', 'Live Streaming', 'Stage Build', 'Voice Over', 'AI Videos'])}
  ${makeMonthlyTable()}
  ${makePortfolio([['Mastercard Event', PORTFOLIO.mastercard], ['Global Ventures', PORTFOLIO.globalVentures], ['Enterprise Agility Awards', PORTFOLIO.enterpriseAgility], ['Tech Innovation Awards', PORTFOLIO.techInnovation]])}
  ${makeProfileLink()}
  <p>We've worked with top corporate brands across DIFC, Dubai Internet City, and major business events. Would love to help {{company}} build a visual identity that matches the quality of your work.</p>
  ${makeCTA('Ready to elevate your corporate brand?', 'Corporate Content Inquiry - ' + '{{company}}')}
  ${makeSignature()}
</div>`
  },

  "ecommerce": {
    name: "Ecommerce & Retail",
    subject: "Professional product photography for {{company}} — starting from AED 3,000",
    body: `<div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
  <p>Hi {{contactName}},</p>
  <p>I'm reaching out from <strong>Kapturise</strong> — the region's first and largest on-demand platform for photographers, videographers, and content creators. We've been the official media partner for Emigala, Step Conference, and Dubai Fitness Challenge, and have worked with brands like Mastercard, Talabat, and more.</p>
  <p>We help ecommerce and retail brands increase conversions with professional product content that actually sells.</p>
  <p><strong>&#128248; Photography & Videography</strong></p>
  <table style="${tableStyle}">
    ${headerRow}
    ${row('&#127912; Product Photography', '20 SKUs, 3 angles per SKU, 4-hour shoot, edited images (enhanced), white bg + styled', 'AED 3,000 + VAT', true)}
    ${row('&#127916; Product Videography', '5 products, 3 social clips (15-30s), 4-hour shoot, editing + royalty free music', 'AED 3,500 + VAT', false)}
  </table>
  ${startingNote}
  ${makeAddOns(['Retouching', 'Models', 'Influencers', 'Lifestyle Shots', 'Voice Over', 'AI Videos'])}
  ${makeMonthlyTable()}
  ${makePortfolio([['Talabat Campaign', PORTFOLIO.talabat], ['Emigala Event', PORTFOLIO.emigala], ['Step Conference Dubai', PORTFOLIO.stepDubai], ['Mastercard Event', PORTFOLIO.mastercard]])}
  ${makeProfileLink()}
  <p>Professional product photos can increase conversion rates by up to 40%. We've helped fashion, beauty, electronics, and luxury brands across the UAE create content that sells.</p>
  ${makeCTA('Ready to boost your product sales?', 'Product Content Inquiry - ' + '{{company}}')}
  ${makeSignature()}
</div>`
  },

  "hospitality": {
    name: "Hospitality & Hotels",
    subject: "Premium visual content for {{company}} — starting from AED 3,000",
    body: `<div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
  <p>Hi {{contactName}},</p>
  <p>I'm reaching out from <strong>Kapturise</strong> — the region's first and largest on-demand platform for photographers, videographers, and content creators. We've been the official media partner for Emigala, Step Conference, and Dubai Fitness Challenge, and have worked with brands like Mastercard, Talabat, and more.</p>
  <p>We help hotels and hospitality brands attract more guests with premium visual content that inspires bookings.</p>
  <p><strong>&#128248; Photography & Videography</strong></p>
  <table style="${tableStyle}">
    ${headerRow}
    ${row('&#127968; Property Photography', 'Includes photography, set up & post-production, edited images (enhanced), professional camera with lenses', 'AED 3,000 + VAT', true)}
    ${row('&#127860; Food Photography', '10 dishes, 3-hour shoot, edited images (enhanced), basic styling, professional camera with strobe, backdrop', 'AED 2,500 + VAT', false)}
    ${row('&#127910; Event / Venue Coverage', 'Photography 800 AED/hr + Videography 1,000 AED/hr, min 2hrs, edited highlight video (60s), edited images', 'AED 3,000 + VAT', true)}
  </table>
  ${startingNote}
  ${makeAddOns(['Drone Shoot', '360° VR Virtual Tour', 'Real Estate Staging', 'Retouching', 'Food Stylist', 'Models', 'Influencers', 'Voice Over', 'AI Videos'])}
  ${makeMonthlyTable()}
  ${makePortfolio([['Emigala Event', PORTFOLIO.emigala], ['Step Conference Dubai', PORTFOLIO.stepDubai], ['Mastercard Event', PORTFOLIO.mastercard], ['Global Ventures', PORTFOLIO.globalVentures]])}
  ${makeProfileLink()}
  <p>We've worked with top hospitality brands across the UAE and would love to help {{company}} create visual content that inspires bookings and elevates your brand.</p>
  ${makeCTA('Ready to elevate your guest experience?', 'Hospitality Content Inquiry - ' + '{{company}}')}
  ${makeSignature()}
</div>`
  },

  "investor": {
    name: "Investor Relations",
    subject: "Kapturise — Region's largest on-demand creative platform",
    body: `<div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
  <p>Hi {{contactName}},</p>
  <p>I'm reaching out from Kapturise — the region's first and largest on-demand platform for photographers, videographers, models, makeup artists, influencers, and studio rentals.</p>
  <table style="${tableStyle}">
    <tr style="background:#1a1a2e;color:#fff;"><th style="${thStyle}">Highlight</th><th style="${thStyle}">Details</th></tr>
    ${row('&#127942; Awards', 'Media Company of the Year 2023, Community App 2022, Tech Startup 2021', '', true)}
    ${row('&#128241; Platform', 'On-demand app on App Store & Google Play', '', false)}
    ${row('&#128101; Network', '400+ vetted creatives across UAE & GCC', '', true)}
    ${row('&#127910; Partnerships', 'Official media partner: Emigala, Step Conference, Dubai Fitness Challenge', '', false)}
    ${row('&#127912; Verticals', 'Photography, Videography, Models, Events, MUAs, Studios', '', true)}
    ${row('&#129302; Technology', 'AI-powered sales ops with 17 autonomous agents', '', false)}
  </table>
  ${makePortfolio([['Emigala Event', PORTFOLIO.emigala], ['Step Conference Dubai', PORTFOLIO.stepDubai], ['Talabat Campaign', PORTFOLIO.talabat], ['Mastercard Event', PORTFOLIO.mastercard], ['Enterprise Agility Awards', PORTFOLIO.enterpriseAgility]])}
  ${makeProfileLink()}
  <p>We're building the "Uber for Photographers" — a marketplace that connects businesses with creative talent instantly. We'd love to share our growth story and vision.</p>
  ${makeCTA('Interested in learning more about Kapturise?', 'Investor Inquiry - Kapturise')}
  ${makeSignature()}
</div>`
  },

  "general": {
    name: "General / Fallback",
    subject: "Professional creative content for {{company}} — starting from AED 2,500",
    body: `<div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
  <p>Hi {{contactName}},</p>
  <p>I'm reaching out from <strong>Kapturise</strong> — the region's first and largest on-demand platform for photographers, videographers, and content creators. We've been the official media partner for Emigala, Step Conference, and Dubai Fitness Challenge, and have worked with brands like Mastercard, Talabat, and more.</p>
  <p>We provide end-to-end creative content — photography, videography, social media, and more — for businesses across the UAE.</p>
  <p><strong>&#128248; Photography & Videography</strong></p>
  <table style="${tableStyle}">
    ${headerRow}
    ${row('&#128248; Food Photography', '10 dishes, 3-hour shoot, edited images (enhanced), basic styling, professional camera with strobe', 'AED 2,500 + VAT', true)}
    ${row('&#127968; Real Estate Photography', 'Includes photography, set up & post-production, edited images (enhanced)', 'AED 3,000 + VAT', false)}
    ${row('&#127910; Event Coverage (Photo + Video)', '1 photographer + 1 videographer, 4hrs, 50 edited images + highlight video (60s)', 'AED 3,000 + VAT', true)}
    ${row('&#128084; Corporate Photography', '800 AED/hr, min 2hrs, 40 edited images (enhanced), lifestyle & headshots', 'AED 1,600 + VAT', false)}
    ${row('&#127912; Product Photography', '20 SKUs, 3 angles each, 4-hour shoot, edited images (enhanced)', 'AED 3,000 + VAT', true)}
    ${row('&#127916; Videography', '1,000 AED/hr (starting from), edited video, royalty free music, professional camera with gimbal', 'AED 3,000 + VAT', false)}
  </table>
  ${startingNote}
  ${makeAddOns(['Models', 'Food Stylist', 'Influencers', 'Retouching', 'Voice Over', 'AI Videos', 'Drone Coverage', '360° VR Virtual Tour'])}
  ${makeMonthlyTable()}
  ${makePortfolio([['Emigala Event', PORTFOLIO.emigala], ['Talabat Campaign', PORTFOLIO.talabat], ['Step Conference Dubai', PORTFOLIO.stepDubai], ['Mastercard Event', PORTFOLIO.mastercard]])}
  ${makeProfileLink()}
  <p>We've worked with top brands across the UAE including Emigala, Step Conference, Dubai Fitness Challenge, Mastercard, and many more. Would love to help {{company}} with professional content.</p>
  ${makeCTA('Ready to elevate your brand?', 'Content Inquiry - ' + '{{company}}')}
  ${makeSignature()}
</div>`
  }
};

// Industry keyword mapping to template
const INDUSTRY_KEYWORDS = {
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
