package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import com.wbill.home.model.hrms.HrmsDepartment;
import com.wbill.home.model.hrms.HrmsEmployee;
import com.wbill.home.repository.hrms.HrmsDepartmentRepository;
import com.wbill.home.repository.hrms.HrmsEmployeeRepository;

@Service
public class WorkflowService {

    @Autowired private WfWorkflowTemplateRepository templateRepo;
    @Autowired private WfWorkflowStepRepository stepRepo;
    @Autowired private WfWorkflowInstanceRepository instanceRepo;
    @Autowired private WfWorkflowActionRepository actionRepo;
    @Autowired private UserAccountRoleRepository userAccountRoleRepo;
    @Autowired(required = false) private UserAccountRepository userAccountRepo;
    @Autowired(required = false) private HrmsEmployeeRepository employeeRepository;
    @Autowired(required = false) private HrmsDepartmentRepository departmentRepository;
    @Autowired(required = false) private InvPurchaseRequisitionRepository prRepository;
    @Autowired(required = false) private InvPurchaseOrderRepository poRepository;
    @Autowired(required = false) private InvStockTransferRepository transferRepository;
    @Autowired(required = false) private InvMaterialRequestRepository mrRepository;
    @Autowired(required = false) private InvDisposalRepository disposalRepository;
    @Lazy @Autowired(required = false) private InvMaterialRequestService mrService;
    @Lazy @Autowired(required = false) private InvDisposalService disposalService;

    // ─── Template Management ──────────────────────────────

    public List<WfWorkflowTemplate> getAllTemplates() {
        return templateRepo.findAll();
    }

    public List<WfWorkflowTemplate> getActiveTemplates() {
        return templateRepo.findByIsActiveTrue();
    }

    public Optional<WfWorkflowTemplate> getTemplateById(int id) {
        return templateRepo.findById(id);
    }

    public Optional<WfWorkflowTemplate> getTemplateByCode(String code) {
        return templateRepo.findByTemplateCode(code);
    }

    @Transactional
    public WfWorkflowTemplate saveTemplate(WfWorkflowTemplate template) {
        return templateRepo.save(template);
    }

    @Transactional
    public void deleteTemplate(int id) {
        templateRepo.deleteById(id);
    }

    // ─── Step Management ──────────────────────────────────

    public List<WfWorkflowStep> getStepsByTemplate(int templateId) {
        return stepRepo.findByTemplateIdOrderByStepOrderAsc(templateId);
    }

    @Transactional
    public WfWorkflowStep addStep(int templateId, WfWorkflowStep step) {
        WfWorkflowTemplate template = templateRepo.findById(templateId)
            .orElseThrow(() -> new IllegalArgumentException("Template not found"));
        step.setTemplate(template);
        return stepRepo.save(step);
    }

    @Transactional
    public WfWorkflowStep updateStep(int stepId, WfWorkflowStep updated) {
        WfWorkflowStep step = stepRepo.findById(stepId)
            .orElseThrow(() -> new IllegalArgumentException("Step not found"));
        step.setStepOrder(updated.getStepOrder());
        step.setStepName(updated.getStepName());
        step.setStepNameAm(updated.getStepNameAm());
        step.setApproverRoleCode(updated.getApproverRoleCode());
        step.setIsRequired(updated.getIsRequired());
        step.setMinAmount(updated.getMinAmount());
        step.setMaxAmount(updated.getMaxAmount());
        step.setAutoApproveBelow(updated.getAutoApproveBelow());
        step.setSlaHours(updated.getSlaHours());
        step.setCanReject(updated.getCanReject());
        return stepRepo.save(step);
    }

    @Transactional
    public void deleteStep(int stepId) {
        stepRepo.deleteById(stepId);
    }

    // ─── Workflow Engine Core ─────────────────────────────

    /**
     * Initiates a workflow for a document. Finds the active template for the document type,
     * creates an instance, and advances to the first applicable step.
     */
    @Transactional
    public WfWorkflowInstance initiateWorkflow(String documentType, long documentId,
                                                String documentNumber, BigDecimal totalAmount,
                                                Integer branchId, String initiatedBy) {
        // Find the active template for this document type
        List<WfWorkflowTemplate> templates = templateRepo.findByDocumentTypeAndIsActiveTrue(documentType);
        if (templates.isEmpty()) {
            if ("PURCHASE_REQUISITION".equalsIgnoreCase(documentType)) {
                // Auto-seed standard 2-step PR template
                WfWorkflowTemplate defaultTemplate = new WfWorkflowTemplate();
                defaultTemplate.setTemplateCode("PR_STANDARD");
                defaultTemplate.setTemplateName("Standard Purchase Requisition Approval");
                defaultTemplate.setDocumentType("PURCHASE_REQUISITION");
                defaultTemplate.setDescription("Standard 2-tier approval workflow: Dept. Manager -> Finance Manager");
                defaultTemplate.setIsActive(true);
                defaultTemplate.setCreatedBy("system");
                defaultTemplate = templateRepo.save(defaultTemplate);

                WfWorkflowStep step1 = new WfWorkflowStep();
                step1.setTemplate(defaultTemplate);
                step1.setStepOrder(1);
                step1.setStepName("Dept. Manager Approval");
                step1.setStepNameAm("የክፍል ኃላፊ ማረጋገጫ");
                step1.setApproverRoleCode("DEPT_MANAGER");
                step1.setIsRequired(true);
                step1.setSlaHours(48);
                step1.setCanReject(true);
                stepRepo.save(step1);

                WfWorkflowStep step2 = new WfWorkflowStep();
                step2.setTemplate(defaultTemplate);
                step2.setStepOrder(2);
                step2.setStepName("Finance Manager Approval");
                step2.setStepNameAm("የፋይናንስ ኃላፊ ማረጋገጫ");
                step2.setApproverRoleCode("M_FINANCE_HEAD");
                step2.setIsRequired(true);
                step2.setSlaHours(48);
                step2.setCanReject(true);
                stepRepo.save(step2);

                templates = List.of(defaultTemplate);
            } else if ("PURCHASE_ORDER".equalsIgnoreCase(documentType)) {
                // Auto-seed standard 2-step PO template
                WfWorkflowTemplate defaultTemplate = new WfWorkflowTemplate();
                defaultTemplate.setTemplateCode("PO_STANDARD");
                defaultTemplate.setTemplateName("Standard Purchase Order Approval");
                defaultTemplate.setDocumentType("PURCHASE_ORDER");
                defaultTemplate.setDescription("Standard 2-tier PO approval workflow: Finance Review -> General Manager Approval");
                defaultTemplate.setIsActive(true);
                defaultTemplate.setCreatedBy("system");
                defaultTemplate = templateRepo.save(defaultTemplate);

                WfWorkflowStep step1 = new WfWorkflowStep();
                step1.setTemplate(defaultTemplate);
                step1.setStepOrder(1);
                step1.setStepName("Finance Manager Review");
                step1.setStepNameAm("የፋይናንስ ኃላፊ ግምገማ");
                step1.setApproverRoleCode("M_FINANCE_HEAD");
                step1.setIsRequired(true);
                step1.setSlaHours(48);
                step1.setCanReject(true);
                stepRepo.save(step1);

                WfWorkflowStep step2 = new WfWorkflowStep();
                step2.setTemplate(defaultTemplate);
                step2.setStepOrder(2);
                step2.setStepName("General Manager Approval");
                step2.setStepNameAm("የዋና ሥራ አስኪያጅ ማጽደቂያ");
                step2.setApproverRoleCode("BILLZGJ_ADMIN");
                step2.setIsRequired(true);
                step2.setSlaHours(48);
                step2.setCanReject(true);
                stepRepo.save(step2);

                templates = List.of(defaultTemplate);
            } else if ("STOCK_TRANSFER".equalsIgnoreCase(documentType)) {
                // Auto-seed standard 2-step Stock Transfer template
                WfWorkflowTemplate defaultTemplate = new WfWorkflowTemplate();
                defaultTemplate.setTemplateCode("ST_STANDARD");
                defaultTemplate.setTemplateName("Standard Stock Transfer Approval");
                defaultTemplate.setDocumentType("STOCK_TRANSFER");
                defaultTemplate.setDescription("Standard 2-tier approval: Store Manager Approval -> Operations Review");
                defaultTemplate.setIsActive(true);
                defaultTemplate.setCreatedBy("system");
                defaultTemplate = templateRepo.save(defaultTemplate);

                WfWorkflowStep step1 = new WfWorkflowStep();
                step1.setTemplate(defaultTemplate);
                step1.setStepOrder(1);
                step1.setStepName("Source Store Manager Approval");
                step1.setStepNameAm("የመነሻ መጋዘን ኃላፊ ማረጋገጫ");
                step1.setApproverRoleCode("M_STORE_MANAGER");
                step1.setIsRequired(true);
                step1.setSlaHours(24);
                step1.setCanReject(true);
                stepRepo.save(step1);

                WfWorkflowStep step2 = new WfWorkflowStep();
                step2.setTemplate(defaultTemplate);
                step2.setStepOrder(2);
                step2.setStepName("Inventory Operations Review");
                step2.setStepNameAm("የዕቃ ክምችት ኦፕሬሽን ግምገማ");
                step2.setApproverRoleCode("M_TECHNICAL_MANAGER");
                step2.setIsRequired(true);
                step2.setSlaHours(24);
                step2.setCanReject(true);
                stepRepo.save(step2);

                templates = List.of(defaultTemplate);
            } else if ("MATERIAL_REQUEST".equalsIgnoreCase(documentType)) {
                WfWorkflowTemplate defaultTemplate = new WfWorkflowTemplate();
                defaultTemplate.setTemplateCode("MR_STANDARD");
                defaultTemplate.setTemplateName("Standard Material Request Approval");
                defaultTemplate.setDocumentType("MATERIAL_REQUEST");
                defaultTemplate.setDescription("Standard 2-tier approval: Store Manager -> Technical Manager");
                defaultTemplate.setIsActive(true);
                defaultTemplate.setCreatedBy("system");
                defaultTemplate = templateRepo.save(defaultTemplate);

                WfWorkflowStep step1 = new WfWorkflowStep();
                step1.setTemplate(defaultTemplate);
                step1.setStepOrder(1);
                step1.setStepName("Store Manager Approval");
                step1.setStepNameAm("የመጋዘን ኃላፊ ማረጋገጫ");
                step1.setApproverRoleCode("M_BRANCH_STORE");
                step1.setIsRequired(true);
                step1.setSlaHours(24);
                step1.setCanReject(true);
                stepRepo.save(step1);

                WfWorkflowStep step2 = new WfWorkflowStep();
                step2.setTemplate(defaultTemplate);
                step2.setStepOrder(2);
                step2.setStepName("Technical Manager Approval");
                step2.setStepNameAm("የቴክኒካል ኃላፊ ማረጋገጫ");
                step2.setApproverRoleCode("M_TECHNICAL_MANAGER");
                step2.setIsRequired(true);
                step2.setSlaHours(48);
                step2.setCanReject(true);
                stepRepo.save(step2);

                templates = List.of(defaultTemplate);
            } else if ("DISPOSAL".equalsIgnoreCase(documentType)) {
                WfWorkflowTemplate defaultTemplate = new WfWorkflowTemplate();
                defaultTemplate.setTemplateCode("DSP_STANDARD");
                defaultTemplate.setTemplateName("Standard Disposal Approval");
                defaultTemplate.setDocumentType("DISPOSAL");
                defaultTemplate.setDescription("Standard 3-tier disposal approval: Store Manager -> Finance -> General Manager");
                defaultTemplate.setIsActive(true);
                defaultTemplate.setCreatedBy("system");
                defaultTemplate = templateRepo.save(defaultTemplate);

                WfWorkflowStep step1 = new WfWorkflowStep();
                step1.setTemplate(defaultTemplate);
                step1.setStepOrder(1);
                step1.setStepName("Store Manager Review");
                step1.setStepNameAm("የመጋዘን ኃላፊ ግምገማ");
                step1.setApproverRoleCode("M_BRANCH_STORE");
                step1.setIsRequired(true);
                step1.setSlaHours(24);
                step1.setCanReject(true);
                stepRepo.save(step1);

                WfWorkflowStep step2 = new WfWorkflowStep();
                step2.setTemplate(defaultTemplate);
                step2.setStepOrder(2);
                step2.setStepName("Finance Head Approval");
                step2.setStepNameAm("የፋይናንስ ኃላፊ ማረጋገጫ");
                step2.setApproverRoleCode("M_FINANCE_HEAD");
                step2.setIsRequired(true);
                step2.setSlaHours(48);
                step2.setCanReject(true);
                stepRepo.save(step2);

                WfWorkflowStep step3 = new WfWorkflowStep();
                step3.setTemplate(defaultTemplate);
                step3.setStepOrder(3);
                step3.setStepName("General Manager Approval");
                step3.setStepNameAm("የዋና ሥራ አስኪያጅ ማጽደቂያ");
                step3.setApproverRoleCode("BILLZGJ_ADMIN");
                step3.setIsRequired(true);
                step3.setSlaHours(72);
                step3.setCanReject(true);
                stepRepo.save(step3);

                templates = List.of(defaultTemplate);
            } else {
                throw new IllegalArgumentException("No active workflow template found for document type: " + documentType);
            }
        }
        WfWorkflowTemplate template = templates.get(0);

        // Check if instance already exists
        Optional<WfWorkflowInstance> existing = instanceRepo.findByDocumentTypeAndDocumentId(documentType, documentId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Workflow already exists for this document");
        }

        // Create instance
        WfWorkflowInstance instance = new WfWorkflowInstance();
        instance.setTemplate(template);
        instance.setDocumentType(documentType);
        instance.setDocumentId(documentId);
        instance.setDocumentNumber(documentNumber);
        instance.setTotalAmount(totalAmount);
        instance.setBranchId(branchId);
        instance.setInitiatedBy(initiatedBy);
        instance.setStatus("IN_PROGRESS");

        // Find first applicable step
        List<WfWorkflowStep> steps = stepRepo.findByTemplateIdOrderByStepOrderAsc(template.getId());
        WfWorkflowStep firstStep = findNextApplicableStep(steps, null, totalAmount);
        if (firstStep == null) {
            // No steps needed — auto-complete
            instance.setStatus("COMPLETED");
            instance.setCompletedAt(LocalDateTime.now());
            syncDocumentStatus(instance, "COMPLETED", initiatedBy);
        } else {
            instance.setCurrentStep(firstStep);
        }

        return instanceRepo.save(instance);
    }

    /**
     * Approves the current step. Validates user has the required role,
     * records the action, and advances to the next step.
     */
    @Transactional
    public WfWorkflowInstance approve(long instanceId, String username, String comments) {
        WfWorkflowInstance instance = instanceRepo.findById(instanceId)
            .orElseThrow(() -> new IllegalArgumentException("Workflow instance not found"));

        if (!"IN_PROGRESS".equals(instance.getStatus())) {
            throw new IllegalArgumentException("Workflow is not in progress (current: " + instance.getStatus() + ")");
        }

        WfWorkflowStep currentStep = instance.getCurrentStep();
        if (currentStep == null) {
            throw new IllegalArgumentException("No current step to approve");
        }

        // Validate user has the required role or is department manager
        validateUserRole(username, currentStep.getApproverRoleCode(), instance);

        // Record the action
        WfWorkflowAction action = new WfWorkflowAction();
        action.setInstance(instance);
        action.setStep(currentStep);
        action.setAction("APPROVED");
        action.setActedBy(username);
        action.setComments(comments);
        actionRepo.save(action);

        // Find next applicable step
        List<WfWorkflowStep> allSteps = stepRepo.findByTemplateIdOrderByStepOrderAsc(
            instance.getTemplate().getId());
        WfWorkflowStep nextStep = findNextApplicableStep(allSteps, currentStep, instance.getTotalAmount());

        if (nextStep == null) {
            // All steps complete
            instance.setCurrentStep(null);
            instance.setStatus("COMPLETED");
            instance.setCompletedAt(LocalDateTime.now());
            syncDocumentStatus(instance, "COMPLETED", username);
        } else {
            instance.setCurrentStep(nextStep);
            syncDocumentStatus(instance, "IN_PROGRESS", username);

            // Auto-approve if amount is below threshold
            if (nextStep.getAutoApproveBelow() != null && instance.getTotalAmount() != null
                && instance.getTotalAmount().compareTo(nextStep.getAutoApproveBelow()) < 0) {
                WfWorkflowAction autoAction = new WfWorkflowAction();
                autoAction.setInstance(instance);
                autoAction.setStep(nextStep);
                autoAction.setAction("SKIPPED");
                autoAction.setActedBy("system");
                autoAction.setComments("Auto-approved: amount below threshold (" + nextStep.getAutoApproveBelow() + " ETB)");
                actionRepo.save(autoAction);

                // Recurse to find next step after this
                WfWorkflowStep afterAuto = findNextApplicableStep(allSteps, nextStep, instance.getTotalAmount());
                if (afterAuto == null) {
                    instance.setCurrentStep(null);
                    instance.setStatus("COMPLETED");
                    instance.setCompletedAt(LocalDateTime.now());
                    syncDocumentStatus(instance, "COMPLETED", username);
                } else {
                    instance.setCurrentStep(afterAuto);
                }
            }
        }

        return instanceRepo.save(instance);
    }

    /**
     * Rejects the workflow at the current step.
     */
    @Transactional
    public WfWorkflowInstance reject(long instanceId, String username, String reason) {
        WfWorkflowInstance instance = instanceRepo.findById(instanceId)
            .orElseThrow(() -> new IllegalArgumentException("Workflow instance not found"));

        if (!"IN_PROGRESS".equals(instance.getStatus())) {
            throw new IllegalArgumentException("Workflow is not in progress");
        }

        WfWorkflowStep currentStep = instance.getCurrentStep();
        if (currentStep == null || !currentStep.getCanReject()) {
            throw new IllegalArgumentException("Current step does not allow rejection");
        }

        // Validate user has the required role or is department manager
        validateUserRole(username, currentStep.getApproverRoleCode(), instance);

        // Record the rejection
        WfWorkflowAction action = new WfWorkflowAction();
        action.setInstance(instance);
        action.setStep(currentStep);
        action.setAction("REJECTED");
        action.setActedBy(username);
        action.setComments(reason);
        actionRepo.save(action);

        instance.setStatus("REJECTED");
        instance.setCompletedAt(LocalDateTime.now());
        syncDocumentStatus(instance, "REJECTED", username, reason);
        return instanceRepo.save(instance);
    }

    // ─── Query Methods ────────────────────────────────────

    public Optional<WfWorkflowInstance> getInstanceById(long id) {
        return instanceRepo.findById(id);
    }

    public Optional<WfWorkflowInstance> getInstanceByDocument(String documentType, long documentId) {
        return instanceRepo.findByDocumentTypeAndDocumentId(documentType, documentId);
    }

    public List<WfWorkflowInstance> getPendingForRole(String roleCode) {
        return instanceRepo.findPendingByRole(roleCode);
    }

    public long getPendingCountForUser(String username) {
        List<String> roles = userAccountRoleRepo.findRoleCodesByUsername(username);
        if (roles.isEmpty()) return 0;
        return instanceRepo.countPendingByRoles(roles);
    }

    public List<WfWorkflowAction> getActionHistory(long instanceId) {
        return actionRepo.findByInstanceIdOrderByActedAtAsc(instanceId);
    }

    // ─── Internal Helpers ─────────────────────────────────

    /**
     * Finds the next applicable step after the given current step, considering amount thresholds.
     */
    private WfWorkflowStep findNextApplicableStep(List<WfWorkflowStep> allSteps,
                                                    WfWorkflowStep afterStep,
                                                    BigDecimal amount) {
        boolean foundCurrent = (afterStep == null); // if null, start from beginning
        for (WfWorkflowStep step : allSteps) {
            if (!foundCurrent) {
                if (step.getId() == afterStep.getId()) {
                    foundCurrent = true;
                }
                continue;
            }
            // Check if this step is applicable based on amount thresholds
            if (isStepApplicable(step, amount)) {
                return step;
            }
        }
        return null; // no more steps
    }

    /**
     * Checks if a step is applicable based on amount thresholds and required flag.
     */
    private boolean isStepApplicable(WfWorkflowStep step, BigDecimal amount) {
        if (!step.getIsRequired() && amount != null) {
            // Optional step — only required if amount is within [minAmount, maxAmount]
            if (step.getMinAmount() != null && amount.compareTo(step.getMinAmount()) < 0) {
                return false; // amount too low for this step
            }
            if (step.getMaxAmount() != null && amount.compareTo(step.getMaxAmount()) > 0) {
                return false; // amount too high for this step
            }
        }
        if (!step.getIsRequired() && amount == null) {
            return false; // optional step with no amount info — skip
        }
        return true;
    }

    /**
     * Validates that the user has the required role (via primary role or additional roles),
     * or is the designated Department Manager if the step is dynamic DEPT_MANAGER.
     */
    private void validateUserRole(String username, String requiredRoleCode, WfWorkflowInstance instance) {
        if ("system".equalsIgnoreCase(username)) {
            return;
        }

        List<String> extraRoles = userAccountRoleRepo != null ? userAccountRoleRepo.findRoleCodesByUsername(username) : Collections.emptyList();
        java.util.Set<String> allRoles = new java.util.HashSet<>(extraRoles);
        if (userAccountRepo != null) {
            userAccountRepo.findByUserNameAndStatusAndDeleted(username, "active", "active")
                .ifPresent(ua -> {
                    if (ua.getUserRole() != null && ua.getUserRole().getRoleCode() != null) {
                        allRoles.add(ua.getUserRole().getRoleCode());
                    }
                });
        }

        // Admin bypass
        boolean isAdmin = allRoles.stream().anyMatch(r ->
            r.equalsIgnoreCase("billzgjt") ||
            r.equalsIgnoreCase("systemadmin") ||
            r.equalsIgnoreCase("admin") ||
            r.equalsIgnoreCase("ROLE_ADMIN")
        );
        if (isAdmin) {
            return; // authorized
        }

        // Dynamic Department Manager step check
        boolean isDeptStep = "DEPT_MANAGER".equalsIgnoreCase(requiredRoleCode) ||
                             "DEPARTMENT_MANAGER".equalsIgnoreCase(requiredRoleCode) ||
                             (instance != null && instance.getCurrentStep() != null &&
                              instance.getCurrentStep().getStepName() != null &&
                              instance.getCurrentStep().getStepName().toLowerCase().contains("dept"));

        if (isDeptStep && instance != null && "PURCHASE_REQUISITION".equalsIgnoreCase(instance.getDocumentType())) {
            if (prRepository != null) {
                Optional<InvPurchaseRequisition> prOpt = prRepository.findById(instance.getDocumentId());
                if (prOpt.isPresent()) {
                    InvPurchaseRequisition pr = prOpt.get();
                    if (pr.getDepartment() != null) {
                        if (isUserDepartmentManager(username, pr.getDepartment())) {
                            return; // authorized as department manager!
                        }
                        throw new IllegalArgumentException("Only the Department Manager for '" +
                            pr.getDepartment().getDepartmentName() + "' can approve or reject this requisition.");
                    }
                }
            }
        }

        // Standard role check (case-insensitive)
        boolean hasRole = allRoles.stream().anyMatch(r -> r.equalsIgnoreCase(requiredRoleCode));
        if (hasRole) {
            return; // authorized
        }

        throw new IllegalArgumentException("User '" + username + "' does not have role '" + requiredRoleCode + "' required for this step");
    }

    private boolean isUserDepartmentManager(String username, HrmsDepartment department) {
        if (department == null) return false;

        // 1. Direct manager check: department.managerEmployeeId
        if (department.getManagerEmployeeId() != null && employeeRepository != null) {
            Optional<HrmsEmployee> mgrOpt = employeeRepository.findById(department.getManagerEmployeeId());
            if (mgrOpt.isPresent()) {
                HrmsEmployee mgr = mgrOpt.get();
                if (username.equalsIgnoreCase(mgr.getEmployeeId())) return true;
                if (userAccountRepo != null) {
                    Optional<UserAccount> uaOpt = userAccountRepo.findByUserName(username);
                    if (uaOpt.isPresent()) {
                        UserAccount ua = uaOpt.get();
                        // Direct foreign key link from User Account to HRMS Employee
                        if (ua.getEmployee() != null && ua.getEmployee().getId() == mgr.getId()) {
                            return true;
                        }
                        String fullName = ((ua.getFirstName() != null ? ua.getFirstName() : "") + " " +
                                          (ua.getLastName() != null ? ua.getLastName() : "")).trim();
                        if (!fullName.isEmpty() && mgr.getFullName() != null &&
                            mgr.getFullName().trim().equalsIgnoreCase(fullName)) {
                            return true;
                        }
                    }
                }
            }
        }

        // 2. Check if the user is an employee in this department with a manager position
        if (employeeRepository != null) {
            Optional<HrmsEmployee> userEmpOpt = Optional.empty();
            if (userAccountRepo != null) {
                Optional<UserAccount> uaOpt = userAccountRepo.findByUserName(username);
                if (uaOpt.isPresent() && uaOpt.get().getEmployee() != null) {
                    userEmpOpt = Optional.of(uaOpt.get().getEmployee());
                }
            }
            if (!userEmpOpt.isPresent()) {
                userEmpOpt = employeeRepository.findByEmployeeIdAndDeletedFalse(username);
            }
            if (!userEmpOpt.isPresent() && userAccountRepo != null) {
                Optional<UserAccount> uaOpt = userAccountRepo.findByUserName(username);
                if (uaOpt.isPresent()) {
                    UserAccount ua = uaOpt.get();
                    String fullName = ((ua.getFirstName() != null ? ua.getFirstName() : "") + " " +
                                      (ua.getLastName() != null ? ua.getLastName() : "")).trim();
                    if (!fullName.isEmpty()) {
                        List<HrmsEmployee> matchingEmps = employeeRepository.searchEmployees(fullName);
                        if (!matchingEmps.isEmpty()) {
                            userEmpOpt = Optional.of(matchingEmps.get(0));
                        }
                    }
                }
            }

            if (userEmpOpt.isPresent()) {
                HrmsEmployee emp = userEmpOpt.get();
                if (emp.getDepartment() != null && emp.getDepartment().getId() == department.getId()) {
                    if (emp.getPosition() != null && emp.getPosition().getPositionTitle() != null) {
                        String title = emp.getPosition().getPositionTitle().toLowerCase();
                        if (title.contains("manager") || title.contains("head") || title.contains("director") ||
                            title.contains("chief") || title.contains("ኃላፊ") || title.contains("መሪ") || title.contains("አስተባባሪ")) {
                            return true;
                        }
                    }
                }
            }
        }

        // 3. Fallback: Role codes like M_TECHNICAL_MANAGER, M_BRANCH_MANAGER, DEPT_MANAGER
        if (userAccountRoleRepo != null) {
            List<String> roles = userAccountRoleRepo.findRoleCodesByUsername(username);
            if (roles.stream().anyMatch(r -> {
                String lr = r.toLowerCase();
                return lr.contains("m_technical_manager") || lr.contains("m_branch_manager") || lr.contains("dept_manager");
            })) {
                return true;
            }
        }

        return false;
    }

    /**
     * Synchronizes status to underlying business documents upon workflow progression.
     */
    private void syncDocumentStatus(WfWorkflowInstance instance, String status, String username, String... extra) {
        if (prRepository != null && "PURCHASE_REQUISITION".equalsIgnoreCase(instance.getDocumentType())) {
            prRepository.findById(instance.getDocumentId()).ifPresent(pr -> {
                if ("COMPLETED".equals(status)) {
                    pr.setStatus(InvPurchaseRequisition.PRStatus.APPROVED_L2);
                    pr.setApprovedByL2(username);
                    pr.setApprovedDateL2(LocalDateTime.now());
                    // Set approved quantities to requested if not set
                    if (pr.getLines() != null) {
                        for (InvPurchaseRequisitionLine line : pr.getLines()) {
                            if (line.getApprovedQuantity() == null) {
                                line.setApprovedQuantity(line.getRequestedQuantity());
                            }
                        }
                    }
                } else if ("IN_PROGRESS".equals(status)) {
                    pr.setStatus(InvPurchaseRequisition.PRStatus.APPROVED_L1);
                    pr.setApprovedByL1(username);
                    pr.setApprovedDateL1(LocalDateTime.now());
                } else if ("REJECTED".equals(status)) {
                    pr.setStatus(InvPurchaseRequisition.PRStatus.REJECTED);
                    pr.setRejectedBy(username);
                    pr.setRejectedDate(LocalDateTime.now());
                    if (extra != null && extra.length > 0) {
                        pr.setRejectionReason(extra[0]);
                    }
                }
                prRepository.save(pr);
            });
        }
        if (poRepository != null && "PURCHASE_ORDER".equalsIgnoreCase(instance.getDocumentType())) {
            poRepository.findById(instance.getDocumentId()).ifPresent(po -> {
                if ("COMPLETED".equals(status)) {
                    po.setStatus(InvPurchaseOrder.POStatus.APPROVED_L2);
                    po.setApprovedByL2(username);
                    po.setApprovedDateL2(LocalDateTime.now());
                } else if ("IN_PROGRESS".equals(status)) {
                    po.setStatus(InvPurchaseOrder.POStatus.APPROVED_L1);
                    po.setApprovedByL1(username);
                    po.setApprovedDateL1(LocalDateTime.now());
                } else if ("REJECTED".equals(status)) {
                    po.setStatus(InvPurchaseOrder.POStatus.CANCELLED);
                    if (extra != null && extra.length > 0) {
                        po.setRemarks((po.getRemarks() != null ? po.getRemarks() + " | " : "") + "Rejected: " + extra[0]);
                    }
                }
                poRepository.save(po);
            });
        }
        if (transferRepository != null && "STOCK_TRANSFER".equalsIgnoreCase(instance.getDocumentType())) {
            transferRepository.findById(instance.getDocumentId()).ifPresent(t -> {
                if ("COMPLETED".equals(status)) {
                    t.setStatus(InvStockTransfer.TransferStatus.APPROVED);
                    t.setApprovedBy(username);
                    t.setApprovedDate(LocalDateTime.now());
                } else if ("REJECTED".equals(status)) {
                    t.setStatus(InvStockTransfer.TransferStatus.CANCELLED);
                    if (extra != null && extra.length > 0) {
                        t.setRemarks((t.getRemarks() != null ? t.getRemarks() + " | " : "") + "Rejected: " + extra[0]);
                    }
                }
                transferRepository.save(t);
            });
        }
        if (mrRepository != null && mrService != null && "MATERIAL_REQUEST".equalsIgnoreCase(instance.getDocumentType())) {
            if ("COMPLETED".equals(status)) {
                mrService.onWorkflowApproved(instance.getDocumentId(), username);
            } else if ("REJECTED".equals(status)) {
                mrService.onWorkflowRejected(instance.getDocumentId());
            }
        }
        if (disposalRepository != null && disposalService != null && "DISPOSAL".equalsIgnoreCase(instance.getDocumentType())) {
            if ("COMPLETED".equals(status)) {
                disposalService.onWorkflowApproved(instance.getDocumentId());
            } else if ("REJECTED".equals(status)) {
                disposalService.onWorkflowRejected(instance.getDocumentId());
            }
        }
    }
}

