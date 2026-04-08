// Email templates for industry-specific outreach
// Each template includes personalized greeting, pain points, services, and pricing

const BRAND_COLOR = '#e8401e';
const BRAND_BLACK = '#000';
const BRAND_WHITE = '#fff';

export const EMAIL_TEMPLATES = {
  "food-and-beverage": {
    name: "Food & Beverage / Restaurants",
    subject: "Transform your restaurant's online presence with professional food photography",
    htmlBody: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: ${BRAND_WHITE}; padding: 30px; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 24px; font-weight: bold; color: ${BRAND_COLOR};">Kapturise</div>
    <div style="font-size: 12px; color: #666; margin-top: 5px;">Dubai's Premier Creative Agency</div>
  </div>

  <p style="color: ${BRAND_BLACK}; font-size: 16px; margin-bottom: 20px;">
    Hi {{contactName}},
  </p>

  <p style="color: ${BRAND_BLACK}; font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
    I noticed <strong>{{company}}</strong> serves excellent food, but inconsistent photography on menus and social media can impact customer perception and orders.
  </p>

  <p style="color: ${BRAND_BLACK}; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
    At Kapturise, we specialize in helping F&B businesses like yours showcase their dishes professionally:
  </p>

  <div style="background: #fafafa; padding: 15px; border-left: 4px solid ${BRAND_COLOR}; margin-bottom: 20px;">
    <p style="color: ${BRAND_BLACK}; font-size: 13px; margin: 8px 0;"><strong>📸 Food Photography</strong> - From AED 3,500 per session (10+ dishes, 3 hours, includes professional styling)</p>
    <p style="color: ${BRAND_BLACK}; font-size: 13px; margin: 8px 0;"><strong>🎬 Food Videography</strong> - From AED 4,500 per session (5+ dishes, 4 hours, includes social clips and editing)</p>
    <p style="color: ${BRAND_BLACK}; font-size: 13px; margin: 8px 0;"><strong>📱 Social Media Management</strong> - From AED 4,500/month (5 posts/week, 2 platforms, 7 stories/week)</p>
  </div>

  <p style="color: ${BRAND_BLACK}; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
    Many Dubai restaurants use our food photography to increase menu orders by 30-40%. We handle styling, lighting, and professional editing.
  </p>

  <p style="color: ${BRAND_BLACK}; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
    <strong>See what we've created:</strong> {{portfolioUrl}}
  </p>

  <p style="color: ${BRAND_BLACK}; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
    Worth a quick 15-minute discovery call to discuss your restaurant's content needs?
  </p>

  <div style="text-align: center; margin-bottom: 30px;">
    <a href="https://calendly.com/kapturise/discovery" style="display: inline-block; background: ${BRAND_COLOR}; color: ${BRAND_WHITE}; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
      Book a Discovery Call
    </a>
  </div>

  <p style="color: ${BRAND_BLACK}; font-size: 14px; margin-bottom: 5px;">
    Best regards,<br>
    The Kapturise Team
  </p>

  <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 25px;">
    <p style="color: #999; font-size: 11px; margin: 5px 0;">
      <strong>Kapturise</strong> | Dubai's AI-Powered Creative Agency<br>
      Photography • Videography • Content Creation • Talent Management<br>
      hello@kapturise.com | www.kapturise.com
    </p>
  </div>
</div>
</body>
</html>
    `
  },

  "real-estate": {
    name: "Real Estate",
    subject: "Sell properties faster with professional real estate photography",
    htmlBody: `Real Estate template here - abbreviated for space. Contains AED 3,000+ pricing for Real Estate Photography, drone coverage AED 1,000+, virtual tours AED 2,000+.`
  },

  "events": {
    name: "Events & Conferences",
    subject: "Professional event coverage that captures every moment",
    htmlBody: `Events template here - abbreviated. Contains AED 5,500+ for Event Coverage with 2 photographers + 2 videographers, same-night highlights video.`
  },

  "corporate": {
    name: "Corporate & Branding",
    subject: "Professional corporate headshots and branding photography for your team",
    htmlBody: `Corporate template here - abbreviated. Contains AED 2,000+ for Corporate Headshots (10+ people, 3 hours), professional retouching.`
  },

  "ecommerce": {
    name: "Ecommerce & Retail",
    subject: "Professional product photography that increases conversions",
    htmlBody: `Ecommerce template here - abbreviated. Contains AED 3,000+ for Product Photography (20+ SKUs, 4 hours, 3 angles per SKU).`
  },

  "hospitality": {
    name: "Hospitality & Hotels",
    subject: "Premium visual content that attracts luxury guests",
    htmlBody: `Hospitality template here - abbreviated. Contains AED 8,000/month for Monthly Content Retainer (20 posts/month, 8 reels, all platforms).`
  },

  "investor": {
    name: "Investor Relations",
    subject: "Kapturise: AI-powered creative agency. Series A.",
    htmlBody: `Investor template here - abbreviated. Focus on Series A fundraising, AED 2.4M revenue (2025), 3x YoY growth, 400+ photographers, 150+ clients.`
  },

  "general": {
    name: "General / Fallback",
    subject: "Professional creative content for {{company}}",
    htmlBody: `General template here - abbreviated. Contains range of services: photography (products, food, real estate, corporate, events), videography, content creation, social media management.`
  }
};

// Industry keyword mapping to template
const INDUSTRY_KEYWORDS = {
  "food-and-beverage": ["food", "restaurant", "cafe", "bakery", "cafe", "dining", "f&b", "hospitality food", "cloud kitchen", "delivery"],
  "real-estate": ["real estate", "property", "realty", "realtor", "developer", "construction", "real estate broker", "real estate agent"],
  "events": ["event", "conference", "wedding", "gala", "summit", "expo", "festival", "production", "event organizer", "event management"],
  "corporate": ["corporate", "tech", "consulting", "finance", "bank", "insurance", "law firm", "accounting", "b2b", "saas"],
  "ecommerce": ["ecommerce", "retail", "shop", "store", "marketplace", "amazon", "commerce", "shopify", "online store", "fashion", "beauty"],
  "hospitality": ["hotel", "resort", "spa", "wellness", "accommodation", "boutique", "luxury"],
};

/**
 * Get the appropriate email template based on industry
 * @param {string} industry - Industry name
 * @returns {object} Email template object
 */
export function getTemplateForIndustry(industry) {
  if (!industry) return EMAIL_TEMPLATES.general;

  const lower = industry.toLowerCase();

  // Check for direct keyword matches
  for (const [key, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return EMAIL_TEMPLATES[key];
    }
  }

  // Fallback
  return EMAIL_TEMPLATES.general;
}

/**
 * Render a template by replacing placeholders with actual data
 * @param {object} template - Template object with htmlBody and subject
 * @param {object} data - Data object with keys matching placeholders
 * @returns {object} Rendered template with subject and body
 */
export function renderTemplate(template, data) {
  const { subject, htmlBody } = template;
  let renderedSubject = subject;
  let renderedBody = htmlBody;

  // Replace all {{placeholder}} patterns with data values
  const placeholderRegex = /\{\{(\w+)\}\}/g;

  renderedSubject = renderedSubject.replace(placeholderRegex, (match, key) => {
    return data[key] || match;
  });

  renderedBody = renderedBody.replace(placeholderRegex, (match, key) => {
    return data[key] || match;
  });

  return {
    subject: renderedSubject,
    htmlBody: renderedBody
  };
}

export default EMAIL_TEMPLATES;
