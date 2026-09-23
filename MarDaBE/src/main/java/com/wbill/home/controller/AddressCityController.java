package com.wbill.home.controller;

import com.wbill.home.dto.AddressCityDTO;
import com.wbill.home.model.AddressCity;
import com.wbill.home.service.AddressCityService;
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
@RequestMapping("/api/mardaerp/address-cities")
@CrossOrigin(origins = "*")
public class AddressCityController {

    private final AddressCityService addressCityService;

    public AddressCityController(AddressCityService addressCityService) {
        this.addressCityService = addressCityService;
    }

    /**
     * Get all address cities
     */
    @GetMapping("/all")
    public ResponseEntity<List<AddressCityDTO>> getAllAddressCities() {
        try {
            List<AddressCityDTO> cities = addressCityService.getAllAddressCities();
            return ResponseEntity.ok(cities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get address cities by status with pagination
     */
    @GetMapping("/by-status/{status}")
    public ResponseEntity<Page<AddressCityDTO>> getAddressCitiesByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AddressCityDTO> cities = addressCityService.findByStatusPaginated(status, pageable);
            return ResponseEntity.ok(cities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get address cities by status (without pagination)
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AddressCityDTO>> getAddressCitiesByStatusList(@PathVariable String status) {
        try {
            List<AddressCityDTO> cities = addressCityService.getAddressCitiesByStatus(status);
            return ResponseEntity.ok(cities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get address city by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<AddressCityDTO> getAddressCityById(@PathVariable Integer id) {
        try {
            Optional<AddressCityDTO> city = addressCityService.findById(id);
            return city.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get address cities by zone ID
     */
    @GetMapping("/zone/{zoneId}")
    public ResponseEntity<List<AddressCityDTO>> getAddressCitiesByZoneId(@PathVariable Integer zoneId) {
        try {
            List<AddressCityDTO> cities = addressCityService.getAddressCitiesByZoneId(zoneId);
            return ResponseEntity.ok(cities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new address city
     */
    @PostMapping
    public ResponseEntity<?> createAddressCity(@Valid @RequestBody AddressCityDTO addressCityDTO) {
        try {
            AddressCity createdCity = addressCityService.createAddressCity(addressCityDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCity);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create address city"));
        }
    }

    /**
     * Update an existing address city
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddressCity(@PathVariable Integer id, 
                                              @Valid @RequestBody AddressCityDTO addressCityDTO) {
        try {
            AddressCity updatedCity = addressCityService.updateAddressCity(id, addressCityDTO);
            return ResponseEntity.ok(updatedCity);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update address city"));
        }
    }

    /**
     * Activate an address city
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateAddressCity(@PathVariable Integer id) {
        try {
            addressCityService.activateAddressCity(id);
            return ResponseEntity.ok(Map.of("message", "Address city activated successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to activate address city"));
        }
    }

    /**
     * Deactivate an address city (soft delete)
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateAddressCity(@PathVariable Integer id,
                                                  @RequestBody(required = false) Map<String, String> payload) {
        try {
            String remark = payload != null ? payload.get("remark") : "";
            addressCityService.deactivateAddressCity(id, remark);
            return ResponseEntity.ok(Map.of("message", "Address city deactivated successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to deactivate address city"));
        }
    }

    /**
     * Permanently delete an address city
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddressCity(@PathVariable Integer id) {
        try {
            addressCityService.deleteAddressCity(id);
            return ResponseEntity.ok(Map.of("message", "Address city deleted successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to delete address city"));
        }
    }

    /**
     * Check if city code exists
     */
    @GetMapping("/exists/code/{cityCode}")
    public ResponseEntity<Map<String, Boolean>> checkCityCodeExists(@PathVariable String cityCode) {
        try {
            boolean exists = addressCityService.existsByCityCode(cityCode);
            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Check if city name exists
     */
    @GetMapping("/exists/name/{cityName}")
    public ResponseEntity<Map<String, Boolean>> checkCityNameExists(@PathVariable String cityName) {
        try {
            boolean exists = addressCityService.existsByCityName(cityName);
            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get city statistics by zone
     */
    @GetMapping("/stats/zone/{zoneId}")
    public ResponseEntity<Map<String, Long>> getCityStatsByZone(@PathVariable Integer zoneId) {
        try {
            Long totalCities = addressCityService.countCitiesByZone(zoneId);
            Long activeCities = addressCityService.countActiveCitiesByZone(zoneId);
            
            return ResponseEntity.ok(Map.of(
                "totalCities", totalCities,
                "activeCities", activeCities,
                "inactiveCities", totalCities - activeCities
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get city statistics by state
     */
    @GetMapping("/stats/state/{stateId}")
    public ResponseEntity<Map<String, Long>> getCityStatsByState(@PathVariable Integer stateId) {
        try {
            Long totalCities = addressCityService.countCitiesByState(stateId);
            Long activeCities = addressCityService.countActiveCitiesByState(stateId);
            
            return ResponseEntity.ok(Map.of(
                "totalCities", totalCities,
                "activeCities", activeCities,
                "inactiveCities", totalCities - activeCities
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
