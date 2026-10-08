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
import { validation } from '../utils/validation';

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

    // Internal warning card state (avoids Android multi-modal collision)
    const [warningConfig, setWarningConfig] = useState({
        visible: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: () => {},
        onCancel: () => {}
    });

    // Reset state when modal opens/closes or customer changes
    useEffect(() => {
        if (visible) {
            setCurrentReading('');
            setSelectedZeroReason('');
            setShowZeroReasonPicker(false);
            setWarningConfig({ visible: false, title: '', message: '', onConfirm: () => {}, onCancel: () => {} });
        }
    }, [visible, customer]);

    const handleSave = () => {
        Keyboard.dismiss();

        if (!customer) return;

        // Perform validation
        const result = validation.validateAndPrepareReading(customer, currentReading, selectedZeroReason);

        switch (result.action) {
            case 'error':
                // Show error warning card
                setWarningConfig({
                    visible: true,
                    title: 'Invalid Input',
                    message: result.message,
                    confirmText: 'OK',
                    singleButton: true,
                    onConfirm: () => setWarningConfig(prev => ({ ...prev, visible: false })),
                    onCancel: () => setWarningConfig(prev => ({ ...prev, visible: false }))
                });
                return;

            case 'select_zero_reason':
                // Reveal the zero reasons picker
                setShowZeroReasonPicker(true);
                return;

            case 'confirm_lower':
                // Current reading is less than previous reading
                // Rule: Never accept negative consumption. On confirm, adjust to previous reading (0 consumption)
                setWarningConfig({
                    visible: true,
                    title: '⚠️ Less Than Previous Reading',
                    message: result.message,
                    confirmText: 'Set 0 Consumption',
                    cancelText: 'Cancel',
                    singleButton: false,
                    onConfirm: () => {
                        // Adjust current reading to previous reading, resulting in 0 consumption
                        setCurrentReading(String(result.targetReading));
                        setShowZeroReasonPicker(true);
                        setWarningConfig(prev => ({ ...prev, visible: false }));
                    },
                    onCancel: () => {
                        // Strictly abort save and keep modal open for re-entry
                        setWarningConfig(prev => ({ ...prev, visible: false }));
                    }
                });
                return;

            case 'confirm_high':
                // Exaggerated reading warning (exceeds 2x average or max limit)
                setWarningConfig({
                    visible: true,
                    title: '⚠️ High Reading Warning',
                    message: result.message,
                    confirmText: 'Confirm & Proceed',
                    cancelText: 'Cancel',
                    singleButton: false,
                    onConfirm: () => {
                        setWarningConfig(prev => ({ ...prev, visible: false }));
                        proceedSubmit(result.data);
                    },
                    onCancel: () => {
                        // Strictly abort save and keep modal open for re-entry
                        setWarningConfig(prev => ({ ...prev, visible: false }));
                    }
                });
                return;

            case 'warn_zero_prev':
                // Previous reading was 0
                setWarningConfig({
                    visible: true,
                    title: '⚠️ Verify Meter Reading',
                    message: result.message,
                    confirmText: 'Confirm Reading',
                    cancelText: 'Cancel',
                    singleButton: false,
                    onConfirm: () => {
                        setWarningConfig(prev => ({ ...prev, visible: false }));
                        proceedSubmit(result.data);
                    },
                    onCancel: () => {
                        // Strictly abort save and keep modal open for re-entry
                        setWarningConfig(prev => ({ ...prev, visible: false }));
                    }
                });
                return;

            case 'proceed':
                // Valid reading — proceed to save directly
                proceedSubmit(result.data);
                return;
        }
    };

    const proceedSubmit = (data) => {
        onSubmit({
            currentReading: data.currentReadingNum !== undefined ? String(data.currentReadingNum) : currentReading,
            currentReadingNum: data.currentReadingNum,
            prevReading: data.prevReading,
            consumption: data.consumption,
            zeroReasonId: data.zeroReasonId || selectedZeroReason
        }, {
            setShowZeroReasonPicker
        });
    };

    if (!customer) return null;

    const isEncoded = customer.reading_status === 'encoded';

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
                        <Text style={styles.modalTitle}>
                            {isEncoded ? 'Update Reading' : 'Record Reading'}
                        </Text>
                        <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
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
                        editable={!isSubmitting}
                    />

                    {showZeroReasonPicker && (
                        <View style={styles.zeroReasonContainer}>
                            <Text style={styles.zeroReasonLabel}>Zero Consumption Reason (Required):</Text>
                            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
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

                    {/* Footer Buttons: Cancel & Submit side-by-side */}
                    <View style={styles.footerContainer}>
                        <TouchableOpacity
                            style={styles.cancelFooterButton}
                            onPress={onClose}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.cancelFooterButtonText}>CANCEL</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.saveButtonText}>SUBMIT</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Internal Warning Card Overlay (Single-Modal on Android) */}
                    {warningConfig.visible && (
                        <View style={styles.warningOverlay}>
                            <View style={styles.warningCard}>
                                <View style={styles.warningIconContainer}>
                                    <Ionicons name="warning" size={44} color="#FF9800" />
                                </View>
                                <Text style={styles.warningTitle}>{warningConfig.title}</Text>
                                <Text style={styles.warningMessage}>{warningConfig.message}</Text>
                                <View style={styles.warningButtonRow}>
                                    {!warningConfig.singleButton && (
                                        <TouchableOpacity
                                            style={styles.warningCancelBtn}
                                            onPress={warningConfig.onCancel}
                                        >
                                            <Text style={styles.warningCancelBtnText}>
                                                {warningConfig.cancelText || 'Cancel'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        style={[styles.warningConfirmBtn, warningConfig.singleButton && { flex: 1 }]}
                                        onPress={warningConfig.onConfirm}
                                    >
                                        <Text style={styles.warningConfirmBtnText}>
                                            {warningConfig.confirmText || 'OK'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
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
        maxHeight: '90%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        elevation: 10,
        position: 'relative',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
    customerInfoBlock: {
        backgroundColor: '#F7F9FC',
        padding: 14,
        borderRadius: 12,
        marginBottom: 18,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3'
    },
    modalCustomerName: { fontSize: 17, fontWeight: 'bold', marginBottom: 6, color: '#333' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
    modalDetailText: { color: '#666', fontSize: 13, fontWeight: '500' },
    prevValue: { fontWeight: 'bold', color: '#2196F3' },
    readingInput: {
        borderWidth: 2,
        borderColor: '#E3F2FD',
        backgroundColor: '#F5F9FF',
        borderRadius: 12,
        padding: 14,
        fontSize: 26,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 18,
        color: '#2196F3'
    },
    zeroReasonContainer: { marginBottom: 16 },
    zeroReasonLabel: { marginBottom: 10, fontWeight: 'bold', color: '#E65100', fontSize: 15 },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        marginBottom: 6,
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
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    reasonRadioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF9800'
    },
    reasonText: { fontSize: 15, color: '#424242', flex: 1 },
    selectedReasonText: { fontWeight: 'bold', color: '#E65100' },
    footerContainer: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 12,
    },
    cancelFooterButton: {
        flex: 1,
        backgroundColor: '#EEEEEE',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelFooterButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    saveButton: {
        flex: 2,
        backgroundColor: '#2196F3',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    saveButtonDisabled: {
        backgroundColor: '#90CAF9',
    },
    saveButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold', letterSpacing: 0.8 },
    // Internal Warning Overlay Styles
    warningOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        zIndex: 999,
    },
    warningCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    warningIconContainer: {
        marginBottom: 10,
    },
    warningTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 10,
        textAlign: 'center',
    },
    warningMessage: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    warningButtonRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 10,
    },
    warningCancelBtn: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    warningCancelBtnText: {
        color: '#757575',
        fontSize: 15,
        fontWeight: '600',
    },
    warningConfirmBtn: {
        flex: 1.2,
        backgroundColor: '#FF9800',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 2,
    },
    warningConfirmBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
});

export default ReadingEntryModal;
