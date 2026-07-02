import React, { useState } from "react";
import { INCIDENT_TYPES } from "../config";
import { api } from "../api";

export default function Incidents({ staff, showToast, refreshHistory, onBack }) {
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [action, setAction] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.logIncident({ staff, type, description, action });
      showToast("Incident recorded ✓");
      refreshHistory();
      onBack();
    } catch (e) {
      showToast(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!type) {
    return (
      <div className="screen">
        <button className="back" onClick={onBack}>‹ Back</button>
        <h2>Record an incident</h2>
        <p className="lead">Select the incident type.</p>
        {INCIDENT_TYPES.map((t) => (
          <button className="tap-card" key={t} onClick={() => setType(t)}>
            <div className="icon">⚠️</div>
            <div className="grow"><div className="t">{t}</div></div>
            <span className="chev">›</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="screen">
      <button className="back" onClick={() => setType("")}>‹ Back</button>
      <h2>{type}</h2>
      <p className="lead">Recorded by {staff || "—"} with today's date and time.</p>

      <label className="fl">What happened?</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was found / reported, which dish or area, customer details if relevant…" />

      <label className="fl">What action has been taken?</label>
      <textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g. area cleaned, food disposed, manager informed, customer contacted…" />

      <button className="btn" disabled={!description.trim() || !action.trim() || saving} onClick={save}>
        {saving ? "Saving…" : "Save incident"}
      </button>
    </div>
  );
}
