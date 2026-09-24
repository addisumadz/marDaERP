package com.wbill.home.controller;

import com.wbill.home.dto.CustomNewLineDTOs.*;
import com.wbill.home.model.CustomCommonMaterial;
import com.wbill.home.model.CustomNewLineConnectionRequest;
import com.wbill.home.service.CustomNewLineConnectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mardaerp/custom-new-line")
@CrossOrigin(origins = "*")
public class CustomNewLineConnectionController {

    @Autowired
    private CustomNewLineConnectionService service;

    // ─── 1. Application Creation ────────────────────────────────────────────
    @PostMapping("/applications")
    public ResponseEntity<?> createApplication(@RequestBody CreateApplicationDTO dto, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "customer_service";
            CustomNewLineConnectionRequest result = service.createApplication(dto, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    // ─── 2. Applications Listing & Details ──────────────────────────────────
    @GetMapping("/applications")
    public ResponseEntity<?> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer branchId,
            @RequestParam(required = false) String search,
            Principal principal) {
        String username = principal != null ? principal.getName() : null;
        Page<CustomNewLineConnectionRequest> result = service.getApplications(
            status, branchId, search, username,
            PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<?> getApplicationById(@PathVariable Long id) {
        return service.getApplicationById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/applications/{id}/items")
    public ResponseEntity<?> getApplicationItems(@PathVariable Long id) {
        return ResponseEntity.ok(service.getApplicationItems(id));
    }

    @GetMapping("/applications/{id}/fees")
    public ResponseEntity<?> getApplicationFees(@PathVariable Long id) {
        return ResponseEntity.ok(service.getApplicationFees(id));
    }

    @GetMapping("/applications/{id}/logs")
    public ResponseEntity<?> getApplicationLogs(@PathVariable Long id, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : null;
            return ResponseEntity.ok(service.getApplicationLogs(id, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDepartmentStats(
            @RequestParam(required = false) Integer branchId,
            Principal principal) {
        String username = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(service.getDepartmentStats(branchId, username));
    }

    // ─── 3. Assign Survey Plumber (Technical Department) ────────────────────
    @PutMapping("/applications/{id}/assign-survey-plumber")
    public ResponseEntity<?> assignSurveyPlumber(
            @PathVariable Long id,
            @RequestBody AssignPlumberDTO dto,
            Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "technical";
            return ResponseEntity.ok(service.assignSurveyPlumber(id, dto, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    // ─── 4. Submit Survey Encoding (Technical Department) ───────────────────
    @PutMapping("/applications/{id}/submit-survey")
    public ResponseEntity<?> submitSurvey(
            @PathVariable Long id,
            @RequestBody SubmitSurveyDTO dto,
            Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "technical";
            return ResponseEntity.ok(service.submitSurvey(id, dto, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    // ─── 5. Payment Approval (Revenue Department) ───────────────────────────
    @PutMapping("/applications/{id}/approve-payment")
    public ResponseEntity<?> approvePayment(
            @PathVariable Long id,
            @RequestBody PaymentApprovalDTO dto,
            Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "revenue";
            return ResponseEntity.ok(service.approvePayment(id, dto, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    // ─── 6. Store Material Dispatch (Inventory Department) ──────────────────
    @PutMapping("/applications/{id}/dispatch-materials")
    public ResponseEntity<?> dispatchMaterials(
            @PathVariable Long id,
            @RequestBody StoreDispatchDTO dto,
            Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "storekeeper";
            return ResponseEntity.ok(service.dispatchMaterials(id, dto, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    // ─── 7. Assign Installation Plumber (Technical Department) ──────────────
    @PutMapping("/applications/{id}/assign-installation-plumber")
    public ResponseEntity<?> assignInstallationPlumber(
            @PathVariable Long id,
            @RequestBody AssignPlumberDTO dto,
            Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "technical";
            return ResponseEntity.ok(service.assignInstallationPlumber(id, dto, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    // ─── 8. Complete Installation (Technical Department) ────────────────────
    @PutMapping("/applications/{id}/complete-installation")
    public ResponseEntity<?> completeInstallation(
            @PathVariable Long id,
            @RequestBody InstallationCompletionDTO dto,
            Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "technical";
            return ResponseEntity.ok(service.completeInstallation(id, dto, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    // ─── 9. Final Customer Activation (Customer Service) ────────────────────
    @PutMapping("/applications/{id}/finalize-activation")
    public ResponseEntity<?> finalizeActivation(
            @PathVariable Long id,
            @RequestBody FinalActivationDTO dto,
            Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "customer_service";
            return ResponseEntity.ok(service.finalizeActivation(id, dto, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    // ─── 10. Supervisory & Management Operations ────────────────────────────
    @PutMapping("/applications/{id}/reassign-plumber")
    public ResponseEntity<?> reassignPlumber(
            @PathVariable Long id,
            @RequestBody ReassignPlumberDTO dto,
            Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "technical_lead";
            return ResponseEntity.ok(service.reassignPlumber(id, dto, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @PutMapping("/applications/{id}/reject-cancel")
    public ResponseEntity<?> rejectOrCancelApplication(
            @PathVariable Long id,
            @RequestBody RejectCancelDTO dto,
            Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "management";
            return ResponseEntity.ok(service.rejectOrCancelApplication(id, dto, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @PutMapping("/applications/{id}/return-revision")
    public ResponseEntity<?> returnForRevision(
            @PathVariable Long id,
            @RequestBody ReturnRevisionDTO dto,
            Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "revenue";
            return ResponseEntity.ok(service.returnForRevision(id, dto, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    // ─── 11. Catalogs & Plumbers ────────────────────────────────────────────
    @GetMapping("/common-materials")
    public ResponseEntity<?> getCommonMaterials() {
        return ResponseEntity.ok(service.getAllCommonMaterials());
    }

    @PostMapping("/common-materials")
    public ResponseEntity<?> saveCommonMaterial(@RequestBody CustomCommonMaterial material) {
        return ResponseEntity.ok(service.saveCommonMaterial(material));
    }

    @DeleteMapping("/common-materials/{id}")
    public ResponseEntity<?> deleteCommonMaterial(@PathVariable Long id) {
        service.deleteCommonMaterial(id);
        return ResponseEntity.ok(Collections.singletonMap("success", true));
    }

    @GetMapping("/fee-types")
    public ResponseEntity<?> getFeeTypes() {
        return ResponseEntity.ok(service.getAllFeeTypes());
    }

    @GetMapping("/plumbers")
    public ResponseEntity<?> getAvailablePlumbers(@RequestParam(required = false) Integer branchId) {
        return ResponseEntity.ok(service.getAvailablePlumbers(branchId));
    }

    @GetMapping("/branch-catalog-stock")
    public ResponseEntity<?> getBranchCatalogStock(@RequestParam(required = false) Integer branchId, Principal principal) {
        String username = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(service.getBranchCatalogStock(branchId, username));
    }
}
