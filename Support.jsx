import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

function Header({ selectedStaff, onMenuToggle, menuOpen }) {
  const navigate = useNavigate();
  const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="hamburger"
          onClick={onMenuToggle}
          aria-label="Menu"
        >
          ☰
 </button>
        <img
          src="https://drive.google.com/uc?id=1RvhZ5xZ5xZ5xZ5xZ5xZ5xZ5xZ5xZ5xZ"
          alt="Mielle"
          className="logo"
          onClick={() => navigate('/')}
        />
 </div>
      <h1 className="app-title">Mielle Kitchen</h1>
      <div className="header-right">
        <span className="time">{currentTime}</span>
        <span className="connection-status online">🟢</span>
 </div>
 </header>
  );
}

export default Header;
