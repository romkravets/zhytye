/**
 * Pure business logic for the Zhytye simulator.
 * Extracted here so it can be tested without React or Next.js.
 */

// ============== STATIC DATA ==============
const CITIES = {
  kyiv:     { name: "Київ",      rent: 18000, dailyFood: 250, utilities: 2400, vibe: "столиця" },
  lviv:     { name: "Львів",     rent: 14000, dailyFood: 220, utilities: 2000, vibe: "захід"   },
  dnipro:   { name: "Дніпро",    rent: 11000, dailyFood: 200, utilities: 1900, vibe: "центр"   },
  ternopil: { name: "Тернопіль", rent: 8000,  dailyFood: 180, utilities: 1700, vibe: "тихе"    },
  village:  { name: "Село",      rent: 3000,  dailyFood: 130, utilities: 1500, vibe: "хутір"   },
};

const EMP_TYPES = {
  emp_official: { label: "найманий, офіц.", sub: "−23%"        },
  emp_envelope: { label: "у конверті",      sub: "0% податків" },
  fop1:         { label: "ФОП 1 гр.",       sub: "−3 100/міс"  },
  fop2:         { label: "ФОП 2 гр.",       sub: "−4 495/міс"  },
  fop3:         { label: "ФОП 3 гр.",       sub: "−5%"         },
  diia_city:    { label: "Дія.City",        sub: "−5%"         },
};

const HOUSING = {
  rent:    { label: "оренда",    mul: 1, sub: "повна вартість" },
  own:     { label: "своє",      mul: 0, sub: "без оренди"     },
  parents: { label: "у батьків", mul: 0, sub: "без оренди"     },
};

const TRANSPORT = {
  none:   { label: "без",          monthly: 0,    daily: 0,   sub: "пішки/велосипед" },
  public: { label: "громадський",  monthly: 600,  daily: 0,   sub: "проїзний"        },
  car:    { label: "власне авто",  monthly: 2500, daily: 200, sub: "паливо+ТО"       },
  mixed:  { label: "мікс",         monthly: 600,  daily: 60,  sub: "трохи всього"    },
  taxi:   { label: "таксі",        monthly: 0,    daily: 130, sub: "болт/уклон"      },
};

const PETS = {
  none: { label: "нема",         monthly: 0    },
  cat:  { label: "кіт",          monthly: 800  },
  dog:  { label: "собака",       monthly: 1500 },
  both: { label: "кіт + собака", monthly: 2200 },
};

const SUBS = {
  none:  { label: "нема",   monthly: 0,    sub: ""                },
  light: { label: "кілька", monthly: 350,  sub: "нетфлікс+спотіф" },
  heavy: { label: "усі",    monthly: 1200, sub: "+ChatGPT, iCloud" },
};

const EATING = {
  never:     { label: "майже ніколи", daily: 0   },
  sometimes: { label: "іноді",        daily: 50  },
  often:     { label: "часто",        daily: 130 },
};

const FRIENDS = {
  low:    { label: "мало",      socFactor: 0.6, eventCount: 1 },
  normal: { label: "нормально", socFactor: 1.0, eventCount: 2 },
  high:   { label: "часто",     socFactor: 1.5, eventCount: 3 },
};

const FAMILY = {
  single:  { label: "сам",        mul: 1   },
  partner: { label: "у парі",     mul: 1.6 },
  kid:     { label: "з дитиною",  mul: 1.9 },
};

const SIM_DAYS = 90;
const BANKRUPTCY_THRESHOLD = -8000;
const GYM_MONTHLY = 800;

const SAVINGS_PRESETS = [
  { key: "zero",  label: "0",       months: 0 },
  { key: "one",   label: "1 міс",   months: 1 },
  { key: "three", label: "3 міс",   months: 3 },
  { key: "six",   label: "6 міс",   months: 6 },
];

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
    (gym ? GYM_MONTHLY : 0)
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

/**
 * Per-day drift of health / mood / social, driven by the lifestyle profile.
 * Called every simulated day; `money` is the current balance (debt adds stress).
 * @returns {{ health: number, mood: number, social: number }}
 */
function calcDailyDeltas({
  gym = false,
  eating = "sometimes",
  transport = "public",
  pets = "none",
  family = "single",
  friends = "normal",
  surplus = 0,
  money = 0,
}) {
  let health = -0.3;
  let mood = -0.5;
  let social = -1.0 / (FRIENDS[friends]?.socFactor ?? 1);

  // Спорт
  if (gym) {
    health += 0.25;
    mood += 0.1;
  }

  // Харчування
  if (eating === "often") {
    health -= 0.1;
    mood += 0.05;
  } else if (eating === "never") {
    health += 0.03;
  }

  // Рух
  if (transport === "none") health += 0.1;
  else if (transport === "car" || transport === "taxi") health -= 0.05;

  // Тварини: собака = прогулянки, будь-яка тварина = трохи радості
  if (pets === "dog" || pets === "both") {
    health += 0.05;
    social += 0.1;
  }
  if (pets !== "none") mood += 0.05;

  // Сім'я: не самотньо, але більше клопоту
  if (family !== "single") social += 0.2;
  if (family === "kid") health -= 0.05;

  // Фінансовий буфер знижує стрес
  if (surplus > 20000) mood += 0.15;
  else if (surplus > 8000) mood += 0.08;
  else if (surplus > 3000) mood += 0.03;
  else if (surplus < 0) {
    mood -= 0.1;
    health -= 0.1;
  }

  // Борги прямо зараз
  if (money < 0) {
    mood -= 0.3;
    health -= 0.15;
  }

  return { health, mood, social };
}

// ============== LOCAL EVENT GENERATOR ==============

/** Deterministic PRNG (mulberry32) — pass a seed in tests for stable output. */
function createRng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Event pool. `when` filters by profile; `money` is a [min, max] range
 * rounded to 50 грн. Other fields are fixed deltas.
 */
const EVENT_POOL = {
  lifestyle: [
    { title: "Штраф за паркування", when: (p) => p.transport === "car", money: [-680, -340], mood: -6 },
    { title: "Заміна гуми на авто", when: (p) => p.transport === "car", money: [-3000, -1800], mood: -5 },
    { title: "Подряпали авто у дворі", when: (p) => p.transport === "car", money: [-2500, -1200], mood: -8 },
    { title: "Таксі по тарифу ×2", when: (p) => p.transport === "taxi", money: [-600, -300], mood: -4 },
    { title: "Загубив проїзний", when: (p) => p.transport === "public" || p.transport === "mixed", money: [-600, -600], mood: -4 },
    { title: "Проколов колесо велосипеда", when: (p) => p.transport === "none", money: [-400, -200], mood: -3 },
    { title: "Ветеринар для кота", when: (p) => p.pets === "cat" || p.pets === "both", money: [-1500, -700], mood: -5 },
    { title: "Кіт подер диван", when: (p) => p.pets === "cat" || p.pets === "both", money: [-800, 0], mood: -4 },
    { title: "Щеплення собаці", when: (p) => p.pets === "dog" || p.pets === "both", money: [-1200, -600], mood: -2 },
    { title: "Собака зʼїв навушники", when: (p) => p.pets === "dog" || p.pets === "both", money: [-2000, -900], mood: -7 },
    { title: "Раптове списання підписки", when: (p) => p.subs !== "none", money: [-450, -200], mood: -4 },
    { title: "Подорожчала підписка", when: (p) => p.subs === "heavy", money: [-500, -300], mood: -3 },
    { title: "Нові кросівки для залу", when: (p) => p.gym, money: [-2500, -1500], mood: 6 },
    { title: "Потягнув спину в залі", when: (p) => p.gym, money: [-600, -300], mood: -5, health: -6 },
    { title: "Особистий рекорд у залі", when: (p) => p.gym, money: [0, 0], mood: 8, health: 3 },
    { title: "Доставка їжі щовечора", when: (p) => p.eating === "often", money: [-1200, -600], mood: 3, health: -3 },
    { title: "Наготував на тиждень", when: (p) => p.eating !== "often", money: [200, 400], mood: 4, health: 2 },
    { title: "Дитина захворіла", when: (p) => p.family === "kid", money: [-1500, -700], mood: -8, health: -4 },
    { title: "Шкільні збори", when: (p) => p.family === "kid", money: [-1500, -500], mood: -3 },
    { title: "Сварка з партнером", when: (p) => p.family === "partner", money: [0, 0], mood: -8, social: -5 },
    { title: "Сусіди затопили", when: (p) => p.housing === "rent", money: [-1500, -500], mood: -8 },
    { title: "Батьки попросили допомогти", when: (p) => p.housing === "parents", money: [-800, -300], mood: -2, social: 5 },
    { title: "Прорвало трубу вдома", when: (p) => p.housing === "own", money: [-3000, -1500], mood: -7 },
  ],
  social: [
    { title: "Колеги кличуть на каву", money: [-300, -150], mood: 5, social: 10 },
    { title: "День народження друга", money: [-1200, -600], mood: 6, social: 12 },
    { title: "Вечір настолок у друзів", money: [-300, -100], mood: 7, social: 10 },
    { title: "Друг з фронту приїхав", money: [-600, -300], mood: 4, social: 15 },
    { title: "Весілля знайомих", money: [-3000, -1500], mood: 8, social: 18 },
    { title: "Донат на збір для бригади", money: [-1000, -300], mood: 3, social: 5 },
    { title: "Пікнік з друзями", money: [-500, -200], mood: 8, social: 12, health: 1 },
    { title: "Друг позичив і пропав", money: [-1500, -500], mood: -6, social: -6 },
  ],
  health: [
    { title: "Застудився, ліки", money: [-800, -400], mood: -10, health: -12, social: -5 },
    { title: "Болить зуб, стоматолог", money: [-2500, -1200], mood: -8, health: -8 },
    { title: "Мігрень на два дні", money: [-300, -150], mood: -8, health: -6 },
    { title: "Отруївся шаурмою", money: [-400, -200], mood: -7, health: -9 },
    { title: "Профогляд у лікаря", money: [-900, -500], mood: 2, health: 4 },
  ],
  war: [
    { title: "Блекаут на дві доби", money: [-300, -100], mood: -8, health: -3 },
    { title: "Тривога всю ніч, не виспався", money: [0, 0], mood: -8, health: -5 },
    { title: "Інтернет зник на день", money: [-200, 0], mood: -6 },
    { title: "Купив павербанк і ліхтарик", money: [-1800, -900], mood: 2 },
  ],
  bonus: [
    { title: "Знайшов 200 грн у куртці", money: [200, 200], mood: 8 },
    { title: "Премія за квартал", money: [1000, 3000], mood: 12 },
    { title: "Кешбек від банку", money: [200, 600], mood: 5 },
    { title: "Продав старий телефон", money: [1500, 3000], mood: 6 },
    { title: "Підробіток на вихідних", money: [1000, 2500], mood: 4, health: -2 },
  ],
  household: [
    { title: "Розбив екран телефону", money: [-1500, -800], mood: -10 },
    { title: "Стрижка", money: [-400, -250], mood: 5, social: 3 },
    { title: "Ремонт побутової техніки", money: [-1500, -800], mood: -3 },
    { title: "Куртка розлізлась, нова", money: [-3000, -1800], mood: -5 },
    { title: "Подарунок мамі на ДН", money: [-1500, -800], mood: 7, social: 8 },
    { title: "Подорожчала комуналка", money: [-600, -300], mood: -5 },
    { title: "Зламався чайник", money: [-800, -500], mood: -2 },
    { title: "Хімчистка пальта", money: [-500, -300], mood: 1 },
  ],
};

function pickFrom(list, n, rng) {
  const pool = [...list];
  const out = [];
  while (out.length < n && pool.length) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return out;
}

function rollMoney([min, max], rng) {
  return Math.round((min + rng() * (max - min)) / 50) * 50;
}

/**
 * Generate ~10 life events for the 90-day run from the local pool,
 * tailored to the profile. No AI / network needed.
 * Distribution: 2 lifestyle, 1–3 social, 1 health, 1 war, 1 bonus, rest household.
 */
function generateEvents(profile, rng = Math.random) {
  const TOTAL = 10;
  const socialCount = FRIENDS[profile.friends]?.eventCount ?? 2;
  const lifestyle = EVENT_POOL.lifestyle.filter((e) => e.when(profile));

  const picked = [
    ...pickFrom(lifestyle, 2, rng),
    ...pickFrom(EVENT_POOL.social, socialCount, rng),
    ...pickFrom(EVENT_POOL.health, 1, rng),
    ...pickFrom(EVENT_POOL.war, 1, rng),
    ...pickFrom(EVENT_POOL.bonus, 1, rng),
  ];
  picked.push(...pickFrom(EVENT_POOL.household, TOTAL - picked.length, rng));

  // Unique days in 3..87; reserve birthday/holiday days if they're enabled.
  const reserved = new Set();
  if (profile.bday) reserved.add(28);
  if (profile.holiday) reserved.add(60);
  const days = pickFrom(
    Array.from({ length: 85 }, (_, i) => i + 3).filter((d) => !reserved.has(d)),
    picked.length,
    rng,
  );

  // Спорт робить хвороби легшими
  const healthMul = profile.gym ? 0.6 : 1;

  const events = picked.map((e, i) => {
    const health = e.health || 0;
    return {
      day: days[i],
      title: e.title,
      moneyChange: rollMoney(e.money, rng),
      moodChange: e.mood || 0,
      healthChange: health < 0 ? Math.round(health * healthMul) : health,
      socialChange: e.social || 0,
    };
  });

  if (profile.bday) {
    events.push({ day: 28, title: "Мій день народження", moneyChange: -2500, moodChange: 15, healthChange: 0, socialChange: 25 });
  }
  if (profile.holiday) {
    events.push({ day: 60, title: "Велике свято в родині", moneyChange: -3000, moodChange: 12, healthChange: 0, socialChange: 20 });
  }

  return events.sort((a, b) => a.day - b.day);
}

module.exports = {
  calcNet,
  calcMonthlyFixed,
  calcDailyVariable,
  calcDailyDeltas,
  checkEndCondition,
  generateEvents,
  createRng,
  sanitizeEvent,
  EVENT_POOL,
  SIM_DAYS,
  BANKRUPTCY_THRESHOLD,
  GYM_MONTHLY,
  CITIES,
  EMP_TYPES,
  HOUSING,
  TRANSPORT,
  PETS,
  SUBS,
  EATING,
  FRIENDS,
  FAMILY,
  SAVINGS_PRESETS,
};
