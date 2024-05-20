import React, { useState, useEffect, useContext } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image, Dimensions, Modal } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from '@expo/vector-icons';
import { usePlayer } from '../components/PlayerContext';
import config from '../../config.json';
import { useUserContext } from '../components/userContext';
import FavoriteTracksContext from '../components/FavoriteTracksContext';
import { useFocusEffect } from '@react-navigation/native';

const { height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [serverIP, setServerIP] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedCompilation, setSelectedCompilation] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [compilations, setCompilations] = useState([]); // Compilation state
    const { playTrack, state: playerState } = usePlayer();
    const { userId } = useUserContext();
    const { favorites, updateFavorites } = useContext(FavoriteTracksContext);
    const [playerVisible, setPlayerVisible] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState(null); // Selected track state

    useEffect(() => {
        setServerIP(config.serverIP);
    }, []);

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
                    throw new Error('Failed to load songs');
                }

                const data = await response.json();
                setTracks(data);

                await AsyncStorage.setItem('tracks', JSON.stringify(data));

                setLoading(false);
                if (!playerState.currentPlayingTrack && playerVisible) {
                    await playTrack(data[0]);
                }
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };

        fetchTracks();
    }, [serverIP]);

    useEffect(() => {
        const loadSavedTracks = async () => {
            try {
                const savedTracksJSON = await AsyncStorage.getItem('tracks');
                if (savedTracksJSON) {
                    const savedTracks = JSON.parse(savedTracksJSON);
                    setTracks(savedTracks);
                }
            } catch (error) {
                console.error('Error loading saved tracks:', error);
            }
        };

        loadSavedTracks();
    }, []);

    const savePlaylists = async (newPlaylists) => {
        try {
            await AsyncStorage.setItem('playlists', JSON.stringify(newPlaylists));
        } catch (error) {
            console.error('Error saving playlists:', error);
        }
    };

    useEffect(() => {
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

        loadPlaylists();
    }, []);

    useEffect(() => {
        const fetchCompilations = async () => {
            try {
                if (!serverIP) return;

                const response = await fetch(`http://${serverIP}:3000/complitations`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to load compilations');
                }

                const data = await response.json();
                setCompilations(data); // Set compilations state
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchCompilations();
    }, [serverIP]);

    const handleCompilationPress = (compilation) => {
        setSelectedCompilation(compilation);
    };

    const handlePlayTrack = async (track) => {
        await playTrack(track);
        setPlayerVisible(true);
    };

    const handleFavorite = async (trackId) => {
        await updateFavorites(trackId);
    };

    const handleLongPress = (track) => {
        setSelectedTrack(track);
        setShowModal(true);
    };

    const addToPlaylist = async (playlistName) => {
        try {
            // Находим плейлист по имени
            const playlist = playlists.find(pl => pl.name === playlistName);

            // Если плейлист не найден, выводим сообщение об ошибке и выходим из функции
            if (!playlist) {
                console.log('Playlist not found');
                return;
            }

            // Проверяем, есть ли трек уже в плейлисте, если да, то выводим сообщение и выходим из функции
            if (playlist.tracks.some(track => track.id === selectedTrack.id)) {
                console.log('This track already exists in the playlist');
                return;
            }

            // Создаем новый плейлист, в котором добавляем выбранный трек
            const updatedPlaylist = { ...playlist, tracks: [...playlist.tracks, selectedTrack] };

            // Обновляем список плейлистов
            const updatedPlaylists = playlists.map(pl => (pl.name === playlistName ? updatedPlaylist : pl));

            // Сохраняем обновленный список плейлистов в AsyncStorage
            await savePlaylists(updatedPlaylists);

            // Закрываем модальное окно
            setShowModal(false);

            // Выводим сообщение об успешном добавлении
            console.log(`Track added to playlist "${playlistName}"`);
        } catch (error) {
            console.error('Error adding track to playlist:', error);
        }
    };

    const handleBackPress = () => {
        setSelectedCompilation(null); // Закрыть подборку
    };

    const renderComplitationTracks = (trackList, playlistName) => (
        tracks
            .filter(track => trackList.includes(track.id)) // Filter tracks based on IDs in trackList
            .map((track) => (
                <TouchableOpacity key={track.id} onPress={() => handlePlayTrack(track)} onLongPress={() => handleLongPress(track)}>
                <View key={track.id} style={styles.trackContainer}>
                    <TouchableOpacity onPress={() => handlePlayTrack(track)}>
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
                    {playlistName && (
                        <TouchableOpacity onPress={() => removeTrackFromPlaylist(track.id, playlistName)} style={styles.removeButton}>
                            <AntDesign name="close" size={24} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
                </TouchableOpacity>
            ))
    );


    const renderTracks = (trackList, playlistName) => (
        trackList.map((track) => (
            <TouchableOpacity key={track.id} onPress={() => handlePlayTrack(track)} onLongPress={() => handleLongPress(track)}>
            <View key={track.id} style={styles.trackContainer}>
                <TouchableOpacity onPress={() => handlePlayTrack(track)}>
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

            </View>
            </TouchableOpacity>
        ))
    );

    return (
        <SafeAreaView style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Добавить в плейлист</Text>
                        {playlists.map((playlist) => (
                            <TouchableOpacity key={playlist.name} style={styles.playlistButton} onPress={() => addToPlaylist(playlist.name)}>
                                <Text style={styles.playlistButtonText}>{playlist.name}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={[styles.modalButton, styles.modalButtonClose]} onPress={() => setShowModal(false)}>
                            <Text style={styles.modalButtonText}>Отмена</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ScrollView style={styles.scrollView}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <>
                        <ScrollView horizontal style={styles.scrollView}>
                        {compilations.map((compilation) => (
                            <TouchableOpacity key={compilation.id} onPress={() => handleCompilationPress(compilation)}>
                                <View style={styles.compilationContainer}>
                                    <Image source={{ uri: compilation.image }} style={styles.compilationImage} />
                                    <View style={styles.compilationDetails}>
                                        <Text style={styles.compilationTitle}>{compilation.name}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                        </ScrollView>
                        {selectedCompilation ? (
                            <>
                                <Text style={styles.selectedCompilationTitle}>{selectedCompilation.name}</Text>
                                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                                    <AntDesign name="arrowleft" size={24} color="white" />
                                </TouchableOpacity>
                                {selectedCompilation.tracks.length > 0 ? (
                                    renderComplitationTracks(selectedCompilation.tracks, null)
                                ) : (
                                    <Text style={styles.noTracksText}>В этой подборке пока нет треков.</Text>
                                )}
                            </>
                        ) : (
                            renderTracks(tracks, null)
                        )}
                    </>
                    )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 25,
        backgroundColor: '#390439',
    },
    compilationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        padding: 10,
        width:200,
        height:75,
        borderColor:"white",
        borderWidth:0.8,
        marginRight:5,
        backgroundColor: "#350145"
    },
    compilationDetails: {
        flex: 1,
        marginLeft: 5,
    },
    compilationTitle: {
        fontSize: 16,
        textAlign:"center",
        fontWeight: 'bold',
        color: '#e1dada',
    },
    selectedCompilationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 5,
    },
    trackContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 1,
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
        color: '#e1dada',
    },
    favoriteButton: {
        marginRight: 10,
    },
    removeButton: {
        marginRight: 10,
    },
    scrollView: {
        flex: 1,
    },
    noTracksText: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: '#272030',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: 'center',
        color: '#fff',
        fontSize: 20,
    },
    playlistButton: {
        backgroundColor: '#8f248f',
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        marginTop: 10,
        minWidth: 150,
    },
    playlistButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalButton: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        marginTop: 10,
    },
    modalButtonClose: {
        backgroundColor: '#8f248f',
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default HomeScreen;
