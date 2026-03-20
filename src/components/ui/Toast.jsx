import { CheckCircle, Info, Trash2 } from "lucide-react";

export function Toast({ msg, type, accent }) {
  const bg = type === "del" ? "#ef4444" : type === "info" ? "#64748b" : accent;
  const Icon = type === "del" ? Trash2 : type === "info" ? Info : CheckCircle;
  return (
    <div style={{
      position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
      background: bg, color: "#fff", borderRadius: 14, padding: "10px 18px",
      display: "flex", alignItems: "center", gap: 8, zIndex: 9999,
      fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      whiteSpace: "nowrap", maxWidth: "90vw", animation: "fadeInUp 0.2s ease",
    }}>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      <Icon size={16} />
      <span>{msg}</span>
    </div>
  );
}
