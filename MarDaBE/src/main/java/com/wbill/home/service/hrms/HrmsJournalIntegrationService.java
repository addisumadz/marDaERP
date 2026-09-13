package com.wbill.home.service.hrms;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.wbill.home.model.FncAccount;
import com.wbill.home.model.FncJournalEntry;
import com.wbill.home.model.FncJournalEntry.EntryStatus;
import com.wbill.home.model.FncJournalEntryLine;
import com.wbill.home.model.hrms.HrmsPayrollAccountMap;
import com.wbill.home.model.hrms.HrmsPayrollRun;
import com.wbill.home.repository.FncJournalEntryRepository;
import com.wbill.home.repository.hrms.HrmsPayrollAccountMapRepository;
import com.wbill.home.repository.hrms.HrmsPayrollRunRepository;

/**
 * Service to dynamically build and push balanced monthly payroll journal entries into Finance GL.
 * Mirrors the billing journal push architecture (fncBillToJournal).
 */
@Service
public class HrmsJournalIntegrationService {

    @Autowired
    private HrmsPayrollAccountMapRepository accountMapRepository;

    @Autowired
    private FncJournalEntryRepository journalEntryRepository;

    @Autowired
    private HrmsPayrollRunRepository payrollRunRepository;

    /**
     * Preview the balanced journal lines that would be generated for a payroll run.
     */
    public Map<String, Object> previewPayrollJournal(int payrollRunId) {
        HrmsPayrollRun run = payrollRunRepository.findById(payrollRunId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll run not found: " + payrollRunId));

        return buildJournalPayload(run);
    }

    /**
     * Generates and commits a DRAFT FncJournalEntry for the payroll run.
     */
    @Transactional
    public FncJournalEntry pushPayrollToJournal(int payrollRunId, String postedByUsername) {
        HrmsPayrollRun run = payrollRunRepository.findById(payrollRunId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll run not found: " + payrollRunId));

        String ref = run.getPayrollReference();
        if (journalEntryRepository.existsByReferenceNumberAndStatusNot(ref, EntryStatus.VOID)) {
            throw new IllegalStateException("Journal entry with reference '" + ref + "' already exists and is not voided.");
        }

        Map<String, Object> payload = buildJournalPayload(run);
        @SuppressWarnings("unchecked")
        List<FncJournalEntryLine> lines = (List<FncJournalEntryLine>) payload.get("lines");
        BigDecimal totalDebit = (BigDecimal) payload.get("totalDebit");
        BigDecimal totalCredit = (BigDecimal) payload.get("totalCredit");

        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new IllegalStateException("Unbalanced journal: Debits (" + totalDebit + ") != Credits (" + totalCredit + ")");
        }

        FncJournalEntry entry = new FncJournalEntry();
        String entryNumber = generateEntryNumber(run.getFiscalYear().getId());
        entry.setEntryNumber(entryNumber);
        entry.setEntryDate(LocalDate.now());
        entry.setFiscalYear(run.getFiscalYear());
        entry.setReferenceNumber(ref);
        entry.setSourceType("PAYROLL");
        entry.setSourceId(String.valueOf(run.getId()));
        entry.setBillingMonth(run.getSalaryMonthName() + ", " + run.getSalaryYear());
        entry.setDescription("Monthly Payroll Accrual — " + run.getSalaryMonthName() + " " + run.getSalaryYear());
        entry.setStatus(EntryStatus.DRAFT);
        entry.setTotalDebit(totalDebit);
        entry.setTotalCredit(totalCredit);
        entry.setPostedBy(postedByUsername);
        entry.setPostedAt(LocalDateTime.now());

        // Assign lines
        int order = 1;
        for (FncJournalEntryLine line : lines) {
            line.setJournalEntry(entry);
            line.setLineOrder(order++);
        }
        entry.setLines(lines);

        FncJournalEntry saved = journalEntryRepository.save(entry);

        // Update Payroll Run status
        run.setJournalEntry(saved);
        run.setPostedToJournal(true);
        run.setApprovalStatus("POSTED_TO_JOURNAL");
        payrollRunRepository.save(run);

        return saved;
    }

    private Map<String, Object> buildJournalPayload(HrmsPayrollRun run) {
        List<HrmsPayrollAccountMap> mappings = accountMapRepository.findAllByOrderByMappingKeyAsc();
        Map<String, FncAccount> map = new HashMap<>();
        for (HrmsPayrollAccountMap m : mappings) {
            map.put(m.getMappingKey(), m.getAccount());
        }

        List<FncJournalEntryLine> lines = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        String periodDesc = run.getSalaryMonthName() + " " + run.getSalaryYear();

        // DEBITS (EXPENSES)
        addDebitLine(lines, map, "HRMS_DR_BASIC_SALARY", "Basic Salaries Expense",
                run.getTotalBasicSalary(), periodDesc, missing);

        if (run.getTotalOvertime() > 0) {
            addDebitLine(lines, map, "HRMS_DR_OVERTIME", "Overtime Pay Expense (1.5x/1.75x/2x/2.5x)",
                    run.getTotalOvertime(), periodDesc, missing);
        }

        if (run.getTotalAdditive() > 0) {
            addDebitLine(lines, map, "HRMS_DR_HOUSING_ALLOWANCE", "Allowances Expense (Housing/Transport/Hazard)",
                    run.getTotalAdditive(), periodDesc, missing);
        }

        if (run.getTotalPensionEmployer() > 0) {
            addDebitLine(lines, map, "HRMS_DR_EMPLOYER_PENSION_11", "Employer Pension Contribution (11%)",
                    run.getTotalPensionEmployer(), periodDesc, missing);
        }

        // CREDITS (LIABILITIES & BANK DISBURSEMENT)
        if (run.getTotalSalaryTax() > 0) {
            addCreditLine(lines, map, "HRMS_CR_TAX_PAYABLE", "Employment Income Tax Payable (Schedule A)",
                    run.getTotalSalaryTax(), periodDesc, missing);
        }

        double totalPension18 = run.getTotalPensionEmployee() + run.getTotalPensionEmployer();
        if (totalPension18 > 0) {
            addCreditLine(lines, map, "HRMS_CR_PENSION_PAYABLE_18", "Pension Contribution Payable (18%)",
                    totalPension18, periodDesc, missing);
        }

        double voluntaryDeductions = Math.max(0.0, run.getTotalDeductible() - run.getTotalSalaryTax() - run.getTotalPensionEmployee());
        if (voluntaryDeductions > 0) {
            addCreditLine(lines, map, "HRMS_CR_EDIR_PAYABLE", "Staff Association & Edir Deductions Payable",
                    voluntaryDeductions, periodDesc, missing);
        }

        if (run.getTotalNetCbe() > 0) {
            addCreditLine(lines, map, "HRMS_CR_NET_SALARY_CBE", "Net Salaries Payable — Commercial Bank of Ethiopia (CBE)",
                    run.getTotalNetCbe(), periodDesc, missing);
        }

        if (run.getTotalNetAbay() > 0) {
            addCreditLine(lines, map, "HRMS_CR_NET_SALARY_ABAY", "Net Salaries Payable — Abay Bank",
                    run.getTotalNetAbay(), periodDesc, missing);
        }

        if (!missing.isEmpty()) {
            throw new IllegalStateException("Missing Chart of Account mappings for: " + String.join(", ", missing) +
                    ". Please configure in HRMS Payroll Account Map.");
        }

        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;

        for (FncJournalEntryLine l : lines) {
            totalDebit = totalDebit.add(l.getDebitAmount());
            totalCredit = totalCredit.add(l.getCreditAmount());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("lines", lines);
        result.put("totalDebit", totalDebit.setScale(2, RoundingMode.HALF_UP));
        result.put("totalCredit", totalCredit.setScale(2, RoundingMode.HALF_UP));
        result.put("isBalanced", totalDebit.compareTo(totalCredit) == 0);
        result.put("period", periodDesc);
        result.put("reference", run.getPayrollReference());

        return result;
    }

    private void addDebitLine(List<FncJournalEntryLine> lines, Map<String, FncAccount> map,
                              String key, String desc, double amount, String period, List<String> missing) {
        if (amount <= 0) return;
        FncAccount account = map.get(key);
        if (account == null) {
            missing.add(desc + " (" + key + ")");
            return;
        }
        FncJournalEntryLine line = new FncJournalEntryLine();
        line.setAccount(account);
        line.setDescription(desc + " — " + period);
        line.setDebitAmount(BigDecimal.valueOf(amount).setScale(2, RoundingMode.HALF_UP));
        line.setCreditAmount(BigDecimal.ZERO);
        lines.add(line);
    }

    private void addCreditLine(List<FncJournalEntryLine> lines, Map<String, FncAccount> map,
                               String key, String desc, double amount, String period, List<String> missing) {
        if (amount <= 0) return;
        FncAccount account = map.get(key);
        if (account == null) {
            missing.add(desc + " (" + key + ")");
            return;
        }
        FncJournalEntryLine line = new FncJournalEntryLine();
        line.setAccount(account);
        line.setDescription(desc + " — " + period);
        line.setDebitAmount(BigDecimal.ZERO);
        line.setCreditAmount(BigDecimal.valueOf(amount).setScale(2, RoundingMode.HALF_UP));
        lines.add(line);
    }

    private String generateEntryNumber(int fiscalYearId) {
        String prefix = "JE-" + LocalDate.now().getYear() + "-";
        Optional<String> max = journalEntryRepository.findMaxEntryNumber(prefix + "%");
        int next = 1;
        if (max.isPresent()) {
            try {
                String suffix = max.get().substring(prefix.length());
                next = Integer.parseInt(suffix) + 1;
            } catch (Exception ignored) {}
        }
        return String.format("%s%05d", prefix, next);
    }
}
