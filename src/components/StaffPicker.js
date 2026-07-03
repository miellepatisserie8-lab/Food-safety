import React, { useEffect, useState } from "react";
import { api } from "../api";
import { STAFF_PINS } from "../config";

const FALLBACK = ["Manager", "Paul", "Eva", "Ryan", "Aiden"];

export default function StaffPicker({ current, onPick, onClose }) {
  const [names, setNames] = useState(FALLBACK);
  const [pending, setPending] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getStaff()
      .then((d) => Array.isArray(d.staff) && d.staff.length && setNames(d.staff))
      .catch(() => {});
  }, []);

  const selectName = (n) => {
    setError("");
    if (STAFF_PINS[n]) {
      setPending(n);
      setPin("");
    } else {
      onPick(n);
    }
  };

  const submitPin = () => {
    if (pin === STAFF_PINS[pending]) {
      const name = pending;
      setPending(null);
      setPin("");
      setError("");
      onPick(name);
    } else {
      setError("Wrong PIN. Try again.");
      setPin("");
    }
  };

  if (pending) {
    return (
      <div className="modal-bg" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h3>Enter PIN for {pending}</h3>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            maxLength={6}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && submitPin()}
            placeholder="PIN"
          />
          {error && <div className="warn">{error}</div>}
          <button className="btn" onClick={submitPin}>Confirm</button>
          <button
            className="staff-option"
            onClick={() => {
              setPending(null);
              setPin("");
              setError("");
            }}
          >
            ‹ Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Who is completing checks?</h3>
        {names.map((n) => (
          <button key={n} className={`staff-option ${n === current ? "sel" : ""}`} onClick={() => selectName(n)}>
            👤 {n}
          </button>
        ))}
      </div>
    </div>
  );
}
