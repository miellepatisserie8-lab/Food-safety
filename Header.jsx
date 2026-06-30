import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Home from './components/Home';
import HygieneChecklist from './components/HygieneChecklist';
import StaffTraining from './components/StaffTraining';
import Allergens from './components/Allergens';
import Dashboard from './components/Dashboard';
import Support from './components/Support';
import Haccp from './components/Haccp';
import Certificates from './components/Certificates';
import Login from './components/Login';
import {
  pushRow,
  flushQueue,
  loadLocal,
  saveLocal,
  toHygieneRow,
  toTrainingRow,
} from './api/sheets';
import './styles/App.css';

function App() {
  const [authed, setAuthed] = useState(() => {
    try { return localStorage.getItem('mielle_auth') === '1'; } catch (e) { return false; }
  });
  const [selectedStaff, setSelectedStaff] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [hygieneData, setHygieneData] = useState(() => loadLocal('hygiene'));
  const [trainingData, setTrainingData] = useState(() => loadLocal('training'));

  // On startup, resend anything queued while offline / before setup.
  useEffect(() => {
    flushQueue();
  }, []);

  const handleLogout = () => {
    try { localStorage.removeItem('mielle_auth'); } catch (e) {}
    setMenuOpen(false);
    setAuthed(false);
  };

  const handleHygieneSubmit = (data) => {
    const next = [...hygieneData, data];
    setHygieneData(next);
    saveLocal('hygiene', next);
    pushRow('Hygiene_Logs', toHygieneRow(data));
  };

  const handleTrainingSubmit = (data) => {
    const next = [...trainingData, data];
    setTrainingData(next);
    saveLocal('training', next);
    pushRow('Staff_Training', toTrainingRow(data));
  };

  if (!authed) {
    return (
      <div className="app">
        <Login onLogin={() => setAuthed(true)} />
 </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Header
          selectedStaff={selectedStaff}
          onMenuToggle={() => setMenuOpen(!menuOpen)}
          menuOpen={menuOpen}
        />
        <Navigation
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onLogout={handleLogout}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home selectedStaff={selectedStaff} setSelectedStaff={setSelectedStaff} lastCheck={hygieneData[hygieneData.length - 1]} />} />
            <Route path="/hygiene" element={<HygieneChecklist selectedStaff={selectedStaff} onSubmit={handleHygieneSubmit} recentChecks={hygieneData} />} />
            <Route path="/training" element={<StaffTraining onSubmit={handleTrainingSubmit} trainingData={trainingData} />} />
            <Route path="/allergens" element={<Allergens />} />
            <Route path="/dashboard" element={<Dashboard hygieneData={hygieneData} trainingData={trainingData} />} />
            <Route path="/haccp" element={<Haccp />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/support" element={<Support />} />
 </Routes>
 </main>
 </div>
 </Router>
  );
}

export default App;
