package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.model.InvDisposal.DisposalStatus;
import com.wbill.home.model.InvStockTransaction.TransactionType;
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
public class InvDisposalService {

    @Autowired
    private InvDisposalRepository repository;

    @Autowired
    private InvStoreRepository storeRepository;

    @Autowired
    private InvItemRepository itemRepository;

    @Autowired
    private InvItemStoreStockRepository stockRepository;

    @Autowired
    private InvStockService stockService;

    @Autowired
    private InvFinanceIntegrationService financeService;

    @Autowired
    private WorkflowService workflowService;

    public Page<InvDisposal> getAll(int page, int size) {
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    public Page<InvDisposal> getByStore(int storeId, int page, int size) {
        return repository.findByStoreIdOrderByCreatedAtDesc(storeId, PageRequest.of(page, size));
    }

    public Page<InvDisposal> getByStatus(DisposalStatus status, int page, int size) {
        return repository.findByStatusOrderByCreatedAtDesc(status, PageRequest.of(page, size));
    }

    public Page<InvDisposal> getByBranch(int branchId, int page, int size) {
        return repository.findByBranchIdOrderByCreatedAtDesc(branchId, PageRequest.of(page, size));
    }

    public Optional<InvDisposal> getById(long id) {
        return repository.findById(id);
    }

    @Transactional
    public InvDisposal create(InvDisposal disposal, int storeId, List<InvDisposalLine> lines, String username) {
        InvStore store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        disposal.setStore(store);
        disposal.setDisposalNumber(generateNumber());
        disposal.setDisposalDate(LocalDate.now());
        disposal.setStatus(DisposalStatus.DRAFT);
        disposal.setCreatedBy(username);

        BigDecimal totalAmount = BigDecimal.ZERO;
        int order = 1;
        for (InvDisposalLine line : lines) {
            InvItem item = itemRepository.findById(line.getItem().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Item not found"));
            line.setItem(item);

            // Set unit cost from weighted average
            InvItemStoreStock stock = stockRepository.findByItemIdAndStoreId(item.getId(), storeId).orElse(null);
            BigDecimal unitCost = stock != null ? stock.getWeightedAvgCost()
                    : (item.getDefaultUnitCost() != null ? item.getDefaultUnitCost() : BigDecimal.ZERO);
            line.setUnitCost(unitCost);
            line.setTotalCost(line.getQuantity().multiply(unitCost).setScale(2, java.math.RoundingMode.HALF_UP));
            totalAmount = totalAmount.add(line.getTotalCost());
            line.setLineOrder(order++);
            disposal.addLine(line);
        }

        disposal.setTotalAmount(totalAmount);
        return repository.save(disposal);
    }

    /**
     * Submit to workflow — creates WfWorkflowInstance with documentType = "DISPOSAL"
     */
    @Transactional
    public InvDisposal submit(long id, String username) {
        InvDisposal disposal = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Disposal not found"));
        if (disposal.getStatus() != DisposalStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT disposals can be submitted");
        }

        // Create workflow instance
        WfWorkflowInstance instance = workflowService.initiateWorkflow(
                "DISPOSAL",
                disposal.getId(),
                disposal.getDisposalNumber(),
                disposal.getTotalAmount(),
                disposal.getBranch() != null ? disposal.getBranch().getId() : null,
                username
        );

        disposal.setWorkflowInstanceId(instance.getId());
        disposal.setStatus(DisposalStatus.SUBMITTED);
        return repository.save(disposal);
    }

    /**
     * Called by workflow engine when final approval is granted.
     */
    @Transactional
    public InvDisposal onWorkflowApproved(long id) {
        InvDisposal disposal = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Disposal not found"));
        disposal.setStatus(DisposalStatus.APPROVED);
        return repository.save(disposal);
    }

    /**
     * Called by workflow engine when request is rejected.
     */
    @Transactional
    public InvDisposal onWorkflowRejected(long id) {
        InvDisposal disposal = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Disposal not found"));
        disposal.setStatus(DisposalStatus.REJECTED);
        return repository.save(disposal);
    }

    /**
     * Execute the disposal — triggers stock deduction + finance journal entry.
     * Only available after workflow approval.
     */
    @Transactional
    public InvDisposal execute(long id, String executor) {
        InvDisposal disposal = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Disposal not found"));
        if (disposal.getStatus() != DisposalStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED disposals can be executed");
        }

        for (InvDisposalLine line : disposal.getLines()) {
            stockService.issueStock(line.getItem(), disposal.getStore(), line.getQuantity(),
                    TransactionType.DISPOSAL, "DISPOSAL", disposal.getId(), executor);
        }

        disposal.setStatus(DisposalStatus.EXECUTED);

        // Finance journal entry — Debit Loss/Write-Off, Credit Inventory
        FncJournalEntry journalEntry = financeService.createDisposalJournalEntry(disposal, executor);
        disposal.setJournalEntry(journalEntry);

        return repository.save(disposal);
    }

    @Transactional
    public InvDisposal cancel(long id) {
        InvDisposal disposal = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Disposal not found"));
        if (disposal.getStatus() == DisposalStatus.EXECUTED) {
            throw new IllegalStateException("Cannot cancel an executed disposal");
        }
        disposal.setStatus(DisposalStatus.CANCELLED);
        return repository.save(disposal);
    }

    public void delete(long id) {
        InvDisposal disposal = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Disposal not found"));
        if (disposal.getStatus() != DisposalStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT disposals can be deleted");
        }
        repository.deleteById(id);
    }

    private String generateNumber() {
        String prefix = "DSP-";
        Long maxSeq = repository.findMaxSequence(prefix);
        long next = (maxSeq != null ? maxSeq : 0) + 1;
        return prefix + String.format("%05d", next);
    }
}
