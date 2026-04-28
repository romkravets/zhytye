import { NextResponse } from "next/server";

const MAX_PROMPT_LENGTH = 3000;
const API_TIMEOUT_MS = 20_000;

// ── In-memory rate limiter ──────────────────────────────────────────────────
// 5 requests per minute per IP. Resets automatically via sliding window.
// For multi-instance deployments swap this for Upstash Redis.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;
/** @type {Map<string, { count: number; windowStart: number }>} */
const rateLimitMap = new Map();

function getRateLimitIp(request) {
  // x-forwarded-for may be a comma-separated list; take the first entry.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true; // allowed
  }

  if (entry.count >= RATE_LIMIT) return false; // blocked

  entry.count += 1;
  return true; // allowed
}

// Clean up stale entries every hour to prevent unbounded memory growth.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - RATE_WINDOW_MS;
    for (const [ip, entry] of rateLimitMap) {
      if (entry.windowStart < cutoff) rateLimitMap.delete(ip);
    }
  }, 3_600_000);
}
// ────────────────────────────────────────────────────────────────────────────

export async function POST(request) {
  // Rate limit check
  const ip = getRateLimitIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { events: null, error: "Too many requests. Please wait a minute." },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      },
    );
  }

  // Body size guard — prevent abuse with huge payloads
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 16 * 1024) {
    return NextResponse.json(
      { events: null, error: "Request too large" },
      { status: 413 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { events: null, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const { prompt } = body;

  // Input validation
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { events: null, error: "Missing prompt" },
      { status: 400 },
    );
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { events: null, error: "Prompt too long" },
      { status: 400 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { events: null, error: "Missing API key" },
      { status: 500 },
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
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
    clearTimeout(timer);

    if (!res.ok) {
      console.error("Anthropic API error:", res.status);
      return NextResponse.json({ events: null });
    }

    const data = await res.json();
    let text = data.content?.[0]?.text || "";
    text = text.replace(/```json|```/g, "").trim();

    let events;
    try {
      events = JSON.parse(text);
    } catch {
      return NextResponse.json({ events: null });
    }

    if (!Array.isArray(events) || events.length < 5) {
      return NextResponse.json({ events: null });
    }

    // Sanitize event fields to expected types
    const safe = events.map((e) => ({
      day: Number.isFinite(e.day)
        ? Math.max(1, Math.min(89, Math.round(e.day)))
        : 5,
      title: typeof e.title === "string" ? e.title.slice(0, 60) : "Подія",
      moneyChange: Number.isFinite(e.moneyChange)
        ? Math.round(e.moneyChange)
        : 0,
      moodChange: Number.isFinite(e.moodChange) ? Math.round(e.moodChange) : 0,
      healthChange: Number.isFinite(e.healthChange)
        ? Math.round(e.healthChange)
        : 0,
      socialChange: Number.isFinite(e.socialChange)
        ? Math.round(e.socialChange)
        : 0,
    }));

    return NextResponse.json({ events: safe });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      console.error("Anthropic API timed out");
    } else {
      console.error("generate-events error:", err);
    }
    return NextResponse.json({ events: null });
  }
}
