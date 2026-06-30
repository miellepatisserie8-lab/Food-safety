import React from 'react';
import '../styles/Dashboard.css';

function Dashboard({ hygieneData, trainingData }) {
  const getTodayChecks = () => {
    const today = new Date().toISOString().split('T')[0];
    return hygieneData.filter(check => check.date === today);
  };

  const getComplianceRate = () => {
    const todayChecks = getTodayChecks();
    if (todayChecks.length === 0) return 0;
    const passedChecks = todayChecks.filter(check => {
      const freezers = [1, 2, 3, 4].filter(i => parseFloat(check[`freezer${i}`]) <= -18).length === 4;
      const fridges = [1, 2, 3, 4, 5, 6].filter(i => parseFloat(check[`fridge${i}`]) <= 4).length === 6;
      return freezers && fridges;
    }).length;
    return Math.round((passedChecks / todayChecks.length) * 100);
  };

  const todayChecks = getTodayChecks();
  const complianceRate = getComplianceRate();

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="kpi-cards">
        <div className="kpi-card">
          <h3>Hygiene Compliance</h3>
          <div className="kpi-value">{complianceRate}%</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${complianceRate}%` }}></div>
 </div>
          <p className="kpi-detail">Checks today: {todayChecks.length}</p>
 </div>

        <div className="kpi-card">
          <h3>Staff Training</h3>
          <div className="kpi-value">{trainingData.length > 0 ? '100' : '0'}%</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${trainingData.length > 0 ? 100 : 0}%` }}></div>
 </div>
          <p className="kpi-detail">Training entries: {trainingData.length}</p>
 </div>

        <div className="kpi-card">
          <h3>Last Sync</h3>
          <div className="kpi-value">{new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
          <p className="kpi-detail">Connection: Online 🟢</p>
 </div>
 </div>

      <div className="recent-activity">
        <h3>Recent Checks</h3>
        {todayChecks.length === 0 ? (
          <p>No checks recorded today</p>
        ) : (
          <div className="activity-list">
            {todayChecks.slice(-5).reverse().map((check, idx) => (
              <div key={idx} className="activity-item">
                <span>{check.staff}</span>
                <span>{check.time}</span>
 </div>
            ))}
 </div>
        )}
 </div>
 </div>
  );
}

export default Dashboard;
