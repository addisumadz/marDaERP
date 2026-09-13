package com.wbill.home.controller;

import com.wbill.home.dto.DropdownDTO;
import com.wbill.home.service.DropdownService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/card_managenment/dropdowns")
public class DropdownController {

    @Autowired
    private DropdownService dropdownService;

//    @GetMapping("/kebeles")
//    public ResponseEntity<List<DropdownDTO>> getKebeles() {
//    	System.out.println(" kebele List");
//    	System.out.println(dropdownService.getAllActiveKebeles());
//
//        return ResponseEntity.ok(dropdownService.getAllActiveKebeles());
//
//    }
    
    @GetMapping("/billing-termination-reasons")
    public ResponseEntity<List<DropdownDTO>> getTerminationReasons() {
        return ResponseEntity.ok(dropdownService.getAllTerminationReasons());
    }

    @GetMapping("/kebeles")
    public ResponseEntity<List<DropdownDTO>> getKebeles() {
        //System.out.println("--- Starting getKebeles---");
        
        List<DropdownDTO> kebeles = dropdownService.getAllActiveKebeles();
        
//        System.out.println("Kebeles fetched from service:");
//        if (kebeles != null) {
//            System.out.println("List size: " + kebeles.size());
//            // This loop will print the details of each DTO, which is more useful than printing the whole list
//            for (DropdownDTO kebele : kebeles) {
//                System.out.println("Kebele DTO: id=" + kebele.getId() + ", name=" + kebele.getName());
//            }
//        } else {
//            System.out.println("Service returned null list.");
//        }
//        
//        System.out.println("--- Finishing getKebeles() ---");
        
        return ResponseEntity.ok(kebeles);
    }
    
    @GetMapping("/ketenas")
    public ResponseEntity<List<DropdownDTO>> getAllKetenas(@RequestParam(value = "kebeleId", required = false) Integer kebeleId) {
        if (kebeleId != null) {
            return ResponseEntity.ok(dropdownService.getActiveKetenasByKebele(kebeleId));
        }
        return ResponseEntity.ok(dropdownService.getAllActiveKetenas());
    }

    @GetMapping("/ketenas/{kebeleId}")
    public ResponseEntity<List<DropdownDTO>> getKetenas(@PathVariable Integer kebeleId) {
        return ResponseEntity.ok(dropdownService.getActiveKetenasByKebele(kebeleId));
    }

    @GetMapping("/readers/{branchId}")
    public ResponseEntity<List<DropdownDTO>> getReaders(@PathVariable Integer branchId) {
        return ResponseEntity.ok(dropdownService.getAllActiveReadersByBranch(branchId));
    }

    // Add endpoints for branches, meterSizes, customerTypes
//    @GetMapping("/branches")
//    public ResponseEntity<List<DropdownDTO>> getBranches() { /* ... */ }
//    
//    @GetMapping("/meter-sizes")
//    public ResponseEntity<List<DropdownDTO>> getMeterSizes() { /* ... */ }
//
//    @GetMapping("/customer-types")
//    public ResponseEntity<List<DropdownDTO>> getCustomerTypes() { /* ... */ }
    
    @GetMapping("/branches")
    public ResponseEntity<List<DropdownDTO>> getBranches() {
        return ResponseEntity.ok(dropdownService.getAllActiveBranches());
    }

    @GetMapping("/meter-sizes")
    public ResponseEntity<List<DropdownDTO>> getMeterSizes() {
        return ResponseEntity.ok(dropdownService.getAllActiveMeterSizes());
    }

    @GetMapping("/customer-types")
    public ResponseEntity<List<DropdownDTO>> getCustomerTypes() {
        return ResponseEntity.ok(dropdownService.getAllActiveCustomerTypes());
    }

    // New: active meter readers (roleCode = 'mobileanbabi') with optional branch filter
    @GetMapping("/meter-readers")
    public ResponseEntity<List<DropdownDTO>> getMeterReaders(@RequestParam(value = "branchId", required = false) Integer branchId) {
        if (branchId != null) {
            return ResponseEntity.ok(dropdownService.getActiveMeterReadersByBranch(branchId));
        }
        return ResponseEntity.ok(dropdownService.getActiveMeterReaders());
    }

    // New: users by roleCode (active only), optional branch-aware for known codes
    @GetMapping("/users-by-role-code")
    public ResponseEntity<List<DropdownDTO>> getUsersByRoleCode(
            @RequestParam("roleCode") String roleCode,
            @RequestParam(value = "branchId", required = false) Integer branchId) {
        if (branchId != null && "mobileanbabi".equalsIgnoreCase(roleCode)) {
            return ResponseEntity.ok(dropdownService.getActiveMeterReadersByBranch(branchId));
        }
        return ResponseEntity.ok(dropdownService.getActiveUsersByRoleCode(roleCode));
    }

    // New: active cashier users (role_id = 49) for cashier dropdown
    @GetMapping("/cashiers")
    public ResponseEntity<List<DropdownDTO>> getCashiers() {
        return ResponseEntity.ok(dropdownService.getActiveCashiers());
    }
}
