import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminNav.css';

const AdminNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.username !== 'admin') {
    return null;
  }

  return (
    <div className="admin-nav">
      <button
        className="admin-nav-btn"
        onClick={() => navigate('/admin')}
        title="Tableau de bord administrateur"
      >
        ⚙️ Admin
      </button>
      <button
        className="admin-nav-btn"
        onClick={() => navigate('/admin/monsters')}
        title="Gérer les monstres"
      >
        🗂️ Monstres
      </button>
    </div>
  );
};

export default AdminNav;
