package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.model.InvPurchaseRequisition.PRStatus;
import com.wbill.home.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InvPurchaseRequisitionService {

    @Autowired
    private InvPurchaseRequisitionRepository repository;

    @Autowired
    private InvStoreRepository storeRepository;

    @Autowired
    private InvItemRepository itemRepository;

    @Autowired(required = false)
    private WorkflowService workflowService;

    @Autowired(required = false)
    private UserAccountRepository userAccountRepo;

    @Autowired(required = false)
    private UserAccountRoleRepository userAccountRoleRepo;

    @Autowired(required = false)
    private InvStoreUserRepository storeUserRepo;

    public boolean isAdmin(String username) {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }
        if ("system".equalsIgnoreCase(username)) {
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

    public boolean isMainOfficeOrAdmin(String username) {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }
        if ("system".equalsIgnoreCase(username) || isAdmin(username)) {
            return true;
        }
        if (userAccountRepo != null) {
            Optional<UserAccount> userOpt = userAccountRepo.findByUserName(username);
            if (userOpt.isPresent()) {
                UserAccount ua = userOpt.get();
                if (ua.getBranch() != null && ua.getBranch().getBranchCode() != null) {
                    if ("MO".equalsIgnoreCase(ua.getBranch().getBranchCode().trim())) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public Integer getUserBranchId(String username) {
        if (username == null || username.trim().isEmpty() || userAccountRepo == null) {
            return null;
        }
        Optional<UserAccount> userOpt = userAccountRepo.findByUserName(username);
        if (userOpt.isPresent() && userOpt.get().getBranch() != null) {
            return userOpt.get().getBranch().getId();
        }
        return null;
    }

    public Page<InvPurchaseRequisition> getAllFiltered(Integer storeId, String statusStr, String username, int page, int size) {
        PRStatus status = null;
        if (statusStr != null && !statusStr.trim().isEmpty() && !"ALL".equalsIgnoreCase(statusStr)) {
            try {
                status = PRStatus.valueOf(statusStr.trim());
            } catch (Exception ignored) {}
        }

        boolean isMoOrAdmin = isMainOfficeOrAdmin(username);
        if (isMoOrAdmin) {
            if (storeId != null && status != null) {
                return getByStoreAndStatus(storeId, status, page, size);
            } else if (storeId != null) {
                return getByStore(storeId, page, size);
            } else if (status != null) {
                return getByStatus(status, page, size);
            }
            return getAll(page, size);
        }

        // Branch-scoped user (Branch Manager, Store Keeper, etc. belonging to a specific branch)
        Integer userBranchId = getUserBranchId(username);
        if (userBranchId == null) {
            return new org.springframework.data.domain.PageImpl<>(
                    Collections.emptyList(),
                    PageRequest.of(page, size),
                    0
            );
        }

        // If a specific store is requested, ensure that the store belongs to the user's branch
        if (storeId != null) {
            Optional<InvStore> storeOpt = storeRepository.findById(storeId);
            if (storeOpt.isPresent() && storeOpt.get().getBranch() != null && storeOpt.get().getBranch().getId() == userBranchId) {
                if (status != null) {
                    return getByStoreAndStatus(storeId, status, page, size);
                }
                return getByStore(storeId, page, size);
            } else {
                return new org.springframework.data.domain.PageImpl<>(
                        Collections.emptyList(),
                        PageRequest.of(page, size),
                        0
                );
            }
        }

        // No specific store requested: return all PRs for stores in user's branch
        if (status != null) {
            return repository.findByBranchIdAndStatusOrderByCreatedAtDesc(userBranchId, status, PageRequest.of(page, size));
        }
        return repository.findByBranchIdOrderByCreatedAtDesc(userBranchId, PageRequest.of(page, size));
    }

    public Page<InvPurchaseRequisition> getAll(int page, int size) {
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    public Page<InvPurchaseRequisition> getByStore(int storeId, int page, int size) {
        return repository.findByStoreIdOrderByCreatedAtDesc(storeId, PageRequest.of(page, size));
    }

    public Page<InvPurchaseRequisition> getByStatus(PRStatus status, int page, int size) {
        return repository.findByStatusOrderByCreatedAtDesc(status, PageRequest.of(page, size));
    }

    public Page<InvPurchaseRequisition> getByStoreAndStatus(int storeId, PRStatus status, int page, int size) {
        return repository.findByStoreIdAndStatusOrderByCreatedAtDesc(storeId, status, PageRequest.of(page, size));
    }

    public Optional<InvPurchaseRequisition> getById(long id) {
        return repository.findById(id);
    }

    @Transactional
    public InvPurchaseRequisition create(InvPurchaseRequisition pr, int storeId, List<InvPurchaseRequisitionLine> lines, String username) {
        InvStore store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        pr.setStore(store);
        pr.setRequisitionNumber(generateNumber());
        pr.setRequestedBy(username);
        pr.setRequestedDate(LocalDate.now());
        pr.setStatus(PRStatus.DRAFT);
        pr.setCreatedBy(username);

        BigDecimal total = BigDecimal.ZERO;
        int order = 1;
        for (InvPurchaseRequisitionLine line : lines) {
            InvItem item = itemRepository.findById(line.getItem().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Item not found: " + line.getItem().getId()));
            line.setItem(item);
            line.setEstimatedTotal(line.getRequestedQuantity().multiply(line.getEstimatedUnitCost()).setScale(2, java.math.RoundingMode.HALF_UP));
            line.setLineOrder(order++);
            pr.addLine(line);
            total = total.add(line.getEstimatedTotal());
        }
        pr.setTotalEstimatedAmount(total);
        return repository.save(pr);
    }

    @Transactional
    public InvPurchaseRequisition submit(long id, String username) {
        InvPurchaseRequisition pr = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PR not found"));
        if (pr.getStatus() != PRStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT requisitions can be submitted");
        }
        pr.setStatus(PRStatus.SUBMITTED);
        pr = repository.save(pr);

        Integer branchId = null;
        if (pr.getStore() != null && pr.getStore().getBranch() != null) {
            branchId = pr.getStore().getBranch().getId();
        }

        if (workflowService != null) {
            try {
                workflowService.initiateWorkflow(
                    "PURCHASE_REQUISITION",
                    pr.getId(),
                    pr.getRequisitionNumber(),
                    pr.getTotalEstimatedAmount(),
                    branchId,
                    username
                );
            } catch (Exception e) {
                org.slf4j.LoggerFactory.getLogger(InvPurchaseRequisitionService.class)
                    .warn("Workflow initiation for PR {}: {}", pr.getRequisitionNumber(), e.getMessage());
            }
        }

        return repository.findById(id).orElse(pr);
    }

    @Transactional
    public InvPurchaseRequisition approveL1(long id, String approver) {
        InvPurchaseRequisition pr = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PR not found"));
        if (pr.getStatus() != PRStatus.SUBMITTED) {
            throw new IllegalStateException("Only SUBMITTED requisitions can be approved at L1");
        }
        pr.setStatus(PRStatus.APPROVED_L1);
        pr.setApprovedByL1(approver);
        pr.setApprovedDateL1(LocalDateTime.now());
        // Set approved quantities to requested if not set
        for (InvPurchaseRequisitionLine line : pr.getLines()) {
            if (line.getApprovedQuantity() == null) {
                line.setApprovedQuantity(line.getRequestedQuantity());
            }
        }
        pr = repository.save(pr);

        // Advance workflow instance if present
        if (workflowService != null) {
            try {
                workflowService.getInstanceByDocument("PURCHASE_REQUISITION", id).ifPresent(wf -> {
                    if ("IN_PROGRESS".equals(wf.getStatus())) {
                        workflowService.approve(wf.getId(), approver, "Approved L1 via PR Service");
                    }
                });
            } catch (Exception ignored) {}
        }
        return repository.findById(id).orElse(pr);
    }

    @Transactional
    public InvPurchaseRequisition approveL2(long id, String approver) {
        InvPurchaseRequisition pr = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PR not found"));
        if (pr.getStatus() != PRStatus.APPROVED_L1 && pr.getStatus() != PRStatus.SUBMITTED) {
            throw new IllegalStateException("Requisition is not in an approvable status");
        }
        pr.setStatus(PRStatus.APPROVED_L2);
        pr.setApprovedByL2(approver);
        pr.setApprovedDateL2(LocalDateTime.now());
        pr = repository.save(pr);

        // Advance workflow instance if present
        if (workflowService != null) {
            try {
                workflowService.getInstanceByDocument("PURCHASE_REQUISITION", id).ifPresent(wf -> {
                    if ("IN_PROGRESS".equals(wf.getStatus())) {
                        workflowService.approve(wf.getId(), approver, "Approved L2 via PR Service");
                    }
                });
            } catch (Exception ignored) {}
        }
        return repository.findById(id).orElse(pr);
    }

    @Transactional
    public InvPurchaseRequisition reject(long id, String rejector, String reason) {
        InvPurchaseRequisition pr = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PR not found"));
        pr.setStatus(PRStatus.REJECTED);
        pr.setRejectedBy(rejector);
        pr.setRejectedDate(LocalDateTime.now());
        pr.setRejectionReason(reason);
        pr = repository.save(pr);

        // Reject workflow instance if present
        if (workflowService != null) {
            try {
                workflowService.getInstanceByDocument("PURCHASE_REQUISITION", id).ifPresent(wf -> {
                    if ("IN_PROGRESS".equals(wf.getStatus())) {
                        workflowService.reject(wf.getId(), rejector, reason);
                    }
                });
            } catch (Exception ignored) {}
        }
        return repository.findById(id).orElse(pr);
    }

    private String generateNumber() {
        String prefix = "PR-" + Year.now().getValue() + "-";
        Long maxSeq = repository.findMaxSequence(prefix);
        long next = (maxSeq != null ? maxSeq : 0) + 1;
        return prefix + String.format("%05d", next);
    }
}
