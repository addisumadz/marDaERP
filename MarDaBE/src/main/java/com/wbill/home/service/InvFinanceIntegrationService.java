package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.model.FncJournalEntry.EntryStatus;
import com.wbill.home.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Optional;

/**
 * Finance integration service for inventory module.
 * Automatically creates journal entries for:
 * - GRN confirmation (Dr. Inventory Asset, Cr. Accounts Payable)
 * - Issue/Sale (Dr. COGS/Expense, Cr. Inventory Asset)
 * - Stock Adjustment (Dr/Cr. Inventory Adjustment, Cr/Dr. Inventory Asset)
 *
 * Note: Account codes are looked up by code. The following accounts should exist:
 * - INVENTORY_ASSET (e.g., 1300)
 * - ACCOUNTS_PAYABLE (e.g., 2100)
 * - COGS (e.g., 5100)
 * - INVENTORY_EXPENSE (e.g., 6200)
 * - INVENTORY_ADJUSTMENT (e.g., 6300)
 */
@Service
public class InvFinanceIntegrationService {

    @Autowired
    private FncJournalEntryRepository journalEntryRepository;

    @Autowired
    private FncAccountRepository accountRepository;

    @Autowired
    private FncFiscalYearRepository fiscalYearRepository;

    @Autowired
    private FncBillingAccountMapRepository accountMapRepository;

    // Mapping Keys
    public static final String KEY_DR_GRN_ASSET = "INV_DR_GRN_ASSET";
    public static final String KEY_CR_GRN_PAYABLE = "INV_CR_GRN_PAYABLE";
    public static final String KEY_DR_ISSUE_EXPENSE = "INV_DR_ISSUE_EXPENSE";
    public static final String KEY_CR_ISSUE_ASSET = "INV_CR_ISSUE_ASSET";
    public static final String KEY_DR_SALE_COGS = "INV_DR_SALE_COGS";
    public static final String KEY_CR_SALE_ASSET = "INV_CR_SALE_ASSET";
    public static final String KEY_DR_ADJUST_GAIN_ASSET = "INV_DR_ADJUST_GAIN_ASSET";
    public static final String KEY_CR_ADJUST_GAIN_REV = "INV_CR_ADJUST_GAIN_REV";
    public static final String KEY_DR_ADJUST_LOSS_EXP = "INV_DR_ADJUST_LOSS_EXP";
    public static final String KEY_CR_ADJUST_LOSS_ASSET = "INV_CR_ADJUST_LOSS_ASSET";
    public static final String KEY_DR_TRANSFER_ASSET = "INV_DR_TRANSFER_ASSET";
    public static final String KEY_CR_TRANSFER_ASSET = "INV_CR_TRANSFER_ASSET";

    // Account codes - fallback defaults
    private static final String INVENTORY_ASSET_CODE = "1300";
    private static final String ACCOUNTS_PAYABLE_CODE = "2100";
    private static final String COGS_CODE = "5100";
    private static final String INVENTORY_EXPENSE_CODE = "6200";
    private static final String INVENTORY_ADJUSTMENT_CODE = "6300";

    /**
     * GRN Confirmed: Dr. Inventory Asset, Cr. Accounts Payable
     */
    @Transactional
    public FncJournalEntry createGRNJournalEntry(InvGoodsReceivedNote grn, String username) {
        FncAccount inventoryAccount = resolveAccount(KEY_DR_GRN_ASSET, INVENTORY_ASSET_CODE);
        FncAccount apAccount = resolveAccount(KEY_CR_GRN_PAYABLE, ACCOUNTS_PAYABLE_CODE);

        if (inventoryAccount == null || apAccount == null) {
            return null; // Accounts not configured yet, skip finance integration
        }

        FncJournalEntry entry = new FncJournalEntry();
        entry.setEntryNumber(generateEntryNumber());
        entry.setEntryDate(LocalDate.now());
        entry.setFiscalYear(getCurrentFiscalYear());
        entry.setReferenceNumber(grn.getGrnNumber());
        entry.setSourceType("INVENTORY_GRN");
        entry.setSourceId(String.valueOf(grn.getId()));
        entry.setDescription("Goods Received - " + grn.getGrnNumber() + " from " + grn.getSupplier().getSupplierName());
        entry.setStatus(EntryStatus.POSTED);
        entry.setTotalDebit(grn.getTotalAmount());
        entry.setTotalCredit(grn.getTotalAmount());
        entry.setPostedBy(username);
        entry.setCreatedBy(username);

        // Debit: Inventory Asset
        FncJournalEntryLine debitLine = new FncJournalEntryLine();
        debitLine.setAccount(inventoryAccount);
        debitLine.setDescription("Inventory received - " + grn.getGrnNumber());
        debitLine.setDebitAmount(grn.getTotalAmount());
        debitLine.setCreditAmount(BigDecimal.ZERO);
        debitLine.setLineOrder(1);
        entry.addLine(debitLine);

        // Credit: Accounts Payable
        FncJournalEntryLine creditLine = new FncJournalEntryLine();
        creditLine.setAccount(apAccount);
        creditLine.setDescription("Payable to " + grn.getSupplier().getSupplierName());
        creditLine.setDebitAmount(BigDecimal.ZERO);
        creditLine.setCreditAmount(grn.getTotalAmount());
        creditLine.setLineOrder(2);
        entry.addLine(creditLine);

        return journalEntryRepository.save(entry);
    }

    /**
     * Issue/Sale: Dr. COGS or Expense, Cr. Inventory Asset
     */
    @Transactional
    public FncJournalEntry createIssueJournalEntry(InvIssueVoucher voucher, String username) {
        boolean isSale = voucher.getIssueType() == InvIssueVoucher.IssueType.SALE;
        FncAccount inventoryAccount = resolveAccount(isSale ? KEY_CR_SALE_ASSET : KEY_CR_ISSUE_ASSET, INVENTORY_ASSET_CODE);
        FncAccount expenseAccount = isSale
                ? resolveAccount(KEY_DR_SALE_COGS, COGS_CODE)
                : resolveAccount(KEY_DR_ISSUE_EXPENSE, INVENTORY_EXPENSE_CODE);

        // Fallback between COGS and Expense if one is configured
        if (expenseAccount == null) {
            expenseAccount = resolveAccount(KEY_DR_ISSUE_EXPENSE, INVENTORY_EXPENSE_CODE);
        }
        if (expenseAccount == null) {
            expenseAccount = resolveAccount(KEY_DR_SALE_COGS, COGS_CODE);
        }

        if (inventoryAccount == null || expenseAccount == null) {
            System.err.println("Notice: Finance journal entry skipped because inventory accounts could not be resolved. Mapping: " + (isSale ? KEY_DR_SALE_COGS : KEY_DR_ISSUE_EXPENSE));
            return null;
        }

        BigDecimal totalAmt = voucher.getTotalAmount();
        if ((totalAmt == null || totalAmt.compareTo(BigDecimal.ZERO) <= 0) && voucher.getLines() != null && !voucher.getLines().isEmpty()) {
            totalAmt = voucher.getLines().stream()
                    .map(l -> l.getTotalCost() != null ? l.getTotalCost() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            voucher.setTotalAmount(totalAmt);
        }
        if (totalAmt == null || totalAmt.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        FncJournalEntry entry = new FncJournalEntry();
        entry.setEntryNumber(generateEntryNumber());
        entry.setEntryDate(LocalDate.now());
        entry.setFiscalYear(getCurrentFiscalYear());
        entry.setReferenceNumber(voucher.getVoucherNumber());
        entry.setSourceType("INVENTORY_ISSUE");
        entry.setSourceId(String.valueOf(voucher.getId()));
        String issueDesc = voucher.getIssueType() == InvIssueVoucher.IssueType.SALE
                ? "Sale / Customer Utility Materials" : "Maintenance / Internal Issue";
        entry.setDescription(issueDesc + " - " + voucher.getVoucherNumber() + 
                (voucher.getIssuedTo() != null ? " (" + voucher.getIssuedTo() + ")" : ""));
        entry.setStatus(EntryStatus.POSTED);
        entry.setTotalDebit(totalAmt);
        entry.setTotalCredit(totalAmt);
        entry.setPostedBy(username);
        entry.setPostedAt(LocalDateTime.now());
        entry.setCreatedBy(username);

        // Debit: COGS or Expense
        FncJournalEntryLine debitLine = new FncJournalEntryLine();
        debitLine.setAccount(expenseAccount);
        debitLine.setDescription(issueDesc + " - " + voucher.getVoucherNumber());
        debitLine.setDebitAmount(totalAmt);
        debitLine.setCreditAmount(BigDecimal.ZERO);
        debitLine.setLineOrder(1);
        entry.addLine(debitLine);

        // Credit: Inventory Asset
        FncJournalEntryLine creditLine = new FncJournalEntryLine();
        creditLine.setAccount(inventoryAccount);
        creditLine.setDescription("Inventory issued - " + voucher.getVoucherNumber());
        creditLine.setDebitAmount(BigDecimal.ZERO);
        creditLine.setCreditAmount(totalAmt);
        creditLine.setLineOrder(2);
        entry.addLine(creditLine);

        return journalEntryRepository.save(entry);
    }

    /**
     * Stock Adjustment:
     * - Positive variance: Dr. Inventory Asset, Cr. Inventory Adjustment
     * - Negative variance: Dr. Inventory Adjustment, Cr. Inventory Asset
     */
    @Transactional
    public FncJournalEntry createAdjustmentJournalEntry(InvStockAdjustment adj, String username) {
        BigDecimal totalVarianceCost = adj.getLines().stream()
                .map(InvStockAdjustmentLine::getVarianceCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalVarianceCost.compareTo(BigDecimal.ZERO) == 0) {
            return null; // No variance, no journal entry needed
        }

        FncAccount inventoryAccount;
        FncAccount adjustmentAccount;

        if (totalVarianceCost.compareTo(BigDecimal.ZERO) > 0) {
            // Positive variance (gain): Dr. Inventory Asset, Cr. Adjustment Gain
            inventoryAccount = resolveAccount(KEY_DR_ADJUST_GAIN_ASSET, INVENTORY_ASSET_CODE);
            adjustmentAccount = resolveAccount(KEY_CR_ADJUST_GAIN_REV, INVENTORY_ADJUSTMENT_CODE);
        } else {
            // Negative variance (loss): Dr. Adjustment Loss, Cr. Inventory Asset
            adjustmentAccount = resolveAccount(KEY_DR_ADJUST_LOSS_EXP, INVENTORY_ADJUSTMENT_CODE);
            inventoryAccount = resolveAccount(KEY_CR_ADJUST_LOSS_ASSET, INVENTORY_ASSET_CODE);
        }

        if (inventoryAccount == null || adjustmentAccount == null) {
            return null;
        }

        BigDecimal absVariance = totalVarianceCost.abs();

        FncJournalEntry entry = new FncJournalEntry();
        entry.setEntryNumber(generateEntryNumber());
        entry.setEntryDate(LocalDate.now());
        entry.setFiscalYear(getCurrentFiscalYear());
        entry.setReferenceNumber(adj.getAdjustmentNumber());
        entry.setSourceType("INVENTORY_ADJUSTMENT");
        entry.setSourceId(String.valueOf(adj.getId()));
        entry.setDescription("Stock Adjustment - " + adj.getAdjustmentNumber() + " (" + adj.getAdjustmentType() + ")");
        entry.setStatus(EntryStatus.POSTED);
        entry.setTotalDebit(absVariance);
        entry.setTotalCredit(absVariance);
        entry.setPostedBy(username);
        entry.setCreatedBy(username);

        FncJournalEntryLine debitLine = new FncJournalEntryLine();
        FncJournalEntryLine creditLine = new FncJournalEntryLine();

        if (totalVarianceCost.compareTo(BigDecimal.ZERO) > 0) {
            // Positive variance (gain): Dr. Inventory, Cr. Adjustment
            debitLine.setAccount(inventoryAccount);
            debitLine.setDescription("Inventory gain");
            creditLine.setAccount(adjustmentAccount);
            creditLine.setDescription("Adjustment gain");
        } else {
            // Negative variance (loss): Dr. Adjustment, Cr. Inventory
            debitLine.setAccount(adjustmentAccount);
            debitLine.setDescription("Inventory loss/write-off");
            creditLine.setAccount(inventoryAccount);
            creditLine.setDescription("Inventory reduced");
        }

        debitLine.setDebitAmount(absVariance);
        debitLine.setCreditAmount(BigDecimal.ZERO);
        debitLine.setLineOrder(1);
        entry.addLine(debitLine);

        creditLine.setDebitAmount(BigDecimal.ZERO);
        creditLine.setCreditAmount(absVariance);
        creditLine.setLineOrder(2);
        entry.addLine(creditLine);

        return journalEntryRepository.save(entry);
    }

    /**
     * Transfer Received: Dr. Destination Store Asset, Cr. Source Store Asset
     */
    @Transactional
    public FncJournalEntry createTransferJournalEntry(InvStockTransfer transfer, String username) {
        FncAccount destinationAccount = resolveAccount(KEY_DR_TRANSFER_ASSET, INVENTORY_ASSET_CODE);
        FncAccount sourceAccount = resolveAccount(KEY_CR_TRANSFER_ASSET, INVENTORY_ASSET_CODE);

        if (destinationAccount == null || sourceAccount == null || transfer.getTotalAmount() == null || transfer.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        FncJournalEntry entry = new FncJournalEntry();
        entry.setEntryNumber(generateEntryNumber());
        entry.setEntryDate(LocalDate.now());
        entry.setFiscalYear(getCurrentFiscalYear());
        entry.setReferenceNumber(transfer.getTransferNumber());
        entry.setSourceType("INVENTORY_TRANSFER");
        entry.setSourceId(String.valueOf(transfer.getId()));
        entry.setDescription("Stock Transfer - " + transfer.getTransferNumber() + " from " +
                (transfer.getFromStore() != null ? transfer.getFromStore().getStoreName() : "Source Store") + " to " +
                (transfer.getToStore() != null ? transfer.getToStore().getStoreName() : "Destination Store"));
        entry.setStatus(EntryStatus.POSTED);
        entry.setTotalDebit(transfer.getTotalAmount());
        entry.setTotalCredit(transfer.getTotalAmount());
        entry.setPostedBy(username);
        entry.setCreatedBy(username);

        // Debit: Destination Store Inventory Asset
        FncJournalEntryLine debitLine = new FncJournalEntryLine();
        debitLine.setAccount(destinationAccount);
        debitLine.setDescription("Stock transferred into " + (transfer.getToStore() != null ? transfer.getToStore().getStoreName() : "destination"));
        debitLine.setDebitAmount(transfer.getTotalAmount());
        debitLine.setCreditAmount(BigDecimal.ZERO);
        debitLine.setLineOrder(1);
        entry.addLine(debitLine);

        // Credit: Source Store Inventory Asset
        FncJournalEntryLine creditLine = new FncJournalEntryLine();
        creditLine.setAccount(sourceAccount);
        creditLine.setDescription("Stock transferred out from " + (transfer.getFromStore() != null ? transfer.getFromStore().getStoreName() : "source"));
        creditLine.setDebitAmount(BigDecimal.ZERO);
        creditLine.setCreditAmount(transfer.getTotalAmount());
        creditLine.setLineOrder(2);
        entry.addLine(creditLine);

        return journalEntryRepository.save(entry);
    }

    // ─── HELPERS ──────────────────────────────────────────

    private FncAccount resolveAccount(String mappingKey, String fallbackCode) {
        try {
            Optional<FncBillingAccountMap> mapOpt = accountMapRepository.findByMappingKey(mappingKey);
            if (mapOpt.isPresent()) {
                Optional<FncAccount> accOpt = accountRepository.findById(mapOpt.get().getAccountId());
                if (accOpt.isPresent()) {
                    return accOpt.get();
                }
            }
        } catch (Exception ignored) {
        }
        return findAccountByCode(fallbackCode);
    }

    private FncAccount findAccountByCode(String code) {
        try {
            Optional<FncAccount> exact = accountRepository.findByAccountCode(code);
            if (exact.isPresent()) {
                return exact.get();
            }
            List<FncAccount> search = accountRepository.searchAccounts(code);
            if (!search.isEmpty()) {
                return search.get(0);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private FncFiscalYear getCurrentFiscalYear() {
        return fiscalYearRepository.findByDate(LocalDate.now())
                .orElseGet(() -> {
                    var openYears = fiscalYearRepository.findOpenFiscalYears();
                    return openYears.isEmpty() ? null : openYears.get(0);
                });
    }

    private String generateEntryNumber() {
        // Follows existing pattern from FncJournalEntryService
        return "JE-INV-" + Year.now().getValue() + "-" + System.currentTimeMillis();
    }
}
