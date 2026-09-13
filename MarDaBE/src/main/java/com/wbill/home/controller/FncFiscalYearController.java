package com.wbill.home.controller;

import com.wbill.home.dto.FncFiscalYearCreateDTO;
import com.wbill.home.dto.FncFiscalYearDTO;
import com.wbill.home.model.FncFiscalYear;
import com.wbill.home.service.FncFiscalYearService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/card_managenment/fnc-fiscal-years")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FncFiscalYearController {

    @Autowired
    private FncFiscalYearService fiscalYearService;

    @GetMapping("/all")
    public ResponseEntity<List<FncFiscalYearDTO>> getAll() {
        List<FncFiscalYearDTO> years = fiscalYearService.getAllFiscalYears().stream()
                .map(FncFiscalYearDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(years);
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrent() {
        return fiscalYearService.getCurrentFiscalYear()
                .map(fy -> ResponseEntity.ok(new FncFiscalYearDTO(fy)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/open")
    public ResponseEntity<List<FncFiscalYearDTO>> getOpen() {
        List<FncFiscalYearDTO> years = fiscalYearService.getOpenFiscalYears().stream()
                .map(FncFiscalYearDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(years);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        return fiscalYearService.getFiscalYearById(id)
                .map(fy -> ResponseEntity.ok(new FncFiscalYearDTO(fy)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody FncFiscalYearCreateDTO dto, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            FncFiscalYear created = fiscalYearService.createFiscalYear(dto, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(new FncFiscalYearDTO(created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<?> close(@PathVariable int id, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            FncFiscalYear closed = fiscalYearService.closeFiscalYear(id, username);
            return ResponseEntity.ok(new FncFiscalYearDTO(closed));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reopen")
    public ResponseEntity<?> reopen(@PathVariable int id, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            FncFiscalYear reopened = fiscalYearService.reopenFiscalYear(id, username);
            return ResponseEntity.ok(new FncFiscalYearDTO(reopened));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/carry-forward")
    public ResponseEntity<?> carryForward(@PathVariable int id, @RequestParam int newFiscalYearId, Principal principal) {
        try {
            fiscalYearService.carryForwardBalances(id, newFiscalYearId);
            return ResponseEntity.ok(Map.of("message", "Balances carried forward successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
