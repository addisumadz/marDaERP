import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for dynamic URL and auth token
apiClient.interceptors.request.use(
    async (config) => {
        // Check for custom server URL
        try {
            const customAddress = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_URL);
            if (customAddress) {
                const cleanAddress = customAddress.replace(/\/$/, '');
                const prefix = cleanAddress.startsWith('http') ? '' : 'http://';
                config.baseURL = `${prefix}${cleanAddress}/mardamobileapp/billing`;
            }
        } catch (e) {
            // Ignore error, fallback to default baseURL
        }

        // Attach auth token if available
        try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            // Ignore
        }

        console.log(`[FieldAPI] ${config.method?.toUpperCase()} ${config.url} (Base: ${config.baseURL})`);
        return config;
    },
    (error) => {
        console.error('[FieldAPI Request Error]', error);
        return Promise.reject(error);
    }
);

// Response interceptor with retry logic
apiClient.interceptors.response.use(
    (response) => {
        console.log(`[FieldAPI] ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        const { config } = error;

        if (!config.__retryCount) {
            config.__retryCount = 0;
        }

        const shouldRetry =
            config.__retryCount < API_CONFIG.RETRY_ATTEMPTS &&
            (!error.response || error.response.status >= 500);

        if (shouldRetry) {
            config.__retryCount += 1;
            const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, config.__retryCount - 1);
            console.log(`[FieldAPI Retry] Attempt ${config.__retryCount}/${API_CONFIG.RETRY_ATTEMPTS} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return apiClient(config);
        }

        console.error('[FieldAPI Response Error]', error.message);
        return Promise.reject(error);
    }
);

export default apiClient;
