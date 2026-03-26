export async function POST(req) {
  try {
    const { provider, apiKey, phone, script, agentName, fromPhone } = await req.json();
    
    if (!apiKey) return Response.json({ error: "No API key. Add your " + (provider || "call") + " key in Integrations." }, { status: 400 });
    if (!phone) return Response.json({ error: "No phone number provided" }, { status: 400 });

    if (provider === "vapi") {
      // Vapi AI outbound call
      const vapiBody = {
        phoneNumberId: fromPhone || undefined,
        customer: { number: phone },
        assistant: {
          firstMessage: script || ("Hi, this is " + (agentName || "an agent") + " from Kapturise. How are you today?"),
          model: { provider: "anthropic", model: "claude-sonnet-4-20250514", messages: [
            { role: "system", content: "You are " + (agentName || "a sales agent") + " from Kapturise, a creative media agency in Dubai. " + (script || "You are making a warm outreach call.") }
          ]},
          voice: { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM" }
        }
      };
      const resp = await fetch("https://api.vapi.ai/call/phone", {
        method: "POST",
        headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify(vapiBody)
      });
      const data = await resp.json();
      if (!resp.ok) return Response.json({ error: data.message || JSON.stringify(data) }, { status: resp.status });
      return Response.json({ success: true, callId: data.id, provider: "vapi" });
    }
    
    // Bland.ai fallback
    const blandBody = {
      phone_number: phone,
      task: script || ("Call this person as " + (agentName || "agent") + " from Kapturise creative agency in Dubai."),
      voice: "mason",
      first_sentence: "Hi, this is " + (agentName || "an agent") + " from Kapturise. Is this a good time to talk?",
      wait_for_greeting: true,
      record: true,
      from: fromPhone || undefined
    };
    const resp = await fetch("https://api.bland.ai/v1/calls", {
      method: "POST",
      headers: { "Authorization": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(blandBody)
    });
    const data = await resp.json();
    if (!resp.ok) return Response.json({ error: data.message || JSON.stringify(data) }, { status: resp.status });
    return Response.json({ success: true, callId: data.call_id, provider: "bland" });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}