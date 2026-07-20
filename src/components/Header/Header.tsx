// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React from 'react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './Header.css';
import AdminNav from '../AdminNav/AdminNav';

const Header = ({ title = 'Gatcha API' }) => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className={`header header-${theme}`}>
      <div className="header-toolbar">
        <span className="header-title">{title}</span>
        <div className="header-actions">
          <AdminNav />
          {user && <span className="header-username">{user.username}</span>}
          {user && (
            <button onClick={logout} className="header-logout">
              Logout
            </button>
          )}
          <div className="header-theme-toggle">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
