package com.wbill.home.service.Security;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.wbill.home.model.UserAccount;
import com.wbill.home.model.UserRole;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Integer id;
    private String username;
    private String name;
    private String email;

    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Integer id, String username, String name, String email, String password,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(UserAccount ua) {
        // Primary: build authority directly from roleCode without adding prefixes or changing case
        String authority = "USER";
        UserRole ur = ua.getUserRole();
        if (ur != null) {
            String roleCode = ur.getRoleCode() == null ? null : ur.getRoleCode().trim();
            String roleName = ur.getRoleName() == null ? null : ur.getRoleName().trim();

            if (roleCode != null && !roleCode.isEmpty()) {
                authority = roleCode;
            } else if (roleName != null && !roleName.isEmpty()) {
                // Fallback: still support roleName if code is absent, used as-is
                authority = roleName;
            }
        }

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(authority));

        String fullName = String.join(" ",
            (ua.getFirstName() == null ? "" : ua.getFirstName().trim()),
            (ua.getMidleName() == null ? "" : ua.getMidleName().trim()),
            (ua.getLastName() == null ? "" : ua.getLastName().trim())
        ).replaceAll("\\s+", " ").trim();

        return new UserDetailsImpl(
                ua.getId(),
                ua.getUserName(),
                fullName,
                null, // email removed/skipped per requirement
                ua.getPassword(),
                authorities);
    }

    /**
     * Build UserDetailsImpl merging the primary role from user_account.role_id
     * with additional roles from user_account_role junction table.
     */
    public static UserDetailsImpl buildWithExtraRoles(UserAccount ua, List<String> extraRoleCodes) {
        // Collect all role codes — primary first, then extras
        Set<String> allRoleCodes = new LinkedHashSet<>();

        // Primary role from user_account.role_id
        UserRole ur = ua.getUserRole();
        if (ur != null) {
            String roleCode = ur.getRoleCode() == null ? null : ur.getRoleCode().trim();
            if (roleCode != null && !roleCode.isEmpty()) {
                allRoleCodes.add(roleCode);
            }
        }

        // Additional roles from user_account_role junction table
        if (extraRoleCodes != null) {
            extraRoleCodes.stream()
                .filter(rc -> rc != null && !rc.trim().isEmpty())
                .forEach(rc -> allRoleCodes.add(rc.trim()));
        }

        // Fallback if no roles at all
        if (allRoleCodes.isEmpty()) {
            allRoleCodes.add("USER");
        }

        List<GrantedAuthority> authorities = allRoleCodes.stream()
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());

        String fullName = String.join(" ",
            (ua.getFirstName() == null ? "" : ua.getFirstName().trim()),
            (ua.getMidleName() == null ? "" : ua.getMidleName().trim()),
            (ua.getLastName() == null ? "" : ua.getLastName().trim())
        ).replaceAll("\\s+", " ").trim();

        return new UserDetailsImpl(
                ua.getId(),
                ua.getUserName(),
                fullName,
                null,
                ua.getPassword(),
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public Integer getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}
