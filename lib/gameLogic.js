/**
 * Pure business logic for the Zhytye simulator.
 * Extracted here so it can be tested without React or Next.js.
 */

// ============== STATIC DATA ==============
const CITIES = {
  kyiv: { name: "Київ", rent: 18000, dailyFood: 250, utilities: 2400 },
  lviv: { name: "Львів", rent: 14000, dailyFood: 220, utilities: 2000 },
  dnipro: { name: "Дніпро", rent: 11000, dailyFood: 200, utilities: 1900 },
  ternopil: { name: "Тернопіль", rent: 8000, dailyFood: 180, utilities: 1700 },
  village: { name: "Село", rent: 3000, dailyFood: 130, utilities: 1500 },
};

const TRANSPORT = {
  none: { monthly: 0, daily: 0 },
  public: { monthly: 600, daily: 0 },
  car: { monthly: 2500, daily: 200 },
  mixed: { monthly: 600, daily: 60 },
  taxi: { monthly: 0, daily: 130 },
};

const PETS = {
  none: { monthly: 0 },
  cat: { monthly: 800 },
  dog: { monthly: 1500 },
  both: { monthly: 2200 },
};

const SUBS = {
  none: { monthly: 0 },
  light: { monthly: 350 },
  heavy: { monthly: 1200 },
};

const EATING = {
  never: { daily: 0 },
  sometimes: { daily: 50 },
  often: { daily: 130 },
};

const FAMILY = {
  single: { mul: 1 },
  partner: { mul: 1.6 },
  kid: { mul: 1.9 },
};

const HOUSING = {
  rent: { mul: 1 },
  own: { mul: 0 },
  parents: { mul: 0 },
};

const SIM_DAYS = 90;
const BANKRUPTCY_THRESHOLD = -8000;

/**
 * Calculate net (take-home) salary from gross salary + employment type.
 * @param {number} gross
 * @param {string} type
 * @returns {number}
 */
function calcNet(gross, type) {
  switch (type) {
    case "emp_official":
      return Math.round(gross * 0.77);
    case "emp_envelope":
      return gross;
    case "fop1":
      return Math.max(0, gross - 3100);
    case "fop2":
      return Math.max(0, gross - 4495);
    case "fop3":
      return Math.round(gross * 0.95);
    case "diia_city":
      return Math.round(gross * 0.95);
    default:
      return gross;
  }
}

/**
 * Calculate monthly fixed costs.
 */
function calcMonthlyFixed({
  city,
  family,
  housing,
  transport,
  pets,
  subs,
  gym,
}) {
  const cityData = CITIES[city];
  const famMul = FAMILY[family].mul;
  const housingMul = HOUSING[housing].mul;
  return (
    Math.round(cityData.rent * famMul * housingMul) +
    cityData.utilities +
    TRANSPORT[transport].monthly +
    PETS[pets].monthly +
    SUBS[subs].monthly +
    (gym ? 800 : 0)
  );
}

/**
 * Calculate daily variable costs.
 */
function calcDailyVariable({ city, family, transport, eating }) {
  const cityData = CITIES[city];
  const famMul = FAMILY[family].mul;
  return (
    Math.round(cityData.dailyFood * famMul) +
    TRANSPORT[transport].daily +
    EATING[eating].daily
  );
}

/**
 * Determine end condition given current simulation state.
 * Returns 'bankrupt' | 'sick' | 'burnout' | 'survived' | null (game continues)
 */
function checkEndCondition({ day, money, health, mood }) {
  if (day >= SIM_DAYS) return "survived";
  if (money < BANKRUPTCY_THRESHOLD) return "bankrupt";
  if (health <= 0) return "sick";
  if (mood <= 0) return "burnout";
  return null;
}

/**
 * Sanitize a single AI-generated event object.
 */
function sanitizeEvent(e) {
  return {
    day: Number.isFinite(e.day)
      ? Math.max(1, Math.min(89, Math.round(e.day)))
      : 5,
    title: typeof e.title === "string" ? e.title.slice(0, 60) : "Подія",
    moneyChange: Number.isFinite(e.moneyChange) ? Math.round(e.moneyChange) : 0,
    moodChange: Number.isFinite(e.moodChange) ? Math.round(e.moodChange) : 0,
    healthChange: Number.isFinite(e.healthChange)
      ? Math.round(e.healthChange)
      : 0,
    socialChange: Number.isFinite(e.socialChange)
      ? Math.round(e.socialChange)
      : 0,
  };
}

module.exports = {
  calcNet,
  calcMonthlyFixed,
  calcDailyVariable,
  checkEndCondition,
  sanitizeEvent,
  SIM_DAYS,
  BANKRUPTCY_THRESHOLD,
  CITIES,
};
