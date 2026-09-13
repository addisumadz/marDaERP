package com.wbill.home.controller;

import com.wbill.home.dto.BillingCustomerTypeDTO;
import com.wbill.home.dto.BillingCustomerTypeCreateDTO;
import com.wbill.home.model.BillingCustomerType;
import com.wbill.home.service.BillingCustomerTypeService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/card_managenment/billing-customer-types")
@CrossOrigin(origins = "*")
public class BillingCustomerTypeController {

    @Autowired
    private BillingCustomerTypeService customerTypeService;

    // Get all customer types
    @GetMapping("/all")
    public ResponseEntity<List<BillingCustomerTypeDTO>> getAllCustomerTypes() {
        try {
            List<BillingCustomerType> customerTypes = customerTypeService.getAllCustomerTypes();
            List<BillingCustomerTypeDTO> customerTypeDTOs = customerTypes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(customerTypeDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get customer types by status with pagination
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<BillingCustomerTypeDTO>> getCustomerTypesByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<BillingCustomerType> customerTypePage = customerTypeService.getCustomerTypesByStatus(status, page, size);
            Page<BillingCustomerTypeDTO> customerTypeDTOPage = customerTypePage.map(this::convertToDTO);
            return ResponseEntity.ok(customerTypeDTOPage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get customer type by ID
    @GetMapping("/{id}")
    public ResponseEntity<BillingCustomerTypeDTO> getCustomerTypeById(@PathVariable Integer id) {
        try {
            Optional<BillingCustomerType> customerTypeOpt = customerTypeService.getCustomerTypeById(id);
            if (customerTypeOpt.isPresent()) {
                BillingCustomerTypeDTO customerTypeDTO = convertToDTO(customerTypeOpt.get());
                return ResponseEntity.ok(customerTypeDTO);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create new customer type
    @PostMapping
    public ResponseEntity<?> createCustomerType(@Valid @RequestBody BillingCustomerTypeCreateDTO createDTO) {
        try {
            BillingCustomerType customerType = convertFromCreateDTO(createDTO);
            BillingCustomerType savedCustomerType = customerTypeService.createCustomerType(customerType);
            BillingCustomerTypeDTO responseDTO = convertToDTO(savedCustomerType);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while creating the customer type"));
        }
    }

    // Update existing customer type
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomerType(@PathVariable Integer id, 
                                              @Valid @RequestBody BillingCustomerTypeCreateDTO updateDTO) {
        try {
            BillingCustomerType customerType = convertFromCreateDTO(updateDTO);
            BillingCustomerType updatedCustomerType = customerTypeService.updateCustomerType(id, customerType);
            BillingCustomerTypeDTO responseDTO = convertToDTO(updatedCustomerType);
            return ResponseEntity.ok(responseDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while updating the customer type"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while updating the customer type"));
        }
    }

    // Deactivate customer type
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateCustomerType(@PathVariable Integer id, 
                                                   @RequestBody(required = false) DeactivateRequest request) {
        try {
            String remark = (request != null) ? request.getRemark() : "";
            BillingCustomerType deactivatedCustomerType = customerTypeService.deactivateCustomerType(id, remark);
            BillingCustomerTypeDTO responseDTO = convertToDTO(deactivatedCustomerType);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while deactivating the customer type"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while deactivating the customer type"));
        }
    }

    // Activate customer type
    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activateCustomerType(@PathVariable Integer id) {
        try {
            BillingCustomerType activatedCustomerType = customerTypeService.activateCustomerType(id);
            BillingCustomerTypeDTO responseDTO = convertToDTO(activatedCustomerType);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while activating the customer type"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An error occurred while activating the customer type"));
        }
    }

    // Get customer type statistics
    @GetMapping("/statistics")
    public ResponseEntity<BillingCustomerTypeService.CustomerTypeStatistics> getCustomerTypeStatistics() {
        try {
            BillingCustomerTypeService.CustomerTypeStatistics stats = customerTypeService.getCustomerTypeStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Helper method to convert entity to DTO
    private BillingCustomerTypeDTO convertToDTO(BillingCustomerType customerType) {
        return new BillingCustomerTypeDTO(
            customerType.getId(),
            customerType.getCustomerType(),
            customerType.getDescription(),
            customerType.getTechemariKfya(),
            customerType.getDeleted()
        );
    }

    // Helper method to convert create DTO to entity
    private BillingCustomerType convertFromCreateDTO(BillingCustomerTypeCreateDTO createDTO) {
        BillingCustomerType customerType = new BillingCustomerType();
        customerType.setCustomerType(createDTO.getCustomerType());
        customerType.setDescription(createDTO.getDescription());
        customerType.setTechemariKfya(createDTO.getTechemariKfya());
        return customerType;
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
