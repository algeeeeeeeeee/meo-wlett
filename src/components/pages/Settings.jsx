import { useState, useRef } from "react";
import { Sun, Moon, Download, Upload, Trash2 } from "lucide-react";
import { useApp } from "../../hooks/AppContext";
import { THEMES } from "../../lib/constants.jsx";
import { formatRp } from "../../lib/utils.jsx";

export function Settings() {
  const {
    t, lang, dark, followSystem, themePreset, customPrimary, customAccent,
    accent, username, income, overallBudget,
    setLang, setDark, setFollowSystem, setThemePreset, setCustomPrimary, setCustomAccent,
    setUsername, setIncome, setOverallBudget, resetAll, backup, restore, showToast,
  } = useApp();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(username);
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState(String(income));
  const [showReset, setShowReset] = useState(false);
  const fileRef = useRef(null);

  const bg = dark ? "#0a0a0a" : "#f2f2f7";
  const card = dark ? "#1a1a1a" : "#fff";
  const text = dark ? "#fff" : "#111";
  const sub = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const border = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const inputBg = dark ? "#2a2a2a" : "#f5f5f5";

  const cs = { background: card, borderRadius: 16, overflow: "hidden", border: `1px solid ${border}`, marginBottom: 8 };
  const row = (content, last = false) => (
    <div style={{ background: card, padding: "14px 16px", borderBottom: last ? "none" : `1px solid ${border}` }}>
      {content}
    </div>
  );
  const sectionLabel = (label) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: sub, letterSpacing: 0.8, padding: "20px 0 6px" }}>{label}</div>
  );

  return (
    <div style={{ minHeight: "100dvh", background: bg, paddingBottom: 100 }}>
      <div style={{ background: card, padding: "56px 16px 16px", borderBottom: `1px solid ${border}` }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: text }}>{t.settings}</div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {sectionLabel(t.profile.toUpperCase())}
        <div style={cs}>
          {row(
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: sub, marginBottom: 2 }}>{t.profileName}</div>
                {editingName ? (
                  <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <input style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${accent}`, background: inputBg, color: text, fontSize: 14, outline: "none", fontFamily: "inherit", minWidth: 0, flex: 1 }}
                      value={nameInput} onChange={e => setNameInput(e.target.value)} autoFocus />
                    <button onClick={() => { setUsername(nameInput); setEditingName(false); showToast("ok:" + t.nameSaved); }}
                      style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: accent, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{t.save}</button>
                    <button onClick={() => setEditingName(false)}
                      style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: inputBg, color: text, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{t.cancel}</button>
                  </div>
                ) : (
                  <div style={{ fontSize: 16, fontWeight: 600, color: text }}>{username || t.tapName}</div>
                )}
              </div>
              {!editingName && <button onClick={() => setEditingName(true)} style={{ border: "none", background: "none", color: accent, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t.edit}</button>}
            </div>
          )}
          {row(
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: sub, marginBottom: 2 }}>{t.income}</div>
                {editingIncome ? (
                  <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <input type="number" inputMode="numeric"
                      style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${accent}`, background: inputBg, color: text, fontSize: 14, outline: "none", fontFamily: "inherit", width: 140 }}
                      value={incomeInput} onChange={e => setIncomeInput(e.target.value)} autoFocus />
                    <button onClick={() => { setIncome(parseInt(incomeInput) || 0); setEditingIncome(false); showToast("ok:" + t.incomeSaved); }}
                      style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: accent, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{t.save}</button>
                    <button onClick={() => setEditingIncome(false)}
                      style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: inputBg, color: text, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{t.cancel}</button>
                  </div>
                ) : (
                  <div style={{ fontSize: 16, fontWeight: 600, color: text }}>{income > 0 ? formatRp(income) : "-"}</div>
                )}
              </div>
              {!editingIncome && <button onClick={() => setEditingIncome(true)} style={{ border: "none", background: "none", color: accent, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t.edit}</button>}
            </div>, true
          )}
        </div>

        {sectionLabel(t.appearance)}
        <div style={cs}>
          {row(
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: text }}>{t.displayMode}</div>
                <div style={{ fontSize: 12, color: sub, marginTop: 2 }}>{followSystem ? t.followSystem : dark ? t.darkActive : t.lightActive}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setFollowSystem(!followSystem)} style={{ padding: "6px 12px", borderRadius: 20, border: "none", background: followSystem ? accent : inputBg, color: followSystem ? "#fff" : sub, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {t.followSystem}
                </button>
                {!followSystem && (
                  <button onClick={() => setDark(!dark)} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: inputBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {dark ? <Sun size={18} color={accent} /> : <Moon size={18} color={sub} />}
                  </button>
                )}
              </div>
            </div>
          )}
          {row(
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: text, marginBottom: 12 }}>{t.colorTheme}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {THEMES.filter(th => th.id !== "custom").map(th => (
                  <button key={th.id} onClick={() => setThemePreset(th.id)}
                    style={{ width: 36, height: 36, borderRadius: 10, border: themePreset === th.id ? `3px solid ${text}` : "3px solid transparent", background: th.accent, cursor: "pointer" }} />
                ))}
                <button onClick={() => setThemePreset("custom")}
                  style={{ width: 36, height: 36, borderRadius: 10, border: themePreset === "custom" ? `3px solid ${text}` : "3px solid transparent", background: "linear-gradient(135deg,#f43f5e,#8b5cf6,#06b6d4)", cursor: "pointer" }} />
              </div>
              {themePreset === "custom" && (
                <div style={{ marginTop: 12, display: "flex", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: sub, fontWeight: 600, marginBottom: 4 }}>{t.primaryLabel}</div>
                    <input type="color" value={customPrimary} onChange={e => setCustomPrimary(e.target.value)} style={{ width: 48, height: 36, borderRadius: 8, border: "none", cursor: "pointer" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: sub, fontWeight: 600, marginBottom: 4 }}>{t.accentLabel}</div>
                    <input type="color" value={customAccent} onChange={e => setCustomAccent(e.target.value)} style={{ width: 48, height: 36, borderRadius: 8, border: "none", cursor: "pointer" }} />
                  </div>
                </div>
              )}
            </div>
          )}
          {row(
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: text }}>{t.language}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {["id", "en"].map(l => (
                  <button key={l} onClick={() => setLang(l)}
                    style={{ padding: "6px 14px", borderRadius: 20, border: "none", background: lang === l ? accent : inputBg, color: lang === l ? "#fff" : sub, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {l === "id" ? "🇮🇩 ID" : "🇺🇸 EN"}
                  </button>
                ))}
              </div>
            </div>, true
          )}
        </div>

        {sectionLabel(t.monthlyBudget.toUpperCase())}
        <div style={cs}>
          {row(
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: text }}>{t.monthlyBudget}</div>
                <div style={{ fontSize: 12, color: sub }}>{overallBudget > 0 ? formatRp(overallBudget) : "-"}</div>
              </div>
              <input type="number" inputMode="numeric" placeholder={t.amountPlaceholder}
                value={overallBudget || ""}
                onChange={e => setOverallBudget(parseInt(e.target.value) || 0)}
                style={{ width: 130, padding: "8px 12px", borderRadius: 10, border: `1px solid ${border}`, background: inputBg, color: text, fontSize: 13, outline: "none", fontFamily: "inherit", textAlign: "right" }} />
            </div>, true
          )}
        </div>

        {sectionLabel(t.data)}
        <div style={cs}>
          {row(
            <button onClick={backup} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", border: "none", background: "none", cursor: "pointer" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: text }}>{t.backupData}</div>
                <div style={{ fontSize: 12, color: sub }}>{t.backupDesc}</div>
              </div>
              <Download size={18} color={accent} />
            </button>
          )}
          {row(
            <button onClick={() => fileRef.current?.click()} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", border: "none", background: "none", cursor: "pointer" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: text }}>{t.restoreBackup}</div>
                <div style={{ fontSize: 12, color: sub }}>{t.restoreDesc}</div>
              </div>
              <Upload size={18} color={accent} />
            </button>
          )}
          {row(
            <button onClick={() => setShowReset(true)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", border: "none", background: "none", cursor: "pointer" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#ef4444" }}>{t.resetData}</div>
                <div style={{ fontSize: 12, color: sub }}>{t.resetDesc}</div>
              </div>
              <Trash2 size={18} color="#ef4444" />
            </button>, true
          )}
        </div>

        <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) restore(f); }} />
      </div>

      {showReset && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: card, borderRadius: 20, padding: 24, maxWidth: 360, width: "100%" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#ef4444", marginBottom: 8 }}>⚠️ {t.resetData}</div>
            <div style={{ fontSize: 14, color: sub, marginBottom: 20 }}>{t.resetConfirm}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowReset(false)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: inputBg, color: text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{t.cancel}</button>
              <button onClick={resetAll} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{t.delete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
