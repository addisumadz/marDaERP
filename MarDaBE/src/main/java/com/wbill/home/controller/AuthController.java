package com.wbill.home.controller;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wbill.home.payload.request.LoginRequest;
import com.wbill.home.repository.RoleRepository;
import com.wbill.home.repository.UserRepository;
import com.wbill.home.repository.UserRecordRepository;
import com.wbill.home.service.Security.UserDetailsImpl;
import com.wbill.home.service.jwt.JwtUtils;
import com.wbill.home.springjwt.payload.response.JwtResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
//@CrossOrigin(origins = "http://192.168.100.106:9000")

// @CrossOrigin(origins = "http://192.168.8.104:9000")
@RestController
@RequestMapping("/api/auth")
// @RequestMapping("/hims/api/card_managenment") // for Public Host

public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    com.wbill.home.service.LoginAttemptService loginAttemptService;

    @Autowired
    UserRecordRepository userRecordRepository;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest,
            jakarta.servlet.http.HttpServletRequest request) {
        String username = loginRequest.getUsername();
        String ipAddress = getClientIp(request);

        try {
            // Check if account is locked
            if (loginAttemptService.isAccountLocked(username)) {
                long remainingMinutes = loginAttemptService.getRemainingLockoutTime(username);
                String errorMsg = String.format(
                        "Account temporarily locked due to multiple failed login attempts. Please try again in %d minutes.",
                        remainingMinutes);
                log.warn("[AUTH] Login attempt for locked account: username={}, IP={}", username, ipAddress);
                return ResponseEntity.status(423).body(new ErrorResponse(errorMsg));
            }

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            // Record successful login
            loginAttemptService.recordSuccessfulLogin(username, ipAddress);

            log.info("[AUTH] Auth success for username={}, id={}, IP={}, issuedJWTLength={}, roles={}",
                    userDetails.getUsername(), userDetails.getId(), ipAddress,
                    (jwt != null ? jwt.length() : 0), roles);

            // Dynamic menu mapping: get permitted page codes from user_records
            List<String> permittedPages = java.util.Collections.emptyList();
            try {
                if (!roles.isEmpty()) {
                    permittedPages = userRecordRepository.findPageCodesByRoleCodes(roles);
                }
            } catch (Exception ex) {
                log.warn("[AUTH] Failed to load permittedPages for user={}: {}", userDetails.getUsername(), ex.getMessage());
            }

            return ResponseEntity.ok(new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getName(),
                    roles,
                    permittedPages));

        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            // Record failed login attempt
            loginAttemptService.recordFailedLogin(username, ipAddress, "Invalid credentials");
            log.warn("[AUTH] Failed login for username={}, IP={}: Invalid credentials", username, ipAddress);
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid username or password"));

        } catch (org.springframework.security.authentication.LockedException e) {
            loginAttemptService.recordFailedLogin(username, ipAddress, "Account locked");
            log.warn("[AUTH] Failed login for username={}, IP={}: Account locked", username, ipAddress);
            return ResponseEntity.status(423).body(new ErrorResponse("Account is locked"));

        } catch (org.springframework.security.authentication.DisabledException e) {
            loginAttemptService.recordFailedLogin(username, ipAddress, "Account disabled");
            log.warn("[AUTH] Failed login for username={}, IP={}: Account disabled", username, ipAddress);
            return ResponseEntity.status(403).body(new ErrorResponse("Account is disabled"));

        } catch (Exception e) {
            loginAttemptService.recordFailedLogin(username, ipAddress, e.getClass().getSimpleName());
            log.error("[AUTH] Authentication error for username={}, IP={}: {}", username, ipAddress, e.getMessage());
            return ResponseEntity.status(500).body(new ErrorResponse("Authentication failed"));
        }
    }

    /**
     * Extract client IP address from request, handles proxy headers
     */
    private String getClientIp(jakarta.servlet.http.HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // If multiple IPs in X-Forwarded-For, take the first one
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null ? ip : "unknown";
    }

    /**
     * Simple error response class
     */
    private static class ErrorResponse {
        private String message;
        private long timestamp;

        public ErrorResponse(String message) {
            this.message = message;
            this.timestamp = System.currentTimeMillis();
        }

        public String getMessage() {
            return message;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }

}
