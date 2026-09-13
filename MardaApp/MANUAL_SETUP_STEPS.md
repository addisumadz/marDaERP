# Manual Setup Steps - Water Meter Reading Mobile App

## Prerequisites

Before you start, ensure you have:
- ✅ Node.js installed (v18 or higher)
- ✅ Internet connection
- ✅ Android/iOS phone with Expo Go app installed

---

## Step 1: Create Expo Project

Open Command Prompt and run:

```cmd
cd D:\Marda_WBMS\MardaApp

npx create-expo-app@latest . --template blank
```

**Note:** The `.` means create in the current directory (MardaApp)

When prompted:
- Press Enter to confirm
- Wait for installation (may take 5-10 minutes)

---

## Step 2: Install Required Dependencies

After the project is created, install all required packages:

```cmd
npm install @react-native-async-storage/async-storage

npm install axios

npm install expo-location expo-camera expo-image-picker

npm install expo-secure-store

npm install react-native-paper
```

---

## Step 3: Create Project Structure

Create the folder structure:

```cmd
cd D:\Marda_WBMS\MardaApp

mkdir src
mkdir src\constants
mkdir src\api
mkdir src\services
mkdir src\utils
mkdir src\screens
mkdir src\components
```

---

## Step 4: Copy/Create Source Files

Now you need to create the source files. If you have them already in this directory, copy them to the correct locations:

```cmd
REM If files exist in MardaApp root, copy them:
copy mobile_src_config.js src\constants\config.js
copy mobile_src_api_client.js src\api\client.js
copy mobile_src_api_endpoints.js src\api\endpoints.js
copy mobile_src_services_authService.js src\services\authService.js
copy mobile_src_services_syncService.js src\services\syncService.js
copy mobile_src_utils_validation.js src\utils\validation.js
copy mobile_App.js App.js
```

If files don't exist, I'll create them in the next steps.

---

## Step 5: Configure Your Network

### Find Your Computer's IP Address

```cmd
ipconfig
```

Look for **IPv4 Address** under your active network adapter (e.g., `192.168.1.100`)

### Update Configuration File

Edit `src\constants\config.js` and replace the IP address:

```javascript
BASE_URL_DEV: 'http://192.168.1.100:8082/Billing_Inventory/billing',
//                    ^^^^^^^^^^^^^^
//                    Replace with your actual IP address
```

---

## Step 6: Test Backend Connection

Before running the mobile app, make sure your backend is running:

```cmd
cd D:\Marda_WBMS\wbill_BE_23

mvnw spring-boot:run
```

Test the backend is accessible by opening in browser:
```
http://localhost:8080/Billing_Inventory/billing/haddress1
```

You should see JSON data (list of addresses).

---

## Step 7: Start Mobile App Development Server

Open a NEW command prompt window:

```cmd
cd D:\Marda_WBMS\MardaApp

npm start
```

This will:
- Start Metro bundler
- Show a QR code
- Open a browser window with Expo DevTools

---

## Step 8: Run on Your Phone

### On Android:
1. Install **Expo Go** from Play Store
2. Open Expo Go app
3. Tap "Scan QR Code"
4. Scan the QR code from the terminal

### On iOS:
1. Install **Expo Go** from App Store
2. Open Camera app
3. Point at the QR code
4. Tap the notification to open in Expo Go

**IMPORTANT:** Your phone must be on the same WiFi network as your computer!

---

## Step 9: Test the App

Once the app loads on your phone:

1. Click **"Test Login (Admin)"**
   - Should show: "Logged in successfully!"
   
2. Click **"Sync Data"**
   - Should download customers
   - Should show billing period

If you see errors, check:
- ✅ Backend is running
- ✅ Phone and computer on same WiFi
- ✅ IP address in config.js is correct
- ✅ No firewall blocking port 8080

---

## Troubleshooting

### Error: "Network request failed"

**Solution:**
1. Find your IP: `ipconfig`
2. Update `src\constants\config.js` with correct IP
3. Test backend URL on phone's browser: `http://YOUR_IP:8080/Billing_Inventory/billing/haddress1`

### Error: "Cannot connect to Metro"

**Solution:**
```cmd
cd D:\Marda_WBMS\MardaApp
npm start --clear
```

### Error: Module not found

**Solution:**
```cmd
cd D:\Marda_WBMS\MardaApp
npm install
```

---

## Quick Reference Commands

### Start Backend:
```cmd
cd D:\Marda_WBMS\wbill_BE_23
mvnw spring-boot:run
```

### Start Mobile App:
```cmd
cd D:\Marda_WBMS\MardaApp
npm start
```

### Clear Cache:
```cmd
cd D:\Marda_WBMS\MardaApp
npm start --clear
```

### Reinstall Dependencies:
```cmd
cd D:\Marda_WBMS\MardaApp
rmdir /s /q node_modules
npm install
```

---

## What's Next?

After you get the test app working:

1. Create proper login screen UI
2. Build customer list screen
3. Create reading entry form
4. Add GPS and camera features
5. Implement offline queue
6. Build upload functionality

See the walkthrough document for detailed development roadmap!

---

## Need Help?

Check the console output for error messages:
- **Metro bundler** - Shows JavaScript errors
- **Spring Boot** - Shows API request logs
- **Phone** - Shake device to see error overlay
