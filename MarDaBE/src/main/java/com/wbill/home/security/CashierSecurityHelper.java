package com.wbill.home.security;

import com.wbill.home.repository.UserRecordRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Evaluates whether the currently authenticated user is authorized to perform cashier payment operations.
 * Supports:
 *  1. Built-in roles (case-insensitive): CASHIER, BILLZGJT, SYSTEMADMIN, ADMIN
 *  2. Dynamic role permissions configured via Role Assignment (Menu Access) where pageCode = 'cashier'
 */
@Component("cashierSecurityHelper")
public class CashierSecurityHelper {

    private final UserRecordRepository userRecordRepository;

    public CashierSecurityHelper(UserRecordRepository userRecordRepository) {
        this.userRecordRepository = userRecordRepository;
    }

    public boolean canRecordPayment() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            return false;
        }

        List<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        // 1. Direct standard role check (case-insensitive, strips optional ROLE_ prefix)
        for (String role : roles) {
            if (role == null) continue;
            String norm = role.trim().toUpperCase().replace("ROLE_", "");
            if ("CASHIER".equals(norm) || "BILLZGJT".equals(norm) || "SYSTEMADMIN".equals(norm) || "ADMIN".equals(norm)) {
                return true;
            }
        }

        // 2. Dynamic permission check: check if any of the user's roles have been granted the 'cashier' page
        try {
            if (!roles.isEmpty()) {
                List<String> permittedPages = userRecordRepository.findPageCodesByRoleCodes(roles);
                if (permittedPages != null) {
                    for (String page : permittedPages) {
                        if ("cashier".equalsIgnoreCase(page)) {
                            return true;
                        }
                    }
                }
            }
        } catch (Exception ignored) {
        }

        return false;
    }
}
