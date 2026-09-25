package com.wbill.home.controller;

import com.wbill.home.model.InvItem;
import com.wbill.home.service.InvItemService;
import com.wbill.home.service.InvStockService;
import com.wbill.home.repository.InvItemStoreStockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mardaerp/inv-items")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvItemController {

    @Autowired
    private InvItemService service;

    @Autowired
    private InvStockService stockService;

    @Autowired
    private InvItemStoreStockRepository stockRepository;

    @GetMapping("/all")
    public ResponseEntity<Page<InvItem>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Integer categoryId) {
        if (categoryId != null) {
            return ResponseEntity.ok(service.getByCategoryPaged(categoryId, page, size));
        }
        return ResponseEntity.ok(service.getAllPaged(page, size));
    }

    @GetMapping("/active")
    public ResponseEntity<List<InvItem>> getAllActive() {
        return ResponseEntity.ok(service.getAllActive());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<InvItem>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.search(q, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/stock")
    public ResponseEntity<?> getItemStock(@PathVariable long id,
                                           @RequestParam(required = false) Integer storeId) {
        if (storeId != null) {
            return ResponseEntity.ok(stockService.getStock(id, storeId));
        }
        return ResponseEntity.ok(stockRepository.findByItemId(id));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InvItem>> getLowStockItems() {
        return ResponseEntity.ok(service.getLowStockItems());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            InvItem item = new InvItem();
            item.setItemName((String) body.get("itemName"));
            item.setItemNameAm((String) body.get("itemNameAm"));
            item.setDescription((String) body.get("description"));
            item.setReorderLevel(body.get("reorderLevel") != null && !body.get("reorderLevel").toString().isEmpty() ? Integer.parseInt(body.get("reorderLevel").toString()) : 0);
            item.setReorderQuantity(body.get("reorderQuantity") != null && !body.get("reorderQuantity").toString().isEmpty() ? Integer.parseInt(body.get("reorderQuantity").toString()) : 0);
            if (body.get("itemUsage") != null && !body.get("itemUsage").toString().isEmpty()) {
                item.setItemUsage(InvItem.ItemUsage.valueOf((String) body.get("itemUsage")));
            }
            if (body.get("defaultUnitCost") != null && !body.get("defaultUnitCost").toString().isEmpty()) {
                item.setDefaultUnitCost(new BigDecimal(body.get("defaultUnitCost").toString()));
            }
            item.setIsActive(body.get("isActive") != null ? (Boolean) body.get("isActive") : true);
            if (body.get("isWaterMeter") != null) {
                item.setIsWaterMeter(Boolean.parseBoolean(body.get("isWaterMeter").toString()));
            }

            int categoryId = Integer.parseInt(body.get("categoryId").toString());
            Integer groupId = body.get("itemGroupId") != null && !body.get("itemGroupId").toString().isEmpty() ? Integer.parseInt(body.get("itemGroupId").toString()) : null;
            int uomId = Integer.parseInt(body.get("unitOfMeasureId").toString());

            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(item, categoryId, groupId, uomId, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable long id, @RequestBody Map<String, Object> body) {
        try {
            InvItem item = new InvItem();
            item.setItemName((String) body.get("itemName"));
            item.setItemNameAm((String) body.get("itemNameAm"));
            item.setDescription((String) body.get("description"));
            item.setReorderLevel(body.get("reorderLevel") != null && !body.get("reorderLevel").toString().isEmpty() ? Integer.parseInt(body.get("reorderLevel").toString()) : 0);
            item.setReorderQuantity(body.get("reorderQuantity") != null && !body.get("reorderQuantity").toString().isEmpty() ? Integer.parseInt(body.get("reorderQuantity").toString()) : 0);
            if (body.get("itemUsage") != null && !body.get("itemUsage").toString().isEmpty()) {
                item.setItemUsage(InvItem.ItemUsage.valueOf((String) body.get("itemUsage")));
            }
            if (body.get("defaultUnitCost") != null && !body.get("defaultUnitCost").toString().isEmpty()) {
                item.setDefaultUnitCost(new BigDecimal(body.get("defaultUnitCost").toString()));
            }
            item.setIsActive(body.get("isActive") != null ? (Boolean) body.get("isActive") : true);
            if (body.get("isWaterMeter") != null) {
                item.setIsWaterMeter(Boolean.parseBoolean(body.get("isWaterMeter").toString()));
            }

            int categoryId = Integer.parseInt(body.get("categoryId").toString());
            Integer groupId = body.get("itemGroupId") != null && !body.get("itemGroupId").toString().isEmpty() ? Integer.parseInt(body.get("itemGroupId").toString()) : null;
            int uomId = Integer.parseInt(body.get("unitOfMeasureId").toString());

            return ResponseEntity.ok(service.update(id, item, categoryId, groupId, uomId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable long id) {
        try {
            service.softDelete(id);
            return ResponseEntity.ok(Map.of("message", "Item deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
