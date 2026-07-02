import Guide from "../components/Guide";
import React, { useState } from "react";
import { CLEANING_TASKS } from "../config";
import { api } from "../api";

const FREQS = ["Daily", "Weekly", "Monthly"];

export default function Cleaning({ staff, showToast, refreshHistory, history }) {
  const [saving, setSaving] = useState("");
  const doneToday = (history && history.cleaningToday) || [];

  const signOff = async (task) => {
    setSaving(task.id);
    try {
      await api.logCleaning({ staff, task: task.name, freq: task.freq });
      showToast(`${task.name} signed off ✓`);
      refreshHistory();
    } catch (e) {
      showToast(e.message);
    } finally {
      setSaving("");
    }
  };

  return (
    <div className="screen">
      <h2>Cleaning schedule</h2>
      <p className="lead">Tap a task once it's cleaned and sanitised. Each sign-off is recorded with your name and time.</p>
      <Guide id="cleaning" />

      {FREQS.map((f) => (
        <div key={f}>
          <div className="section-title">{f}</div>
          {CLEANING_TASKS.filter((t) => t.freq === f).map((t) => {
            const done = doneToday.includes(t.name);
            return (
              <button className="tap-card" key={t.id} disabled={saving === t.id} onClick={() => signOff(t)}>
                <div className="icon">{done ? "✅" : "🧽"}</div>
                <div className="grow">
                  <div className="t">{t.name}</div>
                  <div className="d">{done ? "Signed off today" : `Tap to sign off (${f.toLowerCase()})`}</div>
                </div>
                <span className={`pill ${done ? "ok" : "due"}`}>{done ? "Done" : saving === t.id ? "…" : "Due"}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
