package com.wbill.home.controller;

import com.wbill.home.dto.FncAccountCreateDTO;
import com.wbill.home.dto.FncAccountDTO;
import com.wbill.home.model.FncAccount;
import com.wbill.home.model.FncAccount.AccountType;
import com.wbill.home.service.FncAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/card_managenment/fnc-accounts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FncAccountController {

    @Autowired
    private FncAccountService accountService;

    @GetMapping("/all")
    public ResponseEntity<List<FncAccountDTO>> getAllAccounts() {
        try {
            List<FncAccountDTO> accounts = accountService.getAllAccounts().stream()
                    .map(FncAccountDTO::new).collect(Collectors.toList());
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/tree")
    public ResponseEntity<List<FncAccountDTO>> getAccountTree() {
        try {
            List<FncAccountDTO> tree = accountService.getAccountTree().stream()
                    .map(a -> new FncAccountDTO(a, true)).collect(Collectors.toList());
            return ResponseEntity.ok(tree);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/postable")
    public ResponseEntity<List<FncAccountDTO>> getPostableAccounts() {
        try {
            List<FncAccountDTO> accounts = accountService.getPostableAccounts().stream()
                    .map(FncAccountDTO::new).collect(Collectors.toList());
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/by-type/{type}")
    public ResponseEntity<List<FncAccountDTO>> getByType(@PathVariable String type) {
        try {
            List<FncAccountDTO> accounts = accountService.getAccountsByType(AccountType.valueOf(type)).stream()
                    .map(FncAccountDTO::new).collect(Collectors.toList());
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<FncAccountDTO>> searchAccounts(@RequestParam String q) {
        try {
            List<FncAccountDTO> accounts = accountService.searchAccounts(q).stream()
                    .map(FncAccountDTO::new).collect(Collectors.toList());
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<FncAccountDTO>> getPaginated(
            @RequestParam(defaultValue = "true") boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            Page<FncAccountDTO> accounts = accountService.getAccountsPaginated(active, page, size)
                    .map(FncAccountDTO::new);
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<FncAccountDTO> getById(@PathVariable int id) {
        return accountService.getAccountById(id)
                .map(a -> ResponseEntity.ok(new FncAccountDTO(a, true)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody FncAccountCreateDTO dto, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            FncAccount created = accountService.createAccount(dto, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(new FncAccountDTO(created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating account: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody FncAccountCreateDTO dto) {
        try {
            FncAccount updated = accountService.updateAccount(id, dto);
            return ResponseEntity.ok(new FncAccountDTO(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable int id) {
        try {
            FncAccount deactivated = accountService.deactivateAccount(id);
            return ResponseEntity.ok(new FncAccountDTO(deactivated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable int id) {
        try {
            FncAccount activated = accountService.activateAccount(id);
            return ResponseEntity.ok(new FncAccountDTO(activated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
