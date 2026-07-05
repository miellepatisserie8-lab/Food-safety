import React, { useState } from "react";
import { MANAGER_PASSCODE, FIRE_MARSHAL_CONTACT, MANAGER_PHONE } from "../config";

export default function Manager({ onBack, orders = [] }) {
  // v3.0 — weekly cake order money summary
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const active = orders.filter((o) => o.status !== "Collected" && o.status !== "Cancelled");
  const takenThisWeek = orders.filter((o) => new Date(o.createdAt) >= weekAgo && o.status !== "Cancelled").length;
  const cancelledThisWeek = orders.filter((o) => o.status === "Cancelled" && new Date(o.updatedAt || o.createdAt) >= weekAgo).length;
  const depositsHeld = active.reduce((s, o) => s + Number(o.deposit || 0), 0);
  const balanceOutstanding = active.reduce((s, o) => s + Math.max(0, Number(o.price || 0) - Number(o.deposit || 0)), 0);
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
          Deputy Fire Marshal: {FIRE_MARSHAL_CONTACT || "Not set — add REACT_APP_FIRE_MARSHAL_CONTACT in Vercel"}.<br />
          Manager on duty: {MANAGER_PHONE || "Not set — add REACT_APP_MANAGER_PHONE in Vercel"}.<br />
          Evacuation drill: last Wednesday of each month.<br />
          Electric cooking only — <strong>no gas on the premises</strong>.
        </p>
      </div>

      <div className="card">
        <strong>Cake orders — money at a glance</strong>
        <div className="pay-row"><span>New orders (last 7 days)</span><span>{takenThisWeek}</span></div>
        <div className="pay-row"><span>Cancellations (last 7 days)</span><span>{cancelledThisWeek}</span></div>
        <div className="pay-row"><span>Deposits held (open orders)</span><span>£{depositsHeld.toFixed(2)}</span></div>
        <div className="pay-row total"><span>Balance still to take</span><span>£{balanceOutstanding.toFixed(2)}</span></div>
      </div>

      <div className="card">
        <strong>Data &amp; records</strong>
        <p style={{ fontSize: 14, margin: "6px 0 0" }}>
          All records save to your connected Google Sheet. Open it directly to export CSVs
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
