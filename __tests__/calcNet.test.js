const { calcNet } = require("../lib/gameLogic");

describe("calcNet — take-home salary calculation", () => {
  // ---------- emp_official (−23%) ----------
  describe("emp_official", () => {
    test("typical salary", () => {
      expect(calcNet(25000, "emp_official")).toBe(19250);
    });
    test("rounds correctly", () => {
      // 10000 * 0.77 = 7700
      expect(calcNet(10000, "emp_official")).toBe(7700);
    });
    test("zero gross → zero net", () => {
      expect(calcNet(0, "emp_official")).toBe(0);
    });
  });

  // ---------- emp_envelope (0% tax) ----------
  describe("emp_envelope", () => {
    test("returns gross unchanged", () => {
      expect(calcNet(30000, "emp_envelope")).toBe(30000);
    });
    test("zero", () => {
      expect(calcNet(0, "emp_envelope")).toBe(0);
    });
  });

  // ---------- fop1 (−3100 flat) ----------
  describe("fop1", () => {
    test("typical: 25000 → 21900", () => {
      expect(calcNet(25000, "fop1")).toBe(21900);
    });
    test("gross below 3100 → floors at 0, not negative", () => {
      expect(calcNet(2000, "fop1")).toBe(0);
    });
    test("exact 3100 → 0", () => {
      expect(calcNet(3100, "fop1")).toBe(0);
    });
    test("zero gross → 0", () => {
      expect(calcNet(0, "fop1")).toBe(0);
    });
  });

  // ---------- fop2 (−4495 flat) ----------
  describe("fop2", () => {
    test("typical: 25000 → 20505", () => {
      expect(calcNet(25000, "fop2")).toBe(20505);
    });
    test("gross below 4495 → floors at 0", () => {
      expect(calcNet(3000, "fop2")).toBe(0);
    });
  });

  // ---------- fop3 (−5%) ----------
  describe("fop3", () => {
    test("20000 → 19000", () => {
      expect(calcNet(20000, "fop3")).toBe(19000);
    });
    test("rounds correctly", () => {
      // 25001 * 0.95 = 23750.95 → rounds to 23751
      expect(calcNet(25001, "fop3")).toBe(Math.round(25001 * 0.95));
    });
    test("zero → 0", () => {
      expect(calcNet(0, "fop3")).toBe(0);
    });
  });

  // ---------- diia_city (−5%) ----------
  describe("diia_city", () => {
    test("same as fop3 rate", () => {
      expect(calcNet(50000, "diia_city")).toBe(Math.round(50000 * 0.95));
    });
  });

  // ---------- unknown type ----------
  describe("unknown type", () => {
    test("falls through to gross unchanged", () => {
      expect(calcNet(25000, "unknown_type")).toBe(25000);
    });
  });
});
