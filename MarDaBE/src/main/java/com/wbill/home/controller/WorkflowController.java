package com.wbill.home.controller;

import com.wbill.home.model.*;
import com.wbill.home.repository.*;
import com.wbill.home.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/card_managenment/workflows")
@CrossOrigin(origins = "*")
public class WorkflowController {

    @Autowired private WorkflowService workflowService;
    @Autowired private UserAccountRoleRepository userAccountRoleRepo;
    @Autowired private UserAccountRepository userAccountRepo;
    @Autowired private UserRoleRepository userRoleRepo;
    @Autowired private WfWorkflowInstanceRepository instanceRepo;
    @Autowired private UserRecordRepository userRecordRepo;

    // ─── Template CRUD ────────────────────────────────────

    @GetMapping("/templates")
    public ResponseEntity<?> getAllTemplates() {
        return ResponseEntity.ok(workflowService.getAllTemplates());
    }

    @GetMapping("/templates/active")
    public ResponseEntity<?> getActiveTemplates() {
        return ResponseEntity.ok(workflowService.getActiveTemplates());
    }

    @GetMapping("/templates/{id}")
    public ResponseEntity<?> getTemplate(@PathVariable int id) {
        return workflowService.getTemplateById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/templates")
    public ResponseEntity<?> createTemplate(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            WfWorkflowTemplate template = new WfWorkflowTemplate();
            template.setTemplateCode((String) body.get("templateCode"));
            template.setTemplateName((String) body.get("templateName"));
            template.setDocumentType((String) body.get("documentType"));
            template.setDescription((String) body.get("description"));
            template.setIsActive(body.get("isActive") != null ? (Boolean) body.get("isActive") : true);
            template.setCreatedBy(principal != null ? principal.getName() : "system");
            return ResponseEntity.status(HttpStatus.CREATED).body(workflowService.saveTemplate(template));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<?> updateTemplate(@PathVariable int id, @RequestBody Map<String, Object> body) {
        try {
            WfWorkflowTemplate template = workflowService.getTemplateById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));
            if (body.containsKey("templateName")) template.setTemplateName((String) body.get("templateName"));
            if (body.containsKey("description")) template.setDescription((String) body.get("description"));
            if (body.containsKey("isActive")) template.setIsActive((Boolean) body.get("isActive"));
            return ResponseEntity.ok(workflowService.saveTemplate(template));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<?> deleteTemplate(@PathVariable int id) {
        try {
            workflowService.deleteTemplate(id);
            return ResponseEntity.ok(Collections.singletonMap("message", "Template deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    // ─── Step Management ──────────────────────────────────

    @GetMapping("/templates/{templateId}/steps")
    public ResponseEntity<?> getSteps(@PathVariable int templateId) {
        return ResponseEntity.ok(workflowService.getStepsByTemplate(templateId));
    }

    @PostMapping("/templates/{templateId}/steps")
    public ResponseEntity<?> addStep(@PathVariable int templateId, @RequestBody Map<String, Object> body) {
        try {
            WfWorkflowStep step = new WfWorkflowStep();
            step.setStepOrder(Integer.parseInt(body.get("stepOrder").toString()));
            step.setStepName((String) body.get("stepName"));
            step.setStepNameAm((String) body.get("stepNameAm"));
            step.setApproverRoleCode((String) body.get("approverRoleCode"));
            step.setIsRequired(body.get("isRequired") != null ? (Boolean) body.get("isRequired") : true);
            if (body.get("minAmount") != null && !body.get("minAmount").toString().isEmpty())
                step.setMinAmount(new BigDecimal(body.get("minAmount").toString()));
            if (body.get("maxAmount") != null && !body.get("maxAmount").toString().isEmpty())
                step.setMaxAmount(new BigDecimal(body.get("maxAmount").toString()));
            if (body.get("autoApproveBelow") != null && !body.get("autoApproveBelow").toString().isEmpty())
                step.setAutoApproveBelow(new BigDecimal(body.get("autoApproveBelow").toString()));
            step.setSlaHours(body.get("slaHours") != null ? Integer.parseInt(body.get("slaHours").toString()) : 48);
            step.setCanReject(body.get("canReject") != null ? (Boolean) body.get("canReject") : true);
            return ResponseEntity.status(HttpStatus.CREATED).body(workflowService.addStep(templateId, step));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/steps/{stepId}")
    public ResponseEntity<?> updateStep(@PathVariable int stepId, @RequestBody Map<String, Object> body) {
        try {
            WfWorkflowStep step = new WfWorkflowStep();
            step.setStepOrder(Integer.parseInt(body.get("stepOrder").toString()));
            step.setStepName((String) body.get("stepName"));
            step.setStepNameAm((String) body.get("stepNameAm"));
            step.setApproverRoleCode((String) body.get("approverRoleCode"));
            step.setIsRequired(body.get("isRequired") != null ? (Boolean) body.get("isRequired") : true);
            if (body.get("minAmount") != null && !body.get("minAmount").toString().isEmpty())
                step.setMinAmount(new BigDecimal(body.get("minAmount").toString()));
            if (body.get("maxAmount") != null && !body.get("maxAmount").toString().isEmpty())
                step.setMaxAmount(new BigDecimal(body.get("maxAmount").toString()));
            if (body.get("autoApproveBelow") != null && !body.get("autoApproveBelow").toString().isEmpty())
                step.setAutoApproveBelow(new BigDecimal(body.get("autoApproveBelow").toString()));
            step.setSlaHours(body.get("slaHours") != null ? Integer.parseInt(body.get("slaHours").toString()) : 48);
            step.setCanReject(body.get("canReject") != null ? (Boolean) body.get("canReject") : true);
            return ResponseEntity.ok(workflowService.updateStep(stepId, step));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/steps/{stepId}")
    public ResponseEntity<?> deleteStep(@PathVariable int stepId) {
        try {
            workflowService.deleteStep(stepId);
            return ResponseEntity.ok(Collections.singletonMap("message", "Step deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    // ─── Workflow Instance Operations ─────────────────────

    @GetMapping("/instances/{id}")
    public ResponseEntity<?> getInstance(@PathVariable long id) {
        return workflowService.getInstanceById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/instances/by-document")
    public ResponseEntity<?> getInstanceByDocument(@RequestParam String documentType, @RequestParam long documentId) {
        return workflowService.getInstanceByDocument(documentType, documentId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/instances/{id}/approve")
    public ResponseEntity<?> approveStep(@PathVariable long id, @RequestBody(required = false) Map<String, Object> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            String comments = body != null ? (String) body.get("comments") : null;
            return ResponseEntity.ok(workflowService.approve(id, username, comments));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PostMapping("/instances/{id}/reject")
    public ResponseEntity<?> rejectStep(@PathVariable long id, @RequestBody Map<String, Object> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            String reason = (String) body.get("reason");
            return ResponseEntity.ok(workflowService.reject(id, username, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/my-pending")
    public ResponseEntity<?> getMyPending(Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            List<String> roles = userAccountRoleRepo.findRoleCodesByUsername(username);
            if (roles.isEmpty()) return ResponseEntity.ok(Collections.emptyList());
            return ResponseEntity.ok(instanceRepo.findPendingByRoles(roles, PageRequest.of(0, 50, Sort.by("initiatedAt").descending())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/my-pending/count")
    public ResponseEntity<?> getMyPendingCount(Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            return ResponseEntity.ok(Collections.singletonMap("count", workflowService.getPendingCountForUser(username)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    // ─── Role Assignment CRUD ─────────────────────────────

    @GetMapping("/role-assignments")
    public ResponseEntity<?> getAllRoleAssignments() {
        try {
            List<Map<String, Object>> result = userAccountRoleRepo.findAllActiveWithDetails().stream()
                .map(uar -> {
                    Map<String, Object> m = new java.util.LinkedHashMap<>();
                    m.put("id", uar.getId());
                    m.put("assignedBy", uar.getAssignedBy());
                    m.put("assignedAt", uar.getAssignedAt());
                    m.put("isActive", uar.getIsActive());
                    if (uar.getUserRole() != null) {
                        Map<String, Object> role = new java.util.LinkedHashMap<>();
                        role.put("id", uar.getUserRole().getId());
                        role.put("roleCode", uar.getUserRole().getRoleCode());
                        role.put("roleName", uar.getUserRole().getRoleName());
                        m.put("userRole", role);
                    }
                    if (uar.getUserAccount() != null) {
                        Map<String, Object> ua = new java.util.LinkedHashMap<>();
                        ua.put("id", uar.getUserAccount().getId());
                        ua.put("userName", uar.getUserAccount().getUserName());
                        ua.put("firstName", uar.getUserAccount().getFirstName());
                        ua.put("midleName", uar.getUserAccount().getMidleName());
                        ua.put("lastName", uar.getUserAccount().getLastName());
                        if (uar.getUserAccount().getUserRole() != null) {
                            Map<String, Object> pr = new java.util.LinkedHashMap<>();
                            pr.put("id", uar.getUserAccount().getUserRole().getId());
                            pr.put("roleCode", uar.getUserAccount().getUserRole().getRoleCode());
                            pr.put("roleName", uar.getUserAccount().getUserRole().getRoleName());
                            ua.put("userRole", pr);
                        }
                        if (uar.getUserAccount().getBranch() != null) {
                            Map<String, Object> br = new java.util.LinkedHashMap<>();
                            br.put("id", uar.getUserAccount().getBranch().getId());
                            br.put("branchName", uar.getUserAccount().getBranch().getBranchDescription());
                            ua.put("branch", br);
                        }
                        m.put("userAccount", ua);
                    }
                    return m;
                })
                .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/role-assignments/user/{userId}")
    public ResponseEntity<?> getRolesByUser(@PathVariable int userId) {
        return ResponseEntity.ok(userAccountRoleRepo.findByUserAccountIdAndIsActiveTrue(userId));
    }

    @GetMapping("/role-assignments/user-roles/{username}")
    public ResponseEntity<?> getRoleCodesByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userAccountRoleRepo.findRoleCodesByUsername(username));
    }

    @PostMapping("/role-assignments")
    public ResponseEntity<?> assignRole(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            int userAccountId = Integer.parseInt(body.get("userAccountId").toString());
            int userRoleId = Integer.parseInt(body.get("userRoleId").toString());
            Integer branchId = body.get("branchId") != null && !body.get("branchId").toString().isEmpty()
                ? Integer.parseInt(body.get("branchId").toString()) : null;

            // Check if already assigned — handle null branchId separately
            List<UserAccountRole> existing = userAccountRoleRepo.findByUserAccountIdAndIsActiveTrue(userAccountId);
            boolean alreadyAssigned = existing.stream().anyMatch(r ->
                r.getUserRole().getId() == userRoleId &&
                ((branchId == null && r.getBranch() == null) || (branchId != null && r.getBranch() != null && r.getBranch().getId() == branchId))
            );
            if (alreadyAssigned) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Role already assigned to this user"));
            }

            UserAccountRole uar = new UserAccountRole();
            uar.setUserAccount(userAccountRepo.findById(userAccountId).orElseThrow(() -> new IllegalArgumentException("User not found")));
            uar.setUserRole(userRoleRepo.findById(userRoleId).orElseThrow(() -> new IllegalArgumentException("Role not found")));
            uar.setAssignedBy(principal != null ? principal.getName() : "system");
            uar.setIsActive(true);

            UserAccountRole saved = userAccountRoleRepo.save(uar);

            // Return lightweight response — avoid serializing full UserAccount with photo LOB
            Map<String, Object> result = new java.util.LinkedHashMap<>();
            result.put("id", saved.getId());
            result.put("message", "Role assigned successfully");
            result.put("userRoleCode", saved.getUserRole().getRoleCode());
            result.put("userRoleName", saved.getUserRole().getRoleName());
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/role-assignments/{id}")
    public ResponseEntity<?> revokeRole(@PathVariable int id) {
        try {
            UserAccountRole uar = userAccountRoleRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));
            uar.setIsActive(false);
            userAccountRoleRepo.save(uar);
            return ResponseEntity.ok(Collections.singletonMap("message", "Role revoked"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    // ─── Reference Data ───────────────────────────────────

    @GetMapping("/roles")
    public ResponseEntity<?> getAllRoles() {
        return ResponseEntity.ok(userRoleRepo.findAll());
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            // Return lightweight user list — avoid loading photo/LOB fields
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> users = userAccountRepo.findAll().stream()
                .filter(u -> "active".equalsIgnoreCase(u.getDeleted()))
                .map(u -> {
                    Map<String, Object> m = new java.util.LinkedHashMap<>();
                    m.put("id", u.getId());
                    m.put("userName", u.getUserName());
                    m.put("firstName", u.getFirstName());
                    m.put("midleName", u.getMidleName());
                    m.put("lastName", u.getLastName());
                    m.put("status", u.getStatus());
                    if (u.getUserRole() != null) {
                        Map<String, Object> role = new java.util.LinkedHashMap<>();
                        role.put("id", u.getUserRole().getId());
                        role.put("roleCode", u.getUserRole().getRoleCode());
                        role.put("roleName", u.getUserRole().getRoleName());
                        m.put("userRole", role);
                    }
                    if (u.getBranch() != null) {
                        Map<String, Object> branch = new java.util.LinkedHashMap<>();
                        branch.put("id", u.getBranch().getId());
                        branch.put("branchName", u.getBranch().getBranchDescription());
                        m.put("branch", branch);
                    }
                    return m;
                })
                .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    // ─── Menu Permissions (Visual Sidebar Mapping) ────────

    @GetMapping("/menu-permissions/{roleId}")
    public ResponseEntity<?> getMenuPermissions(@PathVariable int roleId) {
        try {
            List<UserRecord> records = userRecordRepo.findByUserRole_IdAndDeletedIgnoreCase(roleId, "active");
            List<String> pageCodes = records.stream()
                .map(UserRecord::getPageCode)
                .distinct()
                .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(pageCodes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/menu-permissions/{roleId}")
    public ResponseEntity<?> saveMenuPermissions(@PathVariable int roleId, @RequestBody Map<String, Object> body) {
        try {
            List<String> newPageCodes = (List<String>) body.get("pageCodes");
            if (newPageCodes == null) newPageCodes = Collections.emptyList();

            UserRole role = userRoleRepo.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));

            // Get existing active records for this role
            List<UserRecord> existing = userRecordRepo.findByUserRole_IdAndDeletedIgnoreCase(roleId, "active");
            Set<String> existingCodes = existing.stream().map(UserRecord::getPageCode).collect(java.util.stream.Collectors.toSet());
            Set<String> newCodes = new HashSet<>(newPageCodes);

            // Delete removed pages (soft delete)
            for (UserRecord rec : existing) {
                if (!newCodes.contains(rec.getPageCode())) {
                    rec.setDeleted("deleted");
                    userRecordRepo.save(rec);
                }
            }

            // Add new pages
            for (String pageCode : newCodes) {
                if (!existingCodes.contains(pageCode)) {
                    UserRecord rec = new UserRecord();
                    rec.setPageCode(pageCode);
                    rec.setPageName(pageCode); // page name same as code, admin can rename later
                    rec.setUserRole(role);
                    rec.setPermissionCreate(true);
                    rec.setPermissionEdit(true);
                    rec.setPermissionDelete(false);
                    rec.setPermissionApprove(false);
                    rec.setPermissionNeedsApproval(false);
                    rec.setPermissionKdmekfya(false);
                    rec.setDeleted("active");
                    userRecordRepo.save(rec);
                }
            }

            return ResponseEntity.ok(Collections.singletonMap("message", "Menu permissions saved. " + newCodes.size() + " pages configured."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
