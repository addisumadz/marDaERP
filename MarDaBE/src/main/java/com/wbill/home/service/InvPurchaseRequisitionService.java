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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.wbill.home.model.hrms.HrmsDepartment;
import com.wbill.home.model.hrms.HrmsEmployee;
import com.wbill.home.repository.hrms.HrmsDepartmentRepository;
import com.wbill.home.repository.hrms.HrmsEmployeeRepository;

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

    @Autowired(required = false)
    private HrmsDepartmentRepository departmentRepository;

    @Autowired(required = false)
    private HrmsEmployeeRepository employeeRepository;

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

    public List<Integer> getManagedDepartmentIds(String username) {
        List<Integer> deptIds = new ArrayList<>();
        if (departmentRepository == null || username == null) return deptIds;

        // 1. By employeeId
        if (employeeRepository != null) {
            employeeRepository.findByEmployeeIdAndDeletedFalse(username).ifPresent(emp -> {
                List<HrmsDepartment> allDepts = departmentRepository.findByActiveTrueOrderByDepartmentNameAsc();
                for (HrmsDepartment d : allDepts) {
                    if (d.getManagerEmployeeId() != null && d.getManagerEmployeeId() == emp.getId()) {
                        deptIds.add(d.getId());
                    }
                }
            });
        }
        // 2. By UserAccount matching full name
        if (deptIds.isEmpty() && userAccountRepo != null && employeeRepository != null) {
            userAccountRepo.findByUserName(username).ifPresent(ua -> {
                String fullName = ((ua.getFirstName() != null ? ua.getFirstName() : "") + " " +
                                  (ua.getLastName() != null ? ua.getLastName() : "")).trim();
                if (!fullName.isEmpty()) {
                    List<HrmsEmployee> matching = employeeRepository.searchEmployees(fullName);
                    if (!matching.isEmpty()) {
                        int empId = matching.get(0).getId();
                        for (HrmsDepartment d : departmentRepository.findByActiveTrueOrderByDepartmentNameAsc()) {
                            if (d.getManagerEmployeeId() != null && d.getManagerEmployeeId() == empId) {
                                deptIds.add(d.getId());
                            }
                        }
                    }
                }
            });
        }
        return deptIds;
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

        // Department Manager view
        List<Integer> managedDeptIds = getManagedDepartmentIds(username);
        if (!managedDeptIds.isEmpty()) {
            if (status != null) {
                return repository.findByDepartmentIdAndStatusOrderByCreatedAtDesc(managedDeptIds.get(0), status, PageRequest.of(page, size));
            }
            return repository.findByDepartmentIdInOrderByCreatedAtDesc(managedDeptIds, PageRequest.of(page, size));
        }

        // Branch-scoped user or individual requester
        Integer userBranchId = getUserBranchId(username);
        if (userBranchId == null) {
            if (status != null) {
                return repository.findByRequestedByAndStatusOrderByCreatedAtDesc(username, status, PageRequest.of(page, size));
            }
            return repository.findByRequestedByOrderByCreatedAtDesc(username, PageRequest.of(page, size));
        }

        // If a specific store is requested
        if (storeId != null) {
            Optional<InvStore> storeOpt = storeRepository.findById(storeId);
            if (storeOpt.isPresent() && storeOpt.get().getBranch() != null && storeOpt.get().getBranch().getId() == userBranchId) {
                if (status != null) {
                    return getByStoreAndStatus(storeId, status, page, size);
                }
                return getByStore(storeId, page, size);
            }
        }

        // No specific store requested: return all PRs for branch or created by this user
        if (status != null) {
            return repository.findByBranchOrRequesterAndStatus(userBranchId, username, status, PageRequest.of(page, size));
        }
        return repository.findByBranchOrRequester(userBranchId, username, PageRequest.of(page, size));
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
    public InvPurchaseRequisition create(InvPurchaseRequisition pr, Integer storeId, Integer departmentId, Integer employeeId, String positionTitle, List<InvPurchaseRequisitionLine> lines, String username) {
        if (storeId != null && storeId > 0) {
            storeRepository.findById(storeId).ifPresent(pr::setStore);
        }

        // Link Employee
        if (employeeId != null && employeeId > 0 && employeeRepository != null) {
            employeeRepository.findById(employeeId).ifPresent(emp -> {
                pr.setEmployee(emp);
                if (pr.getDepartment() == null && emp.getDepartment() != null) {
                    pr.setDepartment(emp.getDepartment());
                }
                if (pr.getPositionTitle() == null && emp.getPosition() != null) {
                    pr.setPositionTitle(emp.getPosition().getPositionTitle());
                }
            });
        } else if (employeeRepository != null && username != null) {
            // Auto-detect employee by username
            employeeRepository.findByEmployeeIdAndDeletedFalse(username).ifPresent(emp -> {
                pr.setEmployee(emp);
                if (pr.getDepartment() == null && emp.getDepartment() != null) {
                    pr.setDepartment(emp.getDepartment());
                }
                if (pr.getPositionTitle() == null && emp.getPosition() != null) {
                    pr.setPositionTitle(emp.getPosition().getPositionTitle());
                }
            });
        }

        // Explicit Department if provided
        if (departmentId != null && departmentId > 0 && departmentRepository != null) {
            departmentRepository.findById(departmentId).ifPresent(pr::setDepartment);
        }

        if (positionTitle != null && !positionTitle.trim().isEmpty()) {
            pr.setPositionTitle(positionTitle);
        }

        // If store is still null, default to store in branch
        if (pr.getStore() == null) {
            Integer branchId = null;
            if (pr.getEmployee() != null && pr.getEmployee().getBranch() != null) {
                branchId = pr.getEmployee().getBranch().getId();
            } else {
                branchId = getUserBranchId(username);
            }
            if (branchId != null) {
                Optional<InvStore> branchStoreOpt = storeRepository.findByBranchId(branchId);
                if (branchStoreOpt.isPresent()) {
                    pr.setStore(branchStoreOpt.get());
                }
            }
            if (pr.getStore() == null) {
                Optional<InvStore> mainStoreOpt = storeRepository.findByIsMainStoreTrue();
                if (mainStoreOpt.isPresent()) {
                    pr.setStore(mainStoreOpt.get());
                } else {
                    List<InvStore> allStores = storeRepository.findByDeletedAndIsActiveOrderByStoreCodeAsc("active", true);
                    if (!allStores.isEmpty()) {
                        pr.setStore(allStores.get(0));
                    }
                }
            }
        }

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
    public InvPurchaseRequisition create(InvPurchaseRequisition pr, int storeId, List<InvPurchaseRequisitionLine> lines, String username) {
        return create(pr, storeId, null, null, null, lines, username);
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
        } else if (pr.getEmployee() != null && pr.getEmployee().getBranch() != null) {
            branchId = pr.getEmployee().getBranch().getId();
        } else {
            branchId = getUserBranchId(username);
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

    @Transactional
    public InvPurchaseRequisition update(long id, Integer storeId, Integer departmentId, Integer employeeId, String positionTitle, String remarks, List<InvPurchaseRequisitionLine> newLines, String username) {
        InvPurchaseRequisition pr = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PR not found"));

        // Only DRAFT or REJECTED can be edited
        if (pr.getStatus() != PRStatus.DRAFT && pr.getStatus() != PRStatus.REJECTED) {
            throw new IllegalStateException("Only DRAFT or REJECTED requisitions can be edited");
        }

        // If REJECTED → reset to DRAFT for resubmission
        if (pr.getStatus() == PRStatus.REJECTED) {
            pr.setStatus(PRStatus.DRAFT);
            pr.setRejectedBy(null);
            pr.setRejectedDate(null);
            pr.setRejectionReason(null);
            pr.setApprovedByL1(null);
            pr.setApprovedDateL1(null);
            pr.setApprovedByL2(null);
            pr.setApprovedDateL2(null);
        }

        // Update store
        if (storeId != null && storeId > 0) {
            storeRepository.findById(storeId).ifPresent(pr::setStore);
        }
        if (departmentId != null && departmentId > 0 && departmentRepository != null) {
            departmentRepository.findById(departmentId).ifPresent(pr::setDepartment);
        }
        if (employeeId != null && employeeId > 0 && employeeRepository != null) {
            employeeRepository.findById(employeeId).ifPresent(pr::setEmployee);
        }
        if (positionTitle != null) {
            pr.setPositionTitle(positionTitle);
        }
        pr.setRemarks(remarks);

        // Replace lines
        pr.getLines().clear();
        BigDecimal total = BigDecimal.ZERO;
        int order = 1;
        for (InvPurchaseRequisitionLine line : newLines) {
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
    public InvPurchaseRequisition update(long id, int storeId, String remarks, List<InvPurchaseRequisitionLine> newLines, String username) {
        return update(id, storeId, null, null, null, remarks, newLines, username);
    }

    @Transactional
    public InvPurchaseRequisition cancel(long id, String username, String reason) {
        InvPurchaseRequisition pr = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("PR not found"));

        // Cannot cancel already converted or already cancelled
        if (pr.getStatus() == PRStatus.CONVERTED_TO_PO) {
            throw new IllegalStateException("Cannot cancel a requisition that has been converted to a Purchase Order");
        }
        if (pr.getStatus() == PRStatus.CANCELLED) {
            throw new IllegalStateException("Requisition is already cancelled");
        }

        pr.setStatus(PRStatus.CANCELLED);
        pr.setRejectedBy(username);
        pr.setRejectedDate(LocalDateTime.now());
        pr.setRejectionReason("CANCELLED: " + reason);
        pr = repository.save(pr);

        // Cancel workflow instance if present
        if (workflowService != null) {
            try {
                workflowService.getInstanceByDocument("PURCHASE_REQUISITION", id).ifPresent(wf -> {
                    if ("IN_PROGRESS".equals(wf.getStatus())) {
                        workflowService.reject(wf.getId(), username, "Cancelled: " + reason);
                    }
                });
            } catch (Exception ignored) {}
        }
        return repository.findById(id).orElse(pr);
    }

    private String generateNumber() {
        String prefix = "PR-";
        Long maxSeq = repository.findMaxSequence(prefix);
        long next = (maxSeq != null ? maxSeq : 0) + 1;
        return prefix + String.format("%05d", next);
    }
}
