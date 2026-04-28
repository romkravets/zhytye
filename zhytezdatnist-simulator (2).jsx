import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Loader2 } from 'lucide-react';

// ============== STATIC DATA ==============
const CITIES = {
  kyiv:     { name: 'Київ',      rent: 18000, dailyFood: 250, utilities: 2400, vibe: 'столиця' },
  lviv:     { name: 'Львів',     rent: 14000, dailyFood: 220, utilities: 2000, vibe: 'захід'   },
  dnipro:   { name: 'Дніпро',    rent: 11000, dailyFood: 200, utilities: 1900, vibe: 'центр'   },
  ternopil: { name: 'Тернопіль', rent: 8000,  dailyFood: 180, utilities: 1700, vibe: 'тихе'    },
  village:  { name: 'Село',      rent: 3000,  dailyFood: 130, utilities: 1500, vibe: 'хутір'   },
};

const EMP_TYPES = {
  emp_official: { label: 'найманий, офіц.', sub: '−23%'        },
  emp_envelope: { label: 'у конверті',      sub: '0% податків' },
  fop1:         { label: 'ФОП 1 гр.',       sub: '−3 100/міс'  },
  fop2:         { label: 'ФОП 2 гр.',       sub: '−4 495/міс'  },
  fop3:         { label: 'ФОП 3 гр.',       sub: '−5%'         },
  diia_city:    { label: 'Дія.City',        sub: '−5%'         },
};

const HOUSING = {
  rent:    { label: 'оренда',    mul: 1, sub: 'повна вартість' },
  own:     { label: 'своє',      mul: 0, sub: 'без оренди'     },
  parents: { label: 'у батьків', mul: 0, sub: 'без оренди'     },
};

const TRANSPORT = {
  none:   { label: 'без',          monthly: 0,    daily: 0,   sub: 'пішки/велосипед' },
  public: { label: 'громадський',  monthly: 600,  daily: 0,   sub: 'проїзний'        },
  car:    { label: 'власне авто',  monthly: 2500, daily: 200, sub: 'паливо+ТО'       },
  mixed:  { label: 'мікс',         monthly: 600,  daily: 60,  sub: 'трохи всього'    },
  taxi:   { label: 'таксі',        monthly: 0,    daily: 130, sub: 'болт/уклон'      },
};

const PETS = {
  none: { label: 'нема',         monthly: 0    },
  cat:  { label: 'кіт',          monthly: 800  },
  dog:  { label: 'собака',       monthly: 1500 },
  both: { label: 'кіт + собака', monthly: 2200 },
};

const SUBS = {
  none:  { label: 'нема',   monthly: 0,    sub: ''                },
  light: { label: 'кілька', monthly: 350,  sub: 'нетфлікс+спотіф' },
  heavy: { label: 'усі',    monthly: 1200, sub: '+ChatGPT, iCloud' },
};

const EATING = {
  never:     { label: 'майже ніколи', daily: 0   },
  sometimes: { label: 'іноді',        daily: 50  },
  often:     { label: 'часто',        daily: 130 },
};

const FRIENDS = {
  low:    { label: 'мало',       socFactor: 0.6, eventCount: 1 },
  normal: { label: 'нормально', socFactor: 1.0, eventCount: 2 },
  high:   { label: 'часто',     socFactor: 1.5, eventCount: 3 },
};

const FAMILY = {
  single:  { label: 'сам',         mul: 1   },
  partner: { label: 'у парі',     mul: 1.6 },
  kid:     { label: 'з дитиною',  mul: 1.9 },
};

const SIM_DAYS = 90;

// ============== HELPERS ==============
function calcNet(gross, type) {
  switch (type) {
    case 'emp_official': return Math.round(gross * 0.77);
    case 'emp_envelope': return gross;
    case 'fop1':         return Math.max(0, gross - 3100);
    case 'fop2':         return Math.max(0, gross - 4495);
    case 'fop3':         return Math.round(gross * 0.95);
    case 'diia_city':    return Math.round(gross * 0.95);
    default:             return gross;
  }
}

const FALLBACK_EVENTS = [
  { day: 4,  title: 'Розбив екран телефону',          moneyChange: -800,  moodChange: -10, healthChange: 0,   socialChange: 0  },
  { day: 9,  title: 'Колеги кличуть на каву',          moneyChange: -250,  moodChange: 5,   healthChange: 0,   socialChange: 10 },
  { day: 14, title: 'Блекаут на дві доби',             moneyChange: -200,  moodChange: -8,  healthChange: -3,  socialChange: 0  },
  { day: 19, title: 'Знайшов 200 грн у куртці',        moneyChange: 200,   moodChange: 8,   healthChange: 0,   socialChange: 0  },
  { day: 26, title: 'Подарунок мамі на ДН',            moneyChange: -1200, moodChange: 7,   healthChange: 0,   socialChange: 8  },
  { day: 33, title: 'Застудився, ліки',                moneyChange: -600,  moodChange: -10, healthChange: -12, socialChange: -5 },
  { day: 41, title: 'Стрижка',                          moneyChange: -300,  moodChange: 5,   healthChange: 0,   socialChange: 3  },
  { day: 48, title: 'Тривога всю ніч, не виспався',    moneyChange: 0,     moodChange: -8,  healthChange: -5,  socialChange: 0  },
  { day: 56, title: 'Друг з фронту приїхав',           moneyChange: -400,  moodChange: 4,   healthChange: 0,   socialChange: 15 },
  { day: 64, title: 'Ремонт побутової техніки',        moneyChange: -1100, moodChange: -3,  healthChange: 0,   socialChange: 0  },
  { day: 72, title: 'Куртка розлізлась, нова',         moneyChange: -2500, moodChange: -5,  healthChange: 0,   socialChange: 0  },
  { day: 80, title: 'Премія за квартал',                moneyChange: 1500,  moodChange: 12,  healthChange: 0,   socialChange: 0  },
];

// ============== APP ==============
export default function App() {
  // phases
  const [phase, setPhase] = useState('setup');
  const [loadMsg, setLoadMsg] = useState('');

  // setup state
  const [salary, setSalary] = useState('25000');
  const [empType, setEmpType] = useState('emp_official');
  const [city, setCity] = useState('lviv');
  const [housing, setHousing] = useState('rent');
  const [transport, setTransport] = useState('public');
  const [pets, setPets] = useState('none');
  const [subs, setSubs] = useState('light');
  const [gym, setGym] = useState(false);
  const [eating, setEating] = useState('sometimes');
  const [family, setFamily] = useState('single');
  const [friends, setFriends] = useState('normal');
  const [bday, setBday] = useState(false);
  const [holiday, setHoliday] = useState(false);

  // sim state
  const [day, setDay] = useState(0);
  const [money, setMoney] = useState(0);
  const [mood, setMood] = useState(80);
  const [health, setHealth] = useState(80);
  const [social, setSocial] = useState(80);
  const [log, setLog] = useState([]);
  const [events, setEvents] = useState([]);
  const [speed, setSpeed] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const [verdict, setVerdict] = useState(null);

  const appliedDaysRef = useRef(new Set());
  const logRef = useRef(null);

  // derived
  const cityData = CITIES[city];
  const famMul = FAMILY[family].mul;
  const housingMul = HOUSING[housing].mul;
  const salaryNum = parseInt(salary) || 0;
  const netSalary = calcNet(salaryNum, empType);

  const monthlyFixed =
    Math.round(cityData.rent * famMul * housingMul) +
    cityData.utilities +
    TRANSPORT[transport].monthly +
    PETS[pets].monthly +
    SUBS[subs].monthly +
    (gym ? 800 : 0);

  const dailyVariable =
    Math.round(cityData.dailyFood * famMul) +
    TRANSPORT[transport].daily +
    EATING[eating].daily;

  const monthlyEstimate = monthlyFixed + dailyVariable * 30;
  const surplus = netSalary - monthlyEstimate;

  // ============== AI EVENTS ==============
  async function generateEvents() {
    const profileLines = [
      `місто: ${cityData.name} (${cityData.vibe})`,
      `зайнятість: ${EMP_TYPES[empType].label}`,
      `на руки: ~${netSalary.toLocaleString('uk-UA')} грн/міс`,
      `сімейний: ${FAMILY[family].label}`,
      `житло: ${HOUSING[housing].label}`,
      `транспорт: ${TRANSPORT[transport].label}`,
      `тварини: ${PETS[pets].label}`,
      `підписки: ${SUBS[subs].label}`,
      `зал: ${gym ? 'так' : 'ні'}`,
      `кафе: ${EATING[eating].label}`,
      `соц активність: ${FRIENDS[friends].label}`,
    ];
    const socEventCount = FRIENDS[friends].eventCount;

    const prompt = `Згенеруй рівно 10 коротких життєвих подій для українця у 2026 році. Реальні дрібниці з урахуванням війни і профілю:

${profileLines.join('\n')}

Дні від 3 до 87, всі різні і несортовані. Події ОБОВʼЯЗКОВО мають враховувати лайфстайл (якщо є авто — щось з ним; якщо кіт — ветеринар чи корм; якщо підписки — раптове списання; якщо ходить у зал — травма чи нова форма).

Поверни ТІЛЬКИ валідний JSON масив. Без тексту до чи після, без markdown:
[{"day":5,"title":"заголовок до 38 символів українською","moneyChange":-300,"moodChange":-5,"healthChange":0,"socialChange":3}]

Розподіл: 2 дрібниці лайфстайлу, ${socEventCount} соціальні події, 1 здоровʼя, 1 війна (блекаут/тривога/інтернет), 1 +гроші сюрприз, решта побутові несподіванки. Числа реалістичні для України (200–3000 грн).`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      let text = data.content?.[0]?.text || '';
      text = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length >= 5) return parsed;
    } catch (e) {
      console.warn('AI events failed, using fallback:', e);
    }
    return FALLBACK_EVENTS;
  }

  async function startSim() {
    setPhase('loading');
    const messages = [
      'ШІ продумує твоє життя...',
      'Прогнозує блекаути...',
      'Дзвонить орендодавцю...',
      'Радиться з друзями...',
    ];
    let i = 0;
    setLoadMsg(messages[0]);
    const msgInt = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadMsg(messages[i]);
    }, 800);

    let evs = await generateEvents();

    // Inject deterministic events for toggles
    if (bday) {
      evs = [...evs.filter(e => e.day !== 28), { day: 28, title: 'Мій день народження', moneyChange: -2500, moodChange: 15, healthChange: 0, socialChange: 25 }];
    }
    if (holiday) {
      evs = [...evs.filter(e => e.day !== 60), { day: 60, title: 'Велике свято в родині', moneyChange: -3000, moodChange: 12, healthChange: 0, socialChange: 20 }];
    }

    clearInterval(msgInt);
    setEvents(evs);
    setDay(0);
    setMoney(0);
    setMood(80);
    setHealth(80);
    setSocial(80);
    appliedDaysRef.current = new Set();
    setVerdict(null);
    setIsPaused(false);
    setLog([{
      day: 0,
      text: `${cityData.name}. На руки: ${netSalary.toLocaleString('uk-UA')} грн/міс. Поїхали.`,
      type: 'info'
    }]);
    setPhase('playing');
  }

  function reset() {
    setPhase('setup');
    setVerdict(null);
  }

  // ============== GAME LOOP ==============
  useEffect(() => {
    if (phase !== 'playing' || isPaused) return;
    const socFactor = FRIENDS[friends].socFactor;

    const id = setInterval(() => {
      setDay(prevDay => {
        const nextDay = prevDay + 1;
        if (nextDay > SIM_DAYS) return prevDay;

        const newLogs = [];
        let dM = 0;
        let dMood = -0.7;
        let dHealth = -0.4;
        let dSocial = -1.0 / socFactor; // friendlier people lose social slower

        // daily variable
        dM -= dailyVariable;

        const dInMonth = ((nextDay - 1) % 30) + 1;

        // monthly events spread out
        if (dInMonth === 1 && nextDay > 1) {
          const rent = Math.round(cityData.rent * famMul * housingMul);
          if (rent > 0) {
            dM -= rent;
            newLogs.push({ day: nextDay, text: `Оренда −${rent.toLocaleString('uk-UA')} грн`, type: 'expense' });
          }
        }
        if (dInMonth === 3) {
          const trM = TRANSPORT[transport].monthly;
          const subM = SUBS[subs].monthly;
          const gymM = gym ? 800 : 0;
          const fixedExtra = trM + subM + gymM;
          if (fixedExtra > 0) {
            dM -= fixedExtra;
            const parts = [];
            if (trM) parts.push(`транспорт ${trM}`);
            if (subM) parts.push(`підписки ${subM}`);
            if (gymM) parts.push(`зал ${gymM}`);
            newLogs.push({ day: nextDay, text: `Фіксовані: ${parts.join(', ')} −${fixedExtra.toLocaleString('uk-UA')} грн`, type: 'expense' });
          }
        }
        if (dInMonth === 7 && PETS[pets].monthly > 0) {
          dM -= PETS[pets].monthly;
          newLogs.push({ day: nextDay, text: `Корм для тварин −${PETS[pets].monthly.toLocaleString('uk-UA')} грн`, type: 'expense' });
        }
        if (dInMonth === 15) {
          dM += netSalary;
          newLogs.push({ day: nextDay, text: `Зарплата +${netSalary.toLocaleString('uk-UA')} грн`, type: 'income' });
        }
        if (dInMonth === 25) {
          dM -= cityData.utilities;
          newLogs.push({ day: nextDay, text: `Комуналка та інтернет −${cityData.utilities.toLocaleString('uk-UA')} грн`, type: 'expense' });
        }

        // AI event
        const evt = events.find(e => e.day === nextDay);
        if (evt && !appliedDaysRef.current.has(nextDay)) {
          appliedDaysRef.current.add(nextDay);
          dM += (evt.moneyChange || 0);
          dMood += (evt.moodChange || 0);
          dHealth += (evt.healthChange || 0);
          dSocial += (evt.socialChange || 0);
          let txt = evt.title;
          if (evt.moneyChange) {
            const sign = evt.moneyChange > 0 ? '+' : '−';
            txt += `  ${sign}${Math.abs(evt.moneyChange).toLocaleString('uk-UA')} грн`;
          }
          newLogs.push({
            day: nextDay,
            text: txt,
            type: evt.moneyChange > 0 ? 'income' : evt.moneyChange < 0 ? 'expense' : 'event'
          });
        }

        setMoney(m => m + dM);
        setMood(v => Math.max(0, Math.min(100, v + dMood)));
        setHealth(v => Math.max(0, Math.min(100, v + dHealth)));
        setSocial(v => Math.max(0, Math.min(100, v + dSocial)));
        if (newLogs.length) setLog(prev => [...prev.slice(-80), ...newLogs]);
        return nextDay;
      });
    }, 1000 / speed);

    return () => clearInterval(id);
  }, [phase, isPaused, speed, events, cityData, famMul, housingMul, netSalary, dailyVariable, transport, subs, gym, pets, friends]);

  // end conditions
  useEffect(() => {
    if (phase !== 'playing') return;
    if (day >= SIM_DAYS) {
      setVerdict({ status: 'survived', day, money, mood, health, social });
      setPhase('gameover');
    } else if (money < -8000) {
      setVerdict({ status: 'bankrupt', day, money, mood, health, social });
      setPhase('gameover');
    } else if (health <= 0) {
      setVerdict({ status: 'sick', day, money, mood, health, social });
      setPhase('gameover');
    } else if (mood <= 0) {
      setVerdict({ status: 'burnout', day, money, mood, health, social });
      setPhase('gameover');
    }
  }, [day, money, health, mood, social, phase]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const fonts = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&family=Manrope:wght@400;500;600;700&display=swap');
    .f-display { font-family: 'Instrument Serif', 'Times New Roman', serif; font-weight: 400; letter-spacing: -0.02em; }
    .f-body { font-family: 'Manrope', system-ui, sans-serif; }
    .f-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
    .grain::before {
      content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0.4; mix-blend-mode: multiply;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.08 0 0 0 0 0.05 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }
    @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .anim-pulse { animation: pulse-soft 2s ease-in-out infinite; }
  `;

  // ============== SETUP ==============
  if (phase === 'setup') {
    const canStart = salaryNum > 0;
    return (
      <>
        <style>{fonts}</style>
        <div className="grain relative min-h-screen w-full" style={{ background: '#F2EBE0', color: '#1a1a1a' }}>
          <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
            <div className="mb-2 f-mono text-xs uppercase tracking-widest opacity-60">№ 002 · симулятор · 2026</div>
            <h1 className="f-display text-7xl md:text-9xl leading-[0.9] mb-4">Житє-<br/><span className="italic">здатність</span></h1>
            <p className="f-body text-base md:text-lg max-w-md opacity-80 mb-2 leading-relaxed">
              Налаштуй профіль, побач прогноз бюджету, потім дай ШІ зіграти 90 днів життя.
            </p>

            <Section title="Дохід">
              <Field label="Зарплата (грн, брутто/міс)">
                <input
                  type="number"
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
                  className="f-mono text-3xl bg-transparent w-full border-b-2 outline-none pb-2"
                  style={{ borderColor: '#1a1a1a' }}
                  placeholder="25000"
                />
              </Field>
              <Field label="Тип зайнятості">
                <Toggle
                  options={Object.entries(EMP_TYPES).map(([k, v]) => ({ v: k, label: v.label, sub: v.sub }))}
                  value={empType} onChange={setEmpType}
                />
              </Field>
            </Section>

            <Section title="Житло">
              <Field label="Місто">
                <Toggle
                  options={Object.entries(CITIES).map(([k, v]) => ({ v: k, label: v.name, sub: v.vibe }))}
                  value={city} onChange={setCity}
                />
              </Field>
              <Field label="Тип житла">
                <Toggle
                  options={Object.entries(HOUSING).map(([k, v]) => ({ v: k, label: v.label, sub: v.sub }))}
                  value={housing} onChange={setHousing}
                />
              </Field>
            </Section>

            <Section title="Транспорт">
              <Field label="Як пересуваєшся">
                <Toggle
                  options={Object.entries(TRANSPORT).map(([k, v]) => ({ v: k, label: v.label, sub: v.sub }))}
                  value={transport} onChange={setTransport}
                />
              </Field>
            </Section>

            <Section title="Спосіб життя">
              <Field label="Тварини">
                <Toggle
                  options={Object.entries(PETS).map(([k, v]) => ({ v: k, label: v.label, sub: v.monthly ? `${v.monthly}/міс` : '' }))}
                  value={pets} onChange={setPets}
                />
              </Field>
              <Field label="Підписки">
                <Toggle
                  options={Object.entries(SUBS).map(([k, v]) => ({ v: k, label: v.label, sub: v.monthly ? `${v.monthly}/міс` : 'безкоштовно' }))}
                  value={subs} onChange={setSubs}
                />
              </Field>
              <Field label="Кафе/ресторани">
                <Toggle
                  options={Object.entries(EATING).map(([k, v]) => ({ v: k, label: v.label, sub: v.daily ? `≈${v.daily * 30}/міс` : '−' }))}
                  value={eating} onChange={setEating}
                />
              </Field>
              <Field label="Спортзал">
                <Toggle
                  options={[
                    { v: false, label: 'ні',  sub: '−'         },
                    { v: true,  label: 'так', sub: '800/міс'   },
                  ]}
                  value={gym} onChange={setGym}
                />
              </Field>
            </Section>

            <Section title="Соціальне">
              <Field label="З ким живеш">
                <Toggle
                  options={Object.entries(FAMILY).map(([k, v]) => ({ v: k, label: v.label, sub: `×${v.mul}` }))}
                  value={family} onChange={setFamily}
                />
              </Field>
              <Field label="Активність зі знайомими">
                <Toggle
                  options={Object.entries(FRIENDS).map(([k, v]) => ({ v: k, label: v.label, sub: `${v.eventCount} подій` }))}
                  value={friends} onChange={setFriends}
                />
              </Field>
              <Field label="Свій ДН у цей період?">
                <Toggle
                  options={[{ v: false, label: 'ні' }, { v: true, label: 'так', sub: '−2 500' }]}
                  value={bday} onChange={setBday}
                />
              </Field>
              <Field label="Велике свято (НР, Різдво, ін.)?">
                <Toggle
                  options={[{ v: false, label: 'ні' }, { v: true, label: 'так', sub: '−3 000' }]}
                  value={holiday} onChange={setHoliday}
                />
              </Field>
            </Section>

            <Summary
              netSalary={netSalary}
              monthlyFixed={monthlyFixed}
              dailyVariable={dailyVariable}
              surplus={surplus}
            />

            <button
              onClick={startSim}
              disabled={!canStart}
              className="mt-12 group inline-flex items-center gap-3 f-display text-3xl md:text-4xl italic underline underline-offset-8 decoration-2 hover:decoration-4 transition-all disabled:opacity-30"
              style={{ textDecorationColor: '#C44536' }}
            >
              почати симуляцію
              <span className="not-italic transition-transform group-hover:translate-x-2">→</span>
            </button>

            <div className="mt-16 mb-8 f-mono text-xs opacity-50 max-w-md leading-relaxed">
              90 днів = ~45 секунд при швидкості ×2. ШІ генерує події один раз на старті з урахуванням профілю. Дані не зберігаються.
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============== LOADING ==============
  if (phase === 'loading') {
    return (
      <>
        <style>{fonts}</style>
        <div className="grain relative min-h-screen w-full flex items-center justify-center" style={{ background: '#F2EBE0', color: '#1a1a1a' }}>
          <div className="text-center px-6">
            <Loader2 className="w-10 h-10 mx-auto mb-6 animate-spin" style={{ color: '#C44536' }} />
            <div className="f-display text-3xl md:text-5xl italic anim-pulse">{loadMsg}</div>
          </div>
        </div>
      </>
    );
  }

  // ============== PLAYING ==============
  if (phase === 'playing') {
    const moneyColor = money < 0 ? '#C44536' : '#1a1a1a';
    return (
      <>
        <style>{fonts}</style>
        <div className="grain relative min-h-screen w-full" style={{ background: '#F2EBE0', color: '#1a1a1a' }}>
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
            <div className="flex items-center justify-between mb-8 pb-4 border-b" style={{ borderColor: '#1a1a1a33' }}>
              <div>
                <div className="f-mono text-xs uppercase tracking-widest opacity-60">день</div>
                <div className="f-display text-5xl md:text-6xl leading-none">
                  {String(day).padStart(2, '0')}
                  <span className="opacity-30 text-3xl md:text-4xl">/{SIM_DAYS}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SpeedBtn label="½×" active={speed === 0.5} onClick={() => setSpeed(0.5)} />
                <SpeedBtn label="1×" active={speed === 1} onClick={() => setSpeed(1)} />
                <SpeedBtn label="2×" active={speed === 2} onClick={() => setSpeed(2)} />
                <SpeedBtn label="4×" active={speed === 4} onClick={() => setSpeed(4)} />
                <button
                  onClick={() => setIsPaused(p => !p)}
                  className="ml-2 p-2 border-2 hover:bg-black hover:text-[#F2EBE0] transition-colors"
                  style={{ borderColor: '#1a1a1a' }}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="md:col-span-2 space-y-8">
                <div>
                  <div className="f-mono text-xs uppercase tracking-widest opacity-60 mb-1">баланс</div>
                  <div className="f-display text-6xl md:text-7xl leading-none transition-colors" style={{ color: moneyColor }}>
                    {money < 0 ? '−' : ''}{Math.abs(money).toLocaleString('uk-UA')}
                    <span className="text-2xl md:text-3xl opacity-50 ml-2">грн</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Bar label="настрій"   value={mood}   color="#C44536" />
                  <Bar label="здоровʼя" value={health} color="#2E5266" />
                  <Bar label="соц"       value={social} color="#7B6D47" />
                </div>

                <div className="pt-4 border-t f-mono text-xs space-y-1 opacity-70" style={{ borderColor: '#1a1a1a33' }}>
                  <Row k="місто"        v={cityData.name} />
                  <Row k="зайнятість"  v={EMP_TYPES[empType].label} />
                  <Row k="на руки/міс" v={`${netSalary.toLocaleString('uk-UA')} грн`} />
                  <Row k="фікс/міс"    v={`${monthlyFixed.toLocaleString('uk-UA')} грн`} />
                  <Row k="змін/день"   v={`${dailyVariable.toLocaleString('uk-UA')} грн`} />
                </div>
              </div>

              <div className="md:col-span-3">
                <div className="f-mono text-xs uppercase tracking-widest opacity-60 mb-3">хроніка</div>
                <div
                  ref={logRef}
                  className="h-[420px] md:h-[520px] overflow-y-auto pr-2 space-y-1"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {log.map((entry, i) => <LogEntry key={i} entry={entry} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============== GAMEOVER ==============
  if (phase === 'gameover' && verdict) {
    const titles = {
      survived: 'Прожив 90 днів.',
      bankrupt: 'Збанкрутував.',
      sick:     'Здоровʼя на нулі.',
      burnout:  'Вигорів.',
    };
    const subs = {
      survived: money > 5000 ? 'Ще й накопичив трошки.' : money > 0 ? 'Ледь дотягнув до фінішу.' : 'Але мінусом до карти.',
      bankrupt: `Заборг по оренді й продуктах на ${verdict.day} день.`,
      sick:     `Лікарня замість роботи. День ${verdict.day}.`,
      burnout:  `Не витягнув емоційно. День ${verdict.day}.`,
    };

    return (
      <>
        <style>{fonts}</style>
        <div className="grain relative min-h-screen w-full flex items-center justify-center" style={{ background: '#F2EBE0', color: '#1a1a1a' }}>
          <div className="max-w-2xl mx-auto px-6 py-12 text-center">
            <div className="f-mono text-xs uppercase tracking-widest opacity-60 mb-4">вердикт</div>
            <h2 className="f-display text-6xl md:text-8xl leading-[0.9] mb-4">
              <span className="italic">{titles[verdict.status]}</span>
            </h2>
            <p className="f-body text-lg opacity-80 mb-12">{subs[verdict.status]}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 text-left">
              <Stat label="баланс"   v={`${verdict.money < 0 ? '−' : ''}${Math.abs(verdict.money).toLocaleString('uk-UA')}`} unit="грн" warn={verdict.money < 0} />
              <Stat label="настрій"  v={Math.round(verdict.mood)}   unit="/100" />
              <Stat label="здоровʼя" v={Math.round(verdict.health)} unit="/100" />
              <Stat label="соц"      v={Math.round(verdict.social)} unit="/100" />
            </div>

            <button
              onClick={reset}
              className="group inline-flex items-center gap-3 f-display text-3xl italic underline underline-offset-8 decoration-2 hover:decoration-4 transition-all"
              style={{ textDecorationColor: '#C44536' }}
            >
              <RotateCcw className="w-6 h-6 not-italic" />
              ще раз
            </button>
          </div>
        </div>
      </>
    );
  }

  return null;
}

// ============== SUB-COMPONENTS ==============
function Section({ title, children }) {
  return (
    <div className="mt-12 pt-8 border-t-2" style={{ borderColor: '#1a1a1a' }}>
      <div className="f-mono text-xs uppercase tracking-widest opacity-60 mb-6">— {title} —</div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="f-mono text-xs uppercase tracking-widest opacity-60 mb-2">{label}</div>
      {children}
    </div>
  );
}

function Toggle({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o, i) => {
        const active = value === o.v;
        return (
          <button
            key={String(o.v) + i}
            onClick={() => onChange(o.v)}
            className="px-3 py-2 border-2 transition-all text-left"
            style={{
              borderColor: '#1a1a1a',
              background: active ? '#1a1a1a' : 'transparent',
              color: active ? '#F2EBE0' : '#1a1a1a',
            }}
          >
            <div className="f-body font-semibold text-sm">{o.label}</div>
            {o.sub && <div className="f-mono text-[10px] opacity-70 mt-0.5">{o.sub}</div>}
          </button>
        );
      })}
    </div>
  );
}

function Summary({ netSalary, monthlyFixed, dailyVariable, surplus }) {
  const negative = surplus < 0;
  const verdict =
    negative ? 'Уже мінус — без подій. Ризикуєш збанкрутувати на 1-му ж місяці.' :
    surplus < 3000 ? 'Тонкий запас. Будь-яка несподіванка зʼїсть його.' :
    surplus < 8000 ? 'Маржа є, але не велика. Ризики є.' :
    'Хороший запас — спокій.';

  return (
    <div className="mt-12 pt-8 border-t-2" style={{ borderColor: '#1a1a1a' }}>
      <div className="f-mono text-xs uppercase tracking-widest opacity-60 mb-6">— попередній розрахунок —</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SumCell label="на руки/міс"   value={`+${netSalary.toLocaleString('uk-UA')}`} />
        <SumCell label="фікс/міс"      value={`−${monthlyFixed.toLocaleString('uk-UA')}`} />
        <SumCell label="їжа+транспорт/день" value={`−${dailyVariable.toLocaleString('uk-UA')}`} />
        <SumCell label="≈ змінні/міс" value={`−${(dailyVariable * 30).toLocaleString('uk-UA')}`} />
      </div>
      <div className="pt-4 border-t border-dashed" style={{ borderColor: '#1a1a1a44' }}>
        <div className="f-mono text-xs uppercase tracking-widest opacity-60 mb-2">залишок на запас і непередбачуване</div>
        <div className="f-display text-5xl md:text-6xl leading-none" style={{ color: negative ? '#C44536' : '#1a1a1a' }}>
          {negative ? '−' : '+'}{Math.abs(surplus).toLocaleString('uk-UA')}
          <span className="text-lg opacity-50 ml-2">грн/міс</span>
        </div>
        <div className="f-body text-sm opacity-80 mt-3">{verdict}</div>
      </div>
    </div>
  );
}

function SumCell({ label, value }) {
  return (
    <div>
      <div className="f-mono text-[10px] uppercase tracking-widest opacity-60 mb-1">{label}</div>
      <div className="f-mono text-lg">{value} <span className="text-xs opacity-50">грн</span></div>
    </div>
  );
}

function SpeedBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="f-mono text-xs px-2 py-1 border-2 transition-colors"
      style={{
        borderColor: '#1a1a1a',
        background: active ? '#1a1a1a' : 'transparent',
        color: active ? '#F2EBE0' : '#1a1a1a',
      }}
    >{label}</button>
  );
}

function Bar({ label, value, color }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="f-mono text-xs uppercase tracking-widest opacity-70">{label}</span>
        <span className="f-mono text-xs">{Math.round(v)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden" style={{ background: '#1a1a1a1a' }}>
        <div className="h-full transition-all duration-500" style={{ width: `${v}%`, background: color }} />
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="opacity-70">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}

function LogEntry({ entry }) {
  const colors = {
    income:  '#2E5266',
    expense: '#C44536',
    event:   '#1a1a1a',
    info:    '#1a1a1a',
  };
  return (
    <div className="flex items-baseline gap-3 py-1.5 border-b border-dashed" style={{ borderColor: '#1a1a1a1a' }}>
      <span className="f-mono text-xs opacity-50 w-10 shrink-0 text-right">{String(entry.day).padStart(2, '0')}</span>
      <span className="f-body text-sm md:text-base flex-1" style={{ color: colors[entry.type] }}>
        {entry.text}
      </span>
    </div>
  );
}

function Stat({ label, v, unit, warn }) {
  return (
    <div className="border-2 p-3" style={{ borderColor: '#1a1a1a' }}>
      <div className="f-mono text-[10px] uppercase tracking-widest opacity-60 mb-1">{label}</div>
      <div className="f-display text-3xl leading-none" style={{ color: warn ? '#C44536' : '#1a1a1a' }}>
        {v}<span className="text-base opacity-40 ml-1">{unit}</span>
      </div>
    </div>
  );
}
