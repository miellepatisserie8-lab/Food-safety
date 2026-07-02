import React, { useState } from "react";
import { DELIVERY_LIMITS } from "../config";
import { api } from "../api";

export default function Deliveries({ staff, showToast, refreshHistory, onBack }) {
  const [supplier, setSupplier] = useState("");
  const [invoice, setInvoice] = useState("");
  const [category, setCategory] = useState("chilled");
  const [temp, setTemp] = useState("");
  const [intact, setIntact] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const lim = DELIVERY_LIMITS[category];
  const needsTemp = category !== "ambient";
  const val = parseFloat(temp);
  const tempOk = !needsTemp || (!isNaN(val) && val <= lim.max);
  const accepted = tempOk && intact === true;
  const ready =
    supplier.trim() &&
    intact !== null &&
    (!needsTemp || !isNaN(val)) &&
    (accepted || note.trim());

  const save = async () => {
    setSaving(true);
    try {
      await api.logDelivery({
        staff,
        supplier,
        invoice,
        category: lim.label,
        tempC: needsTemp ? val : "",
        intact: intact ? "yes" : "no",
        status: accepted ? "accepted" : "rejected/action",
        note,
      });
      showToast(accepted ? "Delivery accepted ✓" : "Delivery issue recorded ✓");
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
      <h2>Delivery / goods-in</h2>
      <p className="lead">Check every delivery before signing. Keep the supplier's allergen spec sheet on file for any new product.</p>

      <label className="fl">Supplier</label>
      <input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g. Beer Trading Company, dim sum supplier" />

      <label className="fl">Invoice / delivery note number (optional)</label>
      <input value={invoice} onChange={(e) => setInvoice(e.target.value)} />

      <label className="fl">Delivery type</label>
      <div className="yn" style={{ marginBottom: 4 }}>
        {Object.entries(DELIVERY_LIMITS).map(([k, v]) => (
          <button key={k} className={`yes ${category === k ? "sel" : ""}`} onClick={() => setCategory(k)}>
            {v.label}
          </button>
        ))}
      </div>
      <div className="range-hint" style={{ textAlign: "left" }}>{lim.target}</div>

      {needsTemp && (
        <>
          <label className="fl">Probe temperature between packs (°C)</label>
          <input type="number" inputMode="decimal" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} />
          {!isNaN(val) && !tempOk && <div className="warn">Above the acceptance limit — reject the item or record the action taken.</div>}
        </>
      )}

      <label className="fl">Packaging intact, in date, and vehicle clean?</label>
      <div className="yn">
        <button className={`yes ${intact === true ? "sel" : ""}`} onClick={() => setIntact(true)}>Yes</button>
        <button className={`no ${intact === false ? "sel" : ""}`} onClick={() => setIntact(false)}>No</button>
      </div>

      {!accepted && intact !== null && (!needsTemp || !isNaN(val)) && (
        <>
          <label className="fl">Problem and action taken</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. two boxes rejected and returned with driver, supplier notified…" />
        </>
      )}

      <button className="btn" disabled={!ready || saving} onClick={save}>
        {saving ? "Saving…" : accepted ? "Accept delivery" : "Record delivery issue"}
      </button>
    </div>
  );
}
