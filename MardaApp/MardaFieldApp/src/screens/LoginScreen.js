import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

export default function LoginScreen({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [serverAddress, setServerAddress] = useState('');
    const [showServerConfig, setShowServerConfig] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert('ማስጠንቀቂያ', 'እባክዎ የተጠቃሚ ስም እና ይለፍ ቃል ያስገቡ');
            return;
        }

        setLoading(true);
        try {
            // Save custom server address if provided
            if (serverAddress.trim()) {
                await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_URL, serverAddress.trim());
            }

            const result = await authService.login(username.trim(), password.trim());
            if (result.success) {
                onLoginSuccess();
            } else {
                Alert.alert('መግባት አልተቻለም', result.message);
            }
        } catch (error) {
            Alert.alert('ስህተት', 'ያልተጠበቀ ስህተት ተከስቷል');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
            <View style={styles.header}>
                <Text style={styles.logo}>🔧</Text>
                <Text style={styles.title}>MarDa Field App</Text>
                <Text style={styles.subtitle}>የመስክ ሥራ መተግበሪያ</Text>
                <Text style={styles.desc}>Survey & Installation Management</Text>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>የተጠቃሚ ስም (Username)</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="username"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>ይለፍ ቃል (Password)</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••"
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.loginButtonText}>ግባ (Login)</Text>
                    )}
                </TouchableOpacity>

                {/* Server Configuration Toggle */}
                <TouchableOpacity
                    style={styles.serverToggle}
                    onPress={() => setShowServerConfig(!showServerConfig)}
                >
                    <Text style={styles.serverToggleText}>
                        ⚙️ {showServerConfig ? 'የሰርቨር ቅንብር ደብቅ' : 'የሰርቨር ቅንብር'}
                    </Text>
                </TouchableOpacity>

                {showServerConfig && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Server Address (IP:Port)</Text>
                        <TextInput
                            style={styles.input}
                            value={serverAddress}
                            onChangeText={setServerAddress}
                            placeholder="192.168.1.100:8082"
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="url"
                        />
                        <Text style={styles.hint}>
                            ባዶ ከሆነ ነባሪውን ሰርቨር ይጠቀማል
                        </Text>
                    </View>
                )}
            </View>

            <Text style={styles.version}>v1.0.0 — MarDa ERP</Text>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e3a8a',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        fontSize: 48,
        marginBottom: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        color: '#93c5fd',
        fontWeight: '600',
        marginTop: 4,
    },
    desc: {
        fontSize: 12,
        color: '#bfdbfe',
        marginTop: 4,
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: '#f9fafb',
    },
    hint: {
        fontSize: 10,
        color: '#9ca3af',
        marginTop: 4,
    },
    loginButton: {
        backgroundColor: '#2563eb',
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
        marginTop: 4,
        elevation: 2,
    },
    loginButtonDisabled: {
        backgroundColor: '#93c5fd',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    serverToggle: {
        alignItems: 'center',
        marginTop: 14,
        paddingVertical: 6,
    },
    serverToggleText: {
        fontSize: 12,
        color: '#6b7280',
    },
    version: {
        textAlign: 'center',
        color: '#bfdbfe',
        fontSize: 11,
        marginTop: 24,
    },
});
