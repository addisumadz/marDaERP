package com.wbill.home.controller;

import com.wbill.home.dto.RolePagePermissionDTO;
import com.wbill.home.dto.RolePagePermissionUpdateDTO;
import com.wbill.home.service.RolePagePermissionAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/card_managenment/page-permissions")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasAuthority('systemadmin')")
public class PagePermissionAdminController {

    @Autowired
    private RolePagePermissionAdminService rolePagePermissionAdminService;

    @GetMapping("/{pageCode}")
    public ResponseEntity<List<RolePagePermissionDTO>> getPermissionsForPage(@PathVariable String pageCode) {
        try {
            List<RolePagePermissionDTO> list = rolePagePermissionAdminService.getPermissionsForPage(pageCode);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/roles/{roleId}")
    public ResponseEntity<List<RolePagePermissionDTO>> getPermissionsForRole(@PathVariable Integer roleId) {
        try {
            List<RolePagePermissionDTO> list = rolePagePermissionAdminService.getPermissionsForRole(roleId);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{pageCode}/roles/{roleId}")
    public ResponseEntity<RolePagePermissionDTO> updatePermissionsForRole(
            @PathVariable String pageCode,
            @PathVariable Integer roleId,
            @RequestBody RolePagePermissionUpdateDTO updateDTO) {
        try {
            RolePagePermissionDTO dto = rolePagePermissionAdminService
                    .upsertPermissionsForRoleAndPage(pageCode, roleId, updateDTO);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
