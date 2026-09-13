package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.model.InvIssueVoucher.IssueStatus;
import com.wbill.home.model.InvStockTransaction.TransactionType;
import com.wbill.home.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Optional;

@Service
public class InvIssueVoucherService {

    @Autowired
    private InvIssueVoucherRepository repository;

    @Autowired
    private InvStoreRepository storeRepository;

    @Autowired
    private InvItemRepository itemRepository;

    @Autowired
    private InvStockService stockService;

    @Autowired
    private InvFinanceIntegrationService financeService;

    @Autowired
    private InvItemStoreStockRepository stockRepository;

    public Page<InvIssueVoucher> getAll(int page, int size) {
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    public Page<InvIssueVoucher> getByStore(int storeId, int page, int size) {
        return repository.findByStoreIdOrderByCreatedAtDesc(storeId, PageRequest.of(page, size));
    }

    public Page<InvIssueVoucher> getByStatus(IssueStatus status, int page, int size) {
        return repository.findByStatusOrderByCreatedAtDesc(status, PageRequest.of(page, size));
    }

    public Optional<InvIssueVoucher> getById(long id) {
        return repository.findById(id);
    }

    @Transactional
    public InvIssueVoucher create(InvIssueVoucher voucher, int storeId, List<InvIssueVoucherLine> lines, String username) {
        InvStore store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        voucher.setStore(store);
        voucher.setVoucherNumber(generateNumber());
        voucher.setIssuedDate(LocalDate.now());
        voucher.setStatus(IssueStatus.DRAFT);
        voucher.setCreatedBy(username);

        int order = 1;
        for (InvIssueVoucherLine line : lines) {
            InvItem item = itemRepository.findById(line.getItem().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Item not found"));
            line.setItem(item);
            // Set unit cost from weighted avg
            InvItemStoreStock stock = stockRepository.findByItemIdAndStoreId(item.getId(), storeId).orElse(null);
            if (stock != null) {
                line.setUnitCost(stock.getWeightedAvgCost());
            }
            line.setLineOrder(order++);
            voucher.addLine(line);
        }
        return repository.save(voucher);
    }

    @Transactional
    public InvIssueVoucher approve(long id, String approver) {
        InvIssueVoucher voucher = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Voucher not found"));
        if (voucher.getStatus() != IssueStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT vouchers can be approved");
        }

        // Validate stock availability before approving
        for (InvIssueVoucherLine line : voucher.getLines()) {
            BigDecimal available = stockService.getAvailableQuantity(line.getItem().getId(), voucher.getStore().getId());
            BigDecimal qty = line.getApprovedQuantity() != null ? line.getApprovedQuantity() : line.getRequestedQuantity();
            if (available.compareTo(qty) < 0) {
                throw new IllegalStateException(
                        String.format("Insufficient stock for '%s'. Available: %s, Requested: %s",
                                line.getItem().getItemName(), available.toPlainString(), qty.toPlainString()));
            }
        }

        voucher.setStatus(IssueStatus.APPROVED);
        voucher.setApprovedBy(approver);
        voucher.setApprovedDate(LocalDateTime.now());
        return repository.save(voucher);
    }

    /**
     * Issue (finalize) — triggers stock deduction + finance journal entry.
     */
    @Transactional
    public InvIssueVoucher issue(long id, String issuer) {
        InvIssueVoucher voucher = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Voucher not found"));
        if (voucher.getStatus() != IssueStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED vouchers can be issued");
        }

        TransactionType txnType = voucher.getIssueType() == InvIssueVoucher.IssueType.SALE
                ? TransactionType.ISSUE_SALE : TransactionType.ISSUE_INTERNAL;

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (InvIssueVoucherLine line : voucher.getLines()) {
            BigDecimal qty = line.getApprovedQuantity() != null ? line.getApprovedQuantity() : line.getRequestedQuantity();
            line.setIssuedQuantity(qty);

            stockService.issueStock(line.getItem(), voucher.getStore(), qty, txnType, "ISSUE", voucher.getId(), issuer);

            // Recalculate cost
            InvItemStoreStock stock = stockRepository.findByItemIdAndStoreId(line.getItem().getId(), voucher.getStore().getId()).orElse(null);
            if (stock != null) {
                line.setUnitCost(stock.getWeightedAvgCost());
            }
            line.setTotalCost(qty.multiply(line.getUnitCost()).setScale(2, java.math.RoundingMode.HALF_UP));
            totalAmount = totalAmount.add(line.getTotalCost());
        }

        voucher.setTotalAmount(totalAmount);
        voucher.setIssuedBy(issuer);
        voucher.setStatus(IssueStatus.ISSUED);

        // Finance journal entry
        FncJournalEntry journalEntry = financeService.createIssueJournalEntry(voucher, issuer);
        voucher.setJournalEntry(journalEntry);

        return repository.save(voucher);
    }

    private String generateNumber() {
        String prefix = "ISS-" + Year.now().getValue() + "-";
        Long maxSeq = repository.findMaxSequence(prefix);
        long next = (maxSeq != null ? maxSeq : 0) + 1;
        return prefix + String.format("%05d", next);
    }
}
