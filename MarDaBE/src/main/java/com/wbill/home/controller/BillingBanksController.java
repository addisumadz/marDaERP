package com.wbill.home.controller;

import com.wbill.home.dto.BillingBanksCreateDTO;
import com.wbill.home.dto.BillingBanksDTO;
import com.wbill.home.model.BillingBanks;
import com.wbill.home.service.BillingBanksService;
import com.wbill.home.service.PagePermissionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/card_managenment/billing-banks")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BillingBanksController {

    @Autowired
    private BillingBanksService billingBanksService;

    @Autowired
    private PagePermissionService pagePermissionService;

    private static final String PAGE_CODE = "billingBanks";

    // Get all banks
    @GetMapping("/all")
    public ResponseEntity<List<BillingBanksDTO>> getAllBillingBanks() {
        try {
            List<BillingBanks> banks = billingBanksService.getAllBillingBanks();
            List<BillingBanksDTO> bankDTOs = banks.stream()
                    .map(BillingBanksDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(bankDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get banks by status with pagination
    @GetMapping("/by-status/{status}")
    public ResponseEntity<Page<BillingBanksDTO>> getBillingBanksByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<BillingBanks> banks = billingBanksService.getBillingBanksByStatus(status, page, size);
            Page<BillingBanksDTO> bankDTOs = banks.map(BillingBanksDTO::new);
            return ResponseEntity.ok(bankDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get bank by ID
    @GetMapping("/{id}")
    public ResponseEntity<BillingBanksDTO> getBillingBankById(@PathVariable Integer id) {
        try {
            Optional<BillingBanks> bank = billingBanksService.getBillingBankById(id);
            if (bank.isPresent()) {
                return ResponseEntity.ok(new BillingBanksDTO(bank.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create new bank
    @PostMapping
    public ResponseEntity<?> createBillingBank(@RequestBody BillingBanksCreateDTO bankCreateDTO) {
        try {
            pagePermissionService.assertCanCreate(PAGE_CODE);
            // Convert DTO to entity
            BillingBanks billingBank = new BillingBanks();
            billingBank.setGatewayCode(bankCreateDTO.getGatewayCode());
            billingBank.setBankCode(bankCreateDTO.getBankCode());
            billingBank.setBankName(bankCreateDTO.getBankName());
            billingBank.setBankColor(bankCreateDTO.getBankColor());
            
            BillingBanks createdBank = billingBanksService.createBillingBank(billingBank);
            return ResponseEntity.status(HttpStatus.CREATED).body(new BillingBanksDTO(createdBank));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating billing bank: " + e.getMessage()));
        }
    }

    // Update existing bank
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBillingBank(@PathVariable Integer id, @RequestBody BillingBanksCreateDTO bankUpdateDTO) {
        try {
            pagePermissionService.assertCanEdit(PAGE_CODE);
            // Convert DTO to entity
            BillingBanks billingBank = new BillingBanks();
            billingBank.setGatewayCode(bankUpdateDTO.getGatewayCode());
            billingBank.setBankCode(bankUpdateDTO.getBankCode());
            billingBank.setBankName(bankUpdateDTO.getBankName());
            billingBank.setBankColor(bankUpdateDTO.getBankColor());
            
            BillingBanks updatedBank = billingBanksService.updateBillingBank(id, billingBank);
            return ResponseEntity.ok(new BillingBanksDTO(updatedBank));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating billing bank: " + e.getMessage()));
        }
    }

    // Deactivate bank (soft delete)
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateBillingBank(@PathVariable Integer id, @RequestBody(required = false) Map<String, String> payload) {
        try {
            pagePermissionService.assertCanDelete(PAGE_CODE);
            String remark = payload != null ? payload.get("remark") : "";
            BillingBanks deactivatedBank = billingBanksService.deactivateBillingBank(id, remark);
            return ResponseEntity.ok(new BillingBanksDTO(deactivatedBank));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deactivating billing bank: " + e.getMessage()));
        }
    }

    // Activate bank
    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateBillingBank(@PathVariable Integer id) {
        try {
            pagePermissionService.assertCanApprove(PAGE_CODE);
            BillingBanks activatedBank = billingBanksService.activateBillingBank(id);
            return ResponseEntity.ok(new BillingBanksDTO(activatedBank));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error activating billing bank: " + e.getMessage()));
        }
    }

    // Get bank statistics
    @GetMapping("/statistics")
    public ResponseEntity<BillingBanksService.BankStatistics> getBankStatistics() {
        try {
            BillingBanksService.BankStatistics stats = billingBanksService.getBankStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get current user's permissions for this page (for frontend UI control)
    @GetMapping("/permissions")
    public ResponseEntity<PagePermissionService.PagePermissions> getPagePermissions() {
        try {
            PagePermissionService.PagePermissions perms = pagePermissionService.getPermissionsForCurrentUser(PAGE_CODE);
            return ResponseEntity.ok(perms);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
