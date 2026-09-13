package com.wbill.home.controller;

import com.wbill.home.dto.BillingTariffCreateDTO;
import com.wbill.home.dto.BillingTariffDTO;
import com.wbill.home.model.BillingTariff;
import com.wbill.home.model.BillingCustomerType;
import com.wbill.home.service.BillingTariffService;
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
@RequestMapping("/api/card_managenment/billing-tariffs")
@CrossOrigin(origins = "*")
public class BillingTariffController {

    @Autowired
    private BillingTariffService tariffService;

    // Get all tariffs
    @GetMapping("/all")
    public ResponseEntity<List<BillingTariffDTO>> getAllTariffs() {
        try {
            List<BillingTariff> tariffs = tariffService.getAllTariffs();
            List<BillingTariffDTO> dtos = tariffs.stream().map(this::toDTO).collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get tariffs by status with pagination
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<BillingTariffDTO>> getTariffsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<BillingTariff> tariffPage = tariffService.getTariffsByStatus(status, pageable);
            Page<BillingTariffDTO> dtoPage = tariffPage.map(this::toDTO);
            return ResponseEntity.ok(dtoPage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get by id
    @GetMapping("/{id}")
    public ResponseEntity<BillingTariffDTO> getTariffById(@PathVariable Integer id) {
        try {
            Optional<BillingTariff> tariffOpt = tariffService.getTariffById(id);
            if (tariffOpt.isPresent()) {
                return ResponseEntity.ok(toDTO(tariffOpt.get()));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create
    @PostMapping
    public ResponseEntity<?> createTariff(@Valid @RequestBody BillingTariffCreateDTO createDTO) {
        try {
            BillingTariff tariff = fromCreateDTO(createDTO);
            BillingTariff created = tariffService.createTariff(tariff);
            return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while creating the tariff"));
        }
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTariff(@PathVariable Integer id, @Valid @RequestBody BillingTariffCreateDTO updateDTO) {
        try {
            BillingTariff tariff = fromCreateDTO(updateDTO);
            BillingTariff updated = tariffService.updateTariff(id, tariff);
            return ResponseEntity.ok(toDTO(updated));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while updating the tariff"));
        }
    }

    // Deactivate
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateTariff(@PathVariable Integer id, @RequestBody(required = false) DeactivateRequest request) {
        try {
            BillingTariff deactivated = tariffService.deactivateTariff(id);
            return ResponseEntity.ok(toDTO(deactivated));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while deactivating the tariff"));
        }
    }

    // Activate
    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activateTariff(@PathVariable Integer id) {
        try {
            BillingTariff activated = tariffService.activateTariff(id);
            return ResponseEntity.ok(toDTO(activated));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while activating the tariff"));
        }
    }

    // Stats
    @GetMapping("/statistics")
    public ResponseEntity<BillingTariffService.TariffStatistics> getTariffStatistics() {
        try {
            return ResponseEntity.ok(tariffService.getTariffStatistics());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private BillingTariffDTO toDTO(BillingTariff tariff) {
        return new BillingTariffDTO(
                tariff.getId(),
                tariff.getBillingCustomerType() != null ? tariff.getBillingCustomerType().getId() : null,
                tariff.getBillingCustomerType() != null ? tariff.getBillingCustomerType().getCustomerType() : null,
                tariff.getBlockName(),
                tariff.getConsumption(),
                tariff.getTarrifBirr(),
                tariff.getStatus(),
                tariff.getIsLast()
        );
    }

    private BillingTariff fromCreateDTO(BillingTariffCreateDTO dto) {
        BillingTariff tariff = new BillingTariff();
        BillingCustomerType ct = new BillingCustomerType();
        ct.setId(dto.getCustomerTypeId());
        tariff.setBillingCustomerType(ct);
        tariff.setBlockName(dto.getBlockName());
        tariff.setConsumption(dto.getConsumption());
        tariff.setTarrifBirr(dto.getTarrifBirr());
        tariff.setIsLast(dto.getIsLast());
        return tariff;
    }

    public static class ErrorResponse {
        private String message;
        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class DeactivateRequest {
        private String remark;
        public String getRemark() { return remark; }
        public void setRemark(String remark) { this.remark = remark; }
    }
}
