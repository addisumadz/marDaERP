package com.wbill.home.controller;

import com.wbill.home.dto.AddressStateDTO;
import com.wbill.home.model.AddressState;
import com.wbill.home.service.AddressStateService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/card_managenment/address-states")
@CrossOrigin(origins = "*")
public class AddressStateController {

    @Autowired
    private AddressStateService addressStateService;

    /**
     * Get all address states
     */
    @GetMapping("/all")
    public ResponseEntity<List<AddressStateDTO>> getAllAddressStates() {
        List<AddressStateDTO> states = addressStateService.getAllAddressStates();
        return ResponseEntity.ok(states);
    }

    /**
     * Get address states by status with pagination
     */
    @GetMapping("/by-status/{status}")
    public ResponseEntity<Page<AddressStateDTO>> getAddressStatesByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<AddressStateDTO> states = addressStateService.findByStatusPaginated(status, pageable);
        return ResponseEntity.ok(states);
    }

    /**
     * Get address states by status (without pagination)
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AddressStateDTO>> getAddressStatesByStatusList(@PathVariable String status) {
        List<AddressStateDTO> states = addressStateService.getAddressStatesByStatus(status);
        return ResponseEntity.ok(states);
    }

    /**
     * Get address state by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<AddressStateDTO> getAddressStateById(@PathVariable Integer id) {
        Optional<AddressStateDTO> state = addressStateService.findById(id);
        return state.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new address state
     */
    @PostMapping
    public ResponseEntity<?> createAddressState(@RequestBody AddressStateDTO stateDTO) {
        try {
            AddressState newState = addressStateService.createAddressState(stateDTO);
            return new ResponseEntity<>(newState, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error creating address state: " + e.getMessage());
        }
    }

    /**
     * Update an existing address state
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddressState(@PathVariable Integer id, @RequestBody AddressStateDTO stateDTO) {
        try {
            AddressState updatedState = addressStateService.updateAddressState(id, stateDTO);
            return ResponseEntity.ok(updatedState);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error updating address state: " + e.getMessage());
        }
    }

    /**
     * Activate an address state
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateAddressState(@PathVariable Integer id) {
        try {
            addressStateService.activateAddressState(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error activating address state: " + e.getMessage());
        }
    }

    /**
     * Deactivate an address state (soft delete)
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateAddressState(@PathVariable Integer id, @RequestBody(required = false) String remark) {
        try {
            addressStateService.deactivateAddressState(id, remark);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error deactivating address state: " + e.getMessage());
        }
    }

    /**
     * Permanently delete an address state
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddressState(@PathVariable Integer id) {
        try {
            addressStateService.deleteAddressState(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error deleting address state: " + e.getMessage());
        }
    }

    /**
     * Get address states by country ID
     */
    @GetMapping("/country/{countryId}")
    public ResponseEntity<List<AddressStateDTO>> getAddressStatesByCountryId(@PathVariable Integer countryId) {
        List<AddressStateDTO> states = addressStateService.getAddressStatesByCountryId(countryId);
        return ResponseEntity.ok(states);
    }

    /**
     * Get address states by status and country ID
     */
    @GetMapping("/status/{status}/country/{countryId}")
    public ResponseEntity<List<AddressState>> getAddressStatesByStatusAndCountry(
            @PathVariable String status, @PathVariable Integer countryId) {
        List<AddressState> states = addressStateService.getAddressStatesByStatusAndCountry(status, countryId);
        return ResponseEntity.ok(states);
    }

    /**
     * Check if state code exists
     */
    @GetMapping("/exists/code/{stateCode}")
    public ResponseEntity<Boolean> existsByStateCode(@PathVariable String stateCode) {
        boolean exists = addressStateService.existsByStateCode(stateCode);
        return ResponseEntity.ok(exists);
    }

    /**
     * Check if state name exists
     */
    @GetMapping("/exists/name/{stateName}")
    public ResponseEntity<Boolean> existsByStateName(@PathVariable String stateName) {
        boolean exists = addressStateService.existsByStateName(stateName);
        return ResponseEntity.ok(exists);
    }

    /**
     * Find address state by state code
     */
    @GetMapping("/code/{stateCode}")
    public ResponseEntity<AddressState> findByStateCode(@PathVariable String stateCode) {
        Optional<AddressState> state = addressStateService.findByStateCode(stateCode);
        return state.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Find address state by state name
     */
    @GetMapping("/name/{stateName}")
    public ResponseEntity<AddressState> findByStateName(@PathVariable String stateName) {
        Optional<AddressState> state = addressStateService.findByStateName(stateName);
        return state.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all address states ordered by name
     */
    @GetMapping("/ordered")
    public ResponseEntity<List<AddressState>> getAllAddressStatesOrderedByName() {
        List<AddressState> states = addressStateService.getAllAddressStatesOrderedByName();
        return ResponseEntity.ok(states);
    }
}
