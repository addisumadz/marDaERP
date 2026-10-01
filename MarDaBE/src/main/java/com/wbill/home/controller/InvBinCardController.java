package com.wbill.home.controller;

import com.wbill.home.model.InvStockTransaction;
import com.wbill.home.repository.InvStockTransactionRepository;
import com.wbill.home.repository.InvItemRepository;
import com.wbill.home.repository.InvStoreRepository;
import com.wbill.home.repository.InvItemStoreStockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

/**
 * Bin Card (Ethiopian Model 22) Controller.
 * Read-only report view — no CRUD operations.
 * Queries InvStockTransaction for per-item, per-store movement data.
 */
@RestController
@RequestMapping("/api/mardaerp/inv-bin-card")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvBinCardController {

    @Autowired
    private InvStockTransactionRepository transactionRepository;

    @Autowired
    private InvItemRepository itemRepository;

    @Autowired
    private InvStoreRepository storeRepository;

    @Autowired
    private InvItemStoreStockRepository stockRepository;

    /**
     * GET /api/mardaerp/inv-bin-card?storeId=1&itemId=5&fromDate=2026-01-01&toDate=2026-06-30
     * Returns bin card data in Ethiopian Model 22 format:
     * Opening balance + list of movements (Date, Ref, From/To, Received, Issued, Balance)
     */
    @GetMapping
    public ResponseEntity<?> getBinCard(
            @RequestParam int storeId,
            @RequestParam long itemId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        try {
            // Validate item and store exist
            var item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new IllegalArgumentException("Item not found"));
            var store = storeRepository.findById(storeId)
                    .orElseThrow(() -> new IllegalArgumentException("Store not found"));

            // Get transactions before the period to calculate opening balance
            List<InvStockTransaction> priorTransactions = transactionRepository
                    .findByItemIdAndStoreIdAndTransactionDateBeforeOrderByTransactionDateAscCreatedAtAsc(
                            itemId, storeId, fromDate);

            BigDecimal openingBalance = BigDecimal.ZERO;
            if (!priorTransactions.isEmpty()) {
                // The balance_after of the last transaction before the period is our opening balance
                openingBalance = priorTransactions.get(priorTransactions.size() - 1).getBalanceAfter();
            }

            // Get transactions within the period
            List<InvStockTransaction> transactions = transactionRepository
                    .findByItemIdAndStoreIdAndTransactionDateBetweenOrderByTransactionDateAscCreatedAtAsc(
                            itemId, storeId, fromDate, toDate);

            // Build bin card entries
            List<Map<String, Object>> entries = new ArrayList<>();
            BigDecimal totalReceived = BigDecimal.ZERO;
            BigDecimal totalIssued = BigDecimal.ZERO;
            BigDecimal runningBalance = openingBalance;

            for (InvStockTransaction txn : transactions) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("date", txn.getTransactionDate());
                entry.put("transactionNumber", txn.getTransactionNumber());
                entry.put("transactionType", txn.getTransactionType().name());
                entry.put("referenceType", txn.getReferenceType());
                entry.put("referenceId", txn.getReferenceId());
                entry.put("remarks", txn.getRemarks());

                boolean isInflow = isInflowTransaction(txn.getTransactionType());
                if (isInflow) {
                    entry.put("received", txn.getQuantity());
                    entry.put("issued", null);
                    totalReceived = totalReceived.add(txn.getQuantity());
                } else {
                    entry.put("received", null);
                    entry.put("issued", txn.getQuantity());
                    totalIssued = totalIssued.add(txn.getQuantity());
                }

                entry.put("balance", txn.getBalanceAfter());
                runningBalance = txn.getBalanceAfter();
                entries.add(entry);
            }

            // Build response
            Map<String, Object> result = new LinkedHashMap<>();

            // Item info
            Map<String, Object> itemInfo = new LinkedHashMap<>();
            itemInfo.put("id", item.getId());
            itemInfo.put("itemCode", item.getItemCode());
            itemInfo.put("itemName", item.getItemName());
            itemInfo.put("itemNameAm", item.getItemNameAm());
            if (item.getUnitOfMeasure() != null) {
                itemInfo.put("unitOfMeasure", item.getUnitOfMeasure().getUnitName());
            }
            result.put("item", itemInfo);

            // Store info
            Map<String, Object> storeInfo = new LinkedHashMap<>();
            storeInfo.put("id", store.getId());
            storeInfo.put("storeCode", store.getStoreCode());
            storeInfo.put("storeName", store.getStoreName());
            storeInfo.put("storeNameAm", store.getStoreNameAm());
            result.put("store", storeInfo);

            result.put("fromDate", fromDate);
            result.put("toDate", toDate);
            result.put("openingBalance", openingBalance);
            result.put("closingBalance", runningBalance);
            result.put("totalReceived", totalReceived);
            result.put("totalIssued", totalIssued);
            result.put("entries", entries);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    /**
     * Determines if a transaction type represents stock inflow (received) or outflow (issued).
     */
    private boolean isInflowTransaction(InvStockTransaction.TransactionType type) {
        return type == InvStockTransaction.TransactionType.RECEIVE
                || type == InvStockTransaction.TransactionType.TRANSFER_IN
                || type == InvStockTransaction.TransactionType.ADJUSTMENT_PLUS
                || type == InvStockTransaction.TransactionType.RETURN;
    }
}
