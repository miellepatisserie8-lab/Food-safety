import Guide from "../components/Guide";
import React, { useState } from "react";
import { api } from "../api";

const COURSES = [
  "Food Hygiene Level 2",
  "HACCP Level 2",
  "Allergen awareness (Natasha's Law)",
  "Fire safety / evacuation drill",
  "Manual handling",
  "Induction — kitchen safety app",
  "Other",
];

export default function Training({ staff, showToast, refreshHistory, onBack }) {
  const [trainee, setTrainee] = useState("");
  const [course, setCourse] = useState(COURSES[0]);
  const [other, setOther] = useState("");
  const [provider, setProvider] = useState("");
  const [expiry, setExpiry] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.logTraining({
        staff,
        trainee,
        course: course === "Other" ? other : course,
        provider,
        expiry,
      });
      showToast("Training record saved ✓");
      refreshHistory();
      onBack();
    } catch (e) {
      showToast(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="screen">
      <button className="back" onClick={onBack}>‹ Back</button>
      <h2>Staff training</h2>
      <p className="lead">Log completed training. Recorded by {staff || "—"}.</p>
      <Guide id="training" />

      <label className="fl">Staff member trained</label>
      <input value={trainee} onChange={(e) => setTrainee(e.target.value)} placeholder="Name" />

      <label className="fl">Course</label>
      <select value={course} onChange={(e) => setCourse(e.target.value)}>
        {COURSES.map((c) => <option key={c}>{c}</option>)}
      </select>

      {course === "Other" && (
        <>
          <label className="fl">Course name</label>
          <input value={other} onChange={(e) => setOther(e.target.value)} />
        </>
      )}

      <label className="fl">Provider (optional)</label>
      <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. Essential Food Hygiene" />

      <label className="fl">Expiry / renewal date (optional)</label>
      <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />

      <button className="btn" disabled={!trainee.trim() || (course === "Other" && !other.trim()) || saving} onClick={save}>
        {saving ? "Saving…" : "Save training record"}
      </button>
    </div>
  );
}
