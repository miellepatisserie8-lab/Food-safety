import React, { useState } from "react";
import { OPENING_CHECKS, CLOSING_CHECKS } from "../config";
import { api } from "../api";
import Deliveries from "./Deliveries";

export default function DailyChecks(props) {
  const { staff, showToast, refreshHistory } = props;
  const [mode, setMode] = useState(null); // null | "opening" | "closing" | "delivery"

  if (mode === "delivery") return <Deliveries {...props} onBack={() => setMode(null)} />;

  if (!mode) {
    return (
      <div className="screen">
        <h2>Daily checks</h2>
        <p className="lead">Opening checks before service, closing checks before lock-up, and a log for every delivery.</p>
        <button className="tap-card" onClick={() => setMode("opening")}>
          <div className="icon">🌅</div>
          <div className="grow">
            <div className="t">Opening checks</div>
            <div className="d">{OPENING_CHECKS.length} items · before service</div>
          </div>
          <span className="chev">›</span>
        </button>
        <button className="tap-card" onClick={() => setMode("closing")}>
          <div className="icon">🌙</div>
          <div className="grow">
            <div className="t">Closing checks</div>
            <div className="d">{CLOSING_CHECKS.length} items · before lock-up</div>
          </div>
          <span className="chev">›</span>
        </button>
        <button className="tap-card" onClick={() => setMode("delivery")}>
          <div className="icon">📦</div>
          <div className="grow">
            <div className="t">Delivery / goods-in</div>
            <div className="d">Check and record every delivery on arrival</div>
          </div>
          <span className="chev">›</span>
        </button>
      </div>
    );
  }

  return (
    <CheckList
      key={mode}
      mode={mode}
      items={mode === "opening" ? OPENING_CHECKS : CLOSING_CHECKS}
      staff={staff}
      showToast={showToast}
      refreshHistory={refreshHistory}
      onBack={() => setMode(null)}
    />
  );
}

function CheckList({ mode, items, staff, showToast, refreshHistory, onBack }) {
  const [answers, setAnswers] = useState({}); // idx -> "yes" | "no"
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (i, v) => setAnswers((a) => ({ ...a, [i]: a[i] === v ? undefined : v }));
  const allAnswered = items.every((_, i) => answers[i]);
  const anyNo = items.some((_, i) => answers[i] === "no");

  const save = async () => {
    setSaving(true);
    try {
      await api.logDailyCheck({
        staff,
        checkType: mode,
        results: items.map((item, i) => ({ item, result: answers[i] })),
        note,
      });
      showToast(`${mode === "opening" ? "Opening" : "Closing"} checks saved ✓`);
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
      <h2>{mode === "opening" ? "Opening checks" : "Closing checks"}</h2>
      <p className="lead">Tap Yes or No for each item. Anything marked No needs a note.</p>

      {items.map((item, i) => (
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
          <label className="fl">What was the problem and what action was taken?</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe the issue and remedial action…" />
        </>
      )}

      <button className="btn" disabled={!allAnswered || (anyNo && !note.trim()) || saving} onClick={save}>
        {saving ? "Saving…" : "Save checks"}
      </button>
    </div>
  );
}
