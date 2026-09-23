package com.wbill.home.controller;

import com.wbill.home.dto.AddressZoneDTO;
import com.wbill.home.model.AddressZone;
import com.wbill.home.service.AddressZoneService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/mardaerp/address-zones")
@CrossOrigin(origins = "*")
public class AddressZoneController {

    private final AddressZoneService addressZoneService;

    public AddressZoneController(AddressZoneService addressZoneService) {
        this.addressZoneService = addressZoneService;
    }

    /**
     * Get all address zones
     */
    @GetMapping("/all")
    public ResponseEntity<List<AddressZoneDTO>> getAllAddressZones() {
        try {
            List<AddressZoneDTO> zones = addressZoneService.getAllAddressZones();
            return ResponseEntity.ok(zones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get address zones by status with pagination
     */
    @GetMapping("/by-status/{status}")
    public ResponseEntity<Page<AddressZoneDTO>> getAddressZonesByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AddressZoneDTO> zones = addressZoneService.findByStatusPaginated(status, pageable);
            return ResponseEntity.ok(zones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get address zones by status (without pagination)
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AddressZoneDTO>> getAddressZonesByStatusList(@PathVariable String status) {
        try {
            List<AddressZoneDTO> zones = addressZoneService.getAddressZonesByStatus(status);
            return ResponseEntity.ok(zones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get address zone by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<AddressZoneDTO> getAddressZoneById(@PathVariable Integer id) {
        try {
            Optional<AddressZoneDTO> zone = addressZoneService.findById(id);
            return zone.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get address zones by state ID
     */
    @GetMapping("/state/{stateId}")
    public ResponseEntity<List<AddressZoneDTO>> getAddressZonesByStateId(@PathVariable Integer stateId) {
        try {
            List<AddressZoneDTO> zones = addressZoneService.getAddressZonesByStateId(stateId);
            return ResponseEntity.ok(zones);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new address zone
     */
    @PostMapping
    public ResponseEntity<?> createAddressZone(@Valid @RequestBody AddressZoneDTO addressZoneDTO) {
        try {
            AddressZone createdZone = addressZoneService.createAddressZone(addressZoneDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdZone);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create address zone"));
        }
    }

    /**
     * Update an existing address zone
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddressZone(@PathVariable Integer id, 
                                              @Valid @RequestBody AddressZoneDTO addressZoneDTO) {
        try {
            AddressZone updatedZone = addressZoneService.updateAddressZone(id, addressZoneDTO);
            return ResponseEntity.ok(updatedZone);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update address zone"));
        }
    }

    /**
     * Activate an address zone
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateAddressZone(@PathVariable Integer id) {
        try {
            addressZoneService.activateAddressZone(id);
            return ResponseEntity.ok(Map.of("message", "Address zone activated successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to activate address zone"));
        }
    }

    /**
     * Deactivate an address zone (soft delete)
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateAddressZone(@PathVariable Integer id,
                                                  @RequestBody(required = false) Map<String, String> payload) {
        try {
            String remark = payload != null ? payload.get("remark") : "";
            addressZoneService.deactivateAddressZone(id, remark);
            return ResponseEntity.ok(Map.of("message", "Address zone deactivated successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to deactivate address zone"));
        }
    }

    /**
     * Permanently delete an address zone
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddressZone(@PathVariable Integer id) {
        try {
            addressZoneService.deleteAddressZone(id);
            return ResponseEntity.ok(Map.of("message", "Address zone deleted successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to delete address zone"));
        }
    }

    /**
     * Check if zone code exists
     */
    @GetMapping("/exists/code/{zoneCode}")
    public ResponseEntity<Map<String, Boolean>> checkZoneCodeExists(@PathVariable String zoneCode) {
        try {
            boolean exists = addressZoneService.existsByZoneCode(zoneCode);
            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Check if zone name exists
     */
    @GetMapping("/exists/name/{zoneName}")
    public ResponseEntity<Map<String, Boolean>> checkZoneNameExists(@PathVariable String zoneName) {
        try {
            boolean exists = addressZoneService.existsByZoneName(zoneName);
            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get zone statistics by state
     */
    @GetMapping("/stats/state/{stateId}")
    public ResponseEntity<Map<String, Long>> getZoneStatsByState(@PathVariable Integer stateId) {
        try {
            Long totalZones = addressZoneService.countZonesByState(stateId);
            Long activeZones = addressZoneService.countActiveZonesByState(stateId);
            
            return ResponseEntity.ok(Map.of(
                "totalZones", totalZones,
                "activeZones", activeZones,
                "inactiveZones", totalZones - activeZones
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
