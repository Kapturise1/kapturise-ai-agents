// Server-side API route to proxy Anthropic calls
// This avoids exposing the API key client-side and handles longer timeouts

export const maxDuration = 60; // 60s max for Vercel free tier

export async function POST(request) {
  try {
    const body = await request.json();
    const { system, messages, max_tokens = 4096, stream = false } = body;

    // Use server-side env var (never exposed to client)
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: { message: "No Anthropic API key configured on server" } }, { status: 500 });
    }

    if (stream) {
      // Streaming mode - sends chunks as they arrive, avoids timeout
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens,
          system,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        return Response.json({ error: { message: err.slice(0, 500) } }, { status: response.status });
      }

      // Forward the SSE stream to the client
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Non-streaming mode with AbortController timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000); // 55s safety margin

      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens,
            system,
            messages,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const err = await response.text();
          return Response.json({ error: { message: err.slice(0, 500) } }, { status: response.status });
        }

        const data = await response.json();
        return Response.json(data);
      } catch (e) {
        clearTimeout(timeout);
        if (e.name === "AbortError") {
          return Response.json(
            { error: { message: "Request timed out. Try reducing the number of prospects or use a simpler query." } },
            { status: 504 }
          );
        }
        throw e;
      }
    }
  } catch (e) {
    return Response.json({ error: { message: e.message } }, { status: 500 });
  }
}
