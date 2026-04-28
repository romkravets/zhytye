import { NextResponse } from "next/server";

export async function POST(request) {
  const { prompt } = await request.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { events: null, error: "Missing API key" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    let text = data.content?.[0]?.text || "";
    text = text.replace(/```json|```/g, "").trim();
    const events = JSON.parse(text);

    if (!Array.isArray(events) || events.length < 5) {
      return NextResponse.json({ events: null });
    }

    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ events: null });
  }
}
