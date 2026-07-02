import React, { useState } from "react";
import { MANAGER_PASSCODE } from "../config";

export default function Manager({ onBack }) {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [err, setErr] = useState("");

  const tryUnlock = () => {
    if (MANAGER_PASSCODE && code === MANAGER_PASSCODE) {
      setUnlocked(true);
      setErr("");
    } else {
      setErr("Incorrect passcode.");
    }
  };

  if (!unlocked) {
    return (
      <div className="screen">
        <button className="back" onClick={onBack}>‹ Back</button>
        <h2>Manager area</h2>
        <p className="lead">Enter the manager passcode to continue.</p>
        <input
          type="password"
          inputMode="numeric"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Passcode"
          onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
        />
        {err && <div className="warn">{err}</div>}
        {!MANAGER_PASSCODE && (
          <div className="warn">No passcode is configured. Set REACT_APP_MANAGER_PASSCODE in Vercel environment variables.</div>
        )}
        <button className="btn" onClick={tryUnlock}>Unlock</button>
      </div>
    );
  }

  return (
    <div className="screen">
      <button className="back" onClick={onBack}>‹ Back</button>
      <h2>Manager area</h2>
      <p className="lead">Key compliance references for Mielle Patisserie Ltd.</p>

      <div className="card">
        <strong>Fire safety</strong>
        <p style={{ fontSize: 14, margin: "6px 0 0" }}>
          Assembly point: end of Naval Street on the Bengal Street crossover.<br />
          Deputy Fire Marshal: Ryan Chan — 07835 268903.<br />
          Manager on duty: 07514 272558.<br />
          Evacuation drill: last Wednesday of each month.<br />
          Electric cooking only — <strong>no gas on the premises</strong>.
        </p>
      </div>

      <div className="card">
        <strong>Data & records</strong>
        <p style={{ fontSize: 14, margin: "6px 0 0" }}>
          All records save to the "Mielle Kitchen Data" Google Sheet. Open the sheet directly to export CSVs
          for an EHO inspection or the new fire risk assessment (due 30 September 2026).
        </p>
      </div>

      <div className="card">
        <strong>Reminders</strong>
        <p style={{ fontSize: 14, margin: "6px 0 0" }}>
          Kitchen fire suppression / extraction servicing — book date.<br />
          Allergen spec sheets required from every dim sum supplier before switching products.
        </p>
      </div>
    </div>
  );
}
