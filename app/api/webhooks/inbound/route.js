export const runtime = "edge";

// GET: Webhook verification endpoint
export async function GET(req) {
  const url = new URL(req.url);
  const challenge = url.searchParams.get("challenge") || url.searchParams.get("hub.challenge");
  if (challenge) return new Response(challenge, { status: 200 });
  return Response.json({ status: "Kapturise webhook active", timestamp: new Date().toISOString() });
}

// POST: Receive inbound leads from forms, Typeform, Calendly, etc.
export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let data;

    if (contentType.includes("application/json")) {
      data = await req.json();
    } else if (contentType.includes("form")) {
      const formData = await req.formData();
      data = {};
      formData.forEach(function(value, key) { data[key] = value; });
    } else {
      data = await req.json().catch(function() { return {}; });
    }

    // Normalize common field names
    const lead = {
      id: "LEAD-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      name: data.name || data.full_name || data.firstName || "",
      email: data.email || data.emailAddress || "",
      phone: data.phone || data.phoneNumber || data.mobile || "",
      company: data.company || data.organization || data.companyName || "",
      service: data.service || data.interest || data.subject || "",
      message: data.message || data.notes || data.description || "",
      source: data.source || data.utm_source || "website_form",
      receivedAt: new Date().toISOString()
    };

    if (!lead.name && !lead.email) {
      return Response.json({ error: "At least name or email is required" }, { status: 400 });
    }

    // Trigger internal notifications (fan-out to configured channels)
    const notifyUrl = new URL("/api/integrations/notify", req.url).toString();
    const notifyPromise = fetch(notifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "inbound_lead",
        data: lead,
        channels: ["slack", "sheets"]
      })
    }).catch(function() { /* non-blocking */ });

    // Optionally trigger Slack directly
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackUrl) {
      fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: ":incoming_envelope: *New Inbound Lead*\nName: " + lead.name + "\nEmail: " + lead.email + "\nCompany: " + lead.company + "\nService: " + lead.service + "\nMessage: " + (lead.message || "N/A")
        })
      }).catch(function() {});
    }

    return Response.json({
      success: true,
      leadId: lead.id,
      message: "Lead received and queued for processing",
      lead: { name: lead.name, email: lead.email, company: lead.company }
    }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}