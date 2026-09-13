package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.model.InvPurchaseOrder.POStatus;
import com.wbill.home.model.InvPurchaseRequisition.PRStatus;
import com.wbill.home.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Optional;

@Service
public class InvPurchaseOrderService {

    @Autowired
    private InvPurchaseOrderRepository repository;

    @Autowired
    private InvPurchaseRequisitionRepository prRepository;

    @Autowired
    private InvSupplierRepository supplierRepository;

    @Autowired
    private InvStoreRepository storeRepository;

    @Autowired
    private InvItemRepository itemRepository;

    @Autowired(required = false)
    private WorkflowService workflowService;

    public Page<InvPurchaseOrder> getAll(int page, int size) {
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    public Page<InvPurchaseOrder> getByStatus(POStatus status, int page, int size) {
        return repository.findByStatusOrderByCreatedAtDesc(status, PageRequest.of(page, size));
    }

    public Page<InvPurchaseOrder> getByStore(int storeId, int page, int size) {
        return repository.findByStoreIdOrderByCreatedAtDesc(storeId, PageRequest.of(page, size));
    }

    public Optional<InvPurchaseOrder> getById(long id) {
        return repository.findById(id);
    }

    @Transactional
    public InvPurchaseOrder create(InvPurchaseOrder po, int supplierId, int storeId, Long requisitionId,
                                    List<InvPurchaseOrderLine> lines, String username) {
        InvSupplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
        InvStore store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));

        po.setSupplier(supplier);
        po.setStore(store);
        po.setPoNumber(generateNumber());
        po.setOrderDate(LocalDate.now());
        po.setStatus(POStatus.DRAFT);
        po.setCreatedBy(username);

        if (requisitionId != null) {
            InvPurchaseRequisition pr = prRepository.findById(requisitionId)
                    .orElseThrow(() -> new IllegalArgumentException("PR not found"));
            po.setRequisition(pr);
            pr.setStatus(PRStatus.CONVERTED_TO_PO);
            prRepository.save(pr);
        }

        int order = 1;
        for (InvPurchaseOrderLine line : lines) {
            InvItem item = itemRepository.findById(line.getItem().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Item not found"));
            line.setItem(item);
            line.setTotalPrice(line.getOrderedQuantity().multiply(line.getUnitPrice()).setScale(2, java.math.RoundingMode.HALF_UP));
            line.setLineOrder(order++);
            po.addLine(line);
        }
        po.recalculateTotals();
        return repository.save(po);
    }

    @Transactional
    public InvPurchaseOrder submit(long id, String username) {
        InvPurchaseOrder po = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PO not found"));
        if (po.getStatus() != POStatus.DRAFT) throw new IllegalStateException("Only DRAFT POs can be submitted");
        po.setStatus(POStatus.SUBMITTED);
        InvPurchaseOrder saved = repository.save(po);

        // Initiate dynamic approval workflow
        if (workflowService != null) {
            try {
                workflowService.initiateWorkflow(
                        "PURCHASE_ORDER",
                        saved.getId(),
                        saved.getPoNumber(),
                        saved.getGrandTotal(),
                        saved.getStore() != null ? saved.getStore().getId() : null,
                        username
                );
            } catch (Exception e) {
                System.err.println("Warning: Could not initiate workflow for PO " + saved.getPoNumber() + ": " + e.getMessage());
            }
        }
        return saved;
    }

    @Transactional
    public InvPurchaseOrder approveL1(long id, String approver) {
        InvPurchaseOrder po = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PO not found"));
        if (po.getStatus() != POStatus.SUBMITTED) throw new IllegalStateException("Only SUBMITTED POs can be approved at L1");
        po.setStatus(POStatus.APPROVED_L1);
        po.setApprovedByL1(approver);
        po.setApprovedDateL1(LocalDateTime.now());
        return repository.save(po);
    }

    @Transactional
    public InvPurchaseOrder approveL2(long id, String approver) {
        InvPurchaseOrder po = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PO not found"));
        if (po.getStatus() != POStatus.APPROVED_L1) throw new IllegalStateException("Only L1-approved POs can be approved at L2");
        po.setStatus(POStatus.APPROVED_L2);
        po.setApprovedByL2(approver);
        po.setApprovedDateL2(LocalDateTime.now());
        return repository.save(po);
    }

    @Transactional
    public InvPurchaseOrder sendToSupplier(long id) {
        InvPurchaseOrder po = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PO not found"));
        if (po.getStatus() != POStatus.APPROVED_L2) throw new IllegalStateException("Only L2-approved POs can be sent");
        po.setStatus(POStatus.SENT_TO_SUPPLIER);
        return repository.save(po);
    }

    @Transactional
    public InvPurchaseOrder reject(long id, String rejector, String reason) {
        InvPurchaseOrder po = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PO not found"));
        if (po.getStatus() != POStatus.SUBMITTED && po.getStatus() != POStatus.APPROVED_L1) {
            throw new IllegalStateException("Only pending POs can be rejected");
        }
        po.setStatus(POStatus.CANCELLED);
        if (reason != null && !reason.trim().isEmpty()) {
            po.setRemarks((po.getRemarks() != null ? po.getRemarks() + " | " : "") + "Rejected by " + rejector + ": " + reason);
        }
        return repository.save(po);
    }

    public List<InvPurchaseRequisition> getApprovedRequisitions() {
        return prRepository.findByStatusInOrderByCreatedAtDesc(
                java.util.Arrays.asList(PRStatus.APPROVED_L2, PRStatus.APPROVED)
        );
    }

    private String generateNumber() {
        String prefix = "PO-" + Year.now().getValue() + "-";
        Long maxSeq = repository.findMaxSequence(prefix);
        long next = (maxSeq != null ? maxSeq : 0) + 1;
        return prefix + String.format("%05d", next);
    }
}
