import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import TabDashboard from "./components/TabDashboard.jsx";
import TabTransactions from "./components/TabTransactions.jsx";
import TabReport from "./components/TabReport.jsx";
import TabDate from "./components/TabDate.jsx";
import TabSettings from "./components/TabSettings.jsx";
import ModalAppearance from "./components/ModalAppearance.jsx";
import ModalNotif from "./components/ModalNotif.jsx";
import ModalOverallBudget from "./components/ModalOverallBudget.jsx";
import ModalAddTransaction from "./components/ModalAddTransaction.jsx";
import {
  Home, House, List, LayoutList, BarChart2, Heart, ArrowDown, RefreshCw, Coins,
  Utensils, Car, ShoppingBag, Gamepad2, Pill, FileText, Package,
  Coffee, Pizza, Plane, Book, Music, Monitor, Gift, Dumbbell,
  PawPrint, Leaf, DollarSign, Palette, Droplets, Shirt, Wrench,
  Film, Beer, Umbrella, Flower2,
  Pencil, Trash2, Plus,
  Calendar, PiggyBank, TrendingUp, Clock, Wallet,
  BadgeDollarSign, User, ChartPie,
  Sun, Moon, SlidersHorizontal,
  CircleDollarSign, AlertTriangle, CheckCircle, Search, Inbox,
  ArrowRight, Banknote, Download, Bell, BellOff, X, Camera, Settings,
  WifiOff, Repeat, AlertCircle, Sparkles, Flame, Wind, Zap, Smartphone, Laptop, ChevronDown, ChevronRight, Target, Save, Upload, Share2, Calculator2
} from "./icons.jsx";
import { formatRp, today, getWeek, getMonth, fmtDate, groupByDate, dateLabel, getCatLabel, haptic, parseRpInput, rpInputProps } from "./utils/helpers.js";

// IndexedDB helpers for transaction persistence
const IDB_NAME = "meowlett_db", IDB_STORE = "transactions", IDB_VER = 1;
const openIDB = () => new Promise((res,rej) => {
  const req = indexedDB.open(IDB_NAME, IDB_VER);
  req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE, { keyPath:"id" });
  req.onsuccess = e => res(e.target.result);
  req.onerror = () => rej();
});
const saveToIDB = async (txns) => {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    store.clear();
    txns.forEach(t => store.put(t));
  } catch {}
};
const loadFromIDB = async () => {
  try {
    const db = await openIDB();
    return new Promise((res) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => res([]);
    });
  } catch { return []; }
};
import { darken, lighten, getLuminance, getContrastText, buildTheme } from "./utils/theme.js";
import { exportCSV, exportPDFReport } from "./utils/export.js";
import { requestNotificationPermission, sendLocalNotification, scheduleLocalReminder } from "./utils/notifications.js";
import { DEFAULT_CATEGORIES, THEME_PRESETS, GOAL_ICONS, ICON_OPTIONS, COLOR_OPTIONS, PRESET_ICONS } from "./constants/index.js";
import { LANG } from "./constants/lang.js";
import AnimatedNumber from "./components/AnimatedNumber.jsx";
import DonutChart from "./components/DonutChart.jsx";

function Ic({ icon, size = 18, color, style = {} }) {
  const Icon = icon;
  return <Icon size={size} color={color} strokeWidth={2} style={{ flexShrink: 0, ...style }} />;
}

const LUCIDE_MAP = {
  utensils: Utensils, car: Car, heart: Heart, shoppingbag: ShoppingBag,
  gamepad: Gamepad2, pill: Pill, filetext: FileText, package: Package,
  coffee: Coffee, pizza: Pizza, plane: Plane, book: Book, music: Music,
  monitor: Monitor, gift: Gift, dumbbell: Dumbbell, pawprint: PawPrint,
  leaf: Leaf, dollar: CircleDollarSign, palette: Palette, droplets: Droplets,
  shirt: Shirt, wrench: Wrench, film: Film, beer: Beer, umbrella: Umbrella,
  flower: Flower2, banknote: Banknote,
};
const CatIcon = ({ iconKey, size = 18, color }) => {
  const Icon = LUCIDE_MAP[iconKey] || Package;
  return <Icon size={size} color={color} strokeWidth={2} style={{ flexShrink: 0 }} />;
};

function PresetIcon({ name, size=14, color, strokeWidth=2 }) {
  const Icon = PRESET_ICONS[name] || Palette;
  return <Icon size={size} color={color} strokeWidth={strokeWidth}/>;
}

function SwipeRow({ children, onDelete, style = {} }) {
  return (
    <div style={{ position: "relative", ...style }}>
      {children}
    </div>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', 'Nunito', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; -webkit-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  * { -webkit-tap-highlight-color: transparent; -webkit-touch-callout: none; }
  input, textarea, select, [contenteditable] { -webkit-touch-callout: default; user-select: text; -webkit-user-select: text; }
  .scroll-area { -webkit-overflow-scrolling: touch; overscroll-behavior: none; }
  input, select, textarea { font-size: 16px !important; border-radius: 0; -webkit-appearance: none; }
  input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
  input[type=date]::-webkit-calendar-picker-indicator { opacity:0; width:100%; height:100%; position:absolute; top:0; left:0; cursor:pointer; }
  button { touch-action: manipulation; -webkit-appearance: none; }
  a { touch-action: manipulation; }
  .fi { display:flex; flex-direction:column; width: 100%; }
  .card { border-radius:18px; transition: background-color 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease; }
  .inp { width:100%; padding:13px 16px; border-radius:14px; font-size:16px; font-family:inherit; outline:none; display:block; transition: background-color 0.3s, border-color 0.3s; }
  .btn-p { background:var(--accent); color:white; border:none; border-radius:14px; padding:14px 20px; font-size:14px; font-weight:800; cursor:pointer; font-family:inherit; letter-spacing:0.3px; transition: opacity 0.15s, transform 0.15s; min-height:44px; }
  .btn-p:active { opacity:0.82; transform:scale(0.97); }
  .btn-g { border-radius:14px; padding:13px 18px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; transition: opacity 0.15s, transform 0.15s; }
  .btn-g:active { opacity:0.75; transform:scale(0.97); }
  .btn-d { border-radius:12px; padding:7px 11px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition: opacity 0.15s, transform 0.15s; }
  .btn-d:active { opacity:0.75; transform:scale(0.96); }
  .btn-sm { border-radius:12px; padding:7px 11px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; }
  .nav-i { display:flex; flex-direction:column; align-items:center; gap:2px; font-size:10px; font-weight:700; background:none; border:none; cursor:pointer; padding:6px 10px; border-radius:14px; font-family:inherit; min-width:52px; min-height:44px; justify-content:center; }
  .icon-btn { font-size:20px; border:2px solid transparent; border-radius:12px; padding:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s; }
  .icon-btn:active { transform: scale(0.88); }
  .icon-btn.sel { border-color:var(--accent); }
  .cdot { width:28px; height:28px; border-radius:50%; cursor:pointer; border:3px solid transparent; transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s; }
  .cdot:active { transform: scale(0.85); }
  .cdot.sel { border-color:var(--primary); transform: scale(1.12); }
  select.inp { appearance:none; }
  select { color-scheme: light dark; }
  svg text { -webkit-user-select:none; user-select:none; pointer-events:none; }

  /* Theme transition - semua elemen smooth saat ganti warna/dark */
  .theme-flash, .theme-flash * {
    transition: background-color 0.35s ease, color 0.35s ease, border-color 0.35s ease !important;
  }

  /* Tab content slide + fade */
  @keyframes tab-enter { 0%{opacity:0; transform:translateY(10px) scale(0.99)} 100%{opacity:1; transform:translateY(0) scale(1)} }
  .tab-enter { animation: tab-enter 0.22s cubic-bezier(0.34,1.1,0.64,1) forwards; }

  /* Card pop-in */
  @keyframes card-pop { 0%{opacity:0; transform:translateY(6px)} 100%{opacity:1; transform:translateY(0)} }
  .card-pop { animation: card-pop 0.18s ease-out forwards; }

  /* Modal slide up */
  @keyframes modal-up { 0%{transform:translateY(100%); opacity:0.6} 100%{transform:translateY(0); opacity:1} }
  .modal-up { animation: modal-up 0.32s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }

  /* Modal float center */
  @keyframes modal-float { 0%{transform:scale(0.88) translateY(16px); opacity:0} 100%{transform:scale(1) translateY(0); opacity:1} }
  .modal-float { animation: modal-float 0.28s cubic-bezier(0.34,1.2,0.64,1) forwards; }

  /* Nav icon active pop */
  @keyframes nav-icon-in { 0%{transform:scale(0.8); opacity:0.4} 60%{transform:scale(1.15)} 100%{transform:scale(1); opacity:1} }
  @keyframes nav-label-in { 0%{opacity:1; -webkit-clip-path:inset(0 100% 0 0); clip-path:inset(0 100% 0 0)} 100%{opacity:1; -webkit-clip-path:inset(0 0% 0 0); clip-path:inset(0 0% 0 0)} }
  .nav-icon-pop { animation: nav-icon-pop 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }

  /* Skeleton */
  @keyframes skeleton-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.75} }
  .skeleton { animation: skeleton-pulse 1.4s ease-in-out infinite; }

  /* Toast */
  @keyframes toast-in { 0%{transform:translateX(-50%) translateY(100px);opacity:0} 20%{transform:translateX(-50%) translateY(0);opacity:1} 80%{transform:translateX(-50%) translateY(0);opacity:1} 100%{transform:translateX(-50%) translateY(100px);opacity:0} }
  @keyframes toast-slide-up { from{opacity:0;transform:translateX(-50%) translateY(16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes swipe-hint { 0%{transform:translateX(0)} 30%{transform:translateX(-55px)} 60%{transform:translateX(-10px)} 80%{transform:translateX(-20px)} 100%{transform:translateX(0)} }
  .swipe-hint-anim { animation: swipe-hint 0.9s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
  .toast { animation: toast-in 3s ease forwards; }

  /* Dark mode ripple */
  @keyframes dark-ripple-expand { 0%{transform:scale(0);opacity:0.9} 100%{transform:scale(1);opacity:0} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes nav-pop { 0%{transform:translateY(-50%) scale(0.7)} 60%{transform:translateY(-50%) scale(1.1)} 100%{transform:translateY(-50%) scale(1)} }
  .ge-indicator-active { animation: nav-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
  @keyframes count-up { 0%{opacity:0;transform:translateY(6px)} 100%{opacity:1;transform:translateY(0)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  .shimmer-bar { background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.4) 50%, transparent 75%); background-size: 200% 100%; animation: shimmer 2s infinite linear; }
  @keyframes confetti-fall { 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(60px) rotate(720deg);opacity:0} }
  .confetti-piece { position:absolute; width:6px; height:6px; border-radius:1px; animation:confetti-fall 0.8s ease-out forwards; pointer-events:none; }
  @keyframes theme-flash { 0%{filter:brightness(1)} 30%{filter:brightness(1.08)} 100%{filter:brightness(1)} }
  .theme-flash { animation: theme-flash 0.45s ease forwards; }

  /* FAB pulse ring */
  @keyframes fab-ring { 0%{box-shadow:0 0 0 0 rgba(var(--fab-color),0.5)} 70%{box-shadow:0 0 0 10px rgba(var(--fab-color),0)} 100%{box-shadow:0 0 0 0 rgba(var(--fab-color),0)} }

  /* Number count-up flicker */
  @keyframes num-pop { 0%{transform:scale(1)} 40%{transform:scale(1.06)} 100%{transform:scale(1)} }
  .num-pop { animation: num-pop 0.25s ease forwards; }

  /* Slide in from right (form) */
  @keyframes slide-in-r { 0%{opacity:0; transform:translateX(18px)} 100%{opacity:1; transform:translateX(0)} }
  .slide-in { animation: slide-in-r 0.22s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }

  /* Bounce in (savings goal bar) */
  @keyframes bar-fill { 0%{width:0%} 100%{width:var(--bar-w)} }

  /* FAB tap bounce */
  .fab-btn { transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s; }
  .fab-btn:active { transform: scale(0.88) !important; }

  /* Swipe row */
  .swipe-row { transition: transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94); touch-action: pan-y; }
  .swipe-row.dragging { transition: none; }
  @keyframes row-delete { 0%{opacity:1;max-height:80px;margin-bottom:8px} 100%{opacity:0;max-height:0;margin-bottom:0} }
  .row-deleting { animation: row-delete 0.3s ease forwards; overflow:hidden; }

  /* Budget bar animated */
  @keyframes budget-fill { 0%{width:0%} 100%{width:var(--bw)} }
  .budget-bar { animation: budget-fill 0.9s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }

  /* Empty state pulse */
  @keyframes empty-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  .empty-float { animation: empty-float 3s ease-in-out infinite; }
  @keyframes fab-item-in { from{opacity:0;transform:translateY(12px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }

  /* Share copy flash */
  @keyframes copy-flash { 0%{transform:scale(1)} 40%{transform:scale(0.95)} 100%{transform:scale(1)} }
  .copy-flash { animation: copy-flash 0.2s ease; }
  /* Skeleton */
  @keyframes sk-shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  .sk { border-radius:12px; background:linear-gradient(90deg,rgba(128,128,128,0.12) 25%,rgba(128,128,128,0.22) 50%,rgba(128,128,128,0.12) 75%); background-size:800px 100%; animation:sk-shimmer 1.4s infinite linear; }
`;

const THEME_LABELS = { green:"themeGreen", blue:"themeBlue", purple:"themePurple", rose:"themeRose", orange:"themeOrange", teal:"themeTeal" };

// ── Built-in Calculator ───────────────────────────────────────────────────────
function Calculator({ onUse, onClose, T, themeAccent, themePrimary, dark }) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(true);

  const press = (val) => {
    if (val === "C") { setDisplay("0"); setPrev(null); setOp(null); setFresh(true); return; }
    if (val === "⌫") { setDisplay(d => d.length > 1 ? d.slice(0,-1) : "0"); return; }
    if (val === "%") { setDisplay(d => String(parseFloat(d) / 100)); return; }
    if (["+","-","×","÷"].includes(val)) {
      setPrev(parseFloat(display)); setOp(val); setFresh(true); return;
    }
    if (val === "=") {
      if (prev === null || !op) return;
      const a = prev, b = parseFloat(display);
      let res = op==="+" ? a+b : op==="-" ? a-b : op==="×" ? a*b : b!==0 ? a/b : 0;
      // round floating point
      res = Math.round(res * 1e10) / 1e10;
      setDisplay(String(res)); setPrev(null); setOp(null); setFresh(true); return;
    }
    if (val === "." && display.includes(".")) return;
    setDisplay(d => {
      if (fresh || d === "0") { setFresh(false); return val === "." ? "0." : val; }
      return d.length < 12 ? d + val : d;
    });
  };

  const fmt = (s) => {
    const n = parseFloat(s);
    if (isNaN(n)) return s;
    if (s.endsWith(".") || s.endsWith(".0")) return s;
    return n.toLocaleString("id-ID", { maximumFractionDigits: 6 });
  };

  const rows = [
    ["C", "⌫", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  const isOp = v => ["+","-","×","÷"].includes(v);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:9000, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:T.card, borderRadius:"24px 24px 0 0", width:"100%", maxWidth:420, paddingBottom:"0px" }} onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div style={{ width:36, height:4, background:T.cardBorder, borderRadius:99, margin:"12px auto 0" }}/>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px 4px" }}>
          <p style={{ fontSize:14, fontWeight:800, color:T.text }}>Kalkulator</p>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => { onUse(parseFloat(display)); onClose(); }}
              style={{ padding:"7px 16px", borderRadius:50, border:"none", cursor:"pointer", background:`linear-gradient(135deg,${themeAccent},${themePrimary})`, color:"white", fontSize:12, fontWeight:800, fontFamily:"inherit" }}>
              Pakai angka ini
            </button>
            <button onClick={onClose} style={{ ...IBN, padding:4 }}>
              <X size={18} color={T.textSub}/>
            </button>
          </div>
        </div>
        {/* Display */}
        <div style={{ padding:"8px 20px 16px", textAlign:"right" }}>
          {op && prev !== null && <p style={{ fontSize:12, color:T.textSub, marginBottom:2 }}>{prev.toLocaleString("id-ID")} {op}</p>}
          <p style={{ fontSize:42, fontWeight:900, color:T.text, lineHeight:1, letterSpacing:-1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{fmt(display)}</p>
        </div>
        {/* Buttons */}
        <div style={{ padding:"0 16px 16px", display:"flex", flexDirection:"column", gap:8 }}>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display:"flex", gap:8 }}>
              {row.map(v => (
                <button key={v} onClick={() => press(v)}
                  style={{ flex: v==="0" ? 2 : 1, padding:"18px 0", borderRadius:16, border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:800, fontSize:18, transition:"transform 0.1s, background 0.1s",
                    background: v==="=" ? `linear-gradient(135deg,${themeAccent},${themePrimary})` : isOp(v) || v==="%" ? dark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.08)" : v==="C"||v==="⌫" ? "rgba(248,113,113,0.15)" : T.card2,
                    color: v==="=" ? "white" : isOp(v)||v==="%" ? themeAccent : v==="C"||v==="⌫" ? "#f87171" : T.text,
                  }}
                  onPointerDown={e => e.currentTarget.style.transform="scale(0.92)"}
                  onPointerUp={e => e.currentTarget.style.transform="scale(1)"}
                >
                  {v}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonDashboard({ dark }) {
  const bg = dark ? "#0a0a0a" : "#f5f4f0";
  const card = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const sk = { className: "sk" };
  return (
    <div style={{ minHeight:"100dvh", background:bg, paddingTop:"calc(env(safe-area-inset-top) + 64px)", paddingBottom:90, paddingLeft:16, paddingRight:16, boxSizing:"border-box" }}>
      {/* Header */}
      <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, background:bg, paddingTop:"calc(env(safe-area-inset-top) + 10px)", paddingBottom:10, paddingLeft:16, paddingRight:16, boxSizing:"border-box", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div {...sk} style={{ width:60, height:10, marginBottom:6 }}/>
          <div {...sk} style={{ width:120, height:20 }}/>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <div {...sk} style={{ width:34, height:34, borderRadius:"50%" }}/>
          <div {...sk} style={{ width:34, height:34, borderRadius:"50%" }}/>
          <div {...sk} style={{ width:38, height:38, borderRadius:"50%" }}/>
        </div>
      </div>
      {/* Balance card */}
      <div style={{ background:card, borderRadius:20, padding:"20px 20px", marginBottom:12 }}>
        <div {...sk} style={{ width:80, height:12, marginBottom:10 }}/>
        <div {...sk} style={{ width:160, height:36, marginBottom:16 }}/>
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ flex:1, background:card, borderRadius:14, padding:14 }}>
            <div {...sk} style={{ width:50, height:10, marginBottom:8 }}/>
            <div {...sk} style={{ width:90, height:20 }}/>
          </div>
          <div style={{ flex:1, background:card, borderRadius:14, padding:14 }}>
            <div {...sk} style={{ width:50, height:10, marginBottom:8 }}/>
            <div {...sk} style={{ width:90, height:20 }}/>
          </div>
        </div>
      </div>
      {/* Donut area */}
      <div style={{ background:card, borderRadius:20, padding:20, marginBottom:12, display:"flex", alignItems:"center", gap:16 }}>
        <div {...sk} style={{ width:90, height:90, borderRadius:"50%", flexShrink:0 }}/>
        <div style={{ flex:1 }}>
          {[80,60,70].map((w,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:i<2?10:0 }}>
              <div {...sk} style={{ width:10, height:10, borderRadius:"50%", flexShrink:0 }}/>
              <div {...sk} style={{ flex:1, height:10 }}/>
              <div {...sk} style={{ width:w*0.5, height:10 }}/>
            </div>
          ))}
        </div>
      </div>
      {/* Recent transactions */}
      <div style={{ background:card, borderRadius:20, padding:20 }}>
        <div {...sk} style={{ width:120, height:14, marginBottom:16 }}/>
        {[1,2,3].map(i => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginBottom: i<3?16:0 }}>
            <div {...sk} style={{ width:40, height:40, borderRadius:12, flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div {...sk} style={{ width:"60%", height:12, marginBottom:6 }}/>
              <div {...sk} style={{ width:"40%", height:10 }}/>
            </div>
            <div {...sk} style={{ width:60, height:14 }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [showFabMenu, setShowFabMenu] = useState(false);
  const fabPressTimer = useRef(null);
  const tabScrollPos = useRef({});
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("gm_lang") || "id"; } catch { return "id"; }
  });
  useEffect(() => { try { localStorage.setItem("gm_lang", lang); } catch {} }, [lang]);
  const L = LANG[lang] || LANG.id;
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = e => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  const [darkOverride, setDarkOverride] = useState(() => {
    try {
      const v = localStorage.getItem("gm_dark_override");
      if (v === "true") return true;
      if (v === "false") return false;
      return null; // null = ikut sistem
    } catch { return null; }
  });
  const [followSystem, setFollowSystem] = useState(() => {
    try {
      const saved = localStorage.getItem("gm_follow_system");
      if (saved !== null) return saved === "1";
      return false; // default: manual, tidak ikut sistem
    } catch { return false; }
  });
  const [darkRipple, setDarkRipple] = useState(null); // {x, y, toD ark}
  const [navbarOffset, setNavbarOffset] = useState(() => { try { return parseInt(localStorage.getItem("gm_navbar_offset")||"5"); } catch { return 5; } });
  const darkToggleRef = useRef(null);
  const settingsToggleRef = useRef(null);
  const dark = followSystem ? systemDark : (darkOverride !== null ? darkOverride : systemDark);
  const [themePresetId, setThemePresetId] = useState(() => {
    try { return localStorage.getItem("gm_theme_preset") || "rose"; } catch { return "rose"; }
  });
  const [customPrimary, setCustomPrimary] = useState(() => {
    try { return localStorage.getItem("gm_custom_primary") || "#881337"; } catch { return "#166534"; }
  });
  const [customAccent, setCustomAccent] = useState(() => {
    try { return localStorage.getItem("gm_custom_accent") || "#fb7185"; } catch { return "#4ade80"; }
  });
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [themeChanging, setThemeChanging] = useState(false);
  const triggerThemeChange = (fn) => {
    setThemeChanging(true);
    fn();
    setTimeout(() => setThemeChanging(false), 500);
  };

  const activePreset = THEME_PRESETS.find(p => p.id === themePresetId) || THEME_PRESETS[0];
  const themePrimary = themePresetId === "custom" ? customPrimary : activePreset.primary;
  const themeAccent  = themePresetId === "custom" ? customAccent  : activePreset.accent;
  const T = buildTheme(themePrimary, themeAccent, dark);
  const TP  = dark ? lighten(themePrimary,0.45) : themePrimary;
  const CS  = { background:T.card, border:`1px solid ${T.cardBorder}`, boxShadow:`0 1px 4px ${T.cardShadow}` };
  const CSN = { background:T.card, border:`1px solid ${T.cardBorder}` };
  const IBN = { background:"none", border:"none", cursor:"pointer" };

  // Compute statusbar color per tab
  const statusBarColor = useMemo(() => {
    if (tab === "date") return dark ? "#7f1d3d" : "#9d174d";
    if (tab === "dashboard") return dark ? "rgba(10,10,10,0)" : "rgba(0,0,0,0)"; // transparent for frosted
    return dark ? darken(themePrimary, 0.3) : themePrimary;
  }, [tab, dark, themePrimary]);

  useEffect(() => {
    const metas = [
      { name:"viewport", content:"width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" },
      { name:"apple-mobile-web-app-capable", content:"yes" },
      { name:"apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name:"apple-mobile-web-app-title", content:"Meowlett" },
      { name:"mobile-web-app-capable", content:"yes" },
      { name:"theme-color", content: tab === "date" ? (dark ? "#7f1d3d" : "#9d174d") : (tab === "dashboard" ? (dark ? "#0a0a0a" : lighten(themePrimary, 0.3)) : (dark ? darken(themePrimary, 0.3) : themePrimary)) },
    ];
    const added = [];
    metas.forEach(({ name, content }) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.name = name; document.head.appendChild(el); added.push(el); }
      el.content = content;
    });
    return () => added.forEach(el => el.remove());
  }, [dark, themePrimary, tab]);

  const [categories, setCategories] = useState(() => {
    try {
      const s = localStorage.getItem("gm_categories");
      return s ? JSON.parse(s) : DEFAULT_CATEGORIES;
    } catch { return DEFAULT_CATEGORIES; }
  });
  const _d = (daysAgo) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); return d.toISOString().split("T")[0]; };
  const DEMO_DATA = [
    { id:"d1",  date:_d(0),  amount:32000,  category:"food",          description:"Sarapan nasi uduk",       location:"", note:"" },
    { id:"d2",  date:_d(0),  amount:15000,  category:"transport",     description:"Ojol ke kantor",          location:"", note:"" },
    { id:"d3",  date:_d(1),  amount:45000,  category:"food",          description:"Makan siang ayam geprek", location:"", note:"" },
    { id:"d4",  date:_d(2),  amount:58000,  category:"food",          description:"Kopi Kenangan + snack",   location:"", note:"" },
    { id:"d5",  date:_d(2),  amount:189000, category:"shopping",      description:"Skincare Wardah",         location:"", note:"" },
    { id:"d6",  date:_d(3),  amount:75000,  category:"entertainment", description:"Nonton Bioskop",          location:"", note:"" },
    { id:"d7",  date:_d(5),  amount:280000, category:"date",          description:"Nonton + makan malam",   location:"", note:"" },
    { id:"d8",  date:_d(8),  amount:1163000,category:"bills",         description:"Angsuran motor",          location:"", note:"" },
    { id:"d9",  date:_d(8),  amount:54990,  category:"entertainment", description:"Spotify Premium",         location:"", note:"" },
    { id:"d10", date:_d(9),  amount:36000,  category:"food",          description:"Mie ayam + es teh",       location:"", note:"" },
    { id:"d11", date:_d(10), amount:145000, category:"health",        description:"Beli vitamin C",          location:"", note:"" },
    { id:"d12", date:_d(12), amount:450000, category:"bills",         description:"Bayar kos bulan ini",     location:"", note:"" },
    { id:"d13", date:_d(13), amount:85000,  category:"food",          description:"Makan malam shabu",       location:"", note:"" },
    { id:"d14", date:_d(14), amount:350000, category:"date",          description:"Anniversary dinner",      location:"", note:"" },
    { id:"d15", date:_d(16), amount:200000, category:"shopping",      description:"Shopee haul bulanan",     location:"", note:"" },
    { id:"d16", date:_d(18), amount:188000, category:"bills",         description:"Token listrik",           location:"", note:"" },
    { id:"d17", date:_d(20), amount:55000,  category:"food",          description:"Lunch set Hokben",        location:"", note:"" },
    { id:"d22", date:_d(22), amount:99000,  category:"entertainment", description:"Netflix 1 bulan",         location:"", note:"" },
    { id:"d23", date:_d(24), amount:220000, category:"shopping",      description:"Sepatu olahraga",         location:"", note:"" },
    { id:"d24", date:_d(32), amount:1163000,category:"bills",         description:"Angsuran motor",          location:"", note:"" },
    { id:"d25", date:_d(33), amount:54990,  category:"entertainment", description:"Spotify Premium",         location:"", note:"" },
    { id:"d26", date:_d(34), amount:450000, category:"bills",         description:"Bayar kos",               location:"", note:"" },
    { id:"d27", date:_d(36), amount:95000,  category:"food",          description:"Makan siang kantor",      location:"", note:"" },
    { id:"d28", date:_d(37), amount:175000, category:"bills",         description:"Tagihan internet",        location:"", note:"" },
    { id:"d29", date:_d(38), amount:260000, category:"shopping",      description:"Baju kondangan",          location:"", note:"" },
    { id:"d30", date:_d(40), amount:65000,  category:"health",        description:"Suplemen multivitamin",   location:"", note:"" },
    { id:"d31", date:_d(41), amount:310000, category:"date",          description:"Makan malam & bioskop",   location:"", note:"" },
    { id:"d32", date:_d(45), amount:185000, category:"bills",         description:"Token listrik",           location:"", note:"" },
    { id:"d33", date:_d(47), amount:340000, category:"shopping",      description:"Kosmetik Sephora",        location:"", note:"" },
    { id:"d34", date:_d(50), amount:75000,  category:"health",        description:"Obat flu & batuk",        location:"", note:"" },
    { id:"d35", date:_d(63), amount:1163000,category:"bills",         description:"Angsuran motor",          location:"", note:"" },
    { id:"d36", date:_d(64), amount:450000, category:"bills",         description:"Bayar kos",               location:"", note:"" },
    { id:"d37", date:_d(66), amount:54990,  category:"entertainment", description:"Spotify Premium",         location:"", note:"" },
    { id:"d38", date:_d(70), amount:195000, category:"shopping",      description:"Shopee haul",             location:"", note:"" },
    { id:"d39", date:_d(72), amount:55000,  category:"health",        description:"Vitamin & suplemen",      location:"", note:"" },
    { id:"d40", date:_d(74), amount:250000, category:"date",          description:"Piknik & makan",          location:"", note:"" },
    { id:"d41", date:_d(76), amount:165000, category:"bills",         description:"Token listrik",           location:"", note:"" },
    { id:"d42", date:_d(80), amount:310000, category:"shopping",      description:"Baju & celana",           location:"", note:"" },
    { id:"d43", date:_d(84), amount:125000, category:"food",          description:"Makan keluarga",          location:"", note:"" },
    { id:"d44", date:_d(93), amount:1163000,category:"bills",         description:"Angsuran motor",          location:"", note:"" },
    { id:"d45", date:_d(94), amount:450000, category:"bills",         description:"Bayar kos",               location:"", note:"" },
    { id:"d46", date:_d(95), amount:175000, category:"bills",         description:"Tagihan internet",        location:"", note:"" },
    { id:"d47", date:_d(97), amount:54990,  category:"entertainment", description:"Spotify Premium",         location:"", note:"" },
    { id:"d48", date:_d(100),amount:145000, category:"bills",         description:"Token listrik",           location:"", note:"" },
    { id:"d49", date:_d(102),amount:280000, category:"shopping",      description:"Belanja bulanan",         location:"", note:"" },
    { id:"d50", date:_d(104),amount:95000,  category:"food",          description:"Makan bareng teman",      location:"", note:"" },
  ];
  const [transactions, setTransactions] = useState(() => {
    try {
      const s = localStorage.getItem("gm_transactions_clean");
      const parsed = s ? JSON.parse(s) : null;
      return (parsed && parsed.length > 0) ? parsed : [];
    } catch { return []; }
  });
  useEffect(() => {
    if (transactions.length === 0) {
      loadFromIDB().then(data => {
        if (data.length > 0) {
          setTransactions(data);
          try { localStorage.setItem("gm_transactions_clean", JSON.stringify(data)); } catch {}
        }
      });
    }
  }, []);
  const [income, setIncome] = useState(() => {
    try {
      const s = localStorage.getItem("gm_income");
      const n = s ? Number(s) : 0;
      return n > 0 ? n : 5000000;
    } catch { return 5000000; }
  });
  const [savingsGoal, setSavingsGoal] = useState(() => {
    try {
      const s = localStorage.getItem("gm_savings");
      return s ? Number(s) : 0;
    } catch { return 0; }
  });
  const [recentCount, setRecentCount] = useState(5);
  const [showForm, setShowForm] = useState(false);

  // Smooth sliding indicator — pure math, no getBoundingClientRect drift
  useEffect(() => {
    const ind = document.getElementById("ge-indicator");
    if (!ind) return;
    const navItems = ["dashboard","transactions","report","date"];
    const btnIdx = navItems.indexOf(tab);
    if (btnIdx === -1 || showForm) { ind.style.opacity = "0"; return; }
    const PAD = 7, BTN = 60, IND_HALF = 23;
    const left = PAD + btnIdx * BTN + (BTN / 2) - IND_HALF;
    const isFirst = !ind.dataset.init;
    if (isFirst) {
      ind.style.transition = "none";
      ind.style.left = left + "px";
      ind.style.opacity = "1";
      ind.dataset.init = "1";
      requestAnimationFrame(() => {
        ind.style.transition = "left 0.4s cubic-bezier(0.34,1.15,0.64,1)";
      });
    } else {
      ind.style.transition = "left 0.4s cubic-bezier(0.34,1.15,0.64,1)";
      ind.style.left = left + "px";
      ind.style.opacity = "1";
      ind.classList.remove("ge-indicator-active");
      void ind.offsetWidth;
      ind.classList.add("ge-indicator-active");
    }
  }, [tab, showForm]);

  const [editItem, setEditItem] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState("monthly");
  const [filterCat, setFilterCat] = useState("all");
  const [sortOrder, setSortOrder] = useState("date-desc"); // new sort state
  const [showCalc, setShowCalc] = useState(false); // calculator modal
  const [form, setForm] = useState({ date: today(), amount: "", category: "food", description: "", location: "", note: "" });
  const [editIncome, setEditIncome] = useState(false);
  const headerRef = useRef(null);
  const sharedHeaderRef = useRef(null);
  const balanceCardRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(185);
  useEffect(() => {
    const update = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
      if (sharedHeaderRef.current) setHeaderHeight(sharedHeaderRef.current.offsetHeight);
    };
    update();
    const t1 = setTimeout(update, 100);
    const t2 = setTimeout(update, 500);
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("resize", update); clearTimeout(t1); clearTimeout(t2); };
  }, [tab]);

  // Persist data to localStorage (iOS Safari compatible)
  useEffect(() => {
    try { localStorage.setItem("gm_categories", JSON.stringify(categories)); } catch {}
  }, [categories]);
  useEffect(() => {
    try { localStorage.setItem("gm_transactions_clean", JSON.stringify(transactions)); } catch {}
    saveToIDB(transactions);
  }, [transactions]);
  useEffect(() => {
    try { localStorage.setItem("gm_income", String(income)); } catch {}
  }, [income]);
  useEffect(() => {
    try { localStorage.setItem("gm_savings", String(savingsGoal)); } catch {}
  }, [savingsGoal]);
  useEffect(() => {
    try { localStorage.setItem("gm_theme_preset", themePresetId); } catch {}
  }, [themePresetId]);
  useEffect(() => {
    try { localStorage.setItem("gm_custom_primary", customPrimary); } catch {}
  }, [customPrimary]);
  useEffect(() => {
    try { localStorage.setItem("gm_custom_accent", customAccent); } catch {}
  }, [customAccent]);
  const [userName, setUserName] = useState(() => {
    try { return localStorage.getItem("gm_username") || ""; } catch { return ""; }
  });
  useEffect(() => {
    try { localStorage.setItem("gm_username", userName); } catch {}
  }, [userName]);

  // Onboarding — show once on first launch
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { if(localStorage.getItem("gm_onboarded")) return false; if(sessionStorage.getItem("gm_onboarded_session")) return false; return true; } catch { return false; }
  });
  const [onboardStep, setOnboardStep] = useState(0);
  const [onboardName, setOnboardName] = useState("");
  const [onboardIncome, setOnboardIncome] = useState("");
  const [onboardIncomeDisplay, setOnboardIncomeDisplay] = useState("");
  const finishOnboarding = () => {
    if (onboardName.trim()) setUserName(onboardName.trim());
    if (onboardIncome) setIncome(Number(onboardIncome) || 0);
    try { localStorage.setItem("gm_onboarded","1"); sessionStorage.setItem("gm_onboarded_session","1"); } catch {}
    setShowOnboarding(false);
  };

  // Weekly summary notif
  const [weeklyNotif, setWeeklyNotif] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gm_weekly_notif") || "false"); } catch { return false; }
  });
  const [weeklyNotifDay, setWeeklyNotifDay] = useState(() => {
    try { return localStorage.getItem("gm_weekly_notif_day") || "0"; } catch { return "0"; }
  });
  useEffect(() => {
    try { localStorage.setItem("gm_weekly_notif", JSON.stringify(weeklyNotif)); } catch {}
  }, [weeklyNotif]);
  useEffect(() => {
    try { localStorage.setItem("gm_weekly_notif_day", weeklyNotifDay); } catch {}
  }, [weeklyNotifDay]);
  const [editSavings, setEditSavings] = useState(false);
  const [tempIncome, setTempIncome] = useState(income);
  const [tempIncomeDisplay, setTempIncomeDisplay] = useState(income ? income.toLocaleString("id-ID") : "");
  const [incomeAdj, setIncomeAdj] = useState("");
  const [incomeAdjDisplay, setIncomeAdjDisplay] = useState("");
  const [incomeTab, setIncomeTab] = useState("tambah");
  const [tempSavings, setTempSavings] = useState(savingsGoal);
  const [showCatManager, setShowCatManager] = useState(false);
  const [showBudgetLimit, setShowBudgetLimit] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [catForm, setCatForm] = useState({ label: "", icon: "package", color: "#94a3b8" });
  const [editCatKey, setEditCatKey] = useState(null);
  const [reportDate, setReportDate] = useState(today());
  const [showDataModal, setShowDataModal] = useState(false);
  const [tabScrolled, setTabScrolled] = useState(false);

  const [notifEnabled, setNotifEnabled] = useState(() => {
    try { return localStorage.getItem("gm_notif") === "1"; } catch { return false; }
  });
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [tempName, setTempName] = useState("");
  const [toast, setToast] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  // Skeleton
  const [loaded, setLoaded] = useState(true);

  // Global keyboard tracking — reliable for iOS PWA
  const [kbHeight, setKbHeight] = useState(0);

  // Hide splash immediately when React mounts, show skeleton instead
  const [appReady, setAppReady] = useState(false);
  useEffect(() => {
    if (window.__hideSplash) window.__hideSplash();
    const t = setTimeout(() => setAppReady(true), 400);
    return () => clearTimeout(t);
  }, []);

  const [vpOffsetTop, setVpOffsetTop] = useState(0);
  useEffect(() => {
    if (!window.visualViewport) return;
    const measure = () => {
      const vv = window.visualViewport;
      const kb = window.innerHeight - vv.height - vv.offsetTop;
      const kbVal = kb > 50 ? Math.round(kb) : 0;
      setKbHeight(kbVal);
      setVpOffsetTop(vv.offsetTop);
      const sheet = document.getElementById("form-sheet");
      if (sheet) sheet.style.paddingBottom = kbVal > 0 ? `${kbVal}px` : "0px";
      // also directly update onboarding container if visible
      const ob = document.getElementById("onboarding-container");
      if (ob) {
        ob.style.justifyContent = kbVal > 0 ? "flex-end" : "center";
        ob.style.paddingBottom = kbVal > 0 ? `${kbVal}px` : "40px";
      }
    };
    const onResize = () => {
      measure();
      setTimeout(measure, 100);
      setTimeout(measure, 300);
    };
    window.visualViewport.addEventListener("resize", onResize);
    window.visualViewport.addEventListener("scroll", onResize);
    return () => {
      window.visualViewport.removeEventListener("resize", onResize);
      window.visualViewport.removeEventListener("scroll", onResize);
    };
  }, []);
  useEffect(() => {
    document.body.style.background = T.bg;
    document.body.style.backgroundColor = T.bg;
    const root = document.getElementById("root");
    if (root) { root.style.background = T.bg; root.style.backgroundColor = T.bg; }
    const meta = document.querySelector("meta[name='theme-color']");
    if (meta) meta.setAttribute("content", T.bg);
  }, [T.bg]);

  // Offline
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true), off = () => setIsOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online",on); window.removeEventListener("offline",off); };
  }, []);

  // Install prompt
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  useEffect(() => {
    const h = (e) => { e.preventDefault(); setInstallPrompt(e); setShowInstallBanner(true); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  // Delete with undo
  const [confirmDelete, setConfirmDelete] = useState(null); // kept for compatibility
  const [customConfirm, setCustomConfirm] = useState(null); // {msg, onOk}
  const showConfirm = (msg, onOk) => setCustomConfirm({ msg, onOk });
  const deletedItemRef = useRef(null);
  const isRestoringRef = useRef(false);
  const undoTimerRef = useRef(null);
  const [undoToast, setUndoToast] = useState(null); // { id, label }

  // Swipe hint — show once
  const [swipeHintShown, setSwipeHintShown] = useState(false);
  const [swipeHintAnim, setSwipeHintAnim] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Recurring
  const [recurring, setRecurring] = useState(() => {
    try { const v = localStorage.getItem("gm_recurring"); return v ? JSON.parse(v) : []; } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem("gm_recurring", JSON.stringify(recurring)); } catch {} }, [recurring]);
  const [recurForm, setRecurForm] = useState({ description:"", amount:"", amountDisplay:"", category:"food", day:1, autoApply:true });
  const [editRecurId, setEditRecurId] = useState(null);
  const [showRecurPanel, setShowRecurPanel] = useState(false);

  // Budgets
  const [budgets, setBudgets] = useState(() => {
    try { const v = localStorage.getItem("gm_budgets"); return v ? JSON.parse(v) : {}; } catch { return {}; }
  });
  const [budgetsDisplay, setBudgetsDisplay] = useState(() => {
    try { const v = localStorage.getItem("gm_budgets"); const b = v ? JSON.parse(v) : {}; return Object.fromEntries(Object.entries(b).map(([k,val]) => [k, val ? Number(val).toLocaleString("id-ID") : ""])); } catch { return {}; }
  });
  useEffect(() => { try { localStorage.setItem("gm_budgets", JSON.stringify(budgets)); } catch {} }, [budgets]);

  // Overall monthly budget limit
  const [overallBudget, setOverallBudget] = useState(() => {
    try { const v = localStorage.getItem("gm_overall_budget"); return v ? Number(v) : 0; } catch { return 0; }
  });
  useEffect(() => { try { localStorage.setItem("gm_overall_budget", String(overallBudget)); } catch {} }, [overallBudget]);
  const [showOverallBudgetEdit, setShowOverallBudgetEdit] = useState(false);
  const [tempOverallBudget, setTempOverallBudget] = useState(0);
  const [tempOverallBudgetDisplay, setTempOverallBudgetDisplay] = useState("");
  const [showOverallBudgetModal, setShowOverallBudgetModal] = useState(false);

  // Savings Goals (custom progress targets)
  const [savingsGoals, setSavingsGoals] = useState(() => {
    try {
      const v = localStorage.getItem("gm_savings_goals");
      return v ? JSON.parse(v) : [];
    } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem("gm_savings_goals", JSON.stringify(savingsGoals)); } catch {} }, [savingsGoals]);
  const [editingGoal, setEditingGoal] = useState(null); // null or goal id
  const modalScrollY = useRef(0);
  const anyModal = showForm || editIncome || editingGoal !== null;
  useEffect(() => {
    if (anyModal) {
      modalScrollY.current = window.scrollY;
    } else {
      window.scrollTo(0, modalScrollY.current);
    }
  }, [anyModal]);



  const [quickAddGoalId, setQuickAddGoalId] = useState(null);
  const [quickAddAmt, setQuickAddAmt] = useState("");
  const [quickAddAmtDisplay, setQuickAddAmtDisplay] = useState("");
  const [activeCardId, setActiveCardId] = useState(null);
  const [activeDateId, setActiveDateId] = useState(null);
  const [goalForm, setGoalForm] = useState({ label:"", target:"", targetDisplay:"", saved:"", savedDisplay:"", color:"#60a5fa", icon:"piggy", deadline:"" });

  // Date wishlist
  const [dateWishlist, setDateWishlist] = useState(() => {
    try { const v = localStorage.getItem("gm_date_wishlist"); return v ? JSON.parse(v) : []; } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem("gm_date_wishlist", JSON.stringify(dateWishlist)); } catch {} }, [dateWishlist]);
  const [showWishlistForm, setShowWishlistForm] = useState(false);
  const [wishlistInput, setWishlistInput] = useState("");

  // Count-up balance
  const [displayBalance, setDisplayBalance] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState(() => {
    try { return localStorage.getItem("gm_profile_photo") || null; } catch { return null; }
  });
  const profileInputRef = useRef(null);
  useEffect(() => {
    try {
      if (profilePhoto) localStorage.setItem("gm_profile_photo", profilePhoto);
      else localStorage.removeItem("gm_profile_photo");
    } catch {}
  }, [profilePhoto]);
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfilePhoto(ev.target.result);
      showToast("ok:Foto profil diperbarui");
    };
    reader.readAsDataURL(file);
  };

  const [scrolled, setScrolled] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const pullStartY = useRef(null);
  const swipeStartX = useRef(null);
  const swipeStartY = useRef(null);
  const swipeBlocked = useRef(false); // true saat card sedang diswipe
  const lastScrollTop = useRef(0);
  const PULL_THRESHOLD = 120;

  // Freeze header as soon as balance card is touched by header (IntersectionObserver)
  useEffect(() => {
    if (!balanceCardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { setScrolled(!entry.isIntersecting); },
      { threshold: 0, rootMargin: `-${headerHeight || 60}px 0px 0px 0px` }
    );
    observer.observe(balanceCardRef.current);
    return () => observer.disconnect();
  }, [headerHeight]);

  useEffect(() => {
    if (tab === "dashboard") return;
    const onScroll = () => setTabScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tab]);

  const handlePullStart = (e) => {
    if (tab !== "dashboard") return;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY === 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  };
  const handlePullMove = (e) => {
    if (pullStartY.current === null || refreshing) return;
    const dy = e.touches[0].clientY - pullStartY.current;
    if (dy > 0) setPullY(Math.min(dy * 0.25, PULL_THRESHOLD + 10));
  };
  const handlePullEnd = () => {
    if (pullY >= PULL_THRESHOLD && !refreshing) {
      haptic();
      setRefreshing(true);
      setPullY(PULL_THRESHOLD * 0.6);
      setTimeout(() => {
        setRefreshing(false);
        setPullY(0);
        showToast("ok:Data diperbarui");
      }, 1200);
    } else {
      setPullY(0);
    }
    pullStartY.current = null;
  };
  const TAB_ORDER = ["dashboard", "transactions", "report", "date", "settings"];

  const toggleDark = useCallback((btnRef) => {
    const btn = btnRef?.current;
    const rect = btn ? btn.getBoundingClientRect() : null;
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const nextDark = darkOverride === null ? !systemDark : darkOverride === systemDark ? !darkOverride : !darkOverride;
    setDarkRipple({ x, y, toDark: nextDark });
    setTimeout(() => {
      setDarkOverride(d => {
        const next = d === null ? !systemDark : !d;
        try { localStorage.setItem("gm_dark_override", String(next)); } catch {}
        return next;
      });
      setTimeout(() => setDarkRipple(null), 400);
    }, 30);
  }, [darkOverride, systemDark]);

  const [tabAnim, setTabAnim] = useState(true);
  const changeTab = useCallback((newTab) => {
    setTabScrolled(false);
    haptic();
    const el = document.getElementById("root") || document.documentElement;
    // Save current scroll position
    tabScrollPos.current[tab] = el.scrollTop;
    // Restore scroll position for new tab
    const savedPos = tabScrollPos.current[newTab] || 0;
    el.scrollTo({ top: savedPos, behavior: "instant" });
    setActiveCardId(null);
    setTabAnim(false);
    requestAnimationFrame(() => {
      setTab(newTab);
      requestAnimationFrame(() => {
        setTabAnim(true);
        // Show swipe hint once when opening transactions tab
        if (newTab === "transactions" && !swipeHintShown) {
          setSwipeHintShown(true);
          setTimeout(() => setSwipeHintAnim(true), 600);
          setTimeout(() => setSwipeHintAnim(false), 2000);
        }
      });
    });
  }, [swipeHintShown]);

  // ── Kalkulasi derivatif (harus di atas useEffect yang memakainya) ──
  const now = today();
  const currentWeek = getWeek(now);
  const currentMonth = getMonth(now);
  const getCategory = (key) => categories[key] || { label: key, icon: "package", color: "#94a3b8" };

  const weekExpense = useMemo(() => {
    const d = new Date(); const startOfWeek = new Date(d); startOfWeek.setDate(d.getDate() - d.getDay() + 1);
    return transactions.filter(t => { const td = new Date(t.date); return td >= startOfWeek && td <= d; }).reduce((s,t) => s+t.amount, 0);
  }, [transactions]);

    const totalExpense = useMemo(() =>
    transactions.filter(t => getMonth(t.date) === currentMonth).reduce((s, t) => s + t.amount, 0),
    [transactions, currentMonth]);

  const balance = income - totalExpense;
  const monthlySave = Math.max(0, Math.min(balance, savingsGoal));
  const savePct = income > 0 ? Math.min(100, Math.round((monthlySave / income) * 100)) : 0;

  // Set balance directly - no animation (removed: was causing lag with 50fps interval)
  useEffect(() => {
    if (!loaded) return;
    setDisplayBalance(balance);
  }, [balance, loaded]);

  // Swipe tab gesture
  const handleSwipeStart = useCallback((e) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
  }, []);

  const handleSwipeEnd = useCallback((e) => {
    if (swipeStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - swipeStartY.current);
    swipeStartX.current = null;
    if (swipeBlocked.current) { swipeBlocked.current = false; return; }
    if (Math.abs(dx) < 60 || dy > 80) return;
    const TABS = ["dashboard","transactions","report","date","settings"];
    const cur = TABS.indexOf(tab);
    if (dx < 0 && cur < TABS.length-1) changeTab(TABS[cur+1]);
    else if (dx > 0 && cur > 0) changeTab(TABS[cur-1]);
  }, [tab, changeTab]);

  // Apply recurring transactions
  useEffect(() => {
    if (!loaded) return;
    const todayDate = today();
    const todayDay = new Date().getDate();
    recurring.forEach(r => {
      const shouldApply = r.autoApply !== false;
      if (!shouldApply) {
        // Send reminder notif for manual recurring items due today
        if (Number(r.day) === todayDay && notifEnabled) {
          sendLocalNotification(
            lang === "en" ? "Payment Reminder" : "Pengingat Tagihan",
            lang === "en" ? `Time to record: ${r.description} — ${formatRp(Number(r.amount))}` : `Waktunya catat: ${r.description} — ${formatRp(Number(r.amount))}`
          );
        }
        return;
      }
      const exists = transactions.some(t => t.description===r.description && t.date===todayDate && t.amount===Number(r.amount));
      if (Number(r.day)===todayDay && !exists) {
        setTransactions(prev => [...prev, { description:r.description, amount:Number(r.amount), category:r.category, date:todayDate, location:"Rutin", note:"Otomatis", id:Date.now()+Math.random() }]);
        // Notif for auto-applied
        if (notifEnabled) {
          sendLocalNotification(
            lang === "en" ? "Auto-recorded" : "Tercatat Otomatis",
            lang === "en" ? `${r.description} — ${formatRp(Number(r.amount))} recorded` : `${r.description} — ${formatRp(Number(r.amount))} dicatat`
          );
        }
      }
    });
  }, [loaded]);

  // Delete with undo
  const deleteTransaction = (id) => {
    haptic("warning");
    const item = transactions.find(t => t.id === id);
    if (!item) return;
    deletedItemRef.current = item;
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoToast({ id, label: item.description || item.category });
    undoTimerRef.current = setTimeout(() => {
      setUndoToast(null);
      deletedItemRef.current = null;
    }, 4000);
  };

  const undoDelete = () => {
    const item = deletedItemRef.current;
    if (!item) return;
    clearTimeout(undoTimerRef.current);
    deletedItemRef.current = null;
    setTransactions(prev => [...prev, item].sort((a,b) => new Date(b.date)-new Date(a.date)));
    setUndoToast(null);
    haptic("light");
  };

  // Delete confirm (legacy — unused now)
  const confirmDeleteFn = () => {
    haptic("error");
    setTransactions(prev => prev.filter(t => t.id !== confirmDelete));
    setConfirmDelete(null);
    showToast("del:"+L.txDeleted);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    let list = transactions;
    if (filterCat !== "all") list = list.filter(t => t.category === filterCat);
    if (filterPeriod === "daily") list = list.filter(t => t.date === now);
    else if (filterPeriod === "weekly") list = list.filter(t => getWeek(t.date) === currentWeek);
    else list = list.filter(t => getMonth(t.date) === currentMonth);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => t.description.toLowerCase().includes(q) || (t.location||"").toLowerCase().includes(q) || (t.note||"").toLowerCase().includes(q));
    }
    return list.sort((a, b) => {
      if (sortOrder === "date-asc")  return a.date.localeCompare(b.date);
      if (sortOrder === "amt-desc")  return b.amount - a.amount;
      if (sortOrder === "amt-asc")   return a.amount - b.amount;
      return b.date.localeCompare(a.date); // date-desc default
    });
  }, [transactions, filterPeriod, filterCat, now, currentWeek, currentMonth, searchQuery, sortOrder]);

  const dateExpense = useMemo(() =>
    transactions.filter(t => t.category === "date" && getMonth(t.date) === currentMonth).reduce((s, t) => s + t.amount, 0),
    [transactions, currentMonth]);

  const filteredTotal = filtered.reduce((s, t) => s + t.amount, 0);

  const catBreakdown = useMemo(() => {
    const m = transactions.filter(t => getMonth(t.date) === currentMonth);
    const map = {};
    m.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [transactions, currentMonth]);

  // Donut chart data
  const donutData = useMemo(() =>
    catBreakdown.map(([key, value]) => ({
      name: getCatLabel(getCategory(key), lang),
      value,
      color: getCategory(key).color
    })),
    [catBreakdown, categories]);

  const reportTxns = useMemo(() =>
    transactions.filter(t => t.date === reportDate).sort((a, b) => b.id - a.id),
    [transactions, reportDate]);

  const reportTotal = reportTxns.reduce((s, t) => s + t.amount, 0);
  const prevMonth = useMemo(() => {
    const d = new Date(currentMonth + "-01");
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  }, [currentMonth]);

  const monthCompareData = useMemo(() => {
    const cats = [...new Set(transactions.map(t => t.category))];
    return cats.map(key => {
      const cat = getCategory(key);
      const curr = transactions.filter(t => t.category === key && getMonth(t.date) === currentMonth).reduce((s, t) => s + t.amount, 0);
      const prev = transactions.filter(t => t.category === key && getMonth(t.date) === prevMonth).reduce((s, t) => s + t.amount, 0);
      if (curr === 0 && prev === 0) return null;
      return { name: getCatLabel(cat, lang), curr, prev, color: cat.color };
    }).filter(Boolean).sort((a,b) => b.curr - a.curr).slice(0, 6);
  }, [transactions, currentMonth, prevMonth, categories]);

  const monthInsights = useMemo(() => {
    const insights = [];
    const currTotal = transactions.filter(t => getMonth(t.date) === currentMonth).reduce((s,t) => s+t.amount, 0);
    const prevTotal = transactions.filter(t => getMonth(t.date) === prevMonth).reduce((s,t) => s+t.amount, 0);
    if (prevTotal > 0) {
      const pct = Math.round(((currTotal - prevTotal) / prevTotal) * 100);
      insights.push({ type: pct > 0 ? "up" : "down", text: `${pct > 0 ? L.insightMore : L.insightLess} ${Math.abs(pct)}% ${L.insightFrom}` });
    }
    // Gunakan nama lengkap dari categories, bukan nama terpotong dari chart
    const cats = [...new Set(transactions.map(t => t.category))];
    cats.forEach(key => {
      const cat = getCategory(key);
      const curr = transactions.filter(t => t.category === key && getMonth(t.date) === currentMonth).reduce((s,t) => s+t.amount, 0);
      const prev = transactions.filter(t => t.category === key && getMonth(t.date) === prevMonth).reduce((s,t) => s+t.amount, 0);
      if (prev > 0 && curr > 0) {
        const pct = Math.round(((curr - prev) / prev) * 100);
        if (Math.abs(pct) >= 20) insights.push({ type: pct > 0 ? "up" : "down", text: `${getCatLabel(cat, lang)} ${pct > 0 ? L.insightUp : L.insightDown} ${Math.abs(pct)}% ${L.insightFrom}` });
      }
    });
    return insights.slice(0, 4);
  }, [transactions, currentMonth, prevMonth, categories]);

  const weeklyTrend = useMemo(() => {
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i*7);
      const wk = getWeek(d.toISOString().split("T")[0]);
      const total = transactions.filter(t => getWeek(t.date)===wk).reduce((s,t) => s+t.amount, 0);
      weeks.push({ label:`W${8-i}`, total });
    }
    return weeks;
  }, [transactions]);

  // Sparkline: last 7 days spending per day
  const sparkline7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const total = transactions.filter(t => t.date === ds).reduce((s,t) => s+t.amount, 0);
      const dayLabel = d.toLocaleDateString("id-ID", { weekday:"short" });
      days.push({ ds, total, dayLabel });
    }
    return days;
  }, [transactions]);

  // End-of-month prediction based on daily average so far
  const monthPrediction = useMemo(() => {
    const d = new Date();
    const dayOfMonth = d.getDate();
    const daysInMonth = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
    if (dayOfMonth < 3 || totalExpense === 0) return null;
    const dailyAvg = totalExpense / dayOfMonth;
    const predicted = Math.round(dailyAvg * daysInMonth);
    return { predicted, dailyAvg, daysLeft: daysInMonth - dayOfMonth, daysInMonth };
  }, [totalExpense]);

  // Average monthly savings across last 3 months
  const avgMonthlySaved = useMemo(() => {
    const results = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      const m = d.toISOString().slice(0,7);
      const exp = transactions.filter(t => getMonth(t.date)===m).reduce((s,t)=>s+t.amount,0);
      results.push(exp);
    }
    const nonZero = results.filter(v => v > 0);
    if (nonZero.length === 0) return 0;
    // Use income if available; savings = income - expense
    const avgExp = nonZero.reduce((a,b)=>a+b,0)/nonZero.length;
    return Math.max(0, income - avgExp);
  }, [transactions, income]);

  // ── Streak: track daily app opens ──────────────────────────────
  const [streak, setStreak] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gm_streak") || '{"count":0,"lastDate":""}'); }
    catch { return { count: 0, lastDate: "" }; }
  });
  useEffect(() => {
    const todayStr = today();
    if (streak.lastDate === todayStr) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1;
    const newStreak = { count: newCount, lastDate: todayStr };
    setStreak(newStreak);
    try { localStorage.setItem("gm_streak", JSON.stringify(newStreak)); } catch {}
  }, []);

  // ── Weekly insight ──────────────────────────────────────────────
  const weeklyInsight = useMemo(() => {
    const todayStr = today();
    const d = new Date(todayStr);
    const dayOfWeek = d.getDay(); // 0=Sun
    const startThisWeek = new Date(d); startThisWeek.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const startLastWeek = new Date(startThisWeek); startLastWeek.setDate(startThisWeek.getDate() - 7);
    const endLastWeek = new Date(startThisWeek); endLastWeek.setDate(startThisWeek.getDate() - 1);
    const thisWeekStr = startThisWeek.toISOString().split("T")[0];
    const lastWeekStart = startLastWeek.toISOString().split("T")[0];
    const lastWeekEnd = endLastWeek.toISOString().split("T")[0];

    const thisWeekTxns = transactions.filter(t => t.date >= thisWeekStr && t.date <= todayStr);
    const lastWeekTxns = transactions.filter(t => t.date >= lastWeekStart && t.date <= lastWeekEnd);

    const thisTotal = thisWeekTxns.reduce((s,t) => s+t.amount, 0);
    const lastTotal = lastWeekTxns.reduce((s,t) => s+t.amount, 0);

    // Top category this week
    const catMap = {};
    thisWeekTxns.forEach(t => { catMap[t.category] = (catMap[t.category]||0) + t.amount; });
    const topCatEntry = Object.entries(catMap).sort((a,b)=>b[1]-a[1])[0];
    const topCat = topCatEntry ? categories[topCatEntry[0]] : null;

    return { thisTotal, lastTotal, diff: thisTotal - lastTotal, topCat, topCatAmt: topCatEntry?.[1] || 0, hasBoth: lastTotal > 0 };
  }, [transactions, categories]);

  // ── Category trend (multi-month line data) ──────────────────────
  const [catTrendView, setCatTrendView] = useState("bar"); // "bar" | "line"
  const catTrendData = useMemo(() => {
    // Last 4 months
    const months = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      months.push(d.toISOString().slice(0,7));
    }
    const catKeys = Object.keys(categories);
    // Line data: per category, one point per month
    const lineData = catKeys.map(key => {
      const cat = categories[key];
      return {
        key, label: getCatLabel(cat, lang), color: cat.color,
        data: months.map(m => ({
          month: new Date(m+"-01").toLocaleDateString(lang==="en"?"en-GB":"id-ID",{month:"short"}),
          value: transactions.filter(t => t.category===key && getMonth(t.date)===m).reduce((s,t)=>s+t.amount,0)
        }))
      };
    }).filter(d => d.data.some(p => p.value > 0));

    // Bar data: per month, each category as a group
    const barData = months.map(m => {
      const obj = { month: new Date(m+"-01").toLocaleDateString(lang==="en"?"en-GB":"id-ID",{month:"short"}) };
      catKeys.forEach(key => { obj[key] = transactions.filter(t => t.category===key && getMonth(t.date)===m).reduce((s,t)=>s+t.amount,0); });
      return obj;
    });

    return { lineData, barData, months, catKeys };
  }, [transactions, categories, lang]);

  const reportByCat = useMemo(() => {
    const map = {};
    reportTxns.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [reportTxns]);

  const recentTxns = useMemo(() =>
    [...transactions].sort((a, b) => b.id - a.id).slice(0, recentCount),
    [transactions, recentCount]);

  const submitForm = () => {
    if (!form.amount || !form.description) return;
    haptic("success");
    if (editItem) {
      setTransactions(prev => prev.map(t => t.id === editItem ? { ...form, id: editItem, amount: Number(form.amount) } : t));
      setEditItem(null);
      showToast("ok:"+L.txUpdated);
    } else {
      const newAmount = Number(form.amount);
      setTransactions(prev => {
        const updated = [...prev, { ...form, id: Date.now(), amount: newAmount }];
        // Cek budget warning setelah tambah
        const catKey = form.category;
        const limit = budgets[catKey] || 0;
        if (limit > 0 && !isRestoringRef.current) {
          const spent = updated.filter(t => t.category === catKey && t.date.startsWith(getMonth(form.date))).reduce((s,t) => s+t.amount, 0);
          if (spent >= limit) {
            setTimeout(() => showToast("warn:Budget " + (getCatLabel(categories[catKey], lang) || catKey) + " sudah melewati limit!"), 400);
          } else if (spent >= limit * 0.8) {
            setTimeout(() => showToast("warn:Budget " + (getCatLabel(categories[catKey], lang) || catKey) + " sudah " + Math.round(spent/limit*100) + "%!"), 400);
          }
        }
        return updated;
      });
      showToast("ok:"+L.txAdded);
    }
    setForm({ date: today(), amount: "", category: Object.keys(categories)[0] || "other", description: "", location: "", note: "" });
    setShowForm(false);
  };

  const startEdit = (t) => {
    const amtDisplay = t.amount ? Number(t.amount).toLocaleString("id-ID") : "";
    setForm({ date: t.date, amount: t.amount, amountDisplay: amtDisplay, category: t.category, description: t.description, location: t.location, note: t.note||"" });
    setEditItem(t.id);
    setShowForm(true);
  };

  // (deleteTransaction defined above with undo support)

  const saveCat = () => {
    if (!catForm.label.trim()) return;
    if (editCatKey) {
      setCategories(prev => ({ ...prev, [editCatKey]: { label: catForm.label, icon: catForm.icon, color: catForm.color } }));
      setEditCatKey(null);
    } else {
      const key = catForm.label.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
      setCategories(prev => ({ ...prev, [key]: { label: catForm.label, icon: catForm.icon, color: catForm.color } }));
    }
    setCatForm({ label: "", icon: "package", color: "#94a3b8" });
  };

  const startEditCat = (key) => {
    setEditCatKey(key);
    setCatForm({ label: categories[key].label, icon: categories[key].icon, color: categories[key].color });
  };

  const deleteCat = (key) => {
    if (Object.keys(categories).length <= 1) return;
    setCategories(prev => { const c = { ...prev }; delete c[key]; return c; });
  };

  const expensePct = income > 0 ? Math.min(100, Math.round((totalExpense / income) * 100)) : 0;

  const handleNotification = async () => {
    if (notifEnabled) {
      setNotifEnabled(false);
      try { localStorage.setItem("gm_notif", "0"); } catch {}
      showToast(L.toastReminderOff);
      return;
    }

    // Check if running as installed PWA on iOS
    const isStandalone = window.navigator.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;

    if (!isStandalone && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      showToast(L.toastAddHome);
      return;
    }

    if (!("Notification" in window)) {
      showToast("err:Browser tidak support notifikasi");
      return;
    }

    const perm = await requestNotificationPermission();
    if (perm === "granted") {
      setNotifEnabled(true);
      try { localStorage.setItem("gm_notif", "1"); } catch {}
      scheduleLocalReminder();
      await sendLocalNotification("Meowlett", lang === "en" ? "Reminder on! You'll be notified every day at 9 PM." : "Pengingat aktif! Kamu akan diingatkan setiap hari jam 9 malam.");
      showToast(L.toastReminderOn);
    } else if (perm === "denied") {
      showToast("err:Izin notifikasi ditolak");
    } else {
      showToast("err:Notifikasi tidak didukung");
    }
  };

  if (!appReady) return <SkeletonDashboard dark={dark} />;

  // Props bundle passed to all tab components
  const ctx = {
    T, dark, lang, L,
    balanceCardRef,
    CS, CSN, IBN, TP, currentMonth, getCategory, THEME_LABELS, LUCIDE_MAP, DEFAULT_CATEGORIES, showToast, showConfirm, isRestoringRef, budgetsDisplay, activeCardId, setActiveCardId, activeDateId, setActiveDateId, dateWishlist, setDateWishlist, showWishlistForm, setShowWishlistForm, wishlistInput, setWishlistInput, toggleDark, settingsToggleRef, darkToggleRef,
    tab, tabAnim, loaded, headerHeight,
    themeAccent, themePrimary, THEME_PRESETS,
    income, totalExpense, balance, savePct, monthlySave,
    transactions, categories,
    recentTxns, recentCount, setRecentCount,
    donutData, catBreakdown, sparkline7, monthPrediction, avgMonthlySaved,
    streak, weeklyInsight,
    savingsGoals, setSavingsGoals,
    overallBudget, budgets, setBudgets, setBudgetsDisplay,
    quickAddGoalId, setQuickAddGoalId,
    quickAddAmtDisplay, setQuickAddAmtDisplay, setQuickAddAmt,
    setEditingGoal, setGoalForm,
    setEditItem, setForm, setShowForm,
    editItem, form, showForm,
    setLang,
    setTempIncome, setTempIncomeDisplay,
    setIncomeAdj, setIncomeAdjDisplay, setEditIncome,
    changeTab,
    // modal vars
    kbHeight,
    showCalc, setShowCalc,
    submitForm,
    showOverallBudgetModal, setShowOverallBudgetModal,
    tempOverallBudget, setTempOverallBudget,
    tempOverallBudgetDisplay, setTempOverallBudgetDisplay,
    // transactions tab
    filtered, filteredTotal,
    filterPeriod, setFilterPeriod,
    filterCat, setFilterCat,
    sortOrder, setSortOrder,
    deleteTransaction, undoDelete, startEdit,
    recurForm, setRecurForm,
    recurring, setRecurring,
    showRecurPanel, setShowRecurPanel,
    editRecurId, setEditRecurId,
    // report tab
    reportTxns, reportTotal, reportByCat,
    reportDate, setReportDate,
    monthCompareData, monthInsights,
    catTrendData, weeklyTrend,
    prevMonth,
    showExportMenu, setShowExportMenu,
    exportCSV, exportPDFReport,
    // date tab
    themePresetId, setThemePresetId,
    customPrimary, setCustomPrimary,
    customAccent, setCustomAccent,
    showThemePicker, setShowThemePicker,
    dateExpense, triggerThemeChange,
    // settings tab
    weeklyNotif, weeklyNotifDay,
    setWeeklyNotif, setWeeklyNotifDay,
    userName, setUserName,
    showNameEdit, setShowNameEdit,
    tempName, setTempName,
    profilePhoto, profileInputRef, handleProfilePhotoChange,
    setCategories,
    catForm, setCatForm,
    editCatKey, setEditCatKey,
    showCatManager, setShowCatManager,
    showBudgetLimit, setShowBudgetLimit,
    setOverallBudget,
    setIncome,
    setTransactions,
    notifEnabled,
    showNotifModal, setShowNotifModal,
    showAppearanceModal, setShowAppearanceModal,
    showDataModal, setShowDataModal,
    navbarOffset, setNavbarOffset,
    followSystem, setFollowSystem,
    darkOverride, setDarkOverride,
    saveCat, startEditCat, deleteCat,
    handleNotification,
    ICON_OPTIONS, COLOR_OPTIONS,
  };

  return (
    <div className={`theme-transition${themeChanging ? " theme-flash" : ""}`} style={{ minHeight:"100dvh", background:T.bg, "--primary":themePrimary, "--accent":themeAccent }}>

      {/* Statusbar handled by shared fixed header */}

      <style>{STYLES}</style>

      {/* ── ONBOARDING ── */}
      {showOnboarding && (
        <div style={{ position:"fixed", inset:0, background:T.bg, zIndex:10000, display:"flex", flexDirection:"column", boxSizing:"border-box" }}>

          {/* Top area — kosong, tap bisa dismiss keyboard */}
          <div style={{ flex:1, minHeight:0 }} onClick={() => { if(document.activeElement) document.activeElement.blur(); }}/>

          {/* Bottom sheet content */}
          <div style={{ paddingLeft:24, paddingRight:24, paddingTop:28, paddingBottom: kbHeight > 0 ? kbHeight : 32, boxSizing:"border-box", transition:"padding-bottom 0.2s ease" }}>

            {/* Step dots */}
            <div style={{ display:"flex", gap:5, marginBottom:20 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ height:3, borderRadius:99, transition:"all 0.3s", width:i===onboardStep?24:6, background:i<=onboardStep?themeAccent:dark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)" }}/>
              ))}
            </div>

            {/* Step 0 — Welcome */}
            {onboardStep === 0 && (
              <div style={{ width:"100%", maxWidth:400 }}>
                <p style={{ fontSize:11, fontWeight:800, color:themeAccent, letterSpacing:1, margin:"0 0 6px" }}>{lang==="en" ? "STEP 1 / 4" : "LANGKAH 1 / 4"}</p>
                <p style={{ fontSize:28, fontWeight:900, color:T.text, margin:"0 0 4px", lineHeight:1.15 }}>{lang==="en" ? "Welcome to\nMeowlett" : "Selamat datang\ndi Meowlett"}</p>
                <p style={{ fontSize:13, color:T.textSub, margin:"0 0 20px", lineHeight:1.6 }}>{lang==="en"?"Track expenses, monitor your budget, and reach your financial goals.":"Catat pengeluaran, pantau budget,\ndan capai tujuan finansialmu."}</p>
                {/* Language picker */}
                <div style={{ display:"flex", gap:8, marginBottom:20 }}>
                  {[{code:"id", label:"ID  Indonesia"}, {code:"en", label:"EN  English"}].map(opt => {
                    const isActive = lang === opt.code;
                    return (
                      <button key={opt.code} onClick={() => { setLang(opt.code); try { localStorage.setItem("gm_lang", opt.code); } catch {} }}
                        style={{ flex:1, padding:"10px 0", borderRadius:12, border: isActive ? `2px solid ${themeAccent}` : `2px solid ${T.cardBorder}`, background: isActive ? themeAccent+"18" : T.card, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, color: isActive ? themeAccent : T.textSub, transition:"all 0.18s", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                        {opt.label}
                        {isActive && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={themeAccent} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setOnboardStep(1)} style={{ width:"100%", padding:16, borderRadius:16, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:15, fontWeight:800, background:`linear-gradient(135deg,${themeAccent},${themePrimary})`, color:"white" }}>
                  {lang==="en" ? "Start Setup →" : "Mulai Setup →"}
                </button>
              </div>
            )}

            {/* Step 1 — Nama */}
            {onboardStep === 1 && (
              <div style={{ width:"100%", maxWidth:400 }}>
                <p style={{ fontSize:11, fontWeight:800, color:themeAccent, letterSpacing:1, margin:"0 0 6px" }}>{lang==="en" ? "STEP 2 / 4" : "LANGKAH 2 / 4"}</p>
                <p style={{ fontSize:26, fontWeight:900, color:T.text, margin:"0 0 4px", lineHeight:1.15 }}>{lang==="en" ? "What's your\nname?" : "Siapa\nnamamu?"}</p>
                <p style={{ fontSize:13, color:T.textSub, margin:"0 0 16px" }}>{lang==="en" ? "So greetings feel more personal." : "Biar sapaan lebih personal."}</p>
                <input value={onboardName} onChange={e => setOnboardName(e.target.value)}
                  placeholder={lang==="en" ? "e.g. Virgie..." : "Contoh: Virgie..."} autoFocus
                  onFocus={() => { setTimeout(() => { if(window.visualViewport){ const kb=window.innerHeight-window.visualViewport.height-window.visualViewport.offsetTop; setKbHeight(kb>50?Math.round(kb):0); }},150); }}
                  style={{ width:"100%", background:T.card, border:`2px solid ${onboardName?themeAccent:T.cardBorder}`, borderRadius:14, padding:"14px 18px", color:T.text, fontSize:16, fontFamily:"inherit", outline:"none", marginBottom:12, transition:"border 0.2s", boxSizing:"border-box" }}/>
                <button onClick={() => setOnboardStep(2)} style={{ width:"100%", padding:15, borderRadius:14, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:800, background:`linear-gradient(135deg,${themeAccent},${themePrimary})`, color:"white", marginBottom:8 }}>
                  {lang==="en" ? "Next →" : "Lanjut →"}
                </button>
                <button onClick={() => setOnboardStep(2)} style={{ width:"100%", padding:10, borderRadius:12, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, background:"none", color:T.textSub }}>
                  {lang==="en" ? "Skip" : "Lewati"}
                </button>
              </div>
            )}

            {/* Step 2 — Pemasukan */}
            {onboardStep === 2 && (
              <div style={{ width:"100%", maxWidth:400 }}>
                <p style={{ fontSize:11, fontWeight:800, color:themeAccent, letterSpacing:1, margin:"0 0 6px" }}>{lang==="en" ? "STEP 3 / 4" : "LANGKAH 3 / 4"}</p>
                <p style={{ fontSize:26, fontWeight:900, color:T.text, margin:"0 0 4px", lineHeight:1.15 }}>{lang==="en" ? "Monthly\nincome?" : "Pemasukan\nbulan ini?"}</p>
                <p style={{ fontSize:13, color:T.textSub, margin:"0 0 16px" }}>{lang==="en"?"You can change this anytime.":"Bisa diubah kapan saja di Pengaturan."}</p>
                <div style={{ position:"relative", marginBottom:8 }}>
                  <span style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", fontSize:13, color:T.textSub, fontWeight:700, pointerEvents:"none" }}>Rp</span>
                  <input type="text" inputMode="numeric" value={onboardIncomeDisplay}
                    onChange={e => { const {display,raw}=parseRpInput(e.target.value); setOnboardIncomeDisplay(display); setOnboardIncome(raw||""); }}
                    placeholder="5.000.000" autoFocus
                    onFocus={() => { setTimeout(() => { if(window.visualViewport){ const kb=window.innerHeight-window.visualViewport.height-window.visualViewport.offsetTop; setKbHeight(kb>50?Math.round(kb):0); }},150); }}
                    style={{ width:"100%", background:T.card, border:`2px solid ${onboardIncome?themeAccent:T.cardBorder}`, borderRadius:14, padding:"14px 18px 14px 46px", color:T.text, fontSize:16, fontFamily:"inherit", outline:"none", transition:"border 0.2s", boxSizing:"border-box" }}/>
                </div>
                {onboardIncome && <p style={{ fontSize:12, color:themeAccent, fontWeight:700, marginBottom:8, paddingLeft:2 }}>= {formatRp(Number(onboardIncome))}</p>}
                {!onboardIncome && <div style={{ height:8 }}/>}
                <button onClick={() => setOnboardStep(3)} style={{ width:"100%", padding:15, borderRadius:14, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:800, background:`linear-gradient(135deg,${themeAccent},${themePrimary})`, color:"white", marginBottom:8 }}>
                  {lang==="en" ? "Next →" : "Lanjut →"}
                </button>
                <button onClick={() => setOnboardStep(1)} style={{ width:"100%", padding:10, borderRadius:12, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, background:"none", color:T.textSub }}>
                  {lang==="en" ? "← Back" : "← Kembali"}
                </button>
              </div>
            )}

            {/* Step 3 — Tema */}
            {onboardStep === 3 && (
              <div style={{ width:"100%", maxWidth:400 }}>
                <p style={{ fontSize:11, fontWeight:800, color:themeAccent, letterSpacing:1, margin:"0 0 6px" }}>{lang==="en" ? "STEP 4 / 4" : "LANGKAH 4 / 4"}</p>
                <p style={{ fontSize:26, fontWeight:900, color:T.text, margin:"0 0 4px", lineHeight:1.15 }}>{lang==="en" ? "Choose your\nlook" : "Pilih\ntampilan"}</p>
                <p style={{ fontSize:13, color:T.textSub, margin:"0 0 14px" }}>{lang==="en" ? "You can change this anytime in Settings." : "Bisa diganti kapan saja di Pengaturan."}</p>

                {/* Dark / Light mode toggle */}
                <p style={{ fontSize:10, fontWeight:800, color:T.textMuted, letterSpacing:1, marginBottom:8 }}>{lang==="en" ? "DISPLAY MODE" : "MODE TAMPILAN"}</p>
                <div style={{ display:"flex", gap:8, marginBottom:18 }}>
                  {[
                    { labelId:"Terang", labelEn:"Light", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>, value: false },
                    { labelId:"Gelap", labelEn:"Dark", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>, value: true },
                  ].map(opt => {
                    const isActive = dark === opt.value;
                    return (
                      <button key={String(opt.value)} onClick={() => {
                        setDarkOverride(opt.value);
                        setFollowSystem(false);
                        try { localStorage.setItem("gm_dark_override", String(opt.value)); localStorage.setItem("gm_follow_system", "0"); } catch {}
                      }} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"11px 0", borderRadius:12, border: isActive ? `2px solid ${themeAccent}` : `2px solid ${T.cardBorder}`, background: isActive ? themeAccent+"18" : T.card, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, color: isActive ? themeAccent : T.textSub, transition:"all 0.18s" }}>
                        <span style={{ color: isActive ? themeAccent : T.textSub }}>{opt.icon}</span>
                        {lang==="en" ? opt.labelEn : opt.labelId}
                        {isActive && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={themeAccent} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </button>
                    );
                  })}
                </div>

                {/* Color presets */}
                <p style={{ fontSize:10, fontWeight:800, color:T.textMuted, letterSpacing:1, marginBottom:8 }}>{lang==="en" ? "COLOR THEME" : "TEMA WARNA"}</p>
                <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
                  {THEME_PRESETS.filter(p => p.id !== "custom").map(preset => (
                    <button key={preset.id} onClick={() => { setThemePresetId(preset.id); try { localStorage.setItem("gm_theme_preset", preset.id); } catch {} }}
                      style={{ width:44, height:44, borderRadius:"50%", border: themePresetId===preset.id ? `3px solid ${preset.accent}` : "3px solid transparent", background:preset.primary, cursor:"pointer", padding:0, boxShadow: themePresetId===preset.id ? `0 0 0 2px ${preset.accent}55` : "none", transition:"all 0.2s", outline:"none" }}>
                      {themePresetId===preset.id && <div style={{ width:"100%", height:"100%", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={preset.accent} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>}
                    </button>
                  ))}
                  {/* Custom color dot */}
                  <label style={{ position:"relative", width:44, height:44, cursor:"pointer" }}>
                    <div style={{ width:44, height:44, borderRadius:"50%", border: themePresetId==="custom" ? `3px solid ${customAccent}` : `3px solid transparent`, background: themePresetId==="custom" ? customPrimary : "#888", display:"flex", alignItems:"center", justifyContent:"center", boxShadow: themePresetId==="custom" ? `0 0 0 2px ${customAccent}55` : "none", transition:"all 0.2s" }}>
                      {themePresetId==="custom"
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={customAccent} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="white"/><circle cx="17.5" cy="10.5" r=".5" fill="white"/><circle cx="8.5" cy="7.5" r=".5" fill="white"/><circle cx="6.5" cy="12.5" r=".5" fill="white"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                      }
                    </div>
                    <input type="color" value={customPrimary} onChange={e => { setCustomPrimary(e.target.value); setThemePresetId("custom"); try { localStorage.setItem("gm_custom_primary", e.target.value); localStorage.setItem("gm_theme_preset", "custom"); } catch {} }} style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0, cursor:"pointer" }}/>
                  </label>
                </div>

                {/* Custom color pickers — only show when custom selected */}
                {themePresetId === "custom" && (
                  <div style={{ display:"flex", gap:8, marginBottom:14, padding:"12px 14px", borderRadius:14, background:T.card, border:`1.5px solid ${T.cardBorder}` }}>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:10, fontWeight:800, color:T.textMuted, letterSpacing:1, marginBottom:6 }}>{lang==="en" ? "PRIMARY" : "WARNA UTAMA"}</p>
                      <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:customPrimary, border:`2px solid ${T.cardBorder}`, flexShrink:0, overflow:"hidden", position:"relative" }}>
                          <input type="color" value={customPrimary} onChange={e => { setCustomPrimary(e.target.value); try { localStorage.setItem("gm_custom_primary", e.target.value); } catch {} }} style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0, cursor:"pointer", border:"none", padding:0 }}/>
                        </div>
                        <span style={{ fontSize:12, color:T.textSub, fontWeight:600 }}>{customPrimary}</span>
                      </label>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:10, fontWeight:800, color:T.textMuted, letterSpacing:1, marginBottom:6 }}>{lang==="en" ? "ACCENT" : "WARNA AKSEN"}</p>
                      <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:customAccent, border:`2px solid ${T.cardBorder}`, flexShrink:0, overflow:"hidden", position:"relative" }}>
                          <input type="color" value={customAccent} onChange={e => { setCustomAccent(e.target.value); try { localStorage.setItem("gm_custom_accent", e.target.value); } catch {} }} style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0, cursor:"pointer", border:"none", padding:0 }}/>
                        </div>
                        <span style={{ fontSize:12, color:T.textSub, fontWeight:600 }}>{customAccent}</span>
                      </label>
                    </div>
                  </div>
                )}

                <button onClick={finishOnboarding} style={{ width:"100%", padding:15, borderRadius:14, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:800, background:`linear-gradient(135deg,${themeAccent},${themePrimary})`, color:"white", marginBottom:8, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {lang==="en" ? "Done, Let's Go!" : "Selesai, Mulai!"}
                </button>
                <button onClick={() => setOnboardStep(2)} style={{ width:"100%", padding:10, borderRadius:12, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, background:"none", color:T.textSub }}>
                  {lang==="en" ? "← Back" : "← Kembali"}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Dark mode ripple overlay */}
      {darkRipple && (
        <div style={{
          position:"fixed", zIndex:9998, pointerEvents:"none",
          background: darkRipple.toDark ? "#0a0a0a" : lighten(themeAccent, 0.85),
          borderRadius:"50%",
          width: Math.hypot(window.innerWidth, window.innerHeight) * 2.2,
          height: Math.hypot(window.innerWidth, window.innerHeight) * 2.2,
          left: darkRipple.x - Math.hypot(window.innerWidth, window.innerHeight) * 1.1,
          top:  darkRipple.y - Math.hypot(window.innerWidth, window.innerHeight) * 1.1,
          transform:"scale(0)",
          animation:"dark-ripple-expand 0.55s cubic-bezier(0.4,0,0.2,1) forwards",
        }}/>
      )}
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Offline bar */}
      {!isOnline && (
        <div style={{ position:"fixed",top:0,left:0,right:0,zIndex:9999,background:"#ef4444",color:"white",padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:13,fontWeight:700 }}>
          <WifiOff size={14} color="white" strokeWidth={2.5}/> Tidak ada koneksi internet
        </div>
      )}

      {/* Install banner */}
      {showInstallBanner && (
        <div style={{ position:"fixed",bottom:"72px",left:14,right:14,zIndex:500,background:themePrimary,borderRadius:20,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:`0 8px 32px ${themePrimary}88` }}>
          <Download size={28} color={T.primaryText} strokeWidth={1.5}/>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:13,fontWeight:800,color:"white" }}>Pasang ke Home Screen</p>
            <p style={{ fontSize:11,color:"rgba(255,255,255,0.7)" }}>Akses lebih cepat, bisa offline!</p>
          </div>
          <button onClick={() => { installPrompt && installPrompt.prompt(); setShowInstallBanner(false); }} style={{ background:"white",color:themePrimary,border:"none",borderRadius:12,padding:"8px 14px",fontSize:12,fontWeight:800,cursor:"pointer" }}>Pasang</button>
          <button onClick={() => setShowInstallBanner(false)} style={{ background:"rgba(255,255,255,0.2)",border:"none",borderRadius:10,padding:8,cursor:"pointer",display:"flex" }}><X size={14} color="white"/></button>
        </div>
      )}

      {/* Calculator modal */}
      {showCalc && (
        <Calculator
          onUse={(val) => { const n = Math.round(val); setForm(f => ({ ...f, amount: n, amountDisplay: n ? Number(n).toLocaleString("id-ID") : "" })); }}
          onClose={() => setShowCalc(false)}
          T={T} themeAccent={themeAccent} themePrimary={themePrimary} dark={dark}
        />
      )}

      {/* Undo delete toast */}
      {/* Custom Confirm Modal */}
      {customConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:99999, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 32px" }}
          onClick={() => setCustomConfirm(null)}>
          <div style={{ background:T.card, borderRadius:20, padding:"24px 20px", width:"100%", maxWidth:320, boxShadow:"0 16px 48px rgba(0,0,0,0.4)" }}
            onClick={e => e.stopPropagation()}>
            <p style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:20, lineHeight:1.5 }}>{customConfirm.msg}</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setCustomConfirm(null)}
                style={{ flex:1, padding:"12px", borderRadius:12, border:`1px solid ${T.cardBorder}`, background:T.inp, color:T.textSub, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                {L.cancel}
              </button>
              <button onClick={() => { customConfirm.onOk(); setCustomConfirm(null); }}
                style={{ flex:1, padding:"12px", borderRadius:12, border:"none", background:"#ef4444", color:"white", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
                {L.done||"OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      {undoToast && (
        <div style={{ position:"fixed", bottom:"72px", left:"50%", transform:"translateX(-50%)", zIndex:9998, display:"flex", alignItems:"center", gap:10, background: dark ? "#1a0d0d" : "#fff5f5", border:"1px solid rgba(239,68,68,0.35)", borderRadius:20, padding:"10px 12px 10px 16px", boxShadow:"0 8px 32px rgba(0,0,0,0.25)", animation:"toast-slide-up 0.3s cubic-bezier(0.34,1.5,0.64,1) both", maxWidth:320, width:"calc(100vw - 32px)" }}>
          <Trash2 size={15} color="#ef4444" strokeWidth={2.5}/>
          <p style={{ fontSize:13, fontWeight:600, color: dark ? "#fca5a5" : "#b91c1c", flex:1 }}>{L.txDeleted}</p>
          <button onClick={undoDelete} style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.4)", borderRadius:12, padding:"6px 14px", color:"#ef4444", fontSize:12, fontWeight:800, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>
            {L.txUndo}
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (() => {
        const [prefix, ...rest] = toast.split(":");
        const msg = rest.join(":");
        const isOk   = prefix === "ok";
        const isDel  = prefix === "del";
        const isErr  = prefix === "err";
        const isInfo = prefix === "info";
        const isWarn = prefix === "warn";
        const bgColor = isErr ? "#ef4444" : isWarn ? "#f59e0b" : isInfo ? (dark ? darken(themePrimary,0.5) : darken(themePrimary,0.1)) : dark ? darken(themePrimary,0.3) : themePrimary;
        return (
          <div className="toast" style={{ position:"fixed", bottom:"90px", left:"50%", transform:"translateX(-50%)", background:bgColor, color:"white", padding:"10px 18px", borderRadius:40, fontSize:13, fontWeight:700, zIndex:9999, whiteSpace:"nowrap", boxShadow:"0 8px 32px rgba(0,0,0,0.3)", display:"flex", alignItems:"center", gap:7 }}>
            {isOk   && <CheckCircle size={15} color="white" strokeWidth={2.5}/>}
            {isDel  && <Trash2 size={15} color="white" strokeWidth={2.5}/>}
            {isErr  && <AlertCircle size={15} color="white" strokeWidth={2.5}/>}
            {isInfo && <AlertTriangle size={15} color="white" strokeWidth={2.5}/>}
            {msg || toast}
          </div>
        );
      })()}

      {/* Long Press Context Menu */}

      {/* Income Edit Modal */}
      {editIncome && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)", zIndex:900, display:"flex", alignItems:"flex-end", justifyContent:"center", paddingBottom: kbHeight > 0 ? kbHeight : 0, boxSizing:"border-box", transition:"padding-bottom 0.25s ease" }} onClick={() => setEditIncome(false)}>
          <div className="modal-float" style={{ background:T.card, borderRadius:"28px 28px 0 0", width:"100%", boxShadow: dark?"0 24px 80px rgba(0,0,0,0.8)":"0 24px 80px rgba(0,0,0,0.25)", overflowY:"auto", maxHeight:`calc(100svh - env(safe-area-inset-top) - 20px - ${kbHeight}px)`, padding:"24px 20px 28px" }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:12, background:`${TP}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <TrendingUp size={17} color={TP} strokeWidth={2.2}/>
                </div>
                <p style={{ fontSize:17, fontWeight:900, color:T.text }}>{L.editIncome}</p>
              </div>
              <button onClick={() => setEditIncome(false)} style={{ ...IBN, padding:4 }}><X size={20} color={T.textSub}/></button>
            </div>
            {/* Tab Tambah / Kurangi */}
            {(() => {
              const isAdd = incomeTab === "tambah";
              return (<>
                <div style={{ display:"flex", background:T.inp, borderRadius:14, padding:4, marginBottom:16 }}>
                  {["tambah","kurangi"].map(tab => (
                    <button key={tab} onMouseDown={e=>e.preventDefault()} onClick={() => setIncomeTab(tab)}
                      style={{ flex:1, padding:"9px 0", borderRadius:11, border:"none", fontFamily:"inherit", fontSize:13, fontWeight:700, cursor:"pointer",
                        background: incomeTab===tab ? (tab==="tambah" ? T.accentText : "#f87171") : "transparent",
                        color: incomeTab===tab ? "white" : T.textSub, transition:"all 0.2s" }}>
                      {tab==="tambah" ? (lang==="en"?"+ Add":"+ Tambah") : (lang==="en"?"− Subtract":"− Kurangi")}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize:11, fontWeight:700, color:T.textSub, marginBottom:6 }}>
                  {isAdd ? (lang==="en"?"Current income":"Pemasukan saat ini") : (lang==="en"?"Current income":"Pemasukan saat ini")}
                </p>
                <input className="inp" type="text" inputMode="numeric" placeholder="5.000.000" value={tempIncomeDisplay} autoFocus
                  onChange={e => { const {display,raw}=parseRpInput(e.target.value); setTempIncomeDisplay(display); setTempIncome(raw); }}
                  style={{ background:T.inp, border:`1.5px solid ${T.inpBorder}`, color:T.text, marginBottom:10 }}/>
                <p style={{ fontSize:11, fontWeight:700, color:T.textSub, marginBottom:6 }}>
                  {isAdd ? (lang==="en"?"Amount to add":"Jumlah yang ditambah") : (lang==="en"?"Amount to subtract":"Jumlah yang dikurangi")}
                </p>
                <input className="inp" type="text" inputMode="numeric" placeholder="0" value={incomeAdjDisplay||""}
                  onChange={e => { const {display,raw}=parseRpInput(e.target.value); setIncomeAdjDisplay(display); setIncomeAdj(raw); }}
                  style={{ background:T.inp, border:`1.5px solid ${T.inpBorder}`, color:T.text, marginBottom:16 }}/>
                <button className="btn-p" style={{ width:"100%", fontFamily:"inherit",
                  background: isAdd ? T.accentText : "#f87171" }}
                  onClick={() => {
                    if (!incomeAdj) { setIncome(Number(tempIncome)||0); setEditIncome(false); showToast("ok:"+L.incomeSaved); return; }
                    const cur = Number(tempIncome)||0;
                    const adj = Number(incomeAdj);
                    const nv = isAdd ? cur+adj : Math.max(0, cur-adj);
                    setIncome(nv); setEditIncome(false);
                    showToast("ok:"+L.incomeSaved);
                  }}>
                  {isAdd ? (lang==="en"?"Save & Add":"Simpan & Tambah") : (lang==="en"?"Save & Subtract":"Simpan & Kurangi")}
                </button>
              </>);
            })()}
          </div>
        </div>
      )}

      {/* Pull to refresh indicator */}
      {pullY > 0 && (
        <div style={{
          position:"fixed", top:0, left:0, right:0, zIndex:200,
          display:"flex", alignItems:"center", justifyContent:"center",
          paddingTop:`calc(env(safe-area-inset-top) + ${pullY * 0.5}px)`,
          pointerEvents:"none",
        }}>
          <div style={{
            width:36, height:36, borderRadius:50,
            background: dark ? "rgba(30,30,35,0.95)" : "rgba(255,255,255,0.95)",
            backdropFilter:"blur(12px)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 4px 20px rgba(0,0,0,0.15)",
          }}>
            {refreshing
              ? <RefreshCw size={16} color={themeAccent} strokeWidth={2.5} style={{ animation:"spin 0.7s linear infinite" }}/>
              : <ArrowDown size={16} color={pullY >= PULL_THRESHOLD ? themeAccent : T.textSub} strokeWidth={2.5} style={{ transform:`rotate(${(pullY/PULL_THRESHOLD)*180}deg)`, transition:"transform 0.1s" }}/>
            }
          </div>
        </div>
      )}
      <div className="fi"
        onTouchStart={(e) => { handleSwipeStart(e); handlePullStart(e); }}
        onTouchMove={handlePullMove}
        onTouchEnd={(e) => { handleSwipeEnd(e); handlePullEnd(); }}
        style={{ width:"100%", minHeight:"100dvh", background:T.bg, position:"relative", paddingBottom:"calc(env(safe-area-inset-bottom) + 90px)",
          transform: pullY > 0 ? `translateY(${Math.min(pullY * 0.25, 18)}px)` : "none",
          transition: pullY === 0 ? "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)" : "none",
        }}>

        {/* FIXED HEADER - only on dashboard */}
        {tab === "dashboard" && <div ref={headerRef} style={{
          position:"fixed", top:0, left:0, right:0,
          zIndex:50,
          background: dark ? "rgba(10,10,10,0.65)" : `${T.bg}99`,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled ? `1px solid ${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"}` : "1px solid transparent",
          transition: "border-color 0.3s ease",
          paddingTop:"calc(env(safe-area-inset-top) + 10px)",
          paddingBottom:10, paddingLeft:16, paddingRight:16,
          boxSizing:"border-box",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%" }}>
          <div style={{ overflow:"hidden" }}>
            <p style={{
              fontSize:12, fontWeight:600, color:T.textSub, marginBottom:1,
            }}>
              {new Date().getHours() < 12 ? L.morning : new Date().getHours() < 15 ? L.afternoon : new Date().getHours() < 18 ? L.evening : L.night}
            </p>
            <p style={{
              fontWeight:900, color:T.text,
              fontSize: 20,
            }}>{userName || (lang==="en" ? "Set your name" : "Isi namamu")}</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <button ref={darkToggleRef} onClick={() => toggleDark(darkToggleRef)}
              style={{ width:34, height:34, borderRadius:50, background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              {dark ? <Moon size={15} color={themeAccent} strokeWidth={2}/> : <Sun size={15} color={themeAccent} strokeWidth={2}/>}
            </button>
            <button onClick={() => changeTab("settings")}
              style={{ width:34, height:34, borderRadius:50, background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative" }}>
              <Settings size={15} color={dark ? lighten(themePrimary,0.55) : T.primaryText} strokeWidth={2}/>
              {!notifEnabled && (
                <div style={{ position:"absolute", top:4, right:4, width:7, height:7, borderRadius:"50%", background:"#ef4444", border:`1.5px solid ${T.bg}` }}/>
              )}
            </button>
            <div style={{ position:"relative", flexShrink:0 }}>
              <div style={{ width:38, height:38, borderRadius:50, border:`2.5px solid ${themeAccent}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden" }}
                onClick={() => profileInputRef.current && profileInputRef.current.click()}>
                <img src={profilePhoto || "/meow.png"} alt="" style={{ width:38, height:38, objectFit:"cover" }}/>
              </div>
              <div style={{ position:"absolute", bottom:-1, right:-1, width:12, height:12, borderRadius:50, background:themeAccent, border:`2px solid ${dark?"#0a0a0a":"#fff"}`, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                <Camera size={5} color="white" strokeWidth={2.5}/>
              </div>
              <input ref={profileInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleProfilePhotoChange}/>
            </div>
          </div>
          </div>
        </div>}

        {tab !== "dashboard" && (
          <div ref={sharedHeaderRef} style={{
            position:"fixed", top:0, left:0, right:0, zIndex:50,
            background: dark ? "rgba(10,10,10,0.65)" : `${T.bg}99`,
            backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
            borderBottom: tabScrolled ? `1px solid ${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"}` : "1px solid transparent",
            transition:"border-color 0.3s ease",
            paddingTop:"calc(env(safe-area-inset-top) + 10px)",
            paddingBottom:10, paddingLeft:16, paddingRight:16,
            boxSizing:"border-box",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {tab==="transactions" && <p style={{ fontWeight:900, color:T.text, fontSize:20, margin:0, borderBottom:`3px solid ${themePrimary}`, paddingBottom:"2px", lineHeight:"1.3", display:"inline-block" }}>{L.transactions}</p>}
                {tab==="report" && <p style={{ fontWeight:900, color:T.text, fontSize:20, margin:0, borderBottom:`3px solid ${themePrimary}`, paddingBottom:"2px", lineHeight:"1.3", display:"inline-block" }}>{L.report}</p>}
                {tab==="date" && <><p style={{ fontWeight:900, color:T.text, fontSize:20, margin:0, borderBottom:"3px solid #be185d", paddingBottom:"2px", lineHeight:"1.3", display:"inline-block" }}>{L.date}</p><Heart size={18} color="#f9a8d4" strokeWidth={1.5}/></>}
                {tab==="settings" && <p style={{ fontWeight:900, color:T.text, fontSize:20, margin:0 }}>{L.settingsTitle}</p>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <button ref={darkToggleRef} onClick={() => toggleDark(darkToggleRef)}
                  style={{ width:34, height:34, borderRadius:50, background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  {dark ? <Moon size={15} color={themeAccent} strokeWidth={2}/> : <Sun size={15} color={themeAccent} strokeWidth={2}/>}
                </button>
                <button onClick={() => changeTab("settings")}
                  style={{ width:34, height:34, borderRadius:50, background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative" }}>
                  <Settings size={15} color={dark ? lighten(themePrimary,0.55) : T.primaryText} strokeWidth={2}/>
                  {!notifEnabled && (
                    <div style={{ position:"absolute", top:4, right:4, width:7, height:7, borderRadius:"50%", background:"#ef4444", border:`1.5px solid ${T.bg}`}}/>
                  )}
                </button>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <div style={{ width:38, height:38, borderRadius:50, border:`2.5px solid ${themeAccent}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden" }}
                    onClick={() => profileInputRef.current && profileInputRef.current.click()}>
                    <img src={profilePhoto || "/meow.png"} alt="" style={{ width:38, height:38, objectFit:"cover" }}/>
                  </div>
                  <div style={{ position:"absolute", bottom:-1, right:-1, width:12, height:12, borderRadius:50, background:themeAccent, border:`2px solid ${dark?"#0a0a0a":"#fff"}`, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                    <Camera size={5} color="white" strokeWidth={2.5}/>
                  </div>
                  <input ref={profileInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleProfilePhotoChange}/>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DASHBOARD ── */}
{/* Edit/Add Goal Modal */}
{editingGoal !== null && (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)", zIndex:9500, display:"flex", alignItems:"flex-end", justifyContent:"center", paddingBottom: kbHeight > 0 ? kbHeight : 0, boxSizing:"border-box", transition:"padding-bottom 0.25s ease" }} onClick={() => { setEditingGoal(null); }}>
    <div className="modal-float" style={{ background:T.card, borderRadius:"28px 28px 0 0", width:"100%", boxShadow: dark?"0 24px 80px rgba(0,0,0,0.8)":"0 24px 80px rgba(0,0,0,0.25)", overflowY:"auto", maxHeight:`calc(100svh - env(safe-area-inset-top) - 20px - ${kbHeight}px)`, padding:"20px 16px 24px" }} onClick={e => e.stopPropagation()}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <p style={{ fontSize:15, fontWeight:900, color:T.text }}>{editingGoal === "new" ? L.addTarget : L.editTarget}</p>
        <button onClick={() => { setEditingGoal(null); }} style={{ ...IBN, padding:4 }}><X size={20} color={T.textSub}/></button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:T.textSub, marginBottom:3 }}>Nama Target</p>
          <input className="inp" placeholder={L.goalNamePlaceholder} value={goalForm.label} autoFocus
            onChange={e => setGoalForm(f => ({ ...f, label: e.target.value }))}
            style={{ background:T.inp, border:`1.5px solid ${T.inpBorder}`, color:T.text }}/>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:10, fontWeight:700, color:T.textSub, marginBottom:3 }}>Target (Rp)</p>
            <input className="inp" placeholder="5.000.000" type="text" inputMode="numeric" value={goalForm.targetDisplay||""}
              onChange={e => { const {display,raw}=parseRpInput(e.target.value); setGoalForm(f => ({ ...f, target: raw, targetDisplay: display })); }}
              style={{ background:T.inp, border:`1.5px solid ${T.inpBorder}`, color:T.text }}/>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:10, fontWeight:700, color:T.textSub, marginBottom:3 }}>Ditabung (Rp)</p>
            <input className="inp" placeholder="0" type="text" inputMode="numeric" value={goalForm.savedDisplay||""}
              onChange={e => { const {display,raw}=parseRpInput(e.target.value); setGoalForm(f => ({ ...f, saved: raw, savedDisplay: display })); }}
              style={{ background:T.inp, border:`1.5px solid ${T.inpBorder}`, color:T.text }}/>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:10, fontWeight:700, color:T.textSub, marginBottom:3 }}>Icon</p>
            <div style={{ position:"relative" }}>
              <select value={goalForm.icon || "piggy"} onChange={e => setGoalForm(f => ({ ...f, icon: e.target.value }))}
                style={{ width:"100%", padding:"10px 32px 10px 36px", borderRadius:12, border:`1.5px solid ${T.inpBorder}`, background:T.inp, color:T.text, fontSize:13, fontWeight:600, fontFamily:"inherit", appearance:"none", cursor:"pointer" }}>
                {Object.entries(GOAL_ICONS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <div style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                {(() => { const gi = GOAL_ICONS[goalForm.icon||"piggy"]; return gi ? <gi.Icon size={15} color={goalForm.color} strokeWidth={2}/> : null; })()}
              </div>
              <div style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                <ChevronDown size={14} color={T.textSub}/>
              </div>
            </div>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:10, fontWeight:700, color:T.textSub, marginBottom:4 }}>Warna</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {["#60a5fa","#c084fc","#f87171","#4ade80","#fbbf24","#fb923c","#34d399","#e879f9","#38bdf8","#a3e635"].map(c => (
                <div key={c} onClick={() => setGoalForm(f => ({ ...f, color: c }))}
                  style={{ width:20, height:20, borderRadius:"50%", background:c, cursor:"pointer", border: goalForm.color===c ? `3px solid ${T.text}` : "3px solid transparent", boxSizing:"border-box", flexShrink:0 }}/>
              ))}
            </div>
          </div>
        </div>
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:T.textSub, marginBottom:3 }}>Target Tanggal <span style={{ fontWeight:400, fontSize:10 }}>(opsional)</span></p>
          <input className="inp" type="date" value={goalForm.deadline||""}
            onChange={e => setGoalForm(f => ({ ...f, deadline: e.target.value }))}
            style={{ background:T.inp, border:`1.5px solid ${T.inpBorder}`, color:T.text }}/>
        </div>
        <button className="btn-p" style={{ marginTop:4, background: TP, fontFamily:"inherit" }}
          onClick={() => {
            if (!goalForm.label.trim() || !goalForm.target) return;
            if (editingGoal === "new") {
              setSavingsGoals(prev => [...prev, { id: Date.now(), label: goalForm.label, target: Number(goalForm.target), saved: Number(goalForm.saved||0), color: goalForm.color, icon: goalForm.icon, deadline: goalForm.deadline }]);
            } else {
              setSavingsGoals(prev => prev.map(g => g.id === editingGoal ? { ...g, label: goalForm.label, target: Number(goalForm.target), saved: Number(goalForm.saved||0), color: goalForm.color, icon: goalForm.icon, deadline: goalForm.deadline } : g));
            }
            setEditingGoal(null);
            showToast(L.toastGoalSaved);
          }}>
          {L.saveTarget}
        </button>
      </div>
    </div>
  </div>
)}

        {tab === "dashboard" && <TabDashboard ctx={ctx} />}

        {/* ── TRANSACTIONS ── */}
        {tab === "transactions" && <TabTransactions ctx={ctx} />}

        {/* ── REPORT ── */}
        {tab === "report" && <TabReport ctx={ctx} />}

        {/* ── DATE ── */}
        {tab === "date" && <TabDate ctx={ctx} />}

        {/* ── SETTINGS TAB ── */}
        {tab === "settings" && <TabSettings ctx={ctx} />}

        {/* ── APPEARANCE MODAL ── */}
        {showAppearanceModal && <ModalAppearance ctx={ctx} />}

        {showNotifModal && <ModalNotif ctx={ctx} />}

        {showOverallBudgetModal && <ModalOverallBudget ctx={ctx} />}

        {showForm && <ModalAddTransaction ctx={ctx} />}

      </div>
    </div>
  );
}

