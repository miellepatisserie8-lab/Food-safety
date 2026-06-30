import React, { useState, useEffect } from 'react';
import '../styles/HygieneChecklist.css';

// Default targets - pre-filled so a check can be confirmed with one press
const FREEZER_DEFAULT = '-18';
const FRIDGE_DEFAULT = '4';

const buildDefaults = (staff) => ({
  date: new Date().toISOString().split('T')[0],
  time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  staff,
  freezer1: FREEZER_DEFAULT,
  freezer2: FREEZER_DEFAULT,
  freezer3: FREEZER_DEFAULT,
  freezer4: FREEZER_DEFAULT,
  fridge1: FRIDGE_DEFAULT,
  fridge2: FRIDGE_DEFAULT,
  fridge3: FRIDGE_DEFAULT,
  fridge4: FRIDGE_DEFAULT,
  fridge5: FRIDGE_DEFAULT,
  fridge6: FRIDGE_DEFAULT,
  kitchenCleaned: '',
  toiletCleaned: '',
  allergenChecked: '',
  notes: ''
});

function HygieneChecklist({ selectedStaff, onSubmit, recentChecks }) {
  const [formData, setFormData] = useState(buildDefaults(selectedStaff));

  const [freezersOpen, setFreezersOpen] = useState(true);
  const [fridgesOpen, setFridgesOpen] = useState(true);

  useEffect(() => {
    setFormData(prev => ({ ...prev, staff: selectedStaff }));
  }, [selectedStaff]);

  const getStatus = (temp, minTemp, warningLow, warningHigh) => {
    const t = parseFloat(temp);
    if (isNaN(t)) return 'none';
    if (t <= minTemp) return 'ok';
    if (t >= warningLow && t <= warningHigh) return 'warning';
    return 'fail';
  };

  const getStatusIcon = (status) => {
    if (status === 'ok') return '✓';
    if (status === 'warning') return '⚠️';
    if (status === 'fail') return '🔴';
    return '';
  };

  // Step a temperature up or down by 0.5C, keeping it tidy
  const adjustTemp = (field, delta) => {
    const cur = parseFloat(formData[field]);
    const base = isNaN(cur) ? 0 : cur;
    const next = Math.round((base + delta) * 10) / 10;
    setFormData(prev => ({ ...prev, [field]: String(next) }));
  };

  const freezerStatus = {
    f1: getStatus(formData.freezer1, -18, -18, -15),
    f2: getStatus(formData.freezer2, -18, -18, -15),
    f3: getStatus(formData.freezer3, -18, -18, -15),
    f4: getStatus(formData.freezer4, -18, -18, -15),
  };

  const fridgeStatus = {
    r1: getStatus(formData.fridge1, 4, 4, 6),
    r2: getStatus(formData.fridge2, 4, 4, 6),
    r3: getStatus(formData.fridge3, 4, 4, 6),
    r4: getStatus(formData.fridge4, 4, 4, 6),
    r5: getStatus(formData.fridge5, 4, 4, 6),
    r6: getStatus(formData.fridge6, 4, 4, 6),
  };

  const freezerIssues = Object.values(freezerStatus).filter(s => s !== 'ok').length;
  const fridgeIssues = Object.values(fridgeStatus).filter(s => s !== 'ok').length;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    alert('✓ Hygiene check submitted!');
    setFormData(buildDefaults(selectedStaff));
  };

  const handleClear = () => {
    setFormData(buildDefaults(selectedStaff));
  };

  // Reusable stepper: [-] input [+]
  const TempStepper = ({ field, value, step = 0.5 }) => (
    <div className="temp-stepper">
      <button type="button" className="step-btn" aria-label="Lower temperature"
        onClick={() => adjustTemp(field, -step)}>{'−'}</button>
      <input
        type="number"
        step="0.1"
        inputMode="decimal"
        placeholder="°C"
        value={value}
        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
      />
      <button type="button" className="step-btn" aria-label="Raise temperature"
        onClick={() => adjustTemp(field, step)}>+</button>
 </div>
  );

  return (
    <div className="hygiene-checklist">
      <h2>Hygiene Checklist</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Staff:</label>
          <select value={formData.staff} onChange={(e) => setFormData({...formData, staff: e.target.value})}>
            <option value="">Select Staff</option>
            <option value="Paul">Paul</option>
            <option value="Eva">Eva</option>
            <option value="Ryan">Ryan</option>
            <option value="Aiden">Aiden</option>
 </select>
 </div>

        <div className="form-row">
          <div className="form-group">
            <label>Time:</label>
            <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
 </div>
          <div className="form-group">
            <label>Date:</label>
            <input type="date" value={formData.date} readOnly />
 </div>
 </div>

        {/* FREEZERS */}
        <div className="collapsible-card">
          <button type="button" className="card-header" onClick={() => setFreezersOpen(!freezersOpen)}>
            <span>{'❄️'} FREEZERS {freezersOpen ? '▼' : '▶'}</span>
            {freezerIssues > 0 && <span className="issue-badge">{freezerIssues} issue(s)</span>}
 </button>
          {freezersOpen && (
            <div className="card-content">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`temp-input freezer-${i} status-${freezerStatus[`f${i}`]}`}>
                  <label>Freezer {i}: {getStatusIcon(freezerStatus[`f${i}`])}</label>
                  <TempStepper field={`freezer${i}`} value={formData[`freezer${i}`]} />
                  <small>Target: ≤-18°C</small>
 </div>
              ))}
 </div>
          )}
 </div>

        {/* FRIDGES */}
        <div className="collapsible-card">
          <button type="button" className="card-header" onClick={() => setFridgesOpen(!fridgesOpen)}>
            <span>{'🧊'} FRIDGES {fridgesOpen ? '▼' : '▶'}</span>
            {fridgeIssues > 0 && <span className="issue-badge">{fridgeIssues} issue(s)</span>}
 </button>
          {fridgesOpen && (
            <div className="card-content">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`temp-input fridge-${i} status-${fridgeStatus[`r${i}`]}`}>
                  <label>Fridge {i}: {getStatusIcon(fridgeStatus[`r${i}`])}</label>
                  <TempStepper field={`fridge${i}`} value={formData[`fridge${i}`]} />
                  <small>Target: ≤4°C</small>
 </div>
              ))}
 </div>
          )}
 </div>

        {/* OTHER CHECKS */}
        <div className="form-group">
          <label>Kitchen Cleaned:</label>
          <div className="radio-group">
            <label><input type="radio" name="kitchenCleaned" value="Yes" checked={formData.kitchenCleaned === 'Yes'} onChange={(e) => setFormData({...formData, kitchenCleaned: e.target.value})} /> Yes</label>
            <label><input type="radio" name="kitchenCleaned" value="No" checked={formData.kitchenCleaned === 'No'} onChange={(e) => setFormData({...formData, kitchenCleaned: e.target.value})} /> No</label>
 </div>
 </div>

        <div className="form-group">
          <label>Toilet Cleaned:</label>
          <div className="radio-group">
            <label><input type="radio" name="toiletCleaned" value="Yes" checked={formData.toiletCleaned === 'Yes'} onChange={(e) => setFormData({...formData, toiletCleaned: e.target.value})} /> Yes</label>
            <label><input type="radio" name="toiletCleaned" value="No" checked={formData.toiletCleaned === 'No'} onChange={(e) => setFormData({...formData, toiletCleaned: e.target.value})} /> No</label>
          </div>
        </div>

        <div className="form-group">
          <label>Allergen Labels Checked:</label>
          <div className="radio-group">
            <label><input type="radio" name="allergenChecked" value="Yes" checked={formData.allergenChecked === 'Yes'} onChange={(e) => setFormData({...formData, allergenChecked: e.target.value})} /> Yes</label>
            <label><input type="radio" name="allergenChecked" value="No" checked={formData.allergenChecked === 'No'} onChange={(e) => setFormData({...formData, allergenChecked: e.target.value})} /> No</label>
 </div>
 </div>

        <div className="form-group">
          <label>Notes:</label>
          <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Optional notes..." />
 </div>

        <div className="form-buttons">
          <button type="submit" className="btn btn-primary">SUBMIT</button>
          <button type="button" className="btn btn-secondary" onClick={handleClear}>RESET</button>
 </div>
 </form>

      {recentChecks.length > 0 && (
        <div className="recent-checks">
          <h3>Recent Checks</h3>
          {recentChecks.slice(-3).reverse().map((check, idx) => (
            <div key={idx} className="check-item">
              <span>{check.staff} - {check.time}</span>
 </div>
          ))}
 </div>
      )}
 </div>
  );
}

export default HygieneChecklist;
