package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.model.InvReturnVoucher.ReturnStatus;
import com.wbill.home.model.InvReturnVoucher.ReturnType;
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
public class InvReturnVoucherService {

    @Autowired
    private InvReturnVoucherRepository repository;

    @Autowired
    private InvStoreRepository storeRepository;

    @Autowired
    private InvItemRepository itemRepository;

    @Autowired
    private InvItemStoreStockRepository stockRepository;

    @Autowired
    private InvStockService stockService;

    @Autowired
    private InvFinanceIntegrationService financeService;

    public Page<InvReturnVoucher> getAll(int page, int size) {
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    public Page<InvReturnVoucher> getByStore(int storeId, int page, int size) {
        return repository.findByStoreIdOrderByCreatedAtDesc(storeId, PageRequest.of(page, size));
    }

    public Page<InvReturnVoucher> getByStatus(ReturnStatus status, int page, int size) {
        return repository.findByStatusOrderByCreatedAtDesc(status, PageRequest.of(page, size));
    }

    public Page<InvReturnVoucher> getByReturnType(ReturnType returnType, int page, int size) {
        return repository.findByReturnTypeOrderByCreatedAtDesc(returnType, PageRequest.of(page, size));
    }

    public Page<InvReturnVoucher> getByBranch(int branchId, int page, int size) {
        return repository.findByBranchIdOrderByCreatedAtDesc(branchId, PageRequest.of(page, size));
    }

    public Optional<InvReturnVoucher> getById(long id) {
        return repository.findById(id);
    }

    @Transactional
    public InvReturnVoucher create(InvReturnVoucher voucher, int storeId, List<InvReturnVoucherLine> lines, String username) {
        InvStore store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        voucher.setStore(store);
        voucher.setVoucherNumber(generateNumber());
        voucher.setReturnDate(LocalDate.now());
        voucher.setStatus(ReturnStatus.DRAFT);
        voucher.setCreatedBy(username);

        BigDecimal totalAmount = BigDecimal.ZERO;
        int order = 1;
        for (InvReturnVoucherLine line : lines) {
            InvItem item = itemRepository.findById(line.getItem().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Item not found"));
            line.setItem(item);

            // Set unit cost from weighted average
            InvItemStoreStock stock = stockRepository.findByItemIdAndStoreId(item.getId(), storeId).orElse(null);
            BigDecimal unitCost = stock != null ? stock.getWeightedAvgCost()
                    : (item.getDefaultUnitCost() != null ? item.getDefaultUnitCost() : BigDecimal.ZERO);
            line.setUnitCost(unitCost);
            line.setTotalCost(line.getQuantity().multiply(unitCost).setScale(2, java.math.RoundingMode.HALF_UP));
            totalAmount = totalAmount.add(line.getTotalCost());
            line.setLineOrder(order++);
            voucher.addLine(line);
        }

        voucher.setTotalAmount(totalAmount);
        return repository.save(voucher);
    }

    @Transactional
    public InvReturnVoucher approve(long id, String approver) {
        InvReturnVoucher voucher = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Return Voucher not found"));
        if (voucher.getStatus() != ReturnStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT return vouchers can be approved");
        }

        voucher.setStatus(ReturnStatus.APPROVED);
        voucher.setApprovedBy(approver);
        voucher.setApprovedDate(LocalDateTime.now());
        return repository.save(voucher);
    }

    /**
     * Receive (finalize) — triggers stock update + finance journal entry.
     * RETURN_FROM_DEPARTMENT: stock increases (items returned to store)
     * RETURN_TO_SUPPLIER: stock decreases (items sent back to supplier)
     */
    @Transactional
    public InvReturnVoucher receive(long id, String receiver) {
        InvReturnVoucher voucher = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Return Voucher not found"));
        if (voucher.getStatus() != ReturnStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED return vouchers can be received");
        }

        for (InvReturnVoucherLine line : voucher.getLines()) {
            if (voucher.getReturnType() == ReturnType.RETURN_FROM_DEPARTMENT) {
                // Stock increases — items coming back to store
                stockService.receiveStock(line.getItem(), voucher.getStore(), line.getQuantity(),
                        line.getUnitCost(), "RETURN_VOUCHER", voucher.getId(), receiver);
            } else {
                // RETURN_TO_SUPPLIER — stock decreases — items leaving store
                stockService.issueStock(line.getItem(), voucher.getStore(), line.getQuantity(),
                        TransactionType.RETURN, "RETURN_VOUCHER", voucher.getId(), receiver);
            }
        }

        voucher.setReceivedBy(receiver);
        voucher.setStatus(ReturnStatus.RECEIVED);

        // Finance journal entry
        FncJournalEntry journalEntry = financeService.createReturnJournalEntry(voucher, receiver);
        voucher.setJournalEntry(journalEntry);

        return repository.save(voucher);
    }

    @Transactional
    public InvReturnVoucher cancel(long id) {
        InvReturnVoucher voucher = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Return Voucher not found"));
        if (voucher.getStatus() == ReturnStatus.RECEIVED) {
            throw new IllegalStateException("Cannot cancel a received return voucher");
        }
        voucher.setStatus(ReturnStatus.CANCELLED);
        return repository.save(voucher);
    }

    public void delete(long id) {
        InvReturnVoucher voucher = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Return Voucher not found"));
        if (voucher.getStatus() != ReturnStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT return vouchers can be deleted");
        }
        repository.deleteById(id);
    }

    private String generateNumber() {
        String prefix = "RTV-";
        Long maxSeq = repository.findMaxSequence(prefix);
        long next = (maxSeq != null ? maxSeq : 0) + 1;
        return prefix + String.format("%05d", next);
    }
}
