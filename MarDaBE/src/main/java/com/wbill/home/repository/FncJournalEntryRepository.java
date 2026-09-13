package com.wbill.home.repository;

import com.wbill.home.model.FncJournalEntry;
import com.wbill.home.model.FncJournalEntry.EntryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FncJournalEntryRepository extends JpaRepository<FncJournalEntry, Long> {

    Page<FncJournalEntry> findByStatusOrderByEntryDateDesc(EntryStatus status, Pageable pageable);

    Page<FncJournalEntry> findByFiscalYearIdOrderByEntryDateDesc(int fiscalYearId, Pageable pageable);

    Page<FncJournalEntry> findByFiscalYearIdAndStatusOrderByEntryDateDesc(int fiscalYearId, EntryStatus status, Pageable pageable);

    List<FncJournalEntry> findByEntryDateBetweenAndStatus(LocalDate startDate, LocalDate endDate, EntryStatus status);

    Optional<FncJournalEntry> findBySourceTypeAndSourceId(String sourceType, String sourceId);

    @Query("SELECT MAX(je.entryNumber) FROM FncJournalEntry je WHERE je.entryNumber LIKE :prefix")
    Optional<String> findMaxEntryNumber(@Param("prefix") String prefix);

    @Query("SELECT je FROM FncJournalEntry je WHERE je.fiscalYear.id = :fyId AND je.status = 'POSTED' ORDER BY je.entryDate, je.entryNumber")
    List<FncJournalEntry> findPostedByFiscalYear(@Param("fyId") int fiscalYearId);

    @Query("SELECT je FROM FncJournalEntry je LEFT JOIN FETCH je.lines WHERE je.id = :id")
    Optional<FncJournalEntry> findByIdWithLines(@Param("id") long id);

    long countByFiscalYearIdAndStatus(int fiscalYearId, EntryStatus status);

    Page<FncJournalEntry> findAllByOrderByEntryDateDesc(Pageable pageable);

    boolean existsByReferenceNumberAndStatusNot(String referenceNumber, EntryStatus status);

    // Find all non-VOID journal entries for a billing period with lines (checks billingMonth, sourceId, and referenceNumber)
    @Query("SELECT DISTINCT je FROM FncJournalEntry je LEFT JOIN FETCH je.lines " +
           "WHERE (je.billingMonth = :billingMonth OR je.billingMonth = :billingMonthAlt OR je.billingMonth LIKE :pattern " +
           "OR je.sourceId = :billingMonth OR je.sourceId = :billingMonthAlt OR je.sourceId LIKE :pattern " +
           "OR je.referenceNumber LIKE :refPattern) " +
           "AND je.status <> 'VOID' ORDER BY je.entryDate DESC")
    List<FncJournalEntry> findNonVoidByBillingMonthWithLines(
            @Param("billingMonth") String billingMonth,
            @Param("billingMonthAlt") String billingMonthAlt,
            @Param("pattern") String pattern,
            @Param("refPattern") String refPattern);

    // Find ALL journal entries for a billing month (including DRAFT, POSTED, VOID) with lines
    @Query("SELECT DISTINCT je FROM FncJournalEntry je LEFT JOIN FETCH je.lines " +
           "WHERE (je.billingMonth = :billingMonth OR je.billingMonth = :billingMonthAlt OR je.billingMonth LIKE :pattern " +
           "OR je.sourceId = :billingMonth OR je.sourceId = :billingMonthAlt OR je.sourceId LIKE :pattern " +
           "OR je.referenceNumber LIKE :refPattern) " +
           "ORDER BY je.entryDate DESC")
    List<FncJournalEntry> findByBillingMonthWithLines(
            @Param("billingMonth") String billingMonth,
            @Param("billingMonthAlt") String billingMonthAlt,
            @Param("pattern") String pattern,
            @Param("refPattern") String refPattern);

    // Backward compatible alias
    @Query("SELECT DISTINCT je FROM FncJournalEntry je LEFT JOIN FETCH je.lines " +
           "WHERE (je.sourceId = :kifyaWer OR je.sourceId = :kifyaWerAlt OR je.sourceId LIKE :pattern " +
           "OR je.billingMonth = :kifyaWer OR je.billingMonth = :kifyaWerAlt OR je.billingMonth LIKE :pattern " +
           "OR je.referenceNumber LIKE :pattern) " +
           "AND je.status <> 'VOID'")
    List<FncJournalEntry> findNonVoidBySourceIdWithLines(
            @Param("kifyaWer") String kifyaWer,
            @Param("kifyaWerAlt") String kifyaWerAlt,
            @Param("pattern") String pattern);
}
