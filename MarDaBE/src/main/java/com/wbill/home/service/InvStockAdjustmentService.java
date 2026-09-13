package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.model.InvStockAdjustment.AdjustmentStatus;
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
public class InvStockAdjustmentService {

    @Autowired
    private InvStockAdjustmentRepository repository;

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

    public Page<InvStockAdjustment> getAll(int page, int size) {
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    public Page<InvStockAdjustment> getByStore(int storeId, int page, int size) {
        return repository.findByStoreIdOrderByCreatedAtDesc(storeId, PageRequest.of(page, size));
    }

    public Optional<InvStockAdjustment> getById(long id) {
        return repository.findById(id);
    }

    @Transactional
    public InvStockAdjustment create(InvStockAdjustment adj, int storeId, List<InvStockAdjustmentLine> lines, String username) {
        InvStore store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        adj.setStore(store);
        adj.setAdjustmentNumber(generateNumber());
        adj.setAdjustmentDate(LocalDate.now());
        adj.setStatus(AdjustmentStatus.DRAFT);
        adj.setCreatedBy(username);

        int order = 1;
        for (InvStockAdjustmentLine line : lines) {
            InvItem item = itemRepository.findById(line.getItem().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Item not found"));
            line.setItem(item);
            // Get current system quantity
            InvItemStoreStock stock = stockRepository.findByItemIdAndStoreId(item.getId(), storeId).orElse(null);
            if (stock != null) {
                line.setSystemQuantity(stock.getQuantityOnHand());
                line.setUnitCost(stock.getWeightedAvgCost());
            } else {
                line.setSystemQuantity(BigDecimal.ZERO);
            }
            line.calculateVariance();
            line.setLineOrder(order++);
            adj.addLine(line);
        }
        return repository.save(adj);
    }

    @Transactional
    public InvStockAdjustment approve(long id, String approver) {
        InvStockAdjustment adj = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Adjustment not found"));
        if (adj.getStatus() != AdjustmentStatus.DRAFT && adj.getStatus() != AdjustmentStatus.SUBMITTED) {
            throw new IllegalStateException("Cannot approve in current status");
        }
        adj.setStatus(AdjustmentStatus.APPROVED);
        adj.setApprovedBy(approver);
        adj.setApprovedDate(LocalDateTime.now());
        return repository.save(adj);
    }

    /**
     * Apply adjustment — updates stock and creates finance entry for variances.
     */
    @Transactional
    public InvStockAdjustment apply(long id, String applier) {
        InvStockAdjustment adj = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Adjustment not found"));
        if (adj.getStatus() != AdjustmentStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED adjustments can be applied");
        }

        for (InvStockAdjustmentLine line : adj.getLines()) {
            if (line.getVariance().compareTo(BigDecimal.ZERO) != 0) {
                stockService.adjustStock(line.getItem(), adj.getStore(), line.getVariance(),
                        "ADJUSTMENT", adj.getId(), applier);
            }
        }

        // Finance entry for net variance
        FncJournalEntry journalEntry = financeService.createAdjustmentJournalEntry(adj, applier);
        adj.setJournalEntry(journalEntry);

        adj.setStatus(AdjustmentStatus.APPLIED);
        adj.setAppliedBy(applier);
        adj.setAppliedDate(LocalDateTime.now());
        return repository.save(adj);
    }

    private String generateNumber() {
        String prefix = "ADJ-" + Year.now().getValue() + "-";
        Long maxSeq = repository.findMaxSequence(prefix);
        long next = (maxSeq != null ? maxSeq : 0) + 1;
        return prefix + String.format("%05d", next);
    }
}
