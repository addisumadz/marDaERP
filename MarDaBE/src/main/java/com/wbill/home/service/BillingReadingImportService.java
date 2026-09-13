package com.wbill.home.service;

import com.wbill.home.model.BillingReading;
import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.BillingCustomerInfoMeter;
import com.wbill.home.model.UserAccount;
import com.wbill.home.model.BillingZeroReadingReason; // Import new model
import com.wbill.home.model.BillingCompanyInformation; // Import new model
import com.wbill.home.repository.BillingReadingRepository;
import com.wbill.home.repository.BillingCustomerInfoRepository;
import com.wbill.home.repository.UserAccountRepository;
import com.wbill.home.repository.BillingZeroReadingReasonRepository; // Import new repository
import com.wbill.home.repository.BillingCompanyInformationRepository; // Import new repository
import com.wbill.home.repository.BillingCustomerInfoMeterRepository;
import com.wbill.home.util.EthiopianCalendarUtil;
import com.wbill.home.dto.ImportReport;
import com.wbill.home.dto.NoPreviousReadingReportEntry;
import com.wbill.home.dto.PreviousReadingDTO;
import com.wbill.home.dto.PreviousReadingBillDTO;
import com.wbill.home.dto.ReadingUpdateDTO;

import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

@Service
public class BillingReadingImportService {

    @Autowired
    private BillingReadingRepository billingReadingRepository;

    @Autowired
    private BillingCustomerInfoRepository billingCustomerInfoRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private BillingZeroReadingReasonRepository billingZeroReadingReasonRepository; // Autowire new repository

    @Autowired
    private BillingCompanyInformationRepository billingCompanyInformationRepository; // Autowire new repository
    private int updatedCount; // Add this
    @Autowired
    private BillingCustomerInfoMeterRepository billingCustomerInfoMeterRepository;

    @Autowired
    private BillingReadingImportRowService importRowService; // Per-row transactional helper

    private int MeterNoUsed;

    /**
     * Imports readings from an Excel file. Each row is processed in its own
     * independent transaction (via importRowService) so that pessimistic locks
     * are acquired and released per-row, preventing "Lock wait timeout" errors.
     *
     * NOTE: No @Transactional here — the outer method is intentionally
     * non-transactional. Each row commits/rolls back independently.
     */
    public ImportReport importReadingsFromExcel(MultipartFile file, String currentKifyaWerString) {
        ImportReport report = new ImportReport();
        String previousKifyaWerString = EthiopianCalendarUtil.getPreviousKifyaWer(currentKifyaWerString);

        // --- Initial setup for default values ---
        Optional<BillingZeroReadingReason> defaultZeroReasonOpt = billingZeroReadingReasonRepository
                .findFirstByIsKotariKirayTrue();
        BillingZeroReadingReason defaultZeroReason = defaultZeroReasonOpt.orElse(null);

        List<BillingCompanyInformation> companyInfoList = billingCompanyInformationRepository.findTopByOrderByIdDesc();
        BillingCompanyInformation companyInfo = companyInfoList.isEmpty() ? null : companyInfoList.get(0);
        // --- End of initial setup ---

        try (InputStream excelFile = file.getInputStream()) {
            Workbook workbook = WorkbookFactory.create(excelFile);
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            if (rowIterator.hasNext()) {
                rowIterator.next(); // Skip header row
            }

            while (rowIterator.hasNext()) {
                Row currentRow = rowIterator.next();
                int rowNum = currentRow.getRowNum() + 1;
                String customerAccountNumber = null;

                try {
                    DataFormatter formatter = new DataFormatter();
                    customerAccountNumber = formatter.formatCellValue(currentRow.getCell(0)).trim();
                    Cell readingCell = currentRow.getCell(1);
                    if (readingCell == null)
                        throw new IllegalStateException("Reading value is missing.");
                    int currentReading = (int) readingCell.getNumericCellValue();

                    // Delegate to per-row transactional service (REQUIRES_NEW)
                    // Each row gets its own short-lived transaction & lock
                    BillingReadingImportRowService.RowResult result = importRowService.processRow(
                            customerAccountNumber,
                            currentReading,
                            currentKifyaWerString,
                            previousKifyaWerString,
                            defaultZeroReason,
                            companyInfo);

                    if (result.isSuccess()) {
                        report.setSuccessCount(report.getSuccessCount() + 1);
                        if (result.isUpdated()) {
                            report.setUpdatedCount(report.getUpdatedCount() + 1);
                        }
                        report.getImportLogs().add("Row " + rowNum + ": " + result.getMessage());
                    }

                } catch (Exception e) {
                    // Per-row errors are caught here; the loop continues with the next row
                    String errorMsg = "Row " + rowNum + " (Account: " + customerAccountNumber + "): " + e.getMessage();
                    report.getImportLogs().add(errorMsg);
                    report.setFailedCount(report.getFailedCount() + 1);
                }
            }
        } catch (Exception e) {
            // Fatal errors (e.g., cannot read the file at all)
            handleFatalError(e, report);
            return report;
        }

        report.getImportLogs().add(0, generateSummary(report));
        return report;
    }

    // =============== function for bill calculation ==========================
    /**
     * Try to update an existing reading.
     * If updated, returns the updated BillingReading, otherwise empty.
     */
    private Optional<BillingReading> updateReadingIfExists(
            BillingCustomerInfo customer,
            int currentReading,
            String currentKifyaWerString) {

        Optional<BillingReading> existingReadingOpt = billingReadingRepository
                .findByBillingCustomerInfoAndKifyaWerAndStatusOrderByCollectionDateDesc(customer, currentKifyaWerString,
                        "active");

        if (existingReadingOpt.isPresent()) {
            BillingReading toUpdate = existingReadingOpt.get();
            int newConsumption = currentReading - toUpdate.getPreviousReading();
            if (newConsumption < 0) {
                throw new IllegalStateException("Update results in negative consumption (" + newConsumption + ").");
            }

            toUpdate.setLastReading(currentReading);
            toUpdate.setConsumption(newConsumption);
            toUpdate.setModifiedDate(new Date());
            toUpdate.setCollectionDate(new Date());

            return Optional.of(toUpdate);
        }

        return Optional.empty();
    }

    /**
     * Always creates a new reading with full logic (consumption, zero reading,
     * yeteganene, etc.)
     */
    private BillingReading createNewReading(
            BillingCustomerInfo customer,
            int currentReading,
            String currentKifyaWerString,
            String previousKifyaWerString,
            BillingZeroReadingReason defaultZeroReason,
            BillingCompanyInformation companyInfo) {

        BillingReading newReading = new BillingReading();
        // System.out.println("new reading creat 3 "+newReading.getConsumption());

        int previousReading = getPreviousReadingForCustomer(customer.getAccountNumber(), currentKifyaWerString);
        int consumption = currentReading - previousReading;

        if (consumption < 0) {
            throw new IllegalStateException("New reading results in negative consumption (" + consumption + ").");
        }

        newReading.setBillingCustomerInfo(customer);
        newReading.setKifyaWer(currentKifyaWerString);
        newReading.setPreviousReading(previousReading);
        newReading.setLastReading(currentReading);
        newReading.setConsumption(consumption);
        newReading.setCollectionDate(new Date());
        newReading.setRegisteredDate(new Date());
        newReading.setModifiedDate(new Date());
        newReading.setStatus("active");
        newReading.setConsumptionWuzifYalefew(0);
        newReading.setConsumptionWuzif(0);

        // --- Zero Reading Logic ---
        if (newReading.getConsumption() == 0) {
            newReading.setZeroOccurred(true);
            if (newReading.getBillingZeroReadingReason() == null && defaultZeroReason != null) {
                newReading.setBillingZeroReadingReason(defaultZeroReason);
            }
            Optional<BillingReading> prevReadingForZeroBzatOpt = billingReadingRepository
                    .findFullReadingByCustomerIdAndKifyaWer(customer.getId(), previousKifyaWerString);
            if (prevReadingForZeroBzatOpt.isPresent()) {
                BillingReading prevReadingForZeroBzat = prevReadingForZeroBzatOpt.get();
                newReading.setZeroReadingWorBzat(prevReadingForZeroBzat.getZeroReadingWorBzat() + 1);
            } else {
                newReading.setZeroReadingWorBzat(1);
            }
        } else {
            newReading.setZeroOccurred(false);
            newReading.setBillingZeroReadingReason(null);
            newReading.setZeroReadingWorBzat(0);
        }

        // --- Meter ---
        if (MeterNoUsed != 0) {
            BillingCustomerInfoMeter meter = billingCustomerInfoMeterRepository.findById(MeterNoUsed)
                    .orElseThrow(() -> new EntityNotFoundException("Meter not found with id: " + MeterNoUsed));
            newReading.setBillingCustomerInfoMeter(meter);
        } else {
            newReading.setBillingCustomerInfoMeter(null);
        }
        newReading.setMobileReaderUser(null);
        newReading.setModifiedByUser(null);

        // --- Yeteganene ---
        if (newReading.getConsumption() != 0.0 && companyInfo != null) {
            double average = (customer.getInitialConsumption() != null) ? customer.getInitialConsumption() : 0;
            if (average != 0) {
                boolean isYeteganene = ((average * (companyInfo.getYeteganenePercent() / 100.0))
                        + average) <= newReading.getConsumption();
                newReading.setYeteganene(isYeteganene);
            } else {
                newReading.setYeteganene(false);
            }
        } else {
            newReading.setYeteganene(false);
        }
        // System.out.println("new reading final "+newReading.getConsumption());
        return newReading;
    }

    // ==========================================================================

    // ============================manual reading insert =================

    @Transactional
    public BillingReading createReading(ReadingUpdateDTO dto) {
        BillingCustomerInfo customer = billingCustomerInfoRepository
                .findActiveByAccountNumberForUpdate(dto.getCustomerAccountNumber())
                .orElseThrow(() -> new RuntimeException(
                        "Customer not found with account: " + dto.getCustomerAccountNumber()));
        System.out.println("new reading test 2 " + dto.getCustomerAccountNumber());

        // billingReadingRepository.findByBillingCustomerInfoAndKifyaWer(customer,
        // dto.getKifyaWer())
        // .ifPresent(r -> { throw new RuntimeException("Reading for this period already
        // exists."); });

        String previousKifyaWer = EthiopianCalendarUtil.getPreviousKifyaWer(dto.getKifyaWer());
        Optional<BillingZeroReadingReason> defaultZeroReasonOpt = billingZeroReadingReasonRepository
                .findFirstByIsKotariKirayTrue();
        BillingZeroReadingReason defaultZeroReason = defaultZeroReasonOpt.orElse(null);

        List<BillingCompanyInformation> companyInfoList = billingCompanyInformationRepository.findTopByOrderByIdDesc();
        BillingCompanyInformation companyInfo = companyInfoList.isEmpty() ? null : companyInfoList.get(0);

        // System.out.println("new reading test 2 update bf "+dto.getKifyaWer()+"
        // "+dto.getLastReading());

        // Check and update existing reading for the CURRENT kifyaWer
        Optional<BillingReading> updatedOpt = updateReadingIfExists(customer, dto.getLastReading(), dto.getKifyaWer());
        updatedOpt.ifPresent(
                u -> System.out.println("new reading test 2 update af " + u.getLastReading() + " " + u.getKifyaWer()));

        if (updatedOpt.isPresent()) {
            // System.out.println("new reading test 2 update
            // "+updatedOpt.get().getBillingCustomerInfo().getAccountNumber());

            BillingReading updated = updatedOpt.get();
            if (dto.getReaderGps() != null) {
                updated.setReaderGps(dto.getReaderGps());
            }
            return billingReadingRepository.save(updated);
        } else {
            BillingReading newReading = createNewReading(customer,
                    dto.getLastReading(),
                    dto.getKifyaWer(),
                    previousKifyaWer,
                    defaultZeroReason,
                    companyInfo);

            // If a specific zero reason is provided in the DTO, override the default
            if (dto.getZeroReadingReasonId() != null && newReading.getConsumption() == 0) {
                Optional<BillingZeroReadingReason> reasonOpt = billingZeroReadingReasonRepository
                        .findById(dto.getZeroReadingReasonId());
                if (reasonOpt.isPresent()) {
                    newReading.setBillingZeroReadingReason(reasonOpt.get());
                }
            }

            // Set reader GPS if provided
            if (dto.getReaderGps() != null) {
                newReading.setReaderGps(dto.getReaderGps());
            }

            // System.out.println("last save reading "+newReading.getConsumption());
            if (customer.getIsInitializedSecondTime()) {
                customer.setIsInitializedSecondTime(false);
                billingCustomerInfoRepository.save(customer);
            }
            return billingReadingRepository.save(newReading);
        }

    }

    @Transactional
    public List<String> createReadingsBulk(List<ReadingUpdateDTO> readingDTOs) {
        List<String> results = new ArrayList<>();
        for (ReadingUpdateDTO dto : readingDTOs) {
            String accountIdentifier = dto.getCustomerAccountNumber();
            try {
                createReading(dto);
                results.add("Success: " + accountIdentifier);
            } catch (Exception e) {
                results.add("Failed: " + accountIdentifier + " - " + e.getMessage());
                // We purposefully continue to process the rest of the batch
                // If strictly transactional (all-or-nothing) is desired, rethrow e.
            }
        }
        return results;
    }

    // =====================================================================

    // Helper methods
    private void handleDataIntegrityError(DataIntegrityViolationException e, ImportReport report, int rowNum) {
        String errorMsg = "DATA ERROR: Row " + rowNum + ": ";
        if (e.getRootCause() != null) {
            errorMsg += e.getRootCause().getMessage();
            // Special handling for common constraints
            if (e.getRootCause().getMessage().contains("foreign key")) {
                errorMsg += " (Verify customer exists)";
            } else if (e.getRootCause().getMessage().contains("unique constraint")) {
                errorMsg += " (Duplicate reading for this period)";
            }
        } else {
            errorMsg += e.getMessage();
        }

        report.getImportLogs().add(errorMsg);
        report.setFailedCount(report.getFailedCount() + 1);
        e.printStackTrace(); // Log full stack trace for debugging
    }

    private void handleGeneralError(Exception e, ImportReport report, int rowNum) {
        String errorMsg = "Row " + rowNum + " error: " + e.getClass().getSimpleName();
        if (e.getMessage() != null) {
            errorMsg += " - " + e.getMessage();
        }
        report.getImportLogs().add(errorMsg);
        report.setFailedCount(report.getFailedCount() + 1);
    }

    private void handleFatalError(Exception e, ImportReport report) {
        String errorMsg = "FATAL: " + e.getClass().getSimpleName();
        if (e.getCause() != null) {
            errorMsg += " - " + e.getCause().getMessage();
        } else if (e.getMessage() != null) {
            errorMsg += " - " + e.getMessage();
        }
        report.getImportLogs().add(0, errorMsg);
    }

    private String generateSummary(ImportReport report) {
        return String.format("Import completed. Success: %d, Failed: %d, Total: %d",
                report.getSuccessCount(),
                report.getFailedCount(),
                report.getSuccessCount() + report.getFailedCount());
    }

    public int getPreviousReadingForCustomer(String accountNumber, String currentKifyaWer) {
        // 1. Find the customer entity
        BillingCustomerInfo customer = billingCustomerInfoRepository.findActiveByAccountNumber(accountNumber)
                .orElseThrow(
                        () -> new EntityNotFoundException("Customer not found with account number: " + accountNumber));

        // ✅ SOLUTION 1: Check the flag FIRST.
        if (customer.getIsInitializedSecondTime()) {
            // If the flag is true, a meter was recently changed. The previous reading MUST
            // be
            // the new meter's initial reading. We ignore all other past readings.
            Optional<BillingCustomerInfoMeter> latestActiveMeterOpt = billingCustomerInfoMeterRepository
                    .findFirstByBillingCustomerInfoAndActiveMeterIsTrueAndDeletedOrderByRegisteredDateDesc(customer,
                            "active");

            if (latestActiveMeterOpt.isPresent()) {
                // System.out.println("metere option 1");
                MeterNoUsed = latestActiveMeterOpt.get().getId();
                return latestActiveMeterOpt.get().getInitialReading();

            } else {
                throw new EntityNotFoundException(
                        "CRITICAL: A meter change was flagged, but no active meter was found for customer: "
                                + accountNumber);
            }
        } else {
            // If the flag is false, proceed with the normal fallback logic.
            String previousKifyaWerString = EthiopianCalendarUtil.getPreviousKifyaWer(currentKifyaWer);

            // Step 1: Check immediate previous month
            Optional<BillingReading> immediatePreviousReadingOpt = billingReadingRepository
                    .findFirstByBillingCustomerInfoAndKifyaWerOrderByRegisteredDateDesc(customer,
                            previousKifyaWerString);

            // if (immediatePreviousReadingOpt.isPresent()) {
            // //System.out.println("metere option 2");
            // MeterNoUsed=immediatePreviousReadingOpt.get().getBillingCustomerInfoMeter().getId();
            // return immediatePreviousReadingOpt.get().getLastReading();
            // }
            if (immediatePreviousReadingOpt.isPresent()) {
                BillingReading prev = immediatePreviousReadingOpt.get();
                if (prev.getBillingCustomerInfoMeter() != null) {
                    MeterNoUsed = prev.getBillingCustomerInfoMeter().getId();
                } else {
                    MeterNoUsed = 0; // ❌ null meter → mark as 0
                }
                return prev.getLastReading();
            }

            // Step 2: Check absolute latest reading
            Optional<BillingReading> absoluteLatestReadingOpt = billingReadingRepository
                    .findFirstByBillingCustomerInfoOrderByRegisteredDateDesc(customer);
            // if (absoluteLatestReadingOpt.isPresent()) {
            // //System.out.println("metere option 3");
            // MeterNoUsed=absoluteLatestReadingOpt.get().getBillingCustomerInfoMeter().getId();
            // return absoluteLatestReadingOpt.get().getLastReading();
            // }

            if (absoluteLatestReadingOpt.isPresent()) {
                BillingReading prev = absoluteLatestReadingOpt.get();
                if (prev.getBillingCustomerInfoMeter() != null) {
                    MeterNoUsed = prev.getBillingCustomerInfoMeter().getId();
                } else {
                    MeterNoUsed = 0; // ❌ null meter → mark as 0
                }
                return prev.getLastReading();
            }

            // Step 3: Fallback to the active meter's initial reading if no readings exist
            // at all
            Optional<BillingCustomerInfoMeter> latestActiveMeterOpt = billingCustomerInfoMeterRepository
                    .findFirstByBillingCustomerInfoAndActiveMeterIsTrueAndDeletedOrderByRegisteredDateDesc(customer,
                            "active");
            if (latestActiveMeterOpt.isPresent()) {
                // System.out.println("metere option 4");
                MeterNoUsed = latestActiveMeterOpt.get().getId();
                return latestActiveMeterOpt.get().getInitialReading();
            }

            throw new EntityNotFoundException(
                    "CRITICAL: No previous readings or active meter found for customer: " + accountNumber);
        }
    }

    public int getPreviousReadingForCustomerOnly(String accountNumber, String currentKifyaWer) {
        // 1. Find the customer entity
        BillingCustomerInfo customer = billingCustomerInfoRepository.findActiveByAccountNumber(accountNumber)
                .orElseThrow(
                        () -> new EntityNotFoundException("Customer not found with account number: " + accountNumber));

        // ✅ SOLUTION 1: Check the flag FIRST.
        if (customer.getIsInitializedSecondTime()) {
            // If the flag is true, a meter was recently changed. The previous reading MUST
            // be
            // the new meter's initial reading. We ignore all other past readings.
            Optional<BillingCustomerInfoMeter> latestActiveMeterOpt = billingCustomerInfoMeterRepository
                    .findFirstByBillingCustomerInfoAndActiveMeterIsTrueAndDeletedOrderByRegisteredDateDesc(customer,
                            "active");

            if (latestActiveMeterOpt.isPresent()) {
                // MeterNoUsed=latestActiveMeterOpt.get().getId();
                return latestActiveMeterOpt.get().getInitialReading();

            } else {
                throw new EntityNotFoundException(
                        "CRITICAL: A meter change was flagged, but no active meter was found for customer: "
                                + accountNumber);
            }
        } else {
            // If the flag is false, proceed with the normal fallback logic.
            String previousKifyaWerString = EthiopianCalendarUtil.getPreviousKifyaWer(currentKifyaWer);

            // Step 1: Check immediate previous month
            Optional<BillingReading> immediatePreviousReadingOpt = billingReadingRepository
                    .findFirstByBillingCustomerInfoAndKifyaWerOrderByRegisteredDateDesc(customer,
                            previousKifyaWerString);

            if (immediatePreviousReadingOpt.isPresent()) {
                // MeterNoUsed=immediatePreviousReadingOpt.get().getBillingCustomerInfoMeter().getId();
                return immediatePreviousReadingOpt.get().getLastReading();
            }

            // Step 2: Check absolute latest reading
            Optional<BillingReading> absoluteLatestReadingOpt = billingReadingRepository
                    .findFirstByBillingCustomerInfoOrderByRegisteredDateDesc(customer);
            if (absoluteLatestReadingOpt.isPresent()) {
                // MeterNoUsed=absoluteLatestReadingOpt.get().getBillingCustomerInfoMeter().getId();
                return absoluteLatestReadingOpt.get().getLastReading();
            }

            // Step 3: Fallback to the active meter's initial reading if no readings exist
            // at all
            Optional<BillingCustomerInfoMeter> latestActiveMeterOpt = billingCustomerInfoMeterRepository
                    .findFirstByBillingCustomerInfoAndActiveMeterIsTrueAndDeletedOrderByRegisteredDateDesc(customer,
                            "active");
            if (latestActiveMeterOpt.isPresent()) {
                // MeterNoUsed=latestActiveMeterOpt.get().getId();
                return latestActiveMeterOpt.get().getInitialReading();
            }

            throw new EntityNotFoundException(
                    "CRITICAL: No previous readings or active meter found for customer: " + accountNumber);
        }
    }

    public PreviousReadingBillDTO getPreviousReadingForCustomerOnlybill(String accountNumber, String currentKifyaWer) {
        // 1. Find the customer entity
        BillingCustomerInfo customer = billingCustomerInfoRepository.findActiveByAccountNumber(accountNumber)
                .orElseThrow(
                        () -> new EntityNotFoundException("Customer not found with account number: " + accountNumber));

        // If meter change flagged, previous = active meter's initial reading,
        // consumption = 0, meterChanged = true
        if (customer.getIsInitializedSecondTime()) {
            Optional<BillingCustomerInfoMeter> latestActiveMeterOpt = billingCustomerInfoMeterRepository
                    .findFirstByBillingCustomerInfoAndActiveMeterIsTrueAndDeletedOrderByRegisteredDateDesc(customer,
                            "active");
            if (latestActiveMeterOpt.isPresent()) {
                int previousReading = latestActiveMeterOpt.get().getInitialReading();
                int prevConsumption = 0;
                // =====================================================================

                String previousKifyaWerString = EthiopianCalendarUtil.getPreviousKifyaWer(currentKifyaWer);
                Optional<BillingReading> immediatePreviousReadingOpt = billingReadingRepository
                        .findFirstByBillingCustomerInfoAndKifyaWerOrderByRegisteredDateDesc(customer,
                                previousKifyaWerString);
                if (immediatePreviousReadingOpt.isPresent()) {
                    BillingReading prev = immediatePreviousReadingOpt.get();
                    // int prevReadingValue = prev.getLastReading();
                    prevConsumption = prev.getConsumption();
                    // return new PreviousReadingBillDTO(prevReadingValue, prevConsumption, false);
                } else {
                    Optional<BillingReading> absoluteLatestReadingOpt = billingReadingRepository
                            .findFirstByBillingCustomerInfoOrderByRegisteredDateDesc(customer);
                    if (absoluteLatestReadingOpt.isPresent()) {
                        BillingReading prev = absoluteLatestReadingOpt.get();
                        // int prevReadingValue = prev.getLastReading();
                        prevConsumption = prev.getConsumption();
                        // return new PreviousReadingBillDTO(prevReadingValue, prevConsumption, false);
                    }
                }

                // =====================================================

                return new PreviousReadingBillDTO(previousReading, prevConsumption, true);
            } else {
                throw new EntityNotFoundException(
                        "CRITICAL: A meter change was flagged, but no active meter was found for customer: "
                                + accountNumber);
            }
        }

        // Otherwise, try immediate previous period
        String previousKifyaWerString = EthiopianCalendarUtil.getPreviousKifyaWer(currentKifyaWer);
        Optional<BillingReading> immediatePreviousReadingOpt = billingReadingRepository
                .findFirstByBillingCustomerInfoAndKifyaWerOrderByRegisteredDateDesc(customer, previousKifyaWerString);
        if (immediatePreviousReadingOpt.isPresent()) {
            BillingReading prev = immediatePreviousReadingOpt.get();
            int prevReadingValue = prev.getLastReading();
            int prevConsumption = prev.getConsumption();
            return new PreviousReadingBillDTO(prevReadingValue, prevConsumption, false);
        }

        // Fallback: absolute latest reading
        Optional<BillingReading> absoluteLatestReadingOpt = billingReadingRepository
                .findFirstByBillingCustomerInfoOrderByRegisteredDateDesc(customer);
        if (absoluteLatestReadingOpt.isPresent()) {
            BillingReading prev = absoluteLatestReadingOpt.get();
            int prevReadingValue = prev.getLastReading();
            int prevConsumption = prev.getConsumption();
            return new PreviousReadingBillDTO(prevReadingValue, prevConsumption, false);
        }

        // Final fallback: active meter initial reading, with consumption 0
        Optional<BillingCustomerInfoMeter> latestActiveMeterOpt = billingCustomerInfoMeterRepository
                .findFirstByBillingCustomerInfoAndActiveMeterIsTrueAndDeletedOrderByRegisteredDateDesc(customer,
                        "active");
        if (latestActiveMeterOpt.isPresent()) {
            int previousReading = latestActiveMeterOpt.get().getInitialReading();
            return new PreviousReadingBillDTO(previousReading, 0, false);
        }

        throw new EntityNotFoundException(
                "CRITICAL: No previous readings or active meter found for customer: " + accountNumber);
    }

    /**
     * Process a single customer's reading according to the selected bulk strategy:
     * - "repeat": proposes lastReading = previousReading (0 consumption)
     * - "lastMonth": proposes lastReading = previousReading + lastMonthConsumption
     * - "average": proposes lastReading = previousReading + initialConsumption
     */
    public BillingReadingImportRowService.RowResult processBulkStrategyRow(
            String customerAccountNumber,
            String currentKifyaWerString,
            String previousKifyaWerString,
            String strategy,
            BillingZeroReadingReason defaultZeroReason,
            BillingCompanyInformation companyInfo) {

        int proposedReading;
        if ("repeat".equalsIgnoreCase(strategy)) {
            int previousReading = getPreviousReadingForCustomerOnly(customerAccountNumber, currentKifyaWerString);
            proposedReading = previousReading;
        } else if ("lastMonth".equalsIgnoreCase(strategy)) {
            PreviousReadingBillDTO info = getPreviousReadingForCustomerOnlybill(customerAccountNumber, currentKifyaWerString);
            int previousReading = info.getPreviousReading();
            int lastMonthCons = Math.max(0, info.getConsumption());
            proposedReading = previousReading + lastMonthCons;
        } else if ("average".equalsIgnoreCase(strategy)) {
            PreviousReadingBillDTO info = getPreviousReadingForCustomerOnlybill(customerAccountNumber, currentKifyaWerString);
            int previousReading = info.getPreviousReading();
            BillingCustomerInfo customer = billingCustomerInfoRepository.findActiveByAccountNumber(customerAccountNumber)
                    .orElseThrow(() -> new EntityNotFoundException("Customer not found with account: " + customerAccountNumber));
            int initialCons = customer.getInitialConsumption() != null ? (int) Math.max(0, Math.floor(customer.getInitialConsumption())) : 0;
            proposedReading = previousReading + initialCons;
        } else {
            throw new IllegalArgumentException("Unknown strategy: " + strategy);
        }

        return importRowService.processRow(
                customerAccountNumber,
                proposedReading,
                currentKifyaWerString,
                previousKifyaWerString,
                defaultZeroReason,
                companyInfo);
    }

    /**
     * Executes bulk strategy processing asynchronously over a list of account numbers,
     * updating ProgressService after each item.
     */
    public void processBulkStrategyAsync(
            String jobId,
            List<String> accountNumbers,
            String currentKifyaWerString,
            String strategy,
            ProgressService progressService) {

        String previousKifyaWerString = EthiopianCalendarUtil.getPreviousKifyaWer(currentKifyaWerString);
        Optional<BillingZeroReadingReason> defaultZeroReasonOpt = billingZeroReadingReasonRepository
                .findFirstByIsKotariKirayTrue();
        BillingZeroReadingReason defaultZeroReason = defaultZeroReasonOpt.orElse(null);

        List<BillingCompanyInformation> companyInfoList = billingCompanyInformationRepository.findTopByOrderByIdDesc();
        BillingCompanyInformation companyInfo = companyInfoList.isEmpty() ? null : companyInfoList.get(0);

        int successCount = 0;
        int failCount = 0;

        for (String accountNumber : accountNumbers) {
            if (accountNumber == null || accountNumber.trim().isEmpty()) {
                progressService.incrementProcessed(jobId);
                continue;
            }
            accountNumber = accountNumber.trim();
            try {
                BillingReadingImportRowService.RowResult res = processBulkStrategyRow(
                        accountNumber,
                        currentKifyaWerString,
                        previousKifyaWerString,
                        strategy,
                        defaultZeroReason,
                        companyInfo);

                if (res.isSuccess()) {
                    successCount++;
                    progressService.addLog(jobId, "Account " + accountNumber + ": " + res.getMessage());
                } else {
                    failCount++;
                    progressService.addLog(jobId, "Account " + accountNumber + " failed: " + res.getMessage());
                }
            } catch (Exception ex) {
                failCount++;
                progressService.addLog(jobId, "Account " + accountNumber + " error: " + ex.getMessage());
            } finally {
                progressService.incrementProcessed(jobId);
            }
        }

        String summary = String.format("Completed: %d succeeded, %d failed out of %d", successCount, failCount, accountNumbers.size());
        progressService.markDone(jobId, summary);
    }

}