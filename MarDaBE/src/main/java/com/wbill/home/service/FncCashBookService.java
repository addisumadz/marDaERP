package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FncCashBookService {

    @Autowired private FncAccountRepository accountRepository;
    @Autowired private FncJournalEntryLineRepository journalLineRepository;
    @Autowired private FncFiscalYearRepository fiscalYearRepository;
    @Autowired private FncOpeningBalanceRepository openingBalanceRepository;

    /**
     * Get all cash/bank accounts (codes starting with 111, 112, 113)
     */
    public List<Map<String, Object>> getCashBankAccounts() {
        List<FncAccount> all = accountRepository.findPostableAccounts();
        return all.stream()
                .filter(a -> {
                    String code = a.getAccountCode();
                    return code.startsWith("111") || code.startsWith("112") || code.startsWith("113");
                })
                .map(a -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", a.getId());
                    m.put("accountCode", a.getAccountCode());
                    m.put("accountName", a.getAccountName());
                    m.put("accountNameAm", a.getAccountNameAm());
                    return m;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get cash book entries for a specific account within a date range.
     * Shows each transaction with running balance.
     */
    public Map<String, Object> getCashBookEntries(int accountId, int fiscalYearId, LocalDate startDate, LocalDate endDate) {
        FncAccount account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        FncFiscalYear fy = fiscalYearRepository.findById(fiscalYearId)
                .orElseThrow(() -> new RuntimeException("Fiscal year not found"));

        // Get opening balance
        BigDecimal openingBalance = BigDecimal.ZERO;
        Optional<FncOpeningBalance> ob = openingBalanceRepository.findByAccountIdAndFiscalYearId(accountId, fiscalYearId);
        if (ob.isPresent()) {
            openingBalance = ob.get().getDebitAmount().subtract(ob.get().getCreditAmount());
        }

        // Add transactions before startDate to opening balance
        if (startDate != null && startDate.isAfter(fy.getStartDate())) {
            List<FncJournalEntryLine> priorLines = journalLineRepository
                    .findPostedLinesByAccountIdAndDateRange(accountId, fy.getStartDate(), startDate.minusDays(1));
            for (FncJournalEntryLine line : priorLines) {
                openingBalance = openingBalance.add(line.getDebitAmount()).subtract(line.getCreditAmount());
            }
        }

        LocalDate from = startDate != null ? startDate : fy.getStartDate();
        LocalDate to = endDate != null ? endDate : fy.getEndDate();

        List<FncJournalEntryLine> lines = journalLineRepository
                .findPostedLinesByAccountIdAndDateRange(accountId, from, to);

        BigDecimal runningBalance = openingBalance;
        BigDecimal totalReceipts = BigDecimal.ZERO;
        BigDecimal totalPayments = BigDecimal.ZERO;

        List<Map<String, Object>> entries = new ArrayList<>();
        for (FncJournalEntryLine line : lines) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("date", line.getJournalEntry().getEntryDate().toString());
            entry.put("entryNumber", line.getJournalEntry().getEntryNumber());
            entry.put("description", line.getDescription() != null && !line.getDescription().isEmpty()
                    ? line.getDescription() : line.getJournalEntry().getDescription());
            entry.put("referenceNumber", line.getJournalEntry().getReferenceNumber());

            BigDecimal receipt = line.getDebitAmount();
            BigDecimal payment = line.getCreditAmount();
            runningBalance = runningBalance.add(receipt).subtract(payment);

            entry.put("receipt", receipt);
            entry.put("payment", payment);
            entry.put("balance", runningBalance);

            totalReceipts = totalReceipts.add(receipt);
            totalPayments = totalPayments.add(payment);

            entries.add(entry);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("accountId", accountId);
        result.put("accountCode", account.getAccountCode());
        result.put("accountName", account.getAccountName());
        result.put("accountNameAm", account.getAccountNameAm());
        result.put("fiscalYearName", fy.getFiscalYearName());
        result.put("startDate", from.toString());
        result.put("endDate", to.toString());
        result.put("openingBalance", openingBalance);
        result.put("totalReceipts", totalReceipts);
        result.put("totalPayments", totalPayments);
        result.put("closingBalance", runningBalance);
        result.put("entries", entries);
        return result;
    }

    /**
     * Get summary of all cash/bank accounts with current balances.
     */
    public List<Map<String, Object>> getCashSummary(int fiscalYearId) {
        List<Map<String, Object>> cashAccounts = getCashBankAccounts();
        FncFiscalYear fy = fiscalYearRepository.findById(fiscalYearId)
                .orElseThrow(() -> new RuntimeException("Fiscal year not found"));

        List<Map<String, Object>> result = new ArrayList<>();
        BigDecimal grandTotal = BigDecimal.ZERO;

        for (Map<String, Object> acc : cashAccounts) {
            int accId = (int) acc.get("id");

            BigDecimal balance = BigDecimal.ZERO;
            Optional<FncOpeningBalance> ob = openingBalanceRepository.findByAccountIdAndFiscalYearId(accId, fiscalYearId);
            if (ob.isPresent()) {
                balance = ob.get().getDebitAmount().subtract(ob.get().getCreditAmount());
            }

            List<FncJournalEntryLine> lines = journalLineRepository
                    .findPostedLinesByAccountIdAndDateRange(accId, fy.getStartDate(), LocalDate.now());
            for (FncJournalEntryLine line : lines) {
                balance = balance.add(line.getDebitAmount()).subtract(line.getCreditAmount());
            }

            Map<String, Object> row = new LinkedHashMap<>(acc);
            row.put("currentBalance", balance);
            result.add(row);
            grandTotal = grandTotal.add(balance);
        }

        // Add grand total row
        Map<String, Object> totalRow = new LinkedHashMap<>();
        totalRow.put("id", 0);
        totalRow.put("accountCode", "");
        totalRow.put("accountName", "TOTAL CASH & BANK");
        totalRow.put("accountNameAm", "ጠቅላላ ጥሬ ገንዘብ");
        totalRow.put("currentBalance", grandTotal);
        totalRow.put("isTotal", true);
        result.add(totalRow);

        return result;
    }
}
