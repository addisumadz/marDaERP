package com.wbill.home.controller;

import com.wbill.home.model.*;
import com.wbill.home.model.InvMaterialRequest.RequestStatus;
import com.wbill.home.service.InvMaterialRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/mardaerp/inv-material-requests")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvMaterialRequestController {

    @Autowired
    private InvMaterialRequestService service;

    @GetMapping("/all")
    public ResponseEntity<Page<InvMaterialRequest>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Integer storeId,
            @RequestParam(required = false) Integer branchId,
            @RequestParam(required = false) String status) {
        if (branchId != null && status != null) return ResponseEntity.ok(service.getByBranchAndStatus(branchId, RequestStatus.valueOf(status), page, size));
        if (branchId != null) return ResponseEntity.ok(service.getByBranch(branchId, page, size));
        if (storeId != null) return ResponseEntity.ok(service.getByStore(storeId, page, size));
        if (status != null) return ResponseEntity.ok(service.getByStatus(RequestStatus.valueOf(status), page, size));
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
            InvMaterialRequest request = new InvMaterialRequest();
            request.setPurpose((String) body.get("purpose"));
            request.setRemarks((String) body.get("remarks"));
            request.setRequestedBy((String) body.getOrDefault("requestedBy", username));

            if (body.get("priority") != null) {
                request.setPriority(InvMaterialRequest.Priority.valueOf((String) body.get("priority")));
            }
            if (body.get("neededByDate") != null) {
                request.setNeededByDate(LocalDate.parse((String) body.get("neededByDate")));
            }
            if (body.get("departmentId") != null) {
                request.setDepartmentId(Integer.parseInt(body.get("departmentId").toString()));
            }
            if (body.get("branchId") != null) {
                Branch branch = new Branch();
                branch.setId(Integer.parseInt(body.get("branchId").toString()));
                request.setBranch(branch);
            }

            int storeId = Integer.parseInt(body.get("storeId").toString());

            List<Map<String, Object>> lineData = (List<Map<String, Object>>) body.get("lines");
            List<InvMaterialRequestLine> lines = new ArrayList<>();
            for (Map<String, Object> ld : lineData) {
                InvMaterialRequestLine line = new InvMaterialRequestLine();
                InvItem item = new InvItem();
                item.setId(Long.parseLong(ld.get("itemId").toString()));
                line.setItem(item);
                line.setRequestedQuantity(new BigDecimal(ld.get("requestedQuantity").toString()));
                if (ld.get("remarks") != null) line.setRemarks((String) ld.get("remarks"));
                lines.add(line);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, storeId, lines, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable long id, @RequestBody Map<String, Object> body) {
        try {
            InvMaterialRequest updated = new InvMaterialRequest();
            updated.setPurpose((String) body.get("purpose"));
            updated.setRemarks((String) body.get("remarks"));
            if (body.get("priority") != null) {
                updated.setPriority(InvMaterialRequest.Priority.valueOf((String) body.get("priority")));
            }
            if (body.get("neededByDate") != null) {
                updated.setNeededByDate(LocalDate.parse((String) body.get("neededByDate")));
            }

            List<Map<String, Object>> lineData = (List<Map<String, Object>>) body.get("lines");
            List<InvMaterialRequestLine> lines = new ArrayList<>();
            for (Map<String, Object> ld : lineData) {
                InvMaterialRequestLine line = new InvMaterialRequestLine();
                InvItem item = new InvItem();
                item.setId(Long.parseLong(ld.get("itemId").toString()));
                line.setItem(item);
                line.setRequestedQuantity(new BigDecimal(ld.get("requestedQuantity").toString()));
                if (ld.get("remarks") != null) line.setRemarks((String) ld.get("remarks"));
                lines.add(line);
            }
            return ResponseEntity.ok(service.update(id, updated, lines));
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
