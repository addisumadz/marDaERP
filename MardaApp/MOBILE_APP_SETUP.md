# Mobile Meter Reading App - Setup Guide

## Prerequisites

Before starting, ensure you have:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Git** - Already installed ✓
3. **Expo CLI** - Will be installed via npx
4. **Expo Go App** - Install on your Android/iOS device for testing

---

## Step 1: Create the Expo Project

Open a command prompt and run:

```cmd
cd d:\Marda_WBMS\we
npx create-expo-app@latest wbill_mobile --template blank
cd wbill_mobile
```

This creates a new Expo project with a minimal template.

---

## Step 2: Install Core Dependencies

```cmd
npm install @react-native-async-storage/async-storage
npm install @nozbe/watermelondb @nozbe/with-observables
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install axios
npm install expo-location expo-camera expo-image-picker
npm install react-query @tanstack/react-query
npm install expo-secure-store
npm install react-native-paper
npm install @babel/plugin-proposal-decorators
```

---

## Step 3: Configure WatermelonDB

### 3.1 Update `babel.config.js`

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
    ],
  };
};
```

### 3.2 Update `metro.config.js`

Create this file in the root directory:

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
```

---

## Step 4: Create Project Structure

Create the following directory structure:

```
wbill_mobile/
├── src/
│   ├── api/
│   │   ├── client.js
│   │   └── endpoints.js
│   ├── components/
│   │   ├── CustomerCard.js
│   │   ├── ReadingForm.js
│   │   └── SyncStatus.js
│   ├── database/
│   │   ├── index.js
│   │   ├── schema.js
│   │   └── models/
│   │       ├── Customer.js
│   │       ├── PendingReading.js
│   │       └── ReferenceData.js
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── SyncScreen.js
│   │   ├── CustomerListScreen.js
│   │   ├── ReadingEntryScreen.js
│   │   └── UploadScreen.js
│   ├── services/
│   │   ├── syncService.js
│   │   ├── authService.js
│   │   └── locationService.js
│   ├── utils/
│   │   ├── validation.js
│   │   └── storage.js
│   └── constants/
│       └── config.js
├── assets/
├── App.js
└── package.json
```

---

## Step 5: Configure API Connection

### Create `src/constants/config.js`

```javascript
export const API_CONFIG = {
  // Update these URLs based on your setup
  BASE_URL_DEV: 'http://192.168.1.100:8080/Billing_Inventory/billing',
  BASE_URL_PROD: 'https://your-production-server.com/Billing_Inventory/billing',
  
  // Use development by default
  get BASE_URL() {
    return __DEV__ ? this.BASE_URL_DEV : this.BASE_URL_PROD;
  },
  
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};
```

**IMPORTANT**: Replace `192.168.1.100` with your computer's actual IP address to test on a real device.

To find your IP address:
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

---

## Step 6: Run the Development Server

```cmd
npm start
```

This will start the Expo development server. You'll see a QR code:

1. **Install Expo Go** on your Android/iOS device
2. **Scan the QR code** with:
   - Android: Expo Go app
   - iOS: Camera app (opens in Expo Go)

---

## Step 7: Backend Configuration

### Update Spring Boot CORS Configuration

Add to your `WebSecurityConfig.java` or create a CORS configuration:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("*")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*");
            }
        };
    }
}
```

### Ensure Backend is Running

```cmd
cd d:\Marda_WBMS\wbill_BE_23
mvnw spring-boot:run
```

---

## Troubleshooting

### "Network request failed"
- Ensure your phone and computer are on the same WiFi network
- Check if backend is running on `http://YOUR_IP:8080`
- Update `BASE_URL_DEV` in `config.js` with correct IP

### "Cannot connect to Metro"
- Run `npm start --clear` to clear cache
- Check firewall settings

### "Module not found"
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

---

## Next Steps

After setup is complete:

1. ✓ Test the blank app loads on your device
2. Implement authentication screen
3. Set up database schemas
4. Create sync functionality
5. Build reading entry form
6. Implement upload queue

Refer to the implementation plan for detailed feature development.
