import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import '../admin/AdminMonstersList.css';

const AdminMonstersList = () => {
  const navigate = useNavigate();
  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination and filters
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [selectedState, setSelectedState] = useState('');
  const [totalMonsters, setTotalMonsters] = useState(0);

  const MONSTER_STATES = [
    'GENERATED',
    'DEFECTIVE',
    'CORRECTED',
    'PENDING_REVIEW',
    'APPROVED',
    'TRANSMITTED',
    'REJECTED',
  ];

  const fetchMonsters = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit,
        offset: offset,
      });

      if (selectedState) {
        params.append('state', selectedState);
      }

      const response = await adminApi.get('/monsters', { params });
      setMonsters(response.data || []);
      // Estimate total (API doesn't return total in response based on spec)
      setTotalMonsters(offset + (response.data?.length || 0) + 1);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Erreur lors du chargement des monstres'
      );
      console.error('Error fetching monsters:', err);
    } finally {
      setLoading(false);
    }
  }, [limit, offset, selectedState]);

  useEffect(() => {
    fetchMonsters();
  }, [fetchMonsters]);

  const handleMonsterClick = (monsterId) => {
    navigate(`/admin/monsters/${monsterId}`);
  };

  const handleStateFilterChange = (e) => {
    setSelectedState(e.target.value);
    setOffset(0); // Reset pagination when filter changes
  };

  const handlePreviousPage = () => {
    setOffset(Math.max(0, offset - limit));
  };

  const handleNextPage = () => {
    setOffset(offset + limit);
  };

  const getStateClass = (state) => `state-badge state-${state.toLowerCase()}`;

  return (
    <div className="admin-monsters-list">
      <div className="list-header">
        <h1>Gestion des Monstres</h1>
        <div className="filters">
          <label htmlFor="state-filter">Filtrer par état:</label>
          <select
            id="state-filter"
            value={selectedState}
            onChange={handleStateFilterChange}
            className="filter-select"
          >
            <option value="">Tous les états</option>
            {MONSTER_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Chargement des monstres...</div>
      ) : monsters.length > 0 ? (
        <>
          <div className="monsters-table">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Élément</th>
                  <th>Rang</th>
                  <th>État</th>
                  <th>Valide</th>
                  <th>Créé le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {monsters.map((monster) => (
                  <tr key={monster.monster_id} className="monster-row">
                    <td className="monster-name">{monster.name}</td>
                    <td>{monster.element}</td>
                    <td>{monster.rank}</td>
                    <td>
                      <span className={getStateClass(monster.state)}>
                        {monster.state}
                      </span>
                    </td>
                    <td>
                      <span className={monster.is_valid ? 'valid' : 'invalid'}>
                        {monster.is_valid ? '✓' : '✗'}
                      </span>
                    </td>
                    <td>
                      {new Date(monster.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => handleMonsterClick(monster.monster_id)}
                      >
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={handlePreviousPage}
              disabled={offset === 0}
              className="btn-pagination"
            >
              Previous
            </button>
            <span className="pagination-info">
              {offset + 1} - {offset + monsters.length} (Total: ~{totalMonsters}
              )
            </span>
            <button
              onClick={handleNextPage}
              disabled={monsters.length < limit}
              className="btn-pagination"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">Aucun monstre trouvé</div>
      )}
    </div>
  );
};

export default AdminMonstersList;
