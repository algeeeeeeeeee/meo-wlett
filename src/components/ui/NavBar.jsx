import { Home, ArrowLeftRight, BarChart2, Heart, Settings } from "lucide-react";
import { useApp } from "../../hooks/AppContext";

const NAV_ITEMS = [
  { id: "dashboard", Icon: Home },
  { id: "transactions", Icon: ArrowLeftRight },
  { id: "report", Icon: BarChart2 },
  { id: "date", Icon: Heart },
  { id: "settings", Icon: Settings },
];

export function NavBar({ page, setPage }) {
  const { t, accent, dark } = useApp();
  const labels = {
    dashboard: t.dashboard, transactions: t.transactions,
    report: t.report, date: t.date, settings: t.settings,
  };
  const bg = dark ? "#111" : "#fff";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const inactive = dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, background: bg,
      borderTop: `1px solid ${border}`, display: "flex", zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {NAV_ITEMS.map(({ id, Icon }) => {
        const active = page === id;
        return (
          <button key={id} onClick={() => setPage(id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, padding: "10px 4px 8px", border: "none", background: "none",
            cursor: "pointer", color: active ? accent : inactive, transition: "color 0.15s",
          }}>
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{labels[id]}</span>
          </button>
        );
      })}
    </nav>
  );
}
