import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { joueurApi } from '../services/api';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
    const { user, token, verifyToken } = useAuth();
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fonction pour récupérer les données du joueur
    const fetchPlayerData = async () => {
        console.log('Fetching player data for user:', user);
        if (!token) {
            setPlayerData(null);
            return;
        }

        if (!user || !user.username) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await joueurApi.get(`/api/players/${user.username}`);
            setPlayerData(response.data);
        } catch (err) {
            console.error('Erreur lors de la récupération des données du joueur:', err);
            setError(err.message || 'Erreur lors de la récupération des données');
        } finally {
            setLoading(false);
        }
    };

    // Récupérer les données au montage et quand l'utilisateur change
    useEffect(() => {
        fetchPlayerData();
    }, [user?.username, token]);

    // Fonction pour rafraîchir manuellement les données
    const refreshPlayerData = () => {
        fetchPlayerData();
    };

    const value = {
        playerData,      // { id, username, level, experience, monsterIds }
        loading,
        error,
        refreshPlayerData
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => useContext(PlayerContext);
