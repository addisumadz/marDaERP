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
import java.util.Map;
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

    @Autowired(required = false)
    private InvStoreUserRepository storeUserRepo;

    @Autowired(required = false)
    private UserAccountRepository userAccountRepo;

    @Autowired(required = false)
    private UserAccountRoleRepository userAccountRoleRepo;

    public boolean isAdmin(String username) {
        if (username == null || username.trim().isEmpty()) return false;
        if ("system".equalsIgnoreCase(username) || "admin".equalsIgnoreCase(username) || "billzgjt".equalsIgnoreCase(username)) {
            return true;
        }
        if (userAccountRepo != null) {
            Optional<UserAccount> userOpt = userAccountRepo.findByUserName(username);
            if (userOpt.isPresent()) {
                UserAccount ua = userOpt.get();
                if (ua.getUserRole() != null) {
                    String code = ua.getUserRole().getRoleCode() != null ? ua.getUserRole().getRoleCode().toLowerCase() : "";
                    String name = ua.getUserRole().getRoleName() != null ? ua.getUserRole().getRoleName().toLowerCase() : "";
                    if (code.contains("admin") || code.contains("billzgjt") || code.contains("gm") ||
                        name.contains("admin") || name.contains("አስተዳዳሪ") || name.contains("ሥራ አስኪያጅ")) {
                        return true;
                    }
                }
            }
        }
        if (userAccountRoleRepo != null) {
            List<String> codes = userAccountRoleRepo.findRoleCodesByUsername(username);
            if (codes != null && codes.stream().anyMatch(c -> {
                String lc = c.toLowerCase();
                return lc.contains("admin") || lc.contains("billzgjt") || lc.contains("gm");
            })) {
                return true;
            }
        }
        return false;
    }

    public boolean isAuthorizedForStore(String username, InvStore store) {
        if (username == null || username.trim().isEmpty() || store == null) return false;
        if (isAdmin(username)) return true;

        // 1. Direct StoreKeeper on store entity
        if (store.getStoreKeeper() != null && store.getStoreKeeper().getUserName() != null) {
            if (store.getStoreKeeper().getUserName().equalsIgnoreCase(username)) {
                return true;
            }
        }

        // 2. Direct Manager on store entity
        if (store.getManager() != null && store.getManager().getUserName() != null) {
            if (store.getManager().getUserName().equalsIgnoreCase(username)) {
                return true;
            }
        }

        // 3. User store assignment via inv_store_user
        if (storeUserRepo != null) {
            List<InvStoreUser> userStores = storeUserRepo.findByStoreIdAndIsActiveTrue(store.getId());
            if (userStores != null && userStores.stream().anyMatch(su ->
                su.getUserAccount() != null && su.getUserAccount().getUserName() != null &&
                su.getUserAccount().getUserName().equalsIgnoreCase(username))) {
                return true;
            }
        }

        return false;
    }

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
    public InvStockTransfer updateLines(long transferId, List<Map<String, Object>> updatedLines, String username) {
        InvStockTransfer t = repository.findById(transferId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        if (t.getStatus() != TransferStatus.DRAFT && t.getStatus() != TransferStatus.SUBMITTED) {
            throw new IllegalStateException("Quantities can only be updated for DRAFT or SUBMITTED transfers");
        }

        if (updatedLines == null || updatedLines.isEmpty()) {
            return t;
        }

        BigDecimal newTotal = BigDecimal.ZERO;
        for (Map<String, Object> ul : updatedLines) {
            Long lineId = ul.get("id") != null && !ul.get("id").toString().isEmpty()
                    ? Long.parseLong(ul.get("id").toString())
                    : null;
            BigDecimal newQty = new BigDecimal(ul.get("quantity").toString());

            if (newQty.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than 0");
            }

            InvStockTransferLine line = null;
            if (lineId != null) {
                line = t.getLines().stream().filter(l -> l.getId() == lineId).findFirst().orElse(null);
            } else if (ul.get("itemId") != null) {
                long itemId = Long.parseLong(ul.get("itemId").toString());
                line = t.getLines().stream().filter(l -> l.getItem() != null && l.getItem().getId() == itemId).findFirst().orElse(null);
            }

            if (line != null) {
                // Check stock availability in fromStore
                BigDecimal available = stockService.getAvailableQuantity(line.getItem().getId(), t.getFromStore().getId());
                if (available.compareTo(newQty) < 0) {
                    throw new IllegalArgumentException("Insufficient stock in source store '" + t.getFromStore().getStoreName() +
                            "' for item: " + line.getItem().getItemName() + ". (Available: " + available + ", Requested: " + newQty + ")");
                }

                line.setQuantity(newQty);
                BigDecimal unitCost = line.getUnitCost() != null ? line.getUnitCost() : BigDecimal.ZERO;
                line.setTotalCost(newQty.multiply(unitCost).setScale(2, java.math.RoundingMode.HALF_UP));
            }
        }

        for (InvStockTransferLine l : t.getLines()) {
            newTotal = newTotal.add(l.getTotalCost() != null ? l.getTotalCost() : BigDecimal.ZERO);
        }
        t.setTotalAmount(newTotal);

        return repository.save(t);
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

        // Custody check: Shipper must be superadmin or assigned to source store
        if (!isAuthorizedForStore(shipper, t.getFromStore())) {
            String storeName = t.getFromStore() != null ? t.getFromStore().getStoreName() : "";
            throw new IllegalArgumentException("User '" + shipper + "' is not authorized to dispatch stock from source store: " + storeName);
        }

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

        // Custody check: Receiver must be superadmin or assigned to destination store
        if (!isAuthorizedForStore(receiver, t.getToStore())) {
            String storeName = t.getToStore() != null ? t.getToStore().getStoreName() : "";
            throw new IllegalArgumentException("User '" + receiver + "' is not authorized to accept and receive inventory for destination store: " + storeName + ". Only the destination store owner or assigned storekeeper may confirm receipt.");
        }

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
