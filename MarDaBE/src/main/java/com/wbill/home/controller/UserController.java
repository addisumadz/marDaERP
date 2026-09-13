package com.wbill.home.controller;

import com.wbill.home.model.ERole;
import com.wbill.home.model.Role;
import com.wbill.home.model.User;
import com.wbill.home.payload.request.ChangePasswordRequest;
import com.wbill.home.payload.request.SignupRequest;
import com.wbill.home.repository.RoleRepository;
import com.wbill.home.repository.UserRepository;
import com.wbill.home.service.UserService;
import com.wbill.home.service.jwt.JwtUtils;
import com.wbill.home.springjwt.payload.response.MessageResponse;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
 
@RestController
@RequestMapping("/api/card_managenment")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    UserRepository userRepository;
    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;
    // Get all users by status 
    @GetMapping("/userByStatus/{status}")
    public ResponseEntity<List<User>> getAllUsersByStatus(@PathVariable String status) {
        List<User> users = userService.getAllUser(status);
        return ResponseEntity.ok(users);
    }

    // Get user by ID
    @GetMapping("/user/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get all users
 
    // Create a new user
 // Create a new user
    @PostMapping("/user")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                .badRequest()
                .body(new MessageResponse("Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                .badRequest()
                .body(new MessageResponse("Email is already in use!"));
        }

        // Create new user's account
        User user = new User(
            signUpRequest.getUsername(),
            signUpRequest.getName(),
            signUpRequest.getEmail(),
            encoder.encode(signUpRequest.getPassword()),
            signUpRequest.getStatus()
        );

        Set<String> strRoles = signUpRequest.getRoles(); // Modified to handle a list of roles
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            // Default to USER role if no roles are provided
            Optional<Role> userRole = roleRepository.findByName(ERole.ROLE_USER);
            if (userRole.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Role USER is not found."));
            }
            roles.add(userRole.get());
        } else {
            for (String role : strRoles) {
                Optional<Role> roleEntity;
                switch (role) {
                    case "ROLE_ADMIN":
                        roleEntity = roleRepository.findByName(ERole.ROLE_ADMIN);
                        break;
                    case "ROLE_MANAGER":
                        roleEntity = roleRepository.findByName(ERole.ROLE_MANAGER);
                        break;
//                    case "ROLE_DOCUMENT_APPROVAL":
//                        roleEntity = roleRepository.findByName(ERole.ROLE_DOCUMENT_APPROVAL);
//                        break;
                   
                    default:
                        roleEntity = roleRepository.findByName(ERole.ROLE_USER);
                }

                if (roleEntity.isPresent()) {
                    roles.add(roleEntity.get());
                } else {
                    return ResponseEntity.badRequest().body(new MessageResponse("Role " + role + " is not found."));
                }
            }
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }


 // Update an existing user
    @PutMapping("/user/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @Valid @RequestBody SignupRequest signupRequest) {
        // Check if user exists
        Optional<User> existingUserOpt = userRepository.findById(id);
        if (!existingUserOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User existingUser = existingUserOpt.get();

        // Update user details
        existingUser.setUsername(signupRequest.getUsername());
        existingUser.setName(signupRequest.getName());
        existingUser.setEmail(signupRequest.getEmail());
        existingUser.setStatus(signupRequest.getStatus());

        // Do not update the password
        // existingUser.setPassword(signupRequest.getPassword()); // This line is removed

        // Handle roles update
        Set<Role> roles = new HashSet<>();
        Set<String> strRoles = signupRequest.getRoles(); // Assume `roles` is now a Set<String>

        if (strRoles == null || strRoles.isEmpty()) {
            // Default to USER role if no role is provided
            Optional<Role> userRole = roleRepository.findByName(ERole.ROLE_USER);
            if (!userRole.isPresent()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Role USER is not found."));
            }
            roles.add(userRole.get());
        } else {
            for (String strRole : strRoles) {
                Optional<Role> roleEntityOpt;
                
                System.out.println("Role");
                System.out.println(strRole);
                switch (strRole) {
                    case "ROLE_ADMIN":
                        roleEntityOpt = roleRepository.findByName(ERole.ROLE_ADMIN);
                        break;
//                    case "ROLE_DOCUMENT_RECIVER":
//                        roleEntityOpt = roleRepository.findByName(ERole.ROLE_DOCUMENT_RECIVER);
//                        break;
//                    case "ROLE_DOCUMENT_APPROVAL":
//                        roleEntityOpt = roleRepository.findByName(ERole.ROLE_DOCUMENT_APPROVAL);
//                        break;
//                   
                    // Removed ROLE_MODERATOR
                    default:
                        roleEntityOpt = roleRepository.findByName(ERole.ROLE_USER);
                }

                if (roleEntityOpt.isPresent()) {
                    roles.add(roleEntityOpt.get());
                } else {
                    // Return a bad request if any role is not found
                    return ResponseEntity.badRequest().body(new MessageResponse("Role " + strRole + " is not found."));
                }
            }
        }

        existingUser.setRoles(roles);

        // Save updated user
        userRepository.save(existingUser);

        return ResponseEntity.ok(existingUser);
    }


    @PutMapping("/changePassword/{id}/{newPassword}")
    public ResponseEntity<?> changePassword(@PathVariable Integer id,
    		@PathVariable String newPassword) {
       

        // Call the updated service method
        if (!userService.changePassword(id, newPassword)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse("Failed to change password. Try again later."));
        }

        return ResponseEntity.ok(new MessageResponse("Password changed successfully!"));
    }
    // Deactivate a user by ID
    @PatchMapping("/user/{id}/deactivate")
    public ResponseEntity<Void> deactivateUser(@PathVariable Integer id) {
        Optional<User> user = userService.getUserById(id);
        if (user.isPresent()) {
            User userToUpdate = user.get();
            userToUpdate.setStatus("deactivated"); // Set status to 'deactivated'
            userService.updateUser(id, userToUpdate);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Assign roles to a user
    @PostMapping("/user/{id}/roles")
    public ResponseEntity<User> assignRolesToUser(@PathVariable Integer id, @RequestBody Set<Role> roles) {
        Optional<User> updatedUser = userService.assignRoles(id, roles);
        return updatedUser.map(ResponseEntity::ok)
                          .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Check if username already exists
    @GetMapping("/user/checkUsername/{username}")
    public ResponseEntity<Boolean> checkUsername(@PathVariable String username) {
        try {
            boolean exists = userService.checkUsername(username);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @GetMapping("/usersByRoleAndStatus")
    public ResponseEntity<List<User>> getUsersByRoleAndStatus(
            @RequestParam String roleName,
            @RequestParam String status) {
        List<User> users = userService.getUsersByRoleAndStatus(roleName, status);
        return ResponseEntity.ok(users);
    }
}

