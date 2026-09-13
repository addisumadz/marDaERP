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
import java.util.*;

@Service
public class BankPaymentMardaArifFlowService {

    private final MardaArifClient mardaArifClient;
    private final BillingReadingRepository readingRepository;
    private final BillingBanksRepository billingBanksRepository;

    @Value("${storage.mardaarif-csv-dir:src/main/resources/static/mardaarif-csv}")
    private String storageDir;

    public BankPaymentMardaArifFlowService(MardaArifClient mardaArifClient, BillingReadingRepository readingRepository,
            BillingBanksRepository billingBanksRepository) {
        this.mardaArifClient = mardaArifClient;
        this.readingRepository = readingRepository;
        this.billingBanksRepository = billingBanksRepository;
    }

    /**
     * Build a case-insensitive map of bankName -> BillingBanks for CSV bankname lookup.
     */
    private Map<String, BillingBanks> buildBankNameMap() {
        Map<String, BillingBanks> map = new HashMap<>();
        List<BillingBanks> banks = billingBanksRepository.findAll();
        for (BillingBanks b : banks) {
            if (b.getBankName() != null && !b.getBankName().trim().isEmpty()) {
                map.put(b.getBankName().trim().toLowerCase(Locale.ROOT), b);
            }
        }
        return map;
    }

    public String fetchAndSaveCsv(String fromDate, String toDate) throws IOException {
        try {
            com.wbill.home.dto.UnicashBillSyncFilePathDTO resp = mardaArifClient.requestBillSyncFile(fromDate, toDate);
            byte[] bytes = mardaArifClient.downloadCsvBytes(resp.getPath());

            Files.createDirectories(Paths.get(storageDir));
            String timestamp = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("mardaarif_%s_to_%s_%s.csv", fromDate, toDate, timestamp);
            Path file = Paths.get(storageDir, filename);
            Files.write(file, bytes);
            return file.toString();
        } catch (Exception e) {
            throw e;
        }
    }

    public BankProcessResultDTO processCsv(String fromDate, String toDate, String kifyaWer) throws Exception {
        Path csvFile = findLatestCsvFile(fromDate, toDate);
        if (csvFile == null || !Files.exists(csvFile)) {
            throw new FileNotFoundException("No CSV file found for date range: " + fromDate + " to " + toDate);
        }

        Map<String, BillingReading> monthlyMap = null;
        if (kifyaWer != null && !kifyaWer.trim().isEmpty()) {
            monthlyMap = buildMonthlyInvoiceMap(kifyaWer.trim());
        }

        // Build bank name lookup map (case-insensitive)
        Map<String, BillingBanks> bankNameMap = buildBankNameMap();

        BankProcessResultDTO result = new BankProcessResultDTO();
        Set<String> seenBillIds = new HashSet<>();
        Set<String> duplicateBillIds = new HashSet<>();

        try (Reader reader = new InputStreamReader(new FileInputStream(csvFile.toFile()), StandardCharsets.UTF_8)) {
            CSVReader csv = new CSVReaderBuilder(reader)
                    .withCSVParser(new CSVParserBuilder().withSeparator(',').build())
                    .build();

            String[] header = csv.readNext();
            if (header == null) return result;
            Map<String,Integer> idx = mapHeader(header);

            String[] row;
            int totalCount = 0;
            while ((row = csv.readNext()) != null) {
                totalCount++;
                String billIds = get(row, idx, "billids");
                String paidOn = get(row, idx, "paidon");
                String bankTransactionReference = get(row, idx, "banktransactionreference");
                String bankName = get(row, idx, "bankname");
                if (billIds == null || billIds.isBlank()) continue;

                if (!seenBillIds.add(billIds)) {
                    duplicateBillIds.add(billIds);
                }

                BillingReading r = null;
                if (monthlyMap != null) {
                    r = monthlyMap.get(billIds.trim());
                    if (r == null) {
                        result.getNotFound().add(billIds);
                        continue;
                    }
                } else {
                    Optional<BillingReading> opt = readingRepository.findByBillingInvoiceNumbers_InvoiceNumbers(billIds.trim());
                    if (opt.isEmpty()) {
                        result.getNotFound().add(billIds);
                        continue;
                    }
                    r = opt.get();
                }

                // Lookup bankname against BillingBanks.bankName (case-insensitive)
                BillingBanks bank = (bankName != null && !bankName.isBlank())
                        ? bankNameMap.get(bankName.trim().toLowerCase(Locale.ROOT)) : null;
                if (bankName != null && !bankName.isBlank() && bank == null) {
                    BankProcessResultDTO.SkippedBillDTO skipped = new BankProcessResultDTO.SkippedBillDTO();
                    skipped.invoiceNumber = billIds.trim();
                    skipped.customerName = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getFullName() : null;
                    skipped.customerAccountNumber = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getAccountNumber() : null;
                    skipped.agentId = bankName;
                    skipped.paidAmount = r.getTekilalaTekefay();
                    skipped.paidDate = paidOn;
                    skipped.reason = "Bank not found: bankname \"" + bankName + "\" does not match any bankName in database";
                    result.getSkippedBills().add(skipped);
                    continue;
                }

                BankProcessResultDTO.PaymentViewDTO view = new BankProcessResultDTO.PaymentViewDTO();
                view.id = r.getId();
                view.invoiceNumber = billIds.trim();
                view.customerName = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getFullName() : null;
                view.customerAccountNumber = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getAccountNumber() : null;
                view.kifyaWer = r.getKifyaWer();
                view.tekilalaTekefay = r.getTekilalaTekefay();
                view.tekilalaBankYetekefele = r.getTekilalaTekefay();
                view.tekilalaYetekefele = r.getKecreditYetekefele() + r.getTekilalaTekefay();
                view.isPaidThroughBank = r.isPaidThroughBank();
                view.isDerashPaid = r.isDerashPaid();
                view.bankPaidAgentId = bankName;
                view.bankName = bank != null ? bank.getBankName() : bankName;
                view.bankPaidConfirmationCode = bankTransactionReference;
                view.moneyCollectedDate = paidOn;

                if (!Boolean.TRUE.equals(r.isMardaArifPaid())) {
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

    public BankProcessResultDTO processCsvWithProgress(String jobId, String fromDate, String toDate, String kifyaWer, ProgressService progressService) throws Exception {
        Path csvFile = findLatestCsvFile(fromDate, toDate);
        if (csvFile == null || !Files.exists(csvFile)) {
            progressService.markError(jobId, "CSV file not found for date range: " + fromDate + " to " + toDate);
            throw new FileNotFoundException("No CSV file found for date range: " + fromDate + " to " + toDate);
        }

        progressService.updateMessage(jobId, "Counting CSV rows...");
        int totalRows = 0;
        try (BufferedReader br = Files.newBufferedReader(csvFile, StandardCharsets.UTF_8)) {
            String line;
            boolean first = true;
            while ((line = br.readLine()) != null) {
                if (first) { first = false; continue; }
                totalRows++;
            }
        }

        Map<String, BillingReading> monthlyMap = null;
        List<BillingReading> monthlyList = Collections.emptyList();
        if (kifyaWer != null && !kifyaWer.trim().isEmpty()) {
            monthlyList = readingRepository.findByKifyaWerWithInvoiceNumbers(kifyaWer.trim());
        }
        int preloadCount = (monthlyList == null) ? 0 : monthlyList.size();
        progressService.setTotal(jobId, preloadCount + totalRows);

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

        progressService.updateMessage(jobId, "Processing MardaArif CSV data...");

        // Build bank name lookup map (case-insensitive)
        Map<String, BillingBanks> bankNameMap = buildBankNameMap();

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
            Map<String,Integer> idx = mapHeader(header);

            String[] row;
            int processed = 0;
            while ((row = csv.readNext()) != null) {
                processed++;
                try {
                    String billIds = get(row, idx, "billids");
                    String paidOn = get(row, idx, "paidon");
                    String bankTransactionReference = get(row, idx, "banktransactionreference");
                    String bankName = get(row, idx, "bankname");
                    if (billIds == null || billIds.isBlank()) {
                        progressService.incrementProcessed(jobId);
                        continue;
                    }

                    if (!seenBillIds.add(billIds)) {
                        duplicateBillIds.add(billIds);
                    }

                    BillingReading r = null;
                    if (monthlyMap != null) {
                        r = monthlyMap.get(billIds.trim());
                        if (r == null) {
                            result.getNotFound().add(billIds);
                            progressService.incrementProcessed(jobId);
                            continue;
                        }
                    } else {
                        Optional<BillingReading> opt = readingRepository.findByBillingInvoiceNumbers_InvoiceNumbers(billIds.trim());
                        if (opt.isEmpty()) {
                            result.getNotFound().add(billIds);
                            progressService.incrementProcessed(jobId);
                            continue;
                        }
                        r = opt.get();
                    }

                    // Lookup bankname against BillingBanks.bankName (case-insensitive)
                    BillingBanks bank = (bankName != null && !bankName.isBlank())
                            ? bankNameMap.get(bankName.trim().toLowerCase(Locale.ROOT)) : null;
                    if (bankName != null && !bankName.isBlank() && bank == null) {
                        BankProcessResultDTO.SkippedBillDTO skipped = new BankProcessResultDTO.SkippedBillDTO();
                        skipped.invoiceNumber = billIds.trim();
                        skipped.customerName = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getFullName() : null;
                        skipped.customerAccountNumber = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getAccountNumber() : null;
                        skipped.agentId = bankName;
                        skipped.paidAmount = r.getTekilalaTekefay();
                        skipped.paidDate = paidOn;
                        skipped.reason = "Bank not found: bankname \"" + bankName + "\" does not match any bankName in database";
                        result.getSkippedBills().add(skipped);
                        progressService.incrementProcessed(jobId);
                        continue;
                    }

                    BankProcessResultDTO.PaymentViewDTO view = new BankProcessResultDTO.PaymentViewDTO();
                    view.id = r.getId();
                    view.invoiceNumber = billIds.trim();
                    view.customerName = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getFullName() : null;
                    view.customerAccountNumber = r.getBillingCustomerInfo() != null ? r.getBillingCustomerInfo().getAccountNumber() : null;
                    view.kifyaWer = r.getKifyaWer();
                    view.tekilalaTekefay = r.getTekilalaTekefay();
                    view.tekilalaBankYetekefele = r.getTekilalaTekefay();
                    view.tekilalaYetekefele = r.getKecreditYetekefele() + r.getTekilalaTekefay();
                    view.isPaidThroughBank = r.isPaidThroughBank();
                    view.isDerashPaid = r.isDerashPaid();
                    view.bankPaidAgentId = bankName;
                    view.bankName = bank != null ? bank.getBankName() : bankName;
                    view.bankPaidConfirmationCode = bankTransactionReference;
                    view.moneyCollectedDate = paidOn;

                    if (!Boolean.TRUE.equals(r.isMardaArifPaid())) {
                        result.getNewPayments().add(view);
                    } else {
                        result.getAlreadyPaid().add(view);
                    }
                } catch (Exception ignored) {
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

    private Path findLatestCsvFile(String fromDate, String toDate) throws IOException {
        Path dir = Paths.get(storageDir);
        if (!Files.exists(dir)) {
            return null;
        }
        String pattern = String.format("mardaarif_%s_to_%s_", fromDate, toDate);
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

    public String getPublicCsvUrl(String fromDate, String toDate) throws IOException {
        Path csvFile = findLatestCsvFile(fromDate, toDate);
        if (csvFile == null) {
            return null;
        }
        String filename = csvFile.getFileName().toString();
        return "/mardaarif-csv/" + filename;
    }

    private static Map<String,Integer> mapHeader(String[] header) {
        Map<String,Integer> m = new HashMap<>();
        for (int i=0;i<header.length;i++) {
            String key = header[i] == null ? null : header[i].trim().toLowerCase(Locale.ROOT);
            if (key != null && !key.isEmpty()) m.put(key, i);
        }
        return m;
    }

    private static String get(String[] row, Map<String,Integer> idx, String key) {
        Integer i = idx.get(key);
        if (i == null || i < 0 || i >= row.length) return null;
        return row[i];
    }
}
