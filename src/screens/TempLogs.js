import Guide from "../components/Guide";
import React, { useState } from "react";
import { APPLIANCES } from "../config";
import { api } from "../api";
import FoodTemps from "./FoodTemps";
import Calibration from "./Calibration";

export default function TempLogs(props) {
  const [view, setView] = useState(null); // null | "appliances" | "food" | "calibration"

  if (view === "food") return <FoodTemps {...props} onBack={() => setView(null)} />;
  if (view === "calibration") return <Calibration {...props} onBack={() => setView(null)} />;
  if (view === "appliances") return <ApplianceTemps {...props} onBack={() => setView(null)} />;

  return (
    <div className="screen">
      <h2>Temperatures</h2>
      <p className="lead">Appliance readings morning and evening, food probe checks during service, probe calibration monthly.</p>
      <Guide id="temps" />
      <div className="tile-grid">
        <button className="tile-card" onClick={() => setView("appliances")}>
          <div className="tile-icon">🧊</div>
          <div className="tile-t">Appliance temperatures</div>
          <div className="tile-d">Fridges, freezer and cellar cooler</div>
        </button>
        <button className="tile-card" onClick={() => setView("food")}>
          <div className="tile-icon">🍳</div>
          <div className="tile-t">Food probe checks</div>
          <div className="tile-d">Cooking, reheating, hot holding, cooling</div>
        </button>
        <button className="tile-card" onClick={() => setView("calibration")}>
          <div className="tile-icon">🌡️</div>
          <div className="tile-t">Probe calibration</div>
          <div className="tile-d">Monthly ice water / boiling water test</div>
        </button>
      </div>
    </div>
  );
}

function ApplianceTemps({ staff, showToast, refreshHistory, onBack }) {
  const [sel, setSel] = useState(null);

  if (!sel) {
    return (
      <div className="screen">
        <button className="back" onClick={onBack}>‹ Back</button>
        <h2>Appliance temperatures</h2>
        <p className="lead">Record fridge, freezer and cellar temperatures — morning and evening.</p>
        <Guide id="appliance" />
        <div className="tile-grid">
          {APPLIANCES.map((a) => (
            <button className="tile-card" key={a.id} onClick={() => setSel(a)}>
              <div className="tile-icon">{a.type === "freezer" ? "❄️" : a.type === "cellar" ? "🍺" : "🧊"}</div>
              <div className="tile-t">{a.name}</div>
              <div className="tile-d">Safe range {a.min}°C to {a.max}°C</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <TempForm
      appliance={sel}
      staff={staff}
      showToast={showToast}
      refreshHistory={refreshHistory}
      onBack={() => setSel(null)}
    />
  );
}

function TempForm({ appliance, staff, showToast, refreshHistory, onBack }) {
  const mid = Math.round((appliance.min + appliance.max) / 2);
  const [temp, setTemp] = useState(String(mid));
  const [action, setAction] = useState("");
  const [notInUse, setNotInUse] = useState(false);
  const [saving, setSaving] = useState(false);

  const val = parseFloat(temp);
  const valid = !isNaN(val);
  const pass = valid && val >= appliance.min && val <= appliance.max;

  const save = async () => {
    setSaving(true);
    try {
      await api.logTemp({
        staff,
        appliance: appliance.name,
        tempC: notInUse ? "" : val,
        status: notInUse ? "not-in-use" : pass ? "pass" : "fail",
        action: pass || notInUse ? "" : action,
      });
      showToast(`${appliance.name} logged ✓`);
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
      <h2>{appliance.name}</h2>
      <div className="range-hint">Safe range: {appliance.min}°C to {appliance.max}°C</div>

      {!notInUse && (
        <div className="card">
          <div className={`temp-read ${valid ? (pass ? "pass" : "fail") : ""}`}>
            <span className="val">{valid ? val : "–"}</span>
            <span className="unit">°C</span>
          </div>
          <input
            type="range"
            min={appliance.min - 10}
            max={appliance.max + 10}
            step="0.5"
            value={valid ? val : mid}
            onChange={(e) => setTemp(e.target.value)}
          />
          <label className="fl">Or type the probe reading</label>
          <input type="number" inputMode="decimal" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} />
          {valid && !pass && (
            <>
              <div className="warn">
                Temperature is outside the safe range. Move high-risk food, check the unit, and record the action taken.
              </div>
              <label className="fl">Remedial action taken</label>
              <textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g. moved stock to Fridge 2, engineer called…" />
            </>
          )}
        </div>
      )}

      <label className="fl" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" style={{ width: "auto" }} checked={notInUse} onChange={(e) => setNotInUse(e.target.checked)} />
        Unit not in use today
      </label>

      <button className="btn" disabled={saving || (!notInUse && (!valid || (!pass && !action.trim())))} onClick={save}>
        {saving ? "Saving…" : "Save reading"}
      </button>
    </div>
  );
}
