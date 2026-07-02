import React, { useState } from "react";
import { api } from "../api";

export default function Calibration({ staff, showToast, refreshHistory, onBack }) {
  const [probe, setProbe] = useState("Probe 1");
  const [ice, setIce] = useState("");
  const [boil, setBoil] = useState("");
  const [action, setAction] = useState("");
  const [saving, setSaving] = useState(false);

  const iceV = parseFloat(ice);
  const boilV = parseFloat(boil);
  const iceOk = !isNaN(iceV) && iceV >= -1 && iceV <= 1;
  const boilOk = !isNaN(boilV) && boilV >= 99 && boilV <= 101;
  const pass = iceOk && boilOk;
  const bothEntered = !isNaN(iceV) && !isNaN(boilV);

  const save = async () => {
    setSaving(true);
    try {
      await api.logCalibration({
        staff,
        probe,
        iceC: iceV,
        boilC: boilV,
        status: pass ? "pass" : "fail",
        action: pass ? "" : action,
      });
      showToast("Calibration recorded ✓");
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
      <h2>Probe calibration</h2>
      <p className="lead">
        Monthly check. Ice water should read 0°C (±1°C). Boiling water should read 100°C (±1°C).
        A probe outside tolerance must be replaced or recalibrated before use.
      </p>

      <label className="fl">Probe</label>
      <select value={probe} onChange={(e) => setProbe(e.target.value)}>
        <option>Probe 1</option>
        <option>Probe 2</option>
        <option>Infrared thermometer</option>
      </select>

      <label className="fl">Ice water reading (°C)</label>
      <input type="number" inputMode="decimal" step="0.1" value={ice} onChange={(e) => setIce(e.target.value)} placeholder="Expected 0" />
      {!isNaN(iceV) && <span className={`pill ${iceOk ? "ok" : "fail"}`}>{iceOk ? "Within tolerance" : "Out of tolerance"}</span>}

      <label className="fl">Boiling water reading (°C)</label>
      <input type="number" inputMode="decimal" step="0.1" value={boil} onChange={(e) => setBoil(e.target.value)} placeholder="Expected 100" />
      {!isNaN(boilV) && <span className={`pill ${boilOk ? "ok" : "fail"}`}>{boilOk ? "Within tolerance" : "Out of tolerance"}</span>}

      {bothEntered && !pass && (
        <>
          <div className="warn">Probe is out of tolerance. Do not use it for critical checks until replaced or recalibrated.</div>
          <label className="fl">Action taken</label>
          <textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g. probe taken out of use, replacement ordered…" />
        </>
      )}

      <button className="btn" disabled={!bothEntered || (!pass && !action.trim()) || saving} onClick={save}>
        {saving ? "Saving…" : "Save calibration"}
      </button>
    </div>
  );
}
