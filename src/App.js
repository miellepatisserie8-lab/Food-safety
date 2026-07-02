import React, { useEffect, useState, useCallback } from "react";
import Dashboard from "./screens/Dashboard";
import DailyChecks from "./screens/DailyChecks";
import TempLogs from "./screens/TempLogs";
import Cleaning from "./screens/Cleaning";
import More from "./screens/More";
import StaffPicker from "./components/StaffPicker";
import { api } from "./api";

const NAV = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "checks", label: "Checks", icon: "✅" },
  { id: "temps", label: "Temps", icon: "🌡️" },
  { id: "cleaning", label: "Cleaning", icon: "🧽" },
  { id: "more", label: "More", icon: "☰" },
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [staff, setStaff] = useState(() => localStorage.getItem("mielle_staff") || "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [history, setHistory] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      const data = await api.getHistory(31);
      setHistory(data);
    } catch (e) {
      setHistory({ error: e.message });
    }
  }, []);

  useEffect(() => {
    if (!staff) setPickerOpen(true);
    refreshHistory();
  }, [staff, refreshHistory]);

  const chooseStaff = (name) => {
    setStaff(name);
    localStorage.setItem("mielle_staff", name);
    setPickerOpen(false);
  };

  const common = { staff, showToast, refreshHistory, history, goto: setTab };

  return (
    <div className="app">
      <header className="header">
        <div className="brandline">
          <div>
            <h1>Mielle <span>Kitchen Safety</span></h1>
            <div className="sub">Unit 4, 51 Blossom Street, Ancoats</div>
          </div>
          <button className="staff-chip" onClick={() => setPickerOpen(true)}>
            {staff ? `👤 ${staff}` : "Who's on?"}
          </button>
        </div>
      </header>

      {tab === "home" && <Dashboard {...common} />}
      {tab === "checks" && <DailyChecks {...common} />}
      {tab === "temps" && <TempLogs {...common} />}
      {tab === "cleaning" && <Cleaning {...common} />}
      {tab === "more" && <More {...common} />}

      <nav className="bottom-nav">
        {NAV.map((n) => (
          <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => setTab(n.id)}>
            <span className="ni">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      {pickerOpen && <StaffPicker current={staff} onPick={chooseStaff} onClose={() => staff && setPickerOpen(false)} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
