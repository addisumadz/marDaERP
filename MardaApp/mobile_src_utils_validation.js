import { VALIDATION_RULES } from '../constants/config';

/**
 * Reading Validation Utilities
 */

export const validation = {
    /**
     * Validate meter reading input
     */
    validateReading: (customer, currentReading, kfyawor) => {
        const errors = [];
        const warnings = [];

        // Check if reading is a valid number
        if (isNaN(currentReading) || currentReading === null || currentReading === '') {
            errors.push('Please enter a valid reading');
            return { valid: false, errors, warnings };
        }

        const reading = Number(currentReading);
        const previousReading = Number(customer.previousReading || 0);
        const consumption = reading - previousReading;

        // Check minimum/maximum bounds
        if (reading < VALIDATION_RULES.MIN_READING) {
            errors.push(`Reading cannot be less than ${VALIDATION_RULES.MIN_READING}`);
        }

        if (reading > VALIDATION_RULES.MAX_READING) {
            errors.push(`Reading cannot exceed ${VALIDATION_RULES.MAX_READING}`);
        }

        // Check for negative consumption
        if (consumption < 0) {
            warnings.push('Negative consumption detected. Please verify the reading.');
        }

        // Check for zero consumption
        if (consumption === 0) {
            return {
                valid: true,
                errors,
                warnings,
                requiresZeroReason: true,
                consumption,
            };
        }

        // Check for unusually high consumption
        const avgConsumption = customer.avgConsumption || 50; // Default if not available
        if (consumption > avgConsumption * VALIDATION_RULES.HIGH_CONSUMPTION_MULTIPLIER) {
            warnings.push(
                `Unusually high consumption (${consumption} m³). Average is ${avgConsumption} m³.`
            );
        }

        // Check if photo is required
        const requiresPhoto = consumption > VALIDATION_RULES.REQUIRE_PHOTO_THRESHOLD;

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            consumption,
            requiresPhoto,
            requiresZeroReason: false,
        };
    },

    /**
     * Validate customer data completeness
     */
    validateCustomerData: (customer) => {
        const required = ['id', 'account_number', 'full_name', 'meter_number'];
        const missing = required.filter(field => !customer[field]);

        return {
            valid: missing.length === 0,
            missingFields: missing,
        };
    },

    /**
     * Format reading for display
     */
    formatReading: (reading) => {
        if (reading === null || reading === undefined) return '-';
        return Number(reading).toLocaleString();
    },

    /**
     * Format consumption for display
     */
    formatConsumption: (consumption) => {
        if (consumption === null || consumption === undefined) return '-';
        const num = Number(consumption);
        return num >= 0 ? `${num.toLocaleString()} m³` : `(${Math.abs(num).toLocaleString()}) m³`;
    },

    /**
     * Sanitize input to numbers only
     */
    sanitizeNumericInput: (input) => {
        return input.replace(/[^0-9]/g, '');
    },
};
