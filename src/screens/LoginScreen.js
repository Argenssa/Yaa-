import React, { useState, useEffect } from 'react';
import { SafeAreaView, Image, Pressable, Text, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import RegistrationModal from './RegistrationModal';
import config from '../../config.json';
import { useNavigation } from "@react-navigation/native";
import AuthorizationModal from "./AuthorizationModal";
import { useUserContext } from '../components/userContext'; // Импортируйте хук контекста

const LoginScreen = () => {
    const [registrationModalVisible, setRegistrationModalVisible] = useState(false);
    const [loginModalVisible, setLoginModalVisible] = useState(false);
    const [serverIP, setServerIP] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const { setUserId } = useUserContext(); // Получите функцию для обновления userId

    useEffect(() => {
        setServerIP(config.serverIP);
    }, []);

    const authenticateWithGoogle = () => {
        // Реализация аутентификации с помощью Google
    };

    const authenticateWithPhoneNumber = () => {
        // Реализация аутентификации с помощью номера телефона
    };

    const openRegistrationModal = () => {
        setRegistrationModalVisible(true);
    };

    const closeRegistrationModal = () => {
        setRegistrationModalVisible(false);
    };

    const openLoginModal = () => {
        setLoginModalVisible(true);
    };

    const closeLoginModal = () => {
        setLoginModalVisible(false);
    };

    const handleRegister = (userData) => {
        if (!serverIP) return;

        setLoading(true);

        fetch(`http://${serverIP}:3000/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to register user');
                }
                return response.json();
            })
            .then(data => {
                console.log('Registration successful:', data);
                setLoading(false);
                const userId = data.user.id;
                setUserId(userId); // Установите userId в контексте
                closeRegistrationModal();
                navigation.navigate("Main");
            })
            .catch(error => {
                console.error('Error registering user:', error);
                setLoading(false);
            });
    };

    const handleLogin = (userData) => {
        if (!serverIP) return;

        setLoading(true);

        fetch(`http://${serverIP}:3000/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to login user');
                }
                return response.json();
            })
            .then(data => {
                console.log('Authorization successful:', data);
                setLoading(false);
                const userId = data.user.id;
                setUserId(userId); // Установите userId в контексте
                closeLoginModal();
                navigation.navigate("Main");
            })
            .catch(error => {
                console.error('Error logging in:', error);
                setLoading(false);
            });
    };

    return (
        <LinearGradient colors={['#000000', '#131624', '#1f0b29', '#491549', '#320f4e']} style={{ flex: 1 }}>
            <SafeAreaView>
                <View style={{ height: 80 }} />
                <View style={{ alignItems: 'center' }}>
                    <Image source={{uri: "https://i.imgur.com/KFEm2Co.png"}} style={{ width: 250, height: 250 }} />
                </View>
                <View style={{ height: 80 }} />
                <Pressable

                    onPress={openLoginModal}
                    style={styles.authButton2}
                >
                    <Text style={styles.buttonText}>Sign In with Ya!</Text>
                </Pressable>

                <Pressable
                    onPress={openRegistrationModal}
                    style={styles.authButton}
                >
                    <MaterialIcons name="app-registration" size={24} color="white" />
                    <Text style={styles.buttonText}>Registration</Text>
                </Pressable>
                <RegistrationModal
                    isVisible={registrationModalVisible}
                    onClose={closeRegistrationModal}
                    onRegister={handleRegister}
                />
                <AuthorizationModal
                    isVisible={loginModalVisible}
                    onClose={closeLoginModal}
                    onLogin={handleLogin}
                />
                {loading && (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color="#ffffff" />
                    </View>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = {
    authButton: {
        backgroundColor: "#46076a",
        padding: 10,
        marginLeft: "auto",
        marginRight: "auto",
        width: 300,
        alignItems: "center",
        borderRadius: 25,
        justifyContent: "center",
        marginVertical: 10,
        flexDirection: "row",
        borderColor: "white",
        borderWidth: 0.8,
    },
    authButton2: {
        backgroundColor: "#9e0af6",
        padding: 10,
        marginLeft: "auto",
        marginRight: "auto",
        width: 300,
        alignItems: "center",
        borderRadius: 25,
        justifyContent: "center",
        marginVertical: 10,
        flexDirection: "row",
        borderColor: "white",
        borderWidth: 0.8,
    },
    buttonText: {
        color: "white",
        fontWeight: '500',
        textAlign: "center",
        flex: 1,
    },
    loader: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Прозрачный цвет фона
    },
};

export default LoginScreen;
