import React, { useState, useEffect, useContext } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { usePlayer } from '../components/PlayerContext';
import config from '../../config.json';
import FavoriteTracksContext from '../components/FavoriteTracksContext';

const SearchScreen = ({ navigation }) => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [serverIP, setServerIP] = useState(null);
    const { playTrack } = usePlayer();
    const { favorites, updateFavorites } = useContext(FavoriteTracksContext);

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

    useEffect(() => {
        return () => {
            setSearchQuery('');
        };
    }, []);

    const filteredTracks = tracks.filter(track =>
        track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFavorite = async (trackId) => {
        await updateFavorites(trackId);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <AntDesign name="arrowleft" size={28} color="white" />
                </TouchableOpacity>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Поиск песен и авторов"
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView style={styles.scrollView}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    searchQuery.length > 0 && filteredTracks.map((track) => (
                        <TouchableOpacity key={track.id} onPress={() => playTrack(track)}>
                        <View key={track.id} style={styles.trackContainer}>

                                <Image source={{ uri: track.image }} style={styles.trackImage} />

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
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#390439',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#46076a',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    backButton: {
        padding: 5,
        marginRight: 10,
        marginTop: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 5,
        marginTop: 10,
        paddingHorizontal: 10,
        color: '#000',
    },

    trackContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 1,
        padding: 5,
        backgroundColor: "#350145",
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
});

export default SearchScreen;
