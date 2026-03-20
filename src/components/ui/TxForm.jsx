import { useState } from "react";
import { X } from "lucide-react";
import { useApp } from "../../hooks/AppContext";
import { CatIcon } from "./CatIcon";
import { todayStr } from "../../lib/utils.jsx";

export function TxForm({ onClose, editTx = null, isDate = false }) {
  const { t, lang, categories, accent, dark, addTransaction, updateTransaction, showToast } = useApp();
  const [amount, setAmount] = useState(editTx ? String(editTx.amount) : "");
  const [note, setNote] = useState(editTx?.note || "");
  const [category, setCategory] = useState(editTx?.category || Object.keys(categories)[0] || "food");
  const [date, setDate] = useState(editTx?.date || todayStr());

  const bg = dark ? "#1a1a1a" : "#fff";
  const text = dark ? "#fff" : "#111";
  const sub = dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const inputBg = dark ? "#2a2a2a" : "#fff";
  const cardBg = dark ? "#222" : "#f8f8f8";

  const handleSave = () => {
    const amt = parseInt(amount.replace(/\D/g, ""));
    if (!amt || amt <= 0) return;
    if (editTx) {
      updateTransaction(editTx.id, { amount: amt, note, category, date });
      showToast(t.txUpdated);
    } else {
      addTransaction({ amount: amt, note, category, date, isDate: isDate || false });
      showToast(t.txAdded);
    }
    onClose();
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${border}`,
    background: inputBg, color: text, fontSize: 15, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: "100%", background: bg, borderRadius: "20px 20px 0 0", padding: "20px 20px 40px", maxHeight: "90dvh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: text }}>{editTx ? t.editTx : t.newTx}</span>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: sub }}><X size={22} /></button>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: sub, fontWeight: 600, letterSpacing: 0.5 }}>{t.amount.toUpperCase()}</label>
          <input style={{ ...inputStyle, fontSize: 22, fontWeight: 700, marginTop: 6 }}
            type="number" inputMode="numeric" placeholder={t.amountPlaceholder}
            value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: sub, fontWeight: 600, letterSpacing: 0.5 }}>{t.category.toUpperCase()}</label>
          <div style={{ display: "flex", gap: 8, marginTop: 8, overflowX: "auto", paddingBottom: 4 }}>
            {Object.entries(categories).map(([key, cat]) => {
              const active = category === key;
              return (
                <button key={key} onClick={() => setCategory(key)} style={{
                  flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 4, padding: "8px 12px", borderRadius: 12,
                  border: `2px solid ${active ? cat.color : "transparent"}`,
                  background: active ? cat.color + "22" : cardBg, cursor: "pointer",
                }}>
                  <CatIcon iconKey={cat.icon} size={20} color={active ? cat.color : sub} />
                  <span style={{ fontSize: 10, color: active ? cat.color : sub, fontWeight: 600, whiteSpace: "nowrap" }}>
                    {lang === "id" ? cat.labelId : cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: sub, fontWeight: 600, letterSpacing: 0.5 }}>{t.note.toUpperCase()}</label>
          <input style={{ ...inputStyle, marginTop: 6 }} placeholder={t.notePlaceholder}
            value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        {/* Date */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: sub, fontWeight: 600, letterSpacing: 0.5 }}>{t.date_label.toUpperCase()}</label>
          <input style={{ ...inputStyle, marginTop: 6 }} type="date"
            value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <button onClick={handleSave} style={{
          width: "100%", padding: "15px", borderRadius: 14, border: "none",
          background: accent, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer",
        }}>{t.save}</button>
      </div>
    </div>
  );
}
