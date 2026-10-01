import apiClient from './client';

/**
 * API Endpoints for Water Billing Mobile App
 * Based on LegacyMobileBillingController.java
 */

export const authAPI = {
    /**
     * Authenticate user
     * Tries modern POST /auth/login with request body first.
     * Falls back to legacy POST /huseraccount/{username}/{password}/{mobileId} if not supported.
     * @returns { status: "success" | "perror" | "error", user_id, ... }
     */
    login: async (username, password, mobileId) => {
        try {
            // 1. Modern secure body endpoint (avoids sending passwords in URL)
            const response = await apiClient.post('/auth/login', {
                username,
                password,
                mobileId,
            });
            return response.data;
        } catch (error) {
            // If the server doesn't have /auth/login (404/405), fallback to legacy path endpoint
            if (error.response && (error.response.status === 404 || error.response.status === 405)) {
                console.warn('[authAPI] /auth/login not found on server, falling back to legacy endpoint');
                const response = await apiClient.post(
                    `/huseraccount/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${encodeURIComponent(mobileId)}`
                );
                return response.data;
            }
            throw error;
        }
    },
};

export const syncAPI = {
    /**
     * Get unified customer data (master + previous readings + arrears) in a single JSON request
     * GET /customers/unified/{username}
     */
    getUnifiedCustomerData: async (username) => {
        const response = await apiClient.get(`/customers/unified/${username}`);
        return response.data;
    },

    /**
     * Get current billing period and system flags
     * GET /kfyawor/{username}
     */
    getKfyawor: async (username) => {
        const response = await apiClient.get(`/kfyawor/${username}`);
        return response.data[0]; // Returns array with single object
    },

    /**
     * Get assigned customers for the reader (Enriched Data)
     * GET /hcustomerfdata/{username}
     */
    getCustomers: async (username) => {
        const response = await apiClient.get(`/hcustomerfdata/${username}`);
        return response.data;
    },

    /**
     * Download CSV file link (if available)
     * GET /mobilereading/csvfile/{username}
     */
    getCsvFileLink: async (username) => {
        const response = await apiClient.get(`/mobilereading/csvfile/${username}`);
        return response.data; // Returns URL string
    },
};

export const referenceDataAPI = {
    /**
     * Get zero reading reasons
     * GET /zeroreason
     */
    getZeroReasons: async () => {
        const response = await apiClient.get('/zeroreason');
        return response.data;
    },
};

export const cardManagementAPI = {
    /**
     * Update customer details (Phone, GPS, QR)
     * POST /hcustomerupdate
     */
    updateCustomer: async (data) => {
        // Data should include { id, phone_number, location_coordination, qr_code }
        const response = await apiClient.post('/hcustomerupdate', data);
        return response.data;
    },
};

export const readingAPI = {
    /**
     * Submit a single meter reading
     * POST /mobilereading
     */
    submitReading: async (readingData) => {
        const response = await apiClient.post('/mobilereading', readingData);
        return response.data;
    },

    /**
     * Submit multiple readings (TODO: Backend endpoint needs to be created)
     * POST /mobilereading/bulk
     */
    submitBulkReadings: async (readings) => {
        const response = await apiClient.post('/mobilereading/bulk', readings);
        return response.data;
    },
};

/**
 * Helper function to download all reference data at once
 */
export const downloadAllReferenceData = async () => {
    const [zeroReasons] =
        await Promise.all([
            referenceDataAPI.getZeroReasons(),
        ]);

    return {
        zeroReasons,
    };
};


