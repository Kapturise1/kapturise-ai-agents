export const runtime = "edge";

export async function POST(req) {
  try {
    const { to, message, template, templateParams } = await req.json();
    const waToken = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!waToken || !phoneId) {
      return Response.json({ error: "WHATSAPP_TOKEN or WHATSAPP_PHONE_ID not configured" }, { status: 500 });
    }
    if (!to) {
      return Response.json({ error: "Missing 'to' phone number" }, { status: 400 });
    }

    const url = "https://graph.facebook.com/v18.0/" + phoneId + "/messages";
    let body;

    if (template) {
      body = {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: template,
          language: { code: "en" },
          components: templateParams ? [{ type: "body", parameters: templateParams.map(function(p) { return { type: "text", text: p }; }) }] : []
        }
      };
    } else {
      body = {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message || "Hello from Kapturise AI Agents" }
      };
    }

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + waToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const result = await resp.json();
    if (!resp.ok) {
      return Response.json({ error: "WhatsApp API error", details: result }, { status: 502 });
    }

    return Response.json({
      success: true,
      messageId: result.messages && result.messages[0] ? result.messages[0].id : null,
      to: to
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}