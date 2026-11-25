"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const pad = (n: number, l = 2) => String(n).padStart(l, "0");

const TABS = [
  { id: "time", label: "เวลา" },
  { id: "football", label: "ผลบอล" },
  { id: "stopwatch", label: "จับเวลา" },
  { id: "alarm", label: "นาฬิกาปลุก" },
  { id: "calendar", label: "ปฏิทิน" },
  { id: "weather", label: "อากาศ" },
  { id: "stock", label: "กราฟหุ้น" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function useNow(interval = 1000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {}
    loaded.current = true;
  }, [key]);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

const card = "rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-sky-100";
const btn =
  "rounded-xl px-4 py-2 text-sm font-medium transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500";
const btnPrimary = `${btn} bg-sky-500 text-white hover:bg-sky-600`;
const btnGhost = `${btn} bg-sky-50 text-sky-700 hover:bg-sky-100`;

/* ------------------------------------------------------------------ */
/*  1. Time                                                            */
/* ------------------------------------------------------------------ */

const ZONES = [
  { name: "กรุงเทพ", tz: "Asia/Bangkok" },
  { name: "โตเกียว", tz: "Asia/Tokyo" },
  { name: "ลอนดอน", tz: "Europe/London" },
  { name: "นิวยอร์ก", tz: "America/New_York" },
];

function AnalogClock({ now }: { now: Date }) {
  const s = now.getSeconds();
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;
  const hand = (deg: number, len: number, w: number, color: string) => (
    <line
      x1="100"
      y1="100"
      x2={100 + len * Math.sin((deg * Math.PI) / 180)}
      y2={100 - len * Math.cos((deg * Math.PI) / 180)}
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
    />
  );
  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-56 w-56" role="img" aria-label="นาฬิกาเข็ม">
      <circle cx="100" cy="100" r="96" fill="#fff" stroke="#bae6fd" strokeWidth="4" />
      {Array.from({ length: 60 }).map((_, i) => {
        const a = (i * 6 * Math.PI) / 180;
        const major = i % 5 === 0;
        const r1 = major ? 82 : 88;
        return (
          <line
            key={i}
            x1={100 + r1 * Math.sin(a)}
            y1={100 - r1 * Math.cos(a)}
            x2={100 + 92 * Math.sin(a)}
            y2={100 - 92 * Math.cos(a)}
            stroke={major ? "#0369a1" : "#bae6fd"}
            strokeWidth={major ? 2.5 : 1}
          />
        );
      })}
      {hand(h * 30, 50, 5, "#0c4a6e")}
      {hand(m * 6, 72, 3.5, "#0369a1")}
      {hand(s * 6, 80, 1.5, "#f43f5e")}
      <circle cx="100" cy="100" r="5" fill="#f43f5e" />
    </svg>
  );
}

function TimeTab() {
  const now = useNow();
  if (!now) return null;
  return (
    <div className="space-y-4">
      <div className={`${card} text-center`}>
        <AnalogClock now={now} />
        <div className="mt-4 font-mono text-6xl font-semibold tabular-nums text-sky-900">
          {pad(now.getHours())}:{pad(now.getMinutes())}
          <span className="text-3xl text-sky-400">:{pad(now.getSeconds())}</span>
        </div>
        <p className="mt-2 text-sky-700">
          {now.toLocaleDateString("th-TH", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ZONES.map((z) => (
          <div key={z.tz} className={card}>
            <div className="text-sm text-sky-600">{z.name}</div>
            <div className="font-mono text-2xl tabular-nums text-sky-900">
              {now.toLocaleTimeString("th-TH", {
                timeZone: z.tz,
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Football                                                        */
/* ------------------------------------------------------------------ */

type Match = {
  id: string;
  date: string;
  home: string;
  away: string;
  hs: number | null;
  as: number | null;
};

const LEAGUES = [
  { id: "4328", name: "พรีเมียร์ลีก" },
  { id: "4335", name: "ลาลิกา" },
  { id: "4331", name: "บุนเดสลีกา" },
  { id: "4332", name: "เซเรียอา" },
];

const MOCK_MATCHES: Match[] = [
  { id: "1", date: "-", home: "ทีมเหย้า A", away: "ทีมเยือน B", hs: 2, as: 1 },
  { id: "2", date: "-", home: "ทีมเหย้า C", away: "ทีมเยือน D", hs: 0, as: 0 },
  { id: "3", date: "-", home: "ทีมเหย้า E", away: "ทีมเยือน F", hs: 3, as: 2 },
];

function FootballTab() {
  const [league, setLeague] = useState(LEAGUES[0].id);
  const [matches, setMatches] = useState<Match[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  const load = useCallback(async () => {
    setState("loading");
    try {
      // TheSportsDB: ฟรี ใช้ key "3" สำหรับทดสอบ (ถ้าใช้จริงควรสมัคร key ของตัวเอง)
      const res = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=${league}`
      );
      const json = await res.json();
      const list: Match[] = (json.events ?? []).map((e: any) => ({
        id: e.idEvent,
        date: e.dateEvent,
        home: e.strHomeTeam,
        away: e.strAwayTeam,
        hs: e.intHomeScore === null ? null : Number(e.intHomeScore),
        as: e.intAwayScore === null ? null : Number(e.intAwayScore),
      }));
      if (!list.length) throw new Error("empty");
      setMatches(list.reverse());
      setState("ok");
    } catch {
      setMatches(MOCK_MATCHES);
      setState("error");
    }
  }, [league]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {LEAGUES.map((l) => (
          <button
            key={l.id}
            onClick={() => setLeague(l.id)}
            className={league === l.id ? btnPrimary : btnGhost}
          >
            {l.name}
          </button>
        ))}
      </div>

      {state === "error" && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          โหลดผลบอลไม่สำเร็จ กำลังแสดงข้อมูลตัวอย่าง{" "}
          <button className="underline" onClick={load}>
            ลองอีกครั้ง
          </button>
        </p>
      )}
      {state === "loading" && <p className="text-sky-600">กำลังโหลดผลบอล…</p>}

      <ul className="space-y-2">
        {matches.map((m) => (
          <li key={m.id} className={`${card} flex items-center gap-3 !p-4`}>
            <span className="w-24 shrink-0 text-xs text-sky-500">{m.date}</span>
            <span className="flex-1 text-right text-sky-900">{m.home}</span>
            <span className="rounded-lg bg-sky-100 px-3 py-1 font-mono font-semibold tabular-nums text-sky-900">
              {m.hs ?? "-"} : {m.as ?? "-"}
            </span>
            <span className="flex-1 text-sky-900">{m.away}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Stopwatch                                                       */
/* ------------------------------------------------------------------ */

function fmtMs(ms: number) {
  const cs = Math.floor(ms / 10) % 100;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000);
  return `${h > 0 ? pad(h) + ":" : ""}${pad(m)}:${pad(s)}.${pad(cs)}`;
}

function StopwatchTab() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef(0);
  const baseRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    let raf = 0;
    const tick = () => {
      setElapsed(baseRef.current + performance.now() - startRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      baseRef.current += performance.now() - startRef.current;
    };
  }, [running]);

  const reset = () => {
    setRunning(false);
    baseRef.current = 0;
    setElapsed(0);
    setLaps([]);
  };

  return (
    <div className="space-y-4">
      <div className={`${card} text-center`}>
        <div className="font-mono text-6xl font-semibold tabular-nums text-sky-900">
          {fmtMs(elapsed)}
        </div>
        <div className="mt-5 flex justify-center gap-3">
          <button onClick={() => setRunning((r) => !r)} className={btnPrimary}>
            {running ? "หยุด" : elapsed > 0 ? "เริ่มต่อ" : "เริ่ม"}
          </button>
          <button
            onClick={() => setLaps((l) => [elapsed, ...l])}
            disabled={!running}
            className={`${btnGhost} disabled:opacity-40`}
          >
            บันทึกรอบ
          </button>
          <button onClick={reset} className={btnGhost}>
            รีเซ็ต
          </button>
        </div>
      </div>
      {laps.length > 0 && (
        <ul className={`${card} divide-y divide-sky-100`}>
          {laps.map((t, i) => {
            const prev = laps[i + 1] ?? 0;
            return (
              <li key={laps.length - i} className="flex justify-between py-2 font-mono tabular-nums">
                <span className="text-sky-500">รอบ {laps.length - i}</span>
                <span className="text-sky-700">+{fmtMs(t - prev)}</span>
                <span className="text-sky-900">{fmtMs(t)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  4. Alarm                                                           */
/* ------------------------------------------------------------------ */

type Alarm = { id: number; time: string; label: string; on: boolean };

function beep() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.35, 0.7, 1.05].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.2, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.3);
    });
  } catch {}
}

function AlarmTab() {
  const now = useNow();
  const [alarms, setAlarms] = useLocalStorage<Alarm[]>("clock-alarms", []);
  const [time, setTime] = useState("07:00");
  const [label, setLabel] = useState("");
  const [ringing, setRinging] = useState<Alarm | null>(null);
  const lastFired = useRef("");

  useEffect(() => {
    if (!now) return;
    const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (now.getSeconds() > 1) return;
    const key = `${now.toDateString()} ${hhmm}`;
    if (lastFired.current === key) return;
    const hit = alarms.find((a) => a.on && a.time === hhmm);
    if (hit) {
      lastFired.current = key;
      setRinging(hit);
      beep();
    }
  }, [now, alarms]);

  const add = () =>
    setAlarms((a) =>
      [...a, { id: Date.now(), time, label: label.trim(), on: true }].sort((x, y) =>
        x.time.localeCompare(y.time)
      )
    );

  return (
    <div className="space-y-4">
      {ringing && (
        <div className="flex items-center justify-between rounded-2xl bg-rose-500 p-4 text-white shadow-lg">
          <div>
            <div className="text-2xl font-semibold">{ringing.time}</div>
            <div>{ringing.label || "ถึงเวลาแล้ว"}</div>
          </div>
          <button
            onClick={() => setRinging(null)}
            className={`${btn} bg-white text-rose-600 hover:bg-rose-50`}
          >
            ปิดเสียง
          </button>
        </div>
      )}

      <div className={`${card} flex flex-wrap items-end gap-3`}>
        <label className="text-sm text-sky-700">
          เวลา
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 block rounded-xl border border-sky-200 bg-white px-3 py-2 text-sky-900"
          />
        </label>
        <label className="min-w-40 flex-1 text-sm text-sky-700">
          ชื่อ
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="เช่น ตื่นนอน"
            className="mt-1 block w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-sky-900"
          />
        </label>
        <button onClick={add} className={btnPrimary}>
          เพิ่มนาฬิกาปลุก
        </button>
      </div>

      {alarms.length === 0 ? (
        <p className="text-center text-sky-600">ยังไม่มีนาฬิกาปลุก ตั้งเวลาด้านบนแล้วกดเพิ่ม</p>
      ) : (
        <ul className="space-y-2">
          {alarms.map((a) => (
            <li key={a.id} className={`${card} flex items-center justify-between !p-4`}>
              <div>
                <div className="font-mono text-3xl tabular-nums text-sky-900">{a.time}</div>
                <div className="text-sm text-sky-600">{a.label || "นาฬิกาปลุก"}</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  role="switch"
                  aria-checked={a.on}
                  aria-label={`เปิดปิดนาฬิกาปลุก ${a.time}`}
                  onClick={() =>
                    setAlarms((l) => l.map((x) => (x.id === a.id ? { ...x, on: !x.on } : x)))
                  }
                  className={`relative h-7 w-12 rounded-full transition ${
                    a.on ? "bg-sky-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                      a.on ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
                <button
                  onClick={() => setAlarms((l) => l.filter((x) => x.id !== a.id))}
                  className="text-sm text-rose-500 hover:underline"
                >
                  ลบ
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-sky-500">
        นาฬิกาปลุกทำงานเมื่อเปิดหน้านี้ค้างไว้ในเบราว์เซอร์เท่านั้น
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  5. Calendar                                                        */
/* ------------------------------------------------------------------ */

const TH_DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

function CalendarTab() {
  const today = useNow(60000);
  const [cursor, setCursor] = useState<{ y: number; m: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useLocalStorage<Record<string, string>>("clock-notes", {});

  useEffect(() => {
    if (today && !cursor) setCursor({ y: today.getFullYear(), m: today.getMonth() });
  }, [today, cursor]);

  if (!cursor || !today) return null;

  const first = new Date(cursor.y, cursor.m, 1);
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(first.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const key = (d: number) => `${cursor.y}-${pad(cursor.m + 1)}-${pad(d)}`;
  const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const move = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    setSelected(null);
  };

  return (
    <div className="space-y-4">
      <div className={card}>
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => move(-1)} className={btnGhost} aria-label="เดือนก่อนหน้า">
            ‹
          </button>
          <h2 className="text-lg font-semibold text-sky-900">
            {first.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}
          </h2>
          <button onClick={() => move(1)} className={btnGhost} aria-label="เดือนถัดไป">
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {TH_DAYS.map((d, i) => (
            <div key={d} className={`py-1 font-medium ${i === 0 ? "text-rose-400" : "text-sky-500"}`}>
              {d}
            </div>
          ))}
          {cells.map((d, i) =>
            d === null ? (
              <div key={i} />
            ) : (
              <button
                key={i}
                onClick={() => setSelected(key(d))}
                className={`relative aspect-square rounded-xl text-sky-900 transition hover:bg-sky-100 ${
                  key(d) === todayKey ? "bg-sky-500 !text-white hover:bg-sky-600" : ""
                } ${selected === key(d) ? "ring-2 ring-sky-500" : ""}`}
              >
                {d}
                {notes[key(d)] && (
                  <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-rose-400" />
                )}
              </button>
            )
          )}
        </div>
      </div>

      {selected && (
        <div className={card}>
          <label className="text-sm text-sky-700">
            บันทึกของวันที่ {selected}
            <textarea
              value={notes[selected] ?? ""}
              onChange={(e) => setNotes((n) => ({ ...n, [selected]: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-xl border border-sky-200 bg-white p-3 text-sky-900"
              placeholder="เช่น นัดหมาย งานที่ต้องทำ"
            />
          </label>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  6. Weather                                                         */
/* ------------------------------------------------------------------ */

const WMO: Record<number, [string, string]> = {
  0: ["ท้องฟ้าแจ่มใส", "☀️"],
  1: ["แจ่มใสเป็นส่วนใหญ่", "🌤️"],
  2: ["มีเมฆบางส่วน", "⛅"],
  3: ["มีเมฆมาก", "☁️"],
  45: ["หมอก", "🌫️"],
  48: ["หมอกน้ำค้างแข็ง", "🌫️"],
  51: ["ฝนปรอย", "🌦️"],
  53: ["ฝนปรอย", "🌦️"],
  55: ["ฝนปรอยหนา", "🌦️"],
  61: ["ฝนเล็กน้อย", "🌧️"],
  63: ["ฝนปานกลาง", "🌧️"],
  65: ["ฝนหนัก", "🌧️"],
  80: ["ฝนซู่", "🌦️"],
  81: ["ฝนซู่ปานกลาง", "🌧️"],
  82: ["ฝนซู่หนัก", "⛈️"],
  95: ["พายุฟ้าคะนอง", "⛈️"],
  96: ["พายุฟ้าคะนองและลูกเห็บ", "⛈️"],
  99: ["พายุฟ้าคะนองและลูกเห็บ", "⛈️"],
};
const wmo = (c: number) => WMO[c] ?? ["ไม่ทราบสภาพอากาศ", "🌡️"];

type WeatherData = {
  current: { temperature_2m: number; relative_humidity_2m: number; wind_speed_10m: number; weather_code: number };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] };
};

const FALLBACK_COORDS = { lat: 13.7563, lon: 100.5018, name: "กรุงเทพฯ" };

function WeatherTab() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [place, setPlace] = useState(FALLBACK_COORDS.name);
  const [error, setError] = useState(false);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      setData(await res.json());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  const locate = useCallback(() => {
    setData(null);
    if (!navigator.geolocation) {
      fetchWeather(FALLBACK_COORDS.lat, FALLBACK_COORDS.lon);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPlace("ตำแหน่งของคุณ");
        fetchWeather(p.coords.latitude, p.coords.longitude);
      },
      () => {
        setPlace(FALLBACK_COORDS.name);
        fetchWeather(FALLBACK_COORDS.lat, FALLBACK_COORDS.lon);
      },
      { timeout: 8000 }
    );
  }, [fetchWeather]);

  useEffect(() => {
    locate();
  }, [locate]);

  if (error)
    return (
      <p className="rounded-xl bg-amber-50 p-3 text-amber-800">
        โหลดข้อมูลอากาศไม่สำเร็จ{" "}
        <button className="underline" onClick={locate}>
          ลองอีกครั้ง
        </button>
      </p>
    );
  if (!data) return <p className="text-sky-600">กำลังโหลดสภาพอากาศ…</p>;

  const [desc, icon] = wmo(data.current.weather_code);
  return (
    <div className="space-y-4">
      <div className={`${card} text-center`}>
        <div className="text-sm text-sky-600">{place}</div>
        <div className="text-7xl">{icon}</div>
        <div className="font-mono text-6xl font-semibold tabular-nums text-sky-900">
          {Math.round(data.current.temperature_2m)}°
        </div>
        <div className="text-sky-700">{desc}</div>
        <div className="mt-3 flex justify-center gap-6 text-sm text-sky-600">
          <span>ความชื้น {data.current.relative_humidity_2m}%</span>
          <span>ลม {Math.round(data.current.wind_speed_10m)} กม./ชม.</span>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {data.daily.time.slice(0, 7).map((d, i) => (
          <li key={d} className={`${card} text-center !p-3`}>
            <div className="text-xs text-sky-500">
              {new Date(d).toLocaleDateString("th-TH", { weekday: "short", day: "numeric" })}
            </div>
            <div className="text-2xl">{wmo(data.daily.weather_code[i])[1]}</div>
            <div className="text-sm tabular-nums text-sky-900">
              {Math.round(data.daily.temperature_2m_max[i])}° / {Math.round(data.daily.temperature_2m_min[i])}°
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  7. Stock chart                                                     */
/* ------------------------------------------------------------------ */

/*
 * ข้อมูลหุ้นด้านล่างเป็นข้อมูลจำลอง (random walk แบบคงที่ตาม symbol)
 * ถ้าต้องการข้อมูลจริง ให้สร้าง Route Handler (app/api/stock/route.ts)
 * ดึงจาก Alpha Vantage / Finnhub / Yahoo Finance แล้วเปลี่ยน series() ให้เรียก API นั้น
 */

const SYMBOLS = [
  { sym: "PTT", name: "ปตท.", base: 34 },
  { sym: "AOT", name: "ท่าอากาศยานไทย", base: 60 },
  { sym: "CPALL", name: "ซีพี ออลล์", base: 58 },
  { sym: "KBANK", name: "ธนาคารกสิกรไทย", base: 150 },
];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function series(sym: string, base: number, days: number) {
  const rnd = seeded([...sym].reduce((a, c) => a * 31 + c.charCodeAt(0), 7));
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < days; i++) {
    v = Math.max(1, v * (1 + (rnd() - 0.48) * 0.04));
    out.push(Number(v.toFixed(2)));
  }
  return out;
}

function StockTab() {
  const [idx, setIdx] = useState(0);
  const [range, setRange] = useState(30);
  const [hover, setHover] = useState<number | null>(null);
  const s = SYMBOLS[idx];
  const data = useMemo(() => series(s.sym, s.base, range), [s, range]);

  const W = 600,
    H = 260,
    P = 28;
  const min = Math.min(...data),
    max = Math.max(...data);
  const x = (i: number) => P + (i / (data.length - 1)) * (W - P * 2);
  const y = (v: number) => H - P - ((v - min) / (max - min || 1)) * (H - P * 2);
  const path = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${path} L${x(data.length - 1)},${H - P} L${x(0)},${H - P} Z`;
  const last = data[data.length - 1];
  const change = last - data[0];
  const up = change >= 0;
  const shown = hover ?? data.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SYMBOLS.map((x2, i) => (
          <button key={x2.sym} onClick={() => setIdx(i)} className={idx === i ? btnPrimary : btnGhost}>
            {x2.sym}
          </button>
        ))}
      </div>
      <div className={card}>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm text-sky-600">{s.name}</div>
            <div className="font-mono text-4xl font-semibold tabular-nums text-sky-900">
              {data[shown].toFixed(2)}
            </div>
          </div>
          <div className={`font-mono text-lg tabular-nums ${up ? "text-emerald-600" : "text-rose-600"}`}>
            {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)} ({((change / data[0]) * 100).toFixed(2)}%)
          </div>
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mt-3 w-full"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const px = ((e.clientX - r.left) / r.width) * W;
            setHover(Math.max(0, Math.min(data.length - 1, Math.round(((px - P) / (W - P * 2)) * (data.length - 1)))));
          }}
          role="img"
          aria-label={`กราฟราคาหุ้น ${s.sym}`}
        >
          <defs>
            <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={up ? "#10b981" : "#f43f5e"} stopOpacity="0.25" />
              <stop offset="100%" stopColor={up ? "#10b981" : "#f43f5e"} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={P} x2={W - P} y1={P + t * (H - P * 2)} y2={P + t * (H - P * 2)} stroke="#e0f2fe" />
              <text x={4} y={P + t * (H - P * 2) + 4} fontSize="10" fill="#7dd3fc">
                {(max - t * (max - min)).toFixed(1)}
              </text>
            </g>
          ))}
          <path d={area} fill="url(#fill)" />
          <path d={path} fill="none" stroke={up ? "#10b981" : "#f43f5e"} strokeWidth="2.5" strokeLinejoin="round" />
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={P} y2={H - P} stroke="#7dd3fc" strokeDasharray="4" />
              <circle cx={x(hover)} cy={y(data[hover])} r="5" fill="#0ea5e9" stroke="#fff" strokeWidth="2" />
            </g>
          )}
        </svg>
        <div className="mt-2 flex gap-2">
          {[7, 30, 90].map((r) => (
            <button key={r} onClick={() => setRange(r)} className={range === r ? btnPrimary : btnGhost}>
              {r} วัน
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-sky-500">ข้อมูลในกราฟเป็นข้อมูลจำลองเพื่อการสาธิต ไม่ใช่ราคาจริง</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  App shell                                                          */
/* ------------------------------------------------------------------ */

export default function Page() {
  const [tab, setTab] = useState<TabId>("time");

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-sky-100 pb-24 text-slate-800">
      <div className="mx-auto max-w-2xl px-4 pt-8">
        <h1 className="mb-6 text-2xl font-semibold text-sky-900">
          {TABS.find((t) => t.id === tab)?.label}
        </h1>
        {tab === "time" && <TimeTab />}
        {tab === "football" && <FootballTab />}
        {tab === "stopwatch" && <StopwatchTab />}
        {tab === "alarm" && <AlarmTab />}
        {tab === "calendar" && <CalendarTab />}
        {tab === "weather" && <WeatherTab />}
        {tab === "stock" && <StockTab />}
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 border-t border-sky-100 bg-white/90 backdrop-blur"
        aria-label="เมนูหลัก"
      >
        <ul className="mx-auto flex max-w-2xl overflow-x-auto">
          {TABS.map((t) => (
            <li key={t.id} className="flex-1">
              <button
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`w-full whitespace-nowrap px-3 py-4 text-sm transition ${
                  tab === t.id
                    ? "border-t-2 border-sky-500 font-semibold text-sky-700"
                    : "border-t-2 border-transparent text-sky-400 hover:text-sky-600"
                }`}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}