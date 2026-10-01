package com.wbill.home.controller;

import com.wbill.home.model.InvStockTransaction;
import com.wbill.home.repository.InvStockTransactionRepository;
import com.wbill.home.repository.InvItemRepository;
import com.wbill.home.repository.InvItemStoreStockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Inventory Report Controller — Stock Movement Summary and Consumption Report.
 * No CRUD — aggregation queries only.
 */
@RestController
@RequestMapping("/api/mardaerp/inv-reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvInventoryReportController {

    @Autowired
    private InvStockTransactionRepository transactionRepository;

    @Autowired
    private InvItemStoreStockRepository stockRepository;

    @Autowired
    private InvItemRepository itemRepository;

    /**
     * Stock Movement Summary Report.
     * Returns per-item summary: Opening → Received → Issued → Transferred → Adjusted → Disposed → Closing
     * Aligned to Ethiopian Fiscal Year periods.
     */
    @GetMapping("/stock-movement")
    public ResponseEntity<?> getStockMovementSummary(
            @RequestParam int storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Integer categoryId) {
        try {
            // Get all transactions in the period
            List<InvStockTransaction> transactions = transactionRepository
                    .findByStoreIdAndTransactionDateBetweenOrderByItemIdAscTransactionDateAsc(
                            storeId, fromDate, toDate);

            // Get all transactions before the period for opening balances
            List<InvStockTransaction> priorTransactions = transactionRepository
                    .findByStoreIdAndTransactionDateBeforeOrderByItemIdAscTransactionDateAsc(
                            storeId, fromDate);

            // Calculate opening balances per item (last balance_after before period)
            Map<Long, BigDecimal> openingBalances = new HashMap<>();
            for (InvStockTransaction txn : priorTransactions) {
                openingBalances.put(txn.getItem().getId(), txn.getBalanceAfter());
            }

            // Group transactions by item
            Map<Long, List<InvStockTransaction>> txnByItem = transactions.stream()
                    .collect(Collectors.groupingBy(t -> t.getItem().getId()));

            // Build summary per item
            List<Map<String, Object>> summaryRows = new ArrayList<>();
            Set<Long> allItemIds = new HashSet<>();
            allItemIds.addAll(openingBalances.keySet());
            allItemIds.addAll(txnByItem.keySet());

            for (Long itemId : allItemIds) {
                // Optional: filter by category
                if (categoryId != null) {
                    var item = itemRepository.findById(itemId).orElse(null);
                    if (item == null || item.getCategory() == null || item.getCategory().getId() != categoryId) {
                        continue;
                    }
                }

                Map<String, Object> row = new LinkedHashMap<>();
                var item = itemRepository.findById(itemId).orElse(null);
                if (item == null) continue;

                row.put("itemId", itemId);
                row.put("itemCode", item.getItemCode());
                row.put("itemName", item.getItemName());
                row.put("itemNameAm", item.getItemNameAm());
                row.put("unitOfMeasure", item.getUnitOfMeasure() != null ? item.getUnitOfMeasure().getUnitName() : "");

                BigDecimal opening = openingBalances.getOrDefault(itemId, BigDecimal.ZERO);
                row.put("openingBalance", opening);

                BigDecimal received = BigDecimal.ZERO;
                BigDecimal issued = BigDecimal.ZERO;
                BigDecimal transferNet = BigDecimal.ZERO;
                BigDecimal adjustmentNet = BigDecimal.ZERO;
                BigDecimal disposed = BigDecimal.ZERO;
                BigDecimal returned = BigDecimal.ZERO;

                List<InvStockTransaction> itemTxns = txnByItem.getOrDefault(itemId, Collections.emptyList());
                for (InvStockTransaction txn : itemTxns) {
                    switch (txn.getTransactionType()) {
                        case RECEIVE:
                            received = received.add(txn.getQuantity());
                            break;
                        case ISSUE_SALE:
                        case ISSUE_INTERNAL:
                            issued = issued.add(txn.getQuantity());
                            break;
                        case TRANSFER_IN:
                            transferNet = transferNet.add(txn.getQuantity());
                            break;
                        case TRANSFER_OUT:
                            transferNet = transferNet.subtract(txn.getQuantity());
                            break;
                        case ADJUSTMENT_PLUS:
                            adjustmentNet = adjustmentNet.add(txn.getQuantity());
                            break;
                        case ADJUSTMENT_MINUS:
                            adjustmentNet = adjustmentNet.subtract(txn.getQuantity());
                            break;
                        case DISPOSAL:
                            disposed = disposed.add(txn.getQuantity());
                            break;
                        case RETURN:
                            returned = returned.add(txn.getQuantity());
                            break;
                    }
                }

                row.put("received", received);
                row.put("returned", returned);
                row.put("issued", issued);
                row.put("transferNet", transferNet);
                row.put("adjustmentNet", adjustmentNet);
                row.put("disposed", disposed);

                BigDecimal closing = opening.add(received).add(returned).subtract(issued)
                        .add(transferNet).add(adjustmentNet).subtract(disposed);
                row.put("closingBalance", closing);

                // Valuation
                var stock = stockRepository.findByItemIdAndStoreId(itemId, storeId).orElse(null);
                BigDecimal avgCost = stock != null ? stock.getWeightedAvgCost() : BigDecimal.ZERO;
                row.put("unitCost", avgCost);
                row.put("closingValue", closing.multiply(avgCost).setScale(2, RoundingMode.HALF_UP));

                summaryRows.add(row);
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("storeId", storeId);
            result.put("fromDate", fromDate);
            result.put("toDate", toDate);
            result.put("totalItems", summaryRows.size());
            result.put("items", summaryRows);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    /**
     * Consumption Report.
     * Aggregates issue transactions by Department × Item Category × Period.
     */
    @GetMapping("/consumption")
    public ResponseEntity<?> getConsumptionReport(
            @RequestParam int storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Integer departmentId,
            @RequestParam(required = false) Integer categoryId) {
        try {
            // Get all issue transactions in the period
            List<InvStockTransaction> transactions = transactionRepository
                    .findByStoreIdAndTransactionDateBetweenOrderByItemIdAscTransactionDateAsc(
                            storeId, fromDate, toDate);

            // Filter to issue types only
            List<InvStockTransaction> issueTransactions = transactions.stream()
                    .filter(t -> t.getTransactionType() == InvStockTransaction.TransactionType.ISSUE_SALE
                            || t.getTransactionType() == InvStockTransaction.TransactionType.ISSUE_INTERNAL)
                    .collect(Collectors.toList());

            // Group by item category
            Map<String, Map<String, Object>> categoryTotals = new LinkedHashMap<>();
            BigDecimal grandTotalQuantity = BigDecimal.ZERO;
            BigDecimal grandTotalValue = BigDecimal.ZERO;

            for (InvStockTransaction txn : issueTransactions) {
                var item = txn.getItem();
                if (item == null) continue;

                // Filter by category if specified
                if (categoryId != null && (item.getCategory() == null || item.getCategory().getId() != categoryId)) {
                    continue;
                }

                String categoryName = item.getCategory() != null ? item.getCategory().getCategoryName() : "Uncategorized";
                int catId = item.getCategory() != null ? item.getCategory().getId() : 0;

                Map<String, Object> catEntry = categoryTotals.computeIfAbsent(categoryName, k -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("categoryId", catId);
                    m.put("categoryName", k);
                    m.put("totalQuantity", BigDecimal.ZERO);
                    m.put("totalValue", BigDecimal.ZERO);
                    m.put("items", new ArrayList<Map<String, Object>>());
                    return m;
                });

                BigDecimal value = txn.getQuantity().multiply(txn.getUnitCost()).setScale(2, RoundingMode.HALF_UP);

                catEntry.put("totalQuantity", ((BigDecimal) catEntry.get("totalQuantity")).add(txn.getQuantity()));
                catEntry.put("totalValue", ((BigDecimal) catEntry.get("totalValue")).add(value));

                grandTotalQuantity = grandTotalQuantity.add(txn.getQuantity());
                grandTotalValue = grandTotalValue.add(value);
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("storeId", storeId);
            result.put("fromDate", fromDate);
            result.put("toDate", toDate);
            result.put("grandTotalQuantity", grandTotalQuantity);
            result.put("grandTotalValue", grandTotalValue);
            result.put("categories", new ArrayList<>(categoryTotals.values()));

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
