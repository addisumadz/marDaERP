-- MardaArif Database Initialization Script
-- Run this against MySQL to set up the initial data

-- Create the database
CREATE DATABASE IF NOT EXISTS marda_arif_db;
USE marda_arif_db;

-- Insert default roles
INSERT INTO roles (id, name) VALUES (1, 'ROLE_ADMIN') ON DUPLICATE KEY UPDATE name = 'ROLE_ADMIN';
INSERT INTO roles (id, name) VALUES (2, 'ROLE_CITY_USER') ON DUPLICATE KEY UPDATE name = 'ROLE_CITY_USER';
INSERT INTO roles (id, name) VALUES (3, 'ROLE_VIEWER') ON DUPLICATE KEY UPDATE name = 'ROLE_VIEWER';

-- Insert default admin user (password: admin123 — BCrypt encoded)
-- Change this password immediately in production!
INSERT INTO users (id, username, name, email, password, status, registered_date)
VALUES (1, 'admin', 'System Administrator', 'admin@mardaarif.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'active', CURDATE())
ON DUPLICATE KEY UPDATE username = 'admin';

-- Assign admin role to the admin user
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1) ON DUPLICATE KEY UPDATE role_id = 1;

-- Example: Insert a sample city (optional — adjust for your setup)
-- INSERT INTO cities (city_name, city_code, api_key, wbms_base_url, is_active, created_at)
-- VALUES ('Addis Ababa', 'AA', 'your-api-key-here', 'http://localhost:9092/', true, NOW());
