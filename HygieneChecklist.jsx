import React, { useState } from 'react';
import { pushRow, loadLocal, saveLocal, toAllergenRow } from '../api/sheets';
import '../styles/Allergens.css';

const SEED_SUPPLIERS = [
  { name: 'Beer Trading', version: 'v2.1', date: '2026-07-08', link: '', status: 'Current' },
  { name: 'Dim Sum Vendor A', version: 'v1.0', date: '2026-06-15', link: '', status: 'Overdue' }
];

function Allergens() {
  // Persisted per-device; seeded on first run.
  const [suppliers, setSuppliers] = useState(() => {
    const saved = loadLocal('allergens');
    return saved.length ? saved : SEED_SUPPLIERS;
  });

  const [newSupplier, setNewSupplier] = useState({ name: '', version: '', date: '', link: '' });

  const persist = (list) => {
    setSuppliers(list);
    saveLocal('allergens', list);
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (newSupplier.name && newSupplier.version && newSupplier.date) {
      const dateObj = new Date(newSupplier.date);
      const today = new Date();
      const daysOld = Math.floor((today - dateObj) / (1000 * 60 * 60 * 24));
      const status = daysOld <= 30 ? 'Current' : 'Overdue';

      const record = { ...newSupplier, status };
      persist([...suppliers, record]);
      pushRow('Allergens', toAllergenRow(record));
      setNewSupplier({ name: '', version: '', date: '', link: '' });
      alert('✓ Supplier added!');
    }
  };

  return (
    <div className="allergens">
      <h2>Allergen Library</h2>

      <div className="add-supplier-form">
        <h3>Add New Supplier</h3>
        <form onSubmit={handleAddSupplier}>
          <div className="form-group">
            <label>Supplier Name:</label>
            <input
              type="text"
              value={newSupplier.name}
              onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
              required
            />
 </div>
          <div className="form-group">
            <label>Version:</label>
            <input
              type="text"
              placeholder="e.g. v1.0"
              value={newSupplier.version}
              onChange={(e) => setNewSupplier({...newSupplier, version: e.target.value})}
              required
            />
 </div>
          <div className="form-group">
            <label>Date Updated:</label>
            <input
              type="date"
              value={newSupplier.date}
              onChange={(e) => setNewSupplier({...newSupplier, date: e.target.value})}
              required
            />
 </div>
          <div className="form-group">
            <label>Document Link:</label>
            <input
              type="url"
              placeholder="https://..."
              value={newSupplier.link}
              onChange={(e) => setNewSupplier({...newSupplier, link: e.target.value})}
            />
 </div>
          <button type="submit" className="btn btn-primary">ADD SUPPLIER</button>
 </form>
 </div>

      <div className="suppliers-list">
        <h3>Current Suppliers</h3>
        {suppliers.map((supplier, idx) => (
          <div key={idx} className={`supplier-card status-${supplier.status.toLowerCase()}`}>
            <div className="supplier-header">
              <h4>{supplier.name}</h4>
              <span className={`status-badge ${supplier.status.toLowerCase()}`}>{supplier.status}</span>
 </div>
            <div className="supplier-details">
              <p><strong>Version:</strong> {supplier.version}</p>
              <p><strong>Updated:</strong> {supplier.date}</p>
              {supplier.link && <p><a href={supplier.link} target="_blank" rel="noopener noreferrer">[View Document]</a></p>}
 </div>
 </div>
        ))}
 </div>
 </div>
  );
}

export default Allergens;
