package com.wbill.home.service;

import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.wbill.home.dto.BankProcessResultDTO;
import com.wbill.home.model.BillingBanks;
import com.wbill.home.model.BillingReading;
import com.wbill.home.repository.BillingBanksRepository;
import com.wbill.home.repository.BillingReadingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class BankPaymentDerashFlowService {

    private final DerashClient derashClient;
    private final BillingReadingRepository readingRepository;
    private final BillingBanksRepository billingBanksRepository;

    @Value("${storage.derash-csv-dir:src/main/resources/static/derash-csv}")
    private String storageDir;

    public BankPaymentDerashFlowService(DerashClient derashClient, BillingReadingRepository readingRepository,
            BillingBanksRepository billingBanksRepository) {
        this.derashClient = derashClient;
        this.readingRepository = readingRepository;
        this.billingBanksRepository = billingBanksRepository;
    }

    /**
     * Build a map of bankCode -> BillingBanks for quick agent_id lookup.
     */
    private Map<String, BillingBanks> buildBankCodeMap() {
        Map<String, BillingBanks> map = new HashMap<>();
        List<BillingBanks> banks = billingBanksRepository.findAll();
        for (BillingBanks b : banks) {
            if (b.getBankCode() != null && !b.getBankCode().trim().isEmpty()) {
                map.put(b.getBankCode().trim(), b);
            }
        }
        return map;
    }

    public String fetchAndSaveCsv(String fromDate, String toDate) throws IOException {
        String content;
        try {
            content = derashClient.fetchCustomerPaidBills(fromDate, toDate);
            if (content == null)
                content = "";

            // Create public directory if it doesn't exist
            Files.createDirectories(Paths.get(storageDir));

            // Generate filename with timestamp for uniqueness
            String timestamp = java.time.LocalDateTime.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("derash_%s_to_%s_%s.csv", fromDate, toDate, timestamp);
            Path file = Paths.get(storageDir, filename);

            try (Writer w = new OutputStreamWriter(new FileOutputStream(file.toFile()), StandardCharsets.UTF_8)) {
                w.write(content);
            }

            // Return absolute path
            return file.toString();
        } catch (Exception e) {
            throw e;
        }
    }

    public BankProcessResultDTO processCsv(String fromDate, String toDate) throws Exception {
        // Find the most recent CSV file for the given date range
        Path csvFile = findLatestCsvFile(fromDate, toDate);
        if (csvFile == null || !Files.exists(csvFile)) {
            throw new FileNotFoundException("No CSV file found for date range: " + fromDate + " to " + toDate);
        }

        // Build bank lookup map
        Map<String, BillingBanks> bankCodeMap = buildBankCodeMap();

        BankProcessResultDTO result = new BankProcessResultDTO();
        Set<String> seenBillIds = new HashSet<>();
        Set<String> duplicateBillIds = new HashSet<>();

        try (Reader reader = new InputStreamReader(new FileInputStream(csvFile.toFile()), StandardCharsets.UTF_8)) {
            CSVReader csv = new CSVReaderBuilder(reader)
                    .withCSVParser(new CSVParserBuilder().withSeparator(',').build())
                    .build();

            String[] header = csv.readNext();
            if (header == null)
                return result;
            Map<String, Integer> idx = mapHeader(header);

            String[] row;
            int totalCount = 0;
            while ((row = csv.readNext()) != null) {
                totalCount++;
                // Original CSV format:
                // biller_id,biller_name,customer_name,bill_id,paid_amount,paid_dt,agent_id,agent_tx_code
                String billerId = get(row, idx, "biller_id");
                String billerName = get(row, idx, "biller_name");
                String customerName = get(row, idx, "customer_name");
                String billId = get(row, idx, "bill_id");
                String paidAmountStr = get(row, idx, "paid_amount");
                String paidDt = get(row, idx, "paid_dt");
                String agentId = get(row, idx, "agent_id");
                String agentTx = get(row, idx, "agent_tx_code");
                if (billId == null || billId.isBlank())
                    continue;

                if (!seenBillIds.add(billId)) {
                    duplicateBillIds.add(billId);
                }

                // First try to find by bill_id (invoice number)
                Optional<BillingReading> opt = readingRepository
                        .findByBillingInvoiceNumbers_InvoiceNumbers(billId.trim());

                if (opt.isEmpty()) {
                    result.getNotFound().add(billId);
                    continue;
                }
                BillingReading r = opt.get();

                // Lookup agent_id against BillingBanks.bankCode
                BillingBanks bank = (agentId != null && !agentId.isBlank()) ? bankCodeMap.get(agentId.trim()) : null;
                if (agentId != null && !agentId.isBlank() && bank == null) {
                    // Bank not found — add to skipped list
                    BankProcessResultDTO.SkippedBillDTO skipped = new BankProcessResultDTO.SkippedBillDTO();
                    skipped.invoiceNumber = billId;
                    skipped.customerName = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getFullName() : null;
                    skipped.customerAccountNumber = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getAccountNumber() : null;
                    skipped.agentId = agentId;
                    skipped.paidAmount = parseDouble(paidAmountStr);
                    skipped.paidDate = paidDt;
                    skipped.reason = "Bank not found: agent_id \"" + agentId + "\" does not match any bankCode in database";
                    result.getSkippedBills().add(skipped);
                    continue;
                }

                BankProcessResultDTO.PaymentViewDTO view = new BankProcessResultDTO.PaymentViewDTO();
                view.id = r.getId();
                view.invoiceNumber = billId;
                view.customerName = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getFullName()
                        : null;
                view.customerAccountNumber = r.getBillingCustomerInfo() != null
                        ? r.getBillingCustomerInfo().getAccountNumber()
                        : null;
                view.kifyaWer = r.getKifyaWer();
                view.tekilalaTekefay = r.getTekilalaTekefay();
                view.tekilalaBankYetekefele = parseDouble(paidAmountStr);
                view.tekilalaYetekefele = r.getKecreditYetekefele()
                        + (view.tekilalaBankYetekefele != null ? view.tekilalaBankYetekefele : 0);
                view.isPaidThroughBank = r.isPaidThroughBank();
                view.isDerashPaid = r.isDerashPaid();
                view.bankPaidAgentId = agentId;
                view.bankName = bank != null ? bank.getBankName() : agentId;
                view.bankPaidConfirmationCode = agentTx;
                view.moneyCollectedDate = paidDt;

                // For Derash import, treat a bill as already paid based solely on the Derash
                // flag
                if (r.isVoid()) {
                    result.getVoidBills().add(view);
                } else if (!Boolean.TRUE.equals(r.isDerashPaid())) {
                    result.getNewPayments().add(view);
                } else {
                    result.getAlreadyPaid().add(view);
                }
            }
            result.getDuplicates().addAll(duplicateBillIds);
            result.setTotalPaidCount(totalCount);
        }
        return result;
    }

    /**
     * Overload with monthly preloading support and progress updates.
     */
    public BankProcessResultDTO processCsvWithProgress(String jobId, String fromDate, String toDate, String kifyaWer,
            ProgressService progressService) throws Exception {
        Path csvFile = findLatestCsvFile(fromDate, toDate);
        if (csvFile == null || !Files.exists(csvFile)) {
            progressService.markError(jobId, "CSV file not found for date range: " + fromDate + " to " + toDate);
            throw new FileNotFoundException("No CSV file found for date range: " + fromDate + " to " + toDate);
        }

        // Phase A: Count CSV rows up front (fast) so we can set a stable combined total
        progressService.updateMessage(jobId, "Counting CSV rows...");
        int totalRows = 0;
        try (BufferedReader br = Files.newBufferedReader(csvFile, StandardCharsets.UTF_8)) {
            String line;
            boolean first = true;
            while ((line = br.readLine()) != null) {
                if (first) {
                    first = false;
                    continue;
                }
                totalRows++;
            }
        }

        // Phase B: Pre-calc monthly list size (if provided), then set combined total
        Map<String, BillingReading> monthlyMap = null;
        List<BillingReading> monthlyList = Collections.emptyList();
        if (kifyaWer != null && !kifyaWer.trim().isEmpty()) {
            monthlyList = readingRepository.findByKifyaWerWithInvoiceNumbers(kifyaWer.trim());
        }
        int preloadCount = (monthlyList == null) ? 0 : monthlyList.size();
        progressService.setTotal(jobId, preloadCount + totalRows);

        // Phase C: Build preload map with live progress
        if (preloadCount > 0) {
            progressService.updateMessage(jobId, "Preloading monthly bills for " + kifyaWer.trim());
            monthlyMap = new HashMap<>();
            for (BillingReading r : monthlyList) {
                String inv = null;
                if (r.getBillingInvoiceNumbers() != null && r.getBillingInvoiceNumbers().getInvoiceNumbers() != null) {
                    inv = r.getBillingInvoiceNumbers().getInvoiceNumbers();
                }
                if ((inv == null || inv.isBlank()) && r.getInvoiceNumber() != null) {
                    inv = r.getInvoiceNumber();
                }
                if (inv != null && !inv.isBlank()) {
                    monthlyMap.put(inv.trim(), r);
                }
                progressService.incrementProcessed(jobId);
            }
        }

        // Phase D: Build bank lookup map and process CSV
        Map<String, BillingBanks> bankCodeMap = buildBankCodeMap();
        progressService.updateMessage(jobId, "Processing CSV data...");

        BankProcessResultDTO result = new BankProcessResultDTO();
        Set<String> seenBillIds = new HashSet<>();
        Set<String> duplicateBillIds = new HashSet<>();

        try (Reader reader = new InputStreamReader(new FileInputStream(csvFile.toFile()), StandardCharsets.UTF_8)) {
            CSVReader csv = new CSVReaderBuilder(reader)
                    .withCSVParser(new CSVParserBuilder().withSeparator(',').build())
                    .build();

            String[] header = csv.readNext();
            if (header == null) {
                progressService.markError(jobId, "CSV has no header row");
                return result;
            }
            Map<String, Integer> idx = mapHeader(header);

            String[] row;
            int processed = 0;
            while ((row = csv.readNext()) != null) {
                processed++;
                try {
                    String billId = get(row, idx, "bill_id");
                    String paidAmountStr = get(row, idx, "paid_amount");
                    String paidDt = get(row, idx, "paid_dt");
                    String agentId = get(row, idx, "agent_id");
                    String agentTx = get(row, idx, "agent_tx_code");
                    if (billId == null || billId.isBlank()) {
                        progressService.incrementProcessed(jobId);
                        continue;
                    }

                    if (!seenBillIds.add(billId)) {
                        duplicateBillIds.add(billId);
                    }

                    BillingReading r = null;
                    if (monthlyMap != null) {
                        r = monthlyMap.get(billId.trim());
                        if (r == null) {
                            result.getNotFound().add(billId);
                            progressService.incrementProcessed(jobId);
                            continue;
                        }
                    } else {
                        Optional<BillingReading> opt = readingRepository
                                .findByBillingInvoiceNumbers_InvoiceNumbers(billId.trim());
                        if (opt.isEmpty()) {
                            result.getNotFound().add(billId);
                            progressService.incrementProcessed(jobId);
                            continue;
                        }
                        r = opt.get();
                    }

                    // Lookup agent_id against BillingBanks.bankCode
                    BillingBanks bank = (agentId != null && !agentId.isBlank()) ? bankCodeMap.get(agentId.trim()) : null;
                    if (agentId != null && !agentId.isBlank() && bank == null) {
                        BankProcessResultDTO.SkippedBillDTO skipped = new BankProcessResultDTO.SkippedBillDTO();
                        skipped.invoiceNumber = billId;
                        skipped.customerName = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getFullName() : null;
                        skipped.customerAccountNumber = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getAccountNumber() : null;
                        skipped.agentId = agentId;
                        skipped.paidAmount = parseDouble(paidAmountStr);
                        skipped.paidDate = paidDt;
                        skipped.reason = "Bank not found: agent_id \"" + agentId + "\" does not match any bankCode in database";
                        result.getSkippedBills().add(skipped);
                        progressService.incrementProcessed(jobId);
                        continue;
                    }

                    BankProcessResultDTO.PaymentViewDTO view = new BankProcessResultDTO.PaymentViewDTO();
                    view.id = r.getId();
                    view.invoiceNumber = billId;
                    view.customerName = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getFullName()
                            : null;
                    view.customerAccountNumber = r.getBillingCustomerInfo() != null
                            ? r.getBillingCustomerInfo().getAccountNumber()
                            : null;
                    view.kifyaWer = r.getKifyaWer();
                    view.tekilalaTekefay = r.getTekilalaTekefay();
                    view.tekilalaBankYetekefele = parseDouble(paidAmountStr);
                    view.tekilalaYetekefele = r.getKecreditYetekefele()
                            + (view.tekilalaBankYetekefele != null ? view.tekilalaBankYetekefele : 0);
                    view.isPaidThroughBank = r.isPaidThroughBank();
                    view.isDerashPaid = r.isDerashPaid();
                    view.bankPaidAgentId = agentId;
                    view.bankName = bank != null ? bank.getBankName() : agentId;
                    view.bankPaidConfirmationCode = agentTx;
                    view.moneyCollectedDate = paidDt;

                    // For Derash import, rely only on the Derash-specific flag when deciding
                    // already-paid status
                    if (r.isVoid()) {
                        result.getVoidBills().add(view);
                    } else if (!Boolean.TRUE.equals(r.isDerashPaid())) {
                        result.getNewPayments().add(view);
                    } else {
                        result.getAlreadyPaid().add(view);
                    }
                } catch (Exception rowEx) {
                } finally {
                    progressService.incrementProcessed(jobId);
                }
            }
            result.getDuplicates().addAll(duplicateBillIds);
            result.setTotalPaidCount(totalRows);
            progressService.updateMessage(jobId, "Processed " + processed + " CSV rows");
        }
        return result;
    }

    /**
     * Build a map of invoiceNumber -> BillingReading for a given kifyaWer month.
     */
    private Map<String, BillingReading> buildMonthlyInvoiceMap(String kifyaWer) {
        List<BillingReading> list = readingRepository.findByKifyaWerWithInvoiceNumbers(kifyaWer);
        Map<String, BillingReading> map = new HashMap<>();
        if (list != null) {
            for (BillingReading r : list) {
                String inv = null;
                if (r.getBillingInvoiceNumbers() != null && r.getBillingInvoiceNumbers().getInvoiceNumbers() != null) {
                    inv = r.getBillingInvoiceNumbers().getInvoiceNumbers();
                }
                if ((inv == null || inv.isBlank()) && r.getInvoiceNumber() != null) {
                    inv = r.getInvoiceNumber();
                }
                if (inv != null && !inv.isBlank()) {
                    map.put(inv.trim(), r);
                }
            }
        }
        return map;
    }

    /**
     * Overload: Process CSV using monthly preloading if kifyaWer is provided.
     * When kifyaWer is non-empty, build an in-memory map of invoiceNumber ->
     * BillingReading
     * for that month and use it for lookups. Rows not in that month will be
     * categorized as notFound.
     */
    public BankProcessResultDTO processCsv(String fromDate, String toDate, String kifyaWer) throws Exception {
        // Find the most recent CSV file for the given date range
        Path csvFile = findLatestCsvFile(fromDate, toDate);
        if (csvFile == null || !Files.exists(csvFile)) {
            throw new FileNotFoundException("No CSV file found for date range: " + fromDate + " to " + toDate);
        }

        // Build monthly lookup map if kifyaWer is provided
        Map<String, BillingReading> monthlyMap = null;
        if (kifyaWer != null && !kifyaWer.trim().isEmpty()) {
            monthlyMap = buildMonthlyInvoiceMap(kifyaWer.trim());
        }

        // Build bank lookup map
        Map<String, BillingBanks> bankCodeMap = buildBankCodeMap();

        BankProcessResultDTO result = new BankProcessResultDTO();
        Set<String> seenBillIds = new HashSet<>();
        Set<String> duplicateBillIds = new HashSet<>();

        try (Reader reader = new InputStreamReader(new FileInputStream(csvFile.toFile()), StandardCharsets.UTF_8)) {
            CSVReader csv = new CSVReaderBuilder(reader)
                    .withCSVParser(new CSVParserBuilder().withSeparator(',').build())
                    .build();

            String[] header = csv.readNext();
            if (header == null)
                return result;
            Map<String, Integer> idx = mapHeader(header);

            String[] row;
            int totalCount = 0;
            while ((row = csv.readNext()) != null) {
                totalCount++;
                String billId = get(row, idx, "bill_id");
                String paidAmountStr = get(row, idx, "paid_amount");
                String paidDt = get(row, idx, "paid_dt");
                String agentId = get(row, idx, "agent_id");
                String agentTx = get(row, idx, "agent_tx_code");
                if (billId == null || billId.isBlank())
                    continue;

                if (!seenBillIds.add(billId)) {
                    duplicateBillIds.add(billId);
                }

                BillingReading r = null;
                if (monthlyMap != null) {
                    r = monthlyMap.get(billId.trim());
                    if (r == null) {
                        result.getNotFound().add(billId);
                        continue;
                    }
                } else {
                    Optional<BillingReading> opt = readingRepository
                            .findByBillingInvoiceNumbers_InvoiceNumbers(billId.trim());
                    if (opt.isEmpty()) {
                        result.getNotFound().add(billId);
                        continue;
                    }
                    r = opt.get();
                }

                // Lookup agent_id against BillingBanks.bankCode
                BillingBanks bank = (agentId != null && !agentId.isBlank()) ? bankCodeMap.get(agentId.trim()) : null;
                if (agentId != null && !agentId.isBlank() && bank == null) {
                    BankProcessResultDTO.SkippedBillDTO skipped = new BankProcessResultDTO.SkippedBillDTO();
                    skipped.invoiceNumber = billId;
                    skipped.customerName = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getFullName() : null;
                    skipped.customerAccountNumber = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getAccountNumber() : null;
                    skipped.agentId = agentId;
                    skipped.paidAmount = parseDouble(paidAmountStr);
                    skipped.paidDate = paidDt;
                    skipped.reason = "Bank not found: agent_id \"" + agentId + "\" does not match any bankCode in database";
                    result.getSkippedBills().add(skipped);
                    continue;
                }

                BankProcessResultDTO.PaymentViewDTO view = new BankProcessResultDTO.PaymentViewDTO();
                view.id = r.getId();
                view.invoiceNumber = billId;
                view.customerName = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getFullName()
                        : null;
                view.customerAccountNumber = r.getBillingCustomerInfo() != null
                        ? r.getBillingCustomerInfo().getAccountNumber()
                        : null;
                view.kifyaWer = r.getKifyaWer();
                view.tekilalaTekefay = r.getTekilalaTekefay();
                view.tekilalaBankYetekefele = parseDouble(paidAmountStr);
                view.tekilalaYetekefele = r.getKecreditYetekefele()
                        + (view.tekilalaBankYetekefele != null ? view.tekilalaBankYetekefele : 0);
                view.isPaidThroughBank = r.isPaidThroughBank();
                view.isDerashPaid = r.isDerashPaid();
                view.bankPaidAgentId = agentId;
                view.bankName = bank != null ? bank.getBankName() : agentId;
                view.bankPaidConfirmationCode = agentTx;
                view.moneyCollectedDate = paidDt;

                // Use only isDerashPaid to determine already-paid status for Derash gateway
                if (r.isVoid()) {
                    result.getVoidBills().add(view);
                } else if (!Boolean.TRUE.equals(r.isDerashPaid())) {
                    result.getNewPayments().add(view);
                } else {
                    result.getAlreadyPaid().add(view);
                }
            }
            result.getDuplicates().addAll(duplicateBillIds);
            result.setTotalPaidCount(totalCount);
        }
        return result;
    }

    /**
     * Process CSV with progress updates and per-row logs. Does not change parsing
     * logic.
     * The controller should run this in a background thread and publish job status
     * via ProgressService.
     */
    public BankProcessResultDTO processCsvWithProgress(String jobId, String fromDate, String toDate,
            ProgressService progressService) throws Exception {
        // Find the most recent CSV file for the given date range
        Path csvFile = findLatestCsvFile(fromDate, toDate);
        if (csvFile == null || !Files.exists(csvFile)) {
            progressService.markError(jobId, "CSV file not found for date range: " + fromDate + " to " + toDate);
            throw new FileNotFoundException("No CSV file found for date range: " + fromDate + " to " + toDate);
        }

        // Pre-count total data rows (excluding header) to provide numeric progress
        int totalRows = 0;
        try (BufferedReader br = Files.newBufferedReader(csvFile, StandardCharsets.UTF_8)) {
            String line;
            boolean first = true;
            while ((line = br.readLine()) != null) {
                if (first) {
                    first = false;
                    continue;
                }
                totalRows++;
            }
        }
        progressService.setTotal(jobId, totalRows);
        progressService.updateMessage(jobId, "Starting CSV processing");

        // Build bank lookup map
        Map<String, BillingBanks> bankCodeMap = buildBankCodeMap();

        BankProcessResultDTO result = new BankProcessResultDTO();
        Set<String> seenBillIds = new HashSet<>();
        Set<String> duplicateBillIds = new HashSet<>();

        try (Reader reader = new InputStreamReader(new FileInputStream(csvFile.toFile()), StandardCharsets.UTF_8)) {
            CSVReader csv = new CSVReaderBuilder(reader)
                    .withCSVParser(new CSVParserBuilder().withSeparator(',').build())
                    .build();

            String[] header = csv.readNext();
            if (header == null) {
                progressService.markError(jobId, "CSV has no header row");
                return result;
            }
            Map<String, Integer> idx = mapHeader(header);

            String[] row;
            int processed = 0;
            while ((row = csv.readNext()) != null) {
                processed++;
                try {
                    // Original CSV format:
                    // biller_id,biller_name,customer_name,bill_id,paid_amount,paid_dt,agent_id,agent_tx_code
                    String billId = get(row, idx, "bill_id");
                    String paidAmountStr = get(row, idx, "paid_amount");
                    String paidDt = get(row, idx, "paid_dt");
                    String agentId = get(row, idx, "agent_id");
                    String agentTx = get(row, idx, "agent_tx_code");
                    if (billId == null || billId.isBlank()) {
                        // progressService.addLog(jobId, "Row " + processed + ": empty bill_id,
                        // skipped"); // disabled to reduce overhead
                        progressService.incrementProcessed(jobId);
                        continue;
                    }

                    if (!seenBillIds.add(billId)) {
                        duplicateBillIds.add(billId);
                    }

                    Optional<BillingReading> opt = readingRepository
                            .findByBillingInvoiceNumbers_InvoiceNumbers(billId.trim());
                    if (opt.isEmpty()) {
                        result.getNotFound().add(billId);
                        // progressService.addLog(jobId, "Row " + processed + ": bill " + billId + " not
                        // found"); // disabled to reduce overhead
                        progressService.incrementProcessed(jobId);
                        continue;
                    }
                    BillingReading r = opt.get();

                    // Lookup agent_id against BillingBanks.bankCode
                    BillingBanks bank = (agentId != null && !agentId.isBlank()) ? bankCodeMap.get(agentId.trim()) : null;
                    if (agentId != null && !agentId.isBlank() && bank == null) {
                        BankProcessResultDTO.SkippedBillDTO skipped = new BankProcessResultDTO.SkippedBillDTO();
                        skipped.invoiceNumber = billId;
                        skipped.customerName = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getFullName() : null;
                        skipped.customerAccountNumber = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getAccountNumber() : null;
                        skipped.agentId = agentId;
                        skipped.paidAmount = parseDouble(paidAmountStr);
                        skipped.paidDate = paidDt;
                        skipped.reason = "Bank not found: agent_id \"" + agentId + "\" does not match any bankCode in database";
                        result.getSkippedBills().add(skipped);
                        progressService.incrementProcessed(jobId);
                        continue;
                    }

                    BankProcessResultDTO.PaymentViewDTO view = new BankProcessResultDTO.PaymentViewDTO();
                    view.id = r.getId();
                    view.invoiceNumber = billId;
                    view.customerName = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getFullName()
                            : null;
                    view.customerAccountNumber = r.getBillingCustomerInfo() != null
                            ? r.getBillingCustomerInfo().getAccountNumber()
                            : null;
                    view.kifyaWer = r.getKifyaWer();
                    view.tekilalaTekefay = r.getTekilalaTekefay();
                    view.tekilalaBankYetekefele = parseDouble(paidAmountStr);
                    view.tekilalaYetekefele = r.getKecreditYetekefele()
                            + (view.tekilalaBankYetekefele != null ? view.tekilalaBankYetekefele : 0);
                    view.isPaidThroughBank = r.isPaidThroughBank();
                    view.isDerashPaid = r.isDerashPaid();
                    view.bankPaidAgentId = agentId;
                    view.bankName = bank != null ? bank.getBankName() : agentId;
                    view.bankPaidConfirmationCode = agentTx;
                    view.moneyCollectedDate = paidDt;

                    // For Derash, classification of already-paid rows is based only on isDerashPaid
                    if (r.isVoid()) {
                        result.getVoidBills().add(view);
                    } else if (!Boolean.TRUE.equals(r.isDerashPaid())) {
                        result.getNewPayments().add(view);
                        // progressService.addLog(jobId, "Row " + processed + ": bill " + billId + " ->
                        // NEW payment (readingId=" + r.getId() + ")"); // disabled to reduce overhead
                    } else {
                        result.getAlreadyPaid().add(view);
                        // progressService.addLog(jobId, "Row " + processed + ": bill " + billId + " ->
                        // ALREADY PAID (readingId=" + r.getId() + ")"); // disabled to reduce overhead
                    }
                } catch (Exception rowEx) {
                    // progressService.addLog(jobId, "Row " + processed + ": error " +
                    // rowEx.getMessage()); // disabled to reduce overhead
                } finally {
                    progressService.incrementProcessed(jobId);
                }
            }
            result.getDuplicates().addAll(duplicateBillIds);
            result.setTotalPaidCount(totalRows);
            progressService.updateMessage(jobId, "Processed " + processed + " rows");
        }
        return result;
    }

    /**
     * Find the most recent CSV file for the given date range
     */
    private Path findLatestCsvFile(String fromDate, String toDate) throws IOException {
        Path dir = Paths.get(storageDir);
        if (!Files.exists(dir)) {
            return null;
        }

        String pattern = String.format("derash_%s_to_%s_", fromDate, toDate);

        return Files.list(dir)
                .filter(path -> path.getFileName().toString().startsWith(pattern))
                .filter(path -> path.getFileName().toString().endsWith(".csv"))
                .max((p1, p2) -> {
                    try {
                        return Files.getLastModifiedTime(p1).compareTo(Files.getLastModifiedTime(p2));
                    } catch (IOException e) {
                        return 0;
                    }
                })
                .orElse(null);
    }

    /**
     * Get public URL for the most recent CSV file for the given date range
     */
    public String getPublicCsvUrl(String fromDate, String toDate) throws IOException {
        Path csvFile = findLatestCsvFile(fromDate, toDate);
        if (csvFile == null) {
            return null;
        }

        String filename = csvFile.getFileName().toString();
        return "/derash-csv/" + filename;
    }

    /**
     * Fetch a single paid bill from Derash by bill_id
     * Returns a map with keys: agent_name, paid_dt, paid_amount, confirmation_code
     */
    public java.util.Map<String, Object> fetchSinglePaidBill(String billId) {
        if (billId == null || billId.trim().isEmpty()) {
            throw new IllegalArgumentException("billId is required");
        }
        return derashClient.fetchSinglePaidBill(billId.trim());
    }

    private static Map<String, Integer> mapHeader(String[] header) {
        Map<String, Integer> m = new HashMap<>();
        for (int i = 0; i < header.length; i++) {
            String key = header[i] == null ? null : header[i].trim().toLowerCase(Locale.ROOT);
            if (key != null && !key.isEmpty())
                m.put(key, i);
        }
        return m;
    }

    private static String get(String[] row, Map<String, Integer> idx, String key) {
        Integer i = idx.get(key);
        if (i == null || i < 0 || i >= row.length)
            return null;
        return row[i];
    }

    private static Double parseDouble(String s) {
        if (s == null)
            return null;
        try {
            return Double.parseDouble(s.replace(",", ""));
        } catch (Exception e) {
            return null;
        }
    }

    private static Date parseDateFlexible(String s) {
        if (s == null || s.isBlank())
            return null;
        List<String> patterns = Arrays.asList("yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy", "yyyy/MM/dd", "dd-MM-yyyy");
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
}
