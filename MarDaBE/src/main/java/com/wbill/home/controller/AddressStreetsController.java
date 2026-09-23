package com.wbill.home.controller;

import com.wbill.home.dto.AddressStreetsCreateDTO;
import com.wbill.home.dto.AddressStreetsDTO;
import com.wbill.home.model.AddressCity;
import com.wbill.home.model.AddressStreets;
import com.wbill.home.repository.AddressCityRepository;
import com.wbill.home.service.AddressStreetsService;

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
@RequestMapping("/api/mardaerp/address-streets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AddressStreetsController {

    @Autowired
    private AddressStreetsService addressStreetsService;

    @Autowired
    private AddressCityRepository addressCityRepository;

    // Get all streets
    @GetMapping("/all")
    public ResponseEntity<List<AddressStreetsDTO>> getAllAddressStreets() {
        try {
            List<AddressStreets> streets = addressStreetsService.getAllAddressStreets();
            List<AddressStreetsDTO> streetDTOs = streets.stream()
                    .map(AddressStreetsDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(streetDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get streets by status with pagination
    @GetMapping("/by-status/{status}")
    public ResponseEntity<Page<AddressStreetsDTO>> getAddressStreetsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<AddressStreets> streets = addressStreetsService.getAddressStreetsByStatus(status, page, size);
            Page<AddressStreetsDTO> streetDTOs = streets.map(AddressStreetsDTO::new);
            return ResponseEntity.ok(streetDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get street by ID
    @GetMapping("/{id}")
    public ResponseEntity<AddressStreetsDTO> getAddressStreetById(@PathVariable Integer id) {
        try {
            Optional<AddressStreets> street = addressStreetsService.getAddressStreetById(id);
            if (street.isPresent()) {
                return ResponseEntity.ok(new AddressStreetsDTO(street.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get streets by city ID
    @GetMapping("/city/{cityId}")
    public ResponseEntity<List<AddressStreetsDTO>> getStreetsByCityId(@PathVariable Integer cityId) {
        try {
            List<AddressStreets> streets = addressStreetsService.getStreetsByCityId(cityId);
            List<AddressStreetsDTO> streetDTOs = streets.stream()
                    .map(AddressStreetsDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(streetDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create new street
    @PostMapping
    public ResponseEntity<?> createAddressStreet(@RequestBody AddressStreetsCreateDTO streetCreateDTO) {
        try {
            // Convert DTO to entity
            AddressStreets addressStreet = new AddressStreets();
            addressStreet.setStreetsCode(streetCreateDTO.getStreetsCode());
            addressStreet.setStreetsName(streetCreateDTO.getStreetsName());
            addressStreet.setAddressStreetsNumber(streetCreateDTO.getAddressStreetsNumber());
            addressStreet.setPopulationSize(streetCreateDTO.getPopulationSize());
            
            // Set city
            Optional<AddressCity> cityOpt = addressCityRepository.findById(streetCreateDTO.getCityId());
            if (!cityOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "City not found"));
            }
            addressStreet.setAddressCity(cityOpt.get());
            
            AddressStreets createdStreet = addressStreetsService.createAddressStreet(addressStreet);
            return ResponseEntity.status(HttpStatus.CREATED).body(new AddressStreetsDTO(createdStreet));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while creating the street"));
        }
    }

    // Update existing street
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddressStreet(@PathVariable Integer id, @RequestBody AddressStreetsCreateDTO streetUpdateDTO) {
        try {
            // Convert DTO to entity
            AddressStreets addressStreet = new AddressStreets();
            addressStreet.setStreetsCode(streetUpdateDTO.getStreetsCode());
            addressStreet.setStreetsName(streetUpdateDTO.getStreetsName());
            addressStreet.setAddressStreetsNumber(streetUpdateDTO.getAddressStreetsNumber());
            addressStreet.setPopulationSize(streetUpdateDTO.getPopulationSize());
            
            // Set city
            Optional<AddressCity> cityOpt = addressCityRepository.findById(streetUpdateDTO.getCityId());
            if (!cityOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "City not found"));
            }
            addressStreet.setAddressCity(cityOpt.get());
            
            AddressStreets updatedStreet = addressStreetsService.updateAddressStreet(id, addressStreet);
            return ResponseEntity.ok(new AddressStreetsDTO(updatedStreet));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while updating the street"));
        }
    }

    // Activate street
    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateAddressStreet(@PathVariable Integer id) {
        try {
            AddressStreets activatedStreet = addressStreetsService.activateAddressStreet(id);
            return ResponseEntity.ok(new AddressStreetsDTO(activatedStreet));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while activating the street"));
        }
    }

    // Deactivate street (soft delete)
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateAddressStreet(@PathVariable Integer id, @RequestBody(required = false) Map<String, String> request) {
        try {
            String remark = request != null ? request.get("remark") : "";
            AddressStreets deactivatedStreet = addressStreetsService.deactivateAddressStreet(id, remark);
            return ResponseEntity.ok(new AddressStreetsDTO(deactivatedStreet));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while deactivating the street"));
        }
    }

    // Delete street permanently
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddressStreet(@PathVariable Integer id) {
        try {
            addressStreetsService.deleteAddressStreet(id);
            return ResponseEntity.ok(Map.of("message", "Street deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while deleting the street"));
        }
    }

    // Check if street code exists
    @GetMapping("/exists/code/{streetCode}")
    public ResponseEntity<Boolean> checkStreetCodeExists(@PathVariable String streetCode) {
        try {
            boolean exists = addressStreetsService.checkStreetCodeExists(streetCode);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Check if street name exists in city
    @GetMapping("/exists/name/{streetName}/city/{cityId}")
    public ResponseEntity<Boolean> checkStreetNameExistsInCity(@PathVariable String streetName, @PathVariable Integer cityId) {
        try {
            boolean exists = addressStreetsService.checkStreetNameExistsInCity(streetName, cityId);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get street statistics by city
    @GetMapping("/stats/city/{cityId}")
    public ResponseEntity<AddressStreetsService.StreetStatistics> getStreetStatsByCity(@PathVariable Integer cityId) {
        try {
            AddressStreetsService.StreetStatistics stats = addressStreetsService.getStreetStatsByCity(cityId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get active streets
    @GetMapping("/active")
    public ResponseEntity<List<AddressStreetsDTO>> getActiveStreets() {
        try {
            List<AddressStreets> streets = addressStreetsService.getActiveStreets();
            List<AddressStreetsDTO> streetDTOs = streets.stream()
                    .map(AddressStreetsDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(streetDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get inactive streets
    @GetMapping("/inactive")
    public ResponseEntity<List<AddressStreetsDTO>> getInactiveStreets() {
        try {
            List<AddressStreets> streets = addressStreetsService.getInactiveStreets();
            List<AddressStreetsDTO> streetDTOs = streets.stream()
                    .map(AddressStreetsDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(streetDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get deleted streets
    @GetMapping("/deleted")
    public ResponseEntity<List<AddressStreetsDTO>> getDeletedStreets() {
        try {
            List<AddressStreets> streets = addressStreetsService.getDeletedStreets();
            List<AddressStreetsDTO> streetDTOs = streets.stream()
                    .map(AddressStreetsDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(streetDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
