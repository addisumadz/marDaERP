package com.wbill.home.service;

import com.wbill.home.model.ERole;
import com.wbill.home.model.Role;
import com.wbill.home.model.User;
import com.wbill.home.model.UserAccount;
import com.wbill.home.repository.RoleRepository;
import com.wbill.home.repository.UserAccountRepository;
import com.wbill.home.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    UserRepository userRepository;
    @Autowired
    UserAccountRepository userAccountRepository;
    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    // Get all users based on their status (e.g., deleted, active)
    public List<User> getAllUser(String status) {
        List<User> allUsers = new ArrayList<>();
        userRepository.findByStatus(status).forEach(allUsers::add);
        return allUsers;
    }

    // Create a new user
    public User createUser(User user) {
        return userRepository.save(user);
    }

    public boolean checkUsername(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    // Get a user by ID
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Update an existing user
    public User updateUser(Integer id, User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(updatedUser.getUsername());
            user.setName(updatedUser.getName());
            user.setEmail(updatedUser.getEmail());
            user.setPassword(updatedUser.getPassword());
            user.setRegisteredDate(updatedUser.getRegisteredDate());
            user.setModifiedDate(updatedUser.getModifiedDate());
            user.setStatus(updatedUser.getStatus());
            user.setRoles(updatedUser.getRoles());
            return userRepository.save(user);
        }).orElseGet(() -> {
            updatedUser.setId(id);
            return userRepository.save(updatedUser);
        });
    }

    // Delete a user by ID
    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    // Assign roles to a user
    public Optional<User> assignRoles(Integer userId, Set<Role> roles) {
        return userRepository.findById(userId).map(user -> {
            user.setRoles(roles);
            return userRepository.save(user);
        });
    }

    public boolean changePassword(Integer userId, String newPassword) {
        // Find the user by ID
        Optional<User> userOptional = userRepository.findById(userId);

        // Check if user exists
        if (!userOptional.isPresent()) {
            throw new UsernameNotFoundException("User not found with id: " + userId);
        }

        User user = userOptional.get();

        // Update the password
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user); // Save the user with the new password

        return true; // Password changed successfully
    }

    public List<User> getUsersByRoleAndStatus(String roleName, String status) {
        ERole role;
        try {
            role = ERole.valueOf(roleName); // Convert String to ERole enum
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role name: " + roleName);
        }
        return userRepository.findByRoles_NameAndStatus(role, status);
    }

    /**
     * Authenticate user for mobile app (supports both BCrypt and legacy PBKDF2)
     * 
     * @param username    Username to authenticate
     * @param rawPassword Plain text password from mobile app
     * @return Authentication result: "success", "perror" (wrong password), or
     *         "error" (user not found)
     */
    public String authenticateMobileUser(String username, String rawPassword) {
        try {
            // Use UserAccountRepository instead of UserRepository because legacy users
            // (meter readers)
            // are stored in 'user_account' table, not 'users' table.
            Optional<UserAccount> userOpt = userAccountRepository.findByUserNameAndStatusAndDeleted(username, "active",
                    "active");

            if (userOpt.isEmpty()) {
                logger.warn("Mobile auth failed - User not found: {}", username);
                return "error";
            }

            UserAccount user = userOpt.get();

            String storedPassword = user.getPassword();

            // Note: UserAccount does not have a status check here because it's already
            // checked in the repository query
            // ("active", "active" for status and deleted fields)

            // Try BCrypt first (new format)
            if (storedPassword.startsWith("$2")) {
                if (encoder.matches(rawPassword, storedPassword)) {
                    logger.info("Mobile auth SUCCESS for user: {} (BCrypt)", username);
                    return "success";
                } else {
                    logger.warn("Mobile auth FAILED for user: {} - Wrong password (BCrypt)", username);
                    return "perror";
                }
            }

            // Try legacy PBKDF2 format (iterations:salt:hash)
            if (storedPassword.contains(":")) {
                if (validateLegacyPassword(rawPassword, storedPassword)) {
                    logger.info("Mobile auth SUCCESS for user: {} (PBKDF2)", username);
                    return "success";
                } else {
                    logger.warn("Mobile auth FAILED for user: {} - Wrong password (PBKDF2)", username);
                    return "perror";
                }
            }

            // Fall back to plain text comparison (very old legacy)
            if (storedPassword.equals(rawPassword)) {
                logger.warn("Mobile auth SUCCESS for user: {} (PLAIN TEXT - INSECURE!)", username);
                return "success";
            }

            logger.warn("Mobile auth FAILED for user: {} - Wrong password (plain text)", username);
            return "perror";

        } catch (Exception ex) {
            logger.error("Mobile auth ERROR for user: {}", username, ex);
            return "error";
        }
    }

    /**
     * Validate password using legacy PBKDF2 format
     */
    private boolean validateLegacyPassword(String rawPassword, String storedHash) {
        try {
            String[] parts = storedHash.split(":");
            if (parts.length != 3) {
                return false;
            }

            int iterations = Integer.parseInt(parts[0]);
            byte[] salt = fromHex(parts[1]);
            byte[] hash = fromHex(parts[2]);

            byte[] testHash = pbkdf2(rawPassword.toCharArray(), salt, iterations, hash.length);
            return slowEquals(hash, testHash);
        } catch (Exception ex) {
            logger.error("Failed to validate legacy PBKDF2 password", ex);
            return false;
        }
    }

    private byte[] pbkdf2(char[] password, byte[] salt, int iterations, int bytes)
            throws Exception {
        javax.crypto.spec.PBEKeySpec spec = new javax.crypto.spec.PBEKeySpec(password, salt, iterations, bytes * 8);
        javax.crypto.SecretKeyFactory skf = javax.crypto.SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
        return skf.generateSecret(spec).getEncoded();
    }

    private byte[] fromHex(String hex) {
        byte[] binary = new byte[hex.length() / 2];
        for (int i = 0; i < binary.length; i++) {
            binary[i] = (byte) Integer.parseInt(hex.substring(2 * i, 2 * i + 2), 16);
        }
        return binary;
    }

    private boolean slowEquals(byte[] a, byte[] b) {
        int diff = a.length ^ b.length;
        for (int i = 0; i < a.length && i < b.length; i++) {
            diff |= a[i] ^ b[i];
        }
        return diff == 0;
    }
}