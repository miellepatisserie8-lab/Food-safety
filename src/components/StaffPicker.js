import React, { useEffect, useState } from "react";
import { api } from "../api";

const FALLBACK = ["Paul", "Eva", "Ryan", "Aiden"];

export default function StaffPicker({ current, onPick, onClose }) {
  const [names, setNames] = useState(FALLBACK);

  useEffect(() => {
    api
      .getStaff()
      .then((d) => Array.isArray(d.staff) && d.staff.length && setNames(d.staff))
      .catch(() => {});
  }, []);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Who is completing checks?</h3>
        {names.map((n) => (
          <button key={n} className={`staff-option ${n === current ? "sel" : ""}`} onClick={() => onPick(n)}>
            👤 {n}
          </button>
        ))}
      </div>
    </div>
  );
}
