package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.model.InvStockTransfer.TransferStatus;
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
public class InvStockTransferService {

    @Autowired
    private InvStockTransferRepository repository;

    @Autowired
    private InvStoreRepository storeRepository;

    @Autowired
    private InvItemRepository itemRepository;

    @Autowired
    private InvStockService stockService;

    @Autowired
    private InvItemStoreStockRepository stockRepository;

    @Autowired(required = false)
    private InvFinanceIntegrationService financeService;

    @Autowired(required = false)
    private WorkflowService workflowService;

    public Page<InvStockTransfer> getAll(int page, int size) {
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    public Page<InvStockTransfer> getByStatus(TransferStatus status, int page, int size) {
        return repository.findByStatusOrderByCreatedAtDesc(status, PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public Optional<InvStockTransfer> getById(long id) {
        Optional<InvStockTransfer> opt = repository.findById(id);
        opt.ifPresent(t -> {
            if (t.getLines() != null) {
                t.getLines().size();
                for (InvStockTransferLine l : t.getLines()) {
                    if (l.getItem() != null) {
                        l.getItem().getItemName();
                        if (l.getItem().getUnitOfMeasure() != null) {
                            l.getItem().getUnitOfMeasure().getUnitName();
                        }
                    }
                }
            }
            if (t.getFromStore() != null) t.getFromStore().getStoreName();
            if (t.getToStore() != null) t.getToStore().getStoreName();
            if (t.getJournalEntry() != null) t.getJournalEntry().getEntryNumber();
        });
        return opt;
    }

    @Transactional
    public InvStockTransfer create(InvStockTransfer transfer, int fromStoreId, int toStoreId,
                                    List<InvStockTransferLine> lines, String username) {
        if (fromStoreId == toStoreId) {
            throw new IllegalArgumentException("Cannot transfer to the same store");
        }
        InvStore fromStore = storeRepository.findById(fromStoreId)
                .orElseThrow(() -> new IllegalArgumentException("Source store not found"));
        InvStore toStore = storeRepository.findById(toStoreId)
                .orElseThrow(() -> new IllegalArgumentException("Destination store not found"));

        transfer.setFromStore(fromStore);
        transfer.setToStore(toStore);
        transfer.setTransferNumber(generateNumber());
        transfer.setTransferDate(LocalDate.now());
        transfer.setRequestedBy(username);
        transfer.setStatus(TransferStatus.DRAFT);
        transfer.setCreatedBy(username);

        BigDecimal total = BigDecimal.ZERO;
        int order = 1;
        for (InvStockTransferLine line : lines) {
            InvItem item = itemRepository.findById(line.getItem().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Item not found"));
            line.setItem(item);
            InvItemStoreStock stock = stockRepository.findByItemIdAndStoreId(item.getId(), fromStoreId).orElse(null);
            if (stock != null) {
                line.setUnitCost(stock.getWeightedAvgCost());
            }
            line.setTotalCost(line.getQuantity().multiply(line.getUnitCost()).setScale(2, java.math.RoundingMode.HALF_UP));
            line.setLineOrder(order++);
            transfer.addLine(line);
            total = total.add(line.getTotalCost());
        }
        transfer.setTotalAmount(total);
        return repository.save(transfer);
    }

    @Transactional
    public InvStockTransfer submit(long id, String username) {
        InvStockTransfer t = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        if (t.getStatus() != TransferStatus.DRAFT) throw new IllegalStateException("Only DRAFT transfers can be submitted");
        t.setStatus(TransferStatus.SUBMITTED);
        InvStockTransfer saved = repository.save(t);

        try {
            if (workflowService != null) {
                Integer branchId = saved.getFromStore() != null && saved.getFromStore().getBranch() != null ? saved.getFromStore().getBranch().getId() : null;
                workflowService.initiateWorkflow(
                    "STOCK_TRANSFER",
                    saved.getId(),
                    saved.getTransferNumber(),
                    saved.getTotalAmount(),
                    branchId,
                    username != null ? username : (saved.getRequestedBy() != null ? saved.getRequestedBy() : "system")
                );
            }
        } catch (Exception ignored) {}

        return saved;
    }

    @Transactional
    public InvStockTransfer submit(long id) {
        return submit(id, null);
    }

    @Transactional
    public InvStockTransfer approve(long id, String approver) {
        InvStockTransfer t = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        if (t.getStatus() != TransferStatus.SUBMITTED) throw new IllegalStateException("Only SUBMITTED transfers can be approved");

        // Validate stock
        for (InvStockTransferLine line : t.getLines()) {
            BigDecimal available = stockService.getAvailableQuantity(line.getItem().getId(), t.getFromStore().getId());
            if (available.compareTo(line.getQuantity()) < 0) {
                throw new IllegalStateException("Insufficient stock for: " + line.getItem().getItemName());
            }
        }

        t.setStatus(TransferStatus.APPROVED);
        t.setApprovedBy(approver);
        t.setApprovedDate(LocalDateTime.now());
        return repository.save(t);
    }

    /**
     * Ship — deducts from source store.
     */
    @Transactional
    public InvStockTransfer ship(long id, String shipper, String waybillNumber, String vehiclePlate, String driverName) {
        InvStockTransfer t = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        if (t.getStatus() != TransferStatus.APPROVED) throw new IllegalStateException("Only APPROVED transfers can be shipped");

        for (InvStockTransferLine line : t.getLines()) {
            stockService.transferOut(line.getItem(), t.getFromStore(), line.getQuantity(), "TRANSFER", t.getId(), shipper);
        }

        t.setStatus(TransferStatus.IN_TRANSIT);
        t.setShippedBy(shipper);
        t.setShippedDate(LocalDateTime.now());
        if (waybillNumber != null && !waybillNumber.isBlank()) t.setWaybillNumber(waybillNumber.trim());
        if (vehiclePlate != null && !vehiclePlate.isBlank()) t.setVehiclePlate(vehiclePlate.trim());
        if (driverName != null && !driverName.isBlank()) t.setDriverName(driverName.trim());
        return repository.save(t);
    }

    @Transactional
    public InvStockTransfer ship(long id, String shipper) {
        return ship(id, shipper, null, null, null);
    }

    /**
     * Receive — adds to destination store.
     */
    @Transactional
    public InvStockTransfer receive(long id, String receiver) {
        InvStockTransfer t = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        if (t.getStatus() != TransferStatus.IN_TRANSIT) throw new IllegalStateException("Only IN_TRANSIT transfers can be received");

        for (InvStockTransferLine line : t.getLines()) {
            BigDecimal receivedQty = line.getReceivedQuantity() != null ? line.getReceivedQuantity() : line.getQuantity();
            stockService.transferIn(line.getItem(), t.getToStore(), receivedQty, line.getUnitCost(), "TRANSFER", t.getId(), receiver);
        }

        t.setStatus(TransferStatus.RECEIVED);
        t.setReceivedBy(receiver);
        t.setReceivedDate(LocalDateTime.now());

        try {
            if (financeService != null) {
                FncJournalEntry entry = financeService.createTransferJournalEntry(t, receiver);
                if (entry != null) {
                    t.setJournalEntry(entry);
                }
            }
        } catch (Exception ignored) {}

        return repository.save(t);
    }

    @Transactional
    public InvStockTransfer reject(long id, String rejecter, String reason) {
        InvStockTransfer t = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        if (t.getStatus() == TransferStatus.RECEIVED || t.getStatus() == TransferStatus.CANCELLED) {
            throw new IllegalStateException("Cannot reject a completed or cancelled transfer");
        }
        t.setStatus(TransferStatus.CANCELLED);
        String msg = "Rejected by " + rejecter + (reason != null && !reason.isBlank() ? ": " + reason.trim() : "");
        t.setRemarks((t.getRemarks() != null ? t.getRemarks() + " | " : "") + msg);
        return repository.save(t);
    }

    private String generateNumber() {
        String prefix = "TRF-" + Year.now().getValue() + "-";
        Long maxSeq = repository.findMaxSequence(prefix);
        long next = (maxSeq != null ? maxSeq : 0) + 1;
        return prefix + String.format("%05d", next);
    }
}
