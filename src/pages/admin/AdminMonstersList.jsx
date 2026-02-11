import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import ThemeToggle from '../../components/ThemeToggle';
import '../admin/AdminMonstersList.css';

const AdminMonstersList = () => {
  const navigate = useNavigate();
  const [allMonsters, setAllMonsters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination and filters
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  // Initialize from localStorage
  const getInitialState = (key) => {
    const savedFilters = localStorage.getItem('adminMonstersFilters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        return filters[key] || '';
      } catch (err) {
        console.error('Error loading filters:', err);
        return '';
      }
    }
    return '';
  };

  const [selectedState, setSelectedState] = useState(() =>
    getInitialState('state')
  );
  const [selectedRank, setSelectedRank] = useState(() =>
    getInitialState('rank')
  );
  const [selectedElement, setSelectedElement] = useState(() =>
    getInitialState('element')
  );
  const [selectedValid, setSelectedValid] = useState(() =>
    getInitialState('valid')
  );
  const [searchKeyword, setSearchKeyword] = useState(() =>
    getInitialState('keyword')
  );

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const filtersToSave = {
      state: selectedState,
      rank: selectedRank,
      element: selectedElement,
      valid: selectedValid,
      keyword: searchKeyword,
    };
    localStorage.setItem('adminMonstersFilters', JSON.stringify(filtersToSave));
  }, [
    selectedState,
    selectedRank,
    selectedElement,
    selectedValid,
    searchKeyword,
  ]);

  const MONSTER_STATES = [
    'GENERATED',
    'DEFECTIVE',
    'CORRECTED',
    'PENDING_REVIEW',
    'APPROVED',
    'TRANSMITTED',
    'REJECTED',
  ];

  const MONSTER_RANKS = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];
  const MONSTER_ELEMENTS = [
    'fire',
    'water',
    'wind',
    'earth',
    'light',
    'darkness',
  ];

  // Mapping pour affichage français des éléments
  const elementDisplayNames = {
    fire: 'Feu',
    water: 'Eau',
    wind: 'Vent',
    earth: 'Terre',
    light: 'Lumière',
    darkness: 'Ombre',
  };

  // Fetch all monsters once on component mount
  useEffect(() => {
    const fetchAllMonsters = async () => {
      try {
        setLoading(true);
        const response = await adminApi.get('/monsters');
        setAllMonsters(response.data || []);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.detail || 'Erreur lors du chargement des monstres'
        );
        console.error('Error fetching monsters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMonsters();
  }, []);

  // Filter monsters based on current filters
  const getFilteredMonsters = useCallback(() => {
    return allMonsters.filter((monster) => {
      // Search by name
      if (
        searchKeyword &&
        !monster.name.toLowerCase().includes(searchKeyword.toLowerCase())
      ) {
        return false;
      }

      // Filter by state
      if (selectedState && monster.state !== selectedState) {
        return false;
      }

      // Filter by rank
      if (selectedRank && monster.rank !== selectedRank) {
        return false;
      }

      // Filter by element (case-insensitive comparison)
      if (
        selectedElement &&
        (monster.element || '').toLowerCase() !== selectedElement.toLowerCase()
      ) {
        return false;
      }

      // Filter by valid
      if (selectedValid !== '') {
        const isValid = selectedValid === 'true';
        if (monster.is_valid !== isValid) {
          return false;
        }
      }

      return true;
    });
  }, [
    allMonsters,
    searchKeyword,
    selectedState,
    selectedRank,
    selectedElement,
    selectedValid,
  ]);

  const filteredMonsters = getFilteredMonsters();
  const paginatedMonsters = filteredMonsters.slice(offset, offset + limit);

  const handleMonsterClick = (monsterId) => {
    navigate(`/admin/monsters/${monsterId}`);
  };

  const handleStateFilterChange = (e) => {
    setSelectedState(e.target.value);
    setOffset(0); // Reset pagination when filter changes
  };

  const handleRankFilterChange = (e) => {
    setSelectedRank(e.target.value);
    setOffset(0);
  };

  const handleElementFilterChange = (e) => {
    setSelectedElement(e.target.value);
    setOffset(0);
  };

  const handleValidFilterChange = (e) => {
    setSelectedValid(e.target.value);
    setOffset(0);
  };

  const handleSearchKeywordChange = (e) => {
    setSearchKeyword(e.target.value);
    setOffset(0);
  };

  const handleResetFilters = () => {
    setSelectedState('');
    setSelectedRank('');
    setSelectedElement('');
    setSelectedValid('');
    setSearchKeyword('');
    setOffset(0);
  };

  const handlePreviousPage = () => {
    setOffset(Math.max(0, offset - limit));
  };

  const handleNextPage = () => {
    setOffset(offset + limit);
  };

  const getStateClass = (state) => `state-badge state-${state.toLowerCase()}`;

  const getRankClass = (rank) => `rank-text rank-${rank.toLowerCase()}`;

  const getElementClass = (element) =>
    `element-text element-${element.toLowerCase()}`;

  const getElementDisplayName = (element) =>
    elementDisplayNames[element] || element;

  return (
    <div className="admin-monsters-list">
      <div className="list-header">
        <h1>Gestion des Monstres</h1>
        <ThemeToggle />
      </div>

      <div className="filters-container">
        <button onClick={handleResetFilters} className="btn-reset-filters">
          Réinitialiser les filtres
        </button>

        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="search-keyword">Rechercher par nom:</label>
            <input
              id="search-keyword"
              type="text"
              placeholder="Entrez un nom..."
              value={searchKeyword}
              onChange={handleSearchKeywordChange}
              className="filter-search"
            />
          </div>
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="state-filter">État:</label>
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

          <div className="filter-group">
            <label htmlFor="rank-filter">Rang:</label>
            <select
              id="rank-filter"
              value={selectedRank}
              onChange={handleRankFilterChange}
              className="filter-select"
            >
              <option value="">Tous les rangs</option>
              {MONSTER_RANKS.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="element-filter">Élément:</label>
            <select
              id="element-filter"
              value={selectedElement}
              onChange={handleElementFilterChange}
              className="filter-select"
            >
              <option value="">Tous les éléments</option>
              {MONSTER_ELEMENTS.map((element) => (
                <option key={element} value={element}>
                  {getElementDisplayName(element)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="valid-filter">Valide:</label>
            <select
              id="valid-filter"
              value={selectedValid}
              onChange={handleValidFilterChange}
              className="filter-select"
            >
              <option value="">Tous</option>
              <option value="true">Valide</option>
              <option value="false">Invalide</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Chargement des monstres...</div>
      ) : filteredMonsters.length > 0 ? (
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
                {paginatedMonsters.map((monster) => (
                  <tr key={monster.monster_id} className="monster-row">
                    <td className="monster-name">{monster.name}</td>
                    <td>
                      <span className={getElementClass(monster.element)}>
                        {getElementDisplayName(monster.element)}
                      </span>
                    </td>
                    <td>
                      <span className={getRankClass(monster.rank)}>
                        {monster.rank}
                      </span>
                    </td>
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
              {offset + 1} - {offset + paginatedMonsters.length} (Total:{' '}
              {filteredMonsters.length})
            </span>
            <button
              onClick={handleNextPage}
              disabled={paginatedMonsters.length < limit}
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
