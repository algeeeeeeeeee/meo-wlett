import { useState, useMemo } from "react";
import { Plus, Heart, X } from "lucide-react";
import { useApp } from "../../hooks/AppContext";
import { TxForm } from "../ui/TxForm";
import { formatRp, getMonth } from "../../lib/utils.jsx";

export function DatePage() {
  const { t, dark, accent, transactions, dateWishlist, budgets, setBudgets, setDateWishlist, showToast } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [wishInput, setWishInput] = useState("");

  const bg = dark ? "#0a0a0a" : "#fff0f5";
  const card = dark ? "#1a1a1a" : "#fff";
  const text = dark ? "#fff" : "#111";
  const sub = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const border = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const inputBg = dark ? "#2a2a2a" : "#fdf0f5";
  const dateAccent = "#e11d48";

  const month = new Date().toISOString().slice(0, 7);
  const dateBudget = budgets["_date"] || 0;
  const dateTx = useMemo(() => transactions.filter(tx => tx.isDate && getMonth(tx.date) === month), [transactions, month]);
  const dateTotal = dateTx.reduce((s, tx) => s + tx.amount, 0);
  const pct = dateBudget > 0 ? Math.min((dateTotal / dateBudget) * 100, 100) : 0;

  const addWishlist = () => {
    if (!wishInput.trim()) return;
    setDateWishlist([...dateWishlist, wishInput.trim()]);
    setWishInput("");
    showToast(t.toastWishlist);
  };

  const cs = { background: card, borderRadius: 16, padding: "16px", border: `1px solid ${border}`, marginBottom: 12 };

  return (
    <div style={{ minHeight: "100dvh", background: bg, paddingBottom: 90 }}>
      <div style={{ background: dateAccent, padding: "56px 20px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Heart size={18} color="rgba(255,255,255,0.8)" fill="rgba(255,255,255,0.6)" />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{t.dateBudgetTitle}</span>
        </div>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>{formatRp(dateTotal)}</div>
        {dateBudget > 0 && (
          <>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
              {t.budgetLeft}: {formatRp(Math.max(0, dateBudget - dateTotal))}
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)", marginTop: 10 }}>
              <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: "#fff" }} />
            </div>
          </>
        )}
        <button onClick={() => setShowForm(true)} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.5)", background: "transparent", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          {t.addDateBtn}
        </button>
      </div>

      <div style={{ padding: "16px" }}>
        <div style={cs}>
          <div style={{ fontSize: 12, color: sub, fontWeight: 700, marginBottom: 8 }}>{t.monthlyBudget.toUpperCase()}</div>
          <input type="number" inputMode="numeric" placeholder={t.amountPlaceholder}
            value={dateBudget || ""}
            onChange={e => setBudgets({ ...budgets, _date: parseInt(e.target.value) || 0 })}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${border}`, background: inputBg, color: text, fontSize: 15, fontWeight: 600, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>

        <div style={cs}>
          <div style={{ fontSize: 12, color: sub, fontWeight: 700, marginBottom: 12 }}>{t.dateActivities.toUpperCase()} ({dateTx.length})</div>
          {dateTx.length === 0 ? (
            <div style={{ textAlign: "center", color: sub, padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💕</div>
              <div style={{ fontSize: 14 }}>{t.noDateTx}</div>
            </div>
          ) : dateTx.map((tx, i) => (
            <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < dateTx.length - 1 ? `1px solid ${border}` : "none" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: text }}>{tx.note || "Date"}</div>
                <div style={{ fontSize: 12, color: sub }}>{tx.date}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: dateAccent }}>{formatRp(tx.amount)}</div>
            </div>
          ))}
        </div>

        <div style={cs}>
          <div style={{ fontSize: 12, color: sub, fontWeight: 700, marginBottom: 12 }}>{t.wishlistTitle.toUpperCase()} 💝</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: `1px solid ${border}`, background: inputBg, color: text, fontSize: 14, outline: "none", fontFamily: "inherit" }}
              placeholder={t.wishlistPlaceholder} value={wishInput}
              onChange={e => setWishInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addWishlist()} />
            <button onClick={addWishlist} style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: dateAccent, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Plus size={20} color="#fff" />
            </button>
          </div>
          {dateWishlist.length === 0 ? (
            <div style={{ textAlign: "center", color: sub, padding: "12px 0" }}>
              <div style={{ fontSize: 14 }}>{t.noWishlist}</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{t.wishlistSub}</div>
            </div>
          ) : dateWishlist.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < dateWishlist.length - 1 ? `1px solid ${border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Heart size={14} color={dateAccent} fill={dateAccent} />
                <span style={{ fontSize: 14, color: text }}>{item}</span>
              </div>
              <button onClick={() => setDateWishlist(dateWishlist.filter((_, idx) => idx !== i))} style={{ border: "none", background: "none", cursor: "pointer", color: sub }}>
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {showForm && <TxForm onClose={() => setShowForm(false)} isDate />}
    </div>
  );
}
