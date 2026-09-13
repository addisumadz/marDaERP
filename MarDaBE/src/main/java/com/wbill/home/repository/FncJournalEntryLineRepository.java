package com.wbill.home.repository;

import com.wbill.home.model.FncJournalEntryLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface FncJournalEntryLineRepository extends JpaRepository<FncJournalEntryLine, Long> {

    List<FncJournalEntryLine> findByJournalEntryIdOrderByLineOrderAsc(long journalEntryId);

    @Query("SELECT jel FROM FncJournalEntryLine jel JOIN jel.journalEntry je " +
           "WHERE jel.account.id = :accountId AND je.status = 'POSTED' " +
           "ORDER BY je.entryDate, je.entryNumber, jel.lineOrder")
    List<FncJournalEntryLine> findPostedLinesByAccountId(@Param("accountId") int accountId);

    @Query("SELECT jel FROM FncJournalEntryLine jel JOIN jel.journalEntry je " +
           "WHERE jel.account.id = :accountId AND je.status = 'POSTED' " +
           "AND je.entryDate BETWEEN :startDate AND :endDate " +
           "ORDER BY je.entryDate, je.entryNumber, jel.lineOrder")
    List<FncJournalEntryLine> findPostedLinesByAccountIdAndDateRange(
            @Param("accountId") int accountId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT jel FROM FncJournalEntryLine jel JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' AND je.fiscalYear.id = :fyId " +
           "ORDER BY jel.account.accountCode, je.entryDate")
    List<FncJournalEntryLine> findPostedLinesByFiscalYear(@Param("fyId") int fiscalYearId);

    @Query("SELECT SUM(jel.debitAmount) FROM FncJournalEntryLine jel JOIN jel.journalEntry je " +
           "WHERE jel.account.id = :accountId AND je.status = 'POSTED' AND je.fiscalYear.id = :fyId")
    java.math.BigDecimal sumDebitByAccountAndFiscalYear(@Param("accountId") int accountId, @Param("fyId") int fiscalYearId);

    @Query("SELECT SUM(jel.creditAmount) FROM FncJournalEntryLine jel JOIN jel.journalEntry je " +
           "WHERE jel.account.id = :accountId AND je.status = 'POSTED' AND je.fiscalYear.id = :fyId")
    java.math.BigDecimal sumCreditByAccountAndFiscalYear(@Param("accountId") int accountId, @Param("fyId") int fiscalYearId);
}
