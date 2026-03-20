import { useState } from "react";
import { AppProvider, useApp } from "./hooks/AppContext";
import { NavBar } from "./components/ui/NavBar";
import { Toast } from "./components/ui/Toast";
import { Onboarding } from "./components/pages/Onboarding";
import { Dashboard } from "./components/pages/Dashboard";
import { Transactions } from "./components/pages/Transactions";
import { Report } from "./components/pages/Report";
import { DatePage } from "./components/pages/DatePage";
import { Settings } from "./components/pages/Settings";

function AppInner() {
  const { onboarded, toast, accent, dark } = useApp();
  const [page, setPage] = useState("dashboard");
  const bg = dark ? "#0a0a0a" : "#f2f2f7";

  if (!onboarded) return <Onboarding />;

  return (
    <div style={{ background: bg, minHeight: "100dvh", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {page === "dashboard" && <Dashboard setPage={setPage} />}
      {page === "transactions" && <Transactions />}
      {page === "report" && <Report />}
      {page === "date" && <DatePage />}
      {page === "settings" && <Settings />}
      <NavBar page={page} setPage={setPage} />
      {toast && <Toast msg={toast.msg} type={toast.type} accent={accent} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
