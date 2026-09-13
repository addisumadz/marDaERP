package com.wbill.home.controller;

import com.wbill.home.dto.AddressKetenaDTO;
import com.wbill.home.dto.AddressKetenaCreateDTO;
import com.wbill.home.model.AddressKetena;
import com.wbill.home.service.AddressKetenaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/card_managenment/address-ketenas")
@CrossOrigin(origins = "*")
public class AddressKetenaController {

    @Autowired
    private AddressKetenaService addressKetenaService;

    // Get all ketenas (for frontend categorization by status)
    @GetMapping("/all")
    public ResponseEntity<List<AddressKetenaDTO>> getAllAddressKetenas() {
        try {
            List<AddressKetenaDTO> ketenas = addressKetenaService.getAllAddressKetenas();
            return ResponseEntity.ok(ketenas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get ketenas by status with pagination
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<AddressKetenaDTO>> getAddressKetenasByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<AddressKetenaDTO> ketenas = addressKetenaService.getAddressKetenasByStatus(status, page, size);
            return ResponseEntity.ok(ketenas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get ketena by ID
    @GetMapping("/{id}")
    public ResponseEntity<AddressKetenaDTO> getAddressKetenaById(@PathVariable Integer id) {
        try {
            Optional<AddressKetenaDTO> ketena = addressKetenaService.getAddressKetenaById(id);
            return ketena.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get ketenas by streets ID
    @GetMapping("/streets/{streetsId}")
    public ResponseEntity<List<AddressKetenaDTO>> getAddressKetenasByStreetsId(@PathVariable Integer streetsId) {
        try {
            List<AddressKetenaDTO> ketenas = addressKetenaService.getAddressKetenasByStreetsId(streetsId);
            return ResponseEntity.ok(ketenas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create new ketena
    @PostMapping
    public ResponseEntity<Map<String, Object>> createAddressKetena(@RequestBody AddressKetenaCreateDTO dto) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            AddressKetena ketena = addressKetenaService.createAddressKetena(dto);
            response.put("success", true);
            response.put("message", "Ketena created successfully");
            response.put("data", ketena);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (EntityNotFoundException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "An error occurred while creating the ketena");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Update existing ketena
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateAddressKetena(
            @PathVariable Integer id, 
            @RequestBody AddressKetenaCreateDTO dto) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            AddressKetena ketena = addressKetenaService.updateAddressKetena(id, dto);
            response.put("success", true);
            response.put("message", "Ketena updated successfully");
            response.put("data", ketena);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (EntityNotFoundException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "An error occurred while updating the ketena");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Activate ketena
    @PutMapping("/{id}/activate")
    public ResponseEntity<Map<String, Object>> activateAddressKetena(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            AddressKetena ketena = addressKetenaService.activateAddressKetena(id);
            response.put("success", true);
            response.put("message", "Ketena activated successfully");
            response.put("data", ketena);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "An error occurred while activating the ketena");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Deactivate ketena (soft delete)
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Map<String, Object>> deactivateAddressKetena(
            @PathVariable Integer id,
            @RequestParam(required = false) String remark) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            AddressKetena ketena = addressKetenaService.deactivateAddressKetena(id, remark);
            response.put("success", true);
            response.put("message", "Ketena deactivated successfully");
            response.put("data", ketena);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "An error occurred while deactivating the ketena");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Delete ketena permanently
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteAddressKetena(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            addressKetenaService.deleteAddressKetena(id);
            response.put("success", true);
            response.put("message", "Ketena deleted permanently");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "An error occurred while deleting the ketena");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Check if ketena code exists
    @GetMapping("/exists/code/{ketenaCode}")
    public ResponseEntity<Map<String, Boolean>> checkKetenaCodeExists(@PathVariable String ketenaCode) {
        try {
            boolean exists = addressKetenaService.existsByKetenaCode(ketenaCode);
            Map<String, Boolean> response = new HashMap<>();
            response.put("exists", exists);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Check if ketena name exists
    @GetMapping("/exists/name/{ketenaName}")
    public ResponseEntity<Map<String, Boolean>> checkKetenaNameExists(@PathVariable String ketenaName) {
        try {
            boolean exists = addressKetenaService.existsByKetenaName(ketenaName);
            Map<String, Boolean> response = new HashMap<>();
            response.put("exists", exists);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Count ketenas by streets
    @GetMapping("/count/streets/{streetsId}")
    public ResponseEntity<Map<String, Long>> countKetenasByStreets(@PathVariable Integer streetsId) {
        try {
            Long count = addressKetenaService.countKetenasByStreets(streetsId);
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Count active ketenas by streets
    @GetMapping("/count/active/streets/{streetsId}")
    public ResponseEntity<Map<String, Long>> countActiveKetenasByStreets(@PathVariable Integer streetsId) {
        try {
            Long count = addressKetenaService.countActiveKetenasByStreets(streetsId);
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
