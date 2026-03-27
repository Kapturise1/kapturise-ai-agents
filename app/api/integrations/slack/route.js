export const runtime = "edge";

export async function POST(req) {
  try {
    const { message, channel, type, data } = await req.json();
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      return Response.json({ error: "SLACK_WEBHOOK_URL not configured" }, { status: 500 });
    }

    const icons = {
      lead_found: ":mag:",
      deal_closed: ":tada:",
      follow_up: ":bell:",
      outreach_sent: ":envelope:",
      call_scheduled: ":telephone_receiver:",
      meeting_booked: ":calendar:",
      content_published: ":newspaper:",
      high_value_lead: ":gem:",
      agent_handoff: ":arrows_counterclockwise:",
      error: ":warning:"
    };

    const icon = icons[type] || ":robot_face:";
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: icon + " *" + (type || "notification").replace(/_/g, " ").toUpperCase() + "*\n" + message
        }
      }
    ];

    if (data) {
      const fields = Object.entries(data).slice(0, 10).map(function(entry) {
        return { type: "mrkdwn", text: "*" + entry[0] + ":* " + entry[1] };
      });
      if (fields.length > 0) {
        blocks.push({ type: "section", fields: fields });
      }
    }

    blocks.push({
      type: "context",
      elements: [{ type: "mrkdwn", text: "Kapturise AI Agents | " + new Date().toISOString() }]
    });

    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: channel || undefined, blocks: blocks, text: message })
    });

    if (!resp.ok) {
      return Response.json({ error: "Slack API error", status: resp.status }, { status: 502 });
    }
    return Response.json({ success: true, type: type });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}