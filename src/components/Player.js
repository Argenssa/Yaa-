import React, { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { usePlayer } from './PlayerContext';
import Slider from "@react-native-community/slider";
import { Entypo } from '@expo/vector-icons';
import { formatTime } from "./formatTime";

const Player = () => {
    const { state, pauseTrack, resumeTrack, loadNextTrack } = usePlayer();

    useEffect(() => {
        if (state.currentTrack && !state.isPlaying && state.isLoading) {
            // Переключаемся на новый трек, если текущий трек загружен и не воспроизводится
            loadNextTrack();
        }
    }, [state.currentTrack, state.isPlaying, state.isLoading, loadNextTrack]);

    if (!state.currentTrack && !state.isLoading) return null;


    return (
        <View style={styles.playerContainer}>
            {state.isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    <Image source={{ uri: state.currentTrack.image }} style={styles.trackImage} />
                    <View style={styles.playerDetails}>
                        <Text style={styles.trackDetailsText}>
                            {`${state.currentTrack.name} - ${state.currentTrack.artist_name}`}
                        </Text>
                        <View style={styles.sliderContainer}>
                            <Text style={styles.timeText}>{formatTime(state.position)}</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={state.duration}
                                value={state.position}
                                onSlidingComplete={async (value) => {
                                    await state.sound.setPositionAsync(value);
                                    if (!state.isPlaying) {
                                        await state.sound.playAsync();
                                    }
                                }}
                                minimumTrackTintColor="#9932CC"
                                maximumTrackTintColor="#FFFFFF"
                                thumbTintColor="#9932CC"
                            />
                            <Text style={styles.timeText}>{formatTime(state.duration)}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={state.isPlaying ? pauseTrack : resumeTrack} style={styles.playPauseButton}>
                        {state.isPlaying ? (
                            <Entypo name="controller-paus" size={24} color="white" />
                        ) : (
                            <Entypo name="controller-play" size={24} color="white" />
                        )}
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    playerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2f0040',
        padding: 10,
        position: 'absolute', // Изменяем позицию на 'absolute'
        bottom: 48,
        width: '100%',
    },
    trackImage: {
        width: 50,
        height: 50,
        borderRadius: 30,
    },
    playerDetails: {
        flex: 1,
        marginLeft: 10,
    },
    trackDetailsText: {
        color: 'white',
        fontSize: 16,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        color: 'white',
        fontSize: 12,
    },
    slider: {
        flex: 1,
        marginHorizontal: 10,
    },
    playPauseButton: {
        padding: 10,
    },
});

export default Player;
