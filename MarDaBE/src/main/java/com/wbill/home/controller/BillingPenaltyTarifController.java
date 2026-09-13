package com.wbill.home.controller;

import com.wbill.home.dto.BillingPenaltyTarifCreateDTO;
import com.wbill.home.dto.BillingPenaltyTarifDTO;
import com.wbill.home.model.BillingPenaltyTarif;
import com.wbill.home.model.BillingCustomerType;
import com.wbill.home.service.BillingPenaltyTarifService;
import com.wbill.home.repository.BillingCustomerTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/card_managenment/billing-penalty-tarifs")
@CrossOrigin(origins = "*")
public class BillingPenaltyTarifController {

    @Autowired
    private BillingPenaltyTarifService penaltyTarifService;

    @Autowired
    private BillingCustomerTypeRepository customerTypeRepository;

    // Get all penalty tarifs
    @GetMapping("/all")
    public ResponseEntity<List<BillingPenaltyTarifDTO>> getAllPenaltyTarifs() {
        try {
            List<BillingPenaltyTarif> penaltyTarifs = penaltyTarifService.getAllPenaltyTarifs();
            List<BillingPenaltyTarifDTO> penaltyTarifDTOs = penaltyTarifs.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(penaltyTarifDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get penalty tarifs by status with pagination
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<BillingPenaltyTarifDTO>> getPenaltyTarifsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<BillingPenaltyTarif> penaltyTarifPage = penaltyTarifService.getPenaltyTarifsByStatus(status, pageable);
            Page<BillingPenaltyTarifDTO> penaltyTarifDTOPage = penaltyTarifPage.map(this::convertToDTO);
            return ResponseEntity.ok(penaltyTarifDTOPage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get penalty tarif by ID
    @GetMapping("/{id}")
    public ResponseEntity<BillingPenaltyTarifDTO> getPenaltyTarifById(@PathVariable Integer id) {
        try {
            Optional<BillingPenaltyTarif> penaltyTarifOpt = penaltyTarifService.getPenaltyTarifById(id);
            if (penaltyTarifOpt.isPresent()) {
                BillingPenaltyTarifDTO penaltyTarifDTO = convertToDTO(penaltyTarifOpt.get());
                return ResponseEntity.ok(penaltyTarifDTO);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create new penalty tarif
    @PostMapping
    public ResponseEntity<?> createPenaltyTarif(@Valid @RequestBody BillingPenaltyTarifCreateDTO createDTO) {
        try {
            BillingPenaltyTarif penaltyTarif = convertFromCreateDTO(createDTO);
            BillingPenaltyTarif createdPenaltyTarif = penaltyTarifService.createPenaltyTarif(penaltyTarif);
            BillingPenaltyTarifDTO responseDTO = convertToDTO(createdPenaltyTarif);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while creating the penalty tarif"));
        }
    }

    // Update existing penalty tarif
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePenaltyTarif(@PathVariable Integer id, 
                                              @Valid @RequestBody BillingPenaltyTarifCreateDTO updateDTO) {
        try {
            BillingPenaltyTarif penaltyTarif = convertFromCreateDTO(updateDTO);
            BillingPenaltyTarif updatedPenaltyTarif = penaltyTarifService.updatePenaltyTarif(id, penaltyTarif);
            BillingPenaltyTarifDTO responseDTO = convertToDTO(updatedPenaltyTarif);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while updating the penalty tarif"));
        }
    }

    // Deactivate penalty tarif
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivatePenaltyTarif(@PathVariable Integer id, 
                                                  @RequestBody(required = false) DeactivateRequest request) {
        try {
            BillingPenaltyTarif deactivatedPenaltyTarif = penaltyTarifService.deactivatePenaltyTarif(id);
            BillingPenaltyTarifDTO responseDTO = convertToDTO(deactivatedPenaltyTarif);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while deactivating the penalty tarif"));
        }
    }

    // Activate penalty tarif
    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activatePenaltyTarif(@PathVariable Integer id) {
        try {
            BillingPenaltyTarif activatedPenaltyTarif = penaltyTarifService.activatePenaltyTarif(id);
            BillingPenaltyTarifDTO responseDTO = convertToDTO(activatedPenaltyTarif);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while activating the penalty tarif"));
        }
    }

    // Get penalty tarif statistics
    @GetMapping("/statistics")
    public ResponseEntity<BillingPenaltyTarifService.PenaltyTarifStatistics> getPenaltyTarifStatistics() {
        try {
            BillingPenaltyTarifService.PenaltyTarifStatistics stats = penaltyTarifService.getPenaltyTarifStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get active customer types for dropdown
    @GetMapping("/customer-types")
    public ResponseEntity<List<BillingCustomerType>> getActiveCustomerTypes() {
        try {
            List<BillingCustomerType> customerTypes = customerTypeRepository.findAllActive();
            return ResponseEntity.ok(customerTypes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Helper method to convert entity to DTO
    private BillingPenaltyTarifDTO convertToDTO(BillingPenaltyTarif penaltyTarif) {
        return new BillingPenaltyTarifDTO(
                penaltyTarif.getId(),
                penaltyTarif.getBillingCustomerType() != null ? penaltyTarif.getBillingCustomerType().getId() : null,
                penaltyTarif.getBillingCustomerType() != null ? penaltyTarif.getBillingCustomerType().getCustomerType() : null,
                penaltyTarif.getIsPercent(),
                penaltyTarif.getPenalityBirr(),
                penaltyTarif.getAdditionalPenalty(),
                penaltyTarif.getNumberOfMonth(),
                penaltyTarif.getBewerBzatYbaza(),
                penaltyTarif.getWeruLayDemr(),
                penaltyTarif.getEnaKezihBelay(),
                penaltyTarif.getDeleted()
        );
    }

    // Helper method to convert CreateDTO to entity
    private BillingPenaltyTarif convertFromCreateDTO(BillingPenaltyTarifCreateDTO createDTO) {
        BillingPenaltyTarif penaltyTarif = new BillingPenaltyTarif();
        
        // Set customer type
        BillingCustomerType customerType = new BillingCustomerType();
        customerType.setId(createDTO.getCustomerTypeId());
        penaltyTarif.setBillingCustomerType(customerType);
        
        penaltyTarif.setIsPercent(createDTO.getIsPercent());
        penaltyTarif.setPenalityBirr(createDTO.getPenalityBirr());
        penaltyTarif.setAdditionalPenalty(createDTO.getAdditionalPenalty());
        penaltyTarif.setNumberOfMonth(createDTO.getNumberOfMonth());
        penaltyTarif.setBewerBzatYbaza(createDTO.getBewerBzatYbaza());
        penaltyTarif.setWeruLayDemr(createDTO.getWeruLayDemr());
        penaltyTarif.setEnaKezihBelay(createDTO.getEnaKezihBelay());
        
        return penaltyTarif;
    }

    // Error response class
    public static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    // Deactivate request class
    public static class DeactivateRequest {
        private String remark;

        public String getRemark() {
            return remark;
        }

        public void setRemark(String remark) {
            this.remark = remark;
        }
    }
}
