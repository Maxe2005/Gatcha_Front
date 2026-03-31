import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../../services/api';
import ThemeToggle from '../../../components/ThemeToggle/ThemeToggle';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await adminApi.get('/dashboard/stats');
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            'Erreur lors du chargement des statistiques'
        );
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Chargement des statistiques...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div
          className="error"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div>{error}</div>
          <button
            className="btn-home"
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px',
              fontWeight: 'bold',
              borderRadius: 8,
              background: '#eee',
              color: '#222',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
            title="Retour à l'accueil"
          >
            Accueil
          </button>
        </div>
      </div>
    );
  }

  const handleViewMonsters = () => {
    navigate('/admin/monsters');
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <h1 style={{ margin: 0 }}>Tableau de Bord Admin</h1>
          <button
            className="btn-home"
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px',
              fontWeight: 'bold',
              borderRadius: 8,
              background: '#eee',
              color: '#222',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
            title="Retour à l'accueil"
          >
            Accueil
          </button>
        </div>
        <div className="admin-header-actions">
          <button className="btn-primary" onClick={handleViewMonsters}>
            Voir les Monstres
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate('/generate')}
          >
            Générer des Monstres
          </button>
          <ThemeToggle />
        </div>
      </div>

      {stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total des Monstres</h3>
              <div className="stat-value">{stats.total_monsters || 0}</div>
            </div>

            <div className="stat-card">
              <h3>Taux de Transmission</h3>
              <div className="stat-value">
                {((stats.transmission_rate || 0) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="stat-card">
              <h3>Temps de Revue Moyen</h3>
              <div className="stat-value">
                {stats.avg_review_time_hours
                  ? `${stats.avg_review_time_hours.toFixed(1)}h`
                  : 'N/A'}
              </div>
            </div>
          </div>

          <div className="stats-section">
            <h2>Distribution par État</h2>
            <div className="state-distribution">
              {stats.by_state && Object.keys(stats.by_state).length > 0 ? (
                <div className="state-grid">
                  {Object.entries(stats.by_state).map(([state, count]) => (
                    <div key={state} className="state-item">
                      <span
                        className={`state-badge state-${state.toLowerCase()}`}
                      >
                        {state}
                      </span>
                      <span className="state-count">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Aucune donnée disponible</p>
              )}
            </div>
          </div>

          <div className="stats-section">
            <h2>Activité Récente</h2>
            {stats.recent_activity && stats.recent_activity.length > 0 ? (
              <div className="activity-list">
                {stats.recent_activity.map((activity, idx) => (
                  <div key={idx} className="activity-item">
                    <div className="activity-info">
                      <span className="activity-name">
                        {activity.monster_name}
                      </span>
                      <span className="activity-transition">
                        {activity.transition}
                      </span>
                    </div>
                    <div className="activity-meta">
                      <span>{activity.actor || 'System'}</span>
                      <span>
                        {new Date(activity.timestamp).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Aucune activité récente</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
