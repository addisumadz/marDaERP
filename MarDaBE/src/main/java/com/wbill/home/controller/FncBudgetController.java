package com.wbill.home.controller;

import com.wbill.home.dto.FncBudgetCreateDTO;
import com.wbill.home.dto.FncBudgetDTO;
import com.wbill.home.model.FncBudget;
import com.wbill.home.service.FncBudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/card_managenment/fnc-budgets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FncBudgetController {

    @Autowired
    private FncBudgetService budgetService;

    @GetMapping("/all")
    public ResponseEntity<List<FncBudgetDTO>> getAll() {
        return ResponseEntity.ok(budgetService.getAllBudgets().stream()
                .map(FncBudgetDTO::new).collect(Collectors.toList()));
    }

    @GetMapping("/by-fiscal-year/{fyId}")
    public ResponseEntity<List<FncBudgetDTO>> getByFiscalYear(@PathVariable int fyId) {
        return ResponseEntity.ok(budgetService.getBudgetsByFiscalYear(fyId).stream()
                .map(FncBudgetDTO::new).collect(Collectors.toList()));
    }

    @GetMapping("/by-fiscal-year/{fyId}/ensure")
    public ResponseEntity<?> ensureForFiscalYear(@PathVariable int fyId, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            FncBudget budget = budgetService.ensureBudgetForFiscalYear(fyId, username);
            return ResponseEntity.ok(new FncBudgetDTO(budget, true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        return budgetService.getBudgetById(id)
                .map(b -> ResponseEntity.ok(new FncBudgetDTO(b, true)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody FncBudgetCreateDTO dto, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            FncBudget created = budgetService.createBudget(dto, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(new FncBudgetDTO(created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/lines")
    public ResponseEntity<?> updateLines(@PathVariable int id, @RequestBody List<FncBudgetCreateDTO.LineDTO> lines, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            FncBudget updated = budgetService.updateBudgetLines(id, lines, username);
            return ResponseEntity.ok(new FncBudgetDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable int id, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            FncBudget approved = budgetService.approveBudget(id, username);
            return ResponseEntity.ok(new FncBudgetDTO(approved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        try {
            budgetService.deleteBudget(id);
            return ResponseEntity.ok(Map.of("message", "Budget deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/vs-actual")
    public ResponseEntity<?> getBudgetVsActual(@RequestParam int fiscalYearId) {
        try {
            return ResponseEntity.ok(budgetService.getBudgetVsActual(fiscalYearId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
