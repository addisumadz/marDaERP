# Network Configuration Guide

## Overview
Your application has been configured to work on any IP address instead of being restricted to 192.168.8.106.

## Changes Made

### Backend (Spring Boot)
1. **Server Binding**: Added `server.address=0.0.0.0` to `application.properties` to bind the server to all network interfaces
2. **CORS Configuration**: Updated CORS settings to allow requests from any origin using `allowedOriginPatterns("*")`

### Frontend (Next.js)
1. **Server Binding**: Already configured with `--hostname 0.0.0.0` in package.json scripts
2. **API URL**: Modified to use environment variable `NEXT_PUBLIC_API_URL` with localhost fallback

## Environment Configuration

### For Development
Create a `.env.local` file in the frontend root with:
```
NEXT_PUBLIC_API_URL=http://localhost:8082/api/card_managenment/
```

### For Production/Network Access
Set the API URL to your server's IP:
```
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:8082/api/card_managenment/
```

## Running the Applications

### Backend
```bash
cd /home/wbill/Documents/both/wbillBEv10
./mvnw spring-boot:run
```
The backend will now be accessible on all network interfaces at port 8082.

### Frontend
```bash
cd /home/wbill/Documents/both/Wbill_FT11
npm run dev
```
The frontend will be accessible on all network interfaces at port 3000.

## Security Note
The current CORS configuration allows all origins (`*`) for development purposes. For production, replace this with specific allowed domains for better security.

## Testing Network Access
1. Find your machine's IP address: `ip addr show` or `hostname -I`
2. Access frontend: `http://YOUR_IP:3000`
3. Backend API will be accessible at: `http://YOUR_IP:8082/api/card_managenment/`
