package com.wbill.home.repository;

import com.wbill.home.model.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {

    /**
     * Count failed login attempts for a username within a time window
     */
    @Query("SELECT COUNT(la) FROM LoginAttempt la WHERE la.username = :username " +
            "AND la.success = false AND la.attemptTime >= :since")
    long countFailedAttemptsSince(@Param("username") String username,
            @Param("since") LocalDateTime since);

    /**
     * Count failed login attempts from an IP address within a time window
     */
    @Query("SELECT COUNT(la) FROM LoginAttempt la WHERE la.ipAddress = :ipAddress " +
            "AND la.success = false AND la.attemptTime >= :since")
    long countFailedAttemptsByIpSince(@Param("ipAddress") String ipAddress,
            @Param("since") LocalDateTime since);

    /**
     * Find all login attempts for a username
     */
    List<LoginAttempt> findByUsernameOrderByAttemptTimeDesc(String username);

    /**
     * Find recent login attempts for a username
     */
    @Query("SELECT la FROM LoginAttempt la WHERE la.username = :username " +
            "AND la.attemptTime >= :since ORDER BY la.attemptTime DESC")
    List<LoginAttempt> findRecentAttemptsByUsername(@Param("username") String username,
            @Param("since") LocalDateTime since);

    /**
     * Delete old login attempts (cleanup)
     */
    @Modifying
    @Query("DELETE FROM LoginAttempt la WHERE la.attemptTime < :before")
    void deleteOldAttempts(@Param("before") LocalDateTime before);

    /**
     * Delete all failed attempts for a username (called after successful login)
     */
    @Modifying
    @Query("DELETE FROM LoginAttempt la WHERE la.username = :username AND la.success = false")
    void deleteFailedAttemptsByUsername(@Param("username") String username);
}
