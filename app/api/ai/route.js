export async function POST(req) {
  try {
    const { apiKey, ...body } = await req.json();
    if (!apiKey) return Response.json({ error: "No API key provided" }, { status: 401 });
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
