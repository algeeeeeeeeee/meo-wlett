import { useState } from "react";
import { useApp } from "../../hooks/AppContext";

export function Onboarding() {
  const { t, accent, dark, lang, setUsername, completeOnboarding } = useApp();
  const [name, setName] = useState("");

  const bg = dark ? "#0a0a0a" : "#fff";
  const text = dark ? "#fff" : "#111";
  const sub = dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
  const inputBg = dark ? "#1a1a1a" : "#f4f4f4";

  const handleStart = () => {
    if (name.trim()) setUsername(name.trim());
    completeOnboarding();
  };

  return (
    <div style={{
      minHeight: "100dvh", background: bg, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "40px 28px",
    }}>
      <div style={{ fontSize: 80, marginBottom: 16, lineHeight: 1 }}>🐱</div>
      <div style={{ fontSize: 34, fontWeight: 900, color: accent, marginBottom: 4, letterSpacing: -1 }}>
        Meowlett
      </div>
      <div style={{ fontSize: 15, color: sub, marginBottom: 48, fontStyle: "italic" }}>
        Purr-fect finances ✨
      </div>

      <div style={{ width: "100%", maxWidth: 360 }}>
        <label style={{ fontSize: 12, color: sub, fontWeight: 700, letterSpacing: 0.8, display: "block", marginBottom: 8 }}>
          {lang === "id" ? "NAMA KAMU" : "YOUR NAME"}
        </label>
        <input
          style={{
            width: "100%", padding: "14px 16px", borderRadius: 14,
            border: `2px solid ${name ? accent : "transparent"}`,
            background: inputBg, color: text, fontSize: 16, fontWeight: 600,
            outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border 0.2s",
          }}
          placeholder={t.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          autoFocus
        />
        <button onClick={handleStart} style={{
          marginTop: 16, width: "100%", padding: "15px", borderRadius: 14,
          border: "none", background: accent, color: "#fff", fontWeight: 800,
          fontSize: 16, cursor: "pointer", fontFamily: "inherit",
        }}>
          {lang === "id" ? "Mulai 🐾" : "Let's go 🐾"}
        </button>
        <p style={{ marginTop: 16, fontSize: 12, color: sub, textAlign: "center", lineHeight: 1.5 }}>
          {lang === "id"
            ? "Data tersimpan di perangkat kamu, tidak dikirim ke server."
            : "Your data stays on your device only."}
        </p>
      </div>
    </div>
  );
}
