package com.wbill.home.service;

import com.wbill.home.dto.FncBudgetCreateDTO;
import com.wbill.home.model.*;
import com.wbill.home.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FncBudgetService {

    @Autowired private FncBudgetRepository budgetRepository;
    @Autowired private FncBudgetLineRepository budgetLineRepository;
    @Autowired private FncFiscalYearRepository fiscalYearRepository;
    @Autowired private FncAccountRepository accountRepository;
    @Autowired private FncJournalEntryLineRepository journalEntryLineRepository;

    public List<FncBudget> getAllBudgets() {
        return budgetRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<FncBudget> getBudgetsByFiscalYear(int fiscalYearId) {
        return budgetRepository.findByFiscalYearIdOrderByCreatedAtDesc(fiscalYearId);
    }

    public Optional<FncBudget> getBudgetById(int id) {
        return budgetRepository.findByIdWithLines(id);
    }

    @Transactional
    public FncBudget createBudget(FncBudgetCreateDTO dto, String username) {
        FncFiscalYear fy = fiscalYearRepository.findById(dto.getFiscalYearId())
                .orElseThrow(() -> new RuntimeException("Fiscal year not found"));

        FncBudget budget = new FncBudget();
        budget.setFiscalYear(fy);
        budget.setBudgetName(dto.getBudgetName());
        budget.setDescription(dto.getDescription());
        budget.setStatus(FncBudget.BudgetStatus.DRAFT);
        budget.setCreatedBy(username);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        budget = budgetRepository.save(budget);

        if (dto.getLines() != null) {
            for (FncBudgetCreateDTO.LineDTO lineDto : dto.getLines()) {
                if (lineDto.getAnnualAmount() == null || lineDto.getAnnualAmount().compareTo(BigDecimal.ZERO) == 0) continue;

                FncAccount account = accountRepository.findById(lineDto.getAccountId())
                        .orElseThrow(() -> new RuntimeException("Account not found: " + lineDto.getAccountId()));

                FncBudgetLine line = new FncBudgetLine();
                line.setBudget(budget);
                line.setAccount(account);
                line.setAnnualAmount(lineDto.getAnnualAmount());
                line.setQ1Amount(lineDto.getQ1Amount() != null ? lineDto.getQ1Amount() : BigDecimal.ZERO);
                line.setQ2Amount(lineDto.getQ2Amount() != null ? lineDto.getQ2Amount() : BigDecimal.ZERO);
                line.setQ3Amount(lineDto.getQ3Amount() != null ? lineDto.getQ3Amount() : BigDecimal.ZERO);
                line.setQ4Amount(lineDto.getQ4Amount() != null ? lineDto.getQ4Amount() : BigDecimal.ZERO);
                line.setNotes(lineDto.getNotes());
                budgetLineRepository.save(line);

                if ("REVENUE".equals(account.getAccountType().name())) {
                    totalRevenue = totalRevenue.add(lineDto.getAnnualAmount());
                } else {
                    totalExpense = totalExpense.add(lineDto.getAnnualAmount());
                }
            }
        }

        budget.setTotalRevenueBudget(totalRevenue);
        budget.setTotalExpenseBudget(totalExpense);
        return budgetRepository.save(budget);
    }

    @Transactional
    public FncBudget updateBudgetLines(int budgetId, List<FncBudgetCreateDTO.LineDTO> lineDtos, String username) {
        FncBudget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (budget.getStatus() == FncBudget.BudgetStatus.APPROVED) {
            budget.setStatus(FncBudget.BudgetStatus.REVISED);
        }

        budgetLineRepository.deleteByBudgetId(budgetId);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (FncBudgetCreateDTO.LineDTO lineDto : lineDtos) {
            if (lineDto.getAnnualAmount() == null || lineDto.getAnnualAmount().compareTo(BigDecimal.ZERO) == 0) continue;

            FncAccount account = accountRepository.findById(lineDto.getAccountId())
                    .orElseThrow(() -> new RuntimeException("Account not found"));

            FncBudgetLine line = new FncBudgetLine();
            line.setBudget(budget);
            line.setAccount(account);
            line.setAnnualAmount(lineDto.getAnnualAmount());
            line.setQ1Amount(lineDto.getQ1Amount() != null ? lineDto.getQ1Amount() : BigDecimal.ZERO);
            line.setQ2Amount(lineDto.getQ2Amount() != null ? lineDto.getQ2Amount() : BigDecimal.ZERO);
            line.setQ3Amount(lineDto.getQ3Amount() != null ? lineDto.getQ3Amount() : BigDecimal.ZERO);
            line.setQ4Amount(lineDto.getQ4Amount() != null ? lineDto.getQ4Amount() : BigDecimal.ZERO);
            line.setNotes(lineDto.getNotes());
            budgetLineRepository.save(line);

            if ("REVENUE".equals(account.getAccountType().name())) {
                totalRevenue = totalRevenue.add(lineDto.getAnnualAmount());
            } else {
                totalExpense = totalExpense.add(lineDto.getAnnualAmount());
            }
        }

        budget.setTotalRevenueBudget(totalRevenue);
        budget.setTotalExpenseBudget(totalExpense);
        return budgetRepository.save(budget);
    }

    @Transactional
    public FncBudget approveBudget(int id, String username) {
        FncBudget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        budget.setStatus(FncBudget.BudgetStatus.APPROVED);
        budget.setApprovedBy(username);
        budget.setApprovedAt(LocalDateTime.now());
        return budgetRepository.save(budget);
    }

    /**
     * Peachtree-style: ensure a single budget exists for the fiscal year.
     * If no budget exists, auto-create a DRAFT one.
     * Returns the budget with lines loaded.
     */
    @Transactional
    public FncBudget ensureBudgetForFiscalYear(int fiscalYearId, String username) {
        List<FncBudget> existing = budgetRepository.findByFiscalYearIdOrderByCreatedAtDesc(fiscalYearId);
        FncBudget budget;
        if (!existing.isEmpty()) {
            budget = existing.get(0);
        } else {
            FncFiscalYear fy = fiscalYearRepository.findById(fiscalYearId)
                    .orElseThrow(() -> new RuntimeException("Fiscal year not found"));
            budget = new FncBudget();
            budget.setFiscalYear(fy);
            budget.setBudgetName("Budget " + fy.getFiscalYearName());
            budget.setDescription("Auto-created budget for " + fy.getFiscalYearName());
            budget.setStatus(FncBudget.BudgetStatus.DRAFT);
            budget.setCreatedBy(username);
            budget = budgetRepository.save(budget);
        }
        // Return with lines loaded
        return budgetRepository.findByIdWithLines(budget.getId()).orElse(budget);
    }

    @Transactional
    public void deleteBudget(int id) {
        FncBudget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        if (budget.getStatus() == FncBudget.BudgetStatus.APPROVED) {
            throw new IllegalArgumentException("Cannot delete an approved budget");
        }
        budgetRepository.delete(budget);
    }

    /**
     * Budget vs Actual report: compares budgeted amounts to actual posted journal entry totals.
     */
    public List<Map<String, Object>> getBudgetVsActual(int fiscalYearId) {
        FncBudget budget = budgetRepository.findApprovedByFiscalYear(fiscalYearId).orElse(null);
        if (budget == null) {
            // Try any budget
            List<FncBudget> budgets = budgetRepository.findByFiscalYearIdOrderByCreatedAtDesc(fiscalYearId);
            if (!budgets.isEmpty()) budget = budgets.get(0);
        }

        // Get all revenue/expense accounts
        List<FncAccount> accounts = accountRepository.findPostableAccounts();
        accounts = accounts.stream()
                .filter(a -> "REVENUE".equals(a.getAccountType().name()) || "EXPENSE".equals(a.getAccountType().name()))
                .collect(Collectors.toList());

        // Build budget map
        Map<Integer, FncBudgetLine> budgetMap = new HashMap<>();
        if (budget != null) {
            budget = budgetRepository.findByIdWithLines(budget.getId()).orElse(budget);
            for (FncBudgetLine line : budget.getLines()) {
                budgetMap.put(line.getAccount().getId(), line);
            }
        }

        // Get actual amounts from posted journal entries
        FncFiscalYear fy = fiscalYearRepository.findById(fiscalYearId)
                .orElseThrow(() -> new RuntimeException("Fiscal year not found"));

        List<Map<String, Object>> result = new ArrayList<>();

        for (FncAccount account : accounts) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("accountId", account.getId());
            row.put("accountCode", account.getAccountCode());
            row.put("accountName", account.getAccountName());
            row.put("accountNameAm", account.getAccountNameAm());
            row.put("accountType", account.getAccountType().name());

            FncBudgetLine budgetLine = budgetMap.get(account.getId());
            BigDecimal budgeted = budgetLine != null ? budgetLine.getAnnualAmount() : BigDecimal.ZERO;
            row.put("budgetAmount", budgeted);

            // Calculate actual from posted journal entries
            BigDecimal actualDebit = journalEntryLineRepository.sumDebitByAccountAndFiscalYear(account.getId(), fiscalYearId);
            BigDecimal actualCredit = journalEntryLineRepository.sumCreditByAccountAndFiscalYear(account.getId(), fiscalYearId);
            if (actualDebit == null) actualDebit = BigDecimal.ZERO;
            if (actualCredit == null) actualCredit = BigDecimal.ZERO;

            BigDecimal actual;
            if ("EXPENSE".equals(account.getAccountType().name())) {
                actual = actualDebit.subtract(actualCredit);
            } else {
                actual = actualCredit.subtract(actualDebit);
            }
            row.put("actualAmount", actual);

            BigDecimal variance = budgeted.subtract(actual);
            row.put("variance", variance);

            BigDecimal utilization = BigDecimal.ZERO;
            if (budgeted.compareTo(BigDecimal.ZERO) > 0) {
                utilization = actual.multiply(BigDecimal.valueOf(100)).divide(budgeted, 1, RoundingMode.HALF_UP);
            }
            row.put("utilization", utilization);

            result.add(row);
        }

        return result;
    }
}
