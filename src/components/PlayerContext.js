import React, { createContext, useReducer, useContext } from 'react';
import { Audio } from 'expo-av';

const PlayerContext = createContext();

const initialState = {
    sound: null,
    isPlaying: false,
    currentTrack: null,
    currentPlayingTrack: null,
    position: 0,
    duration: 0,
    isLoading: false,
};

const playerReducer = (state, action) => {
    switch (action.type) {
        case 'SET_SOUND':
            return { ...state, sound: action.sound };
        case 'PLAY_TRACK':
            return { ...state, currentTrack: action.track, isPlaying: true, position: 0, duration: 0, isLoading: false };
        case 'PAUSE_TRACK':
            return { ...state, isPlaying: false };
        case 'RESUME_TRACK':
            return { ...state, isPlaying: true };
        case 'UPDATE_STATUS':
            return { ...state, position: action.position, duration: action.duration };
        case 'STOP_TRACK':
            return { ...state, isPlaying: false, currentTrack: null, position: 0, duration: 0 };
        case 'SET_LOADING':
            return { ...state, isLoading: action.isLoading };
        case 'SET_CURRENT_TRACK':
            return { ...state, currentPlayingTrack: action.track };
        default:
            return state;
    }
};

export const PlayerProvider = ({ children }) => {
    const [state, dispatch] = useReducer(playerReducer, initialState);

    const playTrack = async (track) => {
        try {
            dispatch({ type: 'SET_LOADING', isLoading: true });

            if (state.sound) {
                await state.sound.unloadAsync();
                dispatch({ type: 'STOP_TRACK' });
            }

            const sound = new Audio.Sound();
            await sound.loadAsync({ uri: track.audio });
            await sound.playAsync();
            sound.setOnPlaybackStatusUpdate((status) => {
                if (!status.isLoaded) return;
                if (status.didJustFinish) {
                    dispatch({ type: 'STOP_TRACK' });
                } else {
                    dispatch({ type: 'UPDATE_STATUS', position: status.positionMillis, duration: status.durationMillis });
                }
            });

            dispatch({ type: 'SET_SOUND', sound });
            dispatch({ type: 'PLAY_TRACK', track });
            dispatch({ type: 'SET_CURRENT_TRACK', track });
        } finally {
            dispatch({ type: 'SET_LOADING', isLoading: false });
        }
    };

    const pauseTrack = async () => {
        if (state.sound) {
            await state.sound.pauseAsync();
            dispatch({ type: 'PAUSE_TRACK' });
        }
    };

    const resumeTrack = async () => {
        if (state.sound) {
            await state.sound.playAsync();
            dispatch({ type: 'RESUME_TRACK' });
        }
    };

    const loadNextTrack = async () => {
        try {
            // Вставьте сюда реализацию функции loadNextTrack, которую я предоставил в предыдущем сообщении
        } catch (error) {
            console.error('Error loading next track:', error);
        }
    };

    return (
        <PlayerContext.Provider value={{ state, playTrack, pauseTrack, resumeTrack, loadNextTrack }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    return useContext(PlayerContext);
};
