// API Configuration — matches MardaMApp pattern for consistency
export const API_CONFIG = {
    // IMPORTANT: Update these URLs for your environment
    // For development, use your computer's IP address (find it using 'ipconfig' command)
    BASE_URL_DEV: 'http://192.168.1.100:8082/Billing_Inventory/billing',
    BASE_URL_PROD: 'https://your-production-server.com:8082/Billing_Inventory/billing',

    // Automatically use dev or prod based on environment
    get BASE_URL() {
        return __DEV__ ? this.BASE_URL_DEV : this.BASE_URL_PROD;
    },

    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
};

// New Line Connection API base path
export const NEW_LINE_API_BASE = '/custom-new-line';

// App Configuration
export const APP_CONFIG = {
    APP_NAME: 'MarDa Field App',
    APP_NAME_AM: 'የመስክ ሥራ መተግበሪያ',
    VERSION: '1.0.0',
    SYNC_INTERVAL: 300000, // 5 minutes when online
    GPS_ACCURACY: 'high',
};

// Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: '@fieldapp:auth_token',
    USERNAME: '@fieldapp:username',
    USER_DATA: '@fieldapp:user_data',
    CUSTOM_URL: '@fieldapp:custom_url',
    LAST_SYNC: '@fieldapp:last_sync',
    PLUMBER_ID: '@fieldapp:plumber_id',
};

// Status Labels (Amharic + English)
export const STATUS_LABELS = {
    PENDING_SURVEY_ASSIGNMENT: { am: 'ባለሙያ በመጠባበቅ ላይ', en: 'Awaiting Plumber' },
    SURVEY_IN_PROGRESS: { am: 'የዳሰሳ ጥናት ላይ', en: 'Survey In Progress' },
    PENDING_PAYMENT_APPROVAL: { am: 'ክፍያ በመጠባበቅ ላይ', en: 'Pending Payment' },
    PENDING_STORE_COLLECTION: { am: 'ዕቃ ከስቶር', en: 'Store Collection' },
    MATERIALS_COLLECTED: { am: 'ዕቃ ተወስዷል', en: 'Materials Collected' },
    INSTALLATION_IN_PROGRESS: { am: 'ዝርጋታ ላይ', en: 'Installing' },
    INSTALLATION_COMPLETED: { am: 'ዝርጋታ ተጠናቋል', en: 'Installed' },
    FINAL_ACTIVATION_COMPLETED: { am: 'ደንበኛው ነቅቷል', en: 'Active' },
};
