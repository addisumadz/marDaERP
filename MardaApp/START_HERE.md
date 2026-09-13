# 🚀 Quick Manual Setup - Your Files Are Ready!

You already have all the source files in `D:\Marda_WBMS\MardaApp`. Just follow these steps:

---

## Step 1: Create Expo Project (5 minutes)

```cmd
cd D:\Marda_WBMS\MardaApp

npx create-expo-app@latest . --template blank
```

**What this does:** Creates a new Expo React Native project in the MardaApp folder

**Wait for:** "✅ Your project is ready!"

---

## Step 2: Install Dependencies (3-5 minutes)

```cmd
npm install @react-native-async-storage/async-storage axios expo-location expo-camera expo-image-picker expo-secure-store react-native-paper
```

**Wait for:** Installation to complete

---

## Step 3: Create Folder Structure

```cmd
mkdir src
mkdir src\constants
mkdir src\api
mkdir src\services
mkdir src\utils
```

---

## Step 4: Copy Your Source Files

```cmd
copy mobile_src_config.js src\constants\config.js
copy mobile_src_api_client.js src\api\client.js
copy mobile_src_api_endpoints.js src\api\endpoints.js
copy mobile_src_services_authService.js src\services\authService.js
copy mobile_src_services_syncService.js src\services\syncService.js
copy mobile_src_utils_validation.js src\utils\validation.js
copy mobile_App.js App.js
```

---

## Step 5: Find Your Computer's IP Address

```cmd
ipconfig
```

**Look for:** "IPv4 Address" (example: 192.168.1.100)

---

## Step 6: Update Configuration

Open: `src\constants\config.js`

Change line 5:
```javascript
BASE_URL_DEV: 'http://192.168.1.100:8082/Billing_Inventory/billing',
//                    ↑↑↑↑↑↑↑↑↑↑↑↑↑↑
//                    REPLACE WITH YOUR IP
```

---

## Step 7: Start Backend Server

**Open a NEW command prompt:**

```cmd
cd D:\Marda_WBMS\wbill_BE_23

mvnw spring-boot:run
```

**Wait for:** "Started Application"

**Test it:** Open browser → `http://localhost:8082/Billing_Inventory/billing/haddress1`
Should see JSON data

---

## Step 8: Start Mobile App

**Open ANOTHER NEW command prompt:**

```cmd
cd D:\Marda_WBMS\MardaApp

npm start
```

**You'll see:**
- QR Code in terminal
- Browser window opens
- Metro bundler running

---

## Step 9: Test on Your Phone

1. Install **Expo Go** app (Play Store / App Store)
2. Make sure phone is on **same WiFi** as your computer
3. **Scan QR code** with Expo Go (Android) or Camera (iOS)
4. App loads on your phone!

---

## Step 10: Test Functionality

In the app:

1. Click **"Test Login (Admin)"**
   - ✅ Should say: "Logged in successfully!"

2. Click **"Sync Data"**
   - ✅ Should download customers
   - ✅ Should show billing period

---

## 🎉 Success!

If you see the test app working, you're done with setup!

---

## ❌ If Something Goes Wrong

### "Network request failed"
- Check backend is running
- Update IP in `src\constants\config.js`
- Verify phone on same WiFi

### "Module not found"
```cmd
npm install
```

### App won't load
```cmd
npm start --clear
```

---

## 📋 Summary of All Commands

```cmd
REM Step 1 - Create project
cd D:\Marda_WBMS\MardaApp
npx create-expo-app@latest . --template blank

REM Step 2 - Install dependencies
npm install @react-native-async-storage/async-storage axios expo-location expo-camera expo-image-picker expo-secure-store react-native-paper

REM Step 3 - Create folders
mkdir src\constants src\api src\services src\utils

REM Step 4 - Copy files
copy mobile_src_config.js src\constants\config.js
copy mobile_src_api_client.js src\api\client.js
copy mobile_src_api_endpoints.js src\api\endpoints.js
copy mobile_src_services_authService.js src\services\authService.js
copy mobile_src_services_syncService.js src\services\syncService.js
copy mobile_src_utils_validation.js src\utils\validation.js
copy mobile_App.js App.js

REM Step 5 - Get IP
ipconfig

REM Step 6 - Edit src\constants\config.js (use your IP)

REM Step 7 - Start backend (new terminal)
cd D:\Marda_WBMS\wbill_BE_23
mvnw spring-boot:run

REM Step 8 - Start mobile app (another new terminal)
cd D:\Marda_WBMS\MardaApp
npm start
```

---

## ⏭️ What's Next?

After the test app works, you'll build:
- Login screen
- Customer list
- Reading entry form
- GPS & camera features
- Upload queue

Good luck! 🚀
