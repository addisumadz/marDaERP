package com.wbill.home.controller;

import com.wbill.home.dto.BillingMeterSizeCreateDTO;
import com.wbill.home.dto.BillingMeterSizeDTO;
import com.wbill.home.model.BillingMeterSize;
import com.wbill.home.service.BillingMeterSizeService;
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
@RequestMapping("/api/mardaerp/billing-meter-sizes")
@CrossOrigin(origins = "*")
public class BillingMeterSizeController {

    @Autowired
    private BillingMeterSizeService meterSizeService;

    // Get all meter sizes
    @GetMapping("/all")
    public ResponseEntity<List<BillingMeterSizeDTO>> getAllMeterSizes() {
        try {
            List<BillingMeterSize> meterSizes = meterSizeService.getAllMeterSizes();
            List<BillingMeterSizeDTO> meterSizeDTOs = meterSizes.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(meterSizeDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get meter sizes by status with pagination
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<BillingMeterSizeDTO>> getMeterSizesByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<BillingMeterSize> meterSizePage = meterSizeService.getMeterSizesByStatus(status, pageable);
            Page<BillingMeterSizeDTO> meterSizeDTOPage = meterSizePage.map(this::convertToDTO);
            return ResponseEntity.ok(meterSizeDTOPage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get meter size by ID
    @GetMapping("/{id}")
    public ResponseEntity<BillingMeterSizeDTO> getMeterSizeById(@PathVariable Integer id) {
        try {
            Optional<BillingMeterSize> meterSizeOpt = meterSizeService.getMeterSizeById(id);
            if (meterSizeOpt.isPresent()) {
                BillingMeterSizeDTO meterSizeDTO = convertToDTO(meterSizeOpt.get());
                return ResponseEntity.ok(meterSizeDTO);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create new meter size
    @PostMapping
    public ResponseEntity<?> createMeterSize(@Valid @RequestBody BillingMeterSizeCreateDTO createDTO) {
        try {
            BillingMeterSize meterSize = convertFromCreateDTO(createDTO);
            BillingMeterSize createdMeterSize = meterSizeService.createMeterSize(meterSize);
            BillingMeterSizeDTO responseDTO = convertToDTO(createdMeterSize);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while creating the meter size"));
        }
    }

    // Update existing meter size
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMeterSize(@PathVariable Integer id, 
                                           @Valid @RequestBody BillingMeterSizeCreateDTO updateDTO) {
        try {
            BillingMeterSize meterSize = convertFromCreateDTO(updateDTO);
            BillingMeterSize updatedMeterSize = meterSizeService.updateMeterSize(id, meterSize);
            BillingMeterSizeDTO responseDTO = convertToDTO(updatedMeterSize);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while updating the meter size"));
        }
    }

    // Deactivate meter size
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateMeterSize(@PathVariable Integer id, 
                                               @RequestBody(required = false) DeactivateRequest request) {
        try {
            BillingMeterSize deactivatedMeterSize = meterSizeService.deactivateMeterSize(id);
            BillingMeterSizeDTO responseDTO = convertToDTO(deactivatedMeterSize);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while deactivating the meter size"));
        }
    }

    // Activate meter size
    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activateMeterSize(@PathVariable Integer id) {
        try {
            BillingMeterSize activatedMeterSize = meterSizeService.activateMeterSize(id);
            BillingMeterSizeDTO responseDTO = convertToDTO(activatedMeterSize);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while activating the meter size"));
        }
    }

    // Get meter size statistics
    @GetMapping("/statistics")
    public ResponseEntity<BillingMeterSizeService.MeterSizeStatistics> getMeterSizeStatistics() {
        try {
            BillingMeterSizeService.MeterSizeStatistics stats = meterSizeService.getMeterSizeStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Helper method to convert entity to DTO
    private BillingMeterSizeDTO convertToDTO(BillingMeterSize meterSize) {
        return new BillingMeterSizeDTO(
                meterSize.getId(),
                meterSize.getMeterSize(),
                meterSize.getMeterCode(),
                meterSize.getDeleted()
        );
    }

    // Helper method to convert CreateDTO to entity
    private BillingMeterSize convertFromCreateDTO(BillingMeterSizeCreateDTO createDTO) {
        BillingMeterSize meterSize = new BillingMeterSize();
        meterSize.setMeterSize(createDTO.getMeterSize());
        meterSize.setMeterCode(createDTO.getMeterCode());
        return meterSize;
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
