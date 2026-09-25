package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.model.InvGoodsReceivedNote.GRNStatus;
import com.wbill.home.model.InvPurchaseOrder.POStatus;
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
public class InvGoodsReceivedNoteService {

    @Autowired
    private InvGoodsReceivedNoteRepository repository;

    @Autowired
    private InvPurchaseOrderRepository poRepository;

    @Autowired
    private InvStoreRepository storeRepository;

    @Autowired
    private InvSupplierRepository supplierRepository;

    @Autowired
    private InvItemRepository itemRepository;

    @Autowired
    private InvStockService stockService;

    @Autowired
    private InvFinanceIntegrationService financeService;

    @Autowired
    private InvSerialTrackingRepository serialTrackingRepository;

    public Page<InvGoodsReceivedNote> getAll(int page, int size) {
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    public Page<InvGoodsReceivedNote> getByStore(int storeId, int page, int size) {
        return repository.findByStoreIdOrderByCreatedAtDesc(storeId, PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public Optional<InvGoodsReceivedNote> getById(long id) {
        Optional<InvGoodsReceivedNote> opt = repository.findById(id);
        opt.ifPresent(grn -> {
            if (grn.getLines() != null) {
                grn.getLines().size();
                for (InvGoodsReceivedNoteLine line : grn.getLines()) {
                    if (line.getItem() != null) {
                        line.getItem().getItemName();
                        if (line.getItem().getUnitOfMeasure() != null) {
                            line.getItem().getUnitOfMeasure().getUnitName();
                        }
                    }
                    if (line.getPoLine() != null) {
                        line.getPoLine().getId();
                    }
                }
            }
            if (grn.getPurchaseOrder() != null) {
                grn.getPurchaseOrder().getPoNumber();
            }
            if (grn.getStore() != null) {
                grn.getStore().getStoreName();
            }
            if (grn.getSupplier() != null) {
                grn.getSupplier().getSupplierName();
            }
            if (grn.getJournalEntry() != null) {
                grn.getJournalEntry().getEntryNumber();
            }
        });
        return opt;
    }

    @Transactional
    public InvGoodsReceivedNote create(InvGoodsReceivedNote grn, long poId, int storeId, int supplierId,
                                        List<InvGoodsReceivedNoteLine> lines, String username) {
        InvPurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new IllegalArgumentException("PO not found"));
        InvStore store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        InvSupplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));

        grn.setPurchaseOrder(po);
        grn.setStore(store);
        grn.setSupplier(supplier);
        grn.setGrnNumber(generateNumber());
        grn.setReceivedDate(LocalDate.now());
        grn.setReceivedBy(username);
        grn.setStatus(GRNStatus.DRAFT);
        grn.setCreatedBy(username);

        BigDecimal totalAmount = BigDecimal.ZERO;
        int order = 1;
        for (InvGoodsReceivedNoteLine line : lines) {
            InvItem item = itemRepository.findById(line.getItem().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Item not found"));
            line.setItem(item);

            if (line.getPoLine() != null && line.getPoLine().getId() > 0) {
                long targetPoLineId = line.getPoLine().getId();
                InvPurchaseOrderLine realPoLine = po.getLines().stream()
                        .filter(pl -> pl.getId() == targetPoLineId)
                        .findFirst()
                        .orElse(null);
                if (realPoLine != null) {
                    line.setPoLine(realPoLine);
                }
            }

            line.setTotalCost(line.getAcceptedQuantity().multiply(line.getUnitCost()).setScale(2, java.math.RoundingMode.HALF_UP));
            line.setLineOrder(order++);
            grn.addLine(line);
            totalAmount = totalAmount.add(line.getTotalCost());
        }
        grn.setTotalAmount(totalAmount);
        return repository.save(grn);
    }

    public List<InvPurchaseOrder> getOpenPurchaseOrders() {
        return poRepository.findByStatusInOrderByCreatedAtDesc(
                List.of(POStatus.SENT_TO_SUPPLIER, POStatus.APPROVED_L2, POStatus.PARTIALLY_RECEIVED)
        );
    }

    /**
     * Confirm GRN — this triggers:
     * 1. Stock increase for each accepted line item
     * 2. PO received quantity update
     * 3. Serial/batch tracking creation
     * 4. Finance journal entry (Dr. Inventory, Cr. Accounts Payable)
     */
    @Transactional
    public InvGoodsReceivedNote confirm(long id, String username) {
        InvGoodsReceivedNote grn = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("GRN not found"));
        if (grn.getStatus() != GRNStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT GRNs can be confirmed");
        }

        InvPurchaseOrder po = grn.getPurchaseOrder();

        for (InvGoodsReceivedNoteLine line : grn.getLines()) {
            // 1. Increase stock
            stockService.receiveStock(line.getItem(), grn.getStore(), line.getAcceptedQuantity(),
                    line.getUnitCost(), "GRN", grn.getId(), username);

            // 2. Update PO line received quantity safely on attached entity
            if (line.getPoLine() != null && po.getLines() != null) {
                for (InvPurchaseOrderLine pl : po.getLines()) {
                    if (pl.getId() == line.getPoLine().getId()) {
                        BigDecimal current = pl.getReceivedQuantity() != null ? pl.getReceivedQuantity() : BigDecimal.ZERO;
                        pl.setReceivedQuantity(current.add(line.getAcceptedQuantity()));
                        break;
                    }
                }
            }

            // 3. Create serial/batch tracking if applicable
            createTrackingRecord(line, grn);

            // 4. Update InvItem defaultUnitCost with High-Water Mark (Ratchet) rule for sales pricing
            if (line.getAcceptedQuantity() != null && line.getAcceptedQuantity().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal newBuyingPrice = line.getUnitCost();
                if (newBuyingPrice != null && newBuyingPrice.compareTo(BigDecimal.ZERO) > 0) {
                    InvItem item = line.getItem();
                    BigDecimal currentDefaultCost = item.getDefaultUnitCost() != null ? item.getDefaultUnitCost() : BigDecimal.ZERO;
                    if (newBuyingPrice.compareTo(currentDefaultCost) > 0) {
                        item.setDefaultUnitCost(newBuyingPrice);
                        itemRepository.save(item);
                    }
                }
            }
        }

        // Check if PO is fully received
        boolean allReceived = po.getLines().stream().allMatch(InvPurchaseOrderLine::isFullyReceived);
        po.setStatus(allReceived ? POStatus.FULLY_RECEIVED : POStatus.PARTIALLY_RECEIVED);
        poRepository.save(po);

        // 4. Create finance journal entry
        FncJournalEntry journalEntry = financeService.createGRNJournalEntry(grn, username);
        grn.setJournalEntry(journalEntry);

        grn.setStatus(GRNStatus.CONFIRMED);
        return repository.save(grn);
    }

    private void createTrackingRecord(InvGoodsReceivedNoteLine line, InvGoodsReceivedNote grn) {
        InvItem item = line.getItem();
        InvItemCategory.TrackingType trackingType = item.getTrackingType();

        if (trackingType == InvItemCategory.TrackingType.NONE) return;

        if (trackingType == InvItemCategory.TrackingType.BATCH || trackingType == InvItemCategory.TrackingType.EXPIRY) {
            InvSerialTracking tracking = new InvSerialTracking();
            tracking.setItem(item);
            tracking.setStore(grn.getStore());
            tracking.setTrackingType(InvSerialTracking.TrackingRecordType.BATCH);
            tracking.setBatchNumber(line.getBatchNumber());
            tracking.setExpiryDate(line.getExpiryDate());
            tracking.setStatus(InvSerialTracking.SerialStatus.IN_STOCK);
            tracking.setReferenceType("GRN");
            tracking.setReferenceId(grn.getId());
            tracking.setCreatedBy(grn.getReceivedBy());
            serialTrackingRepository.save(tracking);
        }
    }

    private String generateNumber() {
        String prefix = "GRN-" + Year.now().getValue() + "-";
        Long maxSeq = repository.findMaxSequence(prefix);
        long next = (maxSeq != null ? maxSeq : 0) + 1;
        return prefix + String.format("%05d", next);
    }
}
