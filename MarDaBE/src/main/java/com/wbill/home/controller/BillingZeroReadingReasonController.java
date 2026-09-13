package com.wbill.home.controller;

import com.wbill.home.dto.BillingZeroReadingReasonCreateDTO;
import com.wbill.home.dto.BillingZeroReadingReasonDTO;
import com.wbill.home.model.BillingZeroReadingReason;
import com.wbill.home.service.BillingZeroReadingReasonService;
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
@RequestMapping("/api/card_managenment/billing-zero-reading-reasons")
@CrossOrigin(origins = "*")
public class BillingZeroReadingReasonController {

    @Autowired
    private BillingZeroReadingReasonService service;

    // Get all reasons
    @GetMapping("/all")
    public ResponseEntity<List<BillingZeroReadingReasonDTO>> getAllReasons() {
        try {
            List<BillingZeroReadingReason> list = service.getAllReasons();
            List<BillingZeroReadingReasonDTO> dtos = list.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get by status with pagination
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<BillingZeroReadingReasonDTO>> getByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<BillingZeroReadingReason> pageData = service.getReasonsByStatus(status, pageable);
            return ResponseEntity.ok(pageData.map(this::toDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get by ID
    @GetMapping("/{id}")
    public ResponseEntity<BillingZeroReadingReasonDTO> getById(@PathVariable Integer id) {
        try {
            Optional<BillingZeroReadingReason> opt = service.getReasonById(id);
            if (opt.isPresent()) {
                return ResponseEntity.ok(toDTO(opt.get()));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody BillingZeroReadingReasonCreateDTO createDTO) {
        try {
            BillingZeroReadingReason entity = fromCreateDTO(createDTO);
            BillingZeroReadingReason created = service.createReason(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while creating the zero reading reason"));
        }
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id,
                                    @Valid @RequestBody BillingZeroReadingReasonCreateDTO updateDTO) {
        try {
            BillingZeroReadingReason entity = fromCreateDTO(updateDTO);
            BillingZeroReadingReason updated = service.updateReason(id, entity);
            return ResponseEntity.ok(toDTO(updated));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while updating the zero reading reason"));
        }
    }

    // Deactivate (soft delete)
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Integer id,
                                        @RequestBody(required = false) DeactivateRequest request) {
        try {
            BillingZeroReadingReason deactivated = service.deactivateReason(id);
            return ResponseEntity.ok(toDTO(deactivated));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while deactivating the zero reading reason"));
        }
    }

    // Activate
    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable Integer id) {
        try {
            BillingZeroReadingReason activated = service.activateReason(id);
            return ResponseEntity.ok(toDTO(activated));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while activating the zero reading reason"));
        }
    }

    // Statistics
    @GetMapping("/statistics")
    public ResponseEntity<BillingZeroReadingReasonService.ReasonStatistics> statistics() {
        try {
            return ResponseEntity.ok(service.getReasonStatistics());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Helpers
    private BillingZeroReadingReasonDTO toDTO(BillingZeroReadingReason r) {
        return new BillingZeroReadingReasonDTO(
                r.getId(),
                r.getReasonCode(),
                r.getReasonName(),
                r.getIsZeroReadingReason(),
                r.getIsDoorCloseReason(),
                r.getDeleted()
        );
    }

    private BillingZeroReadingReason fromCreateDTO(BillingZeroReadingReasonCreateDTO dto) {
        BillingZeroReadingReason r = new BillingZeroReadingReason();
        r.setReasonCode(dto.getReasonCode());
        r.setReasonName(dto.getReasonName());
        r.setIsZeroReadingReason(dto.isZeroReadingReason());
        r.setIsDoorCloseReason(dto.isDoorCloseReason());
        // others will be zeroed by service
        return r;
    }

    // Error response class
    public static class ErrorResponse {
        private String message;
        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    // Deactivate request class
    public static class DeactivateRequest {
        private String remark;
        public String getRemark() { return remark; }
        public void setRemark(String remark) { this.remark = remark; }
    }
}
