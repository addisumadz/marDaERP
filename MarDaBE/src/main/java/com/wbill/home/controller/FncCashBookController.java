package com.wbill.home.controller;

import com.wbill.home.service.FncCashBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/card_managenment/fnc-cashbook")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FncCashBookController {

    @Autowired
    private FncCashBookService cashBookService;

    @GetMapping("/accounts")
    public ResponseEntity<List<Map<String, Object>>> getCashBankAccounts() {
        return ResponseEntity.ok(cashBookService.getCashBankAccounts());
    }

    @GetMapping("/entries")
    public ResponseEntity<?> getEntries(
            @RequestParam int accountId,
            @RequestParam int fiscalYearId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            LocalDate from = startDate != null && !startDate.isEmpty() ? LocalDate.parse(startDate) : null;
            LocalDate to = endDate != null && !endDate.isEmpty() ? LocalDate.parse(endDate) : null;
            return ResponseEntity.ok(cashBookService.getCashBookEntries(accountId, fiscalYearId, from, to));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@RequestParam int fiscalYearId) {
        try {
            return ResponseEntity.ok(cashBookService.getCashSummary(fiscalYearId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
