const { useTranslation } = require("../lib/i18n");

describe("useTranslation", () => {
  describe("Ukrainian (uk)", () => {
    const t = useTranslation("uk");

    test("returns string for simple key", () => {
      expect(t("startButton")).toBe("почати симуляцію");
    });

    test("serialNo contains expected fragment", () => {
      expect(t("serialNo")).toContain("симулятор");
    });

    test("loadMsgs is an array with content", () => {
      const msgs = t("loadMsgs");
      expect(Array.isArray(msgs)).toBe(true);
      expect(msgs.length).toBeGreaterThan(0);
    });

    test("logRent is a function returning formatted string", () => {
      const result = t("logRent", 14000);
      expect(typeof result).toBe("string");
      expect(result).toContain("14");
    });

    test("goBankruptSub includes day number", () => {
      const result = t("goBankruptSub", 42);
      expect(result).toContain("42");
    });

    test("savingsHint includes amount", () => {
      const result = t("savingsHint", 66500);
      expect(result).toContain("66");
    });

    test("langLabel is EN (switch label)", () => {
      expect(t("langLabel")).toBe("EN");
    });
  });

  describe("English (en)", () => {
    const t = useTranslation("en");

    test("returns English string for simple key", () => {
      expect(t("startButton")).toBe("start simulation");
    });

    test("loadMsgs is an array", () => {
      const msgs = t("loadMsgs");
      expect(Array.isArray(msgs)).toBe(true);
      expect(msgs.length).toBeGreaterThan(0);
    });

    test("logRent is a function returning English string", () => {
      const result = t("logRent", 14000);
      expect(result.toLowerCase()).toContain("rent");
    });

    test("surplusNeg is a warning string", () => {
      const result = t("surplusNeg");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    test("langLabel is УК (switch label)", () => {
      expect(t("langLabel")).toBe("УК");
    });

    test("goBurnoutIsolation includes day", () => {
      const result = t("goBurnoutIsolation", 55);
      expect(result).toContain("55");
    });
  });

  describe("Fallback", () => {
    test("unknown lang falls back to uk", () => {
      const t = useTranslation("fr");
      expect(t("startButton")).toBe("почати симуляцію");
    });

    test("unknown key returns key name", () => {
      const t = useTranslation("uk");
      expect(t("nonExistentKey123")).toBe("nonExistentKey123");
    });
  });
});
