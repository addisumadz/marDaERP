package com.wbill.home.service;

import com.wbill.home.dto.BillingReadingDTO;
import com.wbill.home.dto.ReadingConsumptionItemDTO;
import com.wbill.home.dto.BillingReadingSummaryDTO;
import com.wbill.home.dto.ReadingDetailResponseDTO;
import com.wbill.home.dto.ReadingUpdateDTO;
import com.wbill.home.dto.SimplifiedReadingDTO;
import com.wbill.home.dto.UnicashBillSubmissionDTO;
import com.wbill.home.dto.MardaArifBillSubmissionDTO;
import com.wbill.home.dto.BulkUpdateResponseDTO;
import com.wbill.home.dto.BulkSmsExportItemDTO;
import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.BillingCustomerInfoMeter;
import com.wbill.home.model.BillingReading; // If you have methods returning full entities
import com.wbill.home.model.BillingReadingConsumption;
import com.wbill.home.model.CompanyProfile;
import com.wbill.home.model.UserAccount;
import com.wbill.home.repository.BillingCustomerInfoRepository;
import com.wbill.home.repository.BillingReadingRepository;
import com.wbill.home.repository.BillingCustomerInfoMeterRepository;
import com.wbill.home.repository.BillingReadingConsumptionRepository;
import com.wbill.home.repository.CompanyProfileRepository;
import com.wbill.home.util.EthiopianCalendarUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ReadingService {

    private static final Logger logger = LoggerFactory.getLogger(ReadingService.class);
    boolean activestatus = true;
    boolean voidstatus = false;

    @Autowired
    private BillingReadingRepository billingReadingRepository;
    @Autowired
    private BillingCustomerInfoRepository billingCustomerInfoRepository;
    @Autowired
    private BillingCustomerInfoMeterRepository billingCustomerInfoMeterRepository;
    @Autowired
    private BillingReadingConsumptionRepository billingReadingConsumptionRepository;
    @Autowired
    private DerashClient derashClient;
    @Autowired
    private UnicashClient unicashClient;
    @Autowired
    private MardaArifClient mardaArifClient;
    @Autowired
    private CompanyProfileRepository companyProfileRepository;
    @Autowired
    private SmsService smsService;

    @Transactional(readOnly = true)
    public List<BillingReadingDTO> getAllReadingsForList() {
        return billingReadingRepository.findAllReadingDTOs();
    }

    @Transactional(readOnly = true)
    public List<BillingReadingDTO> getReadingsByStatusForList(String status) {
        return billingReadingRepository.findReadingDTOsByStatus(status);
    }

    @Transactional(readOnly = true)
    public Optional<BillingReading> getReadingById(Integer id) {
        return billingReadingRepository.findById(id);
    }

    // @Transactional(readOnly = true)
    // public List<BillingReadingDTO> getReadingsByCustomerIdForList(int customerId)
    // {
    // return billingReadingRepository.findReadingDTOsByCustomerId(customerId);
    // }

    // // If you need to fetch readings for a specific customer:
    // @Query("SELECT NEW com.wbill.home.dto.BillingReadingDTO(" +
    // "b.id, b.invoiceNumber,b.isMoneyCollected, b.isMoneyCollected, b.lastReading,
    // b.previousReading, b.consumption, b.kifyaWer, " +
    // "b.additionalHisab, b.yezihWerFjotaKfya, b.kotariKiray, b.techemariKfya,
    // b.yezihWer, b.wuzifHisab, " +
    // "b.wuzifDerekKoshasha, b.isPaidThroughBank, b.isPaidOnFrontOffice,
    // b.isPaidFromTekemach, " +
    // "b.isDerashPaid, b.isUnicashPaid, b.isAbyssiniaPaid, b.tekilalaTekefay,
    // b.tekilalaBankYetekefele, " +
    // "b.tekilalaYetekefele, b.kecreditYetekefele, b.bankPaidAgentId,
    // b.uBankPaidAgentId, b.status) " +
    // "FROM BillingReading b WHERE b.billingCustomerInfo.id = :customerId ORDER BY
    // b.id DESC") // Example: Fetch by customer ID
    // List<BillingReadingDTO> findReadingDTOsByCustomerId(@Param("customerId") int
    // customerId);

    // Example: Method to get the full BillingReading entity if details are needed
    @Transactional(readOnly = true)
    public Optional<BillingReading> getReadingById(int id) {
        return billingReadingRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<ReadingDetailResponseDTO> getReadingDetailWithConsumption(int id) {
        Optional<BillingReading> readingOpt = billingReadingRepository.findById(id);
        if (readingOpt.isEmpty()) {
            return Optional.empty();
        }
        BillingReading reading = readingOpt.get();
        List<BillingReadingConsumption> items = billingReadingConsumptionRepository
                .findByBillingReadingOrderById(reading);

        ReadingDetailResponseDTO dto = new ReadingDetailResponseDTO();
        // Map entity to summary DTO to avoid recursive serialization
        BillingReadingSummaryDTO summary = new BillingReadingSummaryDTO(
                reading.getId(),
                reading.getKifyaWer(),
                reading.getPreviousReading(),
                reading.getLastReading(),
                reading.getConsumption(),
                reading.getStatus(),
                reading.getInvoiceNumber());
        summary.setIsBillGenerated(reading.isBillGenerated());
        // Safely populate optional display fields
        try {
            if (reading.getBillingCustomerInfo() != null) {
                if (reading.getBillingCustomerInfo().getFullName() != null) {
                    summary.setCustomerName(reading.getBillingCustomerInfo().getFullName());
                }
                if (reading.getBillingCustomerInfo().getMeterNumber() != null) {
                    summary.setMeterNumber(reading.getBillingCustomerInfo().getMeterNumber());
                }
            }
            // Optional invoice number fallback from BillingInvoiceNumbers
            if (reading.getBillingInvoiceNumbers() != null
                    && reading.getBillingInvoiceNumbers().getInvoiceNumbers() != null) {
                summary.setBillingInvoiceNumbers(reading.getBillingInvoiceNumbers().getInvoiceNumbers());
            }
        } catch (Exception ignore) {
        }

        try {
            // Prefer meter details from active customer meter relationship when available
            if (reading.getBillingCustomerInfoMeter() != null) {
                BillingCustomerInfoMeter cm = reading.getBillingCustomerInfoMeter();
                if (cm.getMeterNumber() != null && !cm.getMeterNumber().isEmpty()) {
                    summary.setMeterNumber(cm.getMeterNumber());
                }
                if (cm.getBillingMeterSize() != null) {
                    try {
                        summary.setMeterSize(String.valueOf(cm.getBillingMeterSize().getMeterSize()));
                    } catch (Exception ignoreInner) {
                    }
                }
            }
        } catch (Exception ignore) {
        }

        // Fallback: use customer's configured meter size if summary.meterSize is still
        // empty
        try {
            if ((summary.getMeterSize() == null || summary.getMeterSize().isEmpty())
                    && reading.getBillingCustomerInfo() != null
                    && reading.getBillingCustomerInfo().getBillingMeterSize() != null) {
                try {
                    summary.setMeterSize(String.valueOf(
                            reading.getBillingCustomerInfo().getBillingMeterSize().getMeterSize()));
                } catch (Exception ignoreInner) {
                }
            }
        } catch (Exception ignore) {
        }

        // Map user display names (cashier and mobile reader)
        try {
            if (reading.getCashierUser() != null) {
                summary.setCashierUser(buildUserDisplayName(reading.getCashierUser()));
            }
        } catch (Exception ignore) {
        }
        try {
            if (reading.getMobileReaderUser() != null) {
                summary.setMobileReaderUser(buildUserDisplayName(reading.getMobileReaderUser()));
            }
        } catch (Exception ignore) {
        }

        // Monetary and wuzif related fields (direct on reading)
        try {
            summary.setKotariKiray(reading.getKotariKiray());
        } catch (Exception ignore) {
        }
        try {
            summary.setYezihWerFjotaKfya(reading.getYezihWerFjotaKfya());
        } catch (Exception ignore) {
        }
        try {
            summary.setAdditionalHisab(reading.getAdditionalHisab());
        } catch (Exception ignore) {
        }
        try {
            summary.setTechemariFieldName(reading.getTechemariFieldName());
        } catch (Exception ignore) {
        }
        try {
            summary.setTechemariKfya(reading.getTechemariKfya());
        } catch (Exception ignore) {
        }
        try {
            summary.setYezihWer(reading.getYezihWer());
        } catch (Exception ignore) {
        }
        try {
            summary.setKitat(reading.getKitat());
        } catch (Exception ignore) {
        }

        try {
            summary.setWuzifKotariKiray(reading.getWuzifKotariKiray());
        } catch (Exception ignore) {
        }
        try {
            summary.setWuzifFjotaKfya(reading.getWuzifFjotaKfya());
        } catch (Exception ignore) {
        }
        try {
            summary.setWuzifDerekKoshasha(reading.getWuzifDerekKoshasha());
        } catch (Exception ignore) {
        }
        try {
            summary.setWuzifTechemariKfya(reading.getWuzifTechemariKfya());
        } catch (Exception ignore) {
        }
        try {
            summary.setWuzifWorBzat(reading.getWuzifWorBzat());
        } catch (Exception ignore) {
        }
        try {
            summary.setWuzifKezihEske(reading.getWuzifKezihEske());
        } catch (Exception ignore) {
        }
        try {
            summary.setWuzifHisab(reading.getWuzifHisab());
        } catch (Exception ignore) {
        }

        try {
            summary.setWuzifFjota(reading.getWuzifFjota());
        } catch (Exception ignore) {
        }
        try {
            summary.setTemelashBirr(reading.getTemelashBirr());
        } catch (Exception ignore) {
        }

        try {
            summary.setKecreditYetekefele(reading.getKecreditYetekefele());
        } catch (Exception ignore) {
        }
        try {
            summary.setTekilalaTekefay(reading.getTekilalaTekefay());
        } catch (Exception ignore) {
        }
        try {
            summary.setTekilalaYetekefele(reading.getTekilalaYetekefele());
        } catch (Exception ignore) {
        }

        // Map bank names from related BillingBanks entities for display
        try {
            if (reading.getBillingBanks() != null && reading.getBillingBanks().getBankName() != null) {
                summary.setBankName(reading.getBillingBanks().getBankName());
            }
        } catch (Exception ignore) {
        }

        try {
            if (reading.getuBillingBank() != null && reading.getuBillingBank().getBankName() != null) {
                summary.setUBankName(reading.getuBillingBank().getBankName());
                System.out.println(summary.getUBankName() + summary.getUBankDueDate() + summary.getUBankPaidAgentId());
            }
        } catch (Exception ignore) {
        }

        try {
            summary.setBankPaidAgentId(reading.getBankPaidAgentId());
        } catch (Exception ignore) {
        }
        try {
            summary.setBankDueDate(String.valueOf(reading.getBankDueDate()));
        } catch (Exception ignore) {
        }
        try {
            summary.setMoneyCollectedDate(String.valueOf(reading.getMoneyCollectedDate()));
        } catch (Exception ignore) {
        }
        // uBank related fields and payment flags
        try {
            summary.setUBankPaidAgentId(reading.getuBankPaidAgentId());
        } catch (Exception ignore) {
        }
        try {
            summary.setUBankDueDate(String.valueOf(reading.getuBankDueDate()));
        } catch (Exception ignore) {
        }

        try {
            summary.setUMoneyCollectedDate(String.valueOf(reading.getuMoneyCollectedDate()));
        } catch (Exception ignore) {
        }
        try {
            summary.setIsPaidOnFrontOffice(reading.isPaidOnFrontOffice());
        } catch (Exception ignore) {
        }
        try {
            summary.setIsDerashPaid(reading.isDerashPaid());
        } catch (Exception ignore) {
        }
        try {
            summary.setIsUnicashPaid(reading.isUnicashPaid());
        } catch (Exception ignore) {
        }
        try {
            if (reading.getBillingZeroReadingReason() != null
                    && reading.getBillingZeroReadingReason().getReasonName() != null) {
                summary.setBillingZeroReadingReason(reading.getBillingZeroReadingReason().getReasonName());
            }
        } catch (Exception ignore) {
        }
        // Map service charge fields
        try {
            summary.setmBillingAdditionalPayment1Value(reading.getmBillingAdditionalPayment1Value());
        } catch (Exception ignore) {
        }
        try {
            summary.setmBillingAdditionalPayment2Value(reading.getmBillingAdditionalPayment2Value());
        } catch (Exception ignore) {
        }
        try {
            summary.setmBillingAdditionalPayment1Wuzif(reading.getmBillingAdditionalPayment1Wuzif());
        } catch (Exception ignore) {
        }
        try {
            summary.setmBillingAdditionalPayment2Wuzif(reading.getmBillingAdditionalPayment2Wuzif());
        } catch (Exception ignore) {
        }
        try {
            summary.setmBillingAdditionalPayment1ValueLable(reading.getmBillingAdditionalPayment1ValueLable());
        } catch (Exception ignore) {
        }
        try {
            summary.setmBillingAdditionalPayment2ValueLable(reading.getmBillingAdditionalPayment2ValueLable());
        } catch (Exception ignore) {
        }
        dto.setReading(summary);
        if (items != null) {
            for (BillingReadingConsumption it : items) {
                dto.getConsumption().add(new ReadingConsumptionItemDTO(
                        it.getBlockName(),
                        it.getConsumption(),
                        it.getTariff(),
                        it.getTotalAmount(),
                        it.getStatus()));
            }
        }
        return Optional.of(dto);
    }

    @Transactional(readOnly = true)
    public List<BillingReadingDTO> getReadingsByStatusAndKifyaWerForList(String status, String kifyaWer) {
        return billingReadingRepository.findReadingDTOsReadingsWhereBillNotGenerated(status, kifyaWer);
    }

    @Transactional(readOnly = true)
    public List<BillingReadingDTO> getBillReadingsByStatusAndKifyaWerForList(String status, String kifyaWer) {
        List<BillingReadingDTO> list = billingReadingRepository.findReadingDTOsByStatusAndKifyaWerWithLog(status,
                kifyaWer);
        try {
            long nativeCount = billingReadingRepository.countBaseReadingsByStatusAndKifyaWerNative(status, kifyaWer);
            System.out.println("[ReadingService] Native base count status=" + status + ", kifyaWer=" + kifyaWer
                    + ", count=" + nativeCount);
        } catch (Exception ex) {
            System.out.println("[ReadingService] Native count failed: " + ex.getMessage());
        }
        return list;
    }

    // New: Fetch readings including VOID for Bill Support Page
    @Transactional(readOnly = true)
    public List<BillingReadingDTO> getSupportPageReadingsByStatusAndKifyaWerList(String status, String kifyaWer) {
        List<BillingReadingDTO> list = billingReadingRepository.findSupportPageReadingsByStatusAndKifyaWer(status,
                kifyaWer);
        return list;
    }

    // New: Fetch ALL readings (skip isBillGenerated) for Reading Management Page
    @Transactional(readOnly = true)
    public List<BillingReadingDTO> getReadingManagementByStatusAndKifyaWerList(String status, String kifyaWer) {
        List<BillingReadingDTO> list = billingReadingRepository.findReadingManagementByStatusAndKifyaWer(status,
                kifyaWer);
        return list;
    }

    // New: Fetch readings by kifyaWer only (any status) to support logging
    @Transactional(readOnly = true)
    public List<BillingReadingDTO> getReadingDTOsByKifyaWer(String kifyaWer) {
        return billingReadingRepository.findReadingDTOsByKifyaWer(kifyaWer);
    }

    // Native helpers for diagnostics
    @Transactional(readOnly = true)
    public long countBaseReadingsByStatusAndKifyaWerNative(String status, String kifyaWer) {
        return billingReadingRepository.countBaseReadingsByStatusAndKifyaWerNative(status, kifyaWer);
    }

    @Transactional(readOnly = true)
    public List<Integer> findIdsByStatusAndKifyaWerNative(String status, String kifyaWer) {
        return billingReadingRepository.findIdsByStatusAndKifyaWerNative(status, kifyaWer);
    }

    @Transactional(readOnly = true)
    public List<String> getDistinctKifyaWerList() {
        return billingReadingRepository.findDistinctKifyaWerNative();
    }

    @Transactional(readOnly = true)
    public List<BillingReadingDTO> getReadingsByCustomerIdAndStatusAndKifyaWerForList(int customerId, String status,
            String kifyaWer) {
        return billingReadingRepository.findReadingDTOsByCustomerIdAndStatusAndKifyaWer(customerId, status, kifyaWer);
    }

    @Transactional(readOnly = true)
    public List<BillingReadingDTO> getReadingsByCustomerId(int customerId) {
        return billingReadingRepository.findReadingDTOsByCustomerId(customerId);
    }

    public List<SimplifiedReadingDTO> getFilteredSimplifiedReadingsWhereBillNotGenerated(
            String status, String kifyaWer) {
        return billingReadingRepository.findFilteredSimplifiedReadingsWhereBillNotGenerated(status, kifyaWer);
    }

    @Transactional
    public BillingReading createReadingxxxxx(ReadingUpdateDTO dto) {
        // 1. Validate customer exists
        BillingCustomerInfo customer = billingCustomerInfoRepository.findByAccountNumber(dto.getCustomerAccountNumber())
                .orElseThrow(() -> new RuntimeException(
                        "Customer not found with account: " + dto.getCustomerAccountNumber()));

        // 2. Prevent duplicate reading for the same period
        billingReadingRepository.findByBillingCustomerInfoAndKifyaWer(customer, dto.getKifyaWer())
                .ifPresent(r -> {
                    throw new RuntimeException("Reading for this period already exists.");
                });

        // 3. Determine previous reading
        String previousKifyaWer = EthiopianCalendarUtil.getPreviousKifyaWer(dto.getKifyaWer());
        Optional<BillingReading> prevReadingOpt = billingReadingRepository
                .findFullReadingByCustomerIdAndKifyaWer(customer.getId(), previousKifyaWer);

        int previousReadingValue = prevReadingOpt.map(BillingReading::getLastReading)
                .orElse((int) customer.getInitialReading());

        // 4. Calculate consumption
        int consumption = dto.getLastReading() - previousReadingValue;
        if (consumption < 0) {
            throw new RuntimeException("Negative consumption is not allowed. Check reading values.");
        }

        // 5. Build the new BillingReading entity
        BillingReading newReading = new BillingReading();
        newReading.setBillingCustomerInfo(customer);
        newReading.setKifyaWer(dto.getKifyaWer());
        newReading.setLastReading(dto.getLastReading());
        newReading.setPreviousReading(previousReadingValue);
        newReading.setConsumption(consumption);
        newReading.setCollectionDate(new Date());
        newReading.setRegisteredDate(new Date());
        newReading.setModifiedDate(new Date());
        newReading.setStatus("active");
        newReading.setBillGenerated(false); // Bill not generated yet
        newReading.setMoneyCollected(false);
        // Set other necessary defaults...

        return billingReadingRepository.save(newReading);
    }

    @Transactional
    public BillingReading updateReading(Integer id, ReadingUpdateDTO dto) {
        BillingReading reading = billingReadingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reading not found with id: " + id));

        // Update the reading and recalculate consumption
        reading.setLastReading(dto.getLastReading());
        int newConsumption = reading.getLastReading() - reading.getPreviousReading();
        if (newConsumption < 0) {
            throw new RuntimeException("Update resulted in negative consumption.");
        }
        reading.setConsumption(newConsumption);
        reading.setModifiedDate(new Date());

        return billingReadingRepository.save(reading);
    }

    /**
     * Delete an active reading (mark as deleted + void) and create a new reading
     * row
     * using the provided previous/current readings. Old creation methods are
     * untouched.
     */
    @Transactional
    public BillingReading deleteActiveAndCreateNewReading(Integer id, Integer previousReading, Integer currentReading) {
        BillingReading oldReading = billingReadingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reading not found with id: " + id));

        // Business rule: allow even if bill is not generated; block only if money
        // already collected
        if (Boolean.TRUE.equals(oldReading.isMoneyCollected())) {
            throw new RuntimeException("Action not allowed: money already collected for this reading.");
        }

        if (previousReading == null || currentReading == null) {
            throw new RuntimeException("Both previousReading and currentReading are required");
        }
        if (previousReading < 0 || currentReading < 0) {
            throw new RuntimeException("Readings cannot be negative");
        }
        if (currentReading < previousReading) {
            throw new RuntimeException("Current reading cannot be less than previous reading");
        }

        // 1) Mark the old reading as deleted and voided
        oldReading.setStatus("deleted");
        oldReading.setVoid(true);
        oldReading.setModifiedDate(new Date());
        billingReadingRepository.save(oldReading);

        // 2) Create a new reading row based on the provided values
        BillingReading newReading = new BillingReading();
        newReading.setBillingCustomerInfo(oldReading.getBillingCustomerInfo());
        newReading.setKifyaWer(oldReading.getKifyaWer());
        newReading.setPreviousReading(previousReading);
        newReading.setLastReading(currentReading);
        int newConsumption = currentReading - previousReading;
        newReading.setConsumption(newConsumption);

        // Timestamps and status defaults similar to import flow
        Date now = new Date();
        newReading.setCollectionDate(now);
        newReading.setRegisteredDate(now);
        newReading.setModifiedDate(now);
        newReading.setStatus("active");
        newReading.setVoid(false);
        newReading.setBillGenerated(false); // require regeneration
        newReading.setMoneyCollected(false);

        // Initialize extra counters (safe defaults)
        newReading.setConsumptionWuzifYalefew(0);
        newReading.setConsumptionWuzif(0);

        // Zero reading logic and counter (borrowed pattern from import service)
        if (newConsumption == 0) {
            newReading.setZeroOccurred(true);
            // Do not set reason here; leave as-is/null
            try {
                String previousKifyaWer = EthiopianCalendarUtil.getPreviousKifyaWer(oldReading.getKifyaWer());
                Optional<BillingReading> prevReadingForZeroBzatOpt = billingReadingRepository
                        .findFullReadingByCustomerIdAndKifyaWer(
                                oldReading.getBillingCustomerInfo().getId(), previousKifyaWer);
                if (prevReadingForZeroBzatOpt.isPresent()) {
                    BillingReading prev = prevReadingForZeroBzatOpt.get();
                    newReading.setZeroReadingWorBzat(prev.getZeroReadingWorBzat() + 1);
                } else {
                    newReading.setZeroReadingWorBzat(1);
                }
            } catch (Exception ex) {
                // Fallback if any lookup fails
                newReading.setZeroReadingWorBzat(1);
            }
        } else {
            newReading.setZeroOccurred(false);
            newReading.setBillingZeroReadingReason(null);
            newReading.setZeroReadingWorBzat(0);
        }

        // Meter assignment: use customer's latest active meter if present
        try {
            BillingCustomerInfo customer = oldReading.getBillingCustomerInfo();
            Optional<BillingCustomerInfoMeter> latestActiveMeterOpt = billingCustomerInfoMeterRepository
                    .findFirstByBillingCustomerInfoAndActiveMeterIsTrueAndDeletedOrderByRegisteredDateDesc(customer,
                            "active");
            if (latestActiveMeterOpt.isPresent()) {
                newReading.setBillingCustomerInfoMeter(latestActiveMeterOpt.get());
            } else {
                newReading.setBillingCustomerInfoMeter(null);
            }
        } catch (Exception ignore) {
            newReading.setBillingCustomerInfoMeter(null);
        }

        // Explicitly clear optional relations similar to import service
        newReading.setMobileReaderUser(null);
        newReading.setModifiedByUser(null);

        return billingReadingRepository.save(newReading);
    }

    @Transactional
    public void deleteReading(Integer id) {
        if (!billingReadingRepository.existsById(id)) {
            throw new RuntimeException("Reading not found, cannot delete.");
        }
        billingReadingRepository.deleteById(id);
    }

    /**
     * Changes only the status of a reading without affecting other fields
     * Used for complaint handling to mark readings as deleted
     */
    // src/main/java/com/wbill/home/service/ReadingService.java
    @Transactional
    public BillingReading changeReadingStatus(Integer id, String newStatus, Integer previousReading,
            Integer currentReading) {
        BillingReading reading = billingReadingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reading not found with id: " + id));

        // Business rule:
        // - Allow status changes (including deletion) even if bill is not generated.
        // - Block if money is already collected.
        if (Boolean.TRUE.equals(reading.isMoneyCollected())) {
            throw new RuntimeException("Action not allowed: money already collected for this reading.");
        }

        // Guard: Allow only one active reading per customer per kifyaWer (payment
        // month)
        if (newStatus != null && newStatus.equalsIgnoreCase("active")) {
            int customerId = reading.getBillingCustomerInfo().getId();
            String kifyaWer = reading.getKifyaWer();
            // Look for another active reading for the same customer and month
            Optional<BillingReading> existingActive = billingReadingRepository
                    .findFullReadingByCustomerIdAndKifyaWer(customerId, kifyaWer);
            if (existingActive.isPresent() && existingActive.get().getId() != reading.getId()) {
                throw new RuntimeException("there is same month reading on active tab");
            }
        }

        // Store original values for logging
        boolean beforeVoid = reading.isVoid();
        String beforeStatus = reading.getStatus();

        // Update status and void flag
        reading.setStatus(newStatus);

        // Set void flag based on status
        boolean newVoid = reading.isVoid(); // Default to current value
        if (newStatus != null) {
            if (newStatus.equalsIgnoreCase("active")) {
                newVoid = false;
            } else if (newStatus.equalsIgnoreCase("deleted")) {
                newVoid = true;
            }
        }
        reading.setVoid(newVoid);

        // Update readings if provided
        if (previousReading != null) {
            reading.setPreviousReading(previousReading);
        }
        if (currentReading != null) {
            reading.setLastReading(currentReading);
            // Recalculate consumption if we have both readings
            Integer prevReading = reading.getPreviousReading();
            if (prevReading != null) {
                reading.setConsumption(currentReading - prevReading);
            }
        }

        reading.setModifiedDate(new Date());

        System.out.println("changeReadingStatus: id=" + id +
                " status " + beforeStatus + " -> " + newStatus +
                " isVoid " + beforeVoid + " -> " + newVoid);

        return billingReadingRepository.save(reading);
    }

    @Transactional
    public int extendBankBillsWithPenalty(java.util.List<Integer> readingIds, double extraPenalty,
            java.time.LocalDate dueDate) {
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be empty");
        }
        if (dueDate == null) {
            throw new IllegalArgumentException("dueDate is required");
        }
        CompanyProfile companyProfile = companyProfileRepository.findById(9).orElse(null);
        if (companyProfile == null) {
            companyProfile = companyProfileRepository.findFirstByOrderByIdDesc();
        }
        String template = companyProfile != null ? companyProfile.getTemplateDerashMessage() : null;
        int updated = 0;
        String dueDateStr = dueDate.toString();
        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }
            BillingReading reading = billingReadingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reading not found with id: " + id));
            if (Boolean.TRUE.equals(reading.isMoneyCollected())) {
                continue;
            }
            if (!reading.isSendToBank()) {
                continue;
            }
            double baseTotal = reading.getTekilalaTekefay();
            if (reading.getTechemariKitat() > 0) {
                baseTotal = baseTotal - reading.getTechemariKitat();
                reading.setTekilalaTekefay(baseTotal);
            }
            double newTotal = baseTotal + extraPenalty;
            String billId = null;
            if (reading.getBillingInvoiceNumbers() != null
                    && reading.getBillingInvoiceNumbers().getInvoiceNumbers() != null) {
                billId = reading.getBillingInvoiceNumbers().getInvoiceNumbers();
            } else if (reading.getInvoiceNumber() != null) {
                billId = reading.getInvoiceNumber();
            }
            if (billId == null || billId.trim().isEmpty()) {
                continue;
            }
            String billDesc = reading.getBillDescriptionBank();
            if (billDesc == null || billDesc.trim().isEmpty()) {
                String period = reading.getKifyaWer() != null ? reading.getKifyaWer() : "";
                billDesc = "Bill for " + period;
            }
            String reason = reading.getKifyaWer();
            if (template != null && !template.trim().isEmpty()) {
                String message = buildDerashMessageFromTemplate(template, reading, dueDate);
                if (message != null && !message.trim().isEmpty()) {
                    billDesc = message;
                    reason = message;
                }
            }
            derashClient.updateCustomerBill(
                    billId.trim(),
                    String.valueOf(newTotal),
                    billDesc,
                    reason,
                    dueDateStr);
            reading.setTechemariKitat(extraPenalty);
            reading.setTekilalaTekefay(newTotal);
            reading.setBankDueDate(java.sql.Date.valueOf(dueDate));
            reading.setBankCanceled(false);
            reading.setModifiedDate(new java.util.Date());
            billingReadingRepository.save(reading);
            updated++;
        }
        return updated;
    }

    @Transactional
    public void markBillSentToBankByBillId(String billId) {
        if (billId == null) {
            return;
        }
        String trimmed = billId.trim();
        if (trimmed.isEmpty()) {
            return;
        }
        try {
            Optional<BillingReading> opt = billingReadingRepository.findByBillingInvoiceNumbers_InvoiceNumbers(trimmed);
            if (opt.isEmpty()) {
                return;
            }
            BillingReading reading = opt.get();
            if (!reading.isSendToBank()) {
                reading.setSendToBank(true);
                reading.setModifiedDate(new Date());
                billingReadingRepository.save(reading);
            }
        } catch (Exception ex) {
            // swallow to avoid breaking Derash submission on local update error
        }
    }

    @Transactional
    public int cancelBankBills(java.util.List<Integer> readingIds) {
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be empty");
        }

        int updated = 0;

        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }

            BillingReading reading = billingReadingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reading not found with id: " + id));

            if (Boolean.TRUE.equals(reading.isMoneyCollected())) {
                continue;
            }
            if (!reading.isSendToBank()) {
                continue;
            }

            String billId = null;
            if (reading.getBillingInvoiceNumbers() != null
                    && reading.getBillingInvoiceNumbers().getInvoiceNumbers() != null) {
                billId = reading.getBillingInvoiceNumbers().getInvoiceNumbers();
            } else if (reading.getInvoiceNumber() != null) {
                billId = reading.getInvoiceNumber();
            }
            if (billId == null || billId.trim().isEmpty()) {
                continue;
            }

            reading.setBankCanceled(true);
            reading.setModifiedDate(new java.util.Date());
            billingReadingRepository.save(reading);
            updated++;
        }

        return updated;
    }

    @Transactional
    public int markBillsSentToBank(java.util.List<Integer> readingIds) {
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be empty");
        }
        int updated = 0;
        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }
            BillingReading reading = billingReadingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reading not found with id: " + id));
            if (!reading.isSendToBank()) {
                reading.setSendToBank(true);
                reading.setModifiedDate(new Date());
                billingReadingRepository.save(reading);
                updated++;
            }
        }
        return updated;
    }

    @Transactional
    public BulkUpdateResponseDTO applyConsumptionBasedCorrection(
            java.util.List<Integer> readingIds, String reason, double percent, String baseType) {
        if (readingIds == null || readingIds.isEmpty()) {
            return BulkUpdateResponseDTO.error("readingIds cannot be empty");
        }
        if (percent == 0.0d) {
            return BulkUpdateResponseDTO.error("percent must be non-zero");
        }
        double factor = percent / 100.0d;
        int updated = 0;
        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }
            BillingReading reading = billingReadingRepository.findById(id)
                    .orElse(null);
            if (reading == null) {
                continue;
            }
            // Only adjust already generated, non-void bills
            if (!reading.isBillGenerated()) {
                continue;
            }
            if ("deleted".equalsIgnoreCase(reading.getStatus()) || reading.isVoid()) {
                continue;
            }
            // Determine base amount for percentage correction
            double base;
            if (baseType == null || baseType.trim().isEmpty()) {
                // Backward compatible default: use current month consumption charge only
                base = reading.getYezihWerFjotaKfya();
            } else if ("CURRENT_EDW_TOTAL".equalsIgnoreCase(baseType)) {
                // Total current month (EDW): consumption charge + meter rent
                base = reading.getYezihWerFjotaKfya() + reading.getKotariKiray();
            } else if ("TOTAL_BILL".equalsIgnoreCase(baseType)) {
                // Total bill (what customer has to pay now)
                base = reading.getTekilalaTekefay();
            } else {
                // Fallback to current consumption if unknown code is provided
                base = reading.getYezihWerFjotaKfya();
            }

            double delta = base * factor;

            // Logic Rules:
            // 1. Addition (percent > 0):
            if (percent > 0) {
                // If additionalHisab > 0, SKIP update (dont double charge)
                if (reading.getAdditionalHisab() > 0) {
                    continue;
                }
                // If additionalHisab == 0 (or < 0, though unlikely for initial add), apply
                reading.setAdditionalHisab(delta);
                reading.setTekilalaTekefay(reading.getTekilalaTekefay() + delta);
                reading.setAdditionalText(reason);
            }
            // 2. Subtraction (percent < 0):
            else {
                // Always update tekilalaTekefay (delta is negative, so this subtracts)
                reading.setTekilalaTekefay(reading.getTekilalaTekefay() + delta);
                // Do NOT change additionalHisab
                reading.setAdditionalText(reason);
            }

            reading.setModifiedDate(new Date());
            billingReadingRepository.save(reading);
            updated++;
        }
        if (updated == 0) {
            return BulkUpdateResponseDTO
                    .error("No readings were updated for the given criteria (or already had additional charge).");
        }
        return new BulkUpdateResponseDTO(
                true,
                updated,
                "Consumption-based correction applied to " + updated + " reading(s).");
    }

    @Transactional
    public BulkUpdateResponseDTO initializeAverageConsumptionForCustomers(
            java.util.List<String> accountNumbers,
            String currentKifyaWer,
            int months) {
        if (accountNumbers == null || accountNumbers.isEmpty()) {
            return BulkUpdateResponseDTO.error("accountNumbers cannot be empty");
        }
        if (currentKifyaWer == null || currentKifyaWer.trim().isEmpty()) {
            return BulkUpdateResponseDTO.error("kifyaWer is required");
        }
        if (months <= 0) {
            return BulkUpdateResponseDTO.error("months must be greater than zero");
        }

        int updated = 0;
        for (String acc : accountNumbers) {
            if (acc == null) {
                continue;
            }
            String trimmedAcc = acc.trim();
            if (trimmedAcc.isEmpty()) {
                continue;
            }

            java.util.Optional<BillingCustomerInfo> customerOpt = billingCustomerInfoRepository
                    .findByAccountNumber(trimmedAcc);
            if (customerOpt.isEmpty()) {
                continue;
            }
            BillingCustomerInfo customer = customerOpt.get();

            // Start from the PREVIOUS month — do NOT include the current month in its own
            // average
            java.util.List<String> periods = new java.util.ArrayList<>();
            String period;
            try {
                period = EthiopianCalendarUtil.getPreviousKifyaWer(currentKifyaWer);
            } catch (Exception ex) {
                System.out.println("[AVG-INIT] ERROR: could not compute previous month from: " + currentKifyaWer);
                continue;
            }
            for (int i = 0; i < months; i++) {
                if (period == null || period.trim().isEmpty()) {
                    break;
                }
                if (!periods.contains(period)) {
                    periods.add(period);
                }
                try {
                    period = EthiopianCalendarUtil.getPreviousKifyaWer(period);
                } catch (Exception ex) {
                    break;
                }
            }

            // System.out.println("[AVG-INIT] Account=" + trimmedAcc + " currentKifyaWer=" +
            // currentKifyaWer
            // + " months=" + months + " periods=" + periods);

            int sum = 0;
            int count = 0;

            for (String p : periods) {
                if (p == null || p.trim().isEmpty()) {
                    continue;
                }
                java.util.Optional<BillingReading> readingOpt = billingReadingRepository
                        .findFirstByBillingCustomerInfoAndKifyaWerOrderByRegisteredDateDesc(
                                customer, p);
                if (readingOpt.isEmpty()) {
                    // System.out.println("[AVG-INIT] period=" + p + " -> NO reading found");
                    continue;
                }
                BillingReading reading = readingOpt.get();
                if ("deleted".equalsIgnoreCase(reading.getStatus()) || reading.isVoid()) {
                    // System.out.println("[AVG-INIT] period=" + p + " -> SKIPPED (deleted/void)");
                    continue;
                }
                int cons = reading.getConsumption();
                // Fallback: compute from lastReading - previousReading if consumption field is
                // 0
                if (cons == 0) {
                    int lastR = reading.getLastReading();
                    int prevR = reading.getPreviousReading();
                    if (lastR > 0 && prevR >= 0) {
                        cons = lastR - prevR;
                    }
                }
                if (cons <= 0) {
                    // System.out.println("[AVG-INIT] period=" + p + " -> SKIPPED (cons=" + cons
                    // + " lastReading=" + reading.getLastReading()
                    // + " prevReading=" + reading.getPreviousReading()
                    // + " isBillGenerated=" + reading.isBillGenerated() + ")");
                    continue;
                }
                // System.out.println("[AVG-INIT] period=" + p + " -> cons=" + cons
                // + " (field=" + reading.getConsumption()
                // + " lastR=" + reading.getLastReading()
                // + " prevR=" + reading.getPreviousReading() + ")");
                sum += cons;
                count++;
            }

            if (count == 0) {
                // System.out.println("[AVG-INIT] Account=" + trimmedAcc + " -> count=0,
                // SKIPPING");
                continue;
            }

            int avg = (int) Math.round(sum / (double) count);
            // System.out.println("[AVG-INIT] Account=" + trimmedAcc + " -> sum=" + sum + "
            // count=" + count + " avg=" + avg);
            customer.setInitialConsumption(avg);
            billingCustomerInfoRepository.save(customer);
            updated++;
        }

        if (updated == 0) {
            return BulkUpdateResponseDTO.error("No customers were updated for the given criteria.");
        }
        return new BulkUpdateResponseDTO(
                true,
                updated,
                "Initialized average consumption for " + updated + " customer(s).");
    }

    @Transactional
    public java.util.Map<String, Object> submitUnicashBill(UnicashBillSubmissionDTO billData) {
        if (billData == null) {
            throw new IllegalArgumentException("Bill data is required");
        }
        if (billData.getBillId() == null || billData.getBillId().trim().isEmpty()) {
            throw new IllegalArgumentException("billId is required");
        }
        if (billData.getAmountDue() == null) {
            throw new IllegalArgumentException("amountDue is required");
        }
        if (billData.getValidUntil() == null || billData.getValidUntil().trim().isEmpty()) {
            throw new IllegalArgumentException("validUntil (due date) is required");
        }

        java.util.Map<String, Object> response = unicashClient.updateOrRegisterBill(billData);

        try {
            markBillSentToUnicashByBillId(billData.getBillId());
        } catch (Exception ignore) {
            // do not fail overall submission if local flag update fails
        }

        return response;
    }

    @Transactional
    public int extendUnicashBillsWithPenalty(java.util.List<Integer> readingIds, double extraPenalty,
            java.time.LocalDate dueDate) {
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be empty");
        }
        if (dueDate == null) {
            throw new IllegalArgumentException("dueDate is required");
        }

        int updated = 0;
        String dueDateStr = dueDate.toString();

        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }
            BillingReading reading = billingReadingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reading not found with id: " + id));

            if (Boolean.TRUE.equals(reading.isMoneyCollected())) {
                continue;
            }
            if (!reading.isSendToBankUnicash()) {
                continue;
            }

            double baseTotal = reading.getTekilalaTekefay();
            if (reading.getTechemariKitat() > 0) {
                baseTotal = baseTotal - reading.getTechemariKitat();
                reading.setTekilalaTekefay(baseTotal);
            }
            double newTotal = baseTotal + extraPenalty;

            String billId = null;
            if (reading.getBillingInvoiceNumbers() != null
                    && reading.getBillingInvoiceNumbers().getInvoiceNumbers() != null) {
                billId = reading.getBillingInvoiceNumbers().getInvoiceNumbers();
            } else if (reading.getInvoiceNumber() != null) {
                billId = reading.getInvoiceNumber();
            }
            if (billId == null || billId.trim().isEmpty()) {
                continue;
            }

            String customerId = null;
            String customerName = null;
            String phone = null;
            if (reading.getBillingCustomerInfo() != null) {
                customerId = reading.getBillingCustomerInfo().getAccountNumber();
                customerName = reading.getBillingCustomerInfo().getFullNameEng();
                if (customerName == null || customerName.trim().isEmpty()) {
                    customerName = reading.getBillingCustomerInfo().getFullName();
                }
                phone = reading.getBillingCustomerInfo().getPhoneNumber();
            }

            String billDesc = reading.getBillDescriptionBank();
            if (billDesc == null || billDesc.trim().isEmpty()) {
                String period = reading.getKifyaWer() != null ? reading.getKifyaWer() : "";
                billDesc = "Bill for " + period;
            }

            UnicashBillSubmissionDTO dto = new UnicashBillSubmissionDTO();
            dto.setBillId(billId.trim());
            dto.setCustomerId(customerId);
            dto.setFullName(customerName);
            dto.setPhoneNumber(phone);
            dto.setAmountDue(newTotal);
            dto.setDescription(billDesc);
            dto.setValidUntil(dueDateStr);

            unicashClient.updateOrRegisterBill(dto);

            reading.setTechemariKitat(extraPenalty);
            reading.setTekilalaTekefay(newTotal);
            reading.setuBankDueDate(java.sql.Date.valueOf(dueDate));
            reading.setBankCanceledUnicash(false);
            reading.setModifiedDate(new java.util.Date());
            billingReadingRepository.save(reading);
            updated++;
        }
        return updated;
    }

    @Transactional
    public int updateBillsLocallyWithPenalty(java.util.List<Integer> readingIds, double extraPenalty,
            java.time.LocalDate dueDate) {
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be empty");
        }
        if (dueDate == null) {
            throw new IllegalArgumentException("dueDate is required");
        }

        int updated = 0;
        // String dueDateStr = dueDate.toString(); // Not needed for local update

        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }
            BillingReading reading = billingReadingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reading not found with id: " + id));

            // Skip if money collected (standard rule)
            if (Boolean.TRUE.equals(reading.isMoneyCollected())) {
                continue;
            }
            // Skip if not marked as sent to unicash (optional, but safer to consistency)
            if (!reading.isSendToBankUnicash()) {
                continue;
            }

            double baseTotal = reading.getTekilalaTekefay();
            // If there was a previous penalty, remove it first to avoid double counting if
            // re-running
            // logic implies 'extraPenalty' is the *new* penalty amount to be set, or
            // *additional*?
            // The existing logic in extendUnicashBillsWithPenalty suggests:
            // base = total - old_penalty
            // new_total = base + new_penalty
            // So 'extraPenalty' acts as the TOTAL penalty amount for this transaction
            if (reading.getTechemariKitat() > 0) {
                baseTotal = baseTotal - reading.getTechemariKitat();
            }
            double newTotal = baseTotal + extraPenalty;

            // Update Entity
            reading.setTechemariKitat(extraPenalty);
            reading.setTekilalaTekefay(newTotal);
            reading.setuBankDueDate(java.sql.Date.valueOf(dueDate));
            reading.setBankCanceledUnicash(false);
            reading.setModifiedDate(new java.util.Date());

            billingReadingRepository.save(reading);
            updated++;
        }
        return updated;
    }

    @Transactional
    public int cancelUnicashBills(java.util.List<Integer> readingIds) {
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be empty");
        }

        int updated = 0;

        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }

            BillingReading reading = billingReadingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reading not found with id: " + id));

            if (Boolean.TRUE.equals(reading.isMoneyCollected())) {
                continue;
            }
            if (!reading.isSendToBankUnicash()) {
                continue;
            }

            String billId = null;
            if (reading.getBillingInvoiceNumbers() != null
                    && reading.getBillingInvoiceNumbers().getInvoiceNumbers() != null) {
                billId = reading.getBillingInvoiceNumbers().getInvoiceNumbers();
            } else if (reading.getInvoiceNumber() != null) {
                billId = reading.getInvoiceNumber();
            }
            if (billId == null || billId.trim().isEmpty()) {
                continue;
            }

            unicashClient.cancelBill(billId.trim());

            reading.setBankCanceledUnicash(true);
            reading.setModifiedDate(new java.util.Date());
            billingReadingRepository.save(reading);
            updated++;
        }

        return updated;
    }

    @Transactional
    public int markBillsSentToUnicash(java.util.List<Integer> readingIds) {
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be empty");
        }
        int updated = 0;
        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }
            BillingReading reading = billingReadingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reading not found with id: " + id));
            if (!reading.isSendToBankUnicash()) {
                reading.setSendToBankUnicash(true);
                reading.setModifiedDate(new Date());
                billingReadingRepository.save(reading);
                updated++;
            }
        }
        return updated;
    }

    @Transactional
    public void markBillSentToUnicashByBillId(String billId) {
        if (billId == null) {
            return;
        }
        String trimmed = billId.trim();
        if (trimmed.isEmpty()) {
            return;
        }
        try {
            Optional<BillingReading> opt = billingReadingRepository.findByBillingInvoiceNumbers_InvoiceNumbers(trimmed);
            if (opt.isEmpty()) {
                return;
            }
            BillingReading reading = opt.get();
            if (!reading.isSendToBankUnicash()) {
                reading.setSendToBankUnicash(true);
                reading.setModifiedDate(new Date());
                billingReadingRepository.save(reading);
            }
        } catch (Exception ex) {
            // swallow to avoid breaking Unicash submission on local update error
        }
    }

    // ===================== MardaArif Methods =====================

    @Transactional
    public java.util.Map<String, Object> submitMardaArifBill(MardaArifBillSubmissionDTO billData) {
        if (billData == null) {
            throw new IllegalArgumentException("Bill data is required");
        }
        if (billData.getBillId() == null || billData.getBillId().trim().isEmpty()) {
            throw new IllegalArgumentException("billId is required");
        }
        if (billData.getAmountDue() == null) {
            throw new IllegalArgumentException("amountDue is required");
        }
        if (billData.getValidUntil() == null || billData.getValidUntil().trim().isEmpty()) {
            throw new IllegalArgumentException("validUntil (due date) is required");
        }

        java.util.Map<String, Object> response = mardaArifClient.updateOrRegisterBill(billData);

        try {
            markBillSentToMardaArifByBillId(billData.getBillId());
        } catch (Exception ignore) {
            // do not fail overall submission if local flag update fails
        }

        return response;
    }

    @Transactional
    public int extendMardaArifBillsWithPenalty(java.util.List<Integer> readingIds, double extraPenalty,
            java.time.LocalDate dueDate) {
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be empty");
        }
        if (dueDate == null) {
            throw new IllegalArgumentException("dueDate is required");
        }

        int updated = 0;
        String dueDateStr = dueDate.toString();

        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }
            BillingReading reading = billingReadingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reading not found with id: " + id));

            if (Boolean.TRUE.equals(reading.isMoneyCollected())) {
                continue;
            }
            if (!reading.isSendToBankMardaArif()) {
                continue;
            }

            double baseTotal = reading.getTekilalaTekefay();
            if (reading.getTechemariKitat() > 0) {
                baseTotal = baseTotal - reading.getTechemariKitat();
                reading.setTekilalaTekefay(baseTotal);
            }
            double newTotal = baseTotal + extraPenalty;

            String billId = null;
            if (reading.getBillingInvoiceNumbers() != null
                    && reading.getBillingInvoiceNumbers().getInvoiceNumbers() != null) {
                billId = reading.getBillingInvoiceNumbers().getInvoiceNumbers();
            } else if (reading.getInvoiceNumber() != null) {
                billId = reading.getInvoiceNumber();
            }
            if (billId == null || billId.trim().isEmpty()) {
                continue;
            }

            String customerId = null;
            String customerName = null;
            String phone = null;
            if (reading.getBillingCustomerInfo() != null) {
                customerId = reading.getBillingCustomerInfo().getAccountNumber();
                customerName = reading.getBillingCustomerInfo().getFullNameEng();
                if (customerName == null || customerName.trim().isEmpty()) {
                    customerName = reading.getBillingCustomerInfo().getFullName();
                }
                phone = reading.getBillingCustomerInfo().getPhoneNumber();
            }

            String billDesc = reading.getBillDescriptionBank();
            if (billDesc == null || billDesc.trim().isEmpty()) {
                String period = reading.getKifyaWer() != null ? reading.getKifyaWer() : "";
                billDesc = "Bill for " + period;
            }

            MardaArifBillSubmissionDTO dto = new MardaArifBillSubmissionDTO();
            dto.setBillId(billId.trim());
            dto.setCustomerId(customerId);
            dto.setFullName(customerName);
            dto.setPhoneNumber(phone);
            dto.setAmountDue(newTotal);
            dto.setDescription(billDesc);
            dto.setValidUntil(dueDateStr);

            mardaArifClient.updateOrRegisterBill(dto);

            reading.setTechemariKitat(extraPenalty);
            reading.setTekilalaTekefay(newTotal);
            reading.setmBankDueDate(java.sql.Date.valueOf(dueDate));
            reading.setBankCanceledMardaArif(false);
            reading.setModifiedDate(new java.util.Date());
            billingReadingRepository.save(reading);
            updated++;
        }
        return updated;
    }

    @Transactional
    public int updateBillsLocallyWithPenaltyMardaArif(java.util.List<Integer> readingIds, double extraPenalty,
            java.time.LocalDate dueDate) {
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be empty");
        }
        if (dueDate == null) {
            throw new IllegalArgumentException("dueDate is required");
        }

        int updated = 0;

        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }
            BillingReading reading = billingReadingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reading not found with id: " + id));

            if (Boolean.TRUE.equals(reading.isMoneyCollected())) {
                continue;
            }
            if (!reading.isSendToBankMardaArif()) {
                continue;
            }

            double baseTotal = reading.getTekilalaTekefay();
            if (reading.getTechemariKitat() > 0) {
                baseTotal = baseTotal - reading.getTechemariKitat();
            }
            double newTotal = baseTotal + extraPenalty;

            reading.setTechemariKitat(extraPenalty);
            reading.setTekilalaTekefay(newTotal);
            reading.setmBankDueDate(java.sql.Date.valueOf(dueDate));
            reading.setBankCanceledMardaArif(false);
            reading.setModifiedDate(new java.util.Date());

            billingReadingRepository.save(reading);
            updated++;
        }
        return updated;
    }

    @Transactional
    public int cancelMardaArifBills(java.util.List<Integer> readingIds) {
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be empty");
        }

        int updated = 0;

        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }

            BillingReading reading = billingReadingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reading not found with id: " + id));

            if (Boolean.TRUE.equals(reading.isMoneyCollected())) {
                continue;
            }
            if (!reading.isSendToBankMardaArif()) {
                continue;
            }

            String billId = null;
            if (reading.getBillingInvoiceNumbers() != null
                    && reading.getBillingInvoiceNumbers().getInvoiceNumbers() != null) {
                billId = reading.getBillingInvoiceNumbers().getInvoiceNumbers();
            } else if (reading.getInvoiceNumber() != null) {
                billId = reading.getInvoiceNumber();
            }
            if (billId == null || billId.trim().isEmpty()) {
                continue;
            }

            mardaArifClient.cancelBill(billId.trim());

            reading.setBankCanceledMardaArif(true);
            reading.setModifiedDate(new java.util.Date());
            billingReadingRepository.save(reading);
            updated++;
        }

        return updated;
    }

    @Transactional
    public int markBillsSentToMardaArif(java.util.List<Integer> readingIds) {
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be empty");
        }
        int updated = 0;
        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }
            BillingReading reading = billingReadingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reading not found with id: " + id));
            if (!reading.isSendToBankMardaArif()) {
                reading.setSendToBankMardaArif(true);
                reading.setModifiedDate(new Date());
                billingReadingRepository.save(reading);
                updated++;
            }
        }
        return updated;
    }

    @Transactional
    public void markBillSentToMardaArifByBillId(String billId) {
        if (billId == null) {
            return;
        }
        String trimmed = billId.trim();
        if (trimmed.isEmpty()) {
            return;
        }
        try {
            Optional<BillingReading> opt = billingReadingRepository.findByBillingInvoiceNumbers_InvoiceNumbers(trimmed);
            if (opt.isEmpty()) {
                return;
            }
            BillingReading reading = opt.get();
            if (!reading.isSendToBankMardaArif()) {
                reading.setSendToBankMardaArif(true);
                reading.setModifiedDate(new Date());
                billingReadingRepository.save(reading);
            }
        } catch (Exception ex) {
            // swallow to avoid breaking MardaArif submission on local update error
        }
    }

    @Transactional
    public SmsBulkSendStats sendBillSmsInBulk(java.util.List<Integer> readingIds,
            String smsDueDateText,
            String monthYearPart) {
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be empty");
        }

        java.util.List<BillingReading> readings = billingReadingRepository.findAllById(readingIds);
        java.util.Map<Integer, BillingReading> byId = new java.util.HashMap<>();
        for (BillingReading r : readings) {
            if (r != null) {
                byId.put(r.getId(), r);
            }
        }

        java.util.List<SmsService.BulkSmsRequest> requests = new java.util.ArrayList<>();
        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }
            BillingReading reading = byId.get(id);
            if (reading == null) {
                continue;
            }

            String phoneRaw = null;
            if (reading.getBillingCustomerInfo() != null) {
                phoneRaw = reading.getBillingCustomerInfo().getPhoneNumber();
            }
            String phone = normalizePhoneForSms(phoneRaw);
            if (phone == null) {
                continue;
            }

            String message = buildBillSmsMessage(reading, smsDueDateText, monthYearPart);
            if (message == null || message.isEmpty()) {
                continue;
            }

            logger.info("[BulkSMS] Prepared SMS for readingId={}, account={}, phone={}, message={}",
                    id,
                    (reading.getBillingCustomerInfo() != null
                            ? reading.getBillingCustomerInfo().getAccountNumber()
                            : null),
                    phone,
                    message);

            requests.add(new SmsService.BulkSmsRequest(id, phone, message));
        }

        if (requests.isEmpty()) {
            return new SmsBulkSendStats(readingIds.size(), 0, 0, 0);
        }

        java.util.List<SmsService.BulkSmsResult> results = smsService.sendBulkSms(requests);
        int sent = 0;
        int failed = 0;
        java.util.Set<Integer> updatedIds = new java.util.HashSet<>();

        for (SmsService.BulkSmsResult res : results) {
            if (res == null) {
                continue;
            }
            Integer id = res.getReadingId();
            if (res.isSuccess()) {
                sent++;
                if (id != null && !updatedIds.contains(id)) {
                    BillingReading r = byId.get(id);
                    if (r != null) {
                        r.setEnableEditMeneshaReading(true);
                        r.setModifiedDate(new Date());
                        updatedIds.add(id);
                    }
                }
            } else {
                failed++;
            }
        }

        if (!updatedIds.isEmpty()) {
            java.util.List<BillingReading> toSave = new java.util.ArrayList<>();
            for (Integer id : updatedIds) {
                BillingReading r = byId.get(id);
                if (r != null) {
                    toSave.add(r);
                }
            }
            if (!toSave.isEmpty()) {
                billingReadingRepository.saveAll(toSave);
            }
        }

        int attempted = requests.size();
        return new SmsBulkSendStats(readingIds.size(), attempted, sent, failed);
    }

    public static class SmsBulkSendStats {
        private final int total;
        private final int attempted;
        private final int sent;
        private final int failed;

        public SmsBulkSendStats(int total, int attempted, int sent, int failed) {
            this.total = total;
            this.attempted = attempted;
            this.sent = sent;
            this.failed = failed;
        }

        public int getTotal() {
            return total;
        }

        public int getAttempted() {
            return attempted;
        }

        public int getSent() {
            return sent;
        }

        public int getFailed() {
            return failed;
        }
    }

    private String normalizePhoneForSms(String raw) {
        if (raw == null) {
            return null;
        }
        String cleaned = raw.trim().replaceAll("[\\s,-]", "");
        if (!cleaned.matches("^\\+?\\d+$")) {
            return null;
        }
        if (cleaned.matches("^\\+251[79]\\d{8}$")) {
            return cleaned.substring(1);
        }
        if (cleaned.matches("^251[79]\\d{8}$")) {
            return cleaned;
        }
        if (cleaned.matches("^0[79]\\d{8}$")) {
            return "251" + cleaned.substring(1);
        }
        return null;
    }

    private String buildBillSmsMessage(BillingReading reading, String smsDueDateText, String monthYearPartOverride) {
        BillingCustomerInfo customer = reading.getBillingCustomerInfo();
        String name = customer != null && customer.getFullName() != null ? customer.getFullName() : "";
        String account = customer != null && customer.getAccountNumber() != null ? customer.getAccountNumber() : "";

        int previous = reading.getPreviousReading();
        int current = reading.getLastReading();
        int consumption = reading.getConsumption();
        double wuzifHisab = reading.getWuzifHisab();
        double totalPayable = reading.getTekilalaTekefay();

        // Resolve due date string: prefer frontend-provided value to match UI SMS
        // exactly
        String dueStr = smsDueDateText != null ? smsDueDateText.trim() : "";
        if (dueStr.isEmpty()) {
            java.util.Date bankDueDate = reading.getBankDueDate();
            if (bankDueDate != null) {
                try {
                    LocalDate ld;
                    if (bankDueDate instanceof java.sql.Date) {
                        ld = ((java.sql.Date) bankDueDate).toLocalDate();
                    } else {
                        ld = bankDueDate.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                    }
                    dueStr = formatEthiopianDate(ld);
                } catch (Exception ex) {
                    String kifyaWerFallback = reading.getKifyaWer();
                    dueStr = kifyaWerFallback != null ? kifyaWerFallback : "";
                }
            } else {
                String kifyaWerFallback = reading.getKifyaWer();
                dueStr = kifyaWerFallback != null ? kifyaWerFallback : "";
            }
        }

        // Resolve month/year part: prefer frontend-provided monthYearPartOverride
        String monthYearPart = monthYearPartOverride != null ? monthYearPartOverride : "";
        if (monthYearPart.isEmpty()) {
            String kifyaWer = reading.getKifyaWer();
            if (kifyaWer != null) {
                String[] parts = kifyaWer.split(",");
                String m = parts.length > 0 ? parts[0].trim() : "";
                String y = parts.length > 1 ? parts[1].trim() : "";
                if (!m.isEmpty()) {
                    monthYearPart = m + (y.isEmpty() ? "" : ("-" + y)) + " ";
                }
            }
        }

        return "የተከበሩ " + name + " የውል ቁጥር " + account +
                " የ" + monthYearPart + "ወር ፍጆታ " + consumption + "m³(ከ" + previous + "-" + current + ") ውዝፍ " +
                wuzifHisab + "፣ጠቅላላ ክፍያ " + totalPayable + " ብር እስከ " + dueStr + " ድረስ ይክፈሉ፡፡";
    }

    // Helper to build user display name safely
    private String buildUserDisplayName(UserAccount ua) {
        if (ua == null)
            return null;
        try {
            StringBuilder sb = new StringBuilder();
            if (ua.getFirstName() != null && !ua.getFirstName().isEmpty())
                sb.append(ua.getFirstName());
            if (ua.getMidleName() != null && !ua.getMidleName().isEmpty()) {
                if (sb.length() > 0)
                    sb.append(" ");
                sb.append(ua.getMidleName());
            }
            if (ua.getLastName() != null && !ua.getLastName().isEmpty()) {
                if (sb.length() > 0)
                    sb.append(" ");
                sb.append(ua.getLastName());
            }
            String built = sb.toString().trim();
            if (!built.isEmpty())
                return built;
            return ua.getUserName();
        } catch (Exception ex) {
            return null;
        }
    }

    private String buildDerashMessageFromTemplate(String template, BillingReading reading, LocalDate dueDate) {
        if (template == null) {
            return null;
        }
        String message = template;
        try {
            String kifyaWer = reading.getKifyaWer();
            String[] kfyamonth = (kifyaWer != null) ? kifyaWer.split(",") : new String[] { "", "" };
            String monthNameRaw = kfyamonth.length > 0 ? kfyamonth[0].trim() : "";
            String yearPart = kfyamonth.length > 1 ? kfyamonth[1].trim() : "";
            String monthEn = getMonthNameFromAmharicMName(monthNameRaw);
            String periodStr;
            if (monthEn != null && !monthEn.isEmpty() && !yearPart.isEmpty()) {
                periodStr = monthEn + ", " + yearPart;
            } else {
                periodStr = kifyaWer != null ? kifyaWer : "";
            }

            String customerNameEng = null;
            if (reading.getBillingCustomerInfo() != null) {
                customerNameEng = reading.getBillingCustomerInfo().getFullNameEng();
                if (customerNameEng == null || customerNameEng.trim().isEmpty()) {
                    customerNameEng = reading.getBillingCustomerInfo().getFullName();
                }
            }
            String accountNumber = (reading.getBillingCustomerInfo() != null)
                    ? reading.getBillingCustomerInfo().getAccountNumber()
                    : "";

            String ethDueStr = formatEthiopianDate(dueDate);
            double wuzifTotal = 0.0;
            try {
                wuzifTotal = reading.getWuzifHisab() + reading.getWuzifKotariKiray();
            } catch (Exception ignore) {
            }

            message = message.replace("#10", String.valueOf(reading.getLastReading()));
            message = message.replace("#1", customerNameEng != null ? customerNameEng : "");
            message = message.replace("#2", periodStr != null ? periodStr : "");
            message = message.replace("#3", String.valueOf(reading.getConsumption()));
            message = message.replace("#4", reading.getWuzifKezihEske() != null ? reading.getWuzifKezihEske() : "");
            message = message.replace("#5", String.valueOf(wuzifTotal));
            message = message.replace("#6", String.valueOf(reading.getTekilalaTekefay()));
            message = message.replace("#7", accountNumber != null ? accountNumber : "");
            message = message.replace("#8", ethDueStr != null ? ethDueStr : "");
            message = message.replace("#9", String.valueOf(reading.getPreviousReading()));
            return message;
        } catch (Exception ex) {
            return template;
        }
    }

    private String formatEthiopianDate(LocalDate gregorianDate) {
        if (gregorianDate == null) {
            return "";
        }
        try {
            EthiopianCalendarUtil.EthiopianDate eth = EthiopianCalendarUtil.toEthiopian(gregorianDate);
            return eth != null ? eth.toString() : gregorianDate.toString();
        } catch (Exception ex) {
            return gregorianDate.toString();
        }
    }

    private String getMonthNameFromAmharicMName(String amh) {
        if (amh == null) {
            return "";
        }
        String m = amh.trim();
        if (m.isEmpty())
            return "";
        switch (m) {
            case "መስከረም":
                return "Meskerem";
            case "ጥቅምት":
                return "Tikimt";
            case "ኅዳር":
                return "Hidar";
            case "ታህሣሥ":
                return "Tahsas";
            case "ጥር":
                return "Tir";
            case "የካቲት":
                return "Yekatit";
            case "መጋቢት":
                return "Megabit";
            case "ሚያዝያ":
                return "Miazia";
            case "ግንቦት":
                return "Ginbot";
            case "ሰኔ":
                return "Sene";
            case "ሐምሌ":
                return "Hamle";
            case "ነሐሴ":
                return "Nehasse";
            case "ጳጉሜ":
                return "Pagumen";
            default:
                return m;
        }
    }

    @Transactional
    public SmsBulkSendStats sendBillSmsInBulkSilent(java.util.List<Integer> readingIds,
            String smsDueDateText,
            String monthYearPart) {
        long startTime = System.currentTimeMillis();
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be empty");
        }
        logger.info("[BulkSMS-Silent] Starting silent bulk SMS prep for {} readings.", readingIds.size());

        java.util.List<BillingReading> readings = billingReadingRepository.findAllById(readingIds);
        java.util.Map<Integer, BillingReading> byId = new java.util.HashMap<>();
        for (BillingReading r : readings) {
            if (r != null) {
                byId.put(r.getId(), r);
            }
        }

        java.util.List<SmsService.BulkSmsRequest> requests = new java.util.ArrayList<>();
        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }
            BillingReading reading = byId.get(id);
            if (reading == null) {
                continue;
            }

            String phoneRaw = null;
            if (reading.getBillingCustomerInfo() != null) {
                phoneRaw = reading.getBillingCustomerInfo().getPhoneNumber();
            }
            String phone = normalizePhoneForSms(phoneRaw);
            if (phone == null) {
                continue;
            }

            String message = buildBillSmsMessage(reading, smsDueDateText, monthYearPart);
            if (message == null || message.isEmpty()) {
                continue;
            }

            // Suppressed per-message logging here
            // logger.info("[BulkSMS] Prepared SMS ...");

            requests.add(new SmsService.BulkSmsRequest(id, phone, message));
        }

        if (requests.isEmpty()) {
            logger.info("[BulkSMS-Silent] No valid SMS requests generated from inputs.");
            return new SmsBulkSendStats(readingIds.size(), 0, 0, 0);
        }

        logger.info("[BulkSMS-Silent] Calling SmsService to send {} messages silently.", requests.size());
        java.util.List<SmsService.BulkSmsResult> results = smsService.sendBulkSmsSilent(requests);
        int sent = 0;
        int failed = 0;
        java.util.Set<Integer> updatedIds = new java.util.HashSet<>();

        for (SmsService.BulkSmsResult res : results) {
            if (res == null) {
                continue;
            }
            Integer id = res.getReadingId();
            if (res.isSuccess()) {
                sent++;
                if (id != null && !updatedIds.contains(id)) {
                    BillingReading r = byId.get(id);
                    if (r != null) {
                        r.setEnableEditMeneshaReading(true); // Re-using this flag as SMS Sent status per billList logic
                        r.setModifiedDate(new Date());
                        updatedIds.add(id);
                    }
                }
            } else {
                failed++;
            }
        }

        if (!updatedIds.isEmpty()) {
            java.util.List<BillingReading> toSave = new java.util.ArrayList<>();
            for (Integer id : updatedIds) {
                BillingReading r = byId.get(id);
                if (r != null) {
                    toSave.add(r);
                }
            }
            if (!toSave.isEmpty()) {
                billingReadingRepository.saveAll(toSave);
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        logger.info("[BulkSMS-Silent] Completed. Total input: {}, Attempted: {}, Sent: {}, Failed: {}, Duration: {}ms",
                readingIds.size(), requests.size(), sent, failed, duration);

        int attempted = requests.size();
        return new SmsBulkSendStats(readingIds.size(), attempted, sent, failed);
    }

    /**
     * Mirrors sendBillSmsInBulkSilent but instead of sending SMS,
     * returns the message and phone data for Excel export.
     * Read-only — no database writes, no SMS sending.
     */
    @Transactional(readOnly = true)
    public java.util.List<BulkSmsExportItemDTO> prepareBillSmsExportData(
            java.util.List<Integer> readingIds,
            String smsDueDateText,
            String monthYearPart) {
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be empty");
        }

        java.util.List<BillingReading> readings = billingReadingRepository.findAllById(readingIds);
        java.util.Map<Integer, BillingReading> byId = new java.util.HashMap<>();
        for (BillingReading r : readings) {
            if (r != null) {
                byId.put(r.getId(), r);
            }
        }

        java.util.List<BulkSmsExportItemDTO> exportItems = new java.util.ArrayList<>();
        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }
            BillingReading reading = byId.get(id);
            if (reading == null) {
                continue;
            }

            String phoneRaw = null;
            String accountNumber = null;
            if (reading.getBillingCustomerInfo() != null) {
                phoneRaw = reading.getBillingCustomerInfo().getPhoneNumber();
                accountNumber = reading.getBillingCustomerInfo().getAccountNumber();
            }
            String phone = normalizePhoneForSms(phoneRaw);
            if (phone == null) {
                continue;
            }

            String message = buildBillSmsMessage(reading, smsDueDateText, monthYearPart);
            if (message == null || message.isEmpty()) {
                continue;
            }

            exportItems.add(new BulkSmsExportItemDTO(
                    accountNumber != null ? accountNumber : "",
                    phone,
                    message));
        }

        return exportItems;
    }

    /**
     * Sends a user-provided direct message to customers identified by readingIds.
     * Unlike sendBillSmsInBulkSilent, this does NOT build the message from bill data
     * and does NOT update the enableEditMeneshaReading (SMS sent) flag.
     */
    public SmsBulkSendStats sendDirectMessageInBulk(java.util.List<Integer> readingIds, String message) {
        long startTime = System.currentTimeMillis();
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be empty");
        }
        if (message == null || message.trim().isEmpty()) {
            throw new IllegalArgumentException("message cannot be empty");
        }
        logger.info("[DirectSMS] Starting direct bulk SMS for {} readings.", readingIds.size());

        java.util.List<BillingReading> readings = billingReadingRepository.findAllById(readingIds);
        java.util.Map<Integer, BillingReading> byId = new java.util.HashMap<>();
        for (BillingReading r : readings) {
            if (r != null) {
                byId.put(r.getId(), r);
            }
        }

        java.util.List<SmsService.BulkSmsRequest> requests = new java.util.ArrayList<>();
        for (Integer id : readingIds) {
            if (id == null) {
                continue;
            }
            BillingReading reading = byId.get(id);
            if (reading == null) {
                continue;
            }

            String phoneRaw = null;
            if (reading.getBillingCustomerInfo() != null) {
                phoneRaw = reading.getBillingCustomerInfo().getPhoneNumber();
            }
            String phone = normalizePhoneForSms(phoneRaw);
            if (phone == null) {
                continue;
            }

            requests.add(new SmsService.BulkSmsRequest(id, phone, message.trim()));
        }

        if (requests.isEmpty()) {
            logger.info("[DirectSMS] No valid SMS requests generated from inputs.");
            return new SmsBulkSendStats(readingIds.size(), 0, 0, 0);
        }

        logger.info("[DirectSMS] Calling SmsService to send {} direct messages.", requests.size());
        java.util.List<SmsService.BulkSmsResult> results = smsService.sendBulkSmsSilent(requests);
        int sent = 0;
        int failed = 0;

        for (SmsService.BulkSmsResult res : results) {
            if (res == null) {
                continue;
            }
            if (res.isSuccess()) {
                sent++;
            } else {
                failed++;
            }
        }
        // NOTE: Intentionally NOT updating enableEditMeneshaReading flag for direct messages

        long duration = System.currentTimeMillis() - startTime;
        logger.info("[DirectSMS] Completed. Total input: {}, Attempted: {}, Sent: {}, Failed: {}, Duration: {}ms",
                readingIds.size(), requests.size(), sent, failed, duration);

        int attempted = requests.size();
        return new SmsBulkSendStats(readingIds.size(), attempted, sent, failed);
    }
}