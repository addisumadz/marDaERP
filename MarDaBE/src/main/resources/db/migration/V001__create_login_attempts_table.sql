-- Login attempts tracking table for security
CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    attempt_time DATETIME NOT NULL,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    INDEX idx_username_time (username, attempt_time),
    INDEX idx_ip_address_time (ip_address, attempt_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
