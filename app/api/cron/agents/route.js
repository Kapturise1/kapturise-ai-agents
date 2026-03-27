export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== "Bearer " + process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  const GMAIL_EMAIL = process.env.GMAIL_EMAIL || "contact@kapturise.com";
  const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
  
  if (!ANTHROPIC_KEY) {
    return Response.json({ error: "No Anthropic API key configured" }, { status: 500 });
  }
  
  const tasks = [
    "Find 5 new potential clients for Kapturise creative agency in Dubai. Focus on real estate, F&B, events, and ecommerce companies. For each prospect provide: Company Name, Industry, Contact Person, Title, Email (if findable), Phone, LinkedIn, Instagram, Website, and why they need professional photography/videography.",
    "Write personalized cold outreach emails for each prospect found. Subject line + body. Professional but warm tone. Mention Kapturise portfolio and Dubai expertise."
  ];
  
  const results = [];
  for (const task of tasks) {
    try {
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
          messages: [{ role: "user", content: task }]
        })
      });
      const data = await resp.json();
      results.push({ task: task.substring(0, 50), status: "ok", length: JSON.stringify(data).length });
    } catch (e) {
      results.push({ task: task.substring(0, 50), status: "error", error: e.message });
    }
  }
  
  return Response.json({ 
    success: true, 
    ran_at: new Date().toISOString(), 
    tasks_completed: results.length,
    results 
  });
}