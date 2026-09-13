import axios from 'axios';
import { API_CONFIG } from '../constants/config';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
    (config) => {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Response interceptor with retry logic
apiClient.interceptors.response.use(
    (response) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        const { config } = error;

        // Initialize retry count
        if (!config.__retryCount) {
            config.__retryCount = 0;
        }

        // Check if should retry
        const shouldRetry =
            config.__retryCount < API_CONFIG.RETRY_ATTEMPTS &&
            (!error.response || error.response.status >= 500);

        if (shouldRetry) {
            config.__retryCount += 1;

            // Exponential backoff
            const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, config.__retryCount - 1);

            console.log(`[API Retry] Attempt ${config.__retryCount}/${API_CONFIG.RETRY_ATTEMPTS} after ${delay}ms`);

            await new Promise(resolve => setTimeout(resolve, delay));
            return apiClient(config);
        }

        console.error('[API Response Error]', error.message);
        return Promise.reject(error);
    }
);

export default apiClient;
