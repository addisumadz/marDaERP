package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.model.InvStockTransaction.TransactionType;
import com.wbill.home.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Optional;

/**
 * Core inventory stock service. Handles:
 * - Stock level queries
 * - Stock updates (receive, issue, transfer, adjust)
 * - Weighted average cost calculation
 * - Negative stock enforcement
 * - Transaction audit trail
 * - Document number generation
 */
@Service
public class InvStockService {

    @Autowired
    private InvItemStoreStockRepository stockRepository;

    @Autowired
    private InvStockTransactionRepository transactionRepository;

    @Autowired
    private InvSerialTrackingRepository serialTrackingRepository;

    @Autowired
    private InvItemRepository itemRepository;

    // ─── STOCK QUERIES ────────────────────────────────────

    public Optional<InvItemStoreStock> getStock(long itemId, int storeId) {
        return stockRepository.findByItemIdAndStoreId(itemId, storeId);
    }

    public BigDecimal getAvailableQuantity(long itemId, int storeId) {
        return stockRepository.findByItemIdAndStoreId(itemId, storeId)
                .map(InvItemStoreStock::getAvailableQuantity)
                .orElse(BigDecimal.ZERO);
    }

    public List<InvItemStoreStock> getStockByStore(int storeId) {
        return stockRepository.findByStoreId(storeId);
    }

    public List<InvItemStoreStock> getLowStockItems(int storeId) {
        return stockRepository.findLowStockByStore(storeId);
    }

    public List<InvItemStoreStock> getAllLowStockItems() {
        return stockRepository.findAllLowStock();
    }

    public BigDecimal getTotalStockValue(int storeId) {
        return stockRepository.getTotalStockValueByStore(storeId);
    }

    public BigDecimal getTotalStockValue() {
        return stockRepository.getTotalStockValue();
    }

    // ─── STOCK UPDATES ───────────────────────────────────

    /**
     * Receive stock into a store (from GRN).
     * Updates weighted average cost.
     */
    @Transactional
    public InvStockTransaction receiveStock(InvItem item, InvStore store, BigDecimal quantity,
                                             BigDecimal unitCost, String referenceType, Long referenceId, String user) {
        InvItemStoreStock stock = getOrCreateStock(item, store);
        BigDecimal balanceBefore = stock.getQuantityOnHand();

        // Weighted average cost: ((oldQty * oldCost) + (newQty * newCost)) / (oldQty + newQty)
        BigDecimal oldTotal = stock.getQuantityOnHand().multiply(stock.getWeightedAvgCost());
        BigDecimal newTotal = quantity.multiply(unitCost);
        BigDecimal totalQty = stock.getQuantityOnHand().add(quantity);
        if (totalQty.compareTo(BigDecimal.ZERO) > 0) {
            stock.setWeightedAvgCost(oldTotal.add(newTotal).divide(totalQty, 4, RoundingMode.HALF_UP));
        }

        stock.setQuantityOnHand(totalQty);
        stockRepository.save(stock);

        return createTransaction(item, store, TransactionType.RECEIVE, quantity, unitCost,
                balanceBefore, stock.getQuantityOnHand(), referenceType, referenceId, null, user);
    }

    /**
     * Issue stock from a store (for sale or internal use).
     * Enforces no-negative-stock policy.
     */
    @Transactional
    public InvStockTransaction issueStock(InvItem item, InvStore store, BigDecimal quantity,
                                           TransactionType issueType, String referenceType, Long referenceId, String user) {
        InvItemStoreStock stock = getOrCreateStock(item, store);

        // Enforce no negative stock
        if (stock.getAvailableQuantity().compareTo(quantity) < 0) {
            throw new IllegalStateException(
                    String.format("Insufficient stock for item '%s' in store '%s'. Available: %s, Requested: %s",
                            item.getItemName(), store.getStoreName(),
                            stock.getAvailableQuantity().toPlainString(), quantity.toPlainString()));
        }

        BigDecimal balanceBefore = stock.getQuantityOnHand();
        BigDecimal unitCost = stock.getWeightedAvgCost();
        stock.setQuantityOnHand(stock.getQuantityOnHand().subtract(quantity));
        stockRepository.save(stock);

        return createTransaction(item, store, issueType, quantity, unitCost,
                balanceBefore, stock.getQuantityOnHand(), referenceType, referenceId, null, user);
    }

    /**
     * Transfer out from source store.
     */
    @Transactional
    public InvStockTransaction transferOut(InvItem item, InvStore fromStore, BigDecimal quantity,
                                            String referenceType, Long referenceId, String user) {
        InvItemStoreStock stock = getOrCreateStock(item, fromStore);

        if (stock.getAvailableQuantity().compareTo(quantity) < 0) {
            throw new IllegalStateException(
                    String.format("Insufficient stock for transfer. Item '%s', Store '%s'. Available: %s",
                            item.getItemName(), fromStore.getStoreName(), stock.getAvailableQuantity().toPlainString()));
        }

        BigDecimal balanceBefore = stock.getQuantityOnHand();
        BigDecimal unitCost = stock.getWeightedAvgCost();
        stock.setQuantityOnHand(stock.getQuantityOnHand().subtract(quantity));
        stockRepository.save(stock);

        return createTransaction(item, fromStore, TransactionType.TRANSFER_OUT, quantity, unitCost,
                balanceBefore, stock.getQuantityOnHand(), referenceType, referenceId, null, user);
    }

    /**
     * Transfer in to destination store.
     */
    @Transactional
    public InvStockTransaction transferIn(InvItem item, InvStore toStore, BigDecimal quantity,
                                           BigDecimal unitCost, String referenceType, Long referenceId, String user) {
        return receiveStock(item, toStore, quantity, unitCost, referenceType, referenceId, user);
    }

    /**
     * Adjust stock (positive or negative).
     */
    @Transactional
    public InvStockTransaction adjustStock(InvItem item, InvStore store, BigDecimal variance,
                                            String referenceType, Long referenceId, String user) {
        InvItemStoreStock stock = getOrCreateStock(item, store);
        BigDecimal balanceBefore = stock.getQuantityOnHand();
        BigDecimal unitCost = stock.getWeightedAvgCost();

        TransactionType type = variance.compareTo(BigDecimal.ZERO) >= 0
                ? TransactionType.ADJUSTMENT_PLUS
                : TransactionType.ADJUSTMENT_MINUS;

        stock.setQuantityOnHand(stock.getQuantityOnHand().add(variance));

        // Enforce no negative stock on adjustments too
        if (stock.getQuantityOnHand().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("Stock adjustment would result in negative stock for item: " + item.getItemName());
        }

        stockRepository.save(stock);

        return createTransaction(item, store, type, variance.abs(), unitCost,
                balanceBefore, stock.getQuantityOnHand(), referenceType, referenceId, null, user);
    }

    // ─── HELPERS ──────────────────────────────────────────

    private InvItemStoreStock getOrCreateStock(InvItem item, InvStore store) {
        return stockRepository.findByItemIdAndStoreId(item.getId(), store.getId())
                .orElseGet(() -> {
                    InvItemStoreStock newStock = new InvItemStoreStock();
                    newStock.setItem(item);
                    newStock.setStore(store);
                    newStock.setWeightedAvgCost(item.getDefaultUnitCost() != null ? item.getDefaultUnitCost() : BigDecimal.ZERO);
                    return stockRepository.save(newStock);
                });
    }

    private InvStockTransaction createTransaction(InvItem item, InvStore store, TransactionType type,
                                                    BigDecimal quantity, BigDecimal unitCost,
                                                    BigDecimal balanceBefore, BigDecimal balanceAfter,
                                                    String referenceType, Long referenceId,
                                                    InvSerialTracking serialTracking, String user) {
        InvStockTransaction txn = new InvStockTransaction();
        txn.setTransactionNumber(generateTransactionNumber());
        txn.setItem(item);
        txn.setStore(store);
        txn.setTransactionType(type);
        txn.setQuantity(quantity);
        txn.setUnitCost(unitCost);
        txn.setTotalCost(quantity.multiply(unitCost).setScale(2, RoundingMode.HALF_UP));
        txn.setBalanceBefore(balanceBefore);
        txn.setBalanceAfter(balanceAfter);
        txn.setReferenceType(referenceType);
        txn.setReferenceId(referenceId);
        txn.setSerialTracking(serialTracking);
        txn.setTransactionDate(LocalDate.now());
        txn.setCreatedBy(user);

        return transactionRepository.saveAndFlush(txn);
    }

    // ─── DOCUMENT NUMBER GENERATION ───────────────────────

    public synchronized String generateTransactionNumber() {
        String prefix = "TXN-" + Year.now().getValue() + "-";
        Long maxSeq = transactionRepository.findMaxTransactionSequence(prefix);
        long next = (maxSeq != null ? maxSeq : 0) + 1;
        String candidate = prefix + String.format("%06d", next);
        while (transactionRepository.existsByTransactionNumber(candidate)) {
            next++;
            candidate = prefix + String.format("%06d", next);
        }
        return candidate;
    }

    /**
     * Generate item code: categoryCode + auto-incremented number.
     * Example: PIPE-00001, CHEM-00002, OFC-00003
     */
    public String generateItemCode(String categoryCode) {
        String prefix = categoryCode + "-";
        String maxCode = itemRepository.findMaxItemCodeByPrefix(prefix);
        long next = 1;
        if (maxCode != null) {
            try {
                String numPart = maxCode.substring(prefix.length());
                next = Long.parseLong(numPart) + 1;
            } catch (Exception e) {
                // fallback
            }
        }
        return prefix + String.format("%05d", next);
    }

    public String generateDocumentNumber(String prefix, Long maxSeq) {
        long next = (maxSeq != null ? maxSeq : 0) + 1;
        return prefix + String.format("%05d", next);
    }
}
