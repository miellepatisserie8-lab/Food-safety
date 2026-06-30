import React, { useState } from 'react';
import { pushRow, loadLocal, saveLocal, toCertRow } from '../api/sheets';
import '../styles/Certificates.css';

// Certificates bundled with the app (placed in public/certificates/)
const BUILT_IN = [
  {
    name: 'Level 2 Food Hygiene & Safety (Catering)',
    holder: 'Paul Chan',
    expiry: '',
    link: '/certificates/paul-chan-level-2-food-hygiene.pdf',
    builtIn: true,
  },
];

const STAFF = ['Paul', 'Eva', 'Ryan', 'Aiden'];

function Certificates() {
  const [added, setAdded] = useState(() => loadLocal('certificates'));
  const [form, setForm] = useState({ name: '', holder: '', expiry: '', link: '' });

  const all = [...BUILT_IN, ...added];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.link) { alert('Please add a certificate name and a link.'); return; }
    const next = [...added, form];
    setAdded(next); saveLocal('certificates', next);
    pushRow('Certificates', toCertRow(form));
    alert('✓ Certificate added!');
    setForm({ name: '', holder: '', expiry: '', link: '' });
  };

  return (
    <div className="certificates">
      <h2>Food Safety Certificates</h2>
      <p className="cert-intro">View staff training and food safety certificates.</p>

      <div className="cert-list">
        {all.map((c, i) => (
          <div key={i} className="cert-card">
            <div className="cert-icon">🏅</div>
            <div className="cert-body">
              <strong>{c.name}</strong>
              <div className="cert-meta">
                {c.holder ? c.holder : 'Mielle Patisserie'}{c.expiry ? ` · expires ${c.expiry}` : ''}
              </div>
              <a href={c.link} target="_blank" rel="noopener noreferrer" className="cert-view">View certificate</a>
            </div>
          </div>
        ))}
      </div>

      <div className="cert-add">
        <h3>Add a Certificate</h3>
        <p className="cert-help">Upload your certificate to Google Drive (or similar), set the link to "anyone with the link can view", then paste it here.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Certificate Name:</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Level 2 Food Hygiene" /></div>
          <div className="form-group"><label>Holder / Staff:</label>
            <input type="text" value={form.holder} onChange={(e) => setForm({ ...form, holder: e.target.value })} placeholder="e.g. Eva" /></div>
          <div className="form-group"><label>Expiry Date:</label>
            <input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} /></div>
          <div className="form-group"><label>Link:</label>
            <input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." /></div>
          <div className="form-buttons"><button type="submit" className="btn btn-primary">ADD CERTIFICATE</button></div>
        </form>
      </div>
    </div>
  );
}

export default Certificates;
