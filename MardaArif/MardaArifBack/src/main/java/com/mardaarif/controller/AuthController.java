package com.mardaarif.controller;

import java.util.List;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.mardaarif.payload.LoginRequest;
import com.mardaarif.payload.JwtResponse;
import com.mardaarif.security.JwtUtils;
import com.mardaarif.security.UserDetailsImpl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

            log.info("[AUTH] Auth success for username={}, id={}", userDetails.getUsername(), userDetails.getId());

            return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getName(),
                roles));

        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            log.warn("[AUTH] Failed login for username={}: Invalid credentials", loginRequest.getUsername());
            return ResponseEntity.status(401).body(java.util.Map.of(
                "message", "Invalid username or password",
                "timestamp", System.currentTimeMillis()));

        } catch (Exception e) {
            log.error("[AUTH] Authentication error for username={}: {}", loginRequest.getUsername(), e.getMessage());
            return ResponseEntity.status(500).body(java.util.Map.of(
                "message", "Authentication failed",
                "timestamp", System.currentTimeMillis()));
        }
    }
}
