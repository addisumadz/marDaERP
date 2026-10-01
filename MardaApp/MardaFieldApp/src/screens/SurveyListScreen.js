import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, StatusBar,
    TouchableOpacity,
} from 'react-native';
import { newLineAPI } from '../api/endpoints';
import JobCard from '../components/JobCard';

export default function SurveyListScreen({ onSelectJob, onBack }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadJobs = useCallback(async () => {
        try {
            const res = await newLineAPI.getApplications({
                status: 'SURVEY_IN_PROGRESS',
                page: 0,
                size: 100,
            });
            setJobs(res?.content || []);
        } catch (error) {
            console.warn('[SurveyList] Load error:', error);
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

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1e40af" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backText}>← ተመለስ</Text>
                </TouchableOpacity>
                <Text style={styles.title}>🔍 የዳሰሳ ጥናት ሥራዎች</Text>
                <Text style={styles.subtitle}>{jobs.length} jobs assigned</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
            ) : jobs.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>✅</Text>
                    <Text style={styles.emptyText}>ምንም ያልተጠናቀቀ የዳሰሳ ሥራ የለም</Text>
                    <Text style={styles.emptySubtext}>No pending survey jobs</Text>
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <JobCard
                            application={item}
                            onPress={() => onSelectJob(item)}
                            actionLabel="እቃዎች መዝግብ →"
                        />
                    )}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
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
        backgroundColor: '#1e40af',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    backBtn: {
        marginBottom: 8,
    },
    backText: {
        color: '#bfdbfe',
        fontSize: 13,
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    subtitle: {
        fontSize: 12,
        color: '#93c5fd',
        marginTop: 2,
    },
    list: {
        padding: 16,
        paddingBottom: 40,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#374151',
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 4,
    },
});
