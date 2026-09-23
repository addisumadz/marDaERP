package com.wbill.home.controller;

import com.wbill.home.dto.PasswordChangeDTO;
import com.wbill.home.dto.UserAccountCreateDTO;
import com.wbill.home.dto.UserAccountDTO;
import com.wbill.home.dto.UserAccountUpdateDTO;
import com.wbill.home.service.UserAccountService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mardaerp/users")
@CrossOrigin(origins = "*")
public class UserAccountController {
  private final UserAccountService service;

  public UserAccountController(UserAccountService service) {
    this.service = service;
  }

  // Read
  @GetMapping("/all")
  public ResponseEntity<List<UserAccountDTO>> getAll() {
    return ResponseEntity.ok(service.getAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserAccountDTO> getById(@PathVariable int id) {
    return ResponseEntity.ok(service.getById(id));
  }

  @GetMapping("/by-status/{status}")
  public ResponseEntity<Page<UserAccountDTO>> getByStatusPaginated(
      @PathVariable String status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    Pageable pageable = PageRequest.of(page, size);
    return ResponseEntity.ok(service.getByDeletedWithPagination(status, pageable));
  }

  // Create
  @PostMapping
  public ResponseEntity<?> create(@RequestBody UserAccountCreateDTO dto) {
    try {
      UserAccountDTO created = service.create(dto);
      return new ResponseEntity<>(created, HttpStatus.CREATED);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating user: " + e.getMessage());
    }
  }

  // Update
  @PutMapping("/{id}")
  public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody UserAccountUpdateDTO dto) {
    try {
      UserAccountDTO updated = service.update(id, dto);
      return ResponseEntity.ok(updated);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating user: " + e.getMessage());
    }
  }

  // Activate / Deactivate
  @PutMapping("/{id}/activate")
  public ResponseEntity<?> activate(@PathVariable Integer id) {
    try {
      service.activate(id);
      return ResponseEntity.noContent().build();
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error activating user: " + e.getMessage());
    }
  }

  @PutMapping("/{id}/deactivate")
  public ResponseEntity<?> deactivate(@PathVariable Integer id) {
    try {
      service.deactivate(id);
      return ResponseEntity.noContent().build();
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deactivating user: " + e.getMessage());
    }
  }

  // Delete
  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@PathVariable Integer id) {
    try {
      service.delete(id);
      return ResponseEntity.noContent().build();
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting user: " + e.getMessage());
    }
  }

  // Change password
  @PutMapping("/{id}/change-password")
  public ResponseEntity<?> changePassword(@PathVariable Integer id, @RequestBody PasswordChangeDTO payload) {
    try {
      service.changePassword(id, payload);
      return ResponseEntity.noContent().build();
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error changing password: " + e.getMessage());
    }
  }
}