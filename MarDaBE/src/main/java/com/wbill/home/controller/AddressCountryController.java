package com.wbill.home.controller;

import com.wbill.home.dto.AddressCountryDTO;
import com.wbill.home.model.AddressCountry;
import com.wbill.home.service.AddressCountryService;

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
@RequestMapping("/api/card_managenment/address-countries")
@CrossOrigin(origins = "*")
public class AddressCountryController {

    @Autowired
    private AddressCountryService addressCountryService;

    /**
     * Get all address countries
     */
    @GetMapping("/all")
    public ResponseEntity<List<AddressCountryDTO>> getAllAddressCountries() {
        List<AddressCountryDTO> countries = addressCountryService.getAllAddressCountries();
        return ResponseEntity.ok(countries);
    }

    /**
     * Get address countries by status with pagination
     */
    @GetMapping("/by-status/{status}")
    public ResponseEntity<Page<AddressCountryDTO>> getAddressCountriesByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<AddressCountryDTO> countries = addressCountryService.findByStatusPaginated(status, pageable);
        return ResponseEntity.ok(countries);
    }

    /**
     * Get address countries by status (without pagination)
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AddressCountryDTO>> getAddressCountriesByStatusList(@PathVariable String status) {
        List<AddressCountryDTO> countries = addressCountryService.getAddressCountriesByStatus(status);
        return ResponseEntity.ok(countries);
    }

    /**
     * Get address country by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<AddressCountryDTO> getAddressCountryById(@PathVariable Integer id) {
        Optional<AddressCountryDTO> country = addressCountryService.findById(id);
        return country.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new address country
     */
    @PostMapping
    public ResponseEntity<?> createAddressCountry(@RequestBody AddressCountryDTO countryDTO) {
        try {
            AddressCountry newCountry = addressCountryService.createAddressCountry(countryDTO);
            return new ResponseEntity<>(newCountry, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error creating address country: " + e.getMessage());
        }
    }

    /**
     * Update an existing address country
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddressCountry(@PathVariable Integer id, @RequestBody AddressCountryDTO countryDTO) {
        try {
            AddressCountry updatedCountry = addressCountryService.updateAddressCountry(id, countryDTO);
            return ResponseEntity.ok(updatedCountry);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error updating address country: " + e.getMessage());
        }
    }

    /**
     * Activate an address country
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateAddressCountry(@PathVariable Integer id) {
        try {
            addressCountryService.activateAddressCountry(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error activating address country: " + e.getMessage());
        }
    }

    /**
     * Deactivate an address country (soft delete)
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateAddressCountry(@PathVariable Integer id, @RequestBody(required = false) String remark) {
        try {
            addressCountryService.deactivateAddressCountry(id, remark);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error deactivating address country: " + e.getMessage());
        }
    }

    /**
     * Permanently delete an address country
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddressCountry(@PathVariable Integer id) {
        try {
            addressCountryService.deleteAddressCountry(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error deleting address country: " + e.getMessage());
        }
    }


    /**
     * Get address countries by continent
     */
    @GetMapping("/continent/{continent}")
    public ResponseEntity<List<AddressCountry>> getAddressCountriesByContinent(@PathVariable String continent) {
        List<AddressCountry> countries = addressCountryService.getAddressCountriesByContinent(continent);
        return ResponseEntity.ok(countries);
    }

    /**
     * Get address countries by status and continent
     */
    @GetMapping("/status/{status}/continent/{continent}")
    public ResponseEntity<List<AddressCountry>> getAddressCountriesByStatusAndContinent(
            @PathVariable String status, @PathVariable String continent) {
        List<AddressCountry> countries = addressCountryService.getAddressCountriesByStatusAndContinent(status, continent);
        return ResponseEntity.ok(countries);
    }

    /**
     * Check if country code exists
     */
    @GetMapping("/exists/code/{countryCode}")
    public ResponseEntity<Boolean> existsByCountryCode(@PathVariable String countryCode) {
        boolean exists = addressCountryService.existsByCountryCode(countryCode);
        return ResponseEntity.ok(exists);
    }

    /**
     * Check if country name exists
     */
    @GetMapping("/exists/name/{countryName}")
    public ResponseEntity<Boolean> existsByCountryName(@PathVariable String countryName) {
        boolean exists = addressCountryService.existsByCountryName(countryName);
        return ResponseEntity.ok(exists);
    }

    /**
     * Find address country by country code
     */
    @GetMapping("/code/{countryCode}")
    public ResponseEntity<AddressCountry> findByCountryCode(@PathVariable String countryCode) {
        Optional<AddressCountry> country = addressCountryService.findByCountryCode(countryCode);
        return country.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Find address country by country name
     */
    @GetMapping("/name/{countryName}")
    public ResponseEntity<AddressCountry> findByCountryName(@PathVariable String countryName) {
        Optional<AddressCountry> country = addressCountryService.findByCountryName(countryName);
        return country.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all address countries ordered by name
     */
    @GetMapping("/ordered")
    public ResponseEntity<List<AddressCountry>> getAllAddressCountriesOrderedByName() {
        List<AddressCountry> countries = addressCountryService.getAllAddressCountriesOrderedByName();
        return ResponseEntity.ok(countries);
    }
}
