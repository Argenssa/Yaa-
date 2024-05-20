// FavoriteTracksContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserContext } from './userContext'; // Импортируйте контекст пользователя

const FavoriteTracksContext = createContext();

export const FavoriteTracksProvider = ({ children }) => {
    const [favorites, setFavorites] = useState({});
    const { userId } = useUserContext(); // Получите userId из контекста

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const savedFavoritesJSON = await AsyncStorage.getItem(`favorites_${userId}`);
                if (savedFavoritesJSON) {
                    const savedFavorites = JSON.parse(savedFavoritesJSON);
                    setFavorites(savedFavorites);
                }
            } catch (error) {
                console.error('Error loading favorites:', error);
            }
        };

        if (userId) {
            loadFavorites();
        }
    }, [userId]);

    const updateFavorites = async (trackId) => {
        try {
            const updatedFavorites = { ...favorites };
            if (favorites[trackId]) {
                delete updatedFavorites[trackId];
            } else {
                updatedFavorites[trackId] = true;
            }

            setFavorites(updatedFavorites);
            await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(updatedFavorites));
        } catch (error) {
            console.error('Error updating favorites:', error);
        }
    };

    return (
        <FavoriteTracksContext.Provider value={{ favorites, updateFavorites }}>
            {children}
        </FavoriteTracksContext.Provider>
    );
};

export default FavoriteTracksContext;
