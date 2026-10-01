package com.wbill.home.controller;

import com.wbill.home.model.*;
import com.wbill.home.model.InvReturnVoucher.ReturnStatus;
import com.wbill.home.model.InvReturnVoucher.ReturnType;
import com.wbill.home.model.InvReturnVoucherLine.ItemCondition;
import com.wbill.home.service.InvReturnVoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/mardaerp/inv-return-vouchers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvReturnVoucherController {

    @Autowired
    private InvReturnVoucherService service;

    @GetMapping("/all")
    public ResponseEntity<Page<InvReturnVoucher>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Integer storeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String returnType) {
        if (storeId != null && returnType != null) return ResponseEntity.ok(service.getByStore(storeId, page, size));
        if (storeId != null && status != null) return ResponseEntity.ok(service.getByStore(storeId, page, size));
        if (storeId != null) return ResponseEntity.ok(service.getByStore(storeId, page, size));
        if (status != null) return ResponseEntity.ok(service.getByStatus(ReturnStatus.valueOf(status), page, size));
        if (returnType != null) return ResponseEntity.ok(service.getByReturnType(ReturnType.valueOf(returnType), page, size));
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
            InvReturnVoucher voucher = new InvReturnVoucher();
            voucher.setReturnType(ReturnType.valueOf((String) body.get("returnType")));
            voucher.setReturnedBy((String) body.get("returnedBy"));
            voucher.setDepartment((String) body.get("department"));
            voucher.setReason((String) body.get("reason"));
            voucher.setRemarks((String) body.get("remarks"));

            if (body.get("originalIssueVoucherId") != null) {
                InvIssueVoucher iv = new InvIssueVoucher();
                iv.setId(Long.parseLong(body.get("originalIssueVoucherId").toString()));
                voucher.setOriginalIssueVoucher(iv);
            }
            if (body.get("originalGrnId") != null) {
                InvGoodsReceivedNote grn = new InvGoodsReceivedNote();
                grn.setId(Long.parseLong(body.get("originalGrnId").toString()));
                voucher.setOriginalGrn(grn);
            }
            if (body.get("supplierId") != null) {
                InvSupplier supplier = new InvSupplier();
                supplier.setId(Integer.parseInt(body.get("supplierId").toString()));
                voucher.setSupplier(supplier);
            }
            if (body.get("branchId") != null) {
                Branch branch = new Branch();
                branch.setId(Integer.parseInt(body.get("branchId").toString()));
                voucher.setBranch(branch);
            }

            int storeId = Integer.parseInt(body.get("storeId").toString());

            List<Map<String, Object>> lineData = (List<Map<String, Object>>) body.get("lines");
            List<InvReturnVoucherLine> lines = new ArrayList<>();
            for (Map<String, Object> ld : lineData) {
                InvReturnVoucherLine line = new InvReturnVoucherLine();
                InvItem item = new InvItem();
                item.setId(Long.parseLong(ld.get("itemId").toString()));
                line.setItem(item);
                line.setQuantity(new BigDecimal(ld.get("quantity").toString()));
                if (ld.get("conditionStatus") != null) {
                    line.setConditionStatus(ItemCondition.valueOf((String) ld.get("conditionStatus")));
                }
                if (ld.get("remarks") != null) line.setRemarks((String) ld.get("remarks"));
                lines.add(line);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(voucher, storeId, lines, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable long id, Principal principal) {
        try {
            return ResponseEntity.ok(service.approve(id, principal != null ? principal.getName() : "system"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<?> receive(@PathVariable long id, Principal principal) {
        try {
            return ResponseEntity.ok(service.receive(id, principal != null ? principal.getName() : "system"));
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
