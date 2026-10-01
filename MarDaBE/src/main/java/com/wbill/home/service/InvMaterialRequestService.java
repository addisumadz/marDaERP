package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.model.InvMaterialRequest.RequestStatus;
import com.wbill.home.model.InvIssueVoucher.IssueType;
import com.wbill.home.model.InvIssueVoucher.IssueStatus;
import com.wbill.home.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Optional;

@Service
public class InvMaterialRequestService {

    @Autowired
    private InvMaterialRequestRepository repository;

    @Autowired
    private InvStoreRepository storeRepository;

    @Autowired
    private InvItemRepository itemRepository;

    @Autowired
    private InvItemStoreStockRepository stockRepository;

    @Autowired
    private InvIssueVoucherRepository issueVoucherRepository;

    @Autowired
    private WorkflowService workflowService;

    public Page<InvMaterialRequest> getAll(int page, int size) {
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    public Page<InvMaterialRequest> getByStore(int storeId, int page, int size) {
        return repository.findByStoreIdOrderByCreatedAtDesc(storeId, PageRequest.of(page, size));
    }

    public Page<InvMaterialRequest> getByStatus(RequestStatus status, int page, int size) {
        return repository.findByStatusOrderByCreatedAtDesc(status, PageRequest.of(page, size));
    }

    public Page<InvMaterialRequest> getByBranch(int branchId, int page, int size) {
        return repository.findByBranchIdOrderByCreatedAtDesc(branchId, PageRequest.of(page, size));
    }

    public Page<InvMaterialRequest> getByBranchAndStatus(int branchId, RequestStatus status, int page, int size) {
        return repository.findByBranchIdAndStatusOrderByCreatedAtDesc(branchId, status, PageRequest.of(page, size));
    }

    public Optional<InvMaterialRequest> getById(long id) {
        return repository.findById(id);
    }

    @Transactional
    public InvMaterialRequest create(InvMaterialRequest request, int storeId, List<InvMaterialRequestLine> lines, String username) {
        InvStore store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        request.setStore(store);
        request.setRequestNumber(generateNumber());
        request.setRequestedDate(LocalDate.now());
        request.setStatus(RequestStatus.DRAFT);
        request.setCreatedBy(username);

        BigDecimal totalEstimated = BigDecimal.ZERO;
        int order = 1;
        for (InvMaterialRequestLine line : lines) {
            InvItem item = itemRepository.findById(line.getItem().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Item not found: " + line.getItem().getId()));
            line.setItem(item);

            // Set estimated cost from weighted avg or default
            InvItemStoreStock stock = stockRepository.findByItemIdAndStoreId(item.getId(), storeId).orElse(null);
            BigDecimal unitCost = stock != null && stock.getWeightedAvgCost().compareTo(BigDecimal.ZERO) > 0
                    ? stock.getWeightedAvgCost()
                    : (item.getDefaultUnitCost() != null ? item.getDefaultUnitCost() : BigDecimal.ZERO);
            line.setEstimatedUnitCost(unitCost);

            totalEstimated = totalEstimated.add(
                    line.getRequestedQuantity().multiply(unitCost).setScale(2, java.math.RoundingMode.HALF_UP));
            line.setLineOrder(order++);
            request.addLine(line);
        }

        request.setTotalEstimatedAmount(totalEstimated);
        return repository.save(request);
    }

    @Transactional
    public InvMaterialRequest update(long id, InvMaterialRequest updated, List<InvMaterialRequestLine> lines) {
        InvMaterialRequest request = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Material Request not found"));
        if (request.getStatus() != RequestStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT requests can be updated");
        }

        request.setPurpose(updated.getPurpose());
        request.setNeededByDate(updated.getNeededByDate());
        request.setPriority(updated.getPriority());
        request.setRemarks(updated.getRemarks());

        // Update lines
        request.getLines().clear();
        BigDecimal totalEstimated = BigDecimal.ZERO;
        int order = 1;
        for (InvMaterialRequestLine line : lines) {
            InvItem item = itemRepository.findById(line.getItem().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Item not found"));
            line.setItem(item);

            InvItemStoreStock stock = stockRepository.findByItemIdAndStoreId(item.getId(), request.getStore().getId()).orElse(null);
            BigDecimal unitCost = stock != null && stock.getWeightedAvgCost().compareTo(BigDecimal.ZERO) > 0
                    ? stock.getWeightedAvgCost()
                    : (item.getDefaultUnitCost() != null ? item.getDefaultUnitCost() : BigDecimal.ZERO);
            line.setEstimatedUnitCost(unitCost);

            totalEstimated = totalEstimated.add(
                    line.getRequestedQuantity().multiply(unitCost).setScale(2, java.math.RoundingMode.HALF_UP));
            line.setLineOrder(order++);
            request.addLine(line);
        }

        request.setTotalEstimatedAmount(totalEstimated);
        return repository.save(request);
    }

    /**
     * Submit to workflow — creates WfWorkflowInstance with documentType = "MATERIAL_REQUEST"
     */
    @Transactional
    public InvMaterialRequest submit(long id, String username) {
        InvMaterialRequest request = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Material Request not found"));
        if (request.getStatus() != RequestStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT requests can be submitted");
        }

        // Create workflow instance
        WfWorkflowInstance instance = workflowService.initiateWorkflow(
                "MATERIAL_REQUEST",
                request.getId(),
                request.getRequestNumber(),
                request.getTotalEstimatedAmount(),
                request.getBranch() != null ? request.getBranch().getId() : null,
                username
        );

        request.setWorkflowInstanceId(instance.getId());
        request.setStatus(RequestStatus.SUBMITTED);
        return repository.save(request);
    }

    /**
     * Called by workflow engine when final approval is granted.
     * Auto-creates a DRAFT Issue Voucher linked to this request.
     */
    @Transactional
    public InvMaterialRequest onWorkflowApproved(long id, String username) {
        InvMaterialRequest request = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Material Request not found"));

        request.setStatus(RequestStatus.APPROVED);

        // Auto-create DRAFT Issue Voucher
        InvIssueVoucher voucher = new InvIssueVoucher();
        voucher.setStore(request.getStore());
        voucher.setVoucherNumber(generateIssueNumber());
        voucher.setIssueType(IssueType.MATERIAL_REQUEST);
        voucher.setIssuedTo(request.getRequestedBy());
        voucher.setDepartment(request.getDepartmentId() != null ? String.valueOf(request.getDepartmentId()) : "");
        voucher.setIssuedDate(LocalDate.now());
        voucher.setStatus(IssueStatus.DRAFT);
        voucher.setRemarks("Auto-created from Material Request: " + request.getRequestNumber());
        voucher.setCreatedBy(username);
        voucher.setMaterialRequest(request);

        int order = 1;
        for (InvMaterialRequestLine mrLine : request.getLines()) {
            InvIssueVoucherLine ivLine = new InvIssueVoucherLine();
            ivLine.setItem(mrLine.getItem());
            BigDecimal qty = mrLine.getApprovedQuantity() != null ? mrLine.getApprovedQuantity() : mrLine.getRequestedQuantity();
            ivLine.setRequestedQuantity(qty);
            ivLine.setUnitCost(mrLine.getEstimatedUnitCost());
            ivLine.setLineOrder(order++);
            voucher.addLine(ivLine);
        }

        InvIssueVoucher savedVoucher = issueVoucherRepository.save(voucher);
        request.setIssueVoucher(savedVoucher);

        return repository.save(request);
    }

    /**
     * Called by workflow engine when request is rejected.
     */
    @Transactional
    public InvMaterialRequest onWorkflowRejected(long id) {
        InvMaterialRequest request = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Material Request not found"));
        request.setStatus(RequestStatus.REJECTED);
        return repository.save(request);
    }

    @Transactional
    public InvMaterialRequest cancel(long id) {
        InvMaterialRequest request = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Material Request not found"));
        if (request.getStatus() == RequestStatus.ISSUED) {
            throw new IllegalStateException("Cannot cancel an already issued request");
        }
        request.setStatus(RequestStatus.CANCELLED);
        return repository.save(request);
    }

    public void delete(long id) {
        InvMaterialRequest request = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Material Request not found"));
        if (request.getStatus() != RequestStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT requests can be deleted");
        }
        repository.deleteById(id);
    }

    private String generateNumber() {
        String prefix = "MRQ-";
        Long maxSeq = repository.findMaxSequence(prefix);
        long next = (maxSeq != null ? maxSeq : 0) + 1;
        return prefix + String.format("%05d", next);
    }

    private String generateIssueNumber() {
        String prefix = "ISS-" + Year.now().getValue() + "-";
        Long maxSeq = issueVoucherRepository.findMaxSequence(prefix);
        long next = (maxSeq != null ? maxSeq : 0) + 1;
        return prefix + String.format("%05d", next);
    }
}
