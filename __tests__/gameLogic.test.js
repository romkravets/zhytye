const {
  calcMonthlyFixed,
  calcDailyVariable,
  checkEndCondition,
  sanitizeEvent,
  SIM_DAYS,
  BANKRUPTCY_THRESHOLD,
} = require("../lib/gameLogic");

// ============================================================
// calcMonthlyFixed
// ============================================================
describe("calcMonthlyFixed", () => {
  const base = {
    city: "lviv",
    family: "single",
    housing: "rent",
    transport: "public",
    pets: "none",
    subs: "none",
    gym: false,
  };

  test("Lviv single renter, public transport, no extras", () => {
    // rent=14000, utilities=2000, transport=600
    expect(calcMonthlyFixed(base)).toBe(14000 + 2000 + 600);
  });

  test("gym adds 800", () => {
    expect(calcMonthlyFixed({ ...base, gym: true })).toBe(
      14000 + 2000 + 600 + 800,
    );
  });

  test("own housing → rent=0", () => {
    const result = calcMonthlyFixed({ ...base, housing: "own" });
    // rent * 0 = 0; only utilities + transport
    expect(result).toBe(0 + 2000 + 600);
  });

  test("parents housing → rent=0", () => {
    const result = calcMonthlyFixed({ ...base, housing: "parents" });
    expect(result).toBe(2000 + 600);
  });

  test("partner multiplies rent", () => {
    // 14000 * 1.6 = 22400 (rent), rounded
    const result = calcMonthlyFixed({ ...base, family: "partner" });
    expect(result).toBe(Math.round(14000 * 1.6) + 2000 + 600);
  });

  test("cat adds 800/mo pets", () => {
    expect(calcMonthlyFixed({ ...base, pets: "cat" })).toBe(
      14000 + 2000 + 600 + 800,
    );
  });

  test("dog adds 1500/mo pets", () => {
    expect(calcMonthlyFixed({ ...base, pets: "dog" })).toBe(
      14000 + 2000 + 600 + 1500,
    );
  });

  test("car transport replaces public", () => {
    expect(calcMonthlyFixed({ ...base, transport: "car" })).toBe(
      14000 + 2000 + 2500,
    );
  });

  test("heavy subs add 1200", () => {
    expect(calcMonthlyFixed({ ...base, subs: "heavy" })).toBe(
      14000 + 2000 + 600 + 1200,
    );
  });

  test("Kyiv is more expensive than village", () => {
    const kyiv = calcMonthlyFixed({ ...base, city: "kyiv" });
    const village = calcMonthlyFixed({ ...base, city: "village" });
    expect(kyiv).toBeGreaterThan(village);
  });
});

// ============================================================
// calcDailyVariable
// ============================================================
describe("calcDailyVariable", () => {
  const base = {
    city: "lviv",
    family: "single",
    transport: "none",
    eating: "never",
  };

  test("single, no transport, never eats out", () => {
    // dailyFood=220*1=220, transport.daily=0, eating.daily=0
    expect(calcDailyVariable(base)).toBe(220);
  });

  test("partner doubles food roughly", () => {
    // 220 * 1.6 = 352
    const result = calcDailyVariable({ ...base, family: "partner" });
    expect(result).toBe(Math.round(220 * 1.6));
  });

  test("taxi adds 130/day", () => {
    expect(calcDailyVariable({ ...base, transport: "taxi" })).toBe(220 + 130);
  });

  test("eating often adds 130/day", () => {
    expect(calcDailyVariable({ ...base, eating: "often" })).toBe(220 + 130);
  });

  test("car adds 200/day fuel", () => {
    expect(calcDailyVariable({ ...base, transport: "car" })).toBe(220 + 200);
  });
});

// ============================================================
// checkEndCondition
// ============================================================
describe("checkEndCondition", () => {
  const alive = { day: 30, money: 5000, health: 50, mood: 50 };

  test("returns null when game should continue", () => {
    expect(checkEndCondition(alive)).toBeNull();
  });

  test("survived when day >= SIM_DAYS (90)", () => {
    expect(checkEndCondition({ ...alive, day: SIM_DAYS })).toBe("survived");
  });

  test("survived at exactly day 90", () => {
    expect(checkEndCondition({ ...alive, day: 90 })).toBe("survived");
  });

  test("bankrupt when money < -8000", () => {
    expect(
      checkEndCondition({ ...alive, money: BANKRUPTCY_THRESHOLD - 1 }),
    ).toBe("bankrupt");
  });

  test("not bankrupt at exactly -8000 (threshold is strict <)", () => {
    expect(
      checkEndCondition({ ...alive, money: BANKRUPTCY_THRESHOLD }),
    ).toBeNull();
  });

  test("sick when health <= 0", () => {
    expect(checkEndCondition({ ...alive, health: 0 })).toBe("sick");
  });

  test("sick at negative health", () => {
    expect(checkEndCondition({ ...alive, health: -1 })).toBe("sick");
  });

  test("burnout when mood <= 0", () => {
    expect(checkEndCondition({ ...alive, mood: 0 })).toBe("burnout");
  });

  test("survived takes priority over bankrupt (day 90 and broke)", () => {
    expect(
      checkEndCondition({ day: 90, money: -100000, health: 50, mood: 50 }),
    ).toBe("survived");
  });

  test("bankrupt takes priority over sick (checked first after survived)", () => {
    // money below threshold AND health=0 → bankrupt comes first in code
    expect(
      checkEndCondition({ day: 30, money: -10000, health: 0, mood: 50 }),
    ).toBe("bankrupt");
  });
});

// ============================================================
// sanitizeEvent
// ============================================================
describe("sanitizeEvent", () => {
  test("passes through valid event", () => {
    const input = {
      day: 10,
      title: "Test event",
      moneyChange: -300,
      moodChange: -5,
      healthChange: 0,
      socialChange: 3,
    };
    const out = sanitizeEvent(input);
    expect(out).toEqual(input);
  });

  test("clamps day to [1, 89]", () => {
    expect(
      sanitizeEvent({
        day: 0,
        title: "X",
        moneyChange: 0,
        moodChange: 0,
        healthChange: 0,
        socialChange: 0,
      }).day,
    ).toBe(1);
    expect(
      sanitizeEvent({
        day: 100,
        title: "X",
        moneyChange: 0,
        moodChange: 0,
        healthChange: 0,
        socialChange: 0,
      }).day,
    ).toBe(89);
  });

  test("defaults day to 5 on non-numeric", () => {
    expect(
      sanitizeEvent({
        day: "bad",
        title: "X",
        moneyChange: 0,
        moodChange: 0,
        healthChange: 0,
        socialChange: 0,
      }).day,
    ).toBe(5);
  });

  test("truncates title to 60 chars", () => {
    const longTitle = "a".repeat(80);
    expect(
      sanitizeEvent({
        day: 5,
        title: longTitle,
        moneyChange: 0,
        moodChange: 0,
        healthChange: 0,
        socialChange: 0,
      }).title,
    ).toHaveLength(60);
  });

  test('defaults title to "Подія" on non-string', () => {
    expect(
      sanitizeEvent({
        day: 5,
        title: 123,
        moneyChange: 0,
        moodChange: 0,
        healthChange: 0,
        socialChange: 0,
      }).title,
    ).toBe("Подія");
  });

  test("rounds money and mood changes", () => {
    const out = sanitizeEvent({
      day: 5,
      title: "T",
      moneyChange: 100.7,
      moodChange: -2.9,
      healthChange: 0.1,
      socialChange: 3.5,
    });
    expect(out.moneyChange).toBe(101);
    expect(out.moodChange).toBe(-3);
    expect(out.healthChange).toBe(0);
    expect(out.socialChange).toBe(4);
  });

  test("defaults numeric fields to 0 on NaN", () => {
    const out = sanitizeEvent({
      day: 5,
      title: "T",
      moneyChange: NaN,
      moodChange: undefined,
      healthChange: null,
      socialChange: "bad",
    });
    expect(out.moneyChange).toBe(0);
    expect(out.moodChange).toBe(0);
    expect(out.healthChange).toBe(0);
    expect(out.socialChange).toBe(0);
  });
});
