import { useMemo } from "react";
import { useApp } from "../../hooks/AppContext";
import { CatIcon } from "../ui/CatIcon";
import { formatRp, getMonth } from "../../lib/utils.jsx";

export function Report() {
  const { t, lang, dark, accent, transactions, categories, income } = useApp();
  const bg = dark ? "#0a0a0a" : "#f2f2f7";
  const card = dark ? "#1a1a1a" : "#fff";
  const text = dark ? "#fff" : "#111";
  const sub = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const border = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";

  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
  const lastMonth = lastMonthDate.toISOString().slice(0, 7);

  const thisMonthTx = useMemo(() => transactions.filter(tx => !tx.type && getMonth(tx.date) === thisMonth), [transactions, thisMonth]);
  const lastMonthTx = useMemo(() => transactions.filter(tx => !tx.type && getMonth(tx.date) === lastMonth), [transactions, lastMonth]);
  const thisTotal = thisMonthTx.reduce((s, tx) => s + tx.amount, 0);
  const lastTotal = lastMonthTx.reduce((s, tx) => s + tx.amount, 0);
  const diff = lastTotal > 0 ? ((thisTotal - lastTotal) / lastTotal) * 100 : 0;

  const catMap = {};
  thisMonthTx.forEach(tx => { catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount; });
  const catList = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  const weeks = useMemo(() => {
    const result = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i * 7);
      const start = new Date(d); start.setDate(d.getDate() - d.getDay());
      const end = new Date(start); end.setDate(start.getDate() + 6);
      const total = transactions.filter(tx => { if (tx.type) return false; const td = new Date(tx.date); return td >= start && td <= end; }).reduce((s, tx) => s + tx.amount, 0);
      result.push({ label: `W${8 - i}`, total });
    }
    return result;
  }, [transactions]);
  const maxWeek = Math.max(...weeks.map(w => w.total), 1);

  const daysPassed = now.getDate();
  const avgPerDay = daysPassed > 0 ? thisTotal / daysPassed : 0;
  const todayTotal = transactions.filter(tx => !tx.type && tx.date === now.toISOString().slice(0, 10)).reduce((s, tx) => s + tx.amount, 0);

  const cs = { background: card, borderRadius: 16, padding: "16px", border: `1px solid ${border}`, marginBottom: 12 };

  return (
    <div style={{ minHeight: "100dvh", background: bg, paddingBottom: 90 }}>
      <div style={{ background: card, padding: "56px 16px 16px", borderBottom: `1px solid ${border}` }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: text }}>{t.report}</div>
        <div style={{ fontSize: 13, color: sub, marginTop: 2 }}>{now.toLocaleString(lang === "id" ? "id-ID" : "en-US", { month: "long", year: "numeric" })}</div>
      </div>

      <div style={{ padding: "12px 16px" }}>
        <div style={{ ...cs, background: accent }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>{t.totalExpense}</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginTop: 4, letterSpacing: -1 }}>{formatRp(thisTotal)}</div>
          {income > 0 && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{t.remaining}: {formatRp(Math.max(0, income - thisTotal))}</div>}
          {lastTotal > 0 && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 6 }}>{diff > 0 ? `↑ ${Math.abs(diff).toFixed(1)}% ${t.insightMore} ${t.insightFrom}` : `↓ ${Math.abs(diff).toFixed(1)}% ${t.insightLess} ${t.insightFrom}`}</div>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div style={{ ...cs, marginBottom: 0 }}>
            <div style={{ fontSize: 11, color: sub, fontWeight: 700 }}>{t.avgPerDay.toUpperCase()}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: text, marginTop: 4 }}>{formatRp(avgPerDay)}</div>
          </div>
          <div style={{ ...cs, marginBottom: 0 }}>
            <div style={{ fontSize: 11, color: sub, fontWeight: 700 }}>{t.totalToday.toUpperCase()}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: text, marginTop: 4 }}>{formatRp(todayTotal)}</div>
          </div>
        </div>

        <div style={cs}>
          <div style={{ fontSize: 12, color: sub, fontWeight: 700, marginBottom: 12 }}>{t.trend8w.toUpperCase()}</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
            {weeks.map((w, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 9, color: sub, textAlign: "center" }}>{w.total > 0 ? (w.total >= 1e6 ? `${(w.total / 1e6).toFixed(1)}M` : `${Math.round(w.total / 1e3)}K`) : ""}</div>
                <div style={{ width: "100%", borderRadius: 4, height: w.total > 0 ? `${Math.max(8, (w.total / maxWeek) * 56)}px` : 3, background: i === weeks.length - 1 ? accent : dark ? "#333" : "#e5e5e5" }} />
                <span style={{ fontSize: 9, color: sub }}>{w.label}</span>
              </div>
            ))}
          </div>
        </div>

        {catList.length > 0 ? (
          <div style={cs}>
            <div style={{ fontSize: 12, color: sub, fontWeight: 700, marginBottom: 12 }}>{t.breakdownCat.toUpperCase()}</div>
            {catList.map(([key, amt]) => {
              const cat = categories[key]; if (!cat) return null;
              const pct = thisTotal > 0 ? (amt / thisTotal) * 100 : 0;
              return (
                <div key={key} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CatIcon iconKey={cat.icon} size={16} color={cat.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: text }}>{lang === "id" ? cat.labelId : cat.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: text }}>{formatRp(amt)}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: dark ? "#333" : "#eee", marginTop: 4 }}>
                        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: cat.color }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: sub, flexShrink: 0 }}>{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ ...cs, textAlign: "center", padding: "40px 16px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: text }}>{t.noData}</div>
            <div style={{ fontSize: 13, color: sub, marginTop: 4 }}>{t.startNote}</div>
          </div>
        )}
      </div>
    </div>
  );
}
