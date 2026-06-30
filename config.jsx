import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home({ selectedStaff, setSelectedStaff, lastCheck }) {
  const staffList = ['Paul', 'Eva', 'Ryan', 'Aiden'];

  const getLastCheckText = () => {
    if (!lastCheck) return 'No checks yet today';
    const time = lastCheck.time;
    const staff = lastCheck.staff;
    return `Last check: Today ${time} by ${staff}`;
  };

  return (
    <div className="home">
      <div className="welcome-section">
        <h2>Welcome to Mielle Kitchen</h2>

 </div>

      <div className="staff-selector">
        <label>Select Staff</label>
        <select
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          className="staff-dropdown"
        >
          <option value="">-- Select Staff --</option>
          {staffList.map(staff => (
            <option key={staff} value={staff}>{staff}</option>
          ))}
 </select>
 </div>

      <div className="last-check">
        <p>{getLastCheckText()}</p>
 </div>

      <div className="quick-actions">
        <Link to="/hygiene" className="action-button">
          <span className="action-icon">📋</span>
          <span className="action-label">Hygiene Checklist</span>
        </Link>
        <Link to="/dashboard" className="action-button">
          <span className="action-icon">📊</span>
          <span className="action-label">Dashboard</span>
        </Link>
        <Link to="/training" className="action-button">
          <span className="action-icon">🎓</span>
          <span className="action-label">Training</span>
        </Link>
        <Link to="/allergens" className="action-button">
          <span className="action-icon">🥜</span>
          <span className="action-label">Allergens</span>
        </Link>
        <Link to="/haccp" className="action-button">
          <span className="action-icon">🛡️</span>
          <span className="action-label">HACCP</span>
        </Link>
        <Link to="/certificates" className="action-button">
          <span className="action-icon">🏅</span>
          <span className="action-label">Certificates</span>
        </Link>
        <Link to="/support" className="action-button">
          <span className="action-icon">🎧</span>
          <span className="action-label">Support</span>
        </Link>
      </div>
 </div>
  );
}

export default Home;
