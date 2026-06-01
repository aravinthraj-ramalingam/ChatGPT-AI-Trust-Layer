export const runtime = "edge";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: { prompt: string; model?: string; baseUrl?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { prompt, model = "gpt-4o-mini", baseUrl = "https://api.openai.com/v1" } = body;

  if (!prompt || typeof prompt !== "string") {
    return new Response("Missing prompt", { status: 400 });
  }

  // Use env var first, then fall back to client-supplied key from header
  const clientKey = req.headers.get("x-api-key") ?? "";
  const apiKey = process.env.OPENAI_API_KEY || clientKey;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "No API key configured. Set OPENAI_API_KEY env var or provide key in settings." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful, concise assistant. Provide clear, well-structured answers in a few paragraphs.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(
        JSON.stringify({ error: `OpenAI API error ${upstream.status}`, details: errText }),
        { status: upstream.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream the response through
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Failed to call OpenAI", details: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
