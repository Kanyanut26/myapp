"use client";

import { useRef, useState, type ReactNode } from "react";
import { Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";

const noto = Noto_Sans_Thai({ subsets: ["thai", "latin"], weight: ["400", "700"] });
const serif = Noto_Serif_Thai({ subsets: ["thai", "latin"], weight: ["600", "700"], variable: "--font-serif" });

/* ---------- ข้อมูลตัวอย่าง ---------- */
type Platform = "mobile" | "pc" | "console";
type Game = { id: string; name: string; platform: Platform; icon: string; bg: string; fg: string };
type Pkg = { id: string; amount: string; price: number; hot?: boolean };
type Screen = "home" | "pkg" | "pay" | "done" | "orders" | "promos" | "profile" | "help";
type Status = "processing" | "success";
type Order = { id: string; time: string; gameId: string; game: string; amount: string; uid: string; pay: string; total: number; status: Status };

const GAMES: Game[] = [
  { id: "a", name: "เกม A", platform: "mobile", icon: "gem", bg: "#4A4A52", fg: "#E8C872" },
  { id: "b", name: "เกม B", platform: "mobile", icon: "sword", bg: "#9A6724", fg: "#FFFFFF" },
  { id: "c", name: "เกม C", platform: "pc", icon: "crown", bg: "#8A6A2F", fg: "#F7E7A9" },
  { id: "d", name: "เกม D", platform: "pc", icon: "shield", bg: "#5B6B7A", fg: "#FFFFFF" },
  { id: "e", name: "เกม E", platform: "console", icon: "car", bg: "#5F7A6A", fg: "#FFFFFF" },
  { id: "f", name: "เกม F", platform: "console", icon: "star", bg: "#6E6E78", fg: "#F7E7A9" },
];
const PACKAGES: Pkg[] = [
  { id: "p1", amount: "60 เพชร", price: 29 },
  { id: "p2", amount: "330 เพชร", price: 149, hot: true },
  { id: "p3", amount: "660 เพชร", price: 299 },
  { id: "p4", amount: "1,980 เพชร", price: 899 },
  { id: "p5", amount: "3,960 เพชร", price: 1790 },
  { id: "p6", amount: "8,100 เพชร", price: 3590 },
];
const SERVERS = ["เอเชีย", "ยุโรป", "อเมริกา"];
const PAYS = [
  { id: "promptpay", name: "พร้อมเพย์ QR", icon: "qr", bg: "#4F6D8A" },
  { id: "card", name: "บัตรเครดิต / เดบิต", icon: "card", bg: "#8A6A2F" },
  { id: "wallet", name: "TrueMoney Wallet", icon: "wallet", bg: "#9A6724" },
  { id: "bank", name: "โอนผ่านแอปธนาคาร", icon: "bank", bg: "#5F7A6A" },
];
const SEED: Order[] = [
  { id: "TP2611172105", time: "17/11/69 21:05", gameId: "a", game: "เกม A", amount: "660 เพชร", uid: "123456789", pay: "promptpay", total: 299, status: "success" },
  { id: "TP2611151830", time: "15/11/69 18:30", gameId: "b", game: "เกม B", amount: "330 เพชร", uid: "987654321", pay: "wallet", total: 149, status: "success" },
];
type Promo = { icon: string; bg: string; fg: string; title: string; desc: string; code: string; end: string; tag: string };
const PROMOS: Promo[] = [
  { icon: "star", bg: "#9A6724", fg: "#fff", title: "ลูกค้าใหม่ลด 10%", desc: "ใช้ได้กับทุกเกม ทุกแพ็กเกจ", code: "WELCOME10", end: "30/11/69", tag: "ลดราคา" },
  { icon: "gem", bg: "#4A4A52", fg: "#E8C872", title: "โบนัสเพชร +20%", desc: "เติมครบ ฿299 ขึ้นไป รับเพชรเพิ่มอัตโนมัติ", code: "", end: "25/11/69", tag: "โบนัส" },
  { icon: "sword", bg: "#8A6A2F", fg: "#F7E7A9", title: "ซื้อ 2 แถม 1", desc: "เติมแพ็กเกจ 330 เพชร 2 ครั้ง แถมอีก 1 ครั้ง", code: "", end: "31/12/69", tag: "ของแถม" },
  { icon: "car", bg: "#5F7A6A", fg: "#fff", title: "เติมครั้งแรกบนคอนโซล", desc: "รับของสมนาคุณพิเศษในเกม", code: "", end: "15/12/69", tag: "ของแถม" },
];
const CONTACTS = [
  { icon: "chat", bg: "#5F7A6A", label: "LINE Official", value: "@topup-demo" },
  { icon: "phone", bg: "#4A4A52", label: "โทรศัพท์", value: "02-000-0000" },
  { icon: "mail", bg: "#8A6A2F", label: "อีเมล", value: "support@example.com" },
];
const FAQS: [string, string][] = [
  ["เติมเกมแล้วยังไม่ได้รับของ ทำอย่างไร?", "ปกติระบบเติมให้ภายใน 5 นาที หากเกินนั้น ให้ตรวจ UID และเซิร์ฟเวอร์ในหน้าคำสั่งซื้ออีกครั้ง แล้วแจ้งเราพร้อมเลขที่คำสั่งซื้อ"],
  ["หา UID ผู้เล่นได้ที่ไหน?", "เปิดเกม ไปที่เมนูโปรไฟล์หรือการตั้งค่าบัญชี จะมีไอดีผู้เล่นแสดงเป็นตัวเลข อาจใช้ปุ่มคัดลอกได้"],
  ["ชำระเงินแล้วขอยกเลิกได้ไหม?", "สินค้าดิจิทัลเมื่อเติมสำเร็จแล้วไม่สามารถยกเลิกได้ แต่หากตัดเงินแล้วไม่ได้รับของ ติดต่อเราเพื่อตรวจสอบและคืนเงินได้"],
  ["รองรับการชำระเงินแบบไหนบ้าง?", "พร้อมเพย์ QR, บัตรเครดิต/เดบิต, TrueMoney Wallet และโอนผ่านแอปธนาคาร"],
  ["ใช้โค้ดส่วนลดอย่างไร?", "ไปที่แท็บโปรโมชัน กดเก็บโค้ด จากนั้นไปหน้าชำระเงินแล้วกด ใช้โค้ด ยอดชำระจะลดลงทันที"],
];
const HELP_TOPICS = ["ไม่ได้รับของหลังเติม", "ปัญหาการชำระเงิน", "โค้ดส่วนลดใช้ไม่ได้", "อื่นๆ"];
const PROMO_FILTERS = ["ทั้งหมด", "ลดราคา", "โบนัส", "ของแถม"];
const COUPONS: Record<string, number> = { WELCOME10: 0.1 };
const FILTERS: [Platform | "all", string][] = [["all", "ทั้งหมด"], ["mobile", "มือถือ"], ["pc", "พีซี"], ["console", "คอนโซล"]];

/* ---------- ไอคอน SVG ---------- */
const GLYPH: Record<string, ReactNode> = {
  gem: (<><path d="M24 6l15 11-15 25L9 17z" /><path d="M9 17h30M24 6l-6 11 6 25 6-25z" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2" /></>),
  sword: <path d="M36 6l6 6-20 20-6-6zM12 30l6 6-4 4-6-2-2-6z" />,
  crown: (<><path d="M7 34V15l9 9 8-14 8 14 9-9v19z" /><rect x="7" y="37" width="34" height="4" rx="2" /></>),
  shield: (<><path d="M24 5l15 5v13c0 10-6 17-15 20C15 40 9 33 9 23V10z" /><path d="M24 14v20" stroke="#fff" strokeOpacity=".6" strokeWidth="3" /></>),
  star: <path d="M24 5l5.5 12 13 1.5-9.7 8.8 2.8 12.8L24 33l-11.6 7.1 2.8-12.8L5.5 18.5l13-1.5z" />,
  car: (<><path d="M6 28l5-11h26l5 11v8H6z" /><circle cx="14" cy="37" r="5" stroke="#fff" strokeOpacity=".7" strokeWidth="2" /><circle cx="34" cy="37" r="5" stroke="#fff" strokeOpacity=".7" strokeWidth="2" /></>),
  cart: (<><path d="M6 8h6l4 20h20l4-14H14" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="19" cy="37" r="3" /><circle cx="34" cy="37" r="3" /></>),
  qr: <path d="M6 6h14v14H6zM28 6h14v14H28zM6 28h14v14H6zM28 28h6v6h-6zM36 36h6v6h-6z" />,
  card: (<><path d="M5 10h38v28H5z" /><path d="M5 18h38" stroke="#0F0F11" strokeWidth="5" /></>),
  wallet: (<><path d="M6 12h34v26H6z" /><circle cx="34" cy="25" r="4" fill="#0F0F11" /></>),
  bank: <path d="M24 5l19 10H5zM9 19h6v16H9zM21 19h6v16h-6zM33 19h6v16h-6zM5 38h38v5H5z" />,
  chat: <path d="M6 8h36v24H20l-10 9v-9H6z" />,
  phone: <path d="M12 6h8l3 10-5 3c2 5 6 9 11 11l3-5 10 3v8c0 2-2 4-4 4C22 40 8 26 8 10c0-2 2-4 4-4z" />,
  mail: (<><path d="M5 10h38v28H5z" /><path d="M5 12l19 15 19-15" fill="none" stroke="#0F0F11" strokeWidth="3" /></>),
};

function Glyph({ k, fill, size }: { k: string; fill: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill={fill} aria-hidden="true">
      {GLYPH[k]}
    </svg>
  );
}

function Icon({ k, bg, fg = "#fff", size = 48, radius = 14 }: { k: string; bg: string; fg?: string; size?: number; radius?: number }) {
  return (
    <div className="flex shrink-0 items-center justify-center" style={{ width: size, height: size, borderRadius: radius, background: `linear-gradient(145deg,rgba(255,255,255,.25),rgba(255,255,255,0) 55%),${bg}`, boxShadow: `inset 0 1px 0 rgba(255,255,255,.3),0 8px 18px -10px ${bg}` }}>
      <Glyph k={k} fill={fg} size={Math.round(size * 0.72)} />
    </div>
  );
}

/* ---------- คลาสที่ใช้ซ้ำ ---------- */
const btnY = "h-[54px] w-full rounded-2xl bg-gradient-to-br from-[#F7E7A9] via-[#D4AF37] to-[#B8892B] text-base shadow-[0_6px_20px_-6px_rgba(212,175,55,.55)] font-bold text-[#0F0F11] transition active:scale-95 disabled:opacity-60";
const btnO = "h-[54px] w-full rounded-2xl border-2 border-[#D4AF37]/70 text-base font-bold text-white transition active:scale-95";
const inputC = "h-12 w-full rounded-xl border-2 border-[#3A3A41] bg-[#1A1A1E] px-3.5 text-base text-white outline-none placeholder:text-white/50 focus:border-[#E8C872]";
const cardC = "rounded-2xl border-2 border-[#3A3A41] bg-[#1A1A1E] bg-gradient-to-br from-white/5 to-transparent";
const baht = (n: number) => `฿ ${n.toLocaleString("th-TH")}`;

/* ---------- หน้าหลัก ---------- */
export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");
  const [filter, setFilter] = useState<Platform | "all">("all");
  const [q, setQ] = useState("");
  const [game, setGame] = useState<Game>(GAMES[0]);
  const [pkg, setPkg] = useState<Pkg>(PACKAGES[1]);
  const [uid, setUid] = useState("");
  const [server, setServer] = useState("");
  const [pay, setPay] = useState("promptpay");
  const [coupon, setCoupon] = useState("");
  const [rate, setRate] = useState(0);
  const [order, setOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>(SEED);
  const [ordFilter, setOrdFilter] = useState<"all" | Status>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [savedCode, setSavedCode] = useState("");
  const [promoFilter, setPromoFilter] = useState("ทั้งหมด");
  const [notif, setNotif] = useState(true);
  const [lastUid, setLastUid] = useState("");
  const [faqOpen, setFaqOpen] = useState(-1);
  const [helpTopic, setHelpTopic] = useState("");
  const [helpMsg, setHelpMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "error" | "ok" | "info" } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = Math.round(pkg.price * (1 - rate));
  const games = GAMES.filter((g) => (filter === "all" || g.platform === filter) && g.name.toLowerCase().includes(q.trim().toLowerCase()));

  function say(msg: string, type: "error" | "ok" | "info" = "error") {
    setToast({ msg, type });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2800);
  }

  function reset() {
    setQ(""); setUid(""); setServer(""); setPay("promptpay"); setCoupon(""); setRate(0); setOrder(null); setBusy(false);
    setPkg(PACKAGES[1]);
    setScreen("home");
  }

  function toPay() {
    if (!/^\d{5,15}$/.test(uid)) return say("กรุณากรอก UID เป็นตัวเลข 5–15 หลัก");
    if (!server) return say("กรุณาเลือกเซิร์ฟเวอร์");
    if (savedCode && !coupon) setCoupon(savedCode);
    setScreen("pay");
  }

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (!code) { setRate(0); return; }
    const r = COUPONS[code];
    setRate(r ?? 0);
    say(r ? `ใช้โค้ดสำเร็จ ลด ${Math.round(r * 100)}%` : "โค้ดไม่ถูกต้อง", r ? "ok" : "error");
  }

  async function submit() {
    if (busy) return;
    setBusy(true);
    // TODO: เรียก API จริง เช่น fetch("/api/orders", { method: "POST", body: JSON.stringify({...}) })
    await new Promise((r) => setTimeout(r, 900));
    const placed: Order = {
      id: `TP${Date.now().toString().slice(-10)}`,
      time: new Date().toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" }),
      gameId: game.id, game: game.name, amount: pkg.amount, uid, pay, total, status: "processing",
    };
    setOrder(placed);
    setLastUid(uid);
    setOrders((prev) => [placed, ...prev]);
    setTimeout(() => setOrders((prev) => prev.map((o) => (o.id === placed.id ? { ...o, status: "success" } : o))), 6000);
    setBusy(false);
    setScreen("done");
  }

  const soon = (n: string) => say(`${n}: เร็วๆ นี้`, "info");
  const promos = PROMOS.filter((x) => promoFilter === "ทั้งหมด" || x.tag === promoFilter);
  const copy = (v: string) => {
    if (!navigator.clipboard) return say("คัดลอกไม่ได้ กรุณาพิมพ์ตามเอง", "info");
    navigator.clipboard.writeText(v).then(() => say(`คัดลอก ${v} แล้ว`, "ok"), () => say("คัดลอกไม่ได้ กรุณาพิมพ์ตามเอง", "info"));
  };
  const sendHelp = () => {
    if (!helpTopic) return say("กรุณาเลือกหัวข้อปัญหา");
    if (helpMsg.trim().length < 10) return say("กรุณาอธิบายปัญหาอย่างน้อย 10 ตัวอักษร");
    setHelpTopic(""); setHelpMsg("");
    say("ส่งเรื่องแล้ว เราจะตอบกลับภายใน 24 ชั่วโมง", "ok");
  };
  const shown = orders.filter((o) => ordFilter === "all" || o.status === ordFilter);

  const Nav = ({ active }: { active: number }) => (
    <nav className="absolute inset-x-0 bottom-0 flex h-[68px] items-center justify-around border-t border-[#3A3A41] bg-[#141417]/80 text-[11px] backdrop-blur-xl">
      {([["หน้าแรก", "crown"], ["คำสั่งซื้อ", "cart"], ["โปรโมชัน", "star"], ["บัญชี", "shield"]] as const).map(([n, k], i) => (
        <button key={n} onClick={() => (i === 0 ? reset() : i === 1 ? setScreen("orders") : i === 2 ? setScreen("promos") : setScreen("profile"))} className={`flex flex-col items-center gap-1 ${i === active ? "font-bold text-[#E8C872]" : "text-[#B5B3BC]"}`}>
          <Glyph k={k} fill="currentColor" size={24} />{n}
        </button>
      ))}
    </nav>
  );

  const MenuRow = ({ k, bg, title, sub, onClick }: { k: string; bg: string; title: string; sub?: string; onClick: () => void }) => (
    <button onClick={onClick} className="flex w-full items-center gap-3 border-b border-[#3A3A41] py-3 text-left last:border-0">
      <Icon k={k} bg={bg} size={36} radius={10} />
      <div className="flex-1"><div>{title}</div>{sub && <div className="text-xs text-[#B5B3BC]">{sub}</div>}</div>
      <span className="text-[#B5B3BC]" aria-hidden="true">›</span>
    </button>
  );

  const Back = ({ to, title }: { to: Screen; title: string }) => (
    <div className="flex h-[60px] items-center">
      <button className="h-11 px-2 text-[15px] text-[#E8C872]" onClick={() => setScreen(to)}>‹ ย้อนกลับ</button>
      <h1 className="flex-1 pr-16 text-center font-bold">{title}</h1>
    </div>
  );

  const Footer = ({ children }: { children: ReactNode }) => (
    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 border-t border-[#3A3A41] bg-[#141417]/80 px-4 pb-6 pt-3 backdrop-blur-xl">{children}</div>
  );

  return (
    <main className={`${noto.className} ${serif.variable} flex min-h-dvh justify-center bg-[#050506] [&_h1]:font-[family-name:var(--font-serif)] [&_h2]:font-[family-name:var(--font-serif)] [&_h1]:bg-gradient-to-r [&_h1]:from-[#F7E7A9] [&_h1]:to-[#D4AF37] [&_h1]:bg-clip-text [&_h1]:text-transparent [&_h2]:text-[#F1DDA0]`}>
      <div className="relative h-dvh w-full max-w-[390px] overflow-hidden bg-[radial-gradient(120%_55%_at_50%_-8%,#2B1B5E_0%,#0B0814_62%)] text-white sm:my-4 sm:h-[882px] sm:rounded-[28px] sm:shadow-[0_30px_80px_rgba(0,0,0,.6)] sm:ring-1 sm:ring-[#D4AF37]/45">
        {toast && (
          <div role="status" className={`absolute left-1/2 top-3 z-50 w-[90%] -translate-x-1/2 rounded-xl px-4 py-3 text-sm shadow-lg ${toast.type === "error" ? "bg-red-500 text-white" : "bg-[#E8C872] text-[#0F0F11]"}`}>
            {toast.msg}
          </div>
        )}

        <style>{`@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){*{animation:none!important}}`}</style>
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,.2),transparent_65%)]" />
        <div className="pointer-events-none absolute -left-20 bottom-14 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(190,190,200,.09),transparent_65%)]" />
        <div key={screen} className="relative h-full animate-[rise_.38s_ease-out_both]">
        {/* 1) หน้าแรก */}
        {screen === "home" && (
          <>
            <div className="h-[calc(100%-68px)] overflow-y-auto px-4 pb-4">
              <div className="flex items-center py-4">
                <h1 className="flex-1 text-2xl font-bold">เติมเกม</h1>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9A6724]"><Glyph k="cart" fill="#fff" size={22} /></div>
              </div>
              <input className={inputC} value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาเกมที่ต้องการเติม" aria-label="ค้นหาเกม" />

              <div className="relative mt-4 flex h-[150px] items-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#44444C] to-[#1F1F24] px-5">
                <div className="absolute -right-8 -top-10 h-44 w-44 rounded-full bg-[#9A6724]" />
                <div className="absolute -bottom-12 right-12 h-28 w-28 rounded-full bg-[#E8C872]" />
                <svg className="absolute right-4 top-6 drop-shadow-[0_8px_24px_rgba(232,200,114,.5)]" width="104" height="104" viewBox="0 0 48 48" fill="#E8C872" aria-hidden="true">{GLYPH.gem}</svg>
                <svg className="absolute right-[118px] top-3 opacity-90" width="14" height="14" viewBox="0 0 24 24" fill="#F7E7A9" aria-hidden="true"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" /></svg>
                <svg className="absolute bottom-4 right-6 opacity-80" width="10" height="10" viewBox="0 0 24 24" fill="#F7E7A9" aria-hidden="true"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" /></svg>
                <div className="relative flex w-44 flex-col gap-1.5">
                  <span className="self-start rounded-full bg-[#E8C872] px-2.5 py-0.5 text-[11px] font-bold text-[#0F0F11]">โปรโมชันพิเศษ</span>
                  <b className="text-2xl leading-tight">โบนัสเพชร +20%</b>
                  <span className="text-xs text-[#ECEAF0]">เติมวันนี้ รับทันที</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto">
                {FILTERS.map(([k, n]) => (
                  <button key={k} onClick={() => setFilter(k)} className={`h-9 shrink-0 rounded-full px-4 text-[13px] ${filter === k ? "bg-[#E8C872] font-bold text-[#0F0F11]" : "bg-[#26262B] text-[#ECEAF0]"}`}>{n}</button>
                ))}
              </div>

              <h2 className="mb-2 mt-4 font-bold">เกมยอดนิยม</h2>
              <div className="grid grid-cols-3 gap-3">
                {games.map((g) => (
                  <button key={g.id} onClick={() => { setGame(g); setPkg(PACKAGES[1]); setScreen("pkg"); }} className="flex flex-col items-center gap-1.5">
                    <span className={`${cardC} flex w-full justify-center p-2.5 transition active:scale-95`}><Icon k={g.icon} bg={g.bg} fg={g.fg} size={64} radius={16} /></span>
                    <span className="text-xs">{g.name}</span>
                  </button>
                ))}
                {games.length === 0 && <p className="col-span-3 py-6 text-center text-sm opacity-70">ไม่พบเกมที่ค้นหา</p>}
              </div>

              <h2 className="mb-2 mt-4 font-bold">โปรโมชันวันนี้</h2>
              {([["gem", "#4A4A52", "#E8C872", "เพชรโบนัสเท่าตัว"], ["sword", "#9A6724", "#fff", "ซื้อ 2 แถม 1"]] as const).map(([k, b, f, t]) => (
                <div key={t} className={`${cardC} mb-2 flex items-center gap-3 p-3`}>
                  <Icon k={k} bg={b} fg={f} size={48} radius={12} />
                  <div className="flex-1"><b>{t}</b><div className="text-xs text-[#B5B3BC]">เติมครบ ฿ 299 รับของแถม</div></div>
                  <span className="rounded-full bg-[#9A6724] px-2.5 py-0.5 text-xs font-bold">HOT</span>
                </div>
              ))}
            </div>
            <Nav active={0} />
          </>
        )}

        {/* 2) เลือกแพ็กเกจ */}
        {screen === "pkg" && (
          <>
            <div className="h-full overflow-y-auto px-4 pb-44">
              <Back to="home" title={`เติม${game.name}`} />
              <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#44444C] to-[#1F1F24] p-3">
                <Icon k={game.icon} bg="#0F0F11" fg={game.fg} size={64} radius={16} />
                <div><b className="text-lg">{game.name}</b><div className="text-xs text-[#ECEAF0]">เติมทันที · รองรับหลายเซิร์ฟเวอร์</div></div>
              </div>
              <h2 className="mb-2 mt-4 font-bold"><span className="text-[#E8C872]">1.</span> กรอกข้อมูลบัญชี</h2>
              <input className={`${inputC} mb-2`} inputMode="numeric" maxLength={15} value={uid} onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))} placeholder="ไอดีผู้เล่น (UID)" aria-label="ไอดีผู้เล่น" />
              <select className={`${inputC} [color-scheme:dark]`} value={server} onChange={(e) => setServer(e.target.value)} aria-label="เซิร์ฟเวอร์">
                <option value="">เลือกเซิร์ฟเวอร์</option>
                {SERVERS.map((s) => <option key={s}>{s}</option>)}
              </select>
              <h2 className="mb-3 mt-4 font-bold"><span className="text-[#E8C872]">2.</span> เลือกแพ็กเกจ</h2>
              <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                {PACKAGES.map((p) => (
                  <button key={p.id} onClick={() => setPkg(p)} aria-pressed={pkg.id === p.id} className={`relative flex h-[100px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 ${pkg.id === p.id ? "border-[#E8C872] bg-[#26262B] shadow-[0_0_0_1px_rgba(232,200,114,.5),0_10px_30px_-12px_rgba(232,200,114,.45)]" : "border-[#3A3A41] bg-[#1A1A1E]"}`}>
                    {p.hot && <span className="absolute -top-2.5 right-2.5 rounded-full bg-[#9A6724] px-2.5 py-0.5 text-xs font-bold">ยอดนิยม</span>}
                    <span className="flex items-center gap-2"><Icon k="gem" bg="#4A4A52" fg="#E8C872" size={32} radius={10} /><b className="text-[17px]">{p.amount.split(" ")[0]}</b></span>
                    <b className="text-[#E8C872]">{baht(p.price)}</b>
                  </button>
                ))}
              </div>
            </div>
            <Footer>
              <div className="flex items-center justify-between"><span className="text-sm text-[#B5B3BC]">ยอดรวม</span><b className="text-[22px] text-[#E8C872]">{baht(pkg.price)}</b></div>
              <button className={btnY} onClick={toPay}>ถัดไป</button>
            </Footer>
          </>
        )}

        {/* 3) ชำระเงิน */}
        {screen === "pay" && (
          <>
            <div className="h-full overflow-y-auto px-4 pb-36">
              <Back to="pkg" title="ชำระเงิน" />
              <div className={`${cardC} flex items-center gap-3 p-3`}>
                <Icon k={game.icon} bg={game.bg} fg={game.fg} size={56} />
                <div className="flex-1"><b>{game.name}</b><div className="text-xs text-[#B5B3BC]">{pkg.amount} · UID {uid}</div></div>
                <b className="text-[#E8C872]">{baht(pkg.price)}</b>
              </div>
              <h2 className="mb-2 mt-4 font-bold">เลือกวิธีชำระเงิน</h2>
              {PAYS.map((m) => (
                <button key={m.id} onClick={() => setPay(m.id)} aria-pressed={pay === m.id} className={`mb-2 flex h-[62px] w-full items-center gap-3 rounded-2xl border-2 px-3 ${pay === m.id ? "border-[#E8C872] bg-[#26262B] shadow-[0_0_0_1px_rgba(232,200,114,.5),0_10px_30px_-12px_rgba(232,200,114,.45)]" : "border-[#3A3A41] bg-[#1A1A1E]"}`}>
                  <Icon k={m.icon} bg={m.bg} size={40} radius={12} />
                  <b className="flex-1 text-left">{m.name}</b>
                  <span className={`h-[22px] w-[22px] rounded-full border-2 border-[#E8C872] ${pay === m.id ? "bg-[#E8C872]" : ""}`} />
                </button>
              ))}
              <div className="mt-3 flex gap-2">
                <input className={`${inputC} flex-1`} value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="โค้ดส่วนลด (ลอง WELCOME10)" aria-label="โค้ดส่วนลด" />
                <button className="h-12 w-24 rounded-xl border-2 border-[#D4AF37]/70 text-sm font-bold" onClick={applyCoupon}>ใช้โค้ด</button>
              </div>
              <div className={`${cardC} mt-4 p-3 text-sm`}>
                <div className="flex justify-between py-1.5"><span className="text-[#B5B3BC]">ราคาแพ็กเกจ</span><span>{baht(pkg.price)}</span></div>
                <div className="flex justify-between py-1.5"><span className="text-[#B5B3BC]">ส่วนลด</span><span className="text-[#3DDC97]">- {baht(pkg.price - total)}</span></div>
                <div className="mt-1 flex justify-between border-t border-[#3A3A41] pt-2.5"><b>ยอดชำระ</b><b className="text-xl text-[#E8C872]">{baht(total)}</b></div>
              </div>
            </div>
            <Footer>
              <button className={btnY} disabled={busy} onClick={submit}>{busy ? "กำลังดำเนินการ…" : `ชำระเงิน ${baht(total)}`}</button>
            </Footer>
          </>
        )}

        {/* 8) ช่วยเหลือและติดต่อเรา */}
        {screen === "help" && (
          <div className="h-full overflow-y-auto px-4 pb-8">
            <Back to="profile" title="ช่วยเหลือและติดต่อเรา" />
            <h2 className="mb-2 font-bold">ติดต่อเรา</h2>
            <div className={`${cardC} px-3`}>
              {CONTACTS.map((c) => (
                <div key={c.value} className="flex items-center gap-3 border-b border-[#3A3A41] py-3 last:border-0">
                  <Icon k={c.icon} bg={c.bg} size={40} radius={12} />
                  <div className="flex-1"><div className="text-xs text-[#B5B3BC]">{c.label}</div><b>{c.value}</b></div>
                  <button onClick={() => copy(c.value)} className="h-9 rounded-2xl border border-[#3A3A41] bg-[#26262B] px-3 text-xs font-bold">คัดลอก</button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-[#B5B3BC]">เวลาทำการ 09:00–21:00 ทุกวัน</p>
            <h2 className="mb-2 mt-5 font-bold">คำถามที่พบบ่อย</h2>
            <div className={`${cardC} px-3`}>
              {FAQS.map(([q, a], i) => (
                <div key={q} className="border-b border-[#3A3A41] last:border-0">
                  <button aria-expanded={faqOpen === i} onClick={() => setFaqOpen(faqOpen === i ? -1 : i)} className="flex w-full items-center justify-between gap-3 py-3 text-left">
                    <span className="font-semibold">{q}</span>
                    <span className="text-[#E8C872]" aria-hidden="true">{faqOpen === i ? "−" : "+"}</span>
                  </button>
                  {faqOpen === i && <p className="pb-3 text-sm text-white/80">{a}</p>}
                </div>
              ))}
            </div>
            <h2 className="mb-2 mt-5 font-bold">แจ้งปัญหา</h2>
            <div className="flex flex-col gap-2">
              <select className={`${inputC} [color-scheme:dark]`} value={helpTopic} onChange={(e) => setHelpTopic(e.target.value)} aria-label="หัวข้อปัญหา">
                <option value="">เลือกหัวข้อปัญหา</option>
                {HELP_TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
              <textarea rows={4} value={helpMsg} onChange={(e) => setHelpMsg(e.target.value)} aria-label="รายละเอียดปัญหา" placeholder="อธิบายปัญหาที่พบ (ใส่เลขที่คำสั่งซื้อถ้ามี)" className="w-full rounded-xl border-2 border-[#3A3A41] bg-[#1A1A1E] p-3 text-base text-white outline-none placeholder:text-white/50 focus:border-[#E8C872]" />
              <button className={`${btnY} !h-[52px]`} onClick={sendHelp}>ส่งเรื่อง</button>
            </div>
          </div>
        )}

        {/* 7) บัญชี */}
        {screen === "profile" && (
          <>
            <div className="h-[calc(100%-68px)] overflow-y-auto px-4 pb-4">
              <div className="flex h-[60px] items-center"><h1 className="flex-1 text-2xl font-bold">บัญชี</h1></div>
              <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#44444C] to-[#1F1F24] p-4">
                <Icon k="crown" bg="#9A6724" fg="#E8C872" size={64} radius={32} />
                <div className="flex-1"><b className="text-lg">ผู้เล่นตัวอย่าง</b><div className="text-xs">ID 10023456</div></div>
                <span className="rounded-full bg-[#E8C872] px-2.5 py-0.5 text-xs font-bold text-[#0F0F11]">สมาชิก Gold</span>
              </div>
              <div className={`${cardC} mt-3 flex py-3`}>
                {([[orders.length, "คำสั่งซื้อ"], [baht(orders.reduce((a, o) => a + o.total, 0)), "ยอดเติมรวม"], [savedCode ? 1 : 0, "โค้ดที่เก็บไว้"]] as const).map(([v, l]) => (
                  <div key={l} className="flex flex-1 flex-col items-center gap-0.5"><b className="text-lg text-[#E8C872]">{v}</b><span className="text-xs text-[#B5B3BC]">{l}</span></div>
                ))}
              </div>
              <div className={`${cardC} mt-3 px-3`}>
                <MenuRow k="shield" bg="#4A4A52" title="ข้อมูลส่วนตัว" sub="ผู้เล่นตัวอย่าง" onClick={() => soon("ข้อมูลส่วนตัว")} />
                <MenuRow k="gem" bg="#9A6724" title="ไอดีเกมที่บันทึกไว้" sub={lastUid || "ยังไม่มี"} onClick={() => soon("ไอดีเกม")} />
                <MenuRow k="cart" bg="#8A6A2F" title="คำสั่งซื้อของฉัน" sub={`${orders.length} รายการ`} onClick={() => { setOrdFilter("all"); setScreen("orders"); }} />
                <MenuRow k="star" bg="#5B6B7A" title="โปรโมชันของฉัน" sub={savedCode ? `เก็บโค้ด ${savedCode}` : "ยังไม่ได้เก็บโค้ด"} onClick={() => setScreen("promos")} />
                <div className="flex items-center gap-3 border-b border-[#3A3A41] py-3">
                  <Icon k="star" bg="#E8C872" fg="#0F0F11" size={36} radius={10} />
                  <div className="flex-1">การแจ้งเตือน</div>
                  <button role="switch" aria-checked={notif} aria-label="การแจ้งเตือน" onClick={() => setNotif(!notif)} className={`relative h-7 w-12 rounded-full ${notif ? "bg-[#3DDC97]" : "bg-[#3A3A41]"}`}>
                    <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all ${notif ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
                <MenuRow k="shield" bg="#5F7A6A" title="ช่วยเหลือและติดต่อเรา" onClick={() => setScreen("help")} />
              </div>
              <button className={`${btnO} mt-4 !h-[52px]`} onClick={() => soon("ออกจากระบบ")}>ออกจากระบบ</button>
            </div>
            <Nav active={3} />
          </>
        )}

        {/* 6) โปรโมชัน */}
        {screen === "promos" && (
          <>
            <div className="h-[calc(100%-68px)] overflow-y-auto px-4 pb-4">
              <div className="flex h-[60px] items-center"><h1 className="flex-1 text-2xl font-bold">โปรโมชัน</h1></div>
              <div className="relative mb-4 flex h-[110px] items-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#44444C] to-[#1F1F24] px-5">
                <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-[#9A6724]" />
                <svg className="absolute right-5 top-4" width="78" height="78" viewBox="0 0 48 48" fill="#E8C872" aria-hidden="true">{GLYPH.gem}</svg>
                <div className="relative w-48"><b className="text-xl leading-tight">โปรโมชันสุดคุ้ม</b><div className="mt-1 text-xs">เก็บโค้ดไว้ใช้ตอนชำระเงิน</div></div>
              </div>
              <div className="mb-4 flex gap-2 overflow-x-auto">
                {PROMO_FILTERS.map((k) => (
                  <button key={k} onClick={() => setPromoFilter(k)} className={`h-9 shrink-0 rounded-full px-4 text-[13px] ${promoFilter === k ? "bg-[#E8C872] font-bold text-[#0F0F11]" : "bg-[#26262B] text-[#ECEAF0]"}`}>{k}</button>
                ))}
              </div>
              {promos.map((x) => (
                <div key={x.title} className={`${cardC} mb-3 p-3`}>
                  <div className="flex items-center gap-3">
                    <Icon k={x.icon} bg={x.bg} fg={x.fg} size={48} radius={12} />
                    <div className="flex-1"><b>{x.title}</b><div className="text-xs text-[#B5B3BC]">{x.desc}</div></div>
                    <span className="rounded-full bg-[#9A6724] px-2.5 py-0.5 text-xs font-bold">{x.tag}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#3A3A41] pt-3 text-xs">
                    <span className="text-[#B5B3BC]">หมดเขต {x.end}</span>
                    {x.code ? (
                      savedCode === x.code
                        ? <span className="font-bold text-[#3DDC97]">เก็บแล้ว · {x.code}</span>
                        : <button className="h-9 rounded-2xl bg-[#E8C872] px-3 text-sm font-bold text-[#0F0F11]" onClick={() => { setSavedCode(x.code); say(`เก็บโค้ด ${x.code} แล้ว ใช้ได้ตอนชำระเงิน`, "ok"); }}>เก็บโค้ด {x.code}</button>
                    ) : <span className="text-[#E8C872]">ใช้อัตโนมัติ</span>}
                  </div>
                </div>
              ))}
            </div>
            <Nav active={2} />
          </>
        )}

        {/* 5) คำสั่งซื้อของฉัน */}
        {screen === "orders" && (
          <>
            <div className="h-[calc(100%-68px)] overflow-y-auto px-4 pb-4">
              <div className="flex h-[60px] items-center"><h1 className="flex-1 text-2xl font-bold">คำสั่งซื้อของฉัน</h1></div>
              <div className="mb-4 flex gap-2 overflow-x-auto">
                {([["all", "ทั้งหมด"], ["processing", "กำลังเติม"], ["success", "สำเร็จ"]] as const).map(([k, n]) => (
                  <button key={k} onClick={() => setOrdFilter(k)} className={`h-9 shrink-0 rounded-full px-4 text-[13px] ${ordFilter === k ? "bg-[#E8C872] font-bold text-[#0F0F11]" : "bg-[#26262B] text-[#ECEAF0]"}`}>{n}</button>
                ))}
              </div>
              {shown.length === 0 && <p className="py-10 text-center text-sm opacity-70">ยังไม่มีคำสั่งซื้อ</p>}
              {shown.map((o) => {
                const g = GAMES.find((x) => x.id === o.gameId) ?? GAMES[0];
                const ok = o.status === "success";
                const isOpen = openId === o.id;
                return (
                  <button key={o.id} aria-expanded={isOpen} onClick={() => setOpenId(isOpen ? null : o.id)} className={`${cardC} mb-3 block w-full p-3 text-left`}>
                    <div className="flex items-center gap-3">
                      <Icon k={g.icon} bg={g.bg} fg={g.fg} size={48} radius={12} />
                      <div className="flex-1"><b>{o.game} · {o.amount}</b><div className="text-xs text-[#B5B3BC]">{o.time}</div></div>
                      <div className="text-right">
                        <b className="text-[#E8C872]">{baht(o.total)}</b>
                        <div className="mt-1"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-[#0F0F11] ${ok ? "bg-[#3DDC97]" : "bg-[#E8C872]"}`}>{ok ? "สำเร็จ" : "กำลังเติม"}</span></div>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="mt-3 border-t border-[#3A3A41] pt-2 text-sm">
                        {([["เลขที่คำสั่งซื้อ", o.id], ["UID", o.uid], ["วิธีชำระเงิน", PAYS.find((m) => m.id === o.pay)?.name ?? o.pay]] as const).map(([a, b]) => (
                          <div key={a} className="flex justify-between py-1"><span className="text-[#B5B3BC]">{a}</span><span>{b}</span></div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <Nav active={1} />
          </>
        )}

        {/* 4) สำเร็จ */}
        {screen === "done" && order && (
          <>
            <div className="h-full overflow-y-auto px-4 pb-52">
              <div className="flex h-[60px] items-center justify-center font-bold">สถานะคำสั่งซื้อ</div>
              <div className="relative mx-auto mt-2 h-[130px] w-[150px]">
                <div className="absolute left-[25px] top-[15px] flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#3DDC97]">
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#0F0F11" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
                </div>
                <svg className="absolute left-0 top-0" width="34" height="34" viewBox="0 0 48 48" fill="#E8C872" aria-hidden="true">{GLYPH.gem}</svg>
                <svg className="absolute right-0 top-[70px]" width="40" height="40" viewBox="0 0 48 48" fill="#9A6724" aria-hidden="true">{GLYPH.star}</svg>
                <svg className="absolute right-3.5 top-0" width="26" height="26" viewBox="0 0 48 48" fill="#E8C872" aria-hidden="true">{GLYPH.star}</svg>
              </div>
              <div className="mt-4 text-center"><h2 className="text-2xl font-bold">ชำระเงินสำเร็จ</h2><p className="mt-1 text-xs text-[#B5B3BC]">ระบบกำลังเติมให้อัตโนมัติ ปกติไม่เกิน 5 นาที</p></div>
              <div className="mt-5 flex">
                {["ชำระแล้ว", "กำลังเติม", "สำเร็จ"].map((n, i) => (
                  <div key={n} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className={`flex h-[30px] w-[30px] items-center justify-center rounded-full text-[13px] font-bold ${i < 2 ? "bg-[#3DDC97] text-[#0F0F11]" : "bg-[#3A3A41] text-[#B5B3BC]"}`}>{i + 1}</div>
                    <span className={`text-xs ${i < 2 ? "font-bold" : "text-[#B5B3BC]"}`}>{n}</span>
                  </div>
                ))}
              </div>
              <div className={`${cardC} mt-5 p-3 text-sm`}>
                {([["เลขที่คำสั่งซื้อ", order.id], ["เกม", order.game], ["แพ็กเกจ", order.amount], ["UID", order.uid], ["วิธีชำระเงิน", PAYS.find((m) => m.id === order.pay)?.name ?? order.pay], ["เวลา", order.time], ["ยอดชำระ", baht(order.total)]] as const).map(([a, b]) => (
                  <div key={a} className="flex justify-between py-1.5"><span className="text-[#B5B3BC]">{a}</span><span>{b}</span></div>
                ))}
              </div>
            </div>
            <Footer>
              <button className={btnY} onClick={() => { setOrdFilter("all"); setScreen("orders"); }}>ดูคำสั่งซื้อของฉัน</button>
              <button className={btnO} onClick={reset}>กลับหน้าแรก</button>
            </Footer>
          </>
        )}
        </div>
      </div>
    </main>
  );
}