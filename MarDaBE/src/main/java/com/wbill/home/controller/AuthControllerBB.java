// package com.school.home.controller;
//
// import java.util.HashSet;
// import java.util.List;
// import java.util.stream.Collectors;
//
// import jakarta.validation.Valid;
//
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.authentication.AuthenticationManager;
// import
// org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.web.bind.annotation.CrossOrigin;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;
//
// import com.school.home.payload.request.LoginRequest;
// import com.school.home.repository.RoleRepository;
// import com.school.home.repository.UserRepository;
// import com.school.home.service.Security.UserDetailsImpl;
// import com.school.home.service.jwt.JwtUtils;
// import com.school.home.springjwt.payload.response.JwtResponse;
//
// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.context.SecurityContextHolder;
//// @CrossOrigin(origins = "http://192.168.100.106:9000")
// @CrossOrigin(origins = "*", maxAge = 3600)
//
//// @CrossOrigin(origins = "http://192.168.8.104:9000")
// @RestController
// @RequestMapping("/api/auth")
// public class AuthController {
// @Autowired
// AuthenticationManager authenticationManager;
//
// @Autowired
// UserRepository userRepository;
//
// @Autowired
// RoleRepository roleRepository;
//
// @Autowired
// PasswordEncoder encoder;
//
// @Autowired
// JwtUtils jwtUtils;
//
// @PostMapping("/signin")
// public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest
// loginRequest) {
//
// Authentication authentication = authenticationManager.authenticate(
// new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
// loginRequest.getPassword()));
//
// SecurityContextHolder.getContext().setAuthentication(authentication);
// String jwt = jwtUtils.generateJwtToken(authentication);
// UserDetailsImpl userDetails = (UserDetailsImpl)
// authentication.getPrincipal();
// List<String> roles = userDetails.getAuthorities().stream()
// .map(item -> item.getAuthority())
// .collect(Collectors.toList());
//
// return ResponseEntity.ok(new JwtResponse(jwt,
// userDetails.getId(),
// userDetails.getUsername(),
// userDetails.getName(),
// userDetails.getEmail(),
// roles));
// }
//
//
// }
//
