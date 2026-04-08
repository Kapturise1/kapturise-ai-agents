// Email templates for industry-specific outreach
// Style: casual, concise, personal — matching Kapturise's actual outreach tone
// Company Profile PDF hosted at: /Kapturise-Company-Profile.pdf

const PROFILE_PDF = 'https://kapturise-ai-agents.vercel.app/Kapturise-Company-Profile.pdf';

const PORTFOLIO_LINKS = `
https://www.youtube.com/watch?v=J_nMQ-1o6vo (Emigala)
https://www.youtube.com/watch?v=LsyMQSAsHKU (Step Dubai)
https://www.youtube.com/watch?v=hO2c3_jmnM0 (Step KSA)
https://www.youtube.com/watch?v=ITlaVqPHI3U&t=369s (Mastercard)
https://www.youtube.com/watch?v=xTFR1xf4fb8 (Global Ventures)
https://www.youtube.com/watch?v=kMhvLgf5MTQ (Talabat)
https://www.youtube.com/watch?v=AKRtoL2-zWA&t=8s (Agility Awards)
https://www.youtube.com/watch?v=O3QFNmolUuQ (Tech Innovation Awards)
https://www.youtube.com/watch?v=EU-fDjz5Ono (Enterprise Agility Awards)`.trim();

export const EMAIL_TEMPLATES = {

  "food-and-beverage": {
    name: "Food & Beverage / Restaurants",
    subject: "Professional food photography & video for {{company}}",
    body: `Hi {{contactName}} - hope you're doing well.

I wanted to reach out to let you know that for restaurants and F&B brands looking to elevate their online presence, Kapturise is offering a special food content package starting at AED 3,500 + VAT, which includes:

Premium food photography (10+ dishes)

Short-form video content for social media

Professional food styling

24-hour turnaround

3-4 hour shoot

We also offer monthly social media management starting at AED 4,500/month — 5 posts/week across 2 platforms with stories and reels.

I am attaching our company profile and here is some of our work:
${PORTFOLIO_LINKS}

We've worked with top F&B brands across Dubai and the UAE, and would love to help {{company}} showcase your dishes with content you can use across socials, delivery apps, menus, and your website.

Interested? Contact us at contact@kapturise.com / 055-913-7354`
  },

  "real-estate": {
    name: "Real Estate",
    subject: "Professional property photography & video for {{company}}",
    body: `Hi {{contactName}} - hope you're doing well.

I wanted to reach out to let you know that for real estate companies looking to showcase their properties professionally, Kapturise is offering a special property package starting at AED 3,000 + VAT, which includes:

Premium property photography (all rooms, exteriors, amenities)

Drone/aerial coverage

A cinematic property walkthrough video

24-hour turnaround

4 hour shoot

We also offer virtual tours from AED 2,000 and monthly content retainers for agencies with multiple listings.

I am attaching our company profile and here is some of our work:
${PORTFOLIO_LINKS}

Properties with professional photography sell 32% faster. We've worked with top developers and brokerages across Dubai, and would love to help {{company}} stand out with content that converts.

Interested? Contact us at contact@kapturise.com / 055-913-7354`
  },

  "events": {
    name: "Events & Conferences",
    subject: "Professional event coverage for {{company}}",
    body: `Hi {{contactName}} - hope you're doing well.

I wanted to reach out to let you know that for exhibitors and event organizers looking to capture their presence professionally, Kapturise is offering a special exhibitor package starting at AED 3,000 + VAT, which includes:

Premium photography

A highlight video of your booth and team

24-hour turnaround

4 hour shoot

We also offer full event coverage packages from AED 5,500 with 2 photographers + 2 videographers, live streaming, drone coverage, and same-night highlight reels.

I am attaching our company profile and here is some of our work:
${PORTFOLIO_LINKS}

We've worked with top brands across regional expos, and would love to help showcase your setup with content you can use across socials, PR, and internal reporting.

Interested? Contact us at contact@kapturise.com / 055-913-7354`
  },

  "corporate": {
    name: "Corporate & Branding",
    subject: "Professional corporate photography & video for {{company}}",
    body: `Hi {{contactName}} - hope you're doing well.

I wanted to reach out to let you know that for companies looking to upgrade their visual branding, Kapturise is offering corporate content packages starting at AED 2,000 + VAT, which includes:

Professional corporate headshots (10+ team members)

Office and workspace photography

Company culture content

Professional retouching and editing

3 hour shoot

We also offer corporate video production from AED 5,000 and LinkedIn/social content management from AED 3,500/month.

I am attaching our company profile and here is some of our work:
${PORTFOLIO_LINKS}

We've worked with top corporate brands across DIFC, Dubai Internet City, and major business events. Would love to help {{company}} build a visual identity that matches the quality of your work.

Interested? Contact us at contact@kapturise.com / 055-913-7354`
  },

  "ecommerce": {
    name: "Ecommerce & Retail",
    subject: "Professional product photography for {{company}}",
    body: `Hi {{contactName}} - hope you're doing well.

I wanted to reach out to let you know that for ecommerce and retail brands looking to increase conversions with professional visuals, Kapturise is offering a product content package starting at AED 3,000 + VAT, which includes:

Product photography (20+ SKUs, 3 angles each)

White background + lifestyle shots

Social-ready content

Professional editing

4 hour shoot

We also offer product videography from AED 4,000, model/influencer shoots from AED 5,000, and social media management from AED 4,500/month.

I am attaching our company profile and here is some of our work:
${PORTFOLIO_LINKS}

Professional product photos can increase conversion rates by up to 40%. We've helped fashion, beauty, electronics, and luxury brands across the UAE create content that sells.

Interested? Contact us at contact@kapturise.com / 055-913-7354`
  },

  "hospitality": {
    name: "Hospitality & Hotels",
    subject: "Premium visual content for {{company}}",
    body: `Hi {{contactName}} - hope you're doing well.

I wanted to reach out to let you know that for hotels and hospitality brands looking to attract more guests with premium visuals, Kapturise is offering a hospitality content package starting at AED 4,000 + VAT, which includes:

Premium photography (rooms, amenities, dining, lifestyle)

A cinematic promo video

Drone/aerial coverage

24-hour turnaround

Full-day shoot

We also offer monthly content retainers from AED 8,000/month — 20 posts, 8 reels, all platforms managed, plus seasonal campaigns.

I am attaching our company profile and here is some of our work:
${PORTFOLIO_LINKS}

We've worked with top hospitality brands across the UAE and would love to help {{company}} create visual content that inspires bookings and elevates your brand.

Interested? Contact us at contact@kapturise.com / 055-913-7354`
  },

  "investor": {
    name: "Investor Relations",
    subject: "Kapturise — Region's largest on-demand creative platform",
    body: `Hi {{contactName}} - hope you're doing well.

I'm reaching out from Kapturise — the region's first and largest on-demand platform for photographers, videographers, models, makeup artists, influencers, and studio rentals.

Some highlights:

Award-winning: Media Company of the Year 2023, Community App of the Year 2022, Tech Startup of the Year 2021

On-demand platform on App Store & Google Play

400+ vetted creatives across UAE & GCC

Official media partner for Emigala, Step Conference, Dubai Fitness Challenge

6 service verticals: Photography, Videography, Models, Events, MUAs, Studios

AI-powered sales operations with 17 autonomous agents

I am attaching our company profile and here is some of our work:
${PORTFOLIO_LINKS}

We're building the "Uber for Photographers" — a marketplace that connects businesses with creative talent instantly. We'd love to share our growth story and vision.

Interested in learning more? Contact us at contact@kapturise.com / 055-913-7354`
  },

  "general": {
    name: "General / Fallback",
    subject: "Professional creative content for {{company}}",
    body: `Hi {{contactName}} - hope you're doing well.

I wanted to reach out to let you know that Kapturise is the region's largest on-demand platform for professional photography, videography, and content creation. We offer packages starting at AED 2,000 + VAT, which can include:

Professional photography (products, food, real estate, corporate, events)

Videography and highlight reels

Social media content and management

Drone coverage

Models and influencer partnerships

Studio rentals

I am attaching our company profile and here is some of our work:
${PORTFOLIO_LINKS}

We've worked with top brands across the UAE including coverage for Emigala, Step Conference, Dubai Fitness Challenge, Mastercard, and many more. Would love to help {{company}} with professional content.

Interested? Contact us at contact@kapturise.com / 055-913-7354`
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
 * @param {string} industry - Industry name
 * @returns {object} Email template object
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
 * @param {object} template - Template object with body and subject
 * @param {object} data - Data object with keys matching placeholders
 * @returns {object} Rendered template with subject and body
 */
export function renderTemplate(template, data) {
  const { subject, body } = template;
  let renderedSubject = subject;
  let renderedBody = body;

  const placeholderRegex = /\{\{(\w+)\}\}/g;

  renderedSubject = renderedSubject.replace(placeholderRegex, (match, key) => {
    return data[key] || match;
  });

  renderedBody = renderedBody.replace(placeholderRegex, (match, key) => {
    return data[key] || match;
  });

  return {
    subject: renderedSubject,
    body: renderedBody
  };
}

export default EMAIL_TEMPLATES;
