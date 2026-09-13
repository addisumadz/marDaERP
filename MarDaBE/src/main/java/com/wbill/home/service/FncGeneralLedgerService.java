package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.repository.FncGeneralLedgerRepository;
import com.wbill.home.repository.FncOpeningBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class FncGeneralLedgerService {

    @Autowired
    private FncGeneralLedgerRepository generalLedgerRepository;

    @Autowired
    private FncOpeningBalanceRepository openingBalanceRepository;

    @Transactional
    public void updateLedgerForPostedEntry(FncJournalEntry entry) {
        int fiscalYearId = entry.getFiscalYear().getId();
        int periodMonth = entry.getEntryDate().getMonthValue();
        for (FncJournalEntryLine line : entry.getLines()) {
            int accountId = line.getAccount().getId();
            Optional<FncGeneralLedger> opt = generalLedgerRepository
                    .findByAccountIdAndFiscalYearIdAndPeriodMonth(accountId, fiscalYearId, periodMonth);
            FncGeneralLedger gl;
            if (opt.isPresent()) {
                gl = opt.get();
            } else {
                gl = new FncGeneralLedger();
                gl.setAccount(line.getAccount());
                gl.setFiscalYear(entry.getFiscalYear());
                gl.setPeriodMonth(periodMonth);
                gl.setOpeningBalance(BigDecimal.ZERO);
                gl.setTotalDebit(BigDecimal.ZERO);
                gl.setTotalCredit(BigDecimal.ZERO);
                gl.setClosingBalance(BigDecimal.ZERO);
            }
            gl.setTotalDebit(gl.getTotalDebit().add(line.getDebitAmount()));
            gl.setTotalCredit(gl.getTotalCredit().add(line.getCreditAmount()));
            generalLedgerRepository.save(gl);

            recalculateBalancesFromMonth(accountId, fiscalYearId, periodMonth, line.getAccount());
        }
    }

    @Transactional
    public void reverseLedgerForVoidedEntry(FncJournalEntry entry) {
        int fiscalYearId = entry.getFiscalYear().getId();
        int periodMonth = entry.getEntryDate().getMonthValue();
        for (FncJournalEntryLine line : entry.getLines()) {
            int accountId = line.getAccount().getId();
            Optional<FncGeneralLedger> opt = generalLedgerRepository
                    .findByAccountIdAndFiscalYearIdAndPeriodMonth(accountId, fiscalYearId, periodMonth);
            if (opt.isPresent()) {
                FncGeneralLedger gl = opt.get();
                gl.setTotalDebit(gl.getTotalDebit().subtract(line.getDebitAmount()));
                gl.setTotalCredit(gl.getTotalCredit().subtract(line.getCreditAmount()));
                generalLedgerRepository.save(gl);

                recalculateBalancesFromMonth(accountId, fiscalYearId, periodMonth, line.getAccount());
            }
        }
    }

    private void recalculateBalancesFromMonth(int accountId, int fiscalYearId, int startMonth, FncAccount account) {
        List<FncGeneralLedger> slices = generalLedgerRepository
                .findByAccountIdAndFiscalYearIdOrderByPeriodMonthAsc(accountId, fiscalYearId);

        BigDecimal runningBalance = BigDecimal.ZERO;

        // Find if there is any slice before startMonth to initialize runningBalance
        FncGeneralLedger closestPrior = null;
        for (FncGeneralLedger slice : slices) {
            if (slice.getPeriodMonth() < startMonth) {
                if (closestPrior == null || slice.getPeriodMonth() > closestPrior.getPeriodMonth()) {
                    closestPrior = slice;
                }
            }
        }

        if (closestPrior != null) {
            runningBalance = closestPrior.getClosingBalance();
        } else {
            Optional<FncOpeningBalance> ob = openingBalanceRepository
                    .findByAccountIdAndFiscalYearId(accountId, fiscalYearId);
            if (ob.isPresent()) {
                if (account.getNormalBalance() == FncAccount.NormalBalance.DEBIT) {
                    runningBalance = ob.get().getDebitAmount().subtract(ob.get().getCreditAmount());
                } else {
                    runningBalance = ob.get().getCreditAmount().subtract(ob.get().getDebitAmount());
                }
            }
        }

        // Update startMonth and all subsequent months in order
        for (FncGeneralLedger slice : slices) {
            if (slice.getPeriodMonth() >= startMonth) {
                slice.setOpeningBalance(runningBalance);
                if (account.getNormalBalance() == FncAccount.NormalBalance.DEBIT) {
                    slice.setClosingBalance(runningBalance.add(slice.getTotalDebit()).subtract(slice.getTotalCredit()));
                } else {
                    slice.setClosingBalance(runningBalance.add(slice.getTotalCredit()).subtract(slice.getTotalDebit()));
                }
                generalLedgerRepository.save(slice);
                runningBalance = slice.getClosingBalance();
            }
        }
    }

    public List<FncGeneralLedger> getLedgerByFiscalYear(int fiscalYearId) {
        return generalLedgerRepository.findByFiscalYearWithAccount(fiscalYearId);
    }

    public List<FncGeneralLedger> getLedgerByAccountAndFiscalYear(int accountId, int fiscalYearId) {
        return generalLedgerRepository.findByAccountIdAndFiscalYearIdOrderByPeriodMonthAsc(accountId, fiscalYearId);
    }
}
