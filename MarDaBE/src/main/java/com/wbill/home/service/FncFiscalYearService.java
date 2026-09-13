package com.wbill.home.service;

import com.wbill.home.model.FncFiscalYear;
import com.wbill.home.model.FncOpeningBalance;
import com.wbill.home.model.FncGeneralLedger;
import com.wbill.home.model.FncAccount;
import com.wbill.home.model.FncJournalEntryLine;
import com.wbill.home.dto.FncFiscalYearCreateDTO;
import com.wbill.home.repository.FncFiscalYearRepository;
import com.wbill.home.repository.FncOpeningBalanceRepository;
import com.wbill.home.repository.FncGeneralLedgerRepository;
import com.wbill.home.repository.FncJournalEntryRepository;
import com.wbill.home.repository.FncAccountRepository;
import com.wbill.home.repository.FncJournalEntryLineRepository;
import com.wbill.home.model.FncJournalEntry.EntryStatus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@Service
public class FncFiscalYearService {

    @Autowired
    private FncFiscalYearRepository fiscalYearRepository;

    @Autowired
    private FncOpeningBalanceRepository openingBalanceRepository;

    @Autowired
    private FncGeneralLedgerRepository generalLedgerRepository;

    @Autowired
    private FncJournalEntryRepository journalEntryRepository;

    @Autowired
    private FncAccountRepository accountRepository;

    @Autowired
    private FncJournalEntryLineRepository journalEntryLineRepository;

    public List<FncFiscalYear> getAllFiscalYears() {
        return fiscalYearRepository.findAllByOrderByStartDateDesc();
    }

    public Optional<FncFiscalYear> getFiscalYearById(int id) {
        return fiscalYearRepository.findById(id);
    }

    public Optional<FncFiscalYear> getCurrentFiscalYear() {
        return fiscalYearRepository.findByDate(LocalDate.now());
    }

    public List<FncFiscalYear> getOpenFiscalYears() {
        return fiscalYearRepository.findOpenFiscalYears();
    }

    @Transactional
    public FncFiscalYear createFiscalYear(FncFiscalYearCreateDTO dto, String username) {
        LocalDate startDate = LocalDate.parse(dto.getStartDate());
        LocalDate endDate = LocalDate.parse(dto.getEndDate());

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        // Check for overlapping fiscal years
        List<FncFiscalYear> overlapping = fiscalYearRepository.findOverlapping(startDate, endDate, 0);
        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Fiscal year overlaps with existing: " + overlapping.get(0).getFiscalYearName());
        }

        FncFiscalYear fy = new FncFiscalYear();
        fy.setFiscalYearName(dto.getFiscalYearName());
        fy.setStartDate(startDate);
        fy.setEndDate(endDate);
        fy.setIsClosed(false);
        fy.setCreatedBy(username);

        return fiscalYearRepository.save(fy);
    }

    @Transactional
    public FncFiscalYear closeFiscalYear(int id, String username) {
        FncFiscalYear fy = fiscalYearRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fiscal year not found"));

        if (fy.getIsClosed()) {
            throw new IllegalArgumentException("Fiscal year is already closed");
        }

        // Check for draft entries
        long draftCount = journalEntryRepository.countByFiscalYearIdAndStatus(id, EntryStatus.DRAFT);
        if (draftCount > 0) {
            throw new IllegalArgumentException("Cannot close fiscal year with " + draftCount + " draft journal entries. Please post or delete them first.");
        }

        fy.setIsClosed(true);
        return fiscalYearRepository.save(fy);
    }

    @Transactional
    public FncFiscalYear reopenFiscalYear(int id, String username) {
        FncFiscalYear fy = fiscalYearRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fiscal year not found"));

        if (!fy.getIsClosed()) {
            throw new IllegalArgumentException("Fiscal year is already open");
        }

        fy.setIsClosed(false);
        return fiscalYearRepository.save(fy);
    }

    /**
     * Carry forward closing balances from one fiscal year to the next as opening balances.
     * Only Balance Sheet accounts (Asset, Liability, Equity) are carried forward.
     * Revenue and Expense accounts are closed to Retained Earnings.
     */
    @Transactional
    public void carryForwardBalances(int closedFiscalYearId, int newFiscalYearId) {
        FncFiscalYear closedFy = fiscalYearRepository.findById(closedFiscalYearId)
                .orElseThrow(() -> new RuntimeException("Closed fiscal year not found"));
        FncFiscalYear newFy = fiscalYearRepository.findById(newFiscalYearId)
                .orElseThrow(() -> new RuntimeException("New fiscal year not found"));

        if (!closedFy.getIsClosed()) {
            throw new IllegalArgumentException("Cannot carry forward balances from an open fiscal year");
        }
        if (newFy.getIsClosed()) {
            throw new IllegalArgumentException("Cannot carry forward balances to a closed fiscal year");
        }

        // Delete any existing opening balances for the new fiscal year to allow safe re-runs
        List<FncOpeningBalance> existingOpenings = openingBalanceRepository.findByFiscalYearId(newFiscalYearId);
        openingBalanceRepository.deleteAllInBatch(existingOpenings);

        List<FncAccount> postableAccounts = accountRepository.findPostableAccounts();

        // Build maps of opening balances and posted transactions for closedFy
        List<FncOpeningBalance> openings = openingBalanceRepository.findByFiscalYearId(closedFiscalYearId);
        Map<Integer, BigDecimal[]> openMap = new HashMap<>();
        for (FncOpeningBalance ob : openings) {
            openMap.put(ob.getAccount().getId(), new BigDecimal[]{ob.getDebitAmount(), ob.getCreditAmount()});
        }

        List<FncJournalEntryLine> lines = journalEntryLineRepository.findPostedLinesByFiscalYear(closedFiscalYearId);
        Map<Integer, BigDecimal[]> lineTotals = new HashMap<>();
        for (FncJournalEntryLine line : lines) {
            int accId = line.getAccount().getId();
            lineTotals.computeIfAbsent(accId, k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            BigDecimal[] totals = lineTotals.get(accId);
            totals[0] = totals[0].add(line.getDebitAmount());
            totals[1] = totals[1].add(line.getCreditAmount());
        }

        BigDecimal netIncome = BigDecimal.ZERO;

        for (FncAccount account : postableAccounts) {
            int accId = account.getId();
            BigDecimal[] open = openMap.getOrDefault(accId, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            BigDecimal[] totals = lineTotals.getOrDefault(accId, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});

            String accountType = account.getAccountType().name();

            if ("REVENUE".equals(accountType)) {
                // Revenue: Net Change = Credits - Debits
                BigDecimal actualRevenue = totals[1].subtract(totals[0]);
                netIncome = netIncome.add(actualRevenue);
            } else if ("EXPENSE".equals(accountType)) {
                // Expense: Net Change = Debits - Credits
                BigDecimal actualExpense = totals[0].subtract(totals[1]);
                netIncome = netIncome.subtract(actualExpense);
            } else {
                // Balance Sheet accounts: Asset, Liability, Equity (except Retained Earnings 3200)
                BigDecimal closingBalance;
                if ("ASSET".equals(accountType)) {
                    closingBalance = open[0].subtract(open[1]).add(totals[0]).subtract(totals[1]);
                } else { // LIABILITY or EQUITY
                    closingBalance = open[1].subtract(open[0]).add(totals[1]).subtract(totals[0]);
                }

                // If this is the Retained Earnings account, process it separately later
                if ("3200".equals(account.getAccountCode())) {
                    continue;
                }

                // Save opening balance for Asset, Liability, Equity if not zero
                if (closingBalance.compareTo(BigDecimal.ZERO) != 0) {
                    FncOpeningBalance ob = new FncOpeningBalance();
                    ob.setAccount(account);
                    ob.setFiscalYear(newFy);
                    if (closingBalance.compareTo(BigDecimal.ZERO) > 0) {
                        ob.setDebitAmount(closingBalance);
                        ob.setCreditAmount(BigDecimal.ZERO);
                    } else {
                        ob.setDebitAmount(BigDecimal.ZERO);
                        ob.setCreditAmount(closingBalance.abs());
                    }
                    ob.setCreatedBy("system");
                    openingBalanceRepository.save(ob);
                }
            }
        }

        // Process Retained Earnings (3200) specifically, combining its own balance with current year's Net Income
        Optional<FncAccount> reAccOpt = accountRepository.findByAccountCode("3200");
        if (reAccOpt.isPresent()) {
            FncAccount reAcc = reAccOpt.get();
            BigDecimal[] open = openMap.getOrDefault(reAcc.getId(), new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            BigDecimal[] totals = lineTotals.getOrDefault(reAcc.getId(), new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});

            // Retained Earnings closing balance before Net Income addition (Credit - Debit)
            BigDecimal closingRE = open[1].subtract(open[0]).add(totals[1]).subtract(totals[0]);

            // Add Net Income
            BigDecimal newOpeningRE = closingRE.add(netIncome);

            if (newOpeningRE.compareTo(BigDecimal.ZERO) != 0) {
                FncOpeningBalance ob = new FncOpeningBalance();
                ob.setAccount(reAcc);
                ob.setFiscalYear(newFy);
                if (newOpeningRE.compareTo(BigDecimal.ZERO) > 0) {
                    ob.setDebitAmount(BigDecimal.ZERO);
                    ob.setCreditAmount(newOpeningRE);
                } else {
                    ob.setDebitAmount(newOpeningRE.abs());
                    ob.setCreditAmount(BigDecimal.ZERO);
                }
                ob.setCreatedBy("system");
                openingBalanceRepository.save(ob);
            }
        }
    }
}
