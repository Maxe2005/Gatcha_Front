// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../../services/api';
import { adminApiService } from '../../../services/adminService';
import AdminPageHeader from '../../../components/AdminPageHeader/AdminPageHeader';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import './AdminMonstersList.css';

const AdminMonstersList = () => {
  const navigate = useNavigate();
  const [allMonsters, setAllMonsters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isTransmitConfirmOpen, setIsTransmitConfirmOpen] = useState(false);

  // Pagination and filters
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

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
    const filtered = allMonsters.filter((monster) => {
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

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        let comparison = 0;

        switch (sortColumn) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            comparison = aValue.localeCompare(bValue);
            break;
          case 'element':
            aValue = MONSTER_ELEMENTS.indexOf((a.element || '').toLowerCase());
            bValue = MONSTER_ELEMENTS.indexOf((b.element || '').toLowerCase());
            comparison = aValue - bValue;
            break;
          case 'rank':
            aValue = MONSTER_RANKS.indexOf(a.rank);
            bValue = MONSTER_RANKS.indexOf(b.rank);
            comparison = aValue - bValue;
            break;
          case 'state':
            aValue = MONSTER_STATES.indexOf(a.state);
            bValue = MONSTER_STATES.indexOf(b.state);
            comparison = aValue - bValue;
            break;
          case 'valid':
            aValue = a.is_valid ? 1 : 0;
            bValue = b.is_valid ? 1 : 0;
            comparison = aValue - bValue;
            break;
          case 'created_at':
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            comparison = aValue - bValue;
            break;
          default:
            return 0;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [
    allMonsters,
    searchKeyword,
    selectedState,
    selectedRank,
    selectedElement,
    selectedValid,
    sortColumn,
    sortDirection,
  ]);

  const filteredMonsters = getFilteredMonsters();
  const paginatedMonsters = filteredMonsters.slice(offset, offset + limit);

  const handleMonsterClick = (monsterId) => {
    navigate(`/admin/monsters/${monsterId}`);
  };

  const handleProcessClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmProcess = async () => {
    setIsConfirmOpen(false);

    try {
      setProcessing(true);
      setProcessMessage(null);
      const result = await adminApiService.processGeneratedMonsters();
      setProcessMessage({
        type: 'success',
        text: `Traitement réussi: ${result.total_processed} monstres traités (${result.moved_to_pending_review} en revue, ${result.moved_to_defective} défectueux)`,
      });
      // Refresh monsters list
      const response = await adminApi.get('/monsters');
      setAllMonsters(response.data || []);
    } catch (err) {
      setProcessMessage({
        type: 'error',
        text:
          err.response?.data?.detail ||
          'Erreur lors du traitement des monstres générés',
      });
      console.error('Error processing generated monsters:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelProcess = () => {
    setIsConfirmOpen(false);
  };

  const handleTransmitClick = () => {
    setIsTransmitConfirmOpen(true);
  };

  const handleConfirmTransmit = async () => {
    setIsTransmitConfirmOpen(false);

    try {
      setProcessing(true);
      setProcessMessage(null);
      const result = await adminApiService.transmitMonstersBatch(50);
      setProcessMessage({
        type: 'success',
        text: `Transmission réussie: ${result.success}/${result.total} monstres transmis (${result.failed} échec${result.failed > 1 ? 's' : ''})`,
      });
      const response = await adminApi.get('/monsters');
      setAllMonsters(response.data || []);
    } catch (err) {
      setProcessMessage({
        type: 'error',
        text:
          err.response?.data?.detail ||
          'Erreur lors de la transmission batch des monstres',
      });
      console.error('Error transmitting monsters batch:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelTransmit = () => {
    setIsTransmitConfirmOpen(false);
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

  const handleSort = (column) => {
    if (sortColumn === column) {
      // If clicking the same column, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new column, sort ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
    setOffset(0);
  };

  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return ' ↕';
    }
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
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
      <AdminPageHeader
        breadcrumb={[
          { label: 'Tableau de Bord', to: '/admin' },
          { label: 'Gestion des Monstres' },
        ]}
        title="Gestion des Monstres"
      />
      {(selectedState === 'GENERATED' || selectedState === 'APPROVED') && (
        <div className="action-bar">
          {selectedState === 'GENERATED' && (
            <button
              className="btn-process-generated"
              onClick={handleProcessClick}
              disabled={processing}
            >
              {processing ? 'Traitement en cours...' : '⚡ Traiter les Générés'}
            </button>
          )}
          {selectedState === 'APPROVED' && (
            <button
              className="btn-process-generated btn-transmit-batch"
              onClick={handleTransmitClick}
              disabled={processing}
            >
              {processing
                ? 'Transmission en cours...'
                : '📡 Transmettre les Approuvés'}
            </button>
          )}
        </div>
      )}
      {processMessage && (
        <div className={`message message-${processMessage.type}`}>
          <span>{processMessage.text}</span>
          <button
            className="message-close"
            onClick={() => setProcessMessage(null)}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      )}{' '}
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
                  <th
                    onClick={() => handleSort('name')}
                    style={{ cursor: 'pointer' }}
                  >
                    Nom{getSortIcon('name')}
                  </th>
                  <th
                    onClick={() => handleSort('element')}
                    style={{ cursor: 'pointer' }}
                  >
                    Élément{getSortIcon('element')}
                  </th>
                  <th
                    onClick={() => handleSort('rank')}
                    style={{ cursor: 'pointer' }}
                  >
                    Rang{getSortIcon('rank')}
                  </th>
                  <th
                    onClick={() => handleSort('state')}
                    style={{ cursor: 'pointer' }}
                  >
                    État{getSortIcon('state')}
                  </th>
                  <th
                    onClick={() => handleSort('valid')}
                    style={{ cursor: 'pointer' }}
                  >
                    Valide{getSortIcon('valid')}
                  </th>
                  <th
                    onClick={() => handleSort('created_at')}
                    style={{ cursor: 'pointer' }}
                  >
                    Créé le{getSortIcon('created_at')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMonsters.map((monster) => (
                  <tr
                    key={monster.monster_id}
                    className="monster-row"
                    onDoubleClick={() => handleMonsterClick(monster.monster_id)}
                  >
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
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Traiter les Monstres Générés"
        message="Êtes-vous sûr de vouloir traiter tous les monstres générés ? Ils seront validés ou marqués comme défectueux."
        confirmText="Traiter"
        cancelText="Annuler"
        onConfirm={handleConfirmProcess}
        onCancel={handleCancelProcess}
        isDangerous={false}
      />
      <ConfirmDialog
        isOpen={isTransmitConfirmOpen}
        title="Transmettre les Monstres Approuvés"
        message="Êtes-vous sûr de vouloir transmettre les monstres approuvés vers l'API d'invocation ?"
        confirmText="Transmettre"
        cancelText="Annuler"
        onConfirm={handleConfirmTransmit}
        onCancel={handleCancelTransmit}
        isDangerous={false}
      />
    </div>
  );
};

export default AdminMonstersList;
