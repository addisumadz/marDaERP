package com.wbill.home.service;

import com.wbill.home.dto.CustomNewLineDTOs.*;
import com.wbill.home.model.*;
import com.wbill.home.repository.*;
import com.wbill.home.util.EthiopianCalendarUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.wbill.home.model.InvStockTransaction.TransactionType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomNewLineConnectionService {

    @Autowired private CustomNewLineConnectionRequestRepository requestRepo;
    @Autowired private CustomNewLineItemRepository itemRepo;
    @Autowired private CustomNewLineAdditionalFeeRepository feeRepo;
    @Autowired private CustomNewLineActivityLogRepository logRepo;
    @Autowired private CustomCommonMaterialRepository commonMaterialRepo;
    @Autowired private CustomAdditionalFeeTypeRepository feeTypeRepo;

    @Autowired private BillingCustomerInfoRepository customerRepo;
    @Autowired(required = false) private BillingCustomerInfoMeterRepository customerMeterRepo;
    @Autowired private UserAccountRepository userAccountRepo;
    @Autowired(required = false) private UserAccountRoleRepository userAccountRoleRepo;
    @Autowired private BranchRepository branchRepo;
    @Autowired private AddressStreetsRepository kebeleRepo;
    @Autowired private AddressKetenaRepository ketenaRepo;
    @Autowired private BillingCustomerTypeRepository customerTypeRepo;
    @Autowired private BillingMeterSizeRepository meterSizeRepo;
    @Autowired private BillingTariffRepository tariffRepo;
    @Autowired(required = false) private InvStoreRepository storeRepo;
    @Autowired(required = false) private InvIssueVoucherRepository voucherRepo;
    @Autowired(required = false) private InvItemRepository invItemRepo;
    @Autowired(required = false) private InvItemStoreStockRepository stockRepo;
    @Autowired(required = false) private InvStockTransactionRepository transactionRepo;
    @Autowired(required = false) private InvStoreUserRepository invStoreUserRepo;
    @Autowired(required = false) private InvStockService invStockService;
    @Autowired(required = false) private InvFinanceIntegrationService invFinanceService;

    private String cleanString(String val) {
        if (val == null) return null;
        String t = val.trim();
        return t.isEmpty() ? null : t;
    }

    // ─── Security & Branch Validation Helpers ──────────────────────────────
    public boolean isUserAdmin(UserAccount user, String username) {
        if (user == null && username != null) {
            user = userAccountRepo.findByUserName(username).orElse(null);
        }
        if (user == null) return false;
        if (user.getUserRole() != null) {
            String code = user.getUserRole().getRoleCode() != null ? user.getUserRole().getRoleCode().toLowerCase() : "";
            String name = user.getUserRole().getRoleName() != null ? user.getUserRole().getRoleName().toLowerCase() : "";
            if (code.contains("admin") || code.contains("billzgjt") || code.contains("gm") ||
                name.contains("admin") || name.contains("አስተዳዳሪ") || name.contains("ሥራ አስኪያጅ")) {
                return true;
            }
        }
        if (userAccountRoleRepo != null && username != null) {
            List<String> codes = userAccountRoleRepo.findRoleCodesByUsername(username);
            if (codes != null && codes.stream().anyMatch(c -> c.toLowerCase().contains("admin") || c.toLowerCase().contains("gm"))) {
                return true;
            }
        }
        return false;
    }

    public void validateBranchAccess(CustomNewLineConnectionRequest req, String username) {
        if (username == null) return;
        Optional<UserAccount> userOpt = userAccountRepo.findByUserName(username);
        if (userOpt.isEmpty()) return;
        UserAccount user = userOpt.get();
        if (isUserAdmin(user, username)) return;

        if (user.getBranch() != null && req.getBranch() != null) {
            if (user.getBranch().getId() != req.getBranch().getId()) {
                String branchDesc = req.getBranch().getBranchDescription() != null ? req.getBranch().getBranchDescription() : "";
                throw new IllegalArgumentException("የቅርንጫፍ ወሰን ጥሰት! ይህ ማመልከቻ የሌላ ቅርንጫፍ ነው (" + branchDesc + ")። እርምጃ መውሰድ አይችሉም።");
            }
        }
    }

    public void validateStatusTransition(CustomNewLineConnectionRequest req, String expectedStatus, String actionName) {
        if (!expectedStatus.equalsIgnoreCase(req.getStatus())) {
            throw new IllegalStateException(String.format(
                "ልክ ያልሆነ የስራ ሂደት ቅደም ተከተል! '%s' ለማከናወን የጥያቄው ደረጃ '%s' መሆን አለበት፤ አሁን ያለው ደረጃ '%s' ነው",
                actionName, expectedStatus, req.getStatus()
            ));
        }
    }

    public void validatePlumberBranch(UserAccount plumber, Branch expectedBranch) {
        if (expectedBranch == null || plumber == null) return;
        if (plumber.getBranch() != null && plumber.getBranch().getId() != expectedBranch.getId()) {
            String pBranchName = plumber.getBranch().getBranchDescription() != null ? plumber.getBranch().getBranchDescription() : "";
            String eBranchName = expectedBranch.getBranchDescription() != null ? expectedBranch.getBranchDescription() : "";
            throw new IllegalArgumentException(String.format(
                "የተመረጠው ባለሙያ '%s %s' የተመደበበት ቅርንጫፍ (%s) ከማመልከቻው ቅርንጫፍ (%s) ጋር አይዛመድም!",
                plumber.getFirstName(), plumber.getLastName(), pBranchName, eBranchName
            ));
        }
    }

    public void validateStoreBranch(InvStore store, Branch expectedBranch) {
        if (expectedBranch == null || store == null) return;
        if (store.getBranch() != null && store.getBranch().getId() != expectedBranch.getId()) {
            throw new IllegalArgumentException(String.format(
                "የተመረጠው መደብር '%s' ከማመልከቻው ቅርንጫፍ ጋር አይዛመድም!",
                store.getStoreName()
            ));
        }
    }

    // ─── 1. Application Creation (Customer Service) ─────────────────────────
    public CustomNewLineConnectionRequest createApplication(CreateApplicationDTO dto, String username) {
        int currentYear = LocalDate.now().getYear();
        String prefix = "NLC-" + currentYear + "-";
        long nextSeq = requestRepo.countByApplicationNumberPrefix(prefix) + 1;
        String applicationNumber = String.format("NLC-%d-%05d", currentYear, nextSeq);

        // 1. Skip inserting into billing_customer_info for now during intake
        // Customer details are tracked in CustomNewLineConnectionRequest until meter is assigned

        // 2. Create CustomNewLineConnectionRequest
        CustomNewLineConnectionRequest req = new CustomNewLineConnectionRequest();
        req.setApplicationNumber(applicationNumber);
        req.setCustomer(null);
        String applicant = cleanString(dto.getApplicantName());
        String custName = cleanString(dto.getCustomerFullName());
        req.setApplicantName(applicant != null ? applicant : custName);
        req.setCustomerFullName(custName);
        req.setCustomerFullNameEng(cleanString(dto.getCustomerFullNameEng()));
        req.setPhoneNumber(cleanString(dto.getPhoneNumber()));
        req.setNationalIdNumber(cleanString(dto.getNationalIdNumber()));
        req.setHouseNumber(cleanString(dto.getHouseNumber()));
        req.setAddressDescription(cleanString(dto.getAddressDescription()));
        req.setStatus("PENDING_SURVEY_ASSIGNMENT");
        req.setCreatedBy(username != null ? username : "system");

        if (dto.getKebeleId() != null) kebeleRepo.findById(dto.getKebeleId()).ifPresent(req::setKebele);
        if (dto.getKetenaId() != null) ketenaRepo.findById(dto.getKetenaId()).ifPresent(req::setKetena);
        if (dto.getCustomerTypeId() != null) customerTypeRepo.findById(dto.getCustomerTypeId()).ifPresent(req::setCustomerType);

        // Strict branch assignment: non-admins are strictly bound to their assigned branch
        Branch assignedBranch = null;
        if (username != null) {
            Optional<UserAccount> uOpt = userAccountRepo.findByUserName(username);
            if (uOpt.isPresent()) {
                UserAccount u = uOpt.get();
                if (!isUserAdmin(u, username) && u.getBranch() != null) {
                    assignedBranch = u.getBranch();
                }
            }
        }
        if (assignedBranch != null) {
            req.setBranch(assignedBranch);
        } else if (dto.getBranchId() != null) {
            branchRepo.findById(dto.getBranchId()).ifPresent(req::setBranch);
        }

        if (req.getBranch() == null) {
            throw new IllegalArgumentException("ቅርንጫፍ (Branch) መምረጥ ግዴታ ነው!");
        }

        CustomNewLineConnectionRequest saved = requestRepo.save(req);

        // Log activity
        logAction(saved, "APPLICATION_CREATED", null, "PENDING_SURVEY_ASSIGNMENT", username, "CUSTOMER_SERVICE",
                  "New line connection application registered. Applicant: " + req.getApplicantName());

        return saved;
    }

    // ─── 2. Query Operations ────────────────────────────────────────────────
    public Integer resolveEffectiveBranchId(Integer branchId, String username) {
        if (username == null) {
            return branchId;
        }
        Optional<UserAccount> userOpt = userAccountRepo.findByUserName(username);
        if (userOpt.isPresent()) {
            UserAccount user = userOpt.get();
            boolean isAdmin = isUserAdmin(user, username);

            // Non-admin users are strictly scoped to their assigned branch at the database query level
            if (!isAdmin && user.getBranch() != null) {
                return user.getBranch().getId();
            }
        }
        return branchId;
    }

    @Transactional(readOnly = true)
    public Page<CustomNewLineConnectionRequest> getApplications(String status, Integer branchId, String search, Pageable pageable) {
        return getApplications(status, branchId, search, null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<CustomNewLineConnectionRequest> getApplications(String status, Integer branchId, String search, String username, Pageable pageable) {
        Integer effectiveBranch = resolveEffectiveBranchId(branchId, username);
        String st = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;
        String sc = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return requestRepo.findFiltered(st, effectiveBranch, sc, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<CustomNewLineConnectionRequest> getApplicationById(Long id) {
        return requestRepo.findById(id);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDepartmentStats() {
        return getDepartmentStats(null, null);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDepartmentStats(Integer branchId) {
        return getDepartmentStats(branchId, null);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDepartmentStats(Integer branchId, String username) {
        Integer effectiveBranch = resolveEffectiveBranchId(branchId, username);
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("pendingSurveyAssignment", requestRepo.countByStatusAndBranch("PENDING_SURVEY_ASSIGNMENT", effectiveBranch));
        stats.put("surveyInProgress", requestRepo.countByStatusAndBranch("SURVEY_IN_PROGRESS", effectiveBranch));
        stats.put("pendingPaymentApproval", requestRepo.countByStatusAndBranch("PENDING_PAYMENT_APPROVAL", effectiveBranch));
        stats.put("pendingStoreCollection", requestRepo.countByStatusAndBranch("PENDING_STORE_COLLECTION", effectiveBranch));
        stats.put("materialsCollected", requestRepo.countByStatusAndBranch("MATERIALS_COLLECTED", effectiveBranch));
        stats.put("installationInProgress", requestRepo.countByStatusAndBranch("INSTALLATION_IN_PROGRESS", effectiveBranch));
        stats.put("installationCompleted", requestRepo.countByStatusAndBranch("INSTALLATION_COMPLETED", effectiveBranch));
        stats.put("finalActivationCompleted", requestRepo.countByStatusAndBranch("FINAL_ACTIVATION_COMPLETED", effectiveBranch));
        stats.put("rejectedUnfeasible", requestRepo.countByStatusAndBranch("SURVEY_REJECTED_UNFEASIBLE", effectiveBranch));
        stats.put("applicationCancelled", requestRepo.countByStatusAndBranch("APPLICATION_CANCELLED", effectiveBranch));
        stats.put("returnedForRevision", requestRepo.countByStatusAndBranch("RETURNED_FOR_REVISION", effectiveBranch));
        return stats;
    }

    // ─── 3. Assign Survey Plumber (Technical Department) ────────────────────
    public CustomNewLineConnectionRequest assignSurveyPlumber(Long requestId, AssignPlumberDTO dto, String username) {
        CustomNewLineConnectionRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        validateBranchAccess(req, username);
        if (!"PENDING_SURVEY_ASSIGNMENT".equalsIgnoreCase(req.getStatus()) && !"RETURNED_FOR_REVISION".equalsIgnoreCase(req.getStatus())) {
            validateStatusTransition(req, "PENDING_SURVEY_ASSIGNMENT", "የዳሰሳ ጥናት ባለሙያ መመደብ");
        }

        UserAccount plumber = userAccountRepo.findById(dto.getPlumberId())
            .orElseThrow(() -> new IllegalArgumentException("Plumber not found: " + dto.getPlumberId()));

        validatePlumberBranch(plumber, req.getBranch());

        String oldStatus = req.getStatus();
        req.setSurveyPlumber(plumber);
        req.setSurveyAssignedDate(LocalDateTime.now());
        req.setStatus("SURVEY_IN_PROGRESS");
        CustomNewLineConnectionRequest updated = requestRepo.save(req);

        String plumberName = plumber.getFirstName() + " " + plumber.getLastName();
        logAction(updated, "SURVEY_PLUMBER_ASSIGNED", oldStatus, "SURVEY_IN_PROGRESS", username, "TECHNICAL",
                  "Plumber " + plumberName + " assigned for on-site survey. " + (dto.getNotes() != null ? dto.getNotes() : ""));

        return updated;
    }

    // ─── 4. Submit Survey Encoding (Technical Department) ───────────────────
    public CustomNewLineConnectionRequest submitSurvey(Long requestId, SubmitSurveyDTO dto, String username) {
        CustomNewLineConnectionRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        validateBranchAccess(req, username);
        if (!"SURVEY_IN_PROGRESS".equalsIgnoreCase(req.getStatus()) && !"RETURNED_FOR_REVISION".equalsIgnoreCase(req.getStatus())) {
            validateStatusTransition(req, "SURVEY_IN_PROGRESS", "የዳሰሳ ጥናት መመዝገብ");
        }

        // Clear existing line items and fees for fresh submission
        itemRepo.deleteByRequestId(requestId);
        feeRepo.deleteByRequestId(requestId);

        BigDecimal utilityMaterialsTotal = BigDecimal.ZERO;
        BigDecimal outsideMaterialsTotal = BigDecimal.ZERO;

        // Process line items
        if (dto.getItems() != null) {
            for (SurveyItemDTO itemDto : dto.getItems()) {
                CustomNewLineItem item = new CustomNewLineItem();
                item.setRequest(req);
                item.setItemName(itemDto.getItemName());
                item.setItemNameAm(itemDto.getItemNameAm());
                item.setUnitOfMeasure(itemDto.getUnitOfMeasure() != null ? itemDto.getUnitOfMeasure() : "በቁጥር");
                item.setSurveyedQuantity(itemDto.getSurveyedQuantity() != null ? itemDto.getSurveyedQuantity() : BigDecimal.ZERO);

                // Utility side
                BigDecimal uQty = itemDto.getUtilityQuantity() != null ? itemDto.getUtilityQuantity() : BigDecimal.ZERO;
                BigDecimal uPrice = itemDto.getUtilityUnitPrice() != null ? itemDto.getUtilityUnitPrice() : BigDecimal.ZERO;
                BigDecimal uTotal = uQty.multiply(uPrice).setScale(2, RoundingMode.HALF_UP);
                item.setUtilityQuantity(uQty);
                item.setUtilityUnitPrice(uPrice);
                item.setUtilityTotalPrice(uTotal);
                utilityMaterialsTotal = utilityMaterialsTotal.add(uTotal);

                // Outside side
                BigDecimal oQty = itemDto.getOutsideQuantity() != null ? itemDto.getOutsideQuantity() : BigDecimal.ZERO;
                BigDecimal oPrice = itemDto.getOutsideUnitPrice() != null ? itemDto.getOutsideUnitPrice() : BigDecimal.ZERO;
                BigDecimal oTotal = oQty.multiply(oPrice).setScale(2, RoundingMode.HALF_UP);
                item.setOutsideQuantity(oQty);
                item.setOutsideUnitPrice(oPrice);
                item.setOutsideTotalPrice(oTotal);
                outsideMaterialsTotal = outsideMaterialsTotal.add(oTotal);

                item.setRemarks(itemDto.getRemarks());

                if (itemDto.getCommonMaterialId() != null) {
                    commonMaterialRepo.findById(itemDto.getCommonMaterialId()).ifPresent(cm -> {
                        item.setCommonMaterial(cm);
                        if (item.getInvItem() == null && cm.getInvItem() != null) {
                            item.setInvItem(cm.getInvItem());
                        }
                    });
                }
                if (itemDto.getInvItemId() != null && invItemRepo != null) {
                    invItemRepo.findById(itemDto.getInvItemId()).ifPresent(item::setInvItem);
                }

                itemRepo.save(item);
            }
        }

        // Process additional fees
        BigDecimal additionalFeesTotal = BigDecimal.ZERO;
        if (dto.getFees() != null) {
            for (SurveyFeeDTO feeDto : dto.getFees()) {
                CustomNewLineAdditionalFee fee = new CustomNewLineAdditionalFee();
                fee.setRequest(req);
                fee.setFeeName(feeDto.getFeeName());
                fee.setFeeNameAm(feeDto.getFeeNameAm());
                fee.setUnitName(feeDto.getUnitName() != null ? feeDto.getUnitName() : "ብር");
                BigDecimal fQty = feeDto.getQuantity() != null ? feeDto.getQuantity() : BigDecimal.ONE;
                BigDecimal fPrice = feeDto.getUnitPrice() != null ? feeDto.getUnitPrice() : BigDecimal.ZERO;
                BigDecimal fTotal = fQty.multiply(fPrice).setScale(2, RoundingMode.HALF_UP);
                fee.setQuantity(fQty);
                fee.setUnitPrice(fPrice);
                fee.setTotalPrice(fTotal);
                fee.setRemarks(feeDto.getRemarks());

                if (feeDto.getFeeTypeId() != null) {
                    feeTypeRepo.findById(feeDto.getFeeTypeId()).ifPresent(fee::setFeeType);
                }

                additionalFeesTotal = additionalFeesTotal.add(fTotal);
                feeRepo.save(fee);
            }
        }

        // Apply Static Rates: 25% Transportation Charge on all materials, 55% Service Charge on (totalMaterials + transportCharge)
        BigDecimal totalMaterials = utilityMaterialsTotal.add(outsideMaterialsTotal);
        BigDecimal transportChargePercent = new BigDecimal("25.00");
        BigDecimal transportCharge = totalMaterials.multiply(new BigDecimal("0.25")).setScale(2, RoundingMode.HALF_UP);

        BigDecimal serviceChargePercent = new BigDecimal("55.00");
        BigDecimal serviceChargeBase = totalMaterials.add(transportCharge);
        BigDecimal serviceCharge = serviceChargeBase.multiply(new BigDecimal("0.55")).setScale(2, RoundingMode.HALF_UP);

        // Total Payable = Utility Materials + Service Charge + Transport Charge + Additional Fees
        BigDecimal totalPayable = utilityMaterialsTotal
            .add(serviceCharge)
            .add(transportCharge)
            .add(additionalFeesTotal)
            .setScale(2, RoundingMode.HALF_UP);

        String oldStatus = req.getStatus();
        req.setMaterialsUtilityTotal(utilityMaterialsTotal);
        req.setMaterialsOutsideTotal(outsideMaterialsTotal);
        req.setServiceChargePercent(serviceChargePercent);
        req.setServiceChargeAmount(serviceCharge);
        req.setTransportChargePercent(transportChargePercent);
        req.setTransportChargeAmount(transportCharge);
        req.setAdditionalFeesTotal(additionalFeesTotal);
        req.setTotalPayableAmount(totalPayable);
        req.setSurveyPlumberNotes(dto.getPlumberNotes());
        req.setStatus("PENDING_PAYMENT_APPROVAL");

        CustomNewLineConnectionRequest updated = requestRepo.save(req);

        logAction(updated, "SURVEY_SUBMITTED", oldStatus, "PENDING_PAYMENT_APPROVAL", username, "TECHNICAL",
                  String.format("Materials & fees encoded. Utility: ETB %.2f, Outside: ETB %.2f, 55%% Service: ETB %.2f, 25%% Transport: ETB %.2f, Fees: ETB %.2f, Total Payable: ETB %.2f",
                                utilityMaterialsTotal, outsideMaterialsTotal, serviceCharge, transportCharge, additionalFeesTotal, totalPayable));

        return updated;
    }

    // ─── 5. Payment Approval (Revenue Department) ───────────────────────────
    @Transactional
    public CustomNewLineConnectionRequest approvePayment(Long requestId, PaymentApprovalDTO dto, String username) {
        CustomNewLineConnectionRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        validateBranchAccess(req, username);
        validateStatusTransition(req, "PENDING_PAYMENT_APPROVAL", "ክፍያ ማጽደቅ");

        // If Revenue Officer updated material items or prices, recalculate totals
        if (dto.getUpdatedItems() != null && !dto.getUpdatedItems().isEmpty()) {
            itemRepo.deleteByRequestId(req.getId());
            BigDecimal utilityMaterialsTotal = BigDecimal.ZERO;
            BigDecimal outsideMaterialsTotal = BigDecimal.ZERO;

            for (SurveyItemDTO itemDto : dto.getUpdatedItems()) {
                CustomNewLineItem item = new CustomNewLineItem();
                item.setRequest(req);
                item.setItemName(itemDto.getItemName());
                item.setItemNameAm(itemDto.getItemNameAm());
                item.setUnitOfMeasure(itemDto.getUnitOfMeasure() != null ? itemDto.getUnitOfMeasure() : "በቁጥር");

                BigDecimal surveyedQty = itemDto.getSurveyedQuantity() != null ? itemDto.getSurveyedQuantity() : BigDecimal.ZERO;
                BigDecimal utilQty = itemDto.getUtilityQuantity() != null ? itemDto.getUtilityQuantity() : BigDecimal.ZERO;
                BigDecimal utilPrice = itemDto.getUtilityUnitPrice() != null ? itemDto.getUtilityUnitPrice() : BigDecimal.ZERO;
                BigDecimal utilTotal = utilQty.multiply(utilPrice).setScale(2, RoundingMode.HALF_UP);

                BigDecimal outQty = itemDto.getOutsideQuantity() != null ? itemDto.getOutsideQuantity() : BigDecimal.ZERO;
                BigDecimal outPrice = itemDto.getOutsideUnitPrice() != null ? itemDto.getOutsideUnitPrice() : BigDecimal.ZERO;
                BigDecimal outTotal = outQty.multiply(outPrice).setScale(2, RoundingMode.HALF_UP);

                item.setSurveyedQuantity(surveyedQty);
                item.setUtilityQuantity(utilQty);
                item.setUtilityUnitPrice(utilPrice);
                item.setUtilityTotalPrice(utilTotal);
                item.setOutsideQuantity(outQty);
                item.setOutsideUnitPrice(outPrice);
                item.setOutsideTotalPrice(outTotal);
                item.setRemarks(itemDto.getRemarks());

                if (itemDto.getCommonMaterialId() != null) {
                    commonMaterialRepo.findById(itemDto.getCommonMaterialId()).ifPresent(cm -> {
                        item.setCommonMaterial(cm);
                        if (item.getInvItem() == null && cm.getInvItem() != null) {
                            item.setInvItem(cm.getInvItem());
                        }
                    });
                }
                if (itemDto.getInvItemId() != null && invItemRepo != null) {
                    invItemRepo.findById(itemDto.getInvItemId()).ifPresent(item::setInvItem);
                }

                itemRepo.save(item);
                utilityMaterialsTotal = utilityMaterialsTotal.add(utilTotal);
                outsideMaterialsTotal = outsideMaterialsTotal.add(outTotal);
            }

            BigDecimal totalMaterials = utilityMaterialsTotal.add(outsideMaterialsTotal);
            BigDecimal transportCharge = totalMaterials.multiply(new BigDecimal("0.25")).setScale(2, RoundingMode.HALF_UP);
            BigDecimal serviceChargeBase = totalMaterials.add(transportCharge);
            BigDecimal serviceCharge = serviceChargeBase.multiply(new BigDecimal("0.55")).setScale(2, RoundingMode.HALF_UP);

            BigDecimal additionalFeesTotal = req.getAdditionalFeesTotal() != null ? req.getAdditionalFeesTotal() : BigDecimal.ZERO;
            if (dto.getUpdatedFees() != null && !dto.getUpdatedFees().isEmpty()) {
                feeRepo.deleteByRequestId(req.getId());
                additionalFeesTotal = BigDecimal.ZERO;
                for (SurveyFeeDTO feeDto : dto.getUpdatedFees()) {
                    CustomNewLineAdditionalFee fee = new CustomNewLineAdditionalFee();
                    fee.setRequest(req);
                    fee.setFeeName(feeDto.getFeeName());
                    fee.setFeeNameAm(feeDto.getFeeNameAm());
                    fee.setUnitName(feeDto.getUnitName() != null ? feeDto.getUnitName() : "ብር");
                    BigDecimal fQty = feeDto.getQuantity() != null ? feeDto.getQuantity() : BigDecimal.ONE;
                    BigDecimal fPrice = feeDto.getUnitPrice() != null ? feeDto.getUnitPrice() : BigDecimal.ZERO;
                    BigDecimal fTotal = fQty.multiply(fPrice).setScale(2, RoundingMode.HALF_UP);
                    fee.setQuantity(fQty);
                    fee.setUnitPrice(fPrice);
                    fee.setTotalPrice(fTotal);
                    fee.setRemarks(feeDto.getRemarks());
                    if (feeDto.getFeeTypeId() != null) {
                        feeTypeRepo.findById(feeDto.getFeeTypeId()).ifPresent(fee::setFeeType);
                    }
                    feeRepo.save(fee);
                    additionalFeesTotal = additionalFeesTotal.add(fTotal);
                }
            }

            BigDecimal totalPayable = utilityMaterialsTotal
                .add(serviceCharge)
                .add(transportCharge)
                .add(additionalFeesTotal)
                .setScale(2, RoundingMode.HALF_UP);

            req.setMaterialsUtilityTotal(utilityMaterialsTotal);
            req.setMaterialsOutsideTotal(outsideMaterialsTotal);
            req.setServiceChargeAmount(serviceCharge);
            req.setTransportChargeAmount(transportCharge);
            req.setAdditionalFeesTotal(additionalFeesTotal);
            req.setTotalPayableAmount(totalPayable);
        }

        String oldStatus = req.getStatus();
        req.setIsPaid(true);
        req.setPaymentReceiptNumber(dto.getReceiptNumber());
        req.setPaymentReferenceNumber(dto.getReferenceNumber());
        req.setPaymentApprovedBy(username != null ? username : "revenue");
        req.setPaymentApprovedDate(LocalDateTime.now());

        // If utility materials need to be collected from store, advance to PENDING_STORE_COLLECTION;
        // Otherwise advance directly to INSTALLATION_ASSIGNED
        if (req.getMaterialsUtilityTotal().compareTo(BigDecimal.ZERO) > 0) {
            req.setStatus("PENDING_STORE_COLLECTION");
        } else {
            req.setStatus("MATERIALS_COLLECTED");
        }

        CustomNewLineConnectionRequest updated = requestRepo.save(req);

        logAction(updated, "PAYMENT_APPROVED", oldStatus, req.getStatus(), username, "REVENUE",
                  "Payment approved by Revenue Officer. Receipt: " + dto.getReceiptNumber() + ", Ref: " + dto.getReferenceNumber() +
                  (dto.getUpdatedItems() != null ? " (prices/items reviewed & updated)" : ""));

        return updated;
    }

    // ─── 6. Store Material Dispatch (Inventory Department) ──────────────────
    @Transactional
    public CustomNewLineConnectionRequest dispatchMaterials(Long requestId, StoreDispatchDTO dto, String username) {
        CustomNewLineConnectionRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        validateBranchAccess(req, username);
        validateStatusTransition(req, "PENDING_STORE_COLLECTION", "የስቶር እቃዎች ማስረከብ");

        InvStore targetStore = null;
        if (storeRepo != null) {
            if (dto.getStoreId() != null) {
                targetStore = storeRepo.findById(dto.getStoreId().intValue()).orElse(null);
            } else if (username != null && invStoreUserRepo != null) {
                List<InvStoreUser> userStores = invStoreUserRepo.findActiveStoresByUsername(username);
                if (userStores != null && !userStores.isEmpty()) {
                    targetStore = userStores.get(0).getStore();
                }
            }
            if (targetStore == null && req.getBranch() != null) {
                targetStore = storeRepo.findByBranchId(req.getBranch().getId()).orElse(null);
            }
            if (targetStore == null) {
                targetStore = storeRepo.findByIsMainStoreTrue().orElse(null);
            }
        }

        if (targetStore != null) {
            validateStoreBranch(targetStore, req.getBranch());
        }

        List<CustomNewLineItem> utilityItems = req.getItems() != null
            ? req.getItems().stream()
                .filter(it -> it.getUtilityQuantity() != null && it.getUtilityQuantity().compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toList())
            : Collections.emptyList();

        InvIssueVoucher savedVoucher = null;

        // Stock deduction & voucher lines creation
        if (targetStore != null && !utilityItems.isEmpty() && voucherRepo != null && stockRepo != null) {
            InvIssueVoucher voucher = new InvIssueVoucher();
            voucher.setVoucherNumber("ISV-NLC-" + req.getApplicationNumber());
            voucher.setStore(targetStore);
            voucher.setIssueType(InvIssueVoucher.IssueType.SALE);
            voucher.setIssuedTo(req.getCustomerFullName());
            voucher.setDepartment("Customer Service / New Line");
            voucher.setIssuedDate(LocalDate.now());
            voucher.setStatus(InvIssueVoucher.IssueStatus.ISSUED);
            voucher.setApprovedBy(username);
            voucher.setApprovedDate(LocalDateTime.now());
            voucher.setIssuedBy(username);
            voucher.setRemarks(dto.getRemarks() != null && !dto.getRemarks().isBlank() 
                ? dto.getRemarks() 
                : "Materials issued for New Water Line Connection: " + req.getApplicationNumber());

            BigDecimal totalVoucherCost = BigDecimal.ZERO;
            int lineOrder = 1;

            for (CustomNewLineItem it : utilityItems) {
                InvItem invItem = it.getInvItem();
                if (invItem == null && it.getCommonMaterial() != null) {
                    invItem = it.getCommonMaterial().getInvItem();
                }
                if (invItem == null && invItemRepo != null) {
                    var searchRes = invItemRepo.searchItems(it.getItemName(), PageRequest.of(0, 1));
                    if (searchRes.hasContent()) {
                        invItem = searchRes.getContent().get(0);
                    }
                }

                if (invItem != null) {
                    BigDecimal qty = it.getUtilityQuantity();
                    final InvItem fItem = invItem;
                    final InvStore fStore = targetStore;

                    InvItemStoreStock stock = stockRepo.findByItemIdAndStoreId(fItem.getId(), fStore.getId())
                        .orElseGet(() -> {
                            InvItemStoreStock newSt = new InvItemStoreStock();
                            newSt.setItem(fItem);
                            newSt.setStore(fStore);
                            newSt.setWeightedAvgCost(fItem.getDefaultUnitCost() != null ? fItem.getDefaultUnitCost() : BigDecimal.ZERO);
                            newSt.setQuantityOnHand(BigDecimal.ZERO);
                            return stockRepo.save(newSt);
                        });

                    // Enforce stock availability
                    if (stock.getAvailableQuantity().compareTo(qty) < 0) {
                        throw new IllegalStateException(String.format(
                            "በስቶር '%s' ውስጥ ለ '%s' በቂ እቃ የለም! በስቶር ያለው: %s, የተጠየቀው: %s",
                            fStore.getStoreName(), fItem.getItemName(),
                            stock.getAvailableQuantity().stripTrailingZeros().toPlainString(),
                            qty.stripTrailingZeros().toPlainString()
                        ));
                    }

                    BigDecimal balanceBefore = stock.getQuantityOnHand();
                    BigDecimal unitCost = stock.getWeightedAvgCost() != null && stock.getWeightedAvgCost().compareTo(BigDecimal.ZERO) > 0
                        ? stock.getWeightedAvgCost()
                        : (it.getUtilityUnitPrice() != null ? it.getUtilityUnitPrice() : BigDecimal.ZERO);
                    BigDecimal lineTotalCost = qty.multiply(unitCost).setScale(2, RoundingMode.HALF_UP);

                    // Reduce stock in store
                    stock.setQuantityOnHand(stock.getQuantityOnHand().subtract(qty));
                    stockRepo.save(stock);

                    // Create transaction audit record
                    if (transactionRepo != null) {
                        InvStockTransaction txn = new InvStockTransaction();
                        txn.setTransactionNumber(invStockService != null 
                            ? invStockService.generateTransactionNumber() 
                            : "TXN-NLC-" + System.currentTimeMillis() + "-" + lineOrder);
                        txn.setItem(fItem);
                        txn.setStore(fStore);
                        txn.setTransactionType(TransactionType.ISSUE_SALE);
                        txn.setQuantity(qty);
                        txn.setUnitCost(unitCost);
                        txn.setTotalCost(lineTotalCost);
                        txn.setBalanceBefore(balanceBefore);
                        txn.setBalanceAfter(stock.getQuantityOnHand());
                        txn.setReferenceType("NEW_LINE_CONNECTION");
                        txn.setReferenceId(req.getId());
                        txn.setTransactionDate(LocalDate.now());
                        txn.setCreatedBy(username != null ? username : "system");
                        transactionRepo.save(txn);
                    }

                    // Create voucher line
                    InvIssueVoucherLine line = new InvIssueVoucherLine();
                    line.setItem(fItem);
                    line.setRequestedQuantity(qty);
                    line.setApprovedQuantity(qty);
                    line.setIssuedQuantity(qty);
                    line.setUnitCost(unitCost);
                    line.setTotalCost(lineTotalCost);
                    line.setLineOrder(lineOrder++);
                    voucher.addLine(line);

                    totalVoucherCost = totalVoucherCost.add(lineTotalCost);
                }
            }

            voucher.setTotalAmount(totalVoucherCost.compareTo(BigDecimal.ZERO) > 0 
                ? totalVoucherCost 
                : (req.getMaterialsUtilityTotal() != null ? req.getMaterialsUtilityTotal() : BigDecimal.ZERO));

            savedVoucher = voucherRepo.save(voucher);
            req.setInvIssueVoucher(savedVoucher);

            // Post Finance Journal Entry
            if (invFinanceService != null) {
                try {
                    FncJournalEntry journalEntry = invFinanceService.createIssueJournalEntry(savedVoucher, username);
                    if (journalEntry != null) {
                        savedVoucher.setJournalEntry(journalEntry);
                        voucherRepo.save(savedVoucher);
                    }
                } catch (Exception fe) {
                    System.err.println("Notice: Finance journal entry creation deferred: " + fe.getMessage());
                }
            }
        }

        String oldStatus = req.getStatus();
        req.setMaterialsCollectedDate(LocalDateTime.now());
        req.setStorekeeperUsername(username != null ? username : "storekeeper");
        req.setStatus("MATERIALS_COLLECTED");

        CustomNewLineConnectionRequest updated = requestRepo.save(req);

        String voucherRef = savedVoucher != null ? " (Voucher: " + savedVoucher.getVoucherNumber() + 
            (savedVoucher.getJournalEntry() != null ? ", Journal: " + savedVoucher.getJournalEntry().getEntryNumber() : "") + ")" : "";

        logAction(updated, "MATERIALS_DISPATCHED", oldStatus, "MATERIALS_COLLECTED", username, "INVENTORY",
                  "Utility materials issued from store '" + (targetStore != null ? targetStore.getStoreName() : "N/A") +
                  "' and dispatched to customer by storekeeper: " + username + voucherRef);

        return updated;
    }

    // ─── 7. Assign Installation Plumber (Technical Department) ──────────────
    public CustomNewLineConnectionRequest assignInstallationPlumber(Long requestId, AssignPlumberDTO dto, String username) {
        CustomNewLineConnectionRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        validateBranchAccess(req, username);
        validateStatusTransition(req, "MATERIALS_COLLECTED", "የዝርጋታ ባለሙያ መመደብ");

        UserAccount plumber = userAccountRepo.findById(dto.getPlumberId())
            .orElseThrow(() -> new IllegalArgumentException("Plumber not found: " + dto.getPlumberId()));

        validatePlumberBranch(plumber, req.getBranch());

        String oldStatus = req.getStatus();
        req.setInstallationPlumber(plumber);
        req.setInstallationAssignedDate(LocalDateTime.now());
        req.setStatus("INSTALLATION_IN_PROGRESS");

        CustomNewLineConnectionRequest updated = requestRepo.save(req);

        String plumberName = plumber.getFirstName() + " " + plumber.getLastName();
        logAction(updated, "INSTALLATION_PLUMBER_ASSIGNED", oldStatus, "INSTALLATION_IN_PROGRESS", username, "TECHNICAL",
                  "Plumber " + plumberName + " assigned for physical water line installation. " + (dto.getNotes() != null ? dto.getNotes() : ""));

        return updated;
    }

    // ─── 8. Complete Installation (Technical Department) ────────────────────
    public CustomNewLineConnectionRequest completeInstallation(Long requestId, InstallationCompletionDTO dto, String username) {
        CustomNewLineConnectionRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        validateBranchAccess(req, username);
        validateStatusTransition(req, "INSTALLATION_IN_PROGRESS", "የዝርጋታ ማጠናቀቂያ ማረጋገጥ");

        String oldStatus = req.getStatus();
        req.setInstallationCompletedDate(LocalDateTime.now());
        req.setInstallationNotes(dto.getNotes());
        req.setInstallationApprovedBy(username != null ? username : "technical");
        req.setStatus("INSTALLATION_COMPLETED");

        CustomNewLineConnectionRequest updated = requestRepo.save(req);

        logAction(updated, "INSTALLATION_COMPLETED", oldStatus, "INSTALLATION_COMPLETED", username, "TECHNICAL",
                  "Physical line connection completed and approved by Technical Officer. Ready for customer activation.");

        return updated;
    }

    // ─── 9. Final Customer Activation (Customer Service) ────────────────────
    public CustomNewLineConnectionRequest finalizeActivation(Long requestId, FinalActivationDTO dto, String username) {
        CustomNewLineConnectionRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        validateBranchAccess(req, username);
        validateStatusTransition(req, "INSTALLATION_COMPLETED", "የደንበኛ ማግበሪያ ማጠናቀቅ");

        String oldStatus = req.getStatus();
        String meterNum = cleanString(dto.getMeterNumber());
        if (meterNum != null && customerRepo.existsByMeterNumber(meterNum)) {
            throw new IllegalArgumentException("የቆጣሪ ቁጥር '" + meterNum + "' በሌላ ነባር ደንበኛ ላይ አስቀድሞ ተመዝግቧል! እባክዎ ትክክለኛውን የቆጣሪ ቁጥር ያረጋግጡ።");
        }

        String locCoord = cleanString(dto.getLocationCoordination());
        String engName = cleanString(dto.getCustomerFullNameEng());
        if (engName == null) {
            engName = cleanString(req.getCustomerFullNameEng());
        } else {
            req.setCustomerFullNameEng(engName);
        }

        req.setMeterNumber(meterNum);
        req.setMeterSizeId(dto.getMeterSizeId());
        req.setInitialReading(dto.getInitialReading() != null ? dto.getInitialReading() : 0.0);
        req.setLocationCoordination(locCoord);
        req.setActivatedBy(username != null ? username : "customer_service");
        req.setActivatedDate(LocalDateTime.now());
        req.setStatus("FINAL_ACTIVATION_COMPLETED");

        if (dto.getAssignedReaderId() != null) {
            userAccountRepo.findById(dto.getAssignedReaderId()).ifPresent(req::setAssignedReader);
        }

        // Finalize or create Customer record in BillingCustomerInfo
        BillingCustomerInfo customer = req.getCustomer();
        if (customer == null) {
            customer = new BillingCustomerInfo();
            customer.setFullName(cleanString(req.getCustomerFullName()));
            customer.setFullNameEng(engName);
            customer.setPhoneNumber(cleanString(req.getPhoneNumber()));
            customer.setHouseNumber(cleanString(req.getHouseNumber()));
            customer.setNationalIdNumber(cleanString(req.getNationalIdNumber()));
            customer.setAddressDescription(cleanString(req.getAddressDescription()));
            customer.setAddressStreet(req.getKebele());
            customer.setAddressKetena(req.getKetena());
            customer.setBranch(req.getBranch());
            customer.setBillingCustomerType(req.getCustomerType());

            // Generate unique account number: kebele id prefix + sequential digits
            String kebelePrefix = req.getKebele() != null ? String.valueOf(req.getKebele().getId()) : "1";
            long count = customerRepo.count() + 1;
            String accNum = kebelePrefix + String.format("%05d", count % 100000);
            while (customerRepo.existsByAccountNumber(accNum)) {
                count++;
                accNum = kebelePrefix + String.format("%05d", count % 100000);
            }
            customer.setAccountNumber(accNum);
        } else {
            if (customer.getFullNameEng() == null && engName != null) {
                customer.setFullNameEng(engName);
            }
        }

        customer.setMeterNumber(meterNum);
        customer.setInitialReading(dto.getInitialReading() != null ? dto.getInitialReading() : 0.0);
        customer.setLocationCoordination(locCoord);
        customer.setStatus("active");
        customer.setIsInitialized(true);
        customer.setRegisteredDate(new Date());

        int[] ethYm = EthiopianCalendarUtil.getEthiopianYearMonthForBilling(LocalDate.now());
        customer.setRegisteredYear(ethYm[0]);
        customer.setRegisteredMonth(ethYm[1]);

        if (dto.getAssignedReaderId() != null) {
            userAccountRepo.findById(dto.getAssignedReaderId()).ifPresent(customer::setUserAccount);
        }
        if (dto.getMeterSizeId() != null) {
            meterSizeRepo.findById(dto.getMeterSizeId()).ifPresent(customer::setBillingMeterSize);
        }

        BillingCustomerInfo savedCustomer = customerRepo.save(customer);
        req.setCustomer(savedCustomer);

        // Record initial meter in billing_customer_info_meter
        if (customerMeterRepo != null) {
            try {
                BillingCustomerInfoMeter meter = new BillingCustomerInfoMeter();
                meter.setBillingCustomerInfo(savedCustomer);
                meter.setMeterNumber(dto.getMeterNumber());
                meter.setActiveMeter(true);
                meter.setInitialReading(dto.getInitialReading() != null ? dto.getInitialReading().intValue() : 0);
                meter.setMaxReference(99999);
                meter.setRegisteredDate(new Date());
                meter.setDeleted("active");
                if (dto.getMeterSizeId() != null) {
                    meterSizeRepo.findById(dto.getMeterSizeId()).ifPresent(meter::setBillingMeterSize);
                }
                if (dto.getAssignedReaderId() != null) {
                    userAccountRepo.findById(dto.getAssignedReaderId()).ifPresent(meter::setUserAccount);
                }
                customerMeterRepo.save(meter);
            } catch (Exception ex) {
                System.err.println("Notice: Customer meter record creation skipped: " + ex.getMessage());
            }
        }

        CustomNewLineConnectionRequest updated = requestRepo.save(req);

        logAction(updated, "CUSTOMER_ACTIVATED", oldStatus, "FINAL_ACTIVATION_COMPLETED", username, "CUSTOMER_SERVICE",
                  String.format("Customer fully activated into billing system. Account: %s, Meter: %s, Initial Reading: %.1f, Coordinates: %s",
                                savedCustomer.getAccountNumber(), dto.getMeterNumber(), dto.getInitialReading(), dto.getLocationCoordination()));

        return updated;
    }

    // ─── 10. Reference Catalogs ─────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<CustomCommonMaterial> getAllCommonMaterials() {
        return commonMaterialRepo.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    public CustomCommonMaterial saveCommonMaterial(CustomCommonMaterial material) {
        return commonMaterialRepo.save(material);
    }

    @Transactional(readOnly = true)
    public List<CustomAdditionalFeeType> getAllFeeTypes() {
        return feeTypeRepo.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailablePlumbers(Integer branchId) {
        return userAccountRepo.findAll().stream()
            .filter(u -> "active".equalsIgnoreCase(u.getDeleted()) && "active".equalsIgnoreCase(u.getStatus()))
            .filter(u -> {
                // Strict check: only users with CUSTOM_PLUMBER role can be assigned for field work
                if (u.getUserRole() != null && "CUSTOM_PLUMBER".equalsIgnoreCase(u.getUserRole().getRoleCode().trim())) {
                    return true;
                }
                if (userAccountRoleRepo != null) {
                    List<String> codes = userAccountRoleRepo.findRoleCodesByUsername(u.getUserName());
                    if (codes != null && codes.stream().anyMatch(c -> "CUSTOM_PLUMBER".equalsIgnoreCase(c.trim()))) {
                        return true;
                    }
                }
                return false;
            })
            .filter(u -> {
                if (branchId == null) return true;
                return u.getBranch() != null && u.getBranch().getId() == branchId.intValue();
            })
            .map(u -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", u.getId());
                m.put("userName", u.getUserName());
                String fn = ((u.getFirstName() != null ? u.getFirstName() : "") + " " + (u.getLastName() != null ? u.getLastName() : "")).trim();
                m.put("fullName", fn.isEmpty() ? u.getUserName() : fn);
                m.put("phoneNumber", u.getUserName());
                m.put("roleName", u.getUserRole() != null ? u.getUserRole().getRoleName() : "Plumber");
                return m;
            })
            .collect(Collectors.toList());
    }

    public List<CustomNewLineItem> getApplicationItems(Long requestId) {
        return itemRepo.findByRequestIdOrderByIdAsc(requestId);
    }

    public List<CustomNewLineAdditionalFee> getApplicationFees(Long requestId) {
        return feeRepo.findByRequestIdOrderByIdAsc(requestId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBranchCatalogStock(Integer branchId) {
        return getBranchCatalogStock(branchId, null);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBranchCatalogStock(Integer branchId, String username) {
        Map<String, Object> result = new LinkedHashMap<>();
        InvStore store = null;
        if (storeRepo != null) {
            // Priority 1: Customer application's branch store
            if (branchId != null) {
                store = storeRepo.findByBranchId(branchId).orElse(null);
            }
            // Priority 2: User's explicitly assigned store from inv_store_user
            if (store == null && username != null && invStoreUserRepo != null) {
                List<InvStoreUser> userStores = invStoreUserRepo.findActiveStoresByUsername(username);
                if (userStores != null && !userStores.isEmpty()) {
                    store = userStores.get(0).getStore();
                }
            }
            // Priority 3: Fallback to non-main active store or first available active store
            if (store == null) {
                List<InvStore> nonMain = storeRepo.findByDeletedAndIsActiveOrderByStoreCodeAsc("No", true);
                store = nonMain.stream().filter(s -> !s.getIsMainStore()).findFirst().orElse(nonMain.isEmpty() ? null : nonMain.get(0));
            }
        }

        Map<Long, InvItemStoreStock> stockByItemId = new HashMap<>();
        if (store != null && stockRepo != null) {
            List<InvItemStoreStock> stocks = stockRepo.findByStoreId(store.getId());
            if (stocks != null) {
                for (InvItemStoreStock s : stocks) {
                    if (s.getItem() != null) {
                        stockByItemId.put(s.getItem().getId(), s);
                    }
                }
            }
        }

        List<InvItem> allInvItems = (invItemRepo != null) ? invItemRepo.findAll() : Collections.emptyList();
        List<CustomCommonMaterial> materials = commonMaterialRepo.findByIsActiveTrueOrderByDisplayOrderAsc();

        List<Map<String, Object>> catalogList = new ArrayList<>();
        for (CustomCommonMaterial mat : materials) {
            Map<String, Object> itemMap = new LinkedHashMap<>();
            itemMap.put("commonMaterialId", mat.getId());
            itemMap.put("materialCode", mat.getMaterialCode());
            itemMap.put("materialName", mat.getMaterialName());
            itemMap.put("materialNameAm", mat.getMaterialNameAm());
            itemMap.put("unitOfMeasure", mat.getUnitOfMeasure() != null ? mat.getUnitOfMeasure() : "በቁጥር");

            InvItem matchedInvItem = null;
            if (mat.getInvItem() != null) {
                matchedInvItem = mat.getInvItem();
            } else {
                for (InvItem inv : allInvItems) {
                    String invName = inv.getItemName() != null ? inv.getItemName().toLowerCase().trim() : "";
                    String matName = mat.getMaterialName() != null ? mat.getMaterialName().toLowerCase().trim() : "";
                    String invAm = inv.getItemNameAm() != null ? inv.getItemNameAm().toLowerCase().trim() : "";
                    String matAm = mat.getMaterialNameAm() != null ? mat.getMaterialNameAm().toLowerCase().trim() : "";

                    if ((!invName.isEmpty() && invName.equalsIgnoreCase(matName)) ||
                        (!invAm.isEmpty() && invAm.equalsIgnoreCase(matAm)) ||
                        (!invName.isEmpty() && !matName.isEmpty() && invName.contains("hdp") && matName.contains("hdp")) ||
                        (!invName.isEmpty() && !matName.isEmpty() && invName.equals("meter") && matName.contains("meter"))) {
                        matchedInvItem = inv;
                        break;
                    }
                }
            }

            itemMap.put("invItemId", matchedInvItem != null ? matchedInvItem.getId() : null);

            BigDecimal availableStock = BigDecimal.ZERO;
            BigDecimal unitPrice = mat.getDefaultUnitPrice() != null ? mat.getDefaultUnitPrice() : BigDecimal.ZERO;

            if (matchedInvItem != null && stockByItemId.containsKey(matchedInvItem.getId())) {
                InvItemStoreStock s = stockByItemId.get(matchedInvItem.getId());
                BigDecimal qoh = s.getQuantityOnHand() != null ? s.getQuantityOnHand() : BigDecimal.ZERO;
                BigDecimal qr = s.getQuantityReserved() != null ? s.getQuantityReserved() : BigDecimal.ZERO;
                availableStock = qoh.subtract(qr).max(BigDecimal.ZERO);

                if (s.getWeightedAvgCost() != null && s.getWeightedAvgCost().compareTo(BigDecimal.ZERO) > 0) {
                    unitPrice = s.getWeightedAvgCost();
                } else if (matchedInvItem.getDefaultUnitCost() != null && matchedInvItem.getDefaultUnitCost().compareTo(BigDecimal.ZERO) > 0) {
                    unitPrice = matchedInvItem.getDefaultUnitCost();
                }
            }

            itemMap.put("availableStock", availableStock.setScale(2, RoundingMode.HALF_UP));
            itemMap.put("unitPrice", unitPrice.setScale(2, RoundingMode.HALF_UP));
            itemMap.put("hasStock", availableStock.compareTo(BigDecimal.ZERO) > 0);

            catalogList.add(itemMap);
        }

        result.put("branchId", branchId);
        result.put("storeId", store != null ? store.getId() : null);
        result.put("storeName", store != null ? store.getStoreName() : "N/A");
        result.put("storeCode", store != null ? store.getStoreCode() : "N/A");
        result.put("items", catalogList);

        return result;
    }

    // ─── 11. Supervisory & Management Operations ────────────────────────────
    public CustomNewLineConnectionRequest reassignPlumber(Long requestId, ReassignPlumberDTO dto, String username) {
        CustomNewLineConnectionRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        validateBranchAccess(req, username);

        UserAccount newPlumber = userAccountRepo.findById(dto.getPlumberId())
            .orElseThrow(() -> new IllegalArgumentException("Plumber not found: " + dto.getPlumberId()));

        validatePlumberBranch(newPlumber, req.getBranch());

        String mode = dto.getMode() != null ? dto.getMode().toLowerCase() : "survey";
        String oldPlumberName = "ያልተመደበ";
        String actionName;

        if ("installation".equals(mode)) {
            if (!"INSTALLATION_IN_PROGRESS".equalsIgnoreCase(req.getStatus()) && !"MATERIALS_COLLECTED".equalsIgnoreCase(req.getStatus())) {
                throw new IllegalStateException("የዝርጋታ ባለሙያ ለመቀየር የጥያቄው ደረጃ ዝርጋታ ላይ ወይም እቃ የተወሰደ መሆን አለበት");
            }
            if (req.getInstallationPlumber() != null) {
                oldPlumberName = req.getInstallationPlumber().getFirstName() + " " + req.getInstallationPlumber().getLastName();
            }
            req.setInstallationPlumber(newPlumber);
            req.setInstallationAssignedDate(LocalDateTime.now());
            req.setStatus("INSTALLATION_IN_PROGRESS");
            actionName = "INSTALLATION_PLUMBER_REASSIGNED";
        } else {
            if (!"SURVEY_IN_PROGRESS".equalsIgnoreCase(req.getStatus()) && !"PENDING_SURVEY_ASSIGNMENT".equalsIgnoreCase(req.getStatus()) && !"RETURNED_FOR_REVISION".equalsIgnoreCase(req.getStatus())) {
                throw new IllegalStateException("የዳሰሳ ጥናት ባለሙያ ለመቀየር የጥያቄው ደረጃ ዳሰሳ ላይ መሆን አለበት");
            }
            if (req.getSurveyPlumber() != null) {
                oldPlumberName = req.getSurveyPlumber().getFirstName() + " " + req.getSurveyPlumber().getLastName();
            }
            req.setSurveyPlumber(newPlumber);
            req.setSurveyAssignedDate(LocalDateTime.now());
            req.setStatus("SURVEY_IN_PROGRESS");
            actionName = "SURVEY_PLUMBER_REASSIGNED";
        }

        CustomNewLineConnectionRequest updated = requestRepo.save(req);
        String newPlumberName = newPlumber.getFirstName() + " " + newPlumber.getLastName();
        String reasonStr = dto.getReason() != null && !dto.getReason().isBlank() ? " (ምክንያት: " + dto.getReason().trim() + ")" : "";

        logAction(updated, actionName, req.getStatus(), req.getStatus(), username, "TECHNICAL_SUPERVISOR",
                  String.format("ባለሙያ ተቀይሯል። የቀድሞ ባለሙያ: %s, አዲስ የተመደበ: %s%s", oldPlumberName, newPlumberName, reasonStr));

        return updated;
    }

    public CustomNewLineConnectionRequest rejectOrCancelApplication(Long requestId, RejectCancelDTO dto, String username) {
        CustomNewLineConnectionRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        validateBranchAccess(req, username);

        String actionType = dto.getActionType() != null ? dto.getActionType().trim() : "REJECT_SURVEY_UNFEASIBLE";
        String oldStatus = req.getStatus();

        if ("FINAL_ACTIVATION_COMPLETED".equalsIgnoreCase(oldStatus)) {
            throw new IllegalStateException("የነቃ ደንበኛን እዚህ ማሰረዝ አይቻልም");
        }

        String newStatus;
        String logActionType;
        String logComments;

        if ("CANCEL_APPLICATION".equalsIgnoreCase(actionType)) {
            newStatus = "APPLICATION_CANCELLED";
            logActionType = "APPLICATION_CANCELLED";
            req.setCancellationReason(dto.getReason());
            logComments = "ማመልከቻው ተሰርዟል። ምክንያት: " + (dto.getReason() != null ? dto.getReason() : "በደንበኛ ጥያቄ");
        } else {
            newStatus = "SURVEY_REJECTED_UNFEASIBLE";
            logActionType = "SURVEY_REJECTED_UNFEASIBLE";
            req.setRejectionReason(dto.getReason());
            logComments = "የቴክኒክ ዳሰሳ ጥናት ውድቅ ተደርጓል (መስመር የለም / አይቻልም)። ምክንያት: " + (dto.getReason() != null ? dto.getReason() : "ቴክኒካል መስፈርት አያሟላም");
        }

        req.setRejectedBy(username);
        req.setRejectedDate(LocalDateTime.now());
        req.setStatus(newStatus);

        CustomNewLineConnectionRequest updated = requestRepo.save(req);

        logAction(updated, logActionType, oldStatus, newStatus, username, "MANAGEMENT", logComments);

        return updated;
    }

    public CustomNewLineConnectionRequest returnForRevision(Long requestId, ReturnRevisionDTO dto, String username) {
        CustomNewLineConnectionRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        validateBranchAccess(req, username);
        validateStatusTransition(req, "PENDING_PAYMENT_APPROVAL", "ወደ ቴክኒክ ክፍል ለክለሳ መመለስ");

        String oldStatus = req.getStatus();
        req.setStatus("RETURNED_FOR_REVISION");

        CustomNewLineConnectionRequest updated = requestRepo.save(req);
        String reasonStr = dto.getRemarks() != null && !dto.getRemarks().isBlank() ? dto.getRemarks().trim() : "እቃዎችና የዋጋ ግምት እንዲከለስ በገቢዎች ክፍል ተመልሷል";

        logAction(updated, "SURVEY_RETURNED_FOR_REVISION", oldStatus, "RETURNED_FOR_REVISION", username, "REVENUE",
                  "ለክለሳ ወደ ቴክኒክ ክፍል ተመልሷል፡ " + reasonStr);

        return updated;
    }

    @Transactional(readOnly = true)
    public List<CustomNewLineActivityLog> getApplicationLogs(Long requestId, String username) {
        CustomNewLineConnectionRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));
        validateBranchAccess(req, username);
        return logRepo.findByRequestIdOrderByCreatedAtDesc(requestId);
    }

    // ─── Helper: Activity Logger ────────────────────────────────────────────
    private void logAction(CustomNewLineConnectionRequest req, String action, String fromStatus,
                           String toStatus, String username, String role, String comments) {
        CustomNewLineActivityLog log = new CustomNewLineActivityLog(
            req, action, fromStatus, toStatus,
            username != null ? username : "system",
            role, comments
        );
        logRepo.save(log);
    }
}
