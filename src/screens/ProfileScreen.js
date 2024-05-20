import React, { useState, useEffect, useContext, useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image, Modal, TextInput } from 'react-native';
import { AntDesign, Foundation } from '@expo/vector-icons';
import { usePlayer } from '../components/PlayerContext';
import config from '../../config.json';
import FavoriteTracksContext from '../components/FavoriteTracksContext';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';



const ProfileScreen = ({ navigation}) => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFavorites, setShowFavorites] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [playlistName, setPlaylistName] = useState('');
    const [playlists, setPlaylists] = useState([]);
    const [currentPlaylist, setCurrentPlaylist] = useState(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [serverIP, setServerIP] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { playTrack } = usePlayer();
    const { favorites, updateFavorites } = useContext(FavoriteTracksContext);
    const [screenTitle, setScreenTitle] = useState('Профиль');

    useEffect(() => {
        setServerIP(config.serverIP);
    }, []);

    useEffect(() => {
        if (currentPlaylist) {
            setScreenTitle(currentPlaylist);
        } else if (showFavorites) {
            setScreenTitle('Избранные песни');
        } else {
            setScreenTitle('Профиль');
        }
    }, [currentPlaylist, showFavorites]);


    useEffect(() => {
        const fetchTracks = async () => {
            try {
                if (!serverIP) return;
                setLoading(true);

                const response = await fetch(`http://${serverIP}:3000/tracks`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to load tracks');
                }

                const data = await response.json();
                setTracks(data);
                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };

        fetchTracks();
    }, [serverIP]);

    useFocusEffect(
        useCallback(() => {
            setShowFavorites(false);
            setCurrentPlaylist(null);
            loadPlaylists();
        }, [])
    );

    const loadPlaylists = async () => {
        try {
            const storedPlaylists = await AsyncStorage.getItem('playlists');
            if (storedPlaylists) {
                setPlaylists(JSON.parse(storedPlaylists));
            }
        } catch (error) {
            console.error('Error loading playlists:', error);
        }
    };
    const updatePlaylists = (newPlaylists) => {
        setPlaylists(newPlaylists);
    };
    const savePlaylists = async (newPlaylists) => {
        try {
            await AsyncStorage.setItem('playlists', JSON.stringify(newPlaylists));
        } catch (error) {
            console.error('Error saving playlists:', error);
        }
    };

    const createPlaylist = () => {
        if (!playlistName) return;
        const newPlaylists = [...playlists, { name: playlistName, tracks: [] }];
        setPlaylists(newPlaylists);
        savePlaylists(newPlaylists);
        setPlaylistName('');
        setShowModal(false);
        loadPlaylists(); // Добавляем вызов функции loadPlaylists() после обновления плейлистов
    };

    const deletePlaylist = async (playlistName) => {
        const updatedPlaylists = playlists.filter(playlist => playlist.name !== playlistName);
        setPlaylists(updatedPlaylists);
        savePlaylists(updatedPlaylists);
        setSelectedPlaylist(null); // Сбрасываем выбранный плейлист после удаления
        setShowDeleteModal(false);
        loadPlaylists(); // Добавляем вызов функции loadPlaylists() после обновления плейлистов
    };




    const removeTrackFromPlaylist = async (trackId, playlistName) => {
        const updatedPlaylists = playlists.map(playlist => {
            if (playlist.name === playlistName) {
                return {
                    ...playlist,
                    tracks: playlist.tracks.filter(track => track.id !== trackId),
                };
            }
            return playlist;
        });
        setPlaylists(updatedPlaylists);
        savePlaylists(updatedPlaylists);
    };



    const favoriteTracks = tracks.filter(track => favorites[track.id]);

    const handleFavorite = async (trackId) => {
        await updateFavorites(trackId);
    };

    const renderTracks = (trackList, playlistName) => (
        trackList.map((track) => (
            <View key={track.id} style={styles.trackContainer}>
                <TouchableOpacity onPress={() => playTrack(track)}>
                    <Image source={{ uri: track.image }} style={styles.trackImage} />
                </TouchableOpacity>
                <View style={styles.trackDetails}>
                    <Text style={styles.trackTitle}>{track.name}</Text>
                    <Text style={styles.trackArtist}>{track.artist_name}</Text>
                </View>
                <TouchableOpacity onPress={() => handleFavorite(track.id)} style={styles.favoriteButton}>
                    {favorites[track.id] ? (
                        <AntDesign name="heart" size={24} color="purple" />
                    ) : (
                        <AntDesign name="hearto" size={24} color="white" />
                    )}
                </TouchableOpacity>
                {currentPlaylist && (
                    <TouchableOpacity onPress={() => removeTrackFromPlaylist(track.id, currentPlaylist)} style={styles.removeButton}>
                        <AntDesign name="close" size={24} color="white" />
                    </TouchableOpacity>
                )}
            </View>
        ))
    );

    const confirmDeletePlaylist = (playlistName) => {
        setSelectedPlaylist(playlistName);
        setShowDeleteModal(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showCreateModal}
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Создать новый плейлист</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Название плейлиста"
                            onChangeText={text => setPlaylistName(text)}
                            value={playlistName}
                        />
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                createPlaylist();
                                setShowCreateModal(false);
                            }}
                        >
                            <Text style={styles.modalButtonText}>Создать</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.modalButtonClose]}
                            onPress={() => setShowCreateModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Отмена</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showDeleteModal}
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Удалить плейлист "{selectedPlaylist}"?</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                deletePlaylist(selectedPlaylist);
                                setShowDeleteModal(false);
                            }}
                        >
                            <Text style={styles.modalButtonText}>Удалить</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.modalButtonClose]}
                            onPress={() => setShowDeleteModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Отмена</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={styles.header}>
                {(showFavorites || currentPlaylist) && ( // Изменено здесь
                    <TouchableOpacity onPress={() => setShowFavorites(false) || setCurrentPlaylist(null)} style={styles.backButton}>
                        <AntDesign name="arrowleft" size={24} color="white" />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>{screenTitle}</Text>
            </View>


            {showFavorites && (
                <ScrollView style={styles.scrollView}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        renderTracks(favoriteTracks)
                    )}
                </ScrollView>
            )}

            {!showFavorites && !currentPlaylist &&(
                <ScrollView>
                    <TouchableOpacity onPress={() => setShowFavorites(true)} style={styles.showFavoritesButton}>
                        <Foundation name="heart" size={30} color="#FF00FF" />
                    </TouchableOpacity>
                    {playlists.length > 0 && playlists.map((playlist) => (
                        <TouchableOpacity key={playlist.name} onPress={() => setCurrentPlaylist(playlist.name)} onLongPress={() => confirmDeletePlaylist(playlist.name)} style={styles.playlistButton}>
                            <Text style={styles.showFavoritesButtonText}>{playlist.name}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.showFavoritesButton}>
                        <Text style={styles.showFavoritesButtonText}>Создать плейлист</Text>
                    </TouchableOpacity>

                </ScrollView>
            )}

            {currentPlaylist && (
                <ScrollView style={styles.scrollView}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <>

                            {playlists.find(playlist => playlist.name === currentPlaylist).tracks.length > 0 ? (
                                renderTracks(playlists.find(playlist => playlist.name === currentPlaylist).tracks, currentPlaylist)
                            ) : (
                                <Text style={styles.noTracksText}>В этом плейлисте пока нет треков.</Text>
                            )}
                        </>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#390439',
    },
    trackContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 3,
        padding: 5,
        backgroundColor: "#350145"
    },
    trackImage: {
        width: 60,
        height: 60,
        borderRadius: 25,
    },
    trackDetails: {
        flex: 1,
        marginLeft: 10,
    },
    trackTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e1dada',
    },
    trackArtist: {
        fontSize: 14,
        color: '#978a8a',
    },
    favoriteButton: {
        padding: 10,
    },
    removeButton: {
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#46076a',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    backButton: {
        padding: 5,
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 25,
        color: "white",
        fontWeight: 'bold',
        marginLeft: 10,
        marginTop: 5
    },
    showFavoritesButton: {
        padding: 10,
        backgroundColor: '#5c057a',
        alignItems: 'center',
        marginLeft:15,
        marginRight:15,
        marginTop:7,
        borderRadius: 5,
    },
    showFavoritesButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    playlistButton: {
        padding: 10,
        backgroundColor: '#4b026c',
        alignItems: 'center',
        marginLeft:15,
        marginTop:7,
        marginRight:15,
        borderRadius: 5,
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: 300,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalButton: {
        backgroundColor: '#6200ea',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalButtonClose: {
        backgroundColor: '#ccc',
    },
    noTracksText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
    },
});

export default ProfileScreen;

