import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    RefreshControl, ActivityIndicator, StatusBar,
} from 'react-native';
import { newLineAPI } from '../api/endpoints';
import { authService } from '../services/authService';
import { offlineQueueService } from '../services/offlineQueueService';

export default function HomeScreen({ onNavigate, onLogout }) {
    const [username, setUsername] = useState('');
    const [stats, setStats] = useState(null);
    const [pendingSync, setPendingSync] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = useCallback(async () => {
        try {
            const user = await authService.getUsername();
            setUsername(user || '');

            const [statsData, queueCount] = await Promise.all([
                newLineAPI.getDepartmentStats().catch(() => null),
                offlineQueueService.getPendingCount(),
            ]);

            setStats(statsData);
            setPendingSync(queueCount);
        } catch (error) {
            console.warn('[Home] Dashboard load error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadDashboard();
    };

    const handleLogout = async () => {
        await authService.logout();
        onLogout();
    };

    const surveyCount = Number(stats?.surveyInProgress || 0);
    const installCount = Number(stats?.installationInProgress || 0);
    const materialsCount = Number(stats?.materialsCollected || 0);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>ሰላም 👋</Text>
                    <Text style={styles.username}>{username}</Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>ውጣ</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />}
            >
                {/* Offline Queue Alert */}
                {pendingSync > 0 && (
                    <View style={styles.syncAlert}>
                        <Text style={styles.syncAlertText}>
                            ⏳ {pendingSync} ያልተሰየሙ (offline) ሥራዎች ይጠብቃሉ
                        </Text>
                    </View>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* KPI Cards */}
                        <Text style={styles.sectionTitle}>የእርሶ የመስክ ሥራዎች</Text>

                        <TouchableOpacity
                            style={[styles.kpiCard, { borderLeftColor: '#3b82f6' }]}
                            onPress={() => onNavigate('surveyList')}
                        >
                            <View style={styles.kpiHeader}>
                                <Text style={styles.kpiIcon}>🔍</Text>
                                <Text style={styles.kpiTitle}>የዳሰሳ ጥናት</Text>
                            </View>
                            <Text style={[styles.kpiCount, { color: '#2563eb' }]}>{surveyCount}</Text>
                            <Text style={styles.kpiLabel}>Survey Jobs Pending</Text>
                            {surveyCount > 0 && (
                                <View style={styles.actionHint}>
                                    <Text style={styles.actionHintText}>⚡ የእርሶን እርምጃ ይጠብቃሉ — ይጫኑ</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.kpiCard, { borderLeftColor: '#14b8a6' }]}
                            onPress={() => onNavigate('installationList')}
                        >
                            <View style={styles.kpiHeader}>
                                <Text style={styles.kpiIcon}>🔧</Text>
                                <Text style={styles.kpiTitle}>የመስመር ዝርጋታ</Text>
                            </View>
                            <Text style={[styles.kpiCount, { color: '#0d9488' }]}>{installCount}</Text>
                            <Text style={styles.kpiLabel}>Installation Jobs Pending</Text>
                            {installCount > 0 && (
                                <View style={styles.actionHint}>
                                    <Text style={styles.actionHintText}>⚡ የእርሶን እርምጃ ይጠብቃሉ — ይጫኑ</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.kpiCard, { borderLeftColor: '#8b5cf6' }]}
                            onPress={() => onNavigate('installationList')}
                        >
                            <View style={styles.kpiHeader}>
                                <Text style={styles.kpiIcon}>📦</Text>
                                <Text style={styles.kpiTitle}>ዕቃ ተወስዷል (ባለሙያ ይጠብቃል)</Text>
                            </View>
                            <Text style={[styles.kpiCount, { color: '#7c3aed' }]}>{materialsCount}</Text>
                            <Text style={styles.kpiLabel}>Materials Collected — Ready to Install</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    header: {
        backgroundColor: '#1e3a8a',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 14,
        color: '#bfdbfe',
    },
    username: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    logoutBtn: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
    },
    logoutText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    syncAlert: {
        backgroundColor: '#fef3c7',
        borderWidth: 1,
        borderColor: '#f59e0b',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },
    syncAlertText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#92400e',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 12,
    },
    kpiCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    kpiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    kpiIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    kpiTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
    },
    kpiCount: {
        fontSize: 36,
        fontWeight: '900',
    },
    kpiLabel: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 2,
    },
    actionHint: {
        marginTop: 8,
        backgroundColor: '#fffbeb',
        borderWidth: 1,
        borderColor: '#fbbf24',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    actionHintText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#92400e',
    },
});
