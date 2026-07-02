import React, { useState } from "react";
import { FOOD_TEMP_TYPES } from "../config";
import { api } from "../api";

export default function FoodTemps({ staff, showToast, refreshHistory, onBack }) {
  const [sel, setSel] = useState(null);

  if (!sel) {
    return (
      <div className="screen">
        <button className="back" onClick={onBack}>‹ Back</button>
        <h2>Food probe temperatures</h2>
        <p className="lead">Probe the core of the food. Clean and sanitise the probe before and after each use.</p>
        {FOOD_TEMP_TYPES.map((t) => (
          <button className="tap-card" key={t.id} onClick={() => setSel(t)}>
            <div className="icon">{t.icon}</div>
            <div className="grow">
              <div className="t">{t.name}</div>
              <div className="d">{t.rule}</div>
            </div>
            <span className="chev">›</span>
          </button>
        ))}
      </div>
    );
  }

  return <FoodTempForm type={sel} staff={staff} showToast={showToast} refreshHistory={refreshHistory} onBack={() => setSel(null)} />;
}

function FoodTempForm({ type, staff, showToast, refreshHistory, onBack }) {
  const [food, setFood] = useState("");
  const [temp, setTemp] = useState("");
  const [action, setAction] = useState("");
  const [saving, setSaving] = useState(false);

  const val = parseFloat(temp);
  const valid = !isNaN(val);
  const pass = valid && (type.min !== undefined ? val >= type.min : val <= type.max);

  const save = async () => {
    setSaving(true);
    try {
      await api.logFoodTemp({
        staff,
        checkType: type.name,
        food,
        tempC: val,
        status: pass ? "pass" : "fail",
        action: pass ? "" : action,
      });
      showToast(`${type.name} check saved ✓`);
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
      <h2>{type.name}</h2>
      <div className="range-hint">{type.rule}</div>

      <label className="fl">Food / dish</label>
      <input value={food} onChange={(e) => setFood(e.target.value)} placeholder="e.g. char siu bao batch 2, crème pâtissière" />

      <label className="fl">Core temperature (°C)</label>
      <input type="number" inputMode="decimal" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="Probe reading" />

      {valid && (
        <div className={`temp-read ${pass ? "pass" : "fail"}`}>
          <span className="val">{val}</span>
          <span className="unit">°C — {pass ? "within limit" : "outside limit"}</span>
        </div>
      )}

      {valid && !pass && (
        <>
          <div className="warn">
            Outside the critical limit. {type.id === "cooling" ? "Move to blast-chill / smaller containers, or discard if over time." : "Continue cooking / reheating, or discard and record."}
          </div>
          <label className="fl">Action taken</label>
          <textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g. returned to steamer, re-probed at 78°C…" />
        </>
      )}

      <button className="btn" disabled={!food.trim() || !valid || (!pass && !action.trim()) || saving} onClick={save}>
        {saving ? "Saving…" : "Save check"}
      </button>
    </div>
  );
}
