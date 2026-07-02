import React, { useState } from "react";
import { GUIDES } from "../guides";

export default function Guide({ id }) {
  const [open, setOpen] = useState(false);
  const g = GUIDES[id];
  if (!g) return null;

  return (
    <div className={`guide ${open ? "open" : ""}`}>
      <button className="guide-toggle" onClick={() => setOpen(!open)}>
        <span>ⓘ {g.title}</span>
        <span className="chev">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <ul className="guide-list">
          {g.points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
