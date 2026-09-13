import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { STORAGE_KEYS } from '../constants/config';
import { authService } from '../services/authService';

export default function LoginScreen({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [serverAddress, setServerAddress] = useState('');

    // Load saved server address when modal opens
    const handleOpenSettings = async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_URL);
            setServerAddress(saved || '');
            setShowSettings(true);
        } catch (e) {
            console.error('Failed to load server address', e);
        }
    };

    const handleSaveSettings = async () => {
        try {
            if (serverAddress.trim()) {
                await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_URL, serverAddress.trim());
            } else {
                await AsyncStorage.removeItem(STORAGE_KEYS.CUSTOM_URL);
            }
            setShowSettings(false);
            Alert.alert('Success', 'Server address updated');
        } catch (e) {
            Alert.alert('Error', 'Failed to save server address');
        }
    };

    const handleLogin = async () => {
        // Clear previous error
        setError('');

        // Validate inputs
        // Validate inputs matching web app logic
        if (!username.trim() || !password.trim()) {
            setError('Username and password are required');
            return;
        }

        setIsLoading(true);

        try {
            // Get device ID
            const deviceId = await authService.getDeviceId();

            // Attempt login
            const result = await authService.login(username.trim(), password, deviceId);

            if (result.success) {
                // Clear form
                setUsername('');
                setPassword('');

                // Notify parent component
                if (onLoginSuccess) {
                    onLoginSuccess();
                }
            } else {
                // Show error message
                // Show error message matching web app (generic security message)
                if (result.error === 'Invalid password' || result.error === 'User not found') {
                    setError('Invalid username or password');
                } else {
                    setError(result.error || 'Login failed. Please check your credentials.');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={handleOpenSettings}
                    >
                        <Ionicons name="settings-outline" size={24} color="#666" />
                    </TouchableOpacity>

                    <Image
                        source={require('../../assets/login_logo.jpg')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Water Meter Reading</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                </View>

                {/* Settings Modal */}
                <Modal
                    visible={showSettings}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowSettings(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Server Configuration</Text>

                            <Text style={styles.modalLabel}>Server Address (IP:Port)</Text>
                            <Text style={styles.modalHelper}>Example: 192.168.1.10:8080</Text>

                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter IP:Port"
                                value={serverAddress}
                                onChangeText={setServerAddress}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setShowSettings(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleSaveSettings}
                                >
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Login Form */}
                <View style={styles.form}>
                    {/* Username Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={[styles.input, error ? styles.inputError : null]}
                            placeholder="Enter your username"
                            value={username}
                            onChangeText={(text) => {
                                setUsername(text);
                                setError(''); // Clear error when typing
                            }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={[styles.input, error ? styles.inputError : null]}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setError(''); // Clear error when typing
                            }}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                            onSubmitEditing={handleLogin}
                            returnKeyType="go"
                        />
                    </View>

                    {/* Error Message */}
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>⚠️ {error}</Text>
                        </View>
                    ) : null}

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <View style={styles.buttonContent}>
                                <ActivityIndicator color="#fff" size="small" />
                                <Text style={[styles.buttonText, { marginLeft: 10 }]}>
                                    Signing in...
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        0935981944 Addisu Z
                    </Text>
                    <Text style={styles.footerText}>
                        V 4.0.0
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        position: 'relative',
    },
    settingsButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        padding: 10,
        zIndex: 1,
    },
    logoImage: {
        width: 280,
        height: 100,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorContainer: {
        backgroundColor: '#fef2f2',
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
        padding: 12,
        borderRadius: 6,
        marginBottom: 16,
    },
    errorText: {
        color: '#dc2626',
        fontSize: 14,
    },
    button: {
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        marginTop: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        marginBottom: 5,
    },
    modalHelper: {
        fontSize: 12,
        color: '#888',
        marginBottom: 10,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    saveButton: {
        backgroundColor: '#2196F3',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
