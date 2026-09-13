package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.dto.*;
import com.wbill.home.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FncReportService {

    @Autowired
    private FncAccountRepository accountRepository;
    @Autowired
    private FncJournalEntryLineRepository lineRepository;
    @Autowired
    private FncFiscalYearRepository fiscalYearRepository;
    @Autowired
    private FncOpeningBalanceRepository openingBalanceRepository;

    public FncTrialBalanceDTO generateTrialBalance(int fiscalYearId) {
        FncFiscalYear fy = fiscalYearRepository.findById(fiscalYearId)
                .orElseThrow(() -> new RuntimeException("Fiscal year not found"));

        List<FncJournalEntryLine> lines = lineRepository.findPostedLinesByFiscalYear(fiscalYearId);
        List<FncOpeningBalance> openings = openingBalanceRepository.findByFiscalYearId(fiscalYearId);

        // Build opening balance map
        Map<Integer, BigDecimal[]> openMap = new HashMap<>();
        for (FncOpeningBalance ob : openings) {
            openMap.put(ob.getAccount().getId(), new BigDecimal[]{ob.getDebitAmount(), ob.getCreditAmount()});
        }

        // Aggregate by account
        Map<Integer, BigDecimal[]> accountTotals = new LinkedHashMap<>();
        Map<Integer, FncAccount> accountMap = new HashMap<>();

        for (FncJournalEntryLine line : lines) {
            int accId = line.getAccount().getId();
            accountMap.putIfAbsent(accId, line.getAccount());
            accountTotals.computeIfAbsent(accId, k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            BigDecimal[] totals = accountTotals.get(accId);
            totals[0] = totals[0].add(line.getDebitAmount());
            totals[1] = totals[1].add(line.getCreditAmount());
        }

        // Also include accounts with opening balances but no transactions
        for (Map.Entry<Integer, BigDecimal[]> e : openMap.entrySet()) {
            if (!accountTotals.containsKey(e.getKey())) {
                accountTotals.put(e.getKey(), new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
                accountRepository.findById(e.getKey()).ifPresent(a -> accountMap.put(e.getKey(), a));
            }
        }

        List<FncTrialBalanceDTO.TrialBalanceRow> rows = new ArrayList<>();
        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;

        // Sort by account code
        List<Integer> sortedIds = accountTotals.keySet().stream()
                .sorted(Comparator.comparing(id -> accountMap.getOrDefault(id, new FncAccount()).getAccountCode()))
                .collect(Collectors.toList());

        for (int accId : sortedIds) {
            FncAccount acc = accountMap.get(accId);
            if (acc == null) continue;
            BigDecimal[] totals = accountTotals.get(accId);
            BigDecimal[] open = openMap.getOrDefault(accId, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});

            BigDecimal netDebit = open[0].add(totals[0]);
            BigDecimal netCredit = open[1].add(totals[1]);

            FncTrialBalanceDTO.TrialBalanceRow row = new FncTrialBalanceDTO.TrialBalanceRow();
            row.setAccountId(accId);
            row.setAccountCode(acc.getAccountCode());
            row.setAccountName(acc.getAccountName());
            row.setAccountNameAm(acc.getAccountNameAm());
            row.setAccountType(acc.getAccountType().name());

            BigDecimal net = netDebit.subtract(netCredit);
            if (net.compareTo(BigDecimal.ZERO) >= 0) {
                row.setDebitBalance(net.doubleValue());
                row.setCreditBalance(0);
                totalDebit = totalDebit.add(net);
            } else {
                row.setDebitBalance(0);
                row.setCreditBalance(net.abs().doubleValue());
                totalCredit = totalCredit.add(net.abs());
            }
            rows.add(row);
        }

        FncTrialBalanceDTO dto = new FncTrialBalanceDTO();
        dto.setFiscalYearId(fiscalYearId);
        dto.setFiscalYearName(fy.getFiscalYearName());
        dto.setAsOfDate(LocalDate.now().toString());
        dto.setRows(rows);
        dto.setTotalDebit(totalDebit.doubleValue());
        dto.setTotalCredit(totalCredit.doubleValue());
        dto.setIsBalanced(totalDebit.compareTo(totalCredit) == 0);
        return dto;
    }

    public Map<String, Object> generateIncomeStatement(int fiscalYearId) {
        FncFiscalYear fy = fiscalYearRepository.findById(fiscalYearId)
                .orElseThrow(() -> new RuntimeException("Fiscal year not found"));

        List<FncJournalEntryLine> lines = lineRepository.findPostedLinesByFiscalYear(fiscalYearId);

        List<Map<String, Object>> revenueItems = new ArrayList<>();
        List<Map<String, Object>> expenseItems = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        Map<Integer, BigDecimal[]> accountTotals = new LinkedHashMap<>();
        Map<Integer, FncAccount> accountMap = new HashMap<>();

        for (FncJournalEntryLine line : lines) {
            int accId = line.getAccount().getId();
            String type = line.getAccount().getAccountType().name();
            if (!"REVENUE".equals(type) && !"EXPENSE".equals(type)) continue;
            accountMap.putIfAbsent(accId, line.getAccount());
            accountTotals.computeIfAbsent(accId, k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            BigDecimal[] t = accountTotals.get(accId);
            t[0] = t[0].add(line.getDebitAmount());
            t[1] = t[1].add(line.getCreditAmount());
        }

        for (Map.Entry<Integer, BigDecimal[]> e : accountTotals.entrySet()) {
            FncAccount acc = accountMap.get(e.getKey());
            BigDecimal[] t = e.getValue();
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("accountCode", acc.getAccountCode());
            item.put("accountName", acc.getAccountName());
            item.put("accountNameAm", acc.getAccountNameAm());

            if ("REVENUE".equals(acc.getAccountType().name())) {
                BigDecimal amount = t[1].subtract(t[0]); // Credit - Debit for revenue
                item.put("amount", amount.doubleValue());
                revenueItems.add(item);
                totalRevenue = totalRevenue.add(amount);
            } else {
                BigDecimal amount = t[0].subtract(t[1]); // Debit - Credit for expense
                item.put("amount", amount.doubleValue());
                expenseItems.add(item);
                totalExpense = totalExpense.add(amount);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("fiscalYearName", fy.getFiscalYearName());
        result.put("period", fy.getStartDate() + " to " + fy.getEndDate());
        result.put("revenueItems", revenueItems);
        result.put("totalRevenue", totalRevenue.doubleValue());
        result.put("expenseItems", expenseItems);
        result.put("totalExpense", totalExpense.doubleValue());
        result.put("netIncome", totalRevenue.subtract(totalExpense).doubleValue());
        return result;
    }

    public Map<String, Object> generateBalanceSheet(int fiscalYearId) {
        FncFiscalYear fy = fiscalYearRepository.findById(fiscalYearId)
                .orElseThrow(() -> new RuntimeException("Fiscal year not found"));

        List<FncJournalEntryLine> lines = lineRepository.findPostedLinesByFiscalYear(fiscalYearId);
        List<FncOpeningBalance> openings = openingBalanceRepository.findByFiscalYearId(fiscalYearId);

        Map<Integer, BigDecimal[]> openMap = new HashMap<>();
        for (FncOpeningBalance ob : openings) {
            openMap.put(ob.getAccount().getId(), new BigDecimal[]{ob.getDebitAmount(), ob.getCreditAmount()});
        }

        Map<Integer, BigDecimal[]> accountTotals = new LinkedHashMap<>();
        Map<Integer, FncAccount> accountMap = new HashMap<>();
        for (FncJournalEntryLine line : lines) {
            int accId = line.getAccount().getId();
            accountMap.putIfAbsent(accId, line.getAccount());
            accountTotals.computeIfAbsent(accId, k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            BigDecimal[] t = accountTotals.get(accId);
            t[0] = t[0].add(line.getDebitAmount());
            t[1] = t[1].add(line.getCreditAmount());
        }

        List<Map<String, Object>> assets = new ArrayList<>();
        List<Map<String, Object>> liabilities = new ArrayList<>();
        List<Map<String, Object>> equity = new ArrayList<>();
        BigDecimal totalAssets = BigDecimal.ZERO;
        BigDecimal totalLiabilities = BigDecimal.ZERO;
        BigDecimal totalEquity = BigDecimal.ZERO;

        Set<Integer> allIds = new HashSet<>(accountTotals.keySet());
        allIds.addAll(openMap.keySet());

        for (int accId : allIds) {
            FncAccount acc = accountMap.get(accId);
            if (acc == null) {
                acc = accountRepository.findById(accId).orElse(null);
                if (acc == null) continue;
            }
            String type = acc.getAccountType().name();
            if ("REVENUE".equals(type) || "EXPENSE".equals(type)) continue;

            BigDecimal[] t = accountTotals.getOrDefault(accId, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            BigDecimal[] o = openMap.getOrDefault(accId, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});

            BigDecimal balance;
            if ("ASSET".equals(type)) {
                balance = o[0].subtract(o[1]).add(t[0]).subtract(t[1]);
            } else {
                balance = o[1].subtract(o[0]).add(t[1]).subtract(t[0]);
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("accountCode", acc.getAccountCode());
            item.put("accountName", acc.getAccountName());
            item.put("amount", balance.doubleValue());

            if ("ASSET".equals(type)) { assets.add(item); totalAssets = totalAssets.add(balance); }
            else if ("LIABILITY".equals(type)) { liabilities.add(item); totalLiabilities = totalLiabilities.add(balance); }
            else if ("EQUITY".equals(type)) { equity.add(item); totalEquity = totalEquity.add(balance); }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("fiscalYearName", fy.getFiscalYearName());
        result.put("asOfDate", fy.getEndDate().toString());
        result.put("assets", assets);
        result.put("totalAssets", totalAssets.doubleValue());
        result.put("liabilities", liabilities);
        result.put("totalLiabilities", totalLiabilities.doubleValue());
        result.put("equity", equity);
        result.put("totalEquity", totalEquity.doubleValue());
        result.put("totalLiabilitiesAndEquity", totalLiabilities.add(totalEquity).doubleValue());
        result.put("isBalanced", totalAssets.compareTo(totalLiabilities.add(totalEquity)) == 0);
        return result;
    }

    public List<Map<String, Object>> generateGeneralLedger(int accountId, int fiscalYearId) {
        FncAccount account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        FncFiscalYear fy = fiscalYearRepository.findById(fiscalYearId)
                .orElseThrow(() -> new RuntimeException("Fiscal year not found"));

        List<FncJournalEntryLine> lines = lineRepository
                .findPostedLinesByAccountIdAndDateRange(accountId, fy.getStartDate(), fy.getEndDate());

        BigDecimal runningBalance = BigDecimal.ZERO;
        // Add opening balance
        Optional<FncOpeningBalance> obOpt = openingBalanceRepository.findByAccountIdAndFiscalYearId(accountId, fiscalYearId);
        if (obOpt.isPresent()) {
            runningBalance = obOpt.get().getDebitAmount().subtract(obOpt.get().getCreditAmount());
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (FncJournalEntryLine line : lines) {
            if (account.getNormalBalance() == FncAccount.NormalBalance.DEBIT) {
                runningBalance = runningBalance.add(line.getDebitAmount()).subtract(line.getCreditAmount());
            } else {
                runningBalance = runningBalance.add(line.getCreditAmount()).subtract(line.getDebitAmount());
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", line.getJournalEntry().getEntryDate().toString());
            row.put("entryNumber", line.getJournalEntry().getEntryNumber());
            row.put("description", line.getDescription() != null ? line.getDescription() : line.getJournalEntry().getDescription());
            row.put("debit", line.getDebitAmount().doubleValue());
            row.put("credit", line.getCreditAmount().doubleValue());
            row.put("balance", runningBalance.doubleValue());
            result.add(row);
        }
        return result;
    }
}
