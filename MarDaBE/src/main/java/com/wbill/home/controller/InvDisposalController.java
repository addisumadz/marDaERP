package com.wbill.home.controller;

import com.wbill.home.model.*;
import com.wbill.home.model.InvDisposal.DisposalStatus;
import com.wbill.home.model.InvDisposal.DisposalType;
import com.wbill.home.service.InvDisposalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/mardaerp/inv-disposals")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvDisposalController {

    @Autowired
    private InvDisposalService service;

    @GetMapping("/all")
    public ResponseEntity<Page<InvDisposal>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Integer storeId,
            @RequestParam(required = false) String status) {
        if (storeId != null && status != null) return ResponseEntity.ok(service.getByStore(storeId, page, size));
        if (storeId != null) return ResponseEntity.ok(service.getByStore(storeId, page, size));
        if (status != null) return ResponseEntity.ok(service.getByStatus(DisposalStatus.valueOf(status), page, size));
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
            InvDisposal disposal = new InvDisposal();
            disposal.setDisposalType(DisposalType.valueOf((String) body.get("disposalType")));
            disposal.setReason((String) body.get("reason"));
            disposal.setDisposalMethod((String) body.get("disposalMethod"));
            disposal.setCommitteeMembers((String) body.get("committeeMembers"));
            disposal.setRemarks((String) body.get("remarks"));

            if (body.get("branchId") != null) {
                Branch branch = new Branch();
                branch.setId(Integer.parseInt(body.get("branchId").toString()));
                disposal.setBranch(branch);
            }

            int storeId = Integer.parseInt(body.get("storeId").toString());

            List<Map<String, Object>> lineData = (List<Map<String, Object>>) body.get("lines");
            List<InvDisposalLine> lines = new ArrayList<>();
            for (Map<String, Object> ld : lineData) {
                InvDisposalLine line = new InvDisposalLine();
                InvItem item = new InvItem();
                item.setId(Long.parseLong(ld.get("itemId").toString()));
                line.setItem(item);
                line.setQuantity(new BigDecimal(ld.get("quantity").toString()));
                if (ld.get("reason") != null) line.setReason((String) ld.get("reason"));
                if (ld.get("remarks") != null) line.setRemarks((String) ld.get("remarks"));
                lines.add(line);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(disposal, storeId, lines, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<?> submit(@PathVariable long id, Principal principal) {
        try {
            return ResponseEntity.ok(service.submit(id, principal != null ? principal.getName() : "system"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/execute")
    public ResponseEntity<?> execute(@PathVariable long id, Principal principal) {
        try {
            return ResponseEntity.ok(service.execute(id, principal != null ? principal.getName() : "system"));
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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable long id) {
        try {
            service.delete(id);
            return ResponseEntity.ok(Collections.singletonMap("message", "Deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
