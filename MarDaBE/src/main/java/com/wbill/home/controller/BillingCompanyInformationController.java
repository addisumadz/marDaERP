package com.wbill.home.controller;

import com.wbill.home.dto.BillingCompanyInformationCreateDTO;
import com.wbill.home.dto.BillingCompanyInformationDTO;
import com.wbill.home.model.BillingCompanyInformation;
import com.wbill.home.service.BillingCompanyInformationService;
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
@RequestMapping("/api/mardaerp/billing-company-informations")
@CrossOrigin(origins = "*")
public class BillingCompanyInformationController {

    @Autowired
    private BillingCompanyInformationService service;

    @GetMapping("/all")
    public ResponseEntity<List<BillingCompanyInformationDTO>> getAll() {
        try {
            List<BillingCompanyInformationDTO> dtos = service.getAll().stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<BillingCompanyInformationDTO>> getByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<BillingCompanyInformation> pageData = service.getByStatus(status, pageable);
            return ResponseEntity.ok(pageData.map(this::toDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillingCompanyInformationDTO> getById(@PathVariable Integer id) {
        try {
            Optional<BillingCompanyInformation> opt = service.getById(id);
            if (opt.isPresent()) return ResponseEntity.ok(toDTO(opt.get()));
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody BillingCompanyInformationCreateDTO dto) {
        try {
            BillingCompanyInformation entity = fromCreateDTO(dto);
            BillingCompanyInformation created = service.create(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while creating the company information"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody BillingCompanyInformationCreateDTO dto) {
        try {
            BillingCompanyInformation entity = fromCreateDTO(dto);
            BillingCompanyInformation updated = service.update(id, entity);
            return ResponseEntity.ok(toDTO(updated));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) return ResponseEntity.notFound().build();
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while updating the company information"));
        }
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Integer id) {
        try {
            BillingCompanyInformation deactivated = service.deactivate(id);
            return ResponseEntity.ok(toDTO(deactivated));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) return ResponseEntity.notFound().build();
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while deactivating the company information"));
        }
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable Integer id) {
        try {
            BillingCompanyInformation activated = service.activate(id);
            return ResponseEntity.ok(toDTO(activated));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) return ResponseEntity.notFound().build();
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while activating the company information"));
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<BillingCompanyInformationService.CompanyInfoStatistics> statistics() {
        try {
            return ResponseEntity.ok(service.getStatistics());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private BillingCompanyInformationDTO toDTO(BillingCompanyInformation e) {
        return new BillingCompanyInformationDTO(
                e.getId(),
                e.getCompanyName(),
                e.getCompanyLogo(),
                e.getMotto(),
                e.getMessage(),
                e.getAdditionalInformation(),
                e.getGenzebSebsabe(),
                e.getDeresegnYemiaregagt(),
                e.getDeresegnSebsabiLabel(),
                e.getDeresegnYemiaregagtLabel(),
                e.getYeteganenePercent(),
                e.getStatus()
        );
    }

    private BillingCompanyInformation fromCreateDTO(BillingCompanyInformationCreateDTO dto) {
        BillingCompanyInformation e = new BillingCompanyInformation();
        e.setCompanyName(dto.getCompanyName());
        e.setCompanyLogo(dto.getCompanyLogo());
        e.setMotto(dto.getMotto());
        e.setMessage(dto.getMessage());
        e.setAdditionalInformation(dto.getAdditionalInformation());
        e.setGenzebSebsabe(dto.getGenzebSebsabe());
        e.setDeresegnYemiaregagt(dto.getDeresegnYemiaregagt());
        e.setDeresegnSebsabiLabel(dto.getDeresegnSebsabiLabel());
        e.setDeresegnYemiaregagtLabel(dto.getDeresegnYemiaregagtLabel());
        e.setYeteganenePercent(dto.getYeteganenePercent() == null ? 0 : dto.getYeteganenePercent());
        return e;
    }

    public static class ErrorResponse {
        private String message;
        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
