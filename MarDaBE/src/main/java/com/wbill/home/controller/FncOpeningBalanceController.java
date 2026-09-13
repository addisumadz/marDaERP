package com.wbill.home.controller;

import com.wbill.home.dto.FncOpeningBalanceCreateDTO;
import com.wbill.home.dto.FncOpeningBalanceDTO;
import com.wbill.home.model.FncAccount;
import com.wbill.home.model.FncFiscalYear;
import com.wbill.home.model.FncOpeningBalance;
import com.wbill.home.repository.FncAccountRepository;
import com.wbill.home.repository.FncFiscalYearRepository;
import com.wbill.home.repository.FncOpeningBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/card_managenment/fnc-opening-balances")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FncOpeningBalanceController {

    @Autowired
    private FncOpeningBalanceRepository openingBalanceRepository;
    @Autowired
    private FncAccountRepository accountRepository;
    @Autowired
    private FncFiscalYearRepository fiscalYearRepository;

    @GetMapping("/by-fiscal-year/{fiscalYearId}")
    public ResponseEntity<List<FncOpeningBalanceDTO>> getByFiscalYear(@PathVariable int fiscalYearId) {
        List<FncOpeningBalanceDTO> balances = openingBalanceRepository.findByFiscalYearWithAccount(fiscalYearId)
                .stream().map(FncOpeningBalanceDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(balances);
    }

    @PostMapping
    public ResponseEntity<?> createOrUpdate(@RequestBody FncOpeningBalanceCreateDTO dto, Principal principal) {
        try {
            FncAccount account = accountRepository.findById(dto.getAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("Account not found"));
            FncFiscalYear fy = fiscalYearRepository.findById(dto.getFiscalYearId())
                    .orElseThrow(() -> new IllegalArgumentException("Fiscal year not found"));

            if (fy.getIsClosed()) {
                throw new IllegalArgumentException("Cannot modify opening balances for a closed fiscal year");
            }

            Optional<FncOpeningBalance> existing = openingBalanceRepository
                    .findByAccountIdAndFiscalYearId(dto.getAccountId(), dto.getFiscalYearId());

            FncOpeningBalance ob;
            if (existing.isPresent()) {
                ob = existing.get();
            } else {
                ob = new FncOpeningBalance();
                ob.setAccount(account);
                ob.setFiscalYear(fy);
            }
            ob.setDebitAmount(BigDecimal.valueOf(dto.getDebitAmount()));
            ob.setCreditAmount(BigDecimal.valueOf(dto.getCreditAmount()));
            ob.setCreatedBy(principal != null ? principal.getName() : "system");

            FncOpeningBalance saved = openingBalanceRepository.save(ob);
            return ResponseEntity.ok(new FncOpeningBalanceDTO(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
