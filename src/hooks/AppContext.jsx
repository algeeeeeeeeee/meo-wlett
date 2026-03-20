import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { DEFAULT_CATEGORIES, THEMES, LS } from "../lib/constants.jsx";
import { ls, idb, nanoid, todayStr, getMonth, currentMonth } from "../lib/utils.jsx";
import { translations } from "../lib/i18n.jsx";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(() => ls.get(LS.LANG) || "id");
  const [darkOverride, setDarkOverride] = useState(() => {
    const v = ls.get(LS.DARK_OVERRIDE);
    return v === "true" ? true : v === "false" ? false : null;
  });
  const [followSystem, setFollowSystemState] = useState(() => ls.get(LS.FOLLOW_SYSTEM) === "1");
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
  );
  const [themePreset, setThemePresetState] = useState(() => ls.get(LS.THEME_PRESET) || "rose");
  const [customPrimary, setCustomPrimaryState] = useState(() => ls.get(LS.CUSTOM_PRIMARY) || "#881337");
  const [customAccent, setCustomAccentState] = useState(() => ls.get(LS.CUSTOM_ACCENT) || "#fb7185");

  const [username, setUsernameState] = useState(() => ls.get(LS.USERNAME) || "");
  const [onboarded, setOnboarded] = useState(() => !!ls.get(LS.ONBOARDED));

  const [transactions, setTransactions] = useState([]);
  const [income, setIncomeState] = useState(() => parseInt(ls.get(LS.INCOME) || "0") || 0);
  const [savings, setSavingsState] = useState(() => parseFloat(ls.get(LS.SAVINGS) || "0") || 0);
  const [categories, setCategoriesState] = useState(() => ls.getJSON(LS.CATEGORIES, DEFAULT_CATEGORIES));
  const [savingsGoals, setSavingsGoalsState] = useState(() => ls.getJSON(LS.SAVINGS_GOALS, []));
  const [budgets, setBudgetsState] = useState(() => ls.getJSON(LS.BUDGETS, {}));
  const [overallBudget, setOverallBudgetState] = useState(() => parseInt(ls.get(LS.OVERALL_BUDGET) || "0") || 0);
  const [recurring, setRecurringState] = useState(() => ls.getJSON(LS.RECURRING, []));
  const [dateWishlist, setDateWishlistState] = useState(() => ls.getJSON(LS.DATE_WISHLIST, []));
  const [cicilan, setCicilanState] = useState(() => ls.getJSON(LS.CICILAN, []));
  const [toast, setToast] = useState(null);

  // System dark mode listener
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Load transactions from IndexedDB
  useEffect(() => {
    idb.load().then((rows) => {
      if (rows.length > 0) {
        setTransactions(rows);
      } else {
        setTransactions(ls.getJSON(LS.TRANSACTIONS, []));
      }
    });
  }, []);

  const dark = followSystem ? systemDark : (darkOverride !== null ? darkOverride : systemDark);
  const theme = THEMES.find((t) => t.id === themePreset) || THEMES[3];
  const accent = themePreset === "custom" ? customAccent : theme.accent;
  const primary = themePreset === "custom" ? customPrimary : theme.primary;
  const t = translations[lang] || translations.id;

  // Setters with persistence
  const setLang = (v) => { setLangState(v); ls.set(LS.LANG, v); };
  const setDark = (v) => { setDarkOverride(v); ls.set(LS.DARK_OVERRIDE, String(v)); };
  const setFollowSystem = (v) => { setFollowSystemState(v); ls.set(LS.FOLLOW_SYSTEM, v ? "1" : "0"); };
  const setThemePreset = (v) => { setThemePresetState(v); ls.set(LS.THEME_PRESET, v); };
  const setCustomPrimary = (v) => { setCustomPrimaryState(v); ls.set(LS.CUSTOM_PRIMARY, v); };
  const setCustomAccent = (v) => { setCustomAccentState(v); ls.set(LS.CUSTOM_ACCENT, v); };
  const setUsername = (v) => { setUsernameState(v); ls.set(LS.USERNAME, v); };
  const setIncome = (v) => { setIncomeState(v); ls.set(LS.INCOME, String(v)); };
  const setSavings = (v) => { setSavingsState(v); ls.set(LS.SAVINGS, String(v)); };
  const setCategories = (v) => { setCategoriesState(v); ls.setJSON(LS.CATEGORIES, v); };
  const setSavingsGoals = (v) => { setSavingsGoalsState(v); ls.setJSON(LS.SAVINGS_GOALS, v); };
  const setBudgets = (v) => { setBudgetsState(v); ls.setJSON(LS.BUDGETS, v); };
  const setOverallBudget = (v) => { setOverallBudgetState(v); ls.set(LS.OVERALL_BUDGET, String(v)); };
  const setRecurring = (v) => { setRecurringState(v); ls.setJSON(LS.RECURRING, v); };
  const setDateWishlist = (v) => { setDateWishlistState(v); ls.setJSON(LS.DATE_WISHLIST, v); };
  const setCicilan = (v) => { setCicilanState(v); ls.setJSON(LS.CICILAN, v); };
  const completeOnboarding = () => { setOnboarded(true); ls.set(LS.ONBOARDED, "1"); };

  const saveTransactions = useCallback((txs) => {
    setTransactions(txs);
    ls.setJSON(LS.TRANSACTIONS, txs);
    idb.save(txs);
  }, []);

  const addTransaction = useCallback((tx) => {
    setTransactions((prev) => {
      const next = [{ ...tx, id: nanoid() }, ...prev];
      ls.setJSON(LS.TRANSACTIONS, next);
      idb.save(next);
      return next;
    });
  }, []);

  const updateTransaction = useCallback((id, updates) => {
    setTransactions((prev) => {
      const next = prev.map((tx) => tx.id === id ? { ...tx, ...updates } : tx);
      ls.setJSON(LS.TRANSACTIONS, next);
      idb.save(next);
      return next;
    });
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => {
      const next = prev.filter((tx) => tx.id !== id);
      ls.setJSON(LS.TRANSACTIONS, next);
      idb.save(next);
      return next;
    });
  }, []);

  const showToast = useCallback((raw) => {
    const idx = raw.indexOf(":");
    const type = idx > 0 ? raw.slice(0, idx) : "ok";
    const msg = idx > 0 ? raw.slice(idx + 1) : raw;
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const month = currentMonth();

  const monthTransactions = useMemo(
    () => transactions.filter((tx) => !tx.type && getMonth(tx.date) === month),
    [transactions, month]
  );
  const monthExpense = useMemo(
    () => monthTransactions.reduce((s, tx) => s + tx.amount, 0),
    [monthTransactions]
  );
  const todayExpense = useMemo(() => {
    const today = todayStr();
    return transactions
      .filter((tx) => !tx.type && tx.date === today)
      .reduce((s, tx) => s + tx.amount, 0);
  }, [transactions]);

  const resetAll = () => {
    Object.values(LS).forEach((k) => ls.remove(k));
    window.location.reload();
  };

  const backup = () => {
    const data = {
      transactions, income, savings, categories, savingsGoals,
      budgets, overallBudget, recurring, dateWishlist, cicilan,
      username, themePreset, customPrimary, customAccent, lang, version: 1,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meowlett-backup-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t.backupOk);
  };

  const restore = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.transactions) saveTransactions(data.transactions);
        if (data.income !== undefined) setIncome(data.income);
        if (data.savings !== undefined) setSavings(data.savings);
        if (data.categories) setCategories(data.categories);
        if (data.savingsGoals) setSavingsGoals(data.savingsGoals);
        if (data.budgets) setBudgets(data.budgets);
        if (data.overallBudget !== undefined) setOverallBudget(data.overallBudget);
        if (data.recurring) setRecurring(data.recurring);
        if (data.dateWishlist) setDateWishlist(data.dateWishlist);
        if (data.cicilan) setCicilan(data.cicilan);
        if (data.username) setUsername(data.username);
        showToast(t.restoreOk);
      } catch {
        showToast(t.backupInvalid);
      }
    };
    reader.readAsText(file);
  };

  const value = {
    lang, dark, followSystem, themePreset, customPrimary, customAccent,
    accent, primary, theme, username, onboarded, transactions, income, savings,
    categories, savingsGoals, budgets, overallBudget, recurring, dateWishlist,
    cicilan, toast, t, monthTransactions, monthExpense, todayExpense, month,
    setLang, setDark, setFollowSystem, setThemePreset, setCustomPrimary, setCustomAccent,
    setUsername, completeOnboarding, setIncome, setSavings, setCategories,
    setSavingsGoals, setBudgets, setOverallBudget, setRecurring, setDateWishlist, setCicilan,
    addTransaction, updateTransaction, deleteTransaction, saveTransactions,
    showToast, resetAll, backup, restore,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
