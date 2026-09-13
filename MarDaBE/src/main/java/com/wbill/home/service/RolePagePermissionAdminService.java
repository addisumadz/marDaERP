package com.wbill.home.service;

import com.wbill.home.dto.RolePagePermissionDTO;
import com.wbill.home.dto.RolePagePermissionUpdateDTO;
import com.wbill.home.model.UserRecord;
import com.wbill.home.model.UserRole;
import com.wbill.home.repository.UserRecordRepository;
import com.wbill.home.repository.UserRoleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RolePagePermissionAdminService {

    private static final String ACTIVE = "active";

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private UserRecordRepository userRecordRepository;

    public List<RolePagePermissionDTO> getPermissionsForPage(String pageCode) {
        List<UserRole> roles = userRoleRepository.findAllActive();

        return roles.stream()
                .map(role -> {
                    Optional<UserRecord> recordOpt = userRecordRepository
                            .findFirstByUserRole_RoleCodeIgnoreCaseAndPageCodeIgnoreCaseAndDeletedIgnoreCase(
                                    role.getRoleCode(),
                                    pageCode,
                                    ACTIVE
                            );
                    UserRecord record = recordOpt.orElse(null);

                    RolePagePermissionDTO dto = new RolePagePermissionDTO();
                    dto.setRoleId(role.getId());
                    dto.setRoleCode(role.getRoleCode());
                    dto.setRoleName(role.getRoleName());
                    dto.setPageCode(pageCode);
                    dto.setPageName(record != null ? record.getPageName() : pageCode);

                    if (record != null) {
                        dto.setUserRecordId(record.getId());
                        dto.setPermissionCreate(record.isPermissionCreate());
                        dto.setPermissionEdit(record.isPermissionEdit());
                        dto.setPermissionDelete(record.isPermissionDelete());
                        dto.setPermissionApprove(record.isPermissionApprove());
                        dto.setPermissionNeedsApproval(record.isPermissionNeedsApproval());
                        dto.setPermissionKdmekfya(record.isPermissionKdmekfya());
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<RolePagePermissionDTO> getPermissionsForRole(Integer roleId) {
        UserRole role = userRoleRepository.findById(roleId)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with id: " + roleId));

        List<UserRecord> records = userRecordRepository.findByUserRole_IdAndDeletedIgnoreCase(roleId, ACTIVE);

        return records.stream()
                .map(record -> {
                    RolePagePermissionDTO dto = new RolePagePermissionDTO();
                    dto.setUserRecordId(record.getId());
                    dto.setRoleId(role.getId());
                    dto.setRoleCode(role.getRoleCode());
                    dto.setRoleName(role.getRoleName());
                    dto.setPageCode(record.getPageCode());
                    dto.setPageName(record.getPageName());
                    dto.setPermissionCreate(record.isPermissionCreate());
                    dto.setPermissionEdit(record.isPermissionEdit());
                    dto.setPermissionDelete(record.isPermissionDelete());
                    dto.setPermissionApprove(record.isPermissionApprove());
                    dto.setPermissionNeedsApproval(record.isPermissionNeedsApproval());
                    dto.setPermissionKdmekfya(record.isPermissionKdmekfya());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public RolePagePermissionDTO upsertPermissionsForRoleAndPage(String pageCode, Integer roleId, RolePagePermissionUpdateDTO updateDTO) {
        UserRole role = userRoleRepository.findById(roleId)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with id: " + roleId));

        Optional<UserRecord> recordOpt = userRecordRepository
                .findFirstByUserRole_RoleCodeIgnoreCaseAndPageCodeIgnoreCaseAndDeletedIgnoreCase(
                        role.getRoleCode(),
                        pageCode,
                        ACTIVE
                );

        UserRecord record = recordOpt.orElseGet(UserRecord::new);
        record.setUserRole(role);
        record.setPageCode(pageCode);

        String pageName = updateDTO.getPageName();
        if (pageName == null || pageName.trim().isEmpty()) {
            pageName = record.getPageName();
            if (pageName == null || pageName.trim().isEmpty()) {
                pageName = pageCode;
            }
        }
        record.setPageName(pageName);

        record.setPermissionCreate(updateDTO.isPermissionCreate());
        record.setPermissionEdit(updateDTO.isPermissionEdit());
        record.setPermissionDelete(updateDTO.isPermissionDelete());
        record.setPermissionApprove(updateDTO.isPermissionApprove());
        record.setPermissionNeedsApproval(updateDTO.isPermissionNeedsApproval());
        record.setPermissionKdmekfya(updateDTO.isPermissionKdmekfya());
        record.setDeleted(ACTIVE);

        UserRecord saved = userRecordRepository.save(record);

        RolePagePermissionDTO dto = new RolePagePermissionDTO();
        dto.setUserRecordId(saved.getId());
        dto.setRoleId(role.getId());
        dto.setRoleCode(role.getRoleCode());
        dto.setRoleName(role.getRoleName());
        dto.setPageCode(saved.getPageCode());
        dto.setPageName(saved.getPageName());
        dto.setPermissionCreate(saved.isPermissionCreate());
        dto.setPermissionEdit(saved.isPermissionEdit());
        dto.setPermissionDelete(saved.isPermissionDelete());
        dto.setPermissionApprove(saved.isPermissionApprove());
        dto.setPermissionNeedsApproval(saved.isPermissionNeedsApproval());
        dto.setPermissionKdmekfya(saved.isPermissionKdmekfya());

        return dto;
    }
}
