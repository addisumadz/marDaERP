import apiClient from './client';

/**
 * API Endpoints for Water Billing Mobile App
 * Based on LegacyMobileBillingController.java
 */

export const authAPI = {
    /**
     * Authenticate user
     * POST /huseraccount/{username}/{password}/{mobileId}
     * @returns "success" | "perror" | "error"
     */
    login: async (username, password, mobileId) => {
        const response = await apiClient.post(
            `/huseraccount/${username}/${password}/${mobileId}`
        );
        return response.data;
    },
};

export const syncAPI = {
    /**
     * Get current billing period and system flags
     * GET /kfyawor/{username}
     */
    getKfyawor: async (username) => {
        const response = await apiClient.get(`/kfyawor/${username}`);
        return response.data[0]; // Returns array with single object
    },

    /**
     * Get assigned customers for the reader
     * GET /hcustomerinfo/{username}
     */
    getCustomers: async (username) => {
        const response = await apiClient.get(`/hcustomerinfo/${username}`);
        return response.data;
    },

    /**
     * Get Wuzif (previous bills) data for customers
     * GET /hwuzif/{username}
     */
    getWuzif: async (username) => {
        const response = await apiClient.get(`/hwuzif/${username}`);
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
     * Get address streets (Kebele)
     * GET /haddress1
     */
    getStreets: async () => {
        const response = await apiClient.get('/haddress1');
        return response.data;
    },

    /**
     * Get address ketenas
     * GET /haddress2
     */
    getKetenas: async () => {
        const response = await apiClient.get('/haddress2');
        return response.data;
    },

    /**
     * Get zero reading reasons
     * GET /zeroreason
     */
    getZeroReasons: async () => {
        const response = await apiClient.get('/zeroreason');
        return response.data;
    },

    /**
     * Get customer types
     * GET /hcustomertype
     */
    getCustomerTypes: async () => {
        const response = await apiClient.get('/hcustomertype');
        return response.data;
    },

    /**
     * Get meter sizes
     * GET /hmetersize
     */
    getMeterSizes: async () => {
        const response = await apiClient.get('/hmetersize');
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
        // This endpoint will be created in the backend
        const response = await apiClient.post('/mobilereading/bulk', {
            readings: readings,
        });
        return response.data;
    },
};

/**
 * Helper function to download all reference data at once
 */
export const downloadAllReferenceData = async () => {
    const [streets, ketenas, zeroReasons, customerTypes, meterSizes] =
        await Promise.all([
            referenceDataAPI.getStreets(),
            referenceDataAPI.getKetenas(),
            referenceDataAPI.getZeroReasons(),
            referenceDataAPI.getCustomerTypes(),
            referenceDataAPI.getMeterSizes(),
        ]);

    return {
        streets,
        ketenas,
        zeroReasons,
        customerTypes,
        meterSizes,
    };
};

/**
 * Helper function to sync all data for a user
 */
export const syncAllData = async (username) => {
    const [kfyawor, customers, wuzif, referenceData] = await Promise.all([
        syncAPI.getKfyawor(username),
        syncAPI.getCustomers(username),
        syncAPI.getWuzif(username),
        downloadAllReferenceData(),
    ]);

    return {
        kfyawor,
        customers,
        wuzif,
        ...referenceData,
    };
};
