@echo off
echo ========================================
echo Water Billing Mobile App Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

echo NPM version:
npm --version
echo.

REM Navigate to workspace
cd /d d:\Marda_WBMS\we

REM Check if wbill_mobile already exists
if exist wbill_mobile (
    echo WARNING: wbill_mobile directory already exists!
    echo Do you want to delete it and start fresh? (Y/N)
    set /p choice=
    if /i "%choice%"=="Y" (
        echo Removing existing directory...
        rmdir /s /q wbill_mobile
    ) else (
        echo Keeping existing directory. Exiting...
        pause
        exit /b 0
    )
)

echo.
echo Creating Expo app...
echo This may take a few minutes...
echo.

call npx -y create-expo-app@latest wbill_mobile --template blank

if %errorlevel% neq 0 (
    echo ERROR: Failed to create Expo app!
    pause
    exit /b 1
)

echo.
echo Expo app created successfully!
echo.

cd wbill_mobile

echo Installing dependencies...
echo.

call npm install @react-native-async-storage/async-storage
call npm install @nozbe/watermelondb @nozbe/with-observables
call npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
call npm install axios
call npm install expo-location expo-camera expo-image-picker
call npm install @tanstack/react-query
call npm install expo-secure-store
call npm install react-native-paper

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. cd wbill_mobile
echo 2. npm start
echo 3. Scan the QR code with Expo Go app on your phone
echo.
echo See MOBILE_APP_SETUP.md for detailed instructions
echo.
pause
