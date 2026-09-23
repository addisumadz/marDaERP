package com.wbill.home.controller;

import com.wbill.home.dto.CustomMaintenanceDTOs.*;
import com.wbill.home.model.CustomMaintenanceCommonMaterial;
import com.wbill.home.model.CustomMaintenanceRequest;
import com.wbill.home.model.CustomMaintenanceType;
import com.wbill.home.service.CustomMaintenanceService;
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
@RequestMapping("/api/mardaerp/custom-maintenance")
@CrossOrigin(origins = "*")
public class CustomMaintenanceController {

    @Autowired
    private CustomMaintenanceService service;

    // ─── 1. Maintenance Request Creation (Customer Service) ─────────────────
    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(@RequestBody CreateMaintenanceRequestDTO dto, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "customer_service";
            CustomMaintenanceRequest result = service.createRequest(dto, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    // ─── 2. Maintenance Requests Listing & Details ──────────────────────────
    @GetMapping("/requests")
    public ResponseEntity<?> getRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer branchId,
            @RequestParam(required = false) Long maintenanceTypeId,
            @RequestParam(required = false) String search,
            Principal principal) {
        String username = principal != null ? principal.getName() : null;
        Page<CustomMaintenanceRequest> result = service.getRequests(
            status, branchId, maintenanceTypeId, search, username,
            PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<?> getRequestById(@PathVariable Long id) {
        return service.getRequestById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/requests/{id}/items")
    public ResponseEntity<?> getRequestItems(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRequestItems(id));
    }

    @GetMapping("/requests/{id}/fees")
    public ResponseEntity<?> getRequestFees(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRequestFees(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDepartmentStats(
            @RequestParam(required = false) Integer branchId,
            Principal principal) {
        String username = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(service.getDepartmentStats(branchId, username));
    }

    // ─── 3. Step 2: Assign Survey Plumber (Technical Department) ────────────
    @PutMapping("/requests/{id}/assign-survey-plumber")
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

    // ─── 4. Step 3: Submit Survey Materials & Fees (Technical Department) ───
    @PutMapping("/requests/{id}/submit-survey")
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

    // ─── 5. Step 4: Price Review & Payment Approval (Revenue Department) ────
    @PutMapping("/requests/{id}/approve-payment")
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

    // ─── 6. Step 5: Store Material Dispatch (Store Keeper) ──────────────────
    @PutMapping("/requests/{id}/dispatch-materials")
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

    // ─── 7. Step 6: Assign Maintenance Plumber (Technical Department) ───────
    @PutMapping("/requests/{id}/assign-maintenance-plumber")
    public ResponseEntity<?> assignMaintenancePlumber(
            @PathVariable Long id,
            @RequestBody AssignPlumberDTO dto,
            Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "technical";
            return ResponseEntity.ok(service.assignMaintenancePlumber(id, dto, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    // ─── 8. Step 7: Complete Maintenance & Verification (Technical) ─────────
    @PutMapping("/requests/{id}/complete-maintenance")
    public ResponseEntity<?> completeMaintenance(
            @PathVariable Long id,
            @RequestBody MaintenanceCompletionDTO dto,
            Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "technical";
            return ResponseEntity.ok(service.completeMaintenance(id, dto, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    // ─── 9. Maintenance Types Catalog ───────────────────────────────────────
    @GetMapping("/maintenance-types")
    public ResponseEntity<?> getMaintenanceTypes() {
        return ResponseEntity.ok(service.getAllMaintenanceTypes());
    }

    @PostMapping("/maintenance-types")
    public ResponseEntity<?> saveMaintenanceType(@RequestBody CustomMaintenanceType type) {
        return ResponseEntity.ok(service.saveMaintenanceType(type));
    }

    // ─── 10. Common Materials Catalog (Categorized by Maintenance Type) ─────
    @GetMapping("/common-materials")
    public ResponseEntity<?> getCommonMaterials(@RequestParam(required = false) Long maintenanceTypeId) {
        return ResponseEntity.ok(service.getCommonMaterials(maintenanceTypeId));
    }

    @PostMapping("/common-materials")
    public ResponseEntity<?> saveCommonMaterial(@RequestBody CustomMaintenanceCommonMaterial material) {
        return ResponseEntity.ok(service.saveCommonMaterial(material));
    }

    @DeleteMapping("/common-materials/{id}")
    public ResponseEntity<?> deleteCommonMaterial(@PathVariable Long id) {
        service.deleteCommonMaterial(id);
        return ResponseEntity.ok(Collections.singletonMap("success", true));
    }

    // ─── 11. Reference Catalogs & Branch Store Stock ────────────────────────
    @GetMapping("/fee-types")
    public ResponseEntity<?> getFeeTypes() {
        return ResponseEntity.ok(service.getAllFeeTypes());
    }

    @GetMapping("/plumbers")
    public ResponseEntity<?> getAvailablePlumbers(@RequestParam(required = false) Integer branchId) {
        return ResponseEntity.ok(service.getAvailablePlumbers(branchId));
    }

    @GetMapping("/branch-catalog-stock")
    public ResponseEntity<?> getBranchCatalogStock(
            @RequestParam(required = false) Integer branchId,
            @RequestParam(required = false) Long maintenanceTypeId,
            Principal principal) {
        String username = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(service.getBranchCatalogStock(branchId, maintenanceTypeId, username));
    }
}
