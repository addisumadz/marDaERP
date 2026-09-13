package com.wbill.home.controller;

import com.wbill.home.dto.FncTrialBalanceDTO;
import com.wbill.home.service.FncReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/card_managenment/fnc-reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FncReportController {

    @Autowired
    private FncReportService reportService;

    @GetMapping("/trial-balance")
    public ResponseEntity<?> getTrialBalance(@RequestParam int fiscalYearId) {
        try {
            FncTrialBalanceDTO tb = reportService.generateTrialBalance(fiscalYearId);
            return ResponseEntity.ok(tb);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/income-statement")
    public ResponseEntity<?> getIncomeStatement(@RequestParam int fiscalYearId) {
        try {
            Map<String, Object> is = reportService.generateIncomeStatement(fiscalYearId);
            return ResponseEntity.ok(is);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/balance-sheet")
    public ResponseEntity<?> getBalanceSheet(@RequestParam int fiscalYearId) {
        try {
            Map<String, Object> bs = reportService.generateBalanceSheet(fiscalYearId);
            return ResponseEntity.ok(bs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/general-ledger")
    public ResponseEntity<?> getGeneralLedger(@RequestParam int accountId, @RequestParam int fiscalYearId) {
        try {
            List<Map<String, Object>> gl = reportService.generateGeneralLedger(accountId, fiscalYearId);
            return ResponseEntity.ok(gl);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
