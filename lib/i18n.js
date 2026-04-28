// ============================================================
// i18n — Ukrainian / English translations
// Usage: import { useTranslation } from '../lib/i18n';
//        const t = useTranslation(lang);
//        t('startButton')
// ============================================================

const translations = {
  uk: {
    // Header
    serialNo: "№ 002 · симулятор · 2026",
    titleLine1: "Житє-",
    titleLine2: "здатність",
    subtitle:
      "Налаштуй профіль, побач прогноз бюджету, потім дай ШІ зіграти 90 днів життя.",

    // Sections
    sIncome: "Дохід",
    sHousing: "Житло",
    sTransport: "Транспорт",
    sLifestyle: "Спосіб життя",
    sSocial: "Соціальне",

    // Fields
    fSalary: "Зарплата (грн, брутто/міс)",
    fEmpType: "Тип зайнятості",
    fSavings: "Початкові заощадження",
    fCity: "Місто",
    fHousingType: "Тип житла",
    fTransport: "Як пересуваєшся",
    fPets: "Тварини",
    fSubs: "Підписки",
    fEating: "Кафе/ресторани",
    fGym: "Спортзал",
    fFamily: "З ким живеш",
    fFriends: "Активність зі знайомими",
    fBday: "Свій ДН у цей період?",
    fHoliday: "Велике свято (НР, Різдво, ін.)?",

    // Savings
    savingsHint: (amount) =>
      `Стартуєш з ${amount.toLocaleString("uk-UA")} грн на рахунку`,
    savingsLabel: (amount, months) =>
      `заощадження ${amount.toLocaleString("uk-UA")} грн (${months} міс зп)`,
    savingsZero: "без заощаджень",
    savingsBareSub: "голий старт",

    // Summary section
    sSummaryTitle: "попередній розрахунок",
    sumNetPerMo: "на руки/міс",
    sumFixPerMo: "фікс/міс",
    sumDayVarDay: "їжа+транспорт/день",
    sumDayVarMo: "≈ змінні/міс",
    sumSurplusLabel: "залишок на запас і непередбачуване",

    surplusNeg:
      "Уже мінус — без подій. Ризикуєш збанкрутувати на 1-му ж місяці.",
    surplusLow: "Тонкий запас. Будь-яка несподіванка зʼїсть його.",
    surplusMid: "Маржа є, але не велика. Ризики є.",
    surplusOk: "Хороший запас — спокій.",

    // Buttons
    startButton: "почати симуляцію",
    resetButton: "ще раз",

    // Footer note
    footerNote:
      "90 днів = ~45 секунд при швидкості ×2. ШІ генерує події один раз на старті з урахуванням профілю. Дані не зберігаються.",

    // Loading messages
    loadMsgs: [
      "ШІ продумує твоє життя...",
      "Прогнозує блекаути...",
      "Дзвонить орендодавцю...",
      "Радиться з друзями...",
    ],

    // Playing screen
    pDay: "день",
    pBalance: "баланс",
    pLog: "хроніка",
    pMood: "настрій",
    pHealth: "здоровʼя",
    pSocial: "соц",
    pCity: "місто",
    pEmp: "зайнятість",
    pNet: "на руки/міс",
    pSavings: "заощадження",
    pFixed: "фікс/міс",
    pDaily: "змін/день",
    pZeroSavings: "0 (голий старт)",

    // Gameover
    goVerdict: "вердикт",
    goSurvived: "Прожив 90 днів.",
    goBankrupt: "Збанкрутував.",
    goSick: "Здоровʼя на нулі.",
    goBurnout: "Вигорів.",

    goSubSurvivedGood: "Ще й накопичив трошки.",
    goSubSurvivedMarginal: "Ледь дотягнув до фінішу.",
    goSubSurvivedNeg: "Але мінусом до карти.",
    goBankruptSub: (day) => `Заборг по оренді й продуктах на ${day} день.`,
    goSickSub: (day) => `Лікарня замість роботи. День ${day}.`,
    goBurnoutIsolation: (day) =>
      `Соціальна ізоляція вбила настрій. Мало спілкування → хронічний стрес → вигорання на день ${day}.`,
    goBurnoutEvents: (day) =>
      `Накопичення стресових подій переважило фінансовий комфорт. День ${day}.`,

    goBalance: "баланс",
    goMood: "настрій",
    goHealth: "здоровʼя",
    goSocial: "соц",

    // Log labels
    logRent: (amount) => `Оренда −${amount.toLocaleString("uk-UA")} грн`,
    logFixedCosts: (amount, parts) =>
      `Фіксовані: ${parts.join(", ")} −${amount.toLocaleString("uk-UA")} грн`,
    logPets: (amount) =>
      `Корм для тварин −${amount.toLocaleString("uk-UA")} грн`,
    logSalary: (amount) => `Зарплата +${amount.toLocaleString("uk-UA")} грн`,
    logUtilities: (amount) =>
      `Комуналка та інтернет −${amount.toLocaleString("uk-UA")} грн`,
    logTransport: (n) => `транспорт ${n}`,
    logSubs: (n) => `підписки ${n}`,
    logGym: (n) => `зал ${n}`,

    // Lang toggle
    langLabel: "EN",
  },

  en: {
    // Header
    serialNo: "№ 002 · simulator · 2026",
    titleLine1: "Via-",
    titleLine2: "bility",
    subtitle:
      "Set your profile, see the budget forecast, then let AI play 90 days of life.",

    // Sections
    sIncome: "Income",
    sHousing: "Housing",
    sTransport: "Transport",
    sLifestyle: "Lifestyle",
    sSocial: "Social",

    // Fields
    fSalary: "Salary (UAH, gross/mo)",
    fEmpType: "Employment type",
    fSavings: "Starting savings",
    fCity: "City",
    fHousingType: "Housing type",
    fTransport: "How you get around",
    fPets: "Pets",
    fSubs: "Subscriptions",
    fEating: "Cafés / restaurants",
    fGym: "Gym",
    fFamily: "Who you live with",
    fFriends: "Social activity",
    fBday: "Your birthday in this period?",
    fHoliday: "Major holiday (NY, Christmas, etc.)?",

    // Savings
    savingsHint: (amount) =>
      `Starting with ${amount.toLocaleString("en-US")} UAH in the bank`,
    savingsLabel: (amount, months) =>
      `savings ${amount.toLocaleString("en-US")} UAH (${months} mo salary)`,
    savingsZero: "no savings",
    savingsBareSub: "fresh start",

    // Summary section
    sSummaryTitle: "budget forecast",
    sumNetPerMo: "net/mo",
    sumFixPerMo: "fixed/mo",
    sumDayVarDay: "food+transport/day",
    sumDayVarMo: "≈ variable/mo",
    sumSurplusLabel: "buffer for unexpected expenses",

    surplusNeg:
      "Already negative — before any events. High risk of bankruptcy in month 1.",
    surplusLow: "Thin margin. Any surprise will wipe it out.",
    surplusMid: "Some buffer, but not large. Risks exist.",
    surplusOk: "Good buffer — peace of mind.",

    // Buttons
    startButton: "start simulation",
    resetButton: "try again",

    // Footer note
    footerNote:
      "90 days ≈ 45 seconds at 2× speed. AI generates events once at start based on your profile. No data is stored.",

    // Loading messages
    loadMsgs: [
      "AI is thinking through your life...",
      "Forecasting blackouts...",
      "Calling the landlord...",
      "Consulting with friends...",
    ],

    // Playing screen
    pDay: "day",
    pBalance: "balance",
    pLog: "log",
    pMood: "mood",
    pHealth: "health",
    pSocial: "social",
    pCity: "city",
    pEmp: "employment",
    pNet: "net/mo",
    pSavings: "savings",
    pFixed: "fixed/mo",
    pDaily: "variable/day",
    pZeroSavings: "0 (fresh start)",

    // Gameover
    goVerdict: "verdict",
    goSurvived: "Survived 90 days.",
    goBankrupt: "Bankrupt.",
    goSick: "Health hit zero.",
    goBurnout: "Burned out.",

    goSubSurvivedGood: "Even saved a bit.",
    goSubSurvivedMarginal: "Barely made it to the finish.",
    goSubSurvivedNeg: "But ended in the red.",
    goBankruptSub: (day) => `Debt from rent and food by day ${day}.`,
    goSickSub: (day) => `Hospital instead of work. Day ${day}.`,
    goBurnoutIsolation: (day) =>
      `Social isolation killed morale. Low contact → chronic stress → burnout on day ${day}.`,
    goBurnoutEvents: (day) =>
      `Accumulation of stressful events outweighed financial comfort. Day ${day}.`,

    goBalance: "balance",
    goMood: "mood",
    goHealth: "health",
    goSocial: "social",

    // Log labels
    logRent: (amount) => `Rent −${amount.toLocaleString("en-US")} UAH`,
    logFixedCosts: (amount, parts) =>
      `Fixed costs: ${parts.join(", ")} −${amount.toLocaleString("en-US")} UAH`,
    logPets: (amount) => `Pet food −${amount.toLocaleString("en-US")} UAH`,
    logSalary: (amount) => `Salary +${amount.toLocaleString("en-US")} UAH`,
    logUtilities: (amount) =>
      `Utilities & internet −${amount.toLocaleString("en-US")} UAH`,
    logTransport: (n) => `transport ${n}`,
    logSubs: (n) => `subscriptions ${n}`,
    logGym: (n) => `gym ${n}`,

    // Lang toggle
    langLabel: "УК",
  },
};

/**
 * Returns a translation accessor for the given language code.
 * @param {'uk' | 'en'} lang
 * @returns {(key: string, ...args: any[]) => string}
 */
function useTranslation(lang) {
  const dict = translations[lang] ?? translations.uk;
  return function t(key, ...args) {
    const val = dict[key];
    if (typeof val === "function") return val(...args);
    return val ?? key;
  };
}

module.exports = { translations, useTranslation };
