import Guide from "../components/Guide";
import React, { useState } from "react";
import { api } from "../api";

const ITEMS = [
  "Dry store — food off the floor, packaging intact and sealed",
  "Fridges and freezers clean and organised (out-of-date food disposed)",
  "Kitchen bins emptied and cleaned",
  "Hand sinks and taps cleaned and stocked",
  "Boards and knives clean and in good condition",
  "Cleaning chemicals stored away from food",
  "First aid kit stocked (blue plasters)",
  "Sanitiser spray bottles filled and in the kitchen",
  "Kitchen clear of pests — droppings / insects / rodents / damage",
  "Extraction and filters visibly clean",
];

export default function Hygiene({ staff, showToast, refreshHistory, onBack }) {
  const [answers, setAnswers] = useState({});
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (i, v) => setAnswers((a) => ({ ...a, [i]: a[i] === v ? undefined : v }));
  const allAnswered = ITEMS.every((_, i) => answers[i]);
  const anyNo = ITEMS.some((_, i) => answers[i] === "no");

  const save = async () => {
    setSaving(true);
    try {
      await api.logHygiene({
        staff,
        results: ITEMS.map((item, i) => ({ item, result: answers[i] })),
        note,
      });
      showToast("Hygiene checklist saved ✓");
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
      <h2>Hygiene checklist</h2>
      <p className="lead">Weekly walk-round. Anything marked No needs a note and action.</p>
      <Guide id="hygiene" />
      {ITEMS.map((item, i) => (
        <div className={`check-row ${answers[i] === "yes" ? "done" : ""} ${answers[i] === "no" ? "no" : ""}`} key={i}>
          <div className="grow label">{item}</div>
          <div className="yn">
            <button className={`yes ${answers[i] === "yes" ? "sel" : ""}`} onClick={() => set(i, "yes")}>Yes</button>
            <button className={`no ${answers[i] === "no" ? "sel" : ""}`} onClick={() => set(i, "no")}>No</button>
          </div>
        </div>
      ))}
      {anyNo && (
        <>
          <label className="fl">Problem found and action taken</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was found, where, and what was done…" />
        </>
      )}
      <button className="btn" disabled={!allAnswered || (anyNo && !note.trim()) || saving} onClick={save}>
        {saving ? "Saving…" : "Save checklist"}
      </button>
    </div>
  );
}
