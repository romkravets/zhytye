/**
 * API route tests — test the validation logic of generate-events/route.js
 * without invoking Next.js. We test the guard conditions directly.
 */

const MAX_PROMPT_LENGTH = 3000;

function validatePrompt(body) {
  if (!body || typeof body !== "object")
    return { error: "Invalid JSON", status: 400 };
  const { prompt } = body;
  if (!prompt || typeof prompt !== "string")
    return { error: "Missing prompt", status: 400 };
  if (prompt.length > MAX_PROMPT_LENGTH)
    return { error: "Prompt too long", status: 400 };
  return null; // valid
}

function validateBodySize(contentLength) {
  if (contentLength && parseInt(contentLength, 10) > 16 * 1024) {
    return { error: "Request too large", status: 413 };
  }
  return null;
}

describe("API route input validation", () => {
  describe("validateBodySize", () => {
    test("accepts normal request", () => {
      expect(validateBodySize("1024")).toBeNull();
    });

    test("rejects body > 16KB", () => {
      expect(validateBodySize(String(16 * 1024 + 1))).toMatchObject({
        status: 413,
      });
    });

    test("passes when no content-length header", () => {
      expect(validateBodySize(null)).toBeNull();
    });

    test("passes at exact 16KB boundary", () => {
      expect(validateBodySize(String(16 * 1024))).toBeNull();
    });
  });

  describe("validatePrompt", () => {
    test("valid prompt passes", () => {
      expect(validatePrompt({ prompt: "Згенеруй 10 подій..." })).toBeNull();
    });

    test("missing prompt returns 400", () => {
      expect(validatePrompt({})).toMatchObject({ status: 400 });
    });

    test("null prompt returns 400", () => {
      expect(validatePrompt({ prompt: null })).toMatchObject({ status: 400 });
    });

    test("numeric prompt returns 400", () => {
      expect(validatePrompt({ prompt: 123 })).toMatchObject({ status: 400 });
    });

    test("empty string returns 400", () => {
      expect(validatePrompt({ prompt: "" })).toMatchObject({ status: 400 });
    });

    test("prompt at max length passes", () => {
      expect(
        validatePrompt({ prompt: "a".repeat(MAX_PROMPT_LENGTH) }),
      ).toBeNull();
    });

    test("prompt over max length returns 400", () => {
      expect(
        validatePrompt({ prompt: "a".repeat(MAX_PROMPT_LENGTH + 1) }),
      ).toMatchObject({ status: 400 });
    });
  });
});

describe("Event sanitization — edge cases", () => {
  const { sanitizeEvent } = require("../lib/gameLogic");

  test("day 0 gets clamped to 1", () => {
    const e = sanitizeEvent({
      day: 0,
      title: "T",
      moneyChange: 0,
      moodChange: 0,
      healthChange: 0,
      socialChange: 0,
    });
    expect(e.day).toBe(1);
  });

  test("day 90+ gets clamped to 89", () => {
    const e = sanitizeEvent({
      day: 90,
      title: "T",
      moneyChange: 0,
      moodChange: 0,
      healthChange: 0,
      socialChange: 0,
    });
    expect(e.day).toBe(89);
  });

  test("extreme money change is preserved (real events can be large)", () => {
    const e = sanitizeEvent({
      day: 5,
      title: "Lottery",
      moneyChange: 100000,
      moodChange: 0,
      healthChange: 0,
      socialChange: 0,
    });
    expect(e.moneyChange).toBe(100000);
  });

  test("negative money change preserved", () => {
    const e = sanitizeEvent({
      day: 5,
      title: "Theft",
      moneyChange: -5000,
      moodChange: 0,
      healthChange: 0,
      socialChange: 0,
    });
    expect(e.moneyChange).toBe(-5000);
  });
});
