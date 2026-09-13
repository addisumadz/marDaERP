package com.wbill.home.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import com.wbill.home.dto.ImportReport;
import com.wbill.home.dto.NoPreviousReadingReportEntry;
import com.wbill.home.dto.BankPaymentUpdateDTO;
import com.wbill.home.dto.BulkBankPaymentUpdateRequestDTO;
import com.wbill.home.dto.BulkUpdateResponseDTO;
import com.wbill.home.dto.UnicashPaymentUpdateDTO;
import com.wbill.home.dto.BulkUnicashPaymentUpdateRequestDTO;
import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.BillingReading;
import com.wbill.home.model.BillingBanks;
import com.wbill.home.repository.BillingCustomerInfoRepository;
import com.wbill.home.repository.BillingReadingRepository;
import com.wbill.home.repository.BillingBanksRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class BankPaymentImportService {

    private final BillingReadingRepository readingRepository;
    private final BillingCustomerInfoRepository customerRepository;
    private final BillingBanksRepository billingBanksRepository;
    private final WuzifService wuzifService;
    private final BillingCustomerInfoService billingCustomerInfoService;
    private final ApplicationEventPublisher eventPublisher;

    public BankPaymentImportService(BillingReadingRepository readingRepository,
            BillingCustomerInfoRepository customerRepository,
            BillingBanksRepository billingBanksRepository,
            WuzifService wuzifService,
            BillingCustomerInfoService billingCustomerInfoService,
            ApplicationEventPublisher eventPublisher) {
        this.readingRepository = readingRepository;
        this.customerRepository = customerRepository;
        this.billingBanksRepository = billingBanksRepository;
        this.wuzifService = wuzifService;
        this.billingCustomerInfoService = billingCustomerInfoService;
        this.eventPublisher = eventPublisher;
    }

    public ImportReport importPaymentsFromCsv(MultipartFile file, String kifyaWer) throws Exception {
        ImportReport report = new ImportReport();
        int success = 0, failed = 0, updated = 0, skipped = 0;

        if (file == null || file.isEmpty()) {
            report.getImportLogs().add("ERROR: Empty file.");
            return report;
        }

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
                CSVReader csv = new CSVReader(reader)) {

            String[] header = csv.readNext();
            if (header == null) {
                report.getImportLogs().add("ERROR: CSV has no header row.");
                return report;
            }

            Map<String, Integer> idx = mapHeader(header);
            // Expected columns (case-insensitive):
            // bill_data_file_id, bill_id, bill_reason, customer_id, customer_name,
            // paid_amount, paid_date, agent_name, agent_confirmation_code

            String[] row;
            int rowNum = 1; // header counted as 1
            while ((row = csv.readNext()) != null) {
                rowNum++;
                try {
                    String accountNumber = get(row, idx, "customer_id");
                    String billIdStr = get(row, idx, "bill_id"); // optional
                    String agentName = get(row, idx, "agent_name");
                    String confirmCode = get(row, idx, "agent_confirmation_code");
                    String paidAmountStr = get(row, idx, "paid_amount");
                    String paidDateStr = get(row, idx, "paid_date");

                    if (isBlank(accountNumber)) {
                        report.getImportLogs().add("WARN: Row " + rowNum + ": Missing customer_id. Skipped.");
                        skipped++;
                        continue;
                    }

                    Optional<BillingCustomerInfo> custOpt = customerRepository
                            .findByAccountNumber(accountNumber.trim());
                    if (custOpt.isEmpty()) {
                        report.getImportLogs().add(
                                "ERROR: Row " + rowNum + ": Customer not found for account " + accountNumber + ".");
                        failed++;
                        continue;
                    }
                    BillingCustomerInfo customer = custOpt.get();

                    Optional<BillingReading> readingOpt = readingRepository
                            .findFirstByBillingCustomerInfoAndKifyaWerOrderByRegisteredDateDesc(customer, kifyaWer);
                    if (readingOpt.isEmpty()) {
                        // Fallback to latest reading regardless of month
                        readingOpt = readingRepository
                                .findFirstByBillingCustomerInfoOrderByRegisteredDateDesc(customer);
                    }
                    if (readingOpt.isEmpty()) {
                        report.getImportLogs().add("ERROR: Row " + rowNum + ": No reading found for customer "
                                + accountNumber + " (kifyaWer=" + kifyaWer + ").");
                        failed++;
                        continue;
                    }

                    BillingReading reading = readingOpt.get();

                    // 1) Must be bill generated
                    if (!reading.isBillGenerated()) {
                        String reason = "Bill not generated for customer " + accountNumber + ", kifyaWer="
                                + reading.getKifyaWer();
                        report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                        report.getNoPreviousReadingEntries()
                                .add(new NoPreviousReadingReportEntry(accountNumber, reason));
                        skipped++;
                        continue;
                    }

                    Date paidDate = parseDateFlexible(paidDateStr);
                    Double paidAmount = parseDoubleSafe(paidAmountStr);

                    // 2) bill_id (CSV) must match BillingInvoiceNumbers.invoiceNumbers of the
                    // reading
                    if (isBlank(billIdStr)) {
                        String reason = "Missing bill_id in CSV";
                        report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                        report.getNoPreviousReadingEntries()
                                .add(new NoPreviousReadingReportEntry(accountNumber, reason));
                        skipped++;
                        continue;
                    }
                    String billIdCsv = billIdStr.trim();
                    if (reading.getBillingInvoiceNumbers() == null) {
                        String reason = "Reading has no invoice_number_id to compare";
                        report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                        report.getNoPreviousReadingEntries()
                                .add(new NoPreviousReadingReportEntry(accountNumber, reason));
                        skipped++;
                        continue;
                    }
                    String dbInvoice = reading.getBillingInvoiceNumbers().getInvoiceNumbers();
                    if (dbInvoice == null || !dbInvoice.trim().equals(billIdCsv)) {
                        String reason = "bill_id mismatch (CSV=" + billIdCsv + ", DB=" + dbInvoice + ")";
                        report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                        report.getNoPreviousReadingEntries()
                                .add(new NoPreviousReadingReportEntry(accountNumber, reason));
                        skipped++;
                        continue;
                    }

                    // 3) paid_amount (CSV) must match tekilalaTekefay
                    if (paidAmount == null) {
                        String reason = "Missing or invalid paid_amount in CSV";
                        report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                        report.getNoPreviousReadingEntries()
                                .add(new NoPreviousReadingReportEntry(accountNumber, reason));
                        skipped++;
                        continue;
                    }
                    double expected = reading.getTekilalaTekefay();
                    double diff = Math.abs(expected - paidAmount);
                    if (diff > 0.01d) { // allow tiny rounding tolerance
                        String reason = "Bill Payment difference: CSV amount " + paidAmount + " != Bill amount "
                                + expected;
                        System.err.println("ERROR: Row " + rowNum + " - " + reason + " for account " + accountNumber
                                + ", bill ID " + reading.getId());
                        report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                        report.getNoPreviousReadingEntries()
                                .add(new NoPreviousReadingReportEntry(accountNumber, reason));
                        skipped++;
                        continue;
                    }

                    // Update payment-related fields
                    reading.setPaidThroughBank(true);
                    reading.setDerashPaid(true);
                    reading.setMoneyCollected(true);
                    if (paidDate != null) {
                        reading.setMoneyCollectedDate(paidDate);
                    }
                    // Set bank paid amounts
                    reading.setTekilalaBankYetekefele(paidAmount);
                    reading.setTekilalaYetekefele(reading.getKecreditYetekefele() + paidAmount);

                    // Lookup and validate bank information - SKIP if bank not found
                    if (!isBlank(agentName)) {
                        BillingBanks bank = lookupBankByAgentName(agentName.trim());
                        if (bank != null) {
                            reading.setBankPaidAgentId(bank.getBankName()); // Set bank name instead of agent code
                            reading.setBillingBanks(bank); // Set the bank relationship
                            System.out.println("Bank lookup successful: " + agentName + " -> " + bank.getBankName());
                        } else {
                            // SKIP this record if bank not found
                            String reason = "Bank not found: Agent \"" + agentName
                                    + "\" does not match any bank in database";
                            System.err
                                    .println("ERROR: Row " + rowNum + " - " + reason + " for account " + accountNumber);
                            report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                            report.getNoPreviousReadingEntries()
                                    .add(new NoPreviousReadingReportEntry(accountNumber, reason));
                            skipped++;
                            continue;
                        }
                    } else {
                        // SKIP if agent_name is missing
                        String reason = "Missing agent_name (bank information required)";
                        System.err.println("ERROR: Row " + rowNum + " - " + reason + " for account " + accountNumber);
                        report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                        report.getNoPreviousReadingEntries()
                                .add(new NoPreviousReadingReportEntry(accountNumber, reason));
                        skipped++;
                        continue;
                    }
                    if (!isBlank(confirmCode)) {
                        reading.setBankPaidConfirmationCode(confirmCode.trim());
                    }

                    // Check if customer has old penalty and set isOldPenalityPaidInThisMonth=true
                    if (!customer.getOldIfPenaltyPaid() && customer.getOldHasPenalty()) {
                        reading.setOldPenalityPaidInThisMonth(true);
                    }

                    reading.setModifiedDate(new Date());

                    BillingReading savedReading = readingRepository.save(reading);

                    // Process wuzif and penalty logic after successful payment
                    processPaymentRelatedUpdates(savedReading);

                    success++;
                    updated++;

                    StringBuilder ok = new StringBuilder();
                    ok.append("OK: Row ").append(rowNum).append(": Payment recorded for account ")
                            .append(accountNumber);
                    if (billIdStr != null && !billIdStr.trim().isEmpty()) {
                        ok.append(" (bill_id=").append(billIdStr.trim()).append(")");
                    }
                    if (paidAmount != null) {
                        ok.append(", amount=").append(paidAmount);
                    }
                    report.getImportLogs().add(ok.append('.').toString());
                } catch (Exception ex) {
                    failed++;
                    report.getImportLogs().add("ERROR: Row " + rowNum + ": " + ex.getMessage());
                }
            }
        } catch (CsvValidationException e) {
            report.getImportLogs().add("ERROR: Invalid CSV format: " + e.getMessage());
            failed++;
        }

        report.setSuccessCount(success);
        report.setFailedCount(failed);
        report.setUpdatedCount(updated);
        report.setSkippedCount(skipped);
        return report;
    }

    private static Map<String, Integer> mapHeader(String[] header) {
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < header.length; i++) {
            if (header[i] != null) {
                map.put(header[i].trim().toLowerCase(Locale.ROOT), i);
            }
        }
        return map;
    }

    private static String get(String[] row, Map<String, Integer> idx, String key) {
        Integer i = idx.get(key);
        if (i == null || i < 0 || i >= row.length)
            return null;
        return row[i];
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private static Double parseDoubleSafe(String s) {
        try {
            if (isBlank(s))
                return null;
            String normalized = s.trim().replace(",", ""); // ignore thousands separators like 1,475.00
            return Double.parseDouble(normalized);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // ==== Helper: Bank lookup cache to avoid repeated DB queries per item ====
    private static class BankLookupCache {
        Map<String, BillingBanks> byCode = new HashMap<>();
        Map<String, BillingBanks> byGateway = new HashMap<>();
        Map<String, BillingBanks> byNameLower = new HashMap<>();
    }

    private BankLookupCache buildBankLookupCache() {
        BankLookupCache cache = new BankLookupCache();
        List<BillingBanks> banks = billingBanksRepository.findAll();
        for (BillingBanks b : banks) {
            if (b.getBankCode() != null && !b.getBankCode().trim().isEmpty()) {
                cache.byCode.put(b.getBankCode().trim(), b);
            }
            if (b.getGatewayCode() != null && !b.getGatewayCode().trim().isEmpty()) {
                cache.byGateway.put(b.getGatewayCode().trim(), b);
            }
            if (b.getBankName() != null && !b.getBankName().trim().isEmpty()) {
                cache.byNameLower.put(b.getBankName().trim().toLowerCase(Locale.ROOT), b);
            }
        }
        return cache;
    }

    private BillingBanks lookupBankFromCache(BankLookupCache cache, String agentName) {
        if (agentName == null)
            return null;
        String key = agentName.trim();
        BillingBanks bank = cache.byCode.get(key);
        if (bank != null)
            return bank;
        bank = cache.byGateway.get(key);
        if (bank != null)
            return bank;
        return cache.byNameLower.get(key.toLowerCase(Locale.ROOT));
    }

    // ==== After-commit side-effects: wuzif + penalty processing ====
    public static class PaymentUpdatesAppliedEvent {
        private final List<Integer> readingIds;

        public PaymentUpdatesAppliedEvent(List<Integer> readingIds) {
            this.readingIds = readingIds != null ? readingIds : Collections.emptyList();
        }

        public List<Integer> getReadingIds() {
            return readingIds;
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onPaymentUpdatesApplied(PaymentUpdatesAppliedEvent event) {
        if (event == null || event.getReadingIds().isEmpty())
            return;
        for (Integer id : event.getReadingIds()) {
            try {
                readingRepository.findById(id).ifPresent(this::processPaymentRelatedUpdates);
            } catch (Exception e) {
                System.err.println(
                        "[ERROR] Deferred post-payment updates failed for bill ID " + id + ": " + e.getMessage());
            }
        }
    }

    private static Date parseDateFlexible(String s) {
        if (isBlank(s))
            return null;
        List<String> patterns = Arrays.asList(
                "yyyy-MM-dd",
                "dd/MM/yyyy",
                "MM/dd/yyyy",
                "yyyy/MM/dd",
                "dd-MM-yyyy");
        for (String p : patterns) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat(p);
                sdf.setLenient(false);
                return sdf.parse(s.trim());
            } catch (ParseException ignored) {
            }
        }
        return null;
    }

    /**
     * Updates multiple billing reading records with bank payment information
     * 
     * @param request The bulk update request containing list of updates
     * @return BulkUpdateResponseDTO with success status and count
     */
    @Transactional
    public BulkUpdateResponseDTO bulkUpdateBankPayments(BulkBankPaymentUpdateRequestDTO request) {
        if (request == null || request.getUpdates() == null || request.getUpdates().isEmpty()) {
            return BulkUpdateResponseDTO.error("No updates provided");
        }

        int successCount = 0;
        int failureCount = 0;
        StringBuilder errors = new StringBuilder();

        // Build a per-request bank lookup cache to avoid repeated DB hits
        BankLookupCache bankCache = buildBankLookupCache();

        List<BillingReading> toSave = new ArrayList<>();
        List<Integer> updatedIds = new ArrayList<>();

        for (BulkBankPaymentUpdateRequestDTO.BankPaymentUpdateItemDTO item : request.getUpdates()) {
            try {
                Integer id = item.getId();
                BankPaymentUpdateDTO updateDTO = item.getUpdates();

                if (id == null) {
                    throw new IllegalArgumentException("Reading ID cannot be null");
                }

                Optional<BillingReading> readingOpt = readingRepository.findById(id);
                if (readingOpt.isEmpty()) {
                    throw new RuntimeException("BillingReading not found with ID: " + id);
                }
                BillingReading reading = readingOpt.get();

                // Fast-fail validations: for Derash, rely only on the Derash-specific flag
                if (reading.isVoid()) {
                    throw new IllegalStateException("Record with ID " + id + " is void and cannot be updated");
                }
                if (reading.isDerashPaid()) {
                    throw new IllegalStateException("Record with ID " + id + " is already paid through Derash");
                }
                if (!reading.isBillGenerated()) {
                    throw new IllegalStateException("Bill not generated for record with ID " + id);
                }
                if (updateDTO.getTekilalaBankYetekefele() != null) {
                    double expectedAmount = reading.getTekilalaTekefay();
                    double paidAmount = updateDTO.getTekilalaBankYetekefele();
                    double diff = Math.abs(expectedAmount - paidAmount);
                    if (diff > 0.01d) {
                        throw new IllegalArgumentException("Bill Payment difference: Payment amount " + paidAmount
                                + " != Bill amount " + expectedAmount);
                    }
                }

                // Apply updates to entity (no save yet)
                if (updateDTO.getTekilalaYetekefele() != null) {
                    reading.setTekilalaYetekefele(updateDTO.getTekilalaYetekefele());
                }
                if (updateDTO.getTekilalaBankYetekefele() != null) {
                    reading.setTekilalaBankYetekefele(updateDTO.getTekilalaBankYetekefele());
                }
                if (updateDTO.getIsPaidThroughBank() != null) {
                    reading.setPaidThroughBank(updateDTO.getIsPaidThroughBank());
                }
                if (updateDTO.getIsDerashPaid() != null) {
                    reading.setDerashPaid(updateDTO.getIsDerashPaid());
                }
                if (updateDTO.getMoneyCollectedDate() != null) {
                    reading.setMoneyCollectedDate(updateDTO.getMoneyCollectedDate());
                    reading.setMoneyCollected(true);
                }
                if (updateDTO.getBankPaidConfirmationCode() != null
                        && !updateDTO.getBankPaidConfirmationCode().trim().isEmpty()) {
                    reading.setBankPaidConfirmationCode(updateDTO.getBankPaidConfirmationCode().trim());
                }
                if (updateDTO.getBankPaidAgentId() != null && !updateDTO.getBankPaidAgentId().trim().isEmpty()) {
                    String agentName = updateDTO.getBankPaidAgentId().trim();
                    BillingBanks bank = lookupBankFromCache(bankCache, agentName);
                    if (bank != null) {
                        reading.setBankPaidAgentId(bank.getBankName());
                        reading.setBillingBanks(bank);
                    } else {
                        throw new IllegalArgumentException(
                                "Bank not found: Agent \"" + agentName + "\" does not match any bank in database");
                    }
                }

                BillingCustomerInfo customer = reading.getBillingCustomerInfo();
                if (customer != null && !customer.getOldIfPenaltyPaid() && customer.getOldHasPenalty()) {
                    reading.setOldPenalityPaidInThisMonth(true);
                }

                reading.setModifiedDate(new Date());

                toSave.add(reading);
                updatedIds.add(reading.getId());
                successCount++;
            } catch (Exception e) {
                failureCount++;
                if (errors.length() > 0) {
                    errors.append("; ");
                }
                errors.append("ID ").append(item.getId()).append(": ").append(e.getMessage());
            }
        }

        if (!toSave.isEmpty()) {
            readingRepository.saveAll(toSave); // Hibernate will batch due to properties
            // Defer heavy side-effects until AFTER_COMMIT
            eventPublisher.publishEvent(new PaymentUpdatesAppliedEvent(updatedIds));
        }

        if (failureCount > 0) {
            return BulkUpdateResponseDTO.error(
                    "Partial success: " + successCount + " updated, " + failureCount + " failed. Errors: "
                            + errors.toString());
        }

        return BulkUpdateResponseDTO.success(successCount);
    }

    /**
     * Updates a single billing reading record with bank payment information
     * 
     * @param id        The ID of the billing reading record
     * @param updateDTO The update data
     * @return The updated BillingReading entity
     * @throws RuntimeException if record not found or validation fails
     */
    public BillingReading updateSingleBankPayment(Integer id, BankPaymentUpdateDTO updateDTO) {
        if (id == null) {
            throw new IllegalArgumentException("Reading ID cannot be null");
        }

        Optional<BillingReading> readingOpt = readingRepository.findById(id);
        if (readingOpt.isEmpty()) {
            throw new RuntimeException("BillingReading not found with ID: " + id);
        }

        BillingReading reading = readingOpt.get();

        // Validation: Check if already paid through Derash only
        if (reading.isVoid()) {
            throw new IllegalStateException("Record with ID " + id + " is void and cannot be updated");
        }
        if (reading.isDerashPaid()) {
            throw new IllegalStateException("Record with ID " + id + " is already paid through Derash");
        }

        // Validation: Check if bill is generated
        if (!reading.isBillGenerated()) {
            throw new IllegalStateException("Bill not generated for record with ID " + id);
        }

        // Validation: Check if payment amount matches bill amount (if provided)
        if (updateDTO.getTekilalaBankYetekefele() != null) {
            double expectedAmount = reading.getTekilalaTekefay();
            double paidAmount = updateDTO.getTekilalaBankYetekefele();
            double diff = Math.abs(expectedAmount - paidAmount);
            if (diff > 0.01d) { // allow tiny rounding tolerance
                String errorMsg = "Bill Payment difference: Payment amount " + paidAmount + " != Bill amount "
                        + expectedAmount;
                System.err.println("ERROR: " + errorMsg + " for bill ID " + id);
                throw new IllegalArgumentException(errorMsg);
            }
        }

        // Apply updates
        if (updateDTO.getTekilalaYetekefele() != null) {
            reading.setTekilalaYetekefele(updateDTO.getTekilalaYetekefele());
        }
        if (updateDTO.getTekilalaBankYetekefele() != null) {
            reading.setTekilalaBankYetekefele(updateDTO.getTekilalaBankYetekefele());
        }
        if (updateDTO.getIsPaidThroughBank() != null) {
            reading.setPaidThroughBank(updateDTO.getIsPaidThroughBank());
        }
        if (updateDTO.getIsDerashPaid() != null) {
            reading.setDerashPaid(updateDTO.getIsDerashPaid());
        }
        if (updateDTO.getMoneyCollectedDate() != null) {
            Date dt = updateDTO.getMoneyCollectedDate();
            reading.setMoneyCollectedDate(dt);
            // Also track Unicash-specific collected date
            reading.setuMoneyCollectedDate(dt);
            reading.setMoneyCollected(true); // Set money collected to true when date is provided
        }
        if (updateDTO.getBankPaidConfirmationCode() != null
                && !updateDTO.getBankPaidConfirmationCode().trim().isEmpty()) {
            reading.setBankPaidConfirmationCode(updateDTO.getBankPaidConfirmationCode().trim());
        }
        if (updateDTO.getBankPaidAgentId() != null && !updateDTO.getBankPaidAgentId().trim().isEmpty()) {
            String agentName = updateDTO.getBankPaidAgentId().trim();

            // Lookup and validate bank information - THROW ERROR if bank not found
            BillingBanks bank = lookupBankByAgentName(agentName);
            if (bank != null) {
                reading.setBankPaidAgentId(bank.getBankName()); // Set bank name instead of agent code
                reading.setBillingBanks(bank); // Set the bank relationship
                System.out.println("Bank lookup successful: " + agentName + " -> " + bank.getBankName());
            } else {
                // THROW ERROR if bank not found in bulk update
                String errorMsg = "Bank not found: Agent \"" + agentName + "\" does not match any bank in database";
                System.err.println("ERROR: " + errorMsg + " for bill ID " + id);
                throw new IllegalArgumentException(errorMsg);
            }
        }

        // Check if customer has old penalty and set isOldPenalityPaidInThisMonth=true
        BillingCustomerInfo customer = reading.getBillingCustomerInfo();
        if (customer != null && !customer.getOldIfPenaltyPaid() && customer.getOldHasPenalty()) {
            reading.setOldPenalityPaidInThisMonth(true);
        }

        // Set modification date
        reading.setModifiedDate(new Date());

        // Save the reading first
        BillingReading savedReading = readingRepository.save(reading);

        // Process wuzif and penalty logic after successful payment
        processPaymentRelatedUpdates(savedReading);

        return savedReading;
    }

    /**
     * Process wuzif and penalty-related updates when a bill is paid
     * This method implements the business logic for:
     * 1. Marking unpaid wuzif bills as paid
     * 2. Updating customer penalty status
     * 3. Marking bill as having old penalty paid
     */
    public void processPaymentRelatedUpdates(BillingReading paidBill) {
        try {
            // Get customer account number
            String accountNumber = paidBill.getBillingCustomerInfo().getAccountNumber();
            Integer paidBillId = paidBill.getId();

            // 1. Find and mark unpaid wuzif bills as paid
            int wuzifUpdatedCount = wuzifService.markUnpaidWuzifAsPaid(accountNumber, paidBillId);
            // if (wuzifUpdatedCount > 0) {
            // System.out.println("[WUZIF] Marked " + wuzifUpdatedCount + " unpaid wuzif
            // records as paid for customer: " + accountNumber);
            // }

            // 2. Process penalty payment logic
            billingCustomerInfoService.processPenaltyPayment(accountNumber, paidBillId);
            // System.out.println("[PENALTY] Processed penalty payment logic for customer: "
            // + accountNumber + ", bill: " + paidBillId);

        } catch (Exception e) {
            // Log error but don't fail the main payment process
            System.err.println("[ERROR] Failed to process payment-related updates for bill ID " + paidBill.getId()
                    + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Lookup bank by agent name (bank code)
     * This method tries to find a bank by matching the CSV agent_name with
     * bank_code
     */
    private BillingBanks lookupBankByAgentName(String agentName) {
        try {
            // First try to find by bank code (exact match)
            Optional<BillingBanks> bankOpt = billingBanksRepository.findByBankCode(agentName);
            if (bankOpt.isPresent()) {
                return bankOpt.get();
            }

            // If not found by bank code, try by gateway code
            bankOpt = billingBanksRepository.findByGatewayCode(agentName);
            if (bankOpt.isPresent()) {
                return bankOpt.get();
            }

            // If still not found, try partial match on bank name (case insensitive)
            List<BillingBanks> banks = billingBanksRepository.findByBankNameContainingIgnoreCase(agentName);
            if (!banks.isEmpty()) {
                return banks.get(0); // Return first match
            }

            return null; // No bank found
        } catch (Exception e) {
            System.err.println("Error during bank lookup for agent: " + agentName + " - " + e.getMessage());
            return null;
        }
    }

    /**
     * Updates multiple billing reading records with Unicash payment information
     * 
     * @param request The bulk update request containing list of updates
     * @return BulkUpdateResponseDTO with success status and count
     */
    public BulkUpdateResponseDTO bulkUpdateUnicashPayments(BulkUnicashPaymentUpdateRequestDTO request) {
        if (request == null || request.getUpdates() == null || request.getUpdates().isEmpty()) {
            return BulkUpdateResponseDTO.error("No updates provided");
        }

        int successCount = 0;
        int failureCount = 0;
        StringBuilder errors = new StringBuilder();

        for (BulkUnicashPaymentUpdateRequestDTO.UnicashPaymentUpdateItemDTO item : request.getUpdates()) {
            try {
                updateSingleUnicashPayment(item.getId(), item.getUpdates());
                successCount++;
            } catch (Exception e) {
                failureCount++;
                if (errors.length() > 0) {
                    errors.append("; ");
                }
                errors.append("ID ").append(item.getId()).append(": ").append(e.getMessage());
            }
        }

        if (failureCount > 0) {
            return BulkUpdateResponseDTO.error(
                    "Partial success: " + successCount + " updated, " + failureCount + " failed. Errors: "
                            + errors.toString());
        }

        return BulkUpdateResponseDTO.success(successCount);
    }

    /**
     * Updates a single billing reading record with Unicash payment information
     * 
     * @param id        The ID of the billing reading record
     * @param updateDTO The update data
     * @return The updated BillingReading entity
     * @throws RuntimeException if record not found or validation fails
     */
    public BillingReading updateSingleUnicashPayment(Integer id, UnicashPaymentUpdateDTO updateDTO) {
        if (id == null) {
            throw new IllegalArgumentException("Reading ID cannot be null");
        }

        Optional<BillingReading> readingOpt = readingRepository.findById(id);
        if (readingOpt.isEmpty()) {
            throw new RuntimeException("BillingReading not found with ID: " + id);
        }

        BillingReading reading = readingOpt.get();

        // Validation: Check if already paid through Unicash
        if (reading.isUnicashPaid()) {
            throw new IllegalStateException("Record with ID " + id + " is already paid through Unicash");
        }

        // Validation: Check if bill is generated
        if (!reading.isBillGenerated()) {
            throw new IllegalStateException("Bill not generated for record with ID " + id);
        }

        // Apply Unicash-specific updates
        if (updateDTO.getTekilalaYetekefele() != null) {
            reading.setTekilalaYetekefele(updateDTO.getTekilalaYetekefele());
        }
        if (updateDTO.getTekilalaBankYetekefele() != null) {
            reading.setTekilalaBankYetekefele(updateDTO.getTekilalaBankYetekefele());
        }
        if (updateDTO.getIsUnicashPaid() != null) {
            reading.setUnicashPaid(updateDTO.getIsUnicashPaid());
            if (Boolean.TRUE.equals(updateDTO.getIsUnicashPaid())) {
                // Mark as paid through bank when Unicash payment is recorded
                reading.setPaidThroughBank(true);
            }
        }
        if (updateDTO.getMoneyCollectedDate() != null) {
            // For Unicash, track both the generic moneyCollectedDate and the
            // Unicash-specific uMoneyCollectedDate
            java.util.Date dt = updateDTO.getMoneyCollectedDate();
            reading.setMoneyCollectedDate(dt);
            reading.setuMoneyCollectedDate(dt);
            reading.setMoneyCollected(true); // Set money collected to true when date is provided
        }
        if (updateDTO.getuBankPaidConfirmationCode() != null
                && !updateDTO.getuBankPaidConfirmationCode().trim().isEmpty()) {
            reading.setuBankPaidConfirmationCode(updateDTO.getuBankPaidConfirmationCode().trim());
        }
        if (updateDTO.getuBankPaidAgentId() != null && !updateDTO.getuBankPaidAgentId().trim().isEmpty()) {
            String bankName = updateDTO.getuBankPaidAgentId().trim();

            // Lookup and validate bank information - THROW ERROR if bank not found
            BillingBanks bank = lookupBankByAgentName(bankName);
            if (bank != null) {
                reading.setuBankPaidAgentId(bank.getBankName()); // Set bank name instead of agent code
                reading.setuBillingBank(bank); // Set the bank relationship
                System.out.println("Unicash bank lookup successful: " + bankName + " -> " + bank.getBankName());
            } else {
                // THROW ERROR if bank not found in bulk update
                String errorMsg = "Bank not found: Agent \"" + bankName + "\" does not match any bank in database";
                System.err.println("ERROR: " + errorMsg + " for bill ID " + id);
                throw new IllegalArgumentException(errorMsg);
            }
        }

        // Check if customer has old penalty and set isOldPenalityPaidInThisMonth=true
        BillingCustomerInfo customer = reading.getBillingCustomerInfo();
        if (customer != null && !customer.getOldIfPenaltyPaid() && customer.getOldHasPenalty()) {
            reading.setOldPenalityPaidInThisMonth(true);
        }

        // Set modification date
        reading.setModifiedDate(new Date());

        // Save the reading first
        BillingReading savedReading = readingRepository.save(reading);

        // Process wuzif and penalty logic after successful payment
        processPaymentRelatedUpdates(savedReading);

        return savedReading;
    }

    /**
     * Import Unicash payments from CSV file
     * 
     * @param file     CSV file containing Unicash payment data
     * @param kifyaWer The billing period
     * @return ImportReport with processing results
     * @throws Exception if processing fails
     */
    public ImportReport importUnicashPaymentsFromCsv(MultipartFile file, String kifyaWer) throws Exception {
        ImportReport report = new ImportReport();
        int success = 0, failed = 0, updated = 0, skipped = 0;

        if (file == null || file.isEmpty()) {
            report.getImportLogs().add("ERROR: Empty file.");
            return report;
        }

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
                CSVReader csv = new CSVReader(reader)) {

            String[] header = csv.readNext();
            if (header == null) {
                report.getImportLogs().add("ERROR: CSV has no header row.");
                return report;
            }

            Map<String, Integer> idx = mapHeader(header);
            // Expected columns for Unicash CSV:
            // billIds, paidOn, bankTransactionReference, bankName

            String[] row;
            int rowNum = 1; // header counted as 1
            while ((row = csv.readNext()) != null) {
                rowNum++;
                try {
                    String billIds = get(row, idx, "billids"); // Note: case insensitive mapping
                    String paidOn = get(row, idx, "paidon");
                    String bankTransactionReference = get(row, idx, "banktransactionreference");
                    String bankName = get(row, idx, "bankname");

                    if (isBlank(billIds)) {
                        report.getImportLogs().add("WARN: Row " + rowNum + ": Missing billIds. Skipped.");
                        skipped++;
                        continue;
                    }

                    // Find reading by billingInvoiceNumbers (since Unicash CSV doesn't have account
                    // numbers)
                    Optional<BillingReading> readingOpt = readingRepository
                            .findByBillingInvoiceNumbers_InvoiceNumbers(billIds.trim());

                    if (readingOpt.isEmpty()) {
                        report.getImportLogs()
                                .add("ERROR: Row " + rowNum + ": No reading found for billIds " + billIds + ".");
                        failed++;
                        continue;
                    }

                    BillingReading reading = readingOpt.get();

                    // 1) Must be bill generated
                    if (!reading.isBillGenerated()) {
                        String reason = "Bill not generated for billIds " + billIds + ", kifyaWer="
                                + reading.getKifyaWer();
                        report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                        report.getNoPreviousReadingEntries().add(new NoPreviousReadingReportEntry(billIds, reason));
                        skipped++;
                        continue;
                    }

                    // 2) Check if already paid through Unicash
                    if (reading.isUnicashPaid()) {
                        String reason = "Already paid through Unicash";
                        report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                        report.getNoPreviousReadingEntries().add(new NoPreviousReadingReportEntry(billIds, reason));
                        skipped++;
                        continue;
                    }

                    Date paidDate = parseDateFlexible(paidOn);
                    if (paidDate == null) {
                        String reason = "Invalid or missing paidOn date";
                        report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                        report.getNoPreviousReadingEntries().add(new NoPreviousReadingReportEntry(billIds, reason));
                        skipped++;
                        continue;
                    }

                    // Update Unicash payment-related fields
                    // 1. tekilalaYetekefele = tekilalaTekefay + kecreditYetekefele
                    reading.setTekilalaYetekefele((reading.getTekilalaTekefay() + reading.getKecreditYetekefele()));
                    // 2. tekilalaBankYetekefele = tekilalaTekefay
                    reading.setTekilalaBankYetekefele(reading.getTekilalaTekefay());
                    // 3. mark as paid through Unicash/bank
                    reading.setUnicashPaid(true);
                    reading.setPaidThroughBank(true);
                    // 4. moneyCollected flags
                    reading.setMoneyCollected(true);
                    // 5. moneyCollectedDate = csv paidOn
                    reading.setMoneyCollectedDate(paidDate);
                    // 6. BankPaidConfirmationCode = csv bankTransactionReference
                    if (!isBlank(bankTransactionReference)) {
                        reading.setuBankPaidConfirmationCode(bankTransactionReference.trim());
                    }
                    // 7. bankPaidAgentId = csv bankName
                    if (!isBlank(bankName)) {
                        BillingBanks bank = lookupBankByAgentName(bankName.trim());
                        if (bank != null) {
                            reading.setuBankPaidAgentId(bank.getBankName()); // Set bank name
                            reading.setuBillingBank(bank); // Set the bank relationship
                            System.out.println(
                                    "Unicash bank lookup successful: " + bankName + " -> " + bank.getBankName());
                        } else {
                            // SKIP this record if bank not found
                            String reason = "Bank not found: \"" + bankName + "\" does not match any bank in database";
                            System.err.println("ERROR: Row " + rowNum + " - " + reason + " for billIds " + billIds);
                            report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                            report.getNoPreviousReadingEntries().add(new NoPreviousReadingReportEntry(billIds, reason));
                            skipped++;
                            continue;
                        }
                    }

                    // Check if customer has old penalty and set isOldPenalityPaidInThisMonth=true
                    BillingCustomerInfo customer = reading.getBillingCustomerInfo();
                    if (customer != null && !customer.getOldIfPenaltyPaid() && customer.getOldHasPenalty()) {
                        reading.setOldPenalityPaidInThisMonth(true);
                    }

                    reading.setModifiedDate(new Date());

                    BillingReading savedReading = readingRepository.save(reading);

                    // Process wuzif and penalty logic after successful payment
                    processPaymentRelatedUpdates(savedReading);

                    success++;
                    updated++;

                    StringBuilder ok = new StringBuilder();
                    ok.append("OK: Row ").append(rowNum).append(": Unicash payment recorded for billIds ")
                            .append(billIds);
                    if (bankName != null && !bankName.trim().isEmpty()) {
                        ok.append(" (bank=").append(bankName.trim()).append(")");
                    }
                    report.getImportLogs().add(ok.append('.').toString());
                } catch (Exception ex) {
                    failed++;
                    report.getImportLogs().add("ERROR: Row " + rowNum + ": " + ex.getMessage());
                }
            }
        } catch (CsvValidationException e) {
            report.getImportLogs().add("ERROR: Invalid CSV format: " + e.getMessage());
            failed++;
        }

        report.setSuccessCount(success);
        report.setFailedCount(failed);
        report.setUpdatedCount(updated);
        report.setSkippedCount(skipped);
        return report;
    }

    // ===================== MardaArif Methods =====================

    /**
     * Updates multiple billing reading records with MardaArif payment information
     */
    public BulkUpdateResponseDTO bulkUpdateMardaArifPayments(com.wbill.home.dto.BulkMardaArifPaymentUpdateRequestDTO request) {
        if (request == null || request.getUpdates() == null || request.getUpdates().isEmpty()) {
            return BulkUpdateResponseDTO.error("No updates provided");
        }

        int successCount = 0;
        int failureCount = 0;
        StringBuilder errors = new StringBuilder();

        for (com.wbill.home.dto.BulkMardaArifPaymentUpdateRequestDTO.MardaArifPaymentUpdateItemDTO item : request.getUpdates()) {
            try {
                updateSingleMardaArifPayment(item.getId(), item.getUpdates());
                successCount++;
            } catch (Exception e) {
                failureCount++;
                if (errors.length() > 0) {
                    errors.append("; ");
                }
                errors.append("ID ").append(item.getId()).append(": ").append(e.getMessage());
            }
        }

        if (failureCount > 0) {
            return BulkUpdateResponseDTO.error(
                    "Partial success: " + successCount + " updated, " + failureCount + " failed. Errors: "
                            + errors.toString());
        }

        return BulkUpdateResponseDTO.success(successCount);
    }

    /**
     * Updates a single billing reading record with MardaArif payment information
     */
    public BillingReading updateSingleMardaArifPayment(Integer id, com.wbill.home.dto.MardaArifPaymentUpdateDTO updateDTO) {
        if (id == null) {
            throw new IllegalArgumentException("Reading ID cannot be null");
        }

        Optional<BillingReading> readingOpt = readingRepository.findById(id);
        if (readingOpt.isEmpty()) {
            throw new RuntimeException("BillingReading not found with ID: " + id);
        }

        BillingReading reading = readingOpt.get();

        // Validation: Check if already paid through MardaArif
        if (reading.isMardaArifPaid()) {
            throw new IllegalStateException("Record with ID " + id + " is already paid through MardaArif");
        }

        // Validation: Check if bill is generated
        if (!reading.isBillGenerated()) {
            throw new IllegalStateException("Bill not generated for record with ID " + id);
        }

        // Apply MardaArif-specific updates
        if (updateDTO.getTekilalaYetekefele() != null) {
            reading.setTekilalaYetekefele(updateDTO.getTekilalaYetekefele());
        }
        if (updateDTO.getTekilalaBankYetekefele() != null) {
            reading.setTekilalaBankYetekefele(updateDTO.getTekilalaBankYetekefele());
        }
        if (updateDTO.getIsMardaArifPaid() != null) {
            reading.setMardaArifPaid(updateDTO.getIsMardaArifPaid());
            if (Boolean.TRUE.equals(updateDTO.getIsMardaArifPaid())) {
                reading.setPaidThroughBank(true);
            }
        }
        if (updateDTO.getMoneyCollectedDate() != null) {
            java.util.Date dt = updateDTO.getMoneyCollectedDate();
            reading.setMoneyCollectedDate(dt);
            reading.setmMoneyCollectedDate(dt);
            reading.setMoneyCollected(true);
        }
        if (updateDTO.getmBankPaidConfirmationCode() != null
                && !updateDTO.getmBankPaidConfirmationCode().trim().isEmpty()) {
            reading.setmBankPaidConfirmationCode(updateDTO.getmBankPaidConfirmationCode().trim());
        }
        if (updateDTO.getmBankPaidAgentId() != null && !updateDTO.getmBankPaidAgentId().trim().isEmpty()) {
            String bankName = updateDTO.getmBankPaidAgentId().trim();

            BillingBanks bank = lookupBankByAgentName(bankName);
            if (bank != null) {
                reading.setmBankPaidAgentId(bank.getBankName());
                reading.setmBillingBank(bank);
            } else {
                String errorMsg = "Bank not found: Agent \"" + bankName + "\" does not match any bank in database";
                throw new IllegalArgumentException(errorMsg);
            }
        }

        // Check if customer has old penalty
        BillingCustomerInfo customer = reading.getBillingCustomerInfo();
        if (customer != null && !customer.getOldIfPenaltyPaid() && customer.getOldHasPenalty()) {
            reading.setOldPenalityPaidInThisMonth(true);
        }

        reading.setModifiedDate(new Date());

        BillingReading savedReading = readingRepository.save(reading);

        processPaymentRelatedUpdates(savedReading);

        return savedReading;
    }

    /**
     * Import MardaArif payments from CSV file
     */
    public ImportReport importMardaArifPaymentsFromCsv(MultipartFile file, String kifyaWer) throws Exception {
        ImportReport report = new ImportReport();
        int success = 0, failed = 0, updated = 0, skipped = 0;

        if (file == null || file.isEmpty()) {
            report.getImportLogs().add("ERROR: Empty file.");
            return report;
        }

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
                CSVReader csv = new CSVReader(reader)) {

            String[] header = csv.readNext();
            if (header == null) {
                report.getImportLogs().add("ERROR: CSV has no header row.");
                return report;
            }

            Map<String, Integer> idx = mapHeader(header);

            String[] row;
            int rowNum = 1;
            while ((row = csv.readNext()) != null) {
                rowNum++;
                try {
                    String billIds = get(row, idx, "billids");
                    String paidOn = get(row, idx, "paidon");
                    String bankTransactionReference = get(row, idx, "banktransactionreference");
                    String bankName = get(row, idx, "bankname");

                    if (isBlank(billIds)) {
                        report.getImportLogs().add("WARN: Row " + rowNum + ": Missing billIds. Skipped.");
                        skipped++;
                        continue;
                    }

                    Optional<BillingReading> readingOpt = readingRepository
                            .findByBillingInvoiceNumbers_InvoiceNumbers(billIds.trim());

                    if (readingOpt.isEmpty()) {
                        report.getImportLogs()
                                .add("ERROR: Row " + rowNum + ": No reading found for billIds " + billIds + ".");
                        failed++;
                        continue;
                    }

                    BillingReading reading = readingOpt.get();

                    if (!reading.isBillGenerated()) {
                        String reason = "Bill not generated for billIds " + billIds + ", kifyaWer="
                                + reading.getKifyaWer();
                        report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                        report.getNoPreviousReadingEntries().add(new NoPreviousReadingReportEntry(billIds, reason));
                        skipped++;
                        continue;
                    }

                    if (reading.isMardaArifPaid()) {
                        String reason = "Already paid through MardaArif";
                        report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                        report.getNoPreviousReadingEntries().add(new NoPreviousReadingReportEntry(billIds, reason));
                        skipped++;
                        continue;
                    }

                    Date paidDate = parseDateFlexible(paidOn);
                    if (paidDate == null) {
                        String reason = "Invalid or missing paidOn date";
                        report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                        report.getNoPreviousReadingEntries().add(new NoPreviousReadingReportEntry(billIds, reason));
                        skipped++;
                        continue;
                    }

                    reading.setTekilalaYetekefele((reading.getTekilalaTekefay() + reading.getKecreditYetekefele()));
                    reading.setTekilalaBankYetekefele(reading.getTekilalaTekefay());
                    reading.setMardaArifPaid(true);
                    reading.setPaidThroughBank(true);
                    reading.setMoneyCollected(true);
                    reading.setMoneyCollectedDate(paidDate);
                    if (!isBlank(bankTransactionReference)) {
                        reading.setmBankPaidConfirmationCode(bankTransactionReference.trim());
                    }
                    if (!isBlank(bankName)) {
                        BillingBanks bank = lookupBankByAgentName(bankName.trim());
                        if (bank != null) {
                            reading.setmBankPaidAgentId(bank.getBankName());
                            reading.setmBillingBank(bank);
                        } else {
                            String reason = "Bank not found: \"" + bankName + "\" does not match any bank in database";
                            report.getImportLogs().add("SKIP: Row " + rowNum + ": " + reason + ".");
                            report.getNoPreviousReadingEntries().add(new NoPreviousReadingReportEntry(billIds, reason));
                            skipped++;
                            continue;
                        }
                    }

                    BillingCustomerInfo customer = reading.getBillingCustomerInfo();
                    if (customer != null && !customer.getOldIfPenaltyPaid() && customer.getOldHasPenalty()) {
                        reading.setOldPenalityPaidInThisMonth(true);
                    }

                    reading.setModifiedDate(new Date());

                    BillingReading savedReading = readingRepository.save(reading);

                    processPaymentRelatedUpdates(savedReading);

                    success++;
                    updated++;

                    StringBuilder ok = new StringBuilder();
                    ok.append("OK: Row ").append(rowNum).append(": MardaArif payment recorded for billIds ")
                            .append(billIds);
                    if (bankName != null && !bankName.trim().isEmpty()) {
                        ok.append(" (bank=").append(bankName.trim()).append(")");
                    }
                    report.getImportLogs().add(ok.append('.').toString());
                } catch (Exception ex) {
                    failed++;
                    report.getImportLogs().add("ERROR: Row " + rowNum + ": " + ex.getMessage());
                }
            }
        } catch (CsvValidationException e) {
            report.getImportLogs().add("ERROR: Invalid CSV format: " + e.getMessage());
            failed++;
        }

        report.setSuccessCount(success);
        report.setFailedCount(failed);
        report.setUpdatedCount(updated);
        report.setSkippedCount(skipped);
        return report;
    }
}
