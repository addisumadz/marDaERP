package com.wbill.home.controller;

import com.wbill.home.model.*;
import com.wbill.home.model.InvIssueVoucher.IssueStatus;
import com.wbill.home.service.InvIssueVoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/mardaerp/inv-issue-vouchers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvIssueVoucherController {

    @Autowired
    private InvIssueVoucherService service;

    @GetMapping("/all")
    public ResponseEntity<Page<InvIssueVoucher>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Integer storeId,
            @RequestParam(required = false) String status) {
        if (storeId != null && status != null) return ResponseEntity.ok(service.getByStore(storeId, page, size));
        if (storeId != null) return ResponseEntity.ok(service.getByStore(storeId, page, size));
        if (status != null) return ResponseEntity.ok(service.getByStatus(IssueStatus.valueOf(status), page, size));
        return ResponseEntity.ok(service.getAll(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable long id) {
        return service.getById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            InvIssueVoucher voucher = new InvIssueVoucher();
            voucher.setIssueType(InvIssueVoucher.IssueType.valueOf((String) body.get("issueType")));
            voucher.setIssuedTo((String) body.get("issuedTo"));
            voucher.setDepartment((String) body.get("department"));
            voucher.setRemarks((String) body.get("remarks"));
            int storeId = Integer.parseInt(body.get("storeId").toString());

            List<Map<String, Object>> lineData = (List<Map<String, Object>>) body.get("lines");
            List<InvIssueVoucherLine> lines = new ArrayList<>();
            for (Map<String, Object> ld : lineData) {
                InvIssueVoucherLine line = new InvIssueVoucherLine();
                InvItem item = new InvItem();
                item.setId(Long.parseLong(ld.get("itemId").toString()));
                line.setItem(item);
                line.setRequestedQuantity(new BigDecimal(ld.get("requestedQuantity").toString()));
                lines.add(line);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(voucher, storeId, lines, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable long id, Principal principal) {
        try {
            return ResponseEntity.ok(service.approve(id, principal != null ? principal.getName() : "system"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/issue")
    public ResponseEntity<?> issue(@PathVariable long id, Principal principal) {
        try {
            return ResponseEntity.ok(service.issue(id, principal != null ? principal.getName() : "system"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
