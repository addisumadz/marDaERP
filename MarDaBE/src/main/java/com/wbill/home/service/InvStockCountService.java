package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.model.InvStockCount.CountStatus;
import com.wbill.home.model.InvStockAdjustment.AdjustmentType;
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
public class InvStockCountService {

    @Autowired
    private InvStockCountRepository repository;

    @Autowired
    private InvStoreRepository storeRepository;

    @Autowired
    private InvItemStoreStockRepository stockRepository;

    @Autowired
    private InvStockAdjustmentRepository adjustmentRepository;

    public Page<InvStockCount> getAll(int page, int size) {
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    public Page<InvStockCount> getByStore(int storeId, int page, int size) {
        return repository.findByStoreIdOrderByCreatedAtDesc(storeId, PageRequest.of(page, size));
    }

    public Page<InvStockCount> getByStatus(CountStatus status, int page, int size) {
        return repository.findByStatusOrderByCreatedAtDesc(status, PageRequest.of(page, size));
    }

    public Page<InvStockCount> getByBranch(int branchId, int page, int size) {
        return repository.findByBranchIdOrderByCreatedAtDesc(branchId, PageRequest.of(page, size));
    }

    public Optional<InvStockCount> getById(long id) {
        return repository.findById(id);
    }

    /**
     * Step 1: PLAN — Create count plan and auto-populate lines from InvItemStoreStock.
     * Freezes system quantities at this point.
     */
    @Transactional
    public InvStockCount plan(InvStockCount count, int storeId, String username) {
        InvStore store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        count.setStore(store);
        count.setCountNumber(generateNumber());
        count.setCountDate(LocalDate.now());
        count.setStatus(CountStatus.PLANNED);
        count.setCreatedBy(username);

        // Auto-populate count lines from current stock levels
        List<InvItemStoreStock> stockItems;
        if (count.getCountScope() == InvStockCount.CountScope.BY_CATEGORY && count.getCategoryFilter() != null) {
            stockItems = stockRepository.findByStoreIdAndItemCategoryId(storeId, count.getCategoryFilter().getId());
        } else {
            stockItems = stockRepository.findByStoreId(storeId);
        }

        BigDecimal totalSystemValue = BigDecimal.ZERO;
        for (InvItemStoreStock stock : stockItems) {
            InvStockCountLine line = new InvStockCountLine();
            line.setItem(stock.getItem());
            line.setSystemQuantity(stock.getQuantityOnHand());
            line.setUnitCost(stock.getWeightedAvgCost());
            line.setIsCounted(false);
            count.addLine(line);
            totalSystemValue = totalSystemValue.add(
                    stock.getQuantityOnHand().multiply(stock.getWeightedAvgCost()).setScale(2, java.math.RoundingMode.HALF_UP));
        }

        count.setTotalSystemValue(totalSystemValue);
        return repository.save(count);
    }

    /**
     * Step 1b: Start counting — transitions to COUNTING status
     */
    @Transactional
    public InvStockCount startCounting(long id, String username) {
        InvStockCount count = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stock Count not found"));
        if (count.getStatus() != CountStatus.PLANNED) {
            throw new IllegalStateException("Only PLANNED counts can start counting");
        }
        count.setStatus(CountStatus.COUNTING);
        count.setCountedBy(username);
        return repository.save(count);
    }

    /**
     * Step 2: COUNT — Save physical quantities entered by the user.
     */
    @Transactional
    public InvStockCount saveCount(long id, List<InvStockCountLine> countedLines) {
        InvStockCount count = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stock Count not found"));
        if (count.getStatus() != CountStatus.COUNTING && count.getStatus() != CountStatus.PLANNED) {
            throw new IllegalStateException("Count is not in a countable state");
        }

        BigDecimal totalPhysicalValue = BigDecimal.ZERO;
        BigDecimal totalVarianceValue = BigDecimal.ZERO;

        for (InvStockCountLine countedLine : countedLines) {
            for (InvStockCountLine existingLine : count.getLines()) {
                if (existingLine.getId() == countedLine.getId()) {
                    existingLine.setPhysicalQuantity(countedLine.getPhysicalQuantity());
                    if (countedLine.getPhysicalQuantity() != null) {
                        BigDecimal variance = countedLine.getPhysicalQuantity().subtract(existingLine.getSystemQuantity());
                        existingLine.setVarianceQuantity(variance);
                        existingLine.setVarianceValue(
                                variance.multiply(existingLine.getUnitCost()).setScale(2, java.math.RoundingMode.HALF_UP));
                        existingLine.setIsCounted(true);

                        totalPhysicalValue = totalPhysicalValue.add(
                                countedLine.getPhysicalQuantity().multiply(existingLine.getUnitCost()).setScale(2, java.math.RoundingMode.HALF_UP));
                        totalVarianceValue = totalVarianceValue.add(existingLine.getVarianceValue());
                    }
                    existingLine.setRemarks(countedLine.getRemarks());
                    break;
                }
            }
        }

        count.setTotalPhysicalValue(totalPhysicalValue);
        count.setTotalVarianceValue(totalVarianceValue);

        // Check if all lines counted
        boolean allCounted = count.getLines().stream().allMatch(InvStockCountLine::getIsCounted);
        if (allCounted) {
            count.setStatus(CountStatus.COUNTED);
        } else {
            count.setStatus(CountStatus.COUNTING);
        }

        return repository.save(count);
    }

    /**
     * Step 3: RECONCILE — Verify the count and generate Stock Adjustment for variances.
     */
    @Transactional
    public InvStockCount reconcile(long id, String verifier) {
        InvStockCount count = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stock Count not found"));
        if (count.getStatus() != CountStatus.COUNTED) {
            throw new IllegalStateException("Only fully COUNTED stock counts can be reconciled");
        }

        count.setVerifiedBy(verifier);
        count.setVerifiedDate(LocalDateTime.now());

        // Check if there are any variances
        boolean hasVariances = count.getLines().stream()
                .anyMatch(l -> l.getVarianceQuantity() != null && l.getVarianceQuantity().compareTo(BigDecimal.ZERO) != 0);

        if (hasVariances) {
            // Auto-create Stock Adjustment for variances
            InvStockAdjustment adjustment = new InvStockAdjustment();
            adjustment.setStore(count.getStore());
            adjustment.setAdjustmentNumber("ADJ-SC-" + count.getCountNumber());
            adjustment.setAdjustmentType(AdjustmentType.PHYSICAL_COUNT);
            adjustment.setAdjustmentDate(LocalDate.now());
            adjustment.setStatus(AdjustmentStatus.DRAFT);
            adjustment.setRemarks("Auto-generated from Physical Stock Count: " + count.getCountNumber());
            adjustment.setCreatedBy(verifier);

            int order = 1;
            for (InvStockCountLine line : count.getLines()) {
                if (line.getVarianceQuantity() != null && line.getVarianceQuantity().compareTo(BigDecimal.ZERO) != 0) {
                    InvStockAdjustmentLine adjLine = new InvStockAdjustmentLine();
                    adjLine.setItem(line.getItem());
                    adjLine.setSystemQuantity(line.getSystemQuantity());
                    adjLine.setActualQuantity(line.getPhysicalQuantity());
                    adjLine.setUnitCost(line.getUnitCost());
                    adjLine.calculateVariance();
                    adjLine.setLineOrder(order++);
                    adjLine.setReason(line.getRemarks());
                    adjustment.addLine(adjLine);
                }
            }

            InvStockAdjustment savedAdj = adjustmentRepository.save(adjustment);
            count.setStockAdjustment(savedAdj);
            count.setStatus(CountStatus.RECONCILED);
        } else {
            // No variances — mark as adjusted directly
            count.setStatus(CountStatus.ADJUSTED);
        }

        // Update last count dates on InvItemStoreStock
        for (InvStockCountLine line : count.getLines()) {
            if (line.getIsCounted()) {
                stockRepository.findByItemIdAndStoreId(line.getItem().getId(), count.getStore().getId())
                        .ifPresent(stock -> {
                            stock.setLastCountDate(count.getCountDate());
                            stock.setLastCountQuantity(line.getPhysicalQuantity());
                            stockRepository.save(stock);
                        });
            }
        }

        return repository.save(count);
    }

    @Transactional
    public InvStockCount cancel(long id) {
        InvStockCount count = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stock Count not found"));
        if (count.getStatus() == CountStatus.ADJUSTED) {
            throw new IllegalStateException("Cannot cancel an adjusted stock count");
        }
        count.setStatus(CountStatus.CANCELLED);
        return repository.save(count);
    }

    private String generateNumber() {
        String prefix = "SCT-";
        Long maxSeq = repository.findMaxSequence(prefix);
        long next = (maxSeq != null ? maxSeq : 0) + 1;
        return prefix + String.format("%05d", next);
    }
}
