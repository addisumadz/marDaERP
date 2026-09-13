#!/bin/bash

# WBill Backend Deployment Script
set -e

echo "Starting WBill Backend deployment..."

# Build the WAR file
echo "Building WAR file..."
mvn clean package -DskipTests

# Check if WAR file was created
WAR_FILE="target/school-1.0.0.war"
if [ ! -f "$WAR_FILE" ]; then
    echo "Error: WAR file not found at $WAR_FILE"
    exit 1
fi

# Create deployment directory if it doesn't exist
DEPLOY_DIR="/home/wbillpw/Documents/systemDataDontDelete"
#sudo mkdir -p "$DEPLOY_DIR"

# Copy WAR file to deployment directory
echo "Copying WAR file to deployment directory..."
sudo cp "$WAR_FILE" "$DEPLOY_DIR/backend.war"

# Set proper permissions
sudo chown wbillpw:wbillpw "$DEPLOY_DIR/backend.war"
sudo chmod 755 "$DEPLOY_DIR/backend.war"

# Copy systemd service file
#echo "Installing systemd service..."
#sudo cp wbill-backend.service /etc/systemd/system/

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable wbill-backend.service

echo "Deployment completed successfully!"
echo ""
echo "To start the service: sudo systemctl start wbill-backend"
echo "To check status: sudo systemctl status wbill-backend"
echo "To view logs: sudo journalctl -u wbill-backend -f"
