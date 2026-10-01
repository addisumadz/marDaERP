import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, StatusBar,
    TouchableOpacity,
} from 'react-native';
import { newLineAPI } from '../api/endpoints';
import JobCard from '../components/JobCard';

export default function InstallationListScreen({ onSelectJob, onBack }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadJobs = useCallback(async () => {
        try {
            // Fetch both INSTALLATION_IN_PROGRESS and MATERIALS_COLLECTED jobs
            const [installRes, materialsRes] = await Promise.allSettled([
                newLineAPI.getApplications({ status: 'INSTALLATION_IN_PROGRESS', page: 0, size: 100 }),
                newLineAPI.getApplications({ status: 'MATERIALS_COLLECTED', page: 0, size: 100 }),
            ]);

            const installJobs = installRes.status === 'fulfilled' ? (installRes.value?.content || []) : [];
            const materialJobs = materialsRes.status === 'fulfilled' ? (materialsRes.value?.content || []) : [];

            // Combine and sort by date (newest first)
            const allJobs = [...materialJobs, ...installJobs].sort(
                (a, b) => new Date(b.applicationDate || b.createdAt) - new Date(a.applicationDate || a.createdAt)
            );
            setJobs(allJobs);
        } catch (error) {
            console.warn('[InstallationList] Load error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    const onRefresh = () => {
        setRefreshing(true);
        loadJobs();
    };

    const getActionLabel = (status) => {
        if (status === 'MATERIALS_COLLECTED') return 'ባለሙያ ይመደብ →';
        return 'ዝርጋታ ተጠናቋል ✓';
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f766e" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backText}>← ተመለስ</Text>
                </TouchableOpacity>
                <Text style={styles.title}>🔧 የመስመር ዝርጋታ ሥራዎች</Text>
                <Text style={styles.subtitle}>{jobs.length} jobs</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 40 }} />
            ) : jobs.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>✅</Text>
                    <Text style={styles.emptyText}>ምንም ያልተጠናቀቀ የዝርጋታ ሥራ የለም</Text>
                    <Text style={styles.emptySubtext}>No pending installation jobs</Text>
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <JobCard
                            application={item}
                            onPress={() => onSelectJob(item)}
                            actionLabel={getActionLabel(item.status)}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0d9488']} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    header: {
        backgroundColor: '#0f766e',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    backBtn: { marginBottom: 8 },
    backText: { color: '#99f6e4', fontSize: 13, fontWeight: '600' },
    title: { fontSize: 20, fontWeight: '800', color: '#fff' },
    subtitle: { fontSize: 12, color: '#5eead4', marginTop: 2 },
    list: { padding: 16, paddingBottom: 40 },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 15, fontWeight: '700', color: '#374151', textAlign: 'center' },
    emptySubtext: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
});
