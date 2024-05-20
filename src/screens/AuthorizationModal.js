import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';

const AuthorizationModal = ({ isVisible, onClose, onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        if (!username || !password ) {
            setError('Please fill in all fields.');
            return;
        }



        // Вызов функции onRegister напрямую без обертки в Promise
        onLogin({ username, password })

    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword}
                    />
                    {loading ? (
                        <ActivityIndicator size="large" color="#46076a" style={styles.loader} />
                    ) : (
                        <Pressable style={styles.registerButton} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Login</Text>
                        </Pressable>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    input: {
        height: 40,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    registerButton: {
        backgroundColor: '#46076a',
        padding: 10,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        width: 200,
        flexDirection: 'row',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    loader: {
        marginTop: 20,
    },
});

export default AuthorizationModal;
