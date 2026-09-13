-- Create the login_attempts table
CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL COMMENT 'Username attempting to log in',
    ip_address VARCHAR(45) NOT NULL COMMENT 'IP address of the login attempt (supports IPv4 and IPv6)',
    attempt_time DATETIME NOT NULL COMMENT 'Timestamp of the login attempt',
    success BOOLEAN NOT NULL COMMENT 'Whether the login was successful',
    failure_reason VARCHAR(255) COMMENT 'Reason for failed login (e.g., Invalid credentials, Account locked)',
    
    -- Indexes for efficient querying
    INDEX idx_username_time (username, attempt_time),
    INDEX idx_ip_address_time (ip_address, attempt_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks login attempts for security monitoring and account lockout';







-- Verify table creation
SHOW CREATE TABLE login_attempts;

-- Display table info
DESCRIBE login_attempts;

SELECT 'Login attempts table created successfully!' AS Status;
