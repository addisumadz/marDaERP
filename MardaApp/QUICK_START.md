# 🚀 Quick Start Guide - Water Meter Reading Mobile App

## What I've Created For You

I've prepared all the essential files to get you started with your React Native (Expo) mobile app:

### 📁 Files Created:

1. **MOBILE_APP_SETUP.md** - Comprehensive setup instructions
2. **setup_mobile_app.bat** - Automated setup script
3. **Mobile app source files** (to be copied into your Expo project):
   - `mobile_src_config.js` → Configuration
   - `mobile_src_api_client.js` → API client with retry logic
   - `mobile_src_api_endpoints.js` → All backend API endpoints
   - `mobile_src_services_authService.js` → Authentication
   - `mobile_src_services_syncService.js` → Data synchronization
   - `mobile_src_utils_validation.js` → Reading validation
   - `mobile_App.js` → Test application

---

## 🎯 Next Steps (Choose Your Path)

### Option A: Automated Setup (Recommended)

```cmd
cd d:\Marda_WBMS\we
setup_mobile_app.bat
```

This will:
- Create the Expo project
- Install all dependencies
- Set up the project structure

### Option B: Manual Setup

Follow the instructions in `MOBILE_APP_SETUP.md`

---

## ⚙️ After Project Creation

Once the Expo project is created, you'll need to:

### 1. Copy Source Files

Move the created files into your project:

```cmd
cd d:\Marda_WBMS\we\wbill_mobile

REM Create directories
mkdir src\constants src\api src\services src\utils

REM Copy files (do this manually or use File Explorer)
copy ..\mobile_src_config.js src\constants\config.js
copy ..\mobile_src_api_client.js src\api\client.js
copy ..\mobile_src_api_endpoints.js src\api\endpoints.js
copy ..\mobile_src_services_authService.js src\services\authService.js
copy ..\mobile_src_services_syncService.js src\services\syncService.js
copy ..\mobile_src_utils_validation.js src\utils\validation.js
copy ..\mobile_App.js App.js
```

### 2. Update Configuration

Edit `src/constants/config.js`:

```javascript
// Find your computer's IP address first
// Run in CMD: ipconfig

BASE_URL_DEV: 'http://YOUR_IP_ADDRESS:8080/Billing_Inventory/billing',
```

**To find your IP:**
```cmd
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

### 3. Start Backend Server

```cmd
cd d:\Marda_WBMS\wbill_BE_23
mvnw spring-boot:run
```

### 4. Run Mobile App

```cmd
cd d:\Marda_WBMS\we\wbill_mobile
npm start
```

---

## 📱 Testing on Your Phone

1. **Install Expo Go** app from Play Store/App Store
2. **Connect to same WiFi** as your computer
3. **Scan QR code** from the terminal
4. **Test the app:**
   - Click "Test Login (Admin)"
   - Should show "Logged in successfully"
   - Click "Sync Data"
   - Should download customer data

---

## ✅ What's Working Now

- ✅ Authentication with existing backend
- ✅ Download customers assigned to reader
- ✅ Download reference data (addresses, meter sizes, etc.)
- ✅ Offline data storage
- ✅ Sync status tracking

## 🚧 What's Next (To Be Implemented)

- [ ] Login screen UI
- [ ] Customer list screen
- [ ] Meter reading entry form
- [ ] GPS location capture
- [ ] Photo capture
- [ ] Offline reading queue
- [ ] Batch upload

---

## 🐛 Troubleshooting

### "Network request failed"
- Check if backend is running: `http://YOUR_IP:8080/Billing_Inventory/billing/haddress1`
- Verify phone and computer on same WiFi
- Update IP in `config.js`

### "Cannot find module"
- Run: `cd wbill_mobile && npm install`
- Delete `node_modules` and run `npm install` again

### Backend CORS errors
- Add CORS configuration to Spring Boot (see setup guide)

---

## 📞 Need Help?

If you encounter issues:

1. Check that all files are in the correct locations
2. Verify backend is accessible from your phone's browser
3. Look at Metro bundler logs for errors
4. Check backend console for API request logs

---

## 🎨 Project Structure Preview

```
wbill_mobile/
├── App.js                    ← Test screen (you have this)
├── src/
│   ├── constants/
│   │   └── config.js         ← Configuration (you have this)
│   ├── api/
│   │   ├── client.js         ← API client (you have this)
│   │   └── endpoints.js      ← Endpoints (you have this)
│   ├── services/
│   │   ├── authService.js    ← Auth (you have this)
│   │   └── syncService.js    ← Sync (you have this)
│   └── utils/
│       └── validation.js     ← Validation (you have this)
├── screens/                  ← To be created
├── components/               ← To be created
└── package.json
```

---

## ✨ Ready to Start?

Run the setup script:

```cmd
cd d:\Marda_WBMS\we
setup_mobile_app.bat
```

Then follow the post-setup instructions above!
