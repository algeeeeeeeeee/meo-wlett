import { useState, useMemo } from "react";
import { Plus, Search, Trash2, Edit2 } from "lucide-react";
import { useApp } from "../../hooks/AppContext";
import { CatIcon } from "../ui/CatIcon";
import { TxForm } from "../ui/TxForm";
import { formatRp, getMonth } from "../../lib/utils.jsx";

export function Transactions() {
  const { t, lang, dark, accent, transactions, categories, deleteTransaction, showToast } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("month");
  const [sort, setSort] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const bg = dark ? "#0a0a0a" : "#f2f2f7";
  const card = dark ? "#1a1a1a" : "#fff";
  const text = dark ? "#fff" : "#111";
  const sub = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const border = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const inputBg = dark ? "#1a1a1a" : "#fff";

  const today = new Date().toISOString().slice(0, 10);
  const week = new Date(); week.setDate(week.getDate() - 7);
  const weekStr = week.toISOString().slice(0, 10);
  const month = new Date().toISOString().slice(0, 7);

  const filtered = useMemo(() => {
    let txs = transactions.filter(tx => !tx.type);
    if (filter === "today") txs = txs.filter(tx => tx.date === today);
    else if (filter === "week") txs = txs.filter(tx => tx.date >= weekStr);
    else if (filter === "month") txs = txs.filter(tx => getMonth(tx.date) === month);
    if (search) {
      const q = search.toLowerCase();
      txs = txs.filter(tx => {
        const cat = categories[tx.category];
        return tx.note?.toLowerCase().includes(q) || cat?.label.toLowerCase().includes(q) || cat?.labelId.toLowerCase().includes(q);
      });
    }
    if (sort === "newest") txs = [...txs].sort((a, b) => b.date.localeCompare(a.date));
    else if (sort === "oldest") txs = [...txs].sort((a, b) => a.date.localeCompare(b.date));
    else if (sort === "highest") txs = [...txs].sort((a, b) => b.amount - a.amount);
    else if (sort === "lowest") txs = [...txs].sort((a, b) => a.amount - b.amount);
    return txs;
  }, [transactions, filter, search, sort, categories, today, weekStr, month]);

  const total = filtered.reduce((s, tx) => s + tx.amount, 0);
  const filters = [
    { id: "today", label: t.filterToday }, { id: "week", label: t.filterWeek },
    { id: "month", label: t.filterMonth }, { id: "all", label: t.allCategories },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: bg, paddingBottom: 90 }}>
      <div style={{ background: card, padding: "56px 16px 16px", borderBottom: `1px solid ${border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: text }}>{t.transactions}</div>
            <div style={{ fontSize: 13, color: sub }}>{formatRp(total)} · {filtered.length} {t.transactions_label}</div>
          </div>
          <button onClick={() => setShowForm(true)} style={{ width: 42, height: 42, borderRadius: 12, background: accent, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={22} color="#fff" strokeWidth={2.5} />
          </button>
        </div>

        <div style={{ position: "relative", marginBottom: 10 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: sub }} />
          <input style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 12, border: `1px solid ${border}`, background: inputBg, color: text, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: filter === f.id ? accent : dark ? "#2a2a2a" : "#f0f0f0", color: filter === f.id ? "#fff" : sub }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 16px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: sub, padding: "60px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🐾</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{search ? t.noTxFound : t.noTx}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{search ? `${t.noTxFoundDesc} "${search}"` : t.noTxDesc}</div>
          </div>
        ) : (
          <div style={{ background: card, borderRadius: 16, overflow: "hidden", border: `1px solid ${border}` }}>
            {filtered.map((tx, i) => {
              const cat = categories[tx.category];
              const isDeleting = deletingId === tx.id;
              return (
                <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : "none", background: isDeleting ? (dark ? "#2a1a1a" : "#fff5f5") : "transparent" }}>
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
                  {isDeleting ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { deleteTransaction(tx.id); showToast(t.txDeleted); setDeletingId(null); }} style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t.delete}</button>
                      <button onClick={() => setDeletingId(null)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: dark ? "#333" : "#eee", color: text, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t.cancel}</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => { setEditTx(tx); setShowForm(true); }} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: dark ? "#2a2a2a" : "#f5f5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Edit2 size={14} color={sub} />
                      </button>
                      <button onClick={() => setDeletingId(tx.id)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: dark ? "#2a2a2a" : "#f5f5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && <TxForm onClose={() => { setShowForm(false); setEditTx(null); }} editTx={editTx} />}
    </div>
  );
}
