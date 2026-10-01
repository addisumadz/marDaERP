import apiClient from './client';
import { NEW_LINE_API_BASE } from '../constants/config';

/**
 * Authentication API — reuses the same legacy mobile auth endpoint as MardaMApp
 */
export const authAPI = {
    /**
     * Authenticate plumber/technician
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

/**
 * New Line Connection Survey & Installation APIs
 * Matches the backend CustomNewLineConnectionController endpoints
 */
export const newLineAPI = {
    /**
     * Get applications filtered by status (for plumber's assigned jobs)
     * GET /custom-new-line/applications?status=X&page=0&size=50
     */
    getApplications: async ({ status, page = 0, size = 50, branchId, search } = {}) => {
        let url = `${NEW_LINE_API_BASE}/applications?page=${page}&size=${size}`;
        if (status && status !== 'ALL') url += `&status=${encodeURIComponent(status)}`;
        if (branchId) url += `&branchId=${branchId}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        const response = await apiClient.get(url);
        return response.data;
    },

    /**
     * Get a single application by ID (for detail view)
     * GET /custom-new-line/applications/:id
     */
    getApplicationById: async (id) => {
        const response = await apiClient.get(`${NEW_LINE_API_BASE}/applications/${id}`);
        return response.data;
    },

    /**
     * Get items for an application (survey materials list)
     * GET /custom-new-line/applications/:id/items
     */
    getApplicationItems: async (id) => {
        const response = await apiClient.get(`${NEW_LINE_API_BASE}/applications/${id}/items`);
        return response.data || [];
    },

    /**
     * Get fee types for survey cost estimation
     * GET /custom-new-line/fee-types
     */
    getFeeTypes: async () => {
        const response = await apiClient.get(`${NEW_LINE_API_BASE}/fee-types`);
        return response.data;
    },

    /**
     * Get common materials catalog
     * GET /custom-new-line/common-materials
     */
    getCommonMaterials: async () => {
        const response = await apiClient.get(`${NEW_LINE_API_BASE}/common-materials`);
        return response.data;
    },

    /**
     * Submit survey results (materials, fees, notes)
     * PUT /custom-new-line/applications/:id/submit-survey
     */
    submitSurvey: async (id, { plumberNotes, items, fees }) => {
        const response = await apiClient.put(
            `${NEW_LINE_API_BASE}/applications/${id}/submit-survey`,
            { plumberNotes, items, fees }
        );
        return response.data;
    },

    /**
     * Complete installation
     * PUT /custom-new-line/applications/:id/complete-installation
     */
    completeInstallation: async (id, { notes }) => {
        const response = await apiClient.put(
            `${NEW_LINE_API_BASE}/applications/${id}/complete-installation`,
            { notes }
        );
        return response.data;
    },

    /**
     * Get department stats (for dashboard KPI counts)
     * GET /custom-new-line/stats
     */
    getDepartmentStats: async (branchId = null) => {
        const url = branchId
            ? `${NEW_LINE_API_BASE}/stats?branchId=${branchId}`
            : `${NEW_LINE_API_BASE}/stats`;
        const response = await apiClient.get(url);
        return response.data;
    },
};
