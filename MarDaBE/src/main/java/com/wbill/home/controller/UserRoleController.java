package com.wbill.home.controller;

import com.wbill.home.dto.UserRoleCreateDTO;
import com.wbill.home.dto.UserRoleDTO;
import com.wbill.home.model.UserRole;
import com.wbill.home.service.UserRoleService;
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
@RequestMapping("/api/card_managenment/user-roles")
@CrossOrigin(origins = "*")
public class UserRoleController {

    @Autowired
    private UserRoleService service;

    @GetMapping("/all")
    public ResponseEntity<List<UserRoleDTO>> getAll() {
        try {
            List<UserRoleDTO> dtos = service.getAll().stream().map(this::toDTO).collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<UserRoleDTO>> getByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<UserRole> pageData = service.getByDeleted(status, pageable);
            return ResponseEntity.ok(pageData.map(this::toDTO));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserRoleDTO> getById(@PathVariable Integer id) {
        try {
            Optional<UserRole> opt = service.getById(id);
            if (opt.isPresent()) return ResponseEntity.ok(toDTO(opt.get()));
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody UserRoleCreateDTO dto) {
        try {
            UserRole entity = fromCreateDTO(dto);
            // Rule: isMedical must always be false
            entity.setIsMedical(false);
            UserRole created = service.create(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while creating the user role"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody UserRoleCreateDTO dto) {
        try {
            UserRole entity = fromCreateDTO(dto);
            // Rule: isMedical must always be false
            entity.setIsMedical(false);
            UserRole updated = service.update(id, entity);
            return ResponseEntity.ok(toDTO(updated));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) return ResponseEntity.notFound().build();
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while updating the user role"));
        }
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Integer id) {
        try {
            UserRole deactivated = service.deactivate(id);
            return ResponseEntity.ok(toDTO(deactivated));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) return ResponseEntity.notFound().build();
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while deactivating the user role"));
        }
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable Integer id) {
        try {
            UserRole activated = service.activate(id);
            return ResponseEntity.ok(toDTO(activated));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) return ResponseEntity.notFound().build();
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An error occurred while activating the user role"));
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<UserRoleService.UserRoleStatistics> statistics() {
        try {
            return ResponseEntity.ok(service.getStatistics());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private UserRoleDTO toDTO(UserRole e) {
        return new UserRoleDTO(
                e.getId(),
                e.getRoleCode(),
                e.getRoleName(),
                e.getIsMedical(),
                e.getIsStore(),
                e.getIsFormanExpert(),
                e.getIsWaterMeterReader(),
                e.getStatus(),
                e.getDeleted()
        );
    }

    private UserRole fromCreateDTO(UserRoleCreateDTO dto) {
        UserRole e = new UserRole();
        e.setRoleCode(dto.getRoleCode());
        e.setRoleName(dto.getRoleName());
        e.setIsStore(dto.getIsStore());
        e.setIsFormanExpert(dto.getIsFormanExpert());
        e.setIsWaterMeterReader(dto.getIsWaterMeterReader());
        // status/deleted defaults handled in service
        return e;
    }

    public static class ErrorResponse {
        private String message;
        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
