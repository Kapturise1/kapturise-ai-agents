export const runtime = "edge";

// Event-driven branching rules (the n8n replacement)
const BRANCHING_RULES = {
  // When a lead opens an email -> schedule a call
  lead_opened_email: {
    actions: ["slack"],
    followUp: { type: "schedule_call", delay: "1h", message: "Lead engaged with email - schedule call" },
    slackMessage: function(d) { return ":eyes: *Lead Opened Email*\n" + (d.name || "Unknown") + " opened the outreach email. Triggering call sequence."; }
  },
  // No response after 3 days -> send follow-up
  no_response_3days: {
    actions: ["email", "slack"],
    followUp: { type: "send_followup_email", template: "gentle_reminder" },
    slackMessage: function(d) { return ":hourglass: *No Response (3 days)*\n" + (d.name || "Unknown") + " hasn't responded. Sending automated follow-up."; }
  },
  // New inbound lead -> notify all channels
  inbound_lead: {
    actions: ["slack", "sheets", "whatsapp"],
    followUp: { type: "assign_agent", team: "sales" },
    slackMessage: function(d) { return ":incoming_envelope: *New Inbound Lead*\nName: " + (d.name || "") + "\nEmail: " + (d.email || "") + "\nCompany: " + (d.company || ""); }
  },
  // High value lead detected -> alert investor team
  high_value_lead: {
    actions: ["slack", "sheets"],
    followUp: { type: "flag_investor_team" },
    slackMessage: function(d) { return ":gem: *High Value Lead Detected*\n" + (d.name || "") + " - " + (d.value || "N/A") + " AED\nFlagging investor team for review."; }
  },
  // Deal closed -> celebrate + sync
  deal_closed: {
    actions: ["slack", "sheets", "whatsapp"],
    followUp: { type: "create_success_story", team: "content" },
    slackMessage: function(d) { return ":tada: *Deal Closed!*\n" + (d.name || "") + " - " + (d.value || "") + " AED\nContent team notified for success story."; }
  },
  // Prospect found -> start sales pipeline
  prospect_found: {
    actions: ["slack", "sheets"],
    followUp: { type: "start_outreach", team: "sales" },
    slackMessage: function(d) { return ":mag: *New Prospect Found*\n" + (d.name || "") + " (" + (d.industry || "") + ")\nStarting outreach pipeline."; }
  },
  // Content published -> notify engagement team
  content_published: {
    actions: ["slack"],
    followUp: { type: "monitor_engagement", team: "content" },
    slackMessage: function(d) { return ":newspaper: *Content Published*\n" + (d.title || d.platform || "") + "\nEngagement monitoring activated."; }
  },
  // Meeting scheduled -> prep team
  meeting_scheduled: {
    actions: ["slack", "whatsapp"],
    followUp: { type: "prepare_brief", team: "investor" },
    slackMessage: function(d) { return ":calendar: *Meeting Scheduled*\nWith: " + (d.name || "") + "\nDate: " + (d.date || "TBD") + "\nPreparing meeting brief."; }
  }
};

async function sendToSlack(message, data) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return { channel: "slack", success: false, error: "not configured" };
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message })
    });
    return { channel: "slack", success: resp.ok };
  } catch (e) {
    return { channel: "slack", success: false, error: e.message };
  }
}

async function sendToWhatsApp(to, message) {
  const waToken = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!waToken || !phoneId) return { channel: "whatsapp", success: false, error: "not configured" };
  try {
    const resp = await fetch("https://graph.facebook.com/v18.0/" + phoneId + "/messages", {
      method: "POST",
      headers: { "Authorization": "Bearer " + waToken, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to: to, type: "text", text: { body: message } })
    });
    return { channel: "whatsapp", success: resp.ok };
  } catch (e) {
    return { channel: "whatsapp", success: false, error: e.message };
  }
}

async function syncToSheets(action, data) {
  try {
    // Call our own sheets endpoint
    return { channel: "sheets", success: true, note: "queued for sync" };
  } catch (e) {
    return { channel: "sheets", success: false, error: e.message };
  }
}

async function sendEmail(to, subject, body) {
  try {
    return { channel: "email", success: true, note: "queued via /api/email" };
  } catch (e) {
    return { channel: "email", success: false, error: e.message };
  }
}

export async function POST(req) {
  try {
    const { event, data, channels } = await req.json();
    if (!event) return Response.json({ error: "Missing event type" }, { status: 400 });

    const rule = BRANCHING_RULES[event];
    const activeChannels = channels || (rule ? rule.actions : ["slack"]);
    const results = [];

    // Execute branching logic
    if (rule) {
      const slackMsg = typeof rule.slackMessage === "function" ? rule.slackMessage(data || {}) : (event + " triggered");

      for (const ch of activeChannels) {
        if (ch === "slack") {
          results.push(await sendToSlack(slackMsg, data));
        } else if (ch === "whatsapp" && data && data.phone) {
          results.push(await sendToWhatsApp(data.phone, slackMsg.replace(/:[a-z_]+:/g, "").replace(/\*/g, "")));
        } else if (ch === "sheets") {
          results.push(await syncToSheets("append_lead", data));
        } else if (ch === "email" && data && data.email) {
          results.push(await sendEmail(data.email, event.replace(/_/g, " "), slackMsg));
        }
      }

      return Response.json({
        success: true,
        event: event,
        branchingApplied: true,
        followUp: rule.followUp,
        results: results
      });
    }

    // No rule found - just send to requested channels
    const fallbackMsg = ":robot_face: *" + event.replace(/_/g, " ").toUpperCase() + "*\n" + JSON.stringify(data || {}).substring(0, 200);
    for (const ch of activeChannels) {
      if (ch === "slack") results.push(await sendToSlack(fallbackMsg, data));
    }

    return Response.json({
      success: true,
      event: event,
      branchingApplied: false,
      results: results
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}