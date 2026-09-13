#!/bin/bash

# WBill Frontend Deployment Script
set -e

echo "Starting WBill Frontend deployment..."

# Build the application
echo "Building Next.js application..."
npm run build

# Create deployment directory if it doesn't exist
DEPLOY_DIR="/home/wbillpw/Documents/systemDataDontDelete/front"
mkdir -p "$DEPLOY_DIR"

# Copy built application to deployment directory
echo "Copying application to deployment directory..."
cp -r .next "$DEPLOY_DIR/"
cp -r public "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/" 2>/dev/null || echo "No package-lock.json found"
cp next.config.js "$DEPLOY_DIR/"

# Create .env.local in deployment directory
echo "Creating environment configuration..."
cat > "$DEPLOY_DIR/.env.local" << EOF
BACKEND_URL=http://localhost:8082
NODE_ENV=production
# Using Next.js proxy instead of direct API calls to avoid CORS
# NEXT_PUBLIC_API_URL is not needed when using /backend/* proxy
EOF

# Install production dependencies in deployment directory
echo "Installing production dependencies..."
cd "$DEPLOY_DIR"
npm ci --only=production

# Copy systemd service file
echo "Installing systemd service..."
sudo cp /home/wbillpw/Documents/both/Wbill_FT11-main/wbill-frontend.service /etc/systemd/system/

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable wbill-frontend.service

echo "Frontend deployment completed successfully!"
echo ""
echo "To start the service: sudo systemctl start wbill-frontend"
echo "To check status: sudo systemctl status wbill-frontend"
echo "To view logs: sudo journalctl -u wbill-frontend -f"
