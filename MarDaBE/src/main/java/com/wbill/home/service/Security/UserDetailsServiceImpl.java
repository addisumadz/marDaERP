package com.wbill.home.service.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.wbill.home.model.UserAccount;
import com.wbill.home.repository.UserAccountRepository;
import com.wbill.home.repository.UserAccountRoleRepository;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
  private static final Logger log = LoggerFactory.getLogger(UserDetailsServiceImpl.class);
  @Autowired
  UserAccountRepository userAccountRepository;

  @Autowired
  UserAccountRoleRepository userAccountRoleRepository;

  @Override
  @Transactional
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    // log.info("[AUTH] Attempting authentication for username={}", username);
    UserAccount user = userAccountRepository
        .findByUserNameAndStatusAndDeleted(username, "active", "active")
        .orElseThrow(() -> new UsernameNotFoundException("UserAccount Not Found or inactive with username: " + username));

    // Get extra roles from user_account_role junction table
    List<String> extraRoles = userAccountRoleRepository.findRoleCodesByUsername(username);

    String roleCode = user.getUserRole() != null ? user.getUserRole().getRoleCode() : null;
    log.info("[AUTH] Found active UserAccount id={}, username={}, primaryRole={}, extraRoles={}",
            user.getId(), user.getUserName(), roleCode, extraRoles);

    // Build with merged roles (primary + junction table)
    return UserDetailsImpl.buildWithExtraRoles(user, extraRoles);
  }

}

