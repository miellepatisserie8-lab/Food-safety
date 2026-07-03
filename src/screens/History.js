import Guide from "../components/Guide";
import React, { useState } from "react";
import { SHEET_URL } from "../config";

function dayKey(d) {
  return d.toISOString().slice(0, 10);
}

export default function History({ history, refreshHistory, onBack }) {
  const [selected, setSelected] = useState(null);
  const days = history && history.days ? history.days : {};
  const recent = history && history.recent ? history.recent : [];

  const cells = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    const rec = days[k];
    let cls = "miss";
    let mark = "–";
    if (rec) {
      const full = rec.opening && rec.closing && (rec.temps || 0) > 0;
      const some = rec.opening || rec.closing || (rec.temps || 0) > 0 || (rec.cleaning || 0) > 0;
      if (full) { cls = "ok"; mark = "✓"; }
      else if (some) { cls = "part"; mark = "•"; }
    }
    cells.push({ k, d, cls, mark });
  }

  const sel = selected && days[selected];

  return (
    <div className="screen">
      <button className="back" onClick={onBack}>‹ Back</button>
      <h2>Records & history</h2>
      <p className="lead">Last 28 days. Green = full day complete, amber = partial, red = nothing recorded. Show this screen to an inspector.</p>
      <Guide id="history" />

      <div className="today-strip" style={{ flexWrap: "wrap" }}>
        {cells.map((c) => (
          <button
            key={c.k}
            className="day-dot"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            onClick={() => setSelected(c.k)}
          >
            <div className={`c ${c.cls}`}>{c.mark}</div>
            {c.d.getDate()}
          </button>
        ))}
      </div>

      {selected && (
        <div className="card">
          <strong>{new Date(selected).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</strong>
          {sel ? (
            <div style={{ marginTop: 8, fontSize: 14 }}>
              <div>Opening checks: <span className={`pill ${sel.opening ? "ok" : "fail"}`}>{sel.opening ? "Done" : "Missing"}</span></div>
              <div style={{ marginTop: 6 }}>Closing checks: <span className={`pill ${sel.closing ? "ok" : "fail"}`}>{sel.closing ? "Done" : "Missing"}</span></div>
              <div style={{ marginTop: 6 }}>Appliance temps: <span className={`pill ${(sel.temps || 0) > 0 ? "ok" : "fail"}`}>{sel.temps || 0}</span></div>
              <div style={{ marginTop: 6 }}>Food probe checks: <span className={`pill ${(sel.foodTemps || 0) > 0 ? "ok" : "due"}`}>{sel.foodTemps || 0}</span></div>
              <div style={{ marginTop: 6 }}>Deliveries logged: <span className={`pill ${(sel.deliveries || 0) > 0 ? "ok" : "due"}`}>{sel.deliveries || 0}</span></div>
              <div style={{ marginTop: 6 }}>Cleaning sign-offs: <span className={`pill ${(sel.cleaning || 0) > 0 ? "ok" : "due"}`}>{sel.cleaning || 0}</span></div>
            </div>
          ) : (
            <div className="empty">No records for this day.</div>
          )}
        </div>
      )}

      <div className="section-title">Latest entries</div>
      {recent.length === 0 && <div className="empty">No entries loaded yet.</div>}
      {recent.map((r, i) => (
        <div className="hist-row" key={i}>
          <div>
            <div>{r.summary}</div>
            <div className="when">{r.staff}</div>
          </div>
          <div className="when">{r.when}</div>
        </div>
      ))}

      {SHEET_URL && (
        <a
          className="btn"
          href={SHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none", textAlign: "center", display: "block" }}
        >
          📊 View the data in Google Sheets
        </a>
      )}
      <button className="btn ghost" onClick={refreshHistory}>Refresh records</button>
    </div>
  );
}
