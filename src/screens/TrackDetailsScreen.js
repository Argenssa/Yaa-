import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Entypo, AntDesign } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import AsyncStorage from "@react-native-async-storage/async-storage";
import userId from "./LoginScreen"

const TrackDetailsScreen = ({ route, navigation }) => {
    const { track, isPlaying, position, duration, favorites, trackIndex } = route.params;

    useEffect(() => {
        navigation.setOptions({
            togglePlay: async () => {
                // Function to toggle play/pause
            },
            skipToNext: async () => {
                // Function to skip to next track
            },
            skipToPrevious: async () => {
                // Function to skip to previous track
            },
            onSliderValueChange: async (value) => {
                // Function to change the slider value
            },
            toggleFavorite: async () => {
                const updatedFavorites = { ...favorites };
                if (updatedFavorites[track.id]) {
                    delete updatedFavorites[track.id];
                } else {
                    updatedFavorites[track.id] = true;
                }
                await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(updatedFavorites));
            }
        });
    }, [navigation, track, favorites]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60000);
        const seconds = ((time % 60000) / 1000).toFixed(0);
        return `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
    };

    return (
        <View style={styles.container}>
            <Image source={{ uri: track.image }} style={styles.trackImage} />
            <Text style={styles.trackName}>{track.name}</Text>
            <Text style={styles.trackInfo}>{track.artist_name}</Text>
            <View style={styles.sliderContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration}
                    value={position}
                    onSlidingComplete={navigation.getParam('onSliderValueChange')}
                    minimumTrackTintColor="#9932CC"
                    maximumTrackTintColor="#FFFFFF"
                    thumbTintColor="#9932CC"
                />
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
            <View style={styles.controlsContainer}>
                <TouchableOpacity onPress={navigation.getParam('skipToPrevious')}>
                    <Entypo name="controller-jump-to-start" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={navigation.getParam('togglePlay')} style={styles.playPauseButton}>
                    {isPlaying ? (
                        <Entypo name="controller-paus" size={30} color="white" />
                    ) : (
                        <Entypo name="controller-play" size={30} color="white" />
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={navigation.getParam('skipToNext')}>
                    <Entypo name="controller-next" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={navigation.getParam('toggleFavorite')}>
                    {favorites[track.id] ? (
                        <AntDesign name="heart" size={30} color="#9932CC" />
                    ) : (
                        <Entypo name="heart-outlined" size={30} color="white" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1f0030",
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackImage: {
        width: 300,
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
    },
    trackName: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    trackInfo: {
        color: '#b3b3b3',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
        marginBottom: 20,
    },
    slider: {
        flex: 1,
        marginHorizontal: 10,
    },
    timeText: {
        color: 'white',
        fontSize: 14,
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '80%',
    },
    playPauseButton: {
        marginHorizontal: 20,
    },
});

export default TrackDetailsScreen;
