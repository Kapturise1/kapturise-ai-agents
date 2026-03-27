export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== "Bearer " + process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  const GMAIL_EMAIL = process.env.GMAIL_EMAIL || "contact@kapturise.com";
  const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
  
  if (!ANTHROPIC_KEY) {
    return Response.json({ error: "No API key" }, { status: 500 });
  }
  
  // Generate follow-up strategy
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: "Review the follow-up schedule for Kapturise creative agency. Generate follow-up email templates for leads that haven't responded in 3+ days. Include: friendly check-in, value proposition reminder, and a soft close. Dubai market focused." }]
    })
  });
  const data = await resp.json();
  
  return Response.json({ 
    success: true, 
    ran_at: new Date().toISOString(),
    type: "daily_followup",
    response_length: JSON.stringify(data).length
  });
}