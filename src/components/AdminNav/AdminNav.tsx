// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminNav.css';

const AdminNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (user?.role !== 'ADMIN') {
    return null;
  }

  const isActive = (path) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(path);

  return (
    <div className="admin-nav">
      <button
        className={`admin-nav-btn${isActive('/admin') ? ' active' : ''}`}
        onClick={() => navigate('/admin')}
        title="Tableau de bord administrateur"
        aria-current={isActive('/admin') ? 'page' : undefined}
      >
        ⚙️ Admin
      </button>
      <button
        className={`admin-nav-btn${isActive('/generate') ? ' active' : ''}`}
        onClick={() => navigate('/generate')}
        title="Générer des monstres"
        aria-current={isActive('/generate') ? 'page' : undefined}
      >
        ✨ Générer
      </button>
      <button
        className={`admin-nav-btn${isActive('/admin/monsters') ? ' active' : ''}`}
        onClick={() => navigate('/admin/monsters')}
        title="Gérer les monstres"
        aria-current={isActive('/admin/monsters') ? 'page' : undefined}
      >
        🗂️ Monstres
      </button>
      <span className="admin-nav-separator" aria-hidden="true" />
      <button
        className="admin-nav-btn"
        onClick={() => navigate('/home')}
        title="Retour au jeu"
      >
        🏠 Jeu
      </button>
    </div>
  );
};

export default AdminNav;
