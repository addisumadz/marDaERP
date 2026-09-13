package com.wbill.home.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity to track login attempts for security purposes
 * Used for rate limiting and account lockout functionality
 */
@Entity
@Table(name = "login_attempts", indexes = {
        @Index(name = "idx_username_time", columnList = "username, attempt_time"),
        @Index(name = "idx_ip_address_time", columnList = "ip_address, attempt_time")
})
public class LoginAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(name = "attempt_time", nullable = false)
    private LocalDateTime attemptTime;

    @Column(name = "success", nullable = false)
    private Boolean success;

    @Column(name = "failure_reason", length = 255)
    private String failureReason;

    // Constructors
    public LoginAttempt() {
        this.attemptTime = LocalDateTime.now();
    }

    public LoginAttempt(String username, String ipAddress, Boolean success) {
        this.username = username;
        this.ipAddress = ipAddress;
        this.success = success;
        this.attemptTime = LocalDateTime.now();
    }

    public LoginAttempt(String username, String ipAddress, Boolean success, String failureReason) {
        this.username = username;
        this.ipAddress = ipAddress;
        this.success = success;
        this.failureReason = failureReason;
        this.attemptTime = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public LocalDateTime getAttemptTime() {
        return attemptTime;
    }

    public void setAttemptTime(LocalDateTime attemptTime) {
        this.attemptTime = attemptTime;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }
}
