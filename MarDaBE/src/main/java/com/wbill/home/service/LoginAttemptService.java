package com.wbill.home.service;

import com.wbill.home.model.LoginAttempt;
import com.wbill.home.repository.LoginAttemptRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service to track login attempts and implement account lockout mechanism
 */
@Service
public class LoginAttemptService {

    private static final Logger log = LoggerFactory.getLogger(LoginAttemptService.class);

    @Autowired
    private LoginAttemptRepository loginAttemptRepository;

    @Value("${app.security.max-login-attempts:5}")
    private int maxLoginAttempts;

    @Value("${app.security.lockout-duration-minutes:15}")
    private int lockoutDurationMinutes;

    /**
     * Record a successful login attempt
     */
    @Transactional
    public void recordSuccessfulLogin(String username, String ipAddress) {
        LoginAttempt attempt = new LoginAttempt(username, ipAddress, true);
        loginAttemptRepository.save(attempt);

        // Clear all failed attempts for this user after successful login
        loginAttemptRepository.deleteFailedAttemptsByUsername(username);
        log.info("[SECURITY] Successful login for username={} from IP={}", username, ipAddress);
    }

    /**
     * Record a failed login attempt
     */
    @Transactional
    public void recordFailedLogin(String username, String ipAddress, String reason) {
        LoginAttempt attempt = new LoginAttempt(username, ipAddress, false, reason);
        loginAttemptRepository.save(attempt);

        long failedAttempts = getFailedAttemptCount(username);
        log.warn("[SECURITY] Failed login attempt {}/{} for username={} from IP={}, reason={}",
                failedAttempts, maxLoginAttempts, username, ipAddress, reason);

        if (failedAttempts >= maxLoginAttempts) {
            log.error("[SECURITY] Account locked for username={} - exceeded max attempts", username);
        }
    }

    /**
     * Check if an account is currently locked due to too many failed attempts
     */
    public boolean isAccountLocked(String username) {
        LocalDateTime lockoutThreshold = LocalDateTime.now().minusMinutes(lockoutDurationMinutes);
        long failedAttempts = loginAttemptRepository.countFailedAttemptsSince(username, lockoutThreshold);

        boolean isLocked = failedAttempts >= maxLoginAttempts;
        if (isLocked) {
            log.warn("[SECURITY] Account is locked for username={}, failed attempts={}",
                    username, failedAttempts);
        }
        return isLocked;
    }

    /**
     * Get the count of failed login attempts within the lockout window
     */
    public long getFailedAttemptCount(String username) {
        LocalDateTime lockoutThreshold = LocalDateTime.now().minusMinutes(lockoutDurationMinutes);
        return loginAttemptRepository.countFailedAttemptsSince(username, lockoutThreshold);
    }

    /**
     * Get remaining time until account is unlocked (in minutes)
     */
    public long getRemainingLockoutTime(String username) {
        LocalDateTime lockoutThreshold = LocalDateTime.now().minusMinutes(lockoutDurationMinutes);
        var recentAttempts = loginAttemptRepository.findRecentAttemptsByUsername(username, lockoutThreshold);

        if (recentAttempts.isEmpty()) {
            return 0;
        }

        // Find the earliest failed attempt in the window
        LocalDateTime earliestAttempt = recentAttempts.stream()
                .filter(a -> !a.getSuccess())
                .map(LoginAttempt::getAttemptTime)
                .min(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now());

        LocalDateTime unlockTime = earliestAttempt.plusMinutes(lockoutDurationMinutes);
        long remainingMinutes = java.time.Duration.between(LocalDateTime.now(), unlockTime).toMinutes();

        return Math.max(0, remainingMinutes);
    }

    /**
     * Check if IP address has exceeded rate limit
     */
    public boolean isIpRateLimited(String ipAddress, int maxRequests, int windowMinutes) {
        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(windowMinutes);
        long attempts = loginAttemptRepository.countFailedAttemptsByIpSince(ipAddress, windowStart);

        boolean isLimited = attempts >= maxRequests;
        if (isLimited) {
            log.warn("[SECURITY] IP address {} is rate limited, attempts={}", ipAddress, attempts);
        }
        return isLimited;
    }

    /**
     * Cleanup old login attempts (runs daily at 3 AM)
     * Keeps last 30 days of data
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupOldAttempts() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        loginAttemptRepository.deleteOldAttempts(thirtyDaysAgo);
        log.info("[SECURITY] Cleaned up login attempts older than 30 days");
    }

    /**
     * Manually clear failed attempts for a user (admin function)
     */
    @Transactional
    public void clearFailedAttempts(String username) {
        loginAttemptRepository.deleteFailedAttemptsByUsername(username);
        log.info("[SECURITY] Manually cleared failed login attempts for username={}", username);
    }
}
