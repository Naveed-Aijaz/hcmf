export default async function handler(req, res) {
  // CORS for same-origin SPA (safe defaults)
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "AI API key is not configured.",
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON body." });
    }
  }

  const { messages } = body || {};

  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > 20 ||
    messages.some(
      (m) =>
        !m ||
        !["user", "assistant"].includes(m.role) ||
        typeof m.content !== "string" ||
        m.content.length === 0 ||
        m.content.length > 8000
    )
  ) {
    return res.status(400).json({ error: "Invalid messages." });
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:5173",
          "X-Title": "HCM Lite AI Assistant",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI assistant for an HR / HCM web app. Reply clearly and naturally. You can understand English, Urdu, and Roman Urdu. Do not claim access to live application data, databases, or private employee records unless that data is explicitly provided in the conversation. If asked for another person's salary or private data, refuse politely.",
            },
            ...messages,
          ],
          max_tokens: 1024,
        }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("OpenRouter error:", data);
      return res.status(502).json({
        error: data?.error?.message || "AI provider request failed. Please try again.",
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || !reply.trim()) {
      return res.status(502).json({ error: "AI returned an empty response." });
    }

    return res.status(200).json({ reply: reply.trim() });
  } catch (error) {
    console.error("AI request failed:", error);
    return res.status(500).json({
      error: "Unable to connect to the AI service.",
    });
  }
}