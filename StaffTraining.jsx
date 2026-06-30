import React, { useState } from 'react';
import { pushRow, loadLocal, saveLocal, toHaccpRow, toHaccpDocRow } from '../api/sheets';
import '../styles/Haccp.css';

const STAFF = ['Paul', 'Eva', 'Ryan', 'Aiden'];

const blankStep = () => ({
  processStep: '',
  hazard: '',
  controlMeasure: '',
  criticalLimit: '',
  monitoring: '',
  correctiveAction: '',
  addedBy: '',
  date: new Date().toISOString().split('T')[0],
});

function Haccp() {
  const [tab, setTab] = useState('build');
  const [steps, setSteps] = useState(() => loadLocal('haccp'));
  const [docs, setDocs] = useState(() => loadLocal('haccpdocs'));
  const [step, setStep] = useState(blankStep());
  const [doc, setDoc] = useState({ name: '', link: '', addedBy: '' });

  const setS = (k, v) => setStep(prev => ({ ...prev, [k]: v }));

  const submitStep = (e) => {
    e.preventDefault();
    if (!step.processStep) { alert('Please enter a process step.'); return; }
    const next = [...steps, step];
    setSteps(next); saveLocal('haccp', next);
    pushRow('HACCP_Plan', toHaccpRow(step));
    alert('✓ HACCP step saved!');
    setStep(blankStep());
  };

  const submitDoc = (e) => {
    e.preventDefault();
    if (!doc.name || !doc.link) { alert('Please add a name and a link.'); return; }
    const next = [...docs, doc];
    setDocs(next); saveLocal('haccpdocs', next);
    pushRow('HACCP_Docs', toHaccpDocRow(doc));
    alert('✓ Plan document added!');
    setDoc({ name: '', link: '', addedBy: '' });
  };

  return (
    <div className="haccp">
      <h2>HACCP</h2>
      <p className="haccp-intro">A HACCP plan ensures all your processes are compliant with food safety regulations.</p>

      <div className="haccp-tabs">
        <button className={`haccp-tab ${tab === 'build' ? 'active' : ''}`} onClick={() => setTab('build')}>Build a Plan</button>
        <button className={`haccp-tab ${tab === 'docs' ? 'active' : ''}`} onClick={() => setTab('docs')}>View / Upload Plan</button>
      </div>

      {tab === 'build' && (
        <div className="haccp-panel">
          <form onSubmit={submitStep}>
            <div className="form-group"><label>Process Step:</label>
              <input type="text" value={step.processStep} onChange={(e) => setS('processStep', e.target.value)} placeholder="e.g. Cold storage" /></div>
            <div className="form-group"><label>Hazard:</label>
              <input type="text" value={step.hazard} onChange={(e) => setS('hazard', e.target.value)} placeholder="e.g. Bacterial growth" /></div>
            <div className="form-group"><label>Control Measure:</label>
              <input type="text" value={step.controlMeasure} onChange={(e) => setS('controlMeasure', e.target.value)} placeholder="e.g. Keep fridge ≤4°C" /></div>
            <div className="form-group"><label>Critical Limit:</label>
              <input type="text" value={step.criticalLimit} onChange={(e) => setS('criticalLimit', e.target.value)} placeholder="e.g. 4°C max" /></div>
            <div className="form-group"><label>Monitoring:</label>
              <input type="text" value={step.monitoring} onChange={(e) => setS('monitoring', e.target.value)} placeholder="e.g. Twice-daily temp check" /></div>
            <div className="form-group"><label>Corrective Action:</label>
              <input type="text" value={step.correctiveAction} onChange={(e) => setS('correctiveAction', e.target.value)} placeholder="e.g. Discard, call engineer" /></div>
            <div className="form-group"><label>Added By:</label>
              <select value={step.addedBy} onChange={(e) => setS('addedBy', e.target.value)}>
                <option value="">Select Staff</option>
                {STAFF.map(s => <option key={s} value={s}>{s}</option>)}
              </select></div>
            <div className="form-buttons"><button type="submit" className="btn btn-primary">SAVE STEP</button></div>
          </form>

          {steps.length > 0 && (
            <div className="haccp-list">
              <h3>Plan Steps</h3>
              {steps.slice().reverse().map((s, i) => (
                <div key={i} className="haccp-item">
                  <strong>{s.processStep}</strong>
                  <div className="haccp-meta">Hazard: {s.hazard || '—'} · Limit: {s.criticalLimit || '—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'docs' && (
        <div className="haccp-panel">
          <p className="haccp-help">Add a link to your HACCP plan document (e.g. a Google Drive or Dropbox share link).</p>
          <form onSubmit={submitDoc}>
            <div className="form-group"><label>Document Name:</label>
              <input type="text" value={doc.name} onChange={(e) => setDoc({ ...doc, name: e.target.value })} placeholder="e.g. Mielle HACCP Plan 2026" /></div>
            <div className="form-group"><label>Link:</label>
              <input type="url" value={doc.link} onChange={(e) => setDoc({ ...doc, link: e.target.value })} placeholder="https://..." /></div>
            <div className="form-group"><label>Added By:</label>
              <select value={doc.addedBy} onChange={(e) => setDoc({ ...doc, addedBy: e.target.value })}>
                <option value="">Select Staff</option>
                {STAFF.map(s => <option key={s} value={s}>{s}</option>)}
              </select></div>
            <div className="form-buttons"><button type="submit" className="btn btn-primary">ADD PLAN LINK</button></div>
          </form>

          {docs.length > 0 && (
            <div className="haccp-list">
              <h3>Plan Documents</h3>
              {docs.slice().reverse().map((d, i) => (
                <div key={i} className="haccp-item">
                  <strong>{d.name}</strong>
                  <div className="haccp-meta"><a href={d.link} target="_blank" rel="noopener noreferrer">View document</a></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Haccp;
