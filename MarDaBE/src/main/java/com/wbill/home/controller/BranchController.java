package com.wbill.home.controller;

import com.wbill.home.dto.BranchCreateDTO;
import com.wbill.home.dto.BranchDTO;
import com.wbill.home.model.Branch;
import com.wbill.home.service.BranchService;
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
@RequestMapping("/api/mardaerp/branchs")
@CrossOrigin(origins = "*")
public class BranchController {

    @Autowired
    private BranchService branchService;

    @GetMapping("/all")
    public ResponseEntity<List<BranchDTO>> getAll() {
        try {
            List<BranchDTO> dtos = branchService.getAll().stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<BranchDTO>> getByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Branch> pageData = branchService.getByStatus(status, pageable);
            return ResponseEntity.ok(pageData.map(this::toDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<BranchDTO> getById(@PathVariable Integer id) {
        try {
            Optional<Branch> opt = branchService.getById(id);
            if (opt.isPresent()) return ResponseEntity.ok(toDTO(opt.get()));
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody BranchCreateDTO dto) {
        try {
            Branch entity = fromCreateDTO(dto);
            // resolve kebele relation
            branchService.resolveAndAttachKebele(entity, dto.getBranchKebeleId());
            Branch created = branchService.create(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while creating the branch"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody BranchCreateDTO dto) {
        try {
            Branch entity = fromCreateDTO(dto);
            branchService.resolveAndAttachKebele(entity, dto.getBranchKebeleId());
            Branch updated = branchService.update(id, entity);
            return ResponseEntity.ok(toDTO(updated));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) return ResponseEntity.notFound().build();
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while updating the branch"));
        }
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Integer id) {
        try {
            Branch deactivated = branchService.deactivate(id);
            return ResponseEntity.ok(toDTO(deactivated));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) return ResponseEntity.notFound().build();
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while deactivating the branch"));
        }
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable Integer id) {
        try {
            Branch activated = branchService.activate(id);
            return ResponseEntity.ok(toDTO(activated));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) return ResponseEntity.notFound().build();
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while activating the branch"));
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<BranchService.BranchStatistics> statistics() {
        try {
            return ResponseEntity.ok(branchService.getStatistics());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private BranchDTO toDTO(Branch e) {
        Integer kebeleId = e.getBranchKebele() != null ? e.getBranchKebele().getId() : null;
        String kebeleName = e.getBranchKebele() != null ? e.getBranchKebele().getStreetsName() : null;
        return new BranchDTO(
                e.getId(),
                kebeleId,
                kebeleName,
                e.getBranchCode(),
                e.getBranchDescription(),
                e.getOfficeLevel(),
                e.getAboutOffice(),
                e.getDeleted()
        );
    }

    private Branch fromCreateDTO(BranchCreateDTO dto) {
        Branch e = new Branch();
        e.setBranchCode(dto.getBranchCode());
        e.setBranchDescription(dto.getBranchDescription());
        e.setOfficeLevel(dto.getOfficeLevel());
        e.setAboutOffice(dto.getAboutOffice());
        return e;
    }

    public static class ErrorResponse {
        private String message;
        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
