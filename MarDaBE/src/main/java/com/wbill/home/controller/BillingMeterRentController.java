package com.wbill.home.controller;

import com.wbill.home.dto.BillingMeterRentDTO;
import com.wbill.home.dto.BillingMeterRentCreateDTO;
import com.wbill.home.model.BillingMeterRent;
import com.wbill.home.model.BillingCustomerType;
import com.wbill.home.model.BillingMeterSize;
import com.wbill.home.service.BillingMeterRentService;
import com.wbill.home.repository.BillingCustomerTypeRepository;
import com.wbill.home.repository.BillingMeterSizeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/api/card_managenment/billing-meter-rents")
@CrossOrigin(origins = "*")
public class BillingMeterRentController {

    @Autowired
    private BillingMeterRentService meterRentService;
    
    @Autowired
    private BillingCustomerTypeRepository customerTypeRepository;
    
    @Autowired
    private BillingMeterSizeRepository meterSizeRepository;

    // Get all meter rents
    @GetMapping("/all")

    public ResponseEntity<List<BillingMeterRentDTO>> getAllMeterRents() {
        try {
            List<BillingMeterRent> meterRents = meterRentService.getAllMeterRents();
            List<BillingMeterRentDTO> meterRentDTOs = meterRents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(meterRentDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get meter rents by status with pagination
    @GetMapping("/status/{status}")

    public ResponseEntity<Page<BillingMeterRentDTO>> getMeterRentsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<BillingMeterRent> meterRentPage = meterRentService.getMeterRentsByStatus(status, page, size);
            Page<BillingMeterRentDTO> meterRentDTOPage = meterRentPage.map(this::convertToDTO);
            return ResponseEntity.ok(meterRentDTOPage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get meter rent by ID
    @GetMapping("/{id}")

    public ResponseEntity<BillingMeterRentDTO> getMeterRentById(@PathVariable Integer id) {
        try {
            Optional<BillingMeterRent> meterRentOpt = meterRentService.getMeterRentById(id);
            if (meterRentOpt.isPresent()) {
                BillingMeterRentDTO meterRentDTO = convertToDTO(meterRentOpt.get());
                return ResponseEntity.ok(meterRentDTO);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create new meter rent
    @PostMapping
    
    public ResponseEntity<?> createMeterRent(@Valid @RequestBody BillingMeterRentCreateDTO createDTO) {
        try {
            BillingMeterRent meterRent = convertFromCreateDTO(createDTO);
            BillingMeterRent savedMeterRent = meterRentService.createMeterRent(meterRent);
            BillingMeterRentDTO responseDTO = convertToDTO(savedMeterRent);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while creating the meter rent"));
        }
    }

    // Update existing meter rent
    @PutMapping("/{id}")
    
    public ResponseEntity<?> updateMeterRent(@PathVariable Integer id, 
                                           @Valid @RequestBody BillingMeterRentCreateDTO updateDTO) {
        try {
            BillingMeterRent meterRent = convertFromCreateDTO(updateDTO);
            BillingMeterRent updatedMeterRent = meterRentService.updateMeterRent(id, meterRent);
            BillingMeterRentDTO responseDTO = convertToDTO(updatedMeterRent);
            return ResponseEntity.ok(responseDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while updating the meter rent"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while updating the meter rent"));
        }
    }

    // Deactivate meter rent
    @PostMapping("/{id}/deactivate")
    
    public ResponseEntity<?> deactivateMeterRent(@PathVariable Integer id, 
                                               @RequestBody(required = false) DeactivateRequest request) {
        try {
            String remark = (request != null) ? request.getRemark() : "";
            BillingMeterRent deactivatedMeterRent = meterRentService.deactivateMeterRent(id, remark);
            BillingMeterRentDTO responseDTO = convertToDTO(deactivatedMeterRent);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while deactivating the meter rent"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while deactivating the meter rent"));
        }
    }

    // Activate meter rent
    @PostMapping("/{id}/activate")
    
    public ResponseEntity<?> activateMeterRent(@PathVariable Integer id) {
        try {
            BillingMeterRent activatedMeterRent = meterRentService.activateMeterRent(id);
            BillingMeterRentDTO responseDTO = convertToDTO(activatedMeterRent);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while activating the meter rent"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while activating the meter rent"));
        }
    }

    // Get meter rent statistics
    @GetMapping("/statistics")

    public ResponseEntity<BillingMeterRentService.MeterRentStatistics> getMeterRentStatistics() {
        try {
            BillingMeterRentService.MeterRentStatistics stats = meterRentService.getMeterRentStatistics();
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

    // Get active meter sizes for dropdown
    @GetMapping("/meter-sizes")

    public ResponseEntity<List<BillingMeterSize>> getActiveMeterSizes() {
        try {
            List<BillingMeterSize> meterSizes = meterSizeRepository.findAllActive();
            return ResponseEntity.ok(meterSizes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Helper method to convert entity to DTO
    private BillingMeterRentDTO convertToDTO(BillingMeterRent meterRent) {
        return new BillingMeterRentDTO(
            meterRent.getId(),
            meterRent.getBillingCustomerType() != null ? meterRent.getBillingCustomerType().getId() : null,
            meterRent.getBillingCustomerType() != null ? meterRent.getBillingCustomerType().getCustomerType() : null,
            meterRent.getBillingMeterSize() != null ? meterRent.getBillingMeterSize().getId() : null,
            meterRent.getBillingMeterSize() != null ? meterRent.getBillingMeterSize().getMeterCode() : null,
            meterRent.getBillingMeterSize() != null ? meterRent.getBillingMeterSize().getMeterSize() : null,
            meterRent.getRentBirr(),
            meterRent.getStatus()
        );
    }

    // Helper method to convert create DTO to entity
    private BillingMeterRent convertFromCreateDTO(BillingMeterRentCreateDTO createDTO) {
        BillingMeterRent meterRent = new BillingMeterRent();
        
        // Set customer type
        BillingCustomerType customerType = new BillingCustomerType();
        customerType.setId(createDTO.getBillingCustomerTypeId());
        meterRent.setBillingCustomerType(customerType);
        
        // Set meter size
        BillingMeterSize meterSize = new BillingMeterSize();
        meterSize.setId(createDTO.getMeterSizeId());
        meterRent.setBillingMeterSize(meterSize);
        
        meterRent.setRentBirr(createDTO.getRentBirr());
        
        return meterRent;
    }

    // Inner classes for request/response handling
    public static class DeactivateRequest {
        private String remark;

        public String getRemark() {
            return remark;
        }

        public void setRemark(String remark) {
            this.remark = remark;
        }
    }

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
}
