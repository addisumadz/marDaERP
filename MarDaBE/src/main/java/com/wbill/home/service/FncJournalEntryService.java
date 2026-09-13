package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.model.FncJournalEntry.EntryStatus;
import com.wbill.home.dto.FncJournalEntryCreateDTO;
import com.wbill.home.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class FncJournalEntryService {

    @Autowired
    private FncJournalEntryRepository journalEntryRepository;

    @Autowired
    private FncAccountRepository accountRepository;

    @Autowired
    private FncFiscalYearRepository fiscalYearRepository;

    @Autowired
    private FncGeneralLedgerService generalLedgerService;

    @Autowired
    private BillingReadingRepository billingReadingRepository;

    public Page<FncJournalEntry> getAllEntries(int page, int size) {
        return journalEntryRepository.findAllByOrderByEntryDateDesc(PageRequest.of(page, size));
    }

    public Page<FncJournalEntry> getEntriesByStatus(EntryStatus status, int page, int size) {
        return journalEntryRepository.findByStatusOrderByEntryDateDesc(status, PageRequest.of(page, size));
    }

    public Page<FncJournalEntry> getEntriesByFiscalYear(int fiscalYearId, int page, int size) {
        return journalEntryRepository.findByFiscalYearIdOrderByEntryDateDesc(fiscalYearId, PageRequest.of(page, size));
    }

    public Page<FncJournalEntry> getEntriesByFiscalYearAndStatus(int fiscalYearId, EntryStatus status, int page, int size) {
        return journalEntryRepository.findByFiscalYearIdAndStatusOrderByEntryDateDesc(fiscalYearId, status, PageRequest.of(page, size));
    }

    public Optional<FncJournalEntry> getEntryById(long id) {
        return journalEntryRepository.findByIdWithLines(id);
    }

    @Transactional
    public FncJournalEntry createEntry(FncJournalEntryCreateDTO dto, String username) {
        // Validate fiscal year
        FncFiscalYear fy = fiscalYearRepository.findById(dto.getFiscalYearId())
                .orElseThrow(() -> new IllegalArgumentException("Fiscal year not found"));

        if (fy.getIsClosed()) {
            throw new IllegalArgumentException("Cannot create entries in a closed fiscal year");
        }

        // Check duplicate reference number (excludes VOID entries)
        if (dto.getReferenceNumber() != null && !dto.getReferenceNumber().isEmpty()) {
            boolean exists = journalEntryRepository.existsByReferenceNumberAndStatusNot(
                    dto.getReferenceNumber(), EntryStatus.VOID
            );
            if (exists) {
                throw new IllegalArgumentException(
                        "A journal entry with reference '" + dto.getReferenceNumber() + "' already exists"
                );
            }
        }

        // Validate lines
        if (dto.getLines() == null || dto.getLines().size() < 2) {
            throw new IllegalArgumentException("Journal entry must have at least 2 lines");
        }

        // Calculate totals and validate balance
        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;
        for (FncJournalEntryCreateDTO.LineItem line : dto.getLines()) {
            BigDecimal dr = BigDecimal.valueOf(line.getDebitAmount()).setScale(2, java.math.RoundingMode.HALF_UP);
            BigDecimal cr = BigDecimal.valueOf(line.getCreditAmount()).setScale(2, java.math.RoundingMode.HALF_UP);
            totalDebit = totalDebit.add(dr);
            totalCredit = totalCredit.add(cr);
        }

        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new IllegalArgumentException("Total debits (" + totalDebit + ") must equal total credits (" + totalCredit + ")");
        }

        if (totalDebit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Journal entry total must be greater than zero");
        }

        // Generate entry number
        String entryNumber = generateEntryNumber(fy);

        // Create entry
        FncJournalEntry entry = new FncJournalEntry();
        entry.setEntryNumber(entryNumber);
        entry.setEntryDate(LocalDate.parse(dto.getEntryDate()));
        entry.setFiscalYear(fy);
        entry.setReferenceNumber(dto.getReferenceNumber());
        entry.setDescription(dto.getDescription());
        entry.setSourceType(dto.getSourceType() != null ? dto.getSourceType() : "MANUAL");
        String bMonth = dto.getBillingMonth() != null ? dto.getBillingMonth() : dto.getBillingPeriod();
        entry.setBillingMonth(bMonth);
        entry.setSourceId(dto.getBillingPeriod() != null ? dto.getBillingPeriod() : dto.getBillingMonth()); // Store kifyaWer for bill marking on post
        entry.setStatus(EntryStatus.DRAFT);
        entry.setTotalDebit(totalDebit);
        entry.setTotalCredit(totalCredit);
        entry.setCreatedBy(username);

        // Create lines
        int order = 0;
        for (FncJournalEntryCreateDTO.LineItem lineDto : dto.getLines()) {
            FncAccount account = accountRepository.findById(lineDto.getAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("Account not found: " + lineDto.getAccountId()));

            if (account.getIsHeader()) {
                throw new IllegalArgumentException("Cannot post to header account: " + account.getAccountCode());
            }

            BigDecimal dr = BigDecimal.valueOf(lineDto.getDebitAmount()).setScale(2, java.math.RoundingMode.HALF_UP);
            BigDecimal cr = BigDecimal.valueOf(lineDto.getCreditAmount()).setScale(2, java.math.RoundingMode.HALF_UP);

            FncJournalEntryLine line = new FncJournalEntryLine();
            line.setAccount(account);
            line.setDescription(lineDto.getDescription());
            line.setDebitAmount(dr);
            line.setCreditAmount(cr);
            line.setLineOrder(order++);
            entry.addLine(line);
        }

        return journalEntryRepository.save(entry);
    }

    @Transactional
    public FncJournalEntry updateEntry(long id, FncJournalEntryCreateDTO dto, String username) {
        FncJournalEntry entry = journalEntryRepository.findByIdWithLines(id)
                .orElseThrow(() -> new RuntimeException("Journal entry not found"));

        if (entry.getStatus() != EntryStatus.DRAFT) {
            throw new IllegalArgumentException("Can only edit draft entries");
        }

        // Validate lines
        if (dto.getLines() == null || dto.getLines().size() < 2) {
            throw new IllegalArgumentException("Journal entry must have at least 2 lines");
        }

        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;
        for (FncJournalEntryCreateDTO.LineItem line : dto.getLines()) {
            BigDecimal dr = BigDecimal.valueOf(line.getDebitAmount()).setScale(2, java.math.RoundingMode.HALF_UP);
            BigDecimal cr = BigDecimal.valueOf(line.getCreditAmount()).setScale(2, java.math.RoundingMode.HALF_UP);
            totalDebit = totalDebit.add(dr);
            totalCredit = totalCredit.add(cr);
        }

        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new IllegalArgumentException("Total debits (" + totalDebit + ") must equal total credits (" + totalCredit + ")");
        }

        entry.setEntryDate(LocalDate.parse(dto.getEntryDate()));
        entry.setReferenceNumber(dto.getReferenceNumber());
        entry.setDescription(dto.getDescription());
        String bMonth = dto.getBillingMonth() != null ? dto.getBillingMonth() : dto.getBillingPeriod();
        if (bMonth != null) {
            entry.setBillingMonth(bMonth);
        }
        entry.setTotalDebit(totalDebit);
        entry.setTotalCredit(totalCredit);

        // Clear and re-add lines
        entry.getLines().clear();
        int order = 0;
        for (FncJournalEntryCreateDTO.LineItem lineDto : dto.getLines()) {
            FncAccount account = accountRepository.findById(lineDto.getAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("Account not found: " + lineDto.getAccountId()));

            if (account.getIsHeader()) {
                throw new IllegalArgumentException("Cannot post to header account: " + account.getAccountCode());
            }

            BigDecimal dr = BigDecimal.valueOf(lineDto.getDebitAmount()).setScale(2, java.math.RoundingMode.HALF_UP);
            BigDecimal cr = BigDecimal.valueOf(lineDto.getCreditAmount()).setScale(2, java.math.RoundingMode.HALF_UP);

            FncJournalEntryLine line = new FncJournalEntryLine();
            line.setAccount(account);
            line.setDescription(lineDto.getDescription());
            line.setDebitAmount(dr);
            line.setCreditAmount(cr);
            line.setLineOrder(order++);
            entry.addLine(line);
        }

        return journalEntryRepository.save(entry);
    }

    @Transactional
    public FncJournalEntry postEntry(long id, String username) {
        FncJournalEntry entry = journalEntryRepository.findByIdWithLines(id)
                .orElseThrow(() -> new RuntimeException("Journal entry not found"));

        if (entry.getStatus() != EntryStatus.DRAFT) {
            throw new IllegalArgumentException("Can only post draft entries");
        }

        if (entry.getFiscalYear().getIsClosed()) {
            throw new IllegalArgumentException("Cannot post to a closed fiscal year");
        }

        entry.setStatus(EntryStatus.POSTED);
        entry.setPostedBy(username);
        entry.setPostedAt(LocalDateTime.now());

        FncJournalEntry saved = journalEntryRepository.save(entry);

        // Update general ledger
        generalLedgerService.updateLedgerForPostedEntry(saved);

        // Mark billing readings as journal-pushed when entry is posted
        String billingRef = saved.getBillingMonth() != null && !saved.getBillingMonth().isEmpty() 
                ? saved.getBillingMonth() : saved.getSourceId();
        if (billingRef != null && !billingRef.isEmpty() && saved.getReferenceNumber() != null) {
            try {
                String sourceType = saved.getSourceType() != null ? saved.getSourceType() : "";
                if ("BILL_COLLECTION".equals(sourceType)) {
                    // Paid bill journal — uses isPaidJournalPushed / paidJournalEntryRef
                    int markedCount = billingReadingRepository.markPaidBillsAsJournalPushed(
                            billingRef, saved.getReferenceNumber()
                    );
                    System.out.println("[JournalPost] Marked " + markedCount + " paid bills as paid-journal-pushed for " 
                            + billingRef + " ref=" + saved.getReferenceNumber());
                } else {
                    // Bill Preparation journal — uses isJournalPushed / journalEntryRef
                    int markedCount = billingReadingRepository.markBillsAsJournalPushed(
                            billingRef, saved.getReferenceNumber()
                    );
                    System.out.println("[JournalPost] Marked " + markedCount + " bills as journal-pushed for " 
                            + billingRef + " ref=" + saved.getReferenceNumber());
                }
            } catch (Exception e) {
                System.err.println("[JournalPost] Warning: Failed to mark bills as pushed: " + e.getMessage());
                // Don't fail the post — the journal entry itself is valid
            }
        }

        return saved;
    }

    @Transactional
    public FncJournalEntry voidEntry(long id, String voidReason, String username) {
        FncJournalEntry entry = journalEntryRepository.findByIdWithLines(id)
                .orElseThrow(() -> new RuntimeException("Journal entry not found"));

        if (entry.getStatus() != EntryStatus.POSTED) {
            throw new IllegalArgumentException("Can only void posted entries");
        }

        // Reverse the ledger impact
        generalLedgerService.reverseLedgerForVoidedEntry(entry);

        // Reset journal pushed flags for bills linked to this voided entry
        if (entry.getReferenceNumber() != null) {
            try {
                String sourceType = entry.getSourceType() != null ? entry.getSourceType() : "";
                if ("BILL_COLLECTION".equals(sourceType)) {
                    // Paid bill journal — reset isPaidJournalPushed / paidJournalEntryRef
                    int resetCount = billingReadingRepository.resetPaidJournalPushedByRef(entry.getReferenceNumber());
                    System.out.println("[JournalVoid] Reset " + resetCount + " paid bills for voided ref=" + entry.getReferenceNumber());
                } else {
                    // Bill Preparation journal — reset isJournalPushed / journalEntryRef
                    int resetCount = billingReadingRepository.resetJournalPushedByRef(entry.getReferenceNumber());
                    System.out.println("[JournalVoid] Reset " + resetCount + " bills for voided ref=" + entry.getReferenceNumber());
                }
            } catch (Exception e) {
                System.err.println("[JournalVoid] Warning: Failed to reset bill pushed flags: " + e.getMessage());
            }
        }

        entry.setStatus(EntryStatus.VOID);
        entry.setVoidedBy(username);
        entry.setVoidedAt(LocalDateTime.now());
        entry.setVoidReason(voidReason);

        return journalEntryRepository.save(entry);
    }

    @Transactional
    public void deleteEntry(long id) {
        FncJournalEntry entry = journalEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Journal entry not found"));

        if (entry.getStatus() != EntryStatus.DRAFT) {
            throw new IllegalArgumentException("Can only delete draft entries");
        }

        journalEntryRepository.delete(entry);
    }


    /**
     * Calculates journal balance summary for a billing period.
     * Groups total debits by sourceType: BILL_PREP, BILL_ADJUSTMENT, BILL_COLLECTION, UNPAID_REVERSAL
     */
    public Map<String, Object> getJournalBalanceSummary(String kifyaWer) {
        String kifyaWerWithComma = kifyaWer != null && kifyaWer.contains(",") ? kifyaWer : (kifyaWer != null ? kifyaWer.replace(" ", ", ") : "");
        String kifyaWerNoComma = kifyaWer != null ? kifyaWer.replace(",", "").replaceAll("\\s+", " ").trim() : "";
        String pattern = "%" + kifyaWerNoComma.replace(" ", "%") + "%";
        String refPattern = "%" + kifyaWerNoComma.replace(" ", "%") + "%";

        List<FncJournalEntry> entries = journalEntryRepository.findNonVoidByBillingMonthWithLines(
                kifyaWerWithComma, kifyaWerNoComma, pattern, refPattern
        );
        
        BigDecimal billPrepTotal = BigDecimal.ZERO;
        BigDecimal billPrepSupTotal = BigDecimal.ZERO;
        BigDecimal adjustmentTotal = BigDecimal.ZERO;
        BigDecimal collectionTotal = BigDecimal.ZERO;
        BigDecimal unpaidReversalTotal = BigDecimal.ZERO;
        
        for (FncJournalEntry entry : entries) {
            String sourceType = entry.getSourceType() != null ? entry.getSourceType() : "";
            BigDecimal debitTotal = entry.getTotalDebit() != null ? entry.getTotalDebit() : BigDecimal.ZERO;
            
            switch (sourceType) {
                case "BILL_PREP":
                    billPrepTotal = billPrepTotal.add(debitTotal);
                    break;
                case "BILL_PREP_SUP":
                    billPrepSupTotal = billPrepSupTotal.add(debitTotal);
                    break;
                case "BILL_ADJUSTMENT":
                    adjustmentTotal = adjustmentTotal.add(debitTotal);
                    break;
                case "BILL_COLLECTION":
                    collectionTotal = collectionTotal.add(debitTotal);
                    break;
                case "UNPAID_REVERSAL":
                    unpaidReversalTotal = unpaidReversalTotal.add(debitTotal);
                    break;
                default:
                    break;
            }
        }
        
        // Total Billed = Initial Bill Prep + Supplemental Bill Prep
        BigDecimal totalBilled = billPrepTotal.add(billPrepSupTotal);
        // Expected unpaid = totalBilled - adjustments (net) - collected - previously reversed
        BigDecimal expectedUnpaid = totalBilled.subtract(collectionTotal).subtract(unpaidReversalTotal);
        
        Map<String, Object> result = new HashMap<>();
        result.put("billPrepTotal", billPrepTotal);
        result.put("billPrepSupTotal", billPrepSupTotal);
        result.put("totalBilled", totalBilled);
        result.put("adjustmentTotal", adjustmentTotal);
        result.put("collectionTotal", collectionTotal);
        result.put("unpaidReversalTotal", unpaidReversalTotal);
        result.put("expectedUnpaid", expectedUnpaid);
        result.put("entryCount", entries.size());
        return result;
    }

    /**
     * Finds all journal entries (DRAFT, POSTED, VOID) for a selected billing month.
     */
    public List<FncJournalEntry> getEntriesByBillingMonth(String billingMonth) {
        String kifyaWerWithComma = billingMonth != null && billingMonth.contains(",") ? billingMonth : (billingMonth != null ? billingMonth.replace(" ", ", ") : "");
        String kifyaWerNoComma = billingMonth != null ? billingMonth.replace(",", "").replaceAll("\\s+", " ").trim() : "";
        String pattern = "%" + kifyaWerNoComma.replace(" ", "%") + "%";
        String refPattern = "%" + kifyaWerNoComma.replace(" ", "%") + "%";

        return journalEntryRepository.findByBillingMonthWithLines(
                kifyaWerWithComma, kifyaWerNoComma, pattern, refPattern
        );
    }

    private String generateEntryNumber(FncFiscalYear fy) {
        String prefix = "JE-" + fy.getFiscalYearName().replaceAll("[^0-9]", "").substring(0, Math.min(4, fy.getFiscalYearName().replaceAll("[^0-9]", "").length())) + "-";
        Optional<String> maxNumber = journalEntryRepository.findMaxEntryNumber(prefix + "%");

        if (maxNumber.isPresent()) {
            String lastNum = maxNumber.get().substring(prefix.length());
            int next = Integer.parseInt(lastNum) + 1;
            return prefix + String.format("%05d", next);
        }
        return prefix + "00001";
    }
}
