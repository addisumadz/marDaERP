import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReadingEntryModal = ({
    visible,
    onClose,
    customer,
    onSubmit,
    zeroReasons = [],
    isSubmitting = false
}) => {
    const [currentReading, setCurrentReading] = useState('');
    const [selectedZeroReason, setSelectedZeroReason] = useState('');
    const [showZeroReasonPicker, setShowZeroReasonPicker] = useState(false);

    // Reset state when modal opens/closes or customer changes
    useEffect(() => {
        if (visible) {
            setCurrentReading('');
            setSelectedZeroReason('');
            setShowZeroReasonPicker(false);
        }
    }, [visible, customer]);

    const handleSave = () => {
        // Dismiss the keyboard so the user can easily see the updated UI (like the reason picker)
        Keyboard.dismiss();

        onSubmit({
            currentReading,
            zeroReasonId: selectedZeroReason
        }, {
            setShowZeroReasonPicker // Callback to allow parent to trigger zero reason picker if needed
        });
    };

    if (!customer) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Record Reading</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.customerInfoBlock}>
                        <Text style={styles.modalCustomerName}>
                            {customer.nameAm || customer.full_name || customer.name}
                        </Text>
                        <View style={styles.rowBetween}>
                            <Text style={styles.modalDetailText}>Meter: {customer.meterNumber || customer.meter_number}</Text>
                            <Text style={styles.modalDetailText}>
                                Prev: <Text style={styles.prevValue}>{customer.previous_reading || 0}</Text>
                            </Text>
                        </View>
                        {(customer.max_reading > 0) && (
                            <View style={[styles.rowBetween, { marginTop: 5 }]}>
                                <Text style={styles.modalDetailText}>Max Limit: {customer.max_reading}</Text>
                            </View>
                        )}
                    </View>

                    <TextInput
                        style={styles.readingInput}
                        placeholder="Enter Current Reading"
                        keyboardType="numeric"
                        value={currentReading}
                        onChangeText={setCurrentReading}
                        autoFocus={true}
                    />

                    {showZeroReasonPicker && (
                        <View style={styles.zeroReasonContainer}>
                            <Text style={styles.zeroReasonLabel}>Zero Consumption Reason:</Text>
                            <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled={true}>
                                {[...zeroReasons].sort((a, b) => a.id - b.id).map((reason) => (
                                    <TouchableOpacity
                                        key={reason.id}
                                        style={[
                                            styles.reasonItem,
                                            selectedZeroReason === reason.id && styles.selectedReasonItem
                                        ]}
                                        onPress={() => setSelectedZeroReason(reason.id)}
                                    >
                                        <View style={styles.reasonRadio}>
                                            {selectedZeroReason === reason.id && <View style={styles.reasonRadioSelected} />}
                                        </View>
                                        <Text style={[
                                            styles.reasonText,
                                            selectedZeroReason === reason.id && styles.selectedReasonText
                                        ]}>{reason.reasonName}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <View style={styles.footerContainer}>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>SUBMIT READING</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20, // More rounded as requested
        padding: 24,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
    customerInfoBlock: {
        backgroundColor: '#F7F9FC',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3'
    },
    modalCustomerName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#333' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
    modalDetailText: { color: '#666', fontSize: 14, fontWeight: '500' },
    prevValue: { fontWeight: 'bold', color: '#2196F3' },
    readingInput: {
        borderWidth: 2,
        borderColor: '#E3F2FD',
        backgroundColor: '#F5F9FF',
        borderRadius: 12,
        padding: 18,
        fontSize: 28,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#2196F3'
    },
    zeroReasonContainer: { marginBottom: 20 },
    zeroReasonLabel: { marginBottom: 12, fontWeight: 'bold', color: '#1a1a1a', fontSize: 16 },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#FAFAFA'
    },
    selectedReasonItem: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FF9800',
    },
    reasonRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#BDBDBD',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    reasonRadioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF9800'
    },
    reasonText: { fontSize: 16, color: '#424242' },
    selectedReasonText: { fontWeight: 'bold', color: '#E65100' },
    footerContainer: {
        marginTop: 10,
    },
    saveButton: {
        backgroundColor: '#2196F3',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
});

export default ReadingEntryModal;
