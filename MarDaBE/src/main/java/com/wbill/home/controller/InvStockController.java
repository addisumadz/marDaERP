package com.wbill.home.controller;

import com.wbill.home.dto.InvStockTransactionDTO;
import com.wbill.home.dto.InvItemStoreStockDTO;
import com.wbill.home.model.InvItemStoreStock;
import com.wbill.home.model.InvStockTransaction;
import com.wbill.home.service.InvStockService;
import com.wbill.home.repository.InvItemStoreStockRepository;
import com.wbill.home.repository.InvStockTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mardaerp/inv-stock")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvStockController {

    @Autowired
    private InvStockService stockService;

    @Autowired
    private InvItemStoreStockRepository stockRepository;

    @Autowired
    private InvStockTransactionRepository transactionRepository;

    @GetMapping("/by-store/{storeId}")
    public ResponseEntity<Page<InvItemStoreStockDTO>> getStockByStore(
            @PathVariable int storeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<InvItemStoreStockDTO> dtoPage = stockRepository.findByStoreId(storeId, PageRequest.of(page, size))
                .map(InvItemStoreStockDTO::fromEntity);
        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/item/{itemId}/store/{storeId}")
    public ResponseEntity<?> getItemStock(@PathVariable long itemId, @PathVariable int storeId) {
        return stockService.getStock(itemId, storeId)
                .map(s -> ResponseEntity.ok(InvItemStoreStockDTO.fromEntity(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InvItemStoreStockDTO>> getLowStock(
            @RequestParam(required = false) Integer storeId) {
        List<InvItemStoreStock> entities;
        if (storeId != null) {
            entities = stockService.getLowStockItems(storeId);
        } else {
            entities = stockService.getAllLowStockItems();
        }
        List<InvItemStoreStockDTO> dtos = entities.stream()
                .map(InvItemStoreStockDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/valuation")
    public ResponseEntity<Map<String, Object>> getStockValuation(
            @RequestParam(required = false) Integer storeId) {
        Map<String, Object> result = new HashMap<>();
        if (storeId != null) {
            result.put("storeId", storeId);
            result.put("totalValue", stockService.getTotalStockValue(storeId));
        } else {
            result.put("totalValue", stockService.getTotalStockValue());
        }
        result.put("currency", "ETB");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/transactions")
    public ResponseEntity<Page<InvStockTransactionDTO>> getTransactions(
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) Integer storeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<InvStockTransaction> entityPage;
        if (itemId != null && storeId != null) {
            entityPage = transactionRepository.findByItemIdAndStoreIdOrderByCreatedAtDesc(itemId, storeId, PageRequest.of(page, size));
        } else if (itemId != null) {
            entityPage = transactionRepository.findByItemIdOrderByCreatedAtDesc(itemId, PageRequest.of(page, size));
        } else if (storeId != null) {
            entityPage = transactionRepository.findByStoreIdOrderByCreatedAtDesc(storeId, PageRequest.of(page, size));
        } else {
            entityPage = transactionRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()));
        }
        return ResponseEntity.ok(entityPage.map(InvStockTransactionDTO::fromEntity));
    }

    @GetMapping("/stock-card")
    public ResponseEntity<List<InvStockTransactionDTO>> getStockCard(
            @RequestParam long itemId,
            @RequestParam int storeId) {
        List<InvStockTransactionDTO> dtos = transactionRepository.getStockCard(itemId, storeId).stream()
                .map(InvStockTransactionDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}

