import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

/**
 * GPS coordinate capture button
 * Returns coordinates as "latitude,longitude" string
 */
export default function GpsCapture({ value, onChange, label = 'GPS መጋጠሚያ ይያዙ' }) {
    const [loading, setLoading] = useState(false);

    const captureLocation = async () => {
        setLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('ፈቃድ ያስፈልጋል', 'GPS መጋጠሚያ ለመያዝ የአካባቢ ፈቃድ ያስፈልጋል።');
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const coords = `${location.coords.latitude.toFixed(6)},${location.coords.longitude.toFixed(6)}`;
            onChange(coords);
        } catch (error) {
            console.error('[GPS] Error:', error);
            Alert.alert('GPS ስህተት', 'GPS መጋጠሚያ ማግኘት አልተቻለም። እባክዎ GPS መብራት መብራቱን ያረጋግጡ።');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.row}>
                <Text style={styles.coords}>
                    {value || 'ያልተያዘ (Not captured)'}
                </Text>
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={captureLocation}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>📍 {value ? 'አድስ' : 'ያዝ'}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    coords: {
        flex: 1,
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#6b7280',
        backgroundColor: '#f9fafb',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    button: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        elevation: 1,
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd',
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
});
