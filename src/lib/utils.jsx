export const formatRp = (v) => "Rp " + Number(v || 0).toLocaleString("id-ID");

export const toDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const todayStr = () => toDateStr(new Date());
export const getMonth = (dateStr) => dateStr?.slice(0, 7) ?? "";
export const currentMonth = () => toDateStr(new Date()).slice(0, 7);

export const greeting = (lang) => {
  const h = new Date().getHours();
  if (lang === "id") {
    if (h < 11) return "Selamat pagi";
    if (h < 15) return "Selamat siang";
    if (h < 18) return "Selamat sore";
    return "Selamat malam";
  }
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export const nanoid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const ls = {
  get: (key, fallback = null) => {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, value); } catch {}
  },
  getJSON: (key, fallback) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  setJSON: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  remove: (key) => {
    try { localStorage.removeItem(key); } catch {}
  },
};

// IndexedDB for transactions
const DB_NAME = "meowlett_db";
const STORE = "transactions";

const openDB = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) =>
      e.target.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject();
  });

export const idb = {
  save: async (transactions) => {
    try {
      const db = await openDB();
      const store = db.transaction(STORE, "readwrite").objectStore(STORE);
      store.clear();
      transactions.forEach((t) => store.put(t));
    } catch {}
  },
  load: async () => {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch { return []; }
  },
};
