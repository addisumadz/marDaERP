import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { newLineAPI } from '../api/endpoints';
import { offlineQueueService } from '../services/offlineQueueService';
import GpsCapture from '../components/GpsCapture';

export default function InstallationDetailScreen({ application, onBack, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);
    const [notes, setNotes] = useState('');
    const [gps, setGps] = useState(application.locationCoordination || '');

    const handleComplete = async () => {
        Alert.alert(
            'ማረጋገጫ',
            `${application.applicationNumber} — የመስመር ዝርጋታ ተጠናቋል ብለው ያረጋግጣሉ?`,
            [
                { text: 'ይቅር', style: 'cancel' },
                {
                    text: 'አዎ ✓ ተጠናቋል',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            await newLineAPI.completeInstallation(application.id, {
                                notes: notes || 'ዝርጋታ ተጠናቋል (field app)',
                            });
                            Alert.alert('ተሳክቷል! ✓', 'የመስመር ዝርጋታ ተጠናቋል ተብሎ ተመዝግቧል');
                            onSuccess?.();
                            onBack();
                        } catch (error) {
                            console.warn('[Installation] Submit error, queueing:', error);
                            try {
                                await offlineQueueService.enqueue('COMPLETE_INSTALLATION', application.id, {
                                    notes: notes || 'ዝርጋታ ተጠናቋል (field app - offline)',
                                });
                                Alert.alert(
                                    'ከመስመር ውጪ ተቀምጧል',
                                    'ዝርጋታ ማጠናቀቁ ከመስመር ውጪ ተቀምጧል — ኔትዎርክ ሲመለስ ይላካል።'
                                );
                                onBack();
                            } catch (queueErr) {
                                Alert.alert('ስህተት', 'ማስገባት አልተቻለም');
                            }
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f766e" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backText}>← ተመለስ</Text>
                </TouchableOpacity>
                <Text style={styles.title}>🔧 ዝርጋታ ማጠናቀቂያ</Text>
                <Text style={styles.appNumber}>{application.applicationNumber}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Customer Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>የደንበኛ መረጃ</Text>
                    <Text style={styles.customerName}>{application.customerFullName}</Text>
                    <Text style={styles.info}>📞 {application.phoneNumber || '—'}</Text>
                    <Text style={styles.info}>
                        📍 {application.kebele?.streetsName || '—'}
                        {application.houseNumber ? ` | ቤት: ${application.houseNumber}` : ''}
                    </Text>
                    {application.addressDescription ? (
                        <Text style={styles.addressDesc}>{application.addressDescription}</Text>
                    ) : null}
                </View>

                {/* Materials Summary */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📦 የተላኩ እቃዎች</Text>
                    <View style={styles.materialsInfo}>
                        <Text style={styles.info}>ጠቅላላ ክፍያ: <Text style={styles.amount}>ETB {Number(application.totalPayableAmount || 0).toFixed(2)}</Text></Text>
                        <Text style={styles.info}>ደረሰኝ: <Text style={styles.mono}>{application.paymentReceiptNumber || '—'}</Text></Text>
                    </View>
                </View>

                {/* Plumber Info */}
                {application.installationPlumber && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>👷 ባለሙያ</Text>
                        <Text style={styles.info}>
                            {application.installationPlumber.firstName} {application.installationPlumber.lastName}
                        </Text>
                    </View>
                )}

                {/* GPS Capture */}
                <View style={styles.card}>
                    <GpsCapture
                        value={gps}
                        onChange={setGps}
                        label="የመስመር ዝርጋታ ቦታ GPS"
                    />
                </View>

                {/* Notes */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📝 ማስታወሻ</Text>
                    <TextInput
                        style={styles.notesInput}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="ዝርጋታ ስለተጠናቀቀው ማስታወሻ..."
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Complete Button */}
                <TouchableOpacity
                    style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                    onPress={handleComplete}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>✓ ዝርጋታ ተጠናቋል — አረጋግጥ</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: {
        backgroundColor: '#0f766e',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    backBtn: { marginBottom: 6 },
    backText: { color: '#99f6e4', fontSize: 13, fontWeight: '600' },
    title: { fontSize: 18, fontWeight: '800', color: '#fff' },
    appNumber: { fontSize: 13, color: '#5eead4', fontFamily: 'monospace', marginTop: 2 },
    content: { padding: 16, paddingBottom: 40 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    cardTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
    customerName: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
    info: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
    addressDesc: { fontSize: 11, color: '#9ca3af', fontStyle: 'italic', marginTop: 4 },
    materialsInfo: { gap: 4 },
    amount: { fontWeight: '800', color: '#2563eb', fontFamily: 'monospace' },
    mono: { fontFamily: 'monospace', color: '#374151' },
    notesInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 10,
        fontSize: 13,
        backgroundColor: '#f9fafb',
        textAlignVertical: 'top',
        minHeight: 70,
    },
    submitBtn: {
        backgroundColor: '#059669',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
        elevation: 2,
    },
    submitBtnDisabled: { backgroundColor: '#6ee7b7' },
    submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
