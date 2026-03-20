import { useState, useMemo } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { useApp } from "../../hooks/AppContext";
import { CatIcon } from "../ui/CatIcon";
import { TxForm } from "../ui/TxForm";
import { formatRp, greeting, todayStr, getMonth } from "../../lib/utils.jsx";

export function Dashboard({ setPage }) {
  const {
    t, lang, dark, accent, username, transactions,
    income, monthExpense, todayExpense, categories, savingsGoals, overallBudget,
  } = useApp();
  const [showForm, setShowForm] = useState(false);

  const bg = dark ? "#0a0a0a" : "#f2f2f7";
  const card = dark ? "#1a1a1a" : "#fff";
  const text = dark ? "#fff" : "#111";
  const sub = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const border = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";

  const budgetPct = overallBudget > 0 ? Math.min((monthExpense / overallBudget) * 100, 100) : 0;
  const budgetColor = budgetPct >= 90 ? "#ef4444" : budgetPct >= 70 ? "#f59e0b" : accent;
  const recentTx = useMemo(() => transactions.filter(tx => !tx.type).slice(0, 5), [transactions]);

  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      const start = new Date(d); start.setDate(d.getDate() - d.getDay());
      const end = new Date(start); end.setDate(start.getDate() + 6);
      const total = transactions
        .filter(tx => { if (tx.type) return false; const td = new Date(tx.date); return td >= start && td <= end; })
        .reduce((s, tx) => s + tx.amount, 0);
      weeks.push({ label: `W${8 - i}`, total });
    }
    return weeks;
  }, [transactions]);
  const maxWeek = Math.max(...weeklyData.map(w => w.total), 1);

  const month = new Date().toISOString().slice(0, 7);
  const catBreakdown = useMemo(() => {
    const map = {};
    transactions.filter(tx => !tx.type && getMonth(tx.date) === month)
      .forEach(tx => { map[tx.category] = (map[tx.category] || 0) + tx.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [transactions, month]);

  const cs = { background: card, borderRadius: 16, padding: "16px", border: `1px solid ${border}`, marginBottom: 12 };

  return (
    <div style={{ minHeight: "100dvh", background: bg, paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ background: accent, padding: "56px 20px 28px", position: "relative" }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
          {greeting(lang)}{username ? `, ${username}` : ""} 👋
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{t.monthlyExpense}</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#fff", marginTop: 4, letterSpacing: -1 }}>
          {formatRp(monthExpense)}
        </div>
        {income > 0 && (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
            {t.remaining}: {formatRp(Math.max(0, income - monthExpense))}
          </div>
        )}
        <button onClick={() => setShowForm(true)} style={{
          position: "absolute", bottom: -22, right: 20, width: 52, height: 52,
          borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        }}>
          <Plus size={24} color={accent} strokeWidth={2.5} />
        </button>
      </div>

      <div style={{ padding: "28px 16px 0" }}>
        {/* Today & Budget */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div style={{ ...cs, marginBottom: 0 }}>
            <div style={{ fontSize: 11, color: sub, fontWeight: 700 }}>{t.today.toUpperCase()}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: text, marginTop: 4 }}>{formatRp(todayExpense)}</div>
          </div>
          {overallBudget > 0 && (
            <div style={{ ...cs, marginBottom: 0 }}>
              <div style={{ fontSize: 11, color: sub, fontWeight: 700 }}>{t.monthlyBudget.toUpperCase()}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: budgetColor, marginTop: 4 }}>{Math.round(budgetPct)}%</div>
              <div style={{ height: 4, borderRadius: 2, background: dark ? "#333" : "#eee", marginTop: 6 }}>
                <div style={{ height: "100%", width: `${budgetPct}%`, background: budgetColor, borderRadius: 2 }} />
              </div>
            </div>
          )}
        </div>

        {/* Weekly trend */}
        {weeklyData.some(w => w.total > 0) && (
          <div style={cs}>
            <div style={{ fontSize: 12, color: sub, fontWeight: 700, letterSpacing: 0.5, marginBottom: 12 }}>{t.weeklyTrend.toUpperCase()}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
              {weeklyData.map((w, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", borderRadius: 4, height: w.total > 0 ? `${Math.max(8, (w.total / maxWeek) * 48)}px` : 3, background: i === weeklyData.length - 1 ? accent : dark ? "#333" : "#e5e5e5" }} />
                  <span style={{ fontSize: 9, color: sub }}>{w.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Savings goals */}
        {savingsGoals.length > 0 && (
          <div style={cs}>
            <div style={{ fontSize: 12, color: sub, fontWeight: 700, letterSpacing: 0.5, marginBottom: 12 }}>{t.savingsGoal.toUpperCase()}</div>
            {savingsGoals.slice(0, 3).map(goal => {
              const pct = Math.min((goal.saved / goal.target) * 100, 100);
              return (
                <div key={goal.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: text }}>{goal.name}</span>
                    <span style={{ fontSize: 12, color: sub }}>{Math.round(pct)}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: dark ? "#333" : "#eee" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: goal.color || accent }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: sub }}>{formatRp(goal.saved)}</span>
                    <span style={{ fontSize: 11, color: sub }}>{formatRp(goal.target)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Category breakdown */}
        {catBreakdown.length > 0 && (
          <div style={cs}>
            <div style={{ fontSize: 12, color: sub, fontWeight: 700, letterSpacing: 0.5, marginBottom: 12 }}>{t.breakdown.toUpperCase()}</div>
            {catBreakdown.map(([key, amt]) => {
              const cat = categories[key]; if (!cat) return null;
              const pct = monthExpense > 0 ? (amt / monthExpense) * 100 : 0;
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CatIcon iconKey={cat.icon} size={16} color={cat.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: text }}>{lang === "id" ? cat.labelId : cat.label}</span>
                      <span style={{ fontSize: 12, color: sub }}>{formatRp(amt)}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: dark ? "#333" : "#eee" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: cat.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent transactions */}
        <div style={cs}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: sub, fontWeight: 700, letterSpacing: 0.5 }}>{t.recentTx.toUpperCase()}</div>
            <button onClick={() => setPage("transactions")} style={{ display: "flex", alignItems: "center", gap: 2, background: "none", border: "none", color: accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {t.seeAll} <ChevronRight size={14} />
            </button>
          </div>
          {recentTx.length === 0 ? (
            <div style={{ textAlign: "center", color: sub, padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🐾</div>
              <div style={{ fontSize: 13 }}>{t.noTxDescEmpty}</div>
            </div>
          ) : recentTx.map((tx, i) => {
            const cat = categories[tx.category];
            return (
              <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 12, marginBottom: i < recentTx.length - 1 ? 12 : 0, borderBottom: i < recentTx.length - 1 ? `1px solid ${border}` : "none" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: (cat?.color || "#94a3b8") + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CatIcon iconKey={cat?.icon || "package"} size={18} color={cat?.color || "#94a3b8"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tx.note || (lang === "id" ? cat?.labelId : cat?.label) || tx.category}
                  </div>
                  <div style={{ fontSize: 12, color: sub }}>{tx.date}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: text, flexShrink: 0 }}>{formatRp(tx.amount)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && <TxForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
