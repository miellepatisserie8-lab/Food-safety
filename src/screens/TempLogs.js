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

function mid(a) {
  return Math.round((a.min + a.max) / 2);
}

function ApplianceTemps({ staff, showToast, refreshHistory, onBack }) {
  const [temps, setTemps] = useState(() => {
    const init = {};
    APPLIANCES.forEach((a) => {
      init[a.id] = String(mid(a));
    });
    return init;
  });
  const [actions, setActions] = useState({});
  const [saving, setSaving] = useState(false);

  const barFridges = APPLIANCES.filter((a) => a.id.startsWith("barfridge"));
  const others = APPLIANCES.filter((a) => !a.id.startsWith("barfridge"));

  const setTemp = (id, v) => setTemps((t) => ({ ...t, [id]: v }));
  const setAction = (id, v) => setActions((a) => ({ ...a, [id]: v }));

  const statusFor = (a) => {
    const val = parseFloat(temps[a.id]);
    const valid = !isNaN(val);
    const pass = valid && val >= a.min && val <= a.max;
    return { val, valid, pass };
  };

  const allValid = APPLIANCES.every((a) => statusFor(a).valid);
  const missingActions = APPLIANCES.some((a) => {
    const { valid, pass } = statusFor(a);
    return valid && !pass && !(actions[a.id] || "").trim();
  });

  const saveAll = async () => {
    setSaving(true);
    try {
      for (const a of APPLIANCES) {
        const { val, valid, pass } = statusFor(a);
        await api.logTemp({
          staff,
          appliance: a.name,
          tempC: valid ? val : "",
          status: valid ? (pass ? "pass" : "fail") : "fail",
          action: pass ? "" : actions[a.id] || "",
        });
      }
      showToast("All readings saved ✓");
      refreshHistory();
      onBack();
    } catch (e) {
      showToast(e.message);
    } finally {
      setSaving(false);
    }
  };

  const MiniCard = ({ a }) => {
    const { val, valid, pass } = statusFor(a);
    return (
      <div className="mini-temp-card">
        <div className="mini-temp-head">
          <div className="tile-icon">{a.type === "freezer" ? "❄️" : a.type === "cellar" ? "🍺" : "🧊"}</div>
          <div>
            <div className="mini-t">{a.name}</div>
            <div className="mini-d">Safe range {a.min}°C to {a.max}°C</div>
          </div>
        </div>
        <div className="mini-temp-body">
          <input
            className="vslider"
            type="range"
            min={a.min - 10}
            max={a.max + 10}
            step="0.5"
            value={valid ? val : mid(a)}
            onChange={(e) => setTemp(a.id, e.target.value)}
          />
          <div className={`mini-read ${valid ? (pass ? "pass" : "fail") : ""}`}>
            <span className="val">{valid ? val : "–"}</span>
            <span className="unit">°C</span>
          </div>
        </div>
        <label className="fl">Or type the probe reading</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={temps[a.id]}
          onChange={(e) => setTemp(a.id, e.target.value)}
        />
        {valid && !pass && (
          <>
            <div className="warn small">Out of range — record the action taken.</div>
            <textarea
              className="mini-action"
              value={actions[a.id] || ""}
              onChange={(e) => setAction(a.id, e.target.value)}
              placeholder="Action taken…"
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="screen">
      <button className="back" onClick={onBack}>‹ Back</button>
      <h2>Appliance temperatures</h2>
      <p className="lead">Record fridge, freezer and cellar temperatures — morning and evening.</p>
      <Guide id="appliance" />
      <div className="temp-columns">
        <div className="temp-col">
          {barFridges.map((a) => (
            <MiniCard a={a} key={a.id} />
          ))}
        </div>
        <div className="temp-col">
          {others.map((a) => (
            <MiniCard a={a} key={a.id} />
          ))}
        </div>
      </div>
      <button className="btn" disabled={saving || !allValid || missingActions} onClick={saveAll}>
        {saving ? "Saving…" : "Save reading"}
      </button>
    </div>
  );
}
