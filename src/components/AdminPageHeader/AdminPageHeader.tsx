// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPageHeader.css';

/**
 * En-tête de page partagé par les 4 pages admin (Dashboard, Liste, Détail, Générateur).
 * Le fil d'ariane remplace les boutons "← Retour" ad hoc de chaque page ; le
 * ThemeToggle et la navigation Admin/Générer/Monstres restent dans le Header
 * global + AdminNav, jamais dupliqués ici.
 */
const AdminPageHeader = ({ breadcrumb = [], title, badge, actions }) => {
  const navigate = useNavigate();

  return (
    <div className="admin-page-header">
      <div className="admin-page-header-main">
        {breadcrumb.length > 0 && (
          <nav className="admin-breadcrumb" aria-label="Fil d'ariane">
            {breadcrumb.map((item, index) => {
              const isLast = index === breadcrumb.length - 1;
              return (
                <span key={`${item.label}-${index}`} className="admin-breadcrumb-item">
                  {item.to && !isLast ? (
                    <button
                      type="button"
                      className="admin-breadcrumb-link"
                      onClick={() => navigate(item.to)}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span className="admin-breadcrumb-current">{item.label}</span>
                  )}
                  {!isLast && <span className="admin-breadcrumb-separator">/</span>}
                </span>
              );
            })}
          </nav>
        )}
        <div className="admin-page-header-title-row">
          <h1 className="admin-page-header-title">{title}</h1>
          {badge}
        </div>
      </div>
      {actions && <div className="admin-page-header-actions">{actions}</div>}
    </div>
  );
};

export default AdminPageHeader;
