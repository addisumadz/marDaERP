package com.wbill.home.service;

import com.wbill.home.dto.CustomMaintenanceDTOs.*;
import com.wbill.home.model.*;
import com.wbill.home.repository.*;
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
public class CustomMaintenanceService {

    @Autowired private CustomMaintenanceRequestRepository requestRepo;
    @Autowired private CustomMaintenanceItemRepository itemRepo;
    @Autowired private CustomMaintenanceAdditionalFeeRepository feeRepo;
    @Autowired private CustomMaintenanceActivityLogRepository logRepo;
    @Autowired private CustomMaintenanceTypeRepository typeRepo;
    @Autowired private CustomMaintenanceCommonMaterialRepository commonMaterialRepo;
    @Autowired private CustomAdditionalFeeTypeRepository feeTypeRepo;

    @Autowired private BillingCustomerInfoRepository customerRepo;
    @Autowired(required = false) private BillingCustomerInfoMeterRepository customerMeterRepo;
    @Autowired private UserAccountRepository userAccountRepo;
    @Autowired(required = false) private UserAccountRoleRepository userAccountRoleRepo;
    @Autowired private BranchRepository branchRepo;
    @Autowired private AddressStreetsRepository kebeleRepo;
    @Autowired private AddressKetenaRepository ketenaRepo;
    @Autowired private BillingCustomerTypeRepository customerTypeRepo;
    @Autowired(required = false) private InvStoreRepository storeRepo;
    @Autowired(required = false) private InvIssueVoucherRepository voucherRepo;
    @Autowired(required = false) private InvItemRepository invItemRepo;
    @Autowired(required = false) private InvItemStoreStockRepository stockRepo;
    @Autowired(required = false) private InvStoreUserRepository invStoreUserRepo;
    @Autowired(required = false) private InvStockTransactionRepository transactionRepo;
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

    public void validateBranchAccess(CustomMaintenanceRequest req, String username) {
        if (username == null) return;
        Optional<UserAccount> userOpt = userAccountRepo.findByUserName(username);
        if (userOpt.isEmpty()) return;
        UserAccount user = userOpt.get();
        if (isUserAdmin(user, username)) return;

        if (user.getBranch() != null && req.getBranch() != null) {
            if (user.getBranch().getId() != req.getBranch().getId()) {
                String branchDesc = req.getBranch().getBranchDescription() != null ? req.getBranch().getBranchDescription() : "";
                throw new IllegalArgumentException("የቅርንጫፍ ወሰን ጥሰት! ይህ የጥገና ጥያቄ የሌላ ቅርንጫፍ ነው (" + branchDesc + ")። እርምጃ መውሰድ አይችሉም።");
            }
        }
    }

    public void validateStatusTransition(CustomMaintenanceRequest req, String expectedStatus, String actionName) {
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
                "የተመረጠው ባለሙያ '%s %s' የተመደበበት ቅርንጫፍ (%s) ከጥገና ጥያቄው ቅርንጫፍ (%s) ጋር አይዛመድም!",
                plumber.getFirstName(), plumber.getLastName(), pBranchName, eBranchName
            ));
        }
    }

    // ─── 1. Maintenance Request Intake (Customer Service) ───────────────────
    public CustomMaintenanceRequest createRequest(CreateMaintenanceRequestDTO dto, String username) {
        if (dto.getCustomerId() == null) {
            throw new IllegalArgumentException("Customer ID is required to create a maintenance request.");
        }

        BillingCustomerInfo customer = customerRepo.findById(dto.getCustomerId())
            .orElseThrow(() -> new IllegalArgumentException("Registered customer not found with ID: " + dto.getCustomerId()));

        int currentYear = LocalDate.now().getYear();
        String prefix = "MNT-" + currentYear + "-";
        long nextSeq = requestRepo.countByRequestNumberPrefix(prefix) + 1;
        String requestNumber = String.format("MNT-%d-%05d", currentYear, nextSeq);

        CustomMaintenanceRequest req = new CustomMaintenanceRequest();
        req.setRequestNumber(requestNumber);
        req.setCustomer(customer);

        // Populate details from customer with fallback to DTO overrides
        String custName = cleanString(dto.getCustomerFullName());
        req.setCustomerFullName(custName != null ? custName : customer.getFullName());

        String custEng = cleanString(dto.getCustomerFullNameEng());
        req.setCustomerFullNameEng(custEng != null ? custEng : customer.getFullNameEng());

        String phone = cleanString(dto.getPhoneNumber());
        req.setPhoneNumber(phone != null ? phone : (customer.getPhoneNumber() != null ? customer.getPhoneNumber() : "0900000000"));

        String natId = cleanString(dto.getNationalIdNumber());
        req.setNationalIdNumber(natId != null ? natId : customer.getNationalIdNumber());

        String house = cleanString(dto.getHouseNumber());
        req.setHouseNumber(house != null ? house : customer.getHouseNumber());

        String accNum = cleanString(dto.getAccountNumber());
        req.setAccountNumber(accNum != null ? accNum : customer.getAccountNumber());

        String meterNum = cleanString(dto.getMeterNumber());
        req.setMeterNumber(meterNum != null ? meterNum : customer.getMeterNumber());

        String addr = cleanString(dto.getAddressDescription());
        req.setAddressDescription(addr != null ? addr : customer.getAddressDescription());

        req.setProblemDescription(cleanString(dto.getProblemDescription()));
        req.setStatus("PENDING_SURVEY_ASSIGNMENT");
        req.setRegisteredBy(username != null ? username : "system");

        // Relationships
        if (dto.getMaintenanceTypeId() != null) {
            typeRepo.findById(dto.getMaintenanceTypeId()).ifPresent(req::setMaintenanceType);
        }

        if (dto.getBranchId() != null) {
            branchRepo.findById(dto.getBranchId()).ifPresent(req::setBranch);
        } else if (customer.getBranch() != null) {
            req.setBranch(customer.getBranch());
        }

        if (dto.getKebeleId() != null) {
            kebeleRepo.findById(dto.getKebeleId()).ifPresent(req::setKebele);
        } else if (customer.getAddressStreet() != null) {
            req.setKebele(customer.getAddressStreet());
        }

        if (dto.getKetenaId() != null) {
            ketenaRepo.findById(dto.getKetenaId()).ifPresent(req::setKetena);
        } else if (customer.getAddressKetena() != null) {
            req.setKetena(customer.getAddressKetena());
        }

        if (dto.getCustomerTypeId() != null) {
            customerTypeRepo.findById(dto.getCustomerTypeId()).ifPresent(req::setCustomerType);
        } else if (customer.getBillingCustomerType() != null) {
            req.setCustomerType(customer.getBillingCustomerType());
        }

        if (req.getBranch() == null) {
            throw new IllegalArgumentException("Branch could not be determined for this customer/request.");
        }

        CustomMaintenanceRequest saved = requestRepo.save(req);

        // Log initial activity
        String typeAm = saved.getMaintenanceType() != null ? saved.getMaintenanceType().getTypeNameAm() : "አጠቃላይ ጥገና";
        logAction(saved, "REQUEST_CREATED", null, "PENDING_SURVEY_ASSIGNMENT", username, "CUSTOMER_SERVICE",
                  "Customer maintenance request registered. Type: " + typeAm + ", Customer: " + saved.getCustomerFullName() + " (" + saved.getAccountNumber() + ")");

        return saved;
    }

    // ─── 2. Query Operations & Branch Resolution ────────────────────────────
    public Integer resolveEffectiveBranchId(Integer branchId, String username) {
        if (username == null) {
            return branchId;
        }
        Optional<UserAccount> userOpt = userAccountRepo.findByUserName(username);
        if (userOpt.isPresent()) {
            UserAccount user = userOpt.get();
            boolean isAdmin = false;
            if (user.getUserRole() != null) {
                String code = user.getUserRole().getRoleCode() != null ? user.getUserRole().getRoleCode().toLowerCase() : "";
                String name = user.getUserRole().getRoleName() != null ? user.getUserRole().getRoleName().toLowerCase() : "";
                if (code.contains("admin") || code.contains("billzgjt") || code.contains("gm") ||
                    name.contains("admin") || name.contains("አስተዳዳሪ") || name.contains("ሥራ አስኪያጅ")) {
                    isAdmin = true;
                }
            }
            if (!isAdmin && userAccountRoleRepo != null) {
                List<String> codes = userAccountRoleRepo.findRoleCodesByUsername(username);
                if (codes != null && codes.stream().anyMatch(c -> c.toLowerCase().contains("admin") || c.toLowerCase().contains("gm"))) {
                    isAdmin = true;
                }
            }

            // Non-admin users are strictly scoped to their assigned branch at the database query level
            if (!isAdmin && user.getBranch() != null) {
                return user.getBranch().getId();
            }
        }
        return branchId;
    }

    @Transactional(readOnly = true)
    public Page<CustomMaintenanceRequest> getRequests(String status, Integer branchId, Long maintenanceTypeId, String search, String username, Pageable pageable) {
        Integer effectiveBranch = resolveEffectiveBranchId(branchId, username);
        String st = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;
        String sc = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return requestRepo.findFiltered(st, effectiveBranch, maintenanceTypeId, sc, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<CustomMaintenanceRequest> getRequestById(Long id) {
        return requestRepo.findById(id);
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
        stats.put("maintenanceInProgress", requestRepo.countByStatusAndBranch("MAINTENANCE_IN_PROGRESS", effectiveBranch));
        stats.put("maintenanceCompleted", requestRepo.countByStatusAndBranch("MAINTENANCE_COMPLETED", effectiveBranch));
        stats.put("rejectedOrCancelled", requestRepo.countRejectedOrCancelledByBranch(effectiveBranch));
        return stats;
    }

    // ─── 3. Step 2: Assign Survey Plumber (Technical Department) ─────────────
    public CustomMaintenanceRequest assignSurveyPlumber(Long requestId, AssignPlumberDTO dto, String username) {
        CustomMaintenanceRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Maintenance request not found: " + requestId));

        UserAccount plumber = userAccountRepo.findById(dto.getPlumberId())
            .orElseThrow(() -> new IllegalArgumentException("Plumber not found: " + dto.getPlumberId()));

        String oldStatus = req.getStatus();
        req.setSurveyPlumber(plumber);
        req.setSurveyAssignedDate(LocalDateTime.now());
        req.setStatus("SURVEY_IN_PROGRESS");
        CustomMaintenanceRequest updated = requestRepo.save(req);

        String plumberName = plumber.getFirstName() + " " + plumber.getLastName();
        logAction(updated, "SURVEY_PLUMBER_ASSIGNED", oldStatus, "SURVEY_IN_PROGRESS", username, "TECHNICAL",
                  "Plumber " + plumberName + " assigned for on-site maintenance inspection. " + (dto.getNotes() != null ? dto.getNotes() : ""));

        return updated;
    }

    // ─── 4. Step 3: Material & Fee Encoding (Technical Department) ───────────
    public CustomMaintenanceRequest submitSurvey(Long requestId, SubmitSurveyDTO dto, String username) {
        CustomMaintenanceRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Maintenance request not found: " + requestId));

        // Update maintenance type if selected/changed in Step 3
        if (dto.getMaintenanceTypeId() != null) {
            typeRepo.findById(dto.getMaintenanceTypeId()).ifPresent(req::setMaintenanceType);
        }

        // Clear existing line items and fees for fresh submission
        itemRepo.deleteByRequestId(requestId);
        feeRepo.deleteByRequestId(requestId);

        BigDecimal utilityMaterialsTotal = BigDecimal.ZERO;
        BigDecimal outsideMaterialsTotal = BigDecimal.ZERO;

        // Process line items
        if (dto.getItems() != null) {
            for (SurveyItemDTO itemDto : dto.getItems()) {
                CustomMaintenanceItem item = new CustomMaintenanceItem();
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

                if (itemDto.getMaintenanceCommonMaterialId() != null) {
                    commonMaterialRepo.findById(itemDto.getMaintenanceCommonMaterialId()).ifPresent(cm -> {
                        item.setMaintenanceCommonMaterial(cm);
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
                CustomMaintenanceAdditionalFee fee = new CustomMaintenanceAdditionalFee();
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

        CustomMaintenanceRequest updated = requestRepo.save(req);

        logAction(updated, "SURVEY_SUBMITTED", oldStatus, "PENDING_PAYMENT_APPROVAL", username, "TECHNICAL",
                  String.format("Maintenance materials & fees encoded. Utility: ETB %.2f, Outside: ETB %.2f, 55%% Service: ETB %.2f, 25%% Transport: ETB %.2f, Fees: ETB %.2f, Total Payable: ETB %.2f",
                                utilityMaterialsTotal, outsideMaterialsTotal, serviceCharge, transportCharge, additionalFeesTotal, totalPayable));

        return updated;
    }

    // ─── 5. Step 4: Price Review & Payment Approval (Revenue Department) ────
    public CustomMaintenanceRequest approvePayment(Long requestId, PaymentApprovalDTO dto, String username) {
        CustomMaintenanceRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Maintenance request not found: " + requestId));

        // If Revenue Officer updated material items or prices, recalculate totals
        if (dto.getUpdatedItems() != null && !dto.getUpdatedItems().isEmpty()) {
            itemRepo.deleteByRequestId(req.getId());
            BigDecimal utilityMaterialsTotal = BigDecimal.ZERO;
            BigDecimal outsideMaterialsTotal = BigDecimal.ZERO;

            for (SurveyItemDTO itemDto : dto.getUpdatedItems()) {
                CustomMaintenanceItem item = new CustomMaintenanceItem();
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

                if (itemDto.getMaintenanceCommonMaterialId() != null) {
                    commonMaterialRepo.findById(itemDto.getMaintenanceCommonMaterialId()).ifPresent(cm -> {
                        item.setMaintenanceCommonMaterial(cm);
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
                    CustomMaintenanceAdditionalFee fee = new CustomMaintenanceAdditionalFee();
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

        if (req.getMaterialsUtilityTotal().compareTo(BigDecimal.ZERO) > 0) {
            req.setStatus("PENDING_STORE_COLLECTION");
        } else {
            req.setStatus("MATERIALS_COLLECTED");
        }

        CustomMaintenanceRequest updated = requestRepo.save(req);

        logAction(updated, "PAYMENT_APPROVED", oldStatus, req.getStatus(), username, "REVENUE",
                  "Maintenance payment approved by Revenue Officer. Receipt: " + dto.getReceiptNumber() + ", Ref: " + dto.getReferenceNumber() +
                  (dto.getUpdatedItems() != null ? " (prices/items reviewed & updated)" : ""));

        return updated;
    }

    // ─── 6. Step 5: Store Material Dispatch (Inventory Department) ──────────
    @Transactional
    public CustomMaintenanceRequest dispatchMaterials(Long requestId, StoreDispatchDTO dto, String username) {
        CustomMaintenanceRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Maintenance request not found: " + requestId));

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

        List<CustomMaintenanceItem> utilityItems = req.getItems() != null
            ? req.getItems().stream()
                .filter(it -> it.getUtilityQuantity() != null && it.getUtilityQuantity().compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toList())
            : Collections.emptyList();

        InvIssueVoucher savedVoucher = null;

        // Stock deduction & voucher lines creation
        if (targetStore != null && !utilityItems.isEmpty() && voucherRepo != null && stockRepo != null) {
            InvIssueVoucher voucher = new InvIssueVoucher();
            voucher.setVoucherNumber("ISV-MNT-" + req.getRequestNumber());
            voucher.setStore(targetStore);
            voucher.setIssueType(InvIssueVoucher.IssueType.SALE);
            voucher.setIssuedTo(req.getCustomerFullName());
            voucher.setDepartment("Maintenance Service / Customer Care");
            voucher.setIssuedDate(LocalDate.now());
            voucher.setStatus(InvIssueVoucher.IssueStatus.ISSUED);
            voucher.setApprovedBy(username);
            voucher.setApprovedDate(LocalDateTime.now());
            voucher.setIssuedBy(username);
            voucher.setRemarks(dto.getRemarks() != null && !dto.getRemarks().isBlank() 
                ? dto.getRemarks() 
                : "Materials issued for Maintenance Request: " + req.getRequestNumber());

            BigDecimal totalVoucherCost = BigDecimal.ZERO;
            int lineOrder = 1;

            for (CustomMaintenanceItem it : utilityItems) {
                InvItem invItem = it.getInvItem();
                if (invItem == null && it.getMaintenanceCommonMaterial() != null) {
                    invItem = it.getMaintenanceCommonMaterial().getInvItem();
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
                            : "TXN-MNT-" + System.currentTimeMillis() + "-" + lineOrder);
                        txn.setItem(fItem);
                        txn.setStore(fStore);
                        txn.setTransactionType(TransactionType.ISSUE_SALE);
                        txn.setQuantity(qty);
                        txn.setUnitCost(unitCost);
                        txn.setTotalCost(lineTotalCost);
                        txn.setBalanceBefore(balanceBefore);
                        txn.setBalanceAfter(stock.getQuantityOnHand());
                        txn.setReferenceType("CUSTOMER_MAINTENANCE");
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

        CustomMaintenanceRequest updated = requestRepo.save(req);

        String voucherRef = savedVoucher != null ? " (Voucher: " + savedVoucher.getVoucherNumber() + 
            (savedVoucher.getJournalEntry() != null ? ", Journal: " + savedVoucher.getJournalEntry().getEntryNumber() : "") + ")" : "";

        logAction(updated, "MATERIALS_DISPATCHED", oldStatus, "MATERIALS_COLLECTED", username, "INVENTORY",
                  "Maintenance materials issued from store '" + (targetStore != null ? targetStore.getStoreName() : "N/A") +
                  "' and released by storekeeper: " + username + voucherRef);

        return updated;
    }

    // ─── 7. Step 6: Assign Maintenance Plumber (Technical Department) ───────
    public CustomMaintenanceRequest assignMaintenancePlumber(Long requestId, AssignPlumberDTO dto, String username) {
        CustomMaintenanceRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Maintenance request not found: " + requestId));

        UserAccount plumber = userAccountRepo.findById(dto.getPlumberId())
            .orElseThrow(() -> new IllegalArgumentException("Plumber not found: " + dto.getPlumberId()));

        String oldStatus = req.getStatus();
        req.setMaintenancePlumber(plumber);
        req.setMaintenanceAssignedDate(LocalDateTime.now());
        req.setStatus("MAINTENANCE_IN_PROGRESS");

        CustomMaintenanceRequest updated = requestRepo.save(req);

        String plumberName = plumber.getFirstName() + " " + plumber.getLastName();
        logAction(updated, "MAINTENANCE_PLUMBER_ASSIGNED", oldStatus, "MAINTENANCE_IN_PROGRESS", username, "TECHNICAL",
                  "Plumber " + plumberName + " assigned for physical maintenance repair. " + (dto.getNotes() != null ? dto.getNotes() : ""));

        return updated;
    }

    // ─── 8. Step 7: Complete Maintenance & Final Verification ───────────────
    public CustomMaintenanceRequest completeMaintenance(Long requestId, MaintenanceCompletionDTO dto, String username) {
        CustomMaintenanceRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Maintenance request not found: " + requestId));

        String oldStatus = req.getStatus();
        req.setMaintenanceCompletedDate(LocalDateTime.now());
        req.setMaintenanceNotes(cleanString(dto.getNotes()));
        req.setFinalMeterReading(dto.getFinalMeterReading());
        req.setMaintenanceApprovedBy(username != null ? username : "technical");
        req.setStatus("MAINTENANCE_COMPLETED");

        // If a new meter reading is recorded during maintenance (e.g. meter replacement or test)
        if (dto.getFinalMeterReading() != null && req.getCustomer() != null) {
            BillingCustomerInfo customer = req.getCustomer();
            customer.setInitialReading(dto.getFinalMeterReading());
            customerRepo.save(customer);
        }

        CustomMaintenanceRequest updated = requestRepo.save(req);

        logAction(updated, "MAINTENANCE_COMPLETED", oldStatus, "MAINTENANCE_COMPLETED", username, "TECHNICAL",
                  "Customer maintenance physical work completed and verified. " + (dto.getNotes() != null ? dto.getNotes() : ""));

        return updated;
    }

    // ─── 9. Reference Catalogs & Stocks ─────────────────────────────────────
    @Transactional(readOnly = true)
    public List<CustomMaintenanceType> getAllMaintenanceTypes() {
        return typeRepo.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    public CustomMaintenanceType saveMaintenanceType(CustomMaintenanceType type) {
        return typeRepo.save(type);
    }

    @Transactional(readOnly = true)
    public List<CustomMaintenanceCommonMaterial> getCommonMaterials(Long maintenanceTypeId) {
        if (maintenanceTypeId != null) {
            return commonMaterialRepo.findByMaintenanceTypeIdAndIsActiveTrueOrderByDisplayOrderAsc(maintenanceTypeId);
        }
        return commonMaterialRepo.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    public CustomMaintenanceCommonMaterial saveCommonMaterial(CustomMaintenanceCommonMaterial material) {
        if (material.getMaintenanceType() != null && material.getMaintenanceType().getId() != null) {
            typeRepo.findById(material.getMaintenanceType().getId()).ifPresent(material::setMaintenanceType);
        }
        if (material.getInvItem() != null && material.getInvItem().getId() > 0 && invItemRepo != null) {
            material.setInvItem(invItemRepo.findById(material.getInvItem().getId()).orElse(null));
        } else {
            material.setInvItem(null);
        }
        return commonMaterialRepo.save(material);
    }

    public void deleteCommonMaterial(Long id) {
        commonMaterialRepo.deleteById(id);
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

    public List<CustomMaintenanceItem> getRequestItems(Long requestId) {
        return itemRepo.findByRequestIdOrderByIdAsc(requestId);
    }

    public List<CustomMaintenanceAdditionalFee> getRequestFees(Long requestId) {
        return feeRepo.findByRequestIdOrderByIdAsc(requestId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBranchCatalogStock(Integer branchId, Long maintenanceTypeId, String username) {
        Map<String, Object> result = new LinkedHashMap<>();
        InvStore store = null;
        if (storeRepo != null) {
            if (branchId != null) {
                store = storeRepo.findByBranchId(branchId).orElse(null);
            }
            if (store == null && username != null && invStoreUserRepo != null) {
                List<InvStoreUser> userStores = invStoreUserRepo.findActiveStoresByUsername(username);
                if (userStores != null && !userStores.isEmpty()) {
                    store = userStores.get(0).getStore();
                }
            }
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
        List<CustomMaintenanceCommonMaterial> materials = getCommonMaterials(maintenanceTypeId);

        List<Map<String, Object>> catalogList = new ArrayList<>();
        for (CustomMaintenanceCommonMaterial mat : materials) {
            Map<String, Object> itemMap = new LinkedHashMap<>();
            itemMap.put("commonMaterialId", mat.getId());
            itemMap.put("materialCode", mat.getMaterialCode());
            itemMap.put("materialName", mat.getMaterialName());
            itemMap.put("materialNameAm", mat.getMaterialNameAm());
            itemMap.put("unitOfMeasure", mat.getUnitOfMeasure() != null ? mat.getUnitOfMeasure() : "በቁጥር");
            itemMap.put("maintenanceTypeId", mat.getMaintenanceType() != null ? mat.getMaintenanceType().getId() : null);

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
        result.put("maintenanceTypeId", maintenanceTypeId);
        result.put("storeId", store != null ? store.getId() : null);
        result.put("storeName", store != null ? store.getStoreName() : "N/A");
        result.put("storeCode", store != null ? store.getStoreCode() : "N/A");
        result.put("items", catalogList);

        return result;
    }

    // ─── 12. Supervisory & Management Operations ────────────────────────────
    public CustomMaintenanceRequest reassignPlumber(Long requestId, ReassignPlumberDTO dto, String username) {
        CustomMaintenanceRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Maintenance request not found: " + requestId));

        validateBranchAccess(req, username);

        UserAccount newPlumber = userAccountRepo.findById(dto.getPlumberId())
            .orElseThrow(() -> new IllegalArgumentException("Plumber not found: " + dto.getPlumberId()));

        validatePlumberBranch(newPlumber, req.getBranch());

        String mode = dto.getMode() != null ? dto.getMode().toLowerCase() : "survey";
        String oldPlumberName = "ያልተመደበ";
        String actionName;

        if ("maintenance".equals(mode)) {
            if (!"MAINTENANCE_IN_PROGRESS".equalsIgnoreCase(req.getStatus()) && !"MATERIALS_COLLECTED".equalsIgnoreCase(req.getStatus())) {
                throw new IllegalStateException("የጥገና ባለሙያ ለመቀየር የጥያቄው ደረጃ ጥገና ላይ ወይም እቃ የተወሰደ መሆን አለበት");
            }
            if (req.getMaintenancePlumber() != null) {
                oldPlumberName = req.getMaintenancePlumber().getFirstName() + " " + req.getMaintenancePlumber().getLastName();
            }
            req.setMaintenancePlumber(newPlumber);
            req.setMaintenanceAssignedDate(LocalDateTime.now());
            req.setStatus("MAINTENANCE_IN_PROGRESS");
            actionName = "MAINTENANCE_PLUMBER_REASSIGNED";
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

        CustomMaintenanceRequest updated = requestRepo.save(req);
        String newPlumberName = newPlumber.getFirstName() + " " + newPlumber.getLastName();
        String reasonStr = dto.getReason() != null && !dto.getReason().isBlank() ? " (ምክንያት: " + dto.getReason().trim() + ")" : "";

        logAction(updated, actionName, req.getStatus(), req.getStatus(), username, "TECHNICAL_SUPERVISOR",
                  String.format("ባለሙያ ተቀይሯል። የቀድሞ ባለሙያ: %s, አዲስ የተመደበ: %s%s", oldPlumberName, newPlumberName, reasonStr));

        return updated;
    }

    public CustomMaintenanceRequest rejectOrCancelRequest(Long requestId, RejectCancelDTO dto, String username) {
        CustomMaintenanceRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Maintenance request not found: " + requestId));

        validateBranchAccess(req, username);

        String actionType = dto.getActionType() != null ? dto.getActionType().trim() : "REJECT_SURVEY_UNFEASIBLE";
        String oldStatus = req.getStatus();

        if ("MAINTENANCE_COMPLETED".equalsIgnoreCase(oldStatus)) {
            throw new IllegalStateException("የተጠናቀቀ ጥገናን እዚህ ማሰረዝ አይቻልም");
        }

        String newStatus;
        String logActionType;
        String logComments;

        if ("CANCEL_APPLICATION".equalsIgnoreCase(actionType)) {
            newStatus = "APPLICATION_CANCELLED";
            logActionType = "APPLICATION_CANCELLED";
            req.setCancellationReason(dto.getReason());
            logComments = "የጥገና ማመልከቻው ተሰርዟል። ምክንያት: " + (dto.getReason() != null ? dto.getReason() : "በደንበኛ ጥያቄ");
        } else {
            newStatus = "SURVEY_REJECTED_UNFEASIBLE";
            logActionType = "SURVEY_REJECTED_UNFEASIBLE";
            req.setRejectionReason(dto.getReason());
            logComments = "የቴክኒክ ዳሰሳ ጥናት ውድቅ ተደርጓል (ጥገና ማድረግ አይቻልም)። ምክንያት: " + (dto.getReason() != null ? dto.getReason() : "ቴክኒካል መስፈርት አያሟላም");
        }

        req.setRejectedBy(username);
        req.setRejectedDate(LocalDateTime.now());
        req.setStatus(newStatus);

        CustomMaintenanceRequest updated = requestRepo.save(req);

        logAction(updated, logActionType, oldStatus, newStatus, username, "MANAGEMENT", logComments);

        return updated;
    }

    public CustomMaintenanceRequest returnForRevision(Long requestId, ReturnRevisionDTO dto, String username) {
        CustomMaintenanceRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Maintenance request not found: " + requestId));

        validateBranchAccess(req, username);
        validateStatusTransition(req, "PENDING_PAYMENT_APPROVAL", "ወደ ቴክኒክ ክፍል ለክለሳ መመለስ");

        String oldStatus = req.getStatus();
        req.setStatus("RETURNED_FOR_REVISION");

        CustomMaintenanceRequest updated = requestRepo.save(req);
        String reasonStr = dto.getRemarks() != null && !dto.getRemarks().isBlank() ? dto.getRemarks().trim() : "እቃዎችና የዋጋ ግምት እንዲከለስ በገቢዎች ክፍል ተመልሷል";

        logAction(updated, "SURVEY_RETURNED_FOR_REVISION", oldStatus, "RETURNED_FOR_REVISION", username, "REVENUE",
                  "ለክለሳ ወደ ቴክኒክ ክፍል ተመልሷል፡ " + reasonStr);

        return updated;
    }

    @Transactional(readOnly = true)
    public List<CustomMaintenanceActivityLog> getMaintenanceLogs(Long requestId, String username) {
        CustomMaintenanceRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Maintenance request not found: " + requestId));
        validateBranchAccess(req, username);
        return logRepo.findByRequestIdOrderByCreatedAtDesc(requestId);
    }

    // ─── Helper: Activity Logger ────────────────────────────────────────────
    private void logAction(CustomMaintenanceRequest req, String action, String fromStatus,
                           String toStatus, String username, String role, String comments) {
        CustomMaintenanceActivityLog log = new CustomMaintenanceActivityLog(
            req, action, fromStatus, toStatus,
            username != null ? username : "system",
            role, comments
        );
        logRepo.save(log);
    }
}

