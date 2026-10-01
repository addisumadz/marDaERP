package com.wbill.home.controller;

import com.wbill.home.model.*;
import com.wbill.home.model.InvStockCount.CountStatus;
import com.wbill.home.model.InvStockCount.CountScope;
import com.wbill.home.service.InvStockCountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/mardaerp/inv-stock-counts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvStockCountController {

    @Autowired
    private InvStockCountService service;

    @GetMapping("/all")
    public ResponseEntity<Page<InvStockCount>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Integer storeId,
            @RequestParam(required = false) String status) {
        if (storeId != null && status != null) return ResponseEntity.ok(service.getByStore(storeId, page, size));
        if (storeId != null) return ResponseEntity.ok(service.getByStore(storeId, page, size));
        if (status != null) return ResponseEntity.ok(service.getByStatus(CountStatus.valueOf(status), page, size));
        return ResponseEntity.ok(service.getAll(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable long id) {
        return service.getById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Step 1: Plan — creates count and auto-populates lines from stock
     */
    @PostMapping("/plan")
    public ResponseEntity<?> plan(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            InvStockCount count = new InvStockCount();
            count.setRemarks((String) body.get("remarks"));

            if (body.get("countScope") != null) {
                count.setCountScope(CountScope.valueOf((String) body.get("countScope")));
            }
            if (body.get("categoryFilterId") != null) {
                InvItemCategory cat = new InvItemCategory();
                cat.setId(Integer.parseInt(body.get("categoryFilterId").toString()));
                count.setCategoryFilter(cat);
            }
            if (body.get("branchId") != null) {
                Branch branch = new Branch();
                branch.setId(Integer.parseInt(body.get("branchId").toString()));
                count.setBranch(branch);
            }

            int storeId = Integer.parseInt(body.get("storeId").toString());
            return ResponseEntity.status(HttpStatus.CREATED).body(service.plan(count, storeId, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    /**
     * Step 1b: Start counting
     */
    @PutMapping("/{id}/start-counting")
    public ResponseEntity<?> startCounting(@PathVariable long id, Principal principal) {
        try {
            return ResponseEntity.ok(service.startCounting(id, principal != null ? principal.getName() : "system"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    /**
     * Step 2: Save physical count quantities
     */
    @PutMapping("/{id}/save-count")
    public ResponseEntity<?> saveCount(@PathVariable long id, @RequestBody Map<String, Object> body) {
        try {
            List<Map<String, Object>> lineData = (List<Map<String, Object>>) body.get("lines");
            List<InvStockCountLine> lines = new ArrayList<>();
            for (Map<String, Object> ld : lineData) {
                InvStockCountLine line = new InvStockCountLine();
                line.setId(Long.parseLong(ld.get("id").toString()));
                if (ld.get("physicalQuantity") != null) {
                    line.setPhysicalQuantity(new BigDecimal(ld.get("physicalQuantity").toString()));
                }
                if (ld.get("remarks") != null) line.setRemarks((String) ld.get("remarks"));
                lines.add(line);
            }
            return ResponseEntity.ok(service.saveCount(id, lines));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    /**
     * Step 3: Reconcile — verify and auto-create Stock Adjustment
     */
    @PutMapping("/{id}/reconcile")
    public ResponseEntity<?> reconcile(@PathVariable long id, Principal principal) {
        try {
            return ResponseEntity.ok(service.reconcile(id, principal != null ? principal.getName() : "system"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable long id) {
        try {
            return ResponseEntity.ok(service.cancel(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
