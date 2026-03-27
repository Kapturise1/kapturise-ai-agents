export const runtime = "edge";

export async function POST(req) {
  try {
    const { apiKey, ...body } = await req.json();
    const key = process.env.ANTHROPIC_API_KEY || apiKey;
    if (!key) return Response.json({ error: "No API key. Set ANTHROPIC_API_KEY env var or provide in request." }, { status: 401 });
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(body),
    });
    const data = await res.text();
    return new Response(data, { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
