import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { STATUS_LABELS } from '../constants/config';

/**
 * Reusable card component for displaying survey/installation job items
 */
export default function JobCard({ application, onPress, showAction = true, actionLabel = 'ዝርዝር ይመልከቱ' }) {
    const status = application?.status || '';
    const statusLabel = STATUS_LABELS[status] || { am: status, en: '' };

    const getStatusColor = () => {
        switch (status) {
            case 'SURVEY_IN_PROGRESS': return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' };
            case 'INSTALLATION_IN_PROGRESS': return { bg: '#ccfbf1', text: '#0f766e', border: '#5eead4' };
            case 'MATERIALS_COLLECTED': return { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' };
            case 'INSTALLATION_COMPLETED': return { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' };
            default: return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
        }
    };

    const colors = getStatusColor();

    return (
        <TouchableOpacity
            style={[styles.card, { borderLeftColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <Text style={styles.appNumber}>{application.applicationNumber || '—'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                    <Text style={[styles.statusText, { color: colors.text }]}>{statusLabel.am}</Text>
                </View>
            </View>

            <Text style={styles.customerName}>{application.customerFullName || '—'}</Text>

            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📞</Text>
                <Text style={styles.infoValue}>{application.phoneNumber || '—'}</Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍</Text>
                <Text style={styles.infoValue}>
                    {application.kebele?.streetsName || application.kebele?.name || '—'}
                    {application.houseNumber ? ` | ቤት: ${application.houseNumber}` : ''}
                </Text>
            </View>

            {application.addressDescription ? (
                <Text style={styles.addressDesc} numberOfLines={2}>
                    {application.addressDescription}
                </Text>
            ) : null}

            {showAction && (
                <View style={styles.actionRow}>
                    <Text style={styles.actionButton}>{actionLabel} →</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    appNumber: {
        fontSize: 13,
        fontWeight: '800',
        color: '#2563eb',
        fontFamily: 'monospace',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    customerName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    infoLabel: {
        fontSize: 12,
        marginRight: 6,
    },
    infoValue: {
        fontSize: 12,
        color: '#6b7280',
        flex: 1,
    },
    addressDesc: {
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 4,
        fontStyle: 'italic',
    },
    actionRow: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 8,
        alignItems: 'flex-end',
    },
    actionButton: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2563eb',
    },
});
