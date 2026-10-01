import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { newLineAPI } from '../api/endpoints';
import { offlineQueueService } from '../services/offlineQueueService';
import GpsCapture from '../components/GpsCapture';

export default function SurveyDetailScreen({ application, onBack, onSuccess }) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [commonMaterials, setCommonMaterials] = useState([]);
    const [items, setItems] = useState([]);
    const [notes, setNotes] = useState('');
    const [gps, setGps] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [materialsRes, existingItems] = await Promise.allSettled([
                newLineAPI.getCommonMaterials(),
                newLineAPI.getApplicationItems(application.id),
            ]);

            const materials = materialsRes.status === 'fulfilled' ? (materialsRes.value || []) : [];
            setCommonMaterials(materials);

            // If items already exist (re-opening), pre-fill
            if (existingItems.status === 'fulfilled' && existingItems.value?.length > 0) {
                setItems(existingItems.value.map((item) => ({
                    materialId: item.materialId || item.commonMaterial?.id,
                    materialName: item.materialName || item.commonMaterial?.materialName || '',
                    quantity: String(item.quantity || 1),
                    unitPrice: String(item.unitPrice || 0),
                })));
            }
        } catch (err) {
            console.warn('[SurveyDetail] Load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const addMaterial = (material) => {
        // Don't add duplicates
        if (items.find((i) => i.materialId === material.id)) {
            Alert.alert('ማስጠንቀቂያ', 'ይህ እቃ ቀድሞ ተጨምሯል');
            return;
        }
        setItems((prev) => [
            ...prev,
            {
                materialId: material.id,
                materialName: material.materialName || material.name || '',
                quantity: '1',
                unitPrice: String(material.unitPrice || 0),
            },
        ]);
    };

    const updateItem = (index, field, value) => {
        setItems((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const removeItem = (index) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => {
            return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
        }, 0);
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            Alert.alert('ማስጠንቀቂያ', 'ቢያንስ 1 እቃ ማስገባት ያስፈልጋል');
            return;
        }

        Alert.alert(
            'ማረጋገጫ',
            `${items.length} እቃዎች (ጠቅላላ ETB ${calculateTotal().toFixed(2)}) ለማስገባት ይፈልጋሉ?`,
            [
                { text: 'ይቅር', style: 'cancel' },
                {
                    text: 'አስገባ ✓',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            const payload = {
                                plumberNotes: notes,
                                items: items.map((item) => ({
                                    materialId: item.materialId,
                                    materialName: item.materialName,
                                    quantity: Number(item.quantity) || 1,
                                    unitPrice: Number(item.unitPrice) || 0,
                                })),
                                fees: [],
                            };

                            await newLineAPI.submitSurvey(application.id, payload);
                            Alert.alert('ተሳክቷል! ✓', 'የዳሰሳ ጥናት ውጤት ተመዝግቧል');
                            onSuccess?.();
                            onBack();
                        } catch (error) {
                            console.warn('[Survey] Submit error, queueing offline:', error);
                            // Queue for offline sync
                            try {
                                await offlineQueueService.enqueue('SUBMIT_SURVEY', application.id, {
                                    plumberNotes: notes,
                                    items: items.map((item) => ({
                                        materialId: item.materialId,
                                        materialName: item.materialName,
                                        quantity: Number(item.quantity) || 1,
                                        unitPrice: Number(item.unitPrice) || 0,
                                    })),
                                    fees: [],
                                });
                                Alert.alert(
                                    'ከመስመር ውጪ ተቀምጧል',
                                    'የዳሰሳ ውጤቱ ከመስመር ውጪ ተቀምጧል — ኔትዎርክ ሲመለስ ራሱ ይላካል።',
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

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1e40af" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backText}>← ተመለስ</Text>
                </TouchableOpacity>
                <Text style={styles.title}>📋 የዳሰሳ ጥናት ቅጽ</Text>
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

                {/* GPS Capture */}
                <View style={styles.card}>
                    <GpsCapture
                        value={gps}
                        onChange={setGps}
                        label="የመስመር ዝርጋታ ቦታ GPS"
                    />
                </View>

                {/* Materials Catalog */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📦 ከካታሎግ እቃ ጨምር</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.materialChips}>
                        {commonMaterials.map((mat) => (
                            <TouchableOpacity
                                key={mat.id}
                                style={styles.chip}
                                onPress={() => addMaterial(mat)}
                            >
                                <Text style={styles.chipText}>+ {mat.materialName || mat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Added Items */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🧾 የተመዘገቡ እቃዎች ({items.length})</Text>
                    {items.length === 0 ? (
                        <Text style={styles.emptyItems}>ገና ምንም እቃ አልተጨመረም</Text>
                    ) : (
                        items.map((item, idx) => (
                            <View key={idx} style={styles.itemRow}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.materialName}</Text>
                                    <View style={styles.itemInputs}>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>ብዛት:</Text>
                                            <TextInput
                                                style={styles.smallInput}
                                                value={item.quantity}
                                                onChangeText={(val) => updateItem(idx, 'quantity', val)}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>ዋጋ:</Text>
                                            <TextInput
                                                style={styles.smallInput}
                                                value={item.unitPrice}
                                                onChangeText={(val) => updateItem(idx, 'unitPrice', val)}
                                                keyboardType="decimal-pad"
                                            />
                                        </View>
                                        <Text style={styles.itemSubtotal}>
                                            = {((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => removeItem(idx)} style={styles.removeBtn}>
                                    <Text style={styles.removeBtnText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                    {items.length > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>ጠቅላላ (Total):</Text>
                            <Text style={styles.totalValue}>ETB {calculateTotal().toFixed(2)}</Text>
                        </View>
                    )}
                </View>

                {/* Notes */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📝 የባለሙያ ማስታወሻ</Text>
                    <TextInput
                        style={styles.notesInput}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="ማስታወሻ ካለ ይጻፉ..."
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>✓ የዳሰሳ ጥናት ውጤት አስገባ</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: {
        backgroundColor: '#1e40af',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    backBtn: { marginBottom: 6 },
    backText: { color: '#bfdbfe', fontSize: 13, fontWeight: '600' },
    title: { fontSize: 18, fontWeight: '800', color: '#fff' },
    appNumber: { fontSize: 13, color: '#93c5fd', fontFamily: 'monospace', marginTop: 2 },
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
    materialChips: { flexDirection: 'row', marginTop: 4 },
    chip: {
        backgroundColor: '#eff6ff',
        borderWidth: 1,
        borderColor: '#93c5fd',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
    },
    chipText: { fontSize: 11, fontWeight: '600', color: '#2563eb' },
    emptyItems: { fontSize: 12, color: '#9ca3af', textAlign: 'center', paddingVertical: 12 },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 13, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
    itemInputs: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    inputGroup: { flexDirection: 'row', alignItems: 'center' },
    inputLabel: { fontSize: 11, color: '#6b7280', marginRight: 4 },
    smallInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        width: 60,
        fontSize: 12,
        textAlign: 'center',
        backgroundColor: '#f9fafb',
    },
    itemSubtotal: { fontSize: 12, fontWeight: '700', color: '#059669', marginLeft: 8 },
    removeBtn: {
        padding: 6,
        marginLeft: 8,
    },
    removeBtnText: { fontSize: 14, color: '#ef4444', fontWeight: '700' },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 2,
        borderTopColor: '#e5e7eb',
    },
    totalLabel: { fontSize: 14, fontWeight: '700', color: '#374151' },
    totalValue: { fontSize: 16, fontWeight: '900', color: '#2563eb', fontFamily: 'monospace' },
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
        backgroundColor: '#2563eb',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
        elevation: 2,
    },
    submitBtnDisabled: { backgroundColor: '#93c5fd' },
    submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
