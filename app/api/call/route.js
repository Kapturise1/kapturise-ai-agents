export const runtime = "edge";

export async function POST(req) {
  try {
    const { provider, apiKey, phone, script, agentName, fromPhone } = await req.json();
    const key = process.env.VAPI_API_KEY || apiKey;
    if (!key) return Response.json({ error: "No API key. Set VAPI_API_KEY env var or add your " + (provider || "call") + " key in Integrations." }, { status: 400 });
    if (!phone) return Response.json({ error: "No phone number provided" }, { status: 400 });
    if (provider === "vapi") {
      const vapiBody = {
        phoneNumberId: fromPhone || undefined,
        customer: { number: phone },
        assistant: {
          firstMessage: script || "Hi, this is " + (agentName || "an agent") + " from Kapturise. Do you have a moment to chat about your content needs?",
          model: { provider: "anthropic", model: "claude-sonnet-4-20250514" },
          voice: { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM" }
        }
      };
      const resp = await fetch("https://api.vapi.ai/call/phone", {
        method: "POST",
        headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify(vapiBody)
      });
      const data = await resp.json();
      if (!resp.ok) return Response.json({ error: data.message || "Vapi call failed", details: data }, { status: resp.status });
      return Response.json({ success: true, callId: data.id, status: data.status });
    } else {
      const blandBody = {
        phone_number: phone,
        task: script || "Call this prospect and introduce Kapturise creative agency services.",
        voice: "maya",
        first_sentence: "Hi, this is " + (agentName || "Maya") + " from Kapturise.",
        wait_for_greeting: true
      };
      const resp = await fetch("https://api.bland.ai/v1/calls", {
        method: "POST",
        headers: { "Authorization": key, "Content-Type": "application/json" },
        body: JSON.stringify(blandBody)
      });
      const data = await resp.json();
      if (!resp.ok) return Response.json({ error: data.message || "Bland call failed", details: data }, { status: resp.status });
      return Response.json({ success: true, callId: data.call_id, status: "initiated" });
    }
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
