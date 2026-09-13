// API Configuration
export const API_CONFIG = {
    // IMPORTANT: Update these URLs for your environment
    // For development, use your computer's IP address (find it using 'ipconfig' command)
    BASE_URL_DEV: 'http://192.168.1.100:8082/Billing_Inventory/billing',
    BASE_URL_PROD: 'https://your-production-server.com:8082/Billing_Inventory/billing',

    // Automatically use dev or prod based on environment
    get BASE_URL() {
        return __DEV__ ? this.BASE_URL_DEV : this.BASE_URL_PROD;
    },

    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second base delay
};

// App Configuration
export const APP_CONFIG = {
    APP_NAME: 'Water Meter Reading',
    VERSION: '1.0.0',
    SYNC_INTERVAL: 300000, // 5 minutes when online
    GPS_ACCURACY: 'high', // 'high', 'balanced', or 'low'
    PHOTO_QUALITY: 0.7, // 0-1, lower = smaller file size
    MAX_PHOTO_SIZE: 2 * 1024 * 1024, // 2MB max
};

// Validation Rules
export const VALIDATION_RULES = {
    MIN_READING: 0,
    MAX_READING: 999999,
    HIGH_CONSUMPTION_MULTIPLIER: 3, // Alert if > 3x average
    REQUIRE_PHOTO_THRESHOLD: 100, // Require photo if consumption > 100
    REQUIRE_GPS: true,
};

// Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: '@wbill:auth_token',
    USERNAME: '@wbill:username',
    USER_DATA: '@wbill:user_data',
    LAST_SYNC: '@wbill:last_sync',
    KIFYAWER: '@wbill:kifyawer',
};
