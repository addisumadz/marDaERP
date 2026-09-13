package com.wbill.home.service;

import com.wbill.home.model.UserAccount;
import com.wbill.home.model.UserRecord;
import com.wbill.home.repository.UserAccountRepository;
import com.wbill.home.repository.UserRecordRepository;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class PagePermissionService {

    private static final String ACTIVE = "active";

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private UserRecordRepository userRecordRepository;

    public PagePermissions getPermissionsForCurrentUser(String pageCode) {
        UserRecord record = findRecordForCurrentUser(pageCode);
        PagePermissions perms = new PagePermissions();
        if (record != null) {
            perms.setCanCreate(record.isPermissionCreate());
            perms.setCanEdit(record.isPermissionEdit());
            perms.setCanDelete(record.isPermissionDelete());
            perms.setCanApprove(record.isPermissionApprove());
            perms.setNeedsApproval(record.isPermissionNeedsApproval());
            perms.setKdmekfya(record.isPermissionKdmekfya());
        }
        return perms;
    }

    public boolean canCreate(String pageCode) {
        return getPermissionsForCurrentUser(pageCode).isCanCreate();
    }

    public boolean canEdit(String pageCode) {
        return getPermissionsForCurrentUser(pageCode).isCanEdit();
    }

    public boolean canDelete(String pageCode) {
        return getPermissionsForCurrentUser(pageCode).isCanDelete();
    }

    public boolean canApprove(String pageCode) {
        return getPermissionsForCurrentUser(pageCode).isCanApprove();
    }

    public boolean needsApproval(String pageCode) {
        return getPermissionsForCurrentUser(pageCode).isNeedsApproval();
    }

    public boolean hasKdmekfya(String pageCode) {
        return getPermissionsForCurrentUser(pageCode).isKdmekfya();
    }

    public void assertCanCreate(String pageCode) {
        if (!canCreate(pageCode)) {
            throw new AccessDeniedException("You do not have permission to create on page " + pageCode);
        }
    }

    public void assertCanEdit(String pageCode) {
        if (!canEdit(pageCode)) {
            throw new AccessDeniedException("You do not have permission to edit on page " + pageCode);
        }
    }

    public void assertCanDelete(String pageCode) {
        if (!canDelete(pageCode)) {
            throw new AccessDeniedException("You do not have permission to delete on page " + pageCode);
        }
    }

    public void assertCanApprove(String pageCode) {
        if (!canApprove(pageCode)) {
            throw new AccessDeniedException("You do not have permission to approve on page " + pageCode);
        }
    }

    private UserRecord findRecordForCurrentUser(String pageCode) {
        UserAccount user = getCurrentUser();
        if (user == null || user.getUserRole() == null || user.getUserRole().getRoleCode() == null) {
            return null;
        }

        String roleCode = user.getUserRole().getRoleCode();
        if (roleCode == null) {
            return null;
        }
        roleCode = roleCode.trim();
        if (roleCode.isEmpty()) {
            return null;
        }

        Optional<UserRecord> recordOpt = userRecordRepository
                .findFirstByUserRole_RoleCodeIgnoreCaseAndPageCodeIgnoreCaseAndDeletedIgnoreCase(
                        roleCode,
                        pageCode,
                        ACTIVE
                );

        return recordOpt.orElse(null);
    }

    private UserAccount getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("No authenticated user found");
        }

        String username;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = authentication.getName();
        }

        return userAccountRepository.findByUserName(username)
                .orElseThrow(() -> new AccessDeniedException("Logged in user not found in database: " + username));
    }

    public static class PagePermissions {
        private boolean canCreate;
        private boolean canEdit;
        private boolean canDelete;
        private boolean canApprove;
        private boolean needsApproval;
        private boolean kdmekfya;

        public boolean isCanCreate() {
            return canCreate;
        }

        public void setCanCreate(boolean canCreate) {
            this.canCreate = canCreate;
        }

        public boolean isCanEdit() {
            return canEdit;
        }

        public void setCanEdit(boolean canEdit) {
            this.canEdit = canEdit;
        }

        public boolean isCanDelete() {
            return canDelete;
        }

        public void setCanDelete(boolean canDelete) {
            this.canDelete = canDelete;
        }

        public boolean isCanApprove() {
            return canApprove;
        }

        public void setCanApprove(boolean canApprove) {
            this.canApprove = canApprove;
        }

        public boolean isNeedsApproval() {
            return needsApproval;
        }

        public void setNeedsApproval(boolean needsApproval) {
            this.needsApproval = needsApproval;
        }

        public boolean isKdmekfya() {
            return kdmekfya;
        }

        public void setKdmekfya(boolean kdmekfya) {
            this.kdmekfya = kdmekfya;
        }
    }
}
