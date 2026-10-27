package com.wbill.home.service;

import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVWriter;
import com.wbill.home.dto.BankInvoiceCompareResultDTO;
import com.wbill.home.dto.BankInvoiceCompareRowDTO;
import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.BillingReading;
import com.wbill.home.repository.BillingCustomerInfoRepository;
import com.wbill.home.repository.BillingReadingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class BankInvoiceCompareService {

    private final BillingReadingRepository readingRepository;
    private final BillingCustomerInfoRepository customerRepository;

    public BankInvoiceCompareService(BillingReadingRepository readingRepository,
                                     BillingCustomerInfoRepository customerRepository) {
        this.readingRepository = readingRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public BankInvoiceCompareResultDTO compareCsv(MultipartFile file, String kifyaWer) throws Exception {
        BankInvoiceCompareResultDTO result = new BankInvoiceCompareResultDTO();
        result.setKifyaWer(kifyaWer);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is empty or missing.");
        }
        if (kifyaWer == null || kifyaWer.trim().isEmpty()) {
            throw new IllegalArgumentException("Billing period (kifyaWer) is required.");
        }

        // 1. Preload all readings for this kifyaWer with customer and invoice numbers eagerly fetched
        List<BillingReading> readings = readingRepository.findByKifyaWerWithCustomerAndInvoice(kifyaWer.trim());
        Map<String, BillingReading> accountMap = new HashMap<>();

        if (readings != null) {
            for (BillingReading r : readings) {
                if (r.getBillingCustomerInfo() == null || r.getBillingCustomerInfo().getAccountNumber() == null) {
                    continue;
                }
                String accKey = normalizeKey(r.getBillingCustomerInfo().getAccountNumber());
                if (accKey.isEmpty()) {
                    continue;
                }

                BillingReading existing = accountMap.get(accKey);
                if (existing == null) {
                    accountMap.put(accKey, r);
                } else {
                    boolean existingActive = "active".equalsIgnoreCase(existing.getStatus()) && !existing.isVoid();
                    boolean currentActive = "active".equalsIgnoreCase(r.getStatus()) && !r.isVoid();

                    if (!existingActive && currentActive) {
                        accountMap.put(accKey, r);
                    } else if (existingActive == currentActive && r.getId() > existing.getId()) {
                        accountMap.put(accKey, r);
                    }
                }
            }
        }

        // 2. Parse CSV
        List<BankInvoiceCompareRowDTO> rowList = new ArrayList<>();
        int rowIndex = 0;
        int matchedCount = 0;
        int invoiceMismatchCount = 0;
        int amountMismatchCount = 0;
        int notFoundCount = 0;
        int voidCount = 0;
        double totalCsvAmount = 0.0;
        double totalSystemAmount = 0.0;

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            CSVReader csv = new CSVReaderBuilder(reader)
                    .withCSVParser(new CSVParserBuilder().withSeparator(',').build())
                    .build();

            String[] header = csv.readNext();
            if (header == null) {
                return result;
            }

            Map<String, Integer> headerIndexMap = mapHeader(header);

            String[] row;
            while ((row = csv.readNext()) != null) {
                // Skip empty lines
                if (row.length == 0 || (row.length == 1 && (row[0] == null || row[0].trim().isEmpty()))) {
                    continue;
                }

                String rawCustomerId = getVal(row, headerIndexMap, "customerid", "accountnumber", "customerno", "accno", "customeraccount");
                String rawBillId = getVal(row, headerIndexMap, "billid", "invoicenumber", "invoiceno", "billno");
                String rawAmountDue = getVal(row, headerIndexMap, "amountdue", "paidamount", "amount", "totalamount", "tekilalatekefay");
                String rawCustomerName = getVal(row, headerIndexMap, "customername", "name", "fullname");
                String rawPaidDate = getVal(row, headerIndexMap, "paiddate", "paiddt", "paymentdate");
                String rawAgentId = getVal(row, headerIndexMap, "agentid", "bankcode");
                String rawAgentName = getVal(row, headerIndexMap, "agentname", "bankname");
                String rawTxCode = getVal(row, headerIndexMap, "agenttxcode", "agentconfirmationcode", "confirmationcode", "txcode");

                if (rawCustomerId == null || rawCustomerId.trim().isEmpty()) {
                    continue;
                }

                rowIndex++;
                String accNum = rawCustomerId.trim();
                String csvInvoice = rawBillId != null ? rawBillId.trim() : "";
                Double csvAmount = parseDouble(rawAmountDue);
                if (csvAmount != null) {
                    totalCsvAmount += csvAmount;
                }

                BankInvoiceCompareRowDTO rowDto = new BankInvoiceCompareRowDTO();
                rowDto.setRowIndex(rowIndex);
                rowDto.setAccountNumber(accNum);
                rowDto.setCsvInvoiceNumber(csvInvoice);
                rowDto.setCsvAmountDue(csvAmount != null ? round2(csvAmount) : 0.0);
                rowDto.setPaidDate(rawPaidDate);
                rowDto.setAgentId(rawAgentId);
                rowDto.setAgentName(rawAgentName);
                rowDto.setConfirmationCode(rawTxCode);
                rowDto.setKifyaWer(kifyaWer);

                String lookupKey = normalizeKey(accNum);
                BillingReading reading = accountMap.get(lookupKey);

                if (reading != null) {
                    rowDto.setReadingId(reading.getId());
                    rowDto.setReadingStatus(reading.getStatus());
                    rowDto.setVoid(reading.isVoid() || "void".equalsIgnoreCase(reading.getStatus()));

                    // Customer Name: System first, fallback to CSV
                    String sysCustName = reading.getBillingCustomerInfo() != null ? reading.getBillingCustomerInfo().getFullName() : null;
                    rowDto.setCustomerName(sysCustName != null && !sysCustName.isBlank() ? sysCustName : rawCustomerName);

                    // System Invoice Number
                    String sysInvoice = null;
                    if (reading.getBillingInvoiceNumbers() != null && reading.getBillingInvoiceNumbers().getInvoiceNumbers() != null) {
                        sysInvoice = reading.getBillingInvoiceNumbers().getInvoiceNumbers().trim();
                    } else if (reading.getInvoiceNumber() != null && !reading.getInvoiceNumber().isBlank()) {
                        sysInvoice = reading.getInvoiceNumber().trim();
                    }
                    rowDto.setSystemInvoiceNumber(sysInvoice != null ? sysInvoice : "");

                    // System Amount Due
                    double sysTekefay = reading.getTekilalaTekefay();
                    rowDto.setTekilalaTekefay(round2(sysTekefay));
                    totalSystemAmount += sysTekefay;

                    // Invoice comparison
                    boolean invMatch = (sysInvoice != null && !sysInvoice.isEmpty() && sysInvoice.equalsIgnoreCase(csvInvoice));
                    if (invMatch) {
                        rowDto.setInvoiceDifference("No");
                        rowDto.setInvoiceMismatch(false);
                    } else {
                        rowDto.setInvoiceDifference("Yes");
                        rowDto.setInvoiceMismatch(true);
                        invoiceMismatchCount++;
                    }

                    // Amount comparison
                    double amountDiff = (csvAmount != null ? csvAmount : 0.0) - sysTekefay;
                    rowDto.setAmountDifference(round2(amountDiff));
                    boolean amtMismatch = Math.abs(amountDiff) > 0.01;
                    rowDto.setAmountMismatch(amtMismatch);
                    if (amtMismatch) {
                        amountMismatchCount++;
                    }

                    // Status determination
                    if (rowDto.isVoid()) {
                        rowDto.setMatchStatus("VOID_BILL");
                        rowDto.setStatusMessage("Bill is marked VOID in system");
                        voidCount++;
                    } else if (rowDto.isInvoiceMismatch() && amtMismatch) {
                        rowDto.setMatchStatus("BOTH_MISMATCH");
                        rowDto.setStatusMessage("Both invoice # and amount differ from system");
                    } else if (rowDto.isInvoiceMismatch()) {
                        rowDto.setMatchStatus("INVOICE_MISMATCH");
                        rowDto.setStatusMessage("Invoice # differs (System=" + (sysInvoice != null ? sysInvoice : "None") + ", CSV=" + csvInvoice + ")");
                    } else if (amtMismatch) {
                        rowDto.setMatchStatus("AMOUNT_MISMATCH");
                        rowDto.setStatusMessage("Amount differs (System=" + sysTekefay + ", CSV=" + csvAmount + ")");
                    } else {
                        rowDto.setMatchStatus("MATCHED");
                        rowDto.setStatusMessage("Matched system record");
                        matchedCount++;
                    }
                } else {
                    // Not found in this billing month
                    Optional<BillingCustomerInfo> custOpt = customerRepository.findByAccountNumber(accNum);
                    if (custOpt.isPresent()) {
                        BillingCustomerInfo cust = custOpt.get();
                        rowDto.setCustomerName(cust.getFullName());
                        rowDto.setMatchStatus("READING_NOT_FOUND_FOR_MONTH");
                        rowDto.setStatusMessage("Customer exists, but no active reading for " + kifyaWer);
                    } else {
                        rowDto.setCustomerName(rawCustomerName != null && !rawCustomerName.isBlank() ? rawCustomerName : "Unknown Customer");
                        rowDto.setMatchStatus("CUSTOMER_NOT_FOUND");
                        rowDto.setStatusMessage("Customer account not found in system");
                    }

                    rowDto.setSystemInvoiceNumber("N/A");
                    rowDto.setTekilalaTekefay(0.0);
                    rowDto.setAmountDifference(csvAmount != null ? round2(csvAmount) : 0.0);
                    rowDto.setInvoiceDifference("Yes");
                    rowDto.setInvoiceMismatch(true);
                    rowDto.setAmountMismatch(true);

                    notFoundCount++;
                    invoiceMismatchCount++;
                }

                rowList.add(rowDto);
            }
        }

        result.setTotalCsvRows(rowList.size());
        result.setMatchedCount(matchedCount);
        result.setInvoiceMismatchCount(invoiceMismatchCount);
        result.setAmountMismatchCount(amountMismatchCount);
        result.setNotFoundCount(notFoundCount);
        result.setVoidCount(voidCount);
        result.setTotalCsvAmount(round2(totalCsvAmount));
        result.setTotalSystemAmount(round2(totalSystemAmount));
        result.setRows(rowList);

        return result;
    }

    private static String normalizeKey(String s) {
        if (s == null) return "";
        return s.trim().toLowerCase(Locale.ROOT);
    }

    private static Map<String, Integer> mapHeader(String[] header) {
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < header.length; i++) {
            if (header[i] == null) continue;
            String raw = header[i].trim();
            if (raw.startsWith("\uFEFF")) {
                raw = raw.substring(1);
            }
            String normalized = raw.toLowerCase(Locale.ROOT)
                    .replace("_", "")
                    .replace("-", "")
                    .replace(" ", "")
                    .trim();
            if (!normalized.isEmpty()) {
                map.put(normalized, i);
            }
        }
        return map;
    }

    private static String getVal(String[] row, Map<String, Integer> headerMap, String... possibleKeys) {
        for (String k : possibleKeys) {
            Integer idx = headerMap.get(k);
            if (idx != null && idx >= 0 && idx < row.length) {
                String val = row[idx];
                if (val != null && !val.trim().isEmpty()) {
                    return val.trim();
                }
            }
        }
        return null;
    }

    private static Double parseDouble(String s) {
        if (s == null) return null;
        try {
            return Double.parseDouble(s.replace(",", "").trim());
        } catch (Exception e) {
            return null;
        }
    }

    private static double round2(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private static Integer findColumnIndex(Map<String, Integer> headerMap, String... possibleKeys) {
        for (String k : possibleKeys) {
            Integer idx = headerMap.get(k);
            if (idx != null) {
                return idx;
            }
        }
        return null;
    }

    /**
     * Generates a corrected CSV file by matching customer_id (account number)
     * against system readings for the given kifyaWer month, and replacing ONLY
     * the bill_id column with the system's database invoice number.
     * All other columns and data in the CSV remain completely unchanged.
     */
    @Transactional(readOnly = true)
    public byte[] generateCorrectedCsv(MultipartFile file, String kifyaWer) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is empty or missing.");
        }
        if (kifyaWer == null || kifyaWer.trim().isEmpty()) {
            throw new IllegalArgumentException("Billing period (kifyaWer) is required.");
        }

        // 1. Preload active readings for kifyaWer
        List<BillingReading> readings = readingRepository.findByKifyaWerWithCustomerAndInvoice(kifyaWer.trim());
        Map<String, BillingReading> accountMap = new HashMap<>();

        if (readings != null) {
            for (BillingReading r : readings) {
                if (r.getBillingCustomerInfo() == null || r.getBillingCustomerInfo().getAccountNumber() == null) {
                    continue;
                }
                String accKey = normalizeKey(r.getBillingCustomerInfo().getAccountNumber());
                if (accKey.isEmpty()) {
                    continue;
                }

                BillingReading existing = accountMap.get(accKey);
                if (existing == null) {
                    accountMap.put(accKey, r);
                } else {
                    boolean existingActive = "active".equalsIgnoreCase(existing.getStatus()) && !existing.isVoid();
                    boolean currentActive = "active".equalsIgnoreCase(r.getStatus()) && !r.isVoid();

                    if (!existingActive && currentActive) {
                        accountMap.put(accKey, r);
                    } else if (existingActive == currentActive && r.getId() > existing.getId()) {
                        accountMap.put(accKey, r);
                    }
                }
            }
        }

        // 2. Read and rewrite CSV preserving exact columns and row structure
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
             CSVReader csvReader = new CSVReaderBuilder(reader)
                     .withCSVParser(new CSVParserBuilder().withSeparator(',').build())
                     .build();
             Writer writer = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
             CSVWriter csvWriter = new CSVWriter(writer,
                     CSVWriter.DEFAULT_SEPARATOR,
                     CSVWriter.DEFAULT_QUOTE_CHARACTER,
                     CSVWriter.DEFAULT_ESCAPE_CHARACTER,
                     CSVWriter.DEFAULT_LINE_END)) {

            String[] header = csvReader.readNext();
            if (header == null) {
                return baos.toByteArray();
            }

            if (header.length > 0 && header[0] != null && header[0].startsWith("\uFEFF")) {
                header[0] = header[0].substring(1);
            }

            Map<String, Integer> headerIndexMap = mapHeader(header);
            Integer customerIdIdx = findColumnIndex(headerIndexMap, "customerid", "accountnumber", "customerno", "accno", "customeraccount");
            Integer billIdIdx = findColumnIndex(headerIndexMap, "billid", "invoicenumber", "invoiceno", "billno");

            // Write header unchanged (without BOM)
            csvWriter.writeNext(header);

            if (customerIdIdx == null || billIdIdx == null) {
                // If cannot locate required columns, write remaining rows as-is
                String[] row;
                while ((row = csvReader.readNext()) != null) {
                    csvWriter.writeNext(row);
                }
                csvWriter.flush();
                return baos.toByteArray();
            }

            String[] row;
            while ((row = csvReader.readNext()) != null) {
                if (row.length > customerIdIdx && row.length > billIdIdx) {
                    String customerId = row[customerIdIdx];
                    if (customerId != null && !customerId.trim().isEmpty()) {
                        String lookupKey = normalizeKey(customerId);
                        BillingReading reading = accountMap.get(lookupKey);
                        if (reading != null) {
                            String sysInvoice = null;
                            if (reading.getBillingInvoiceNumbers() != null && reading.getBillingInvoiceNumbers().getInvoiceNumbers() != null) {
                                sysInvoice = reading.getBillingInvoiceNumbers().getInvoiceNumbers().trim();
                            } else if (reading.getInvoiceNumber() != null && !reading.getInvoiceNumber().isBlank()) {
                                sysInvoice = reading.getInvoiceNumber().trim();
                            }
                            if (sysInvoice != null && !sysInvoice.isEmpty()) {
                                // Replace ONLY bill_id with the corrected system invoice number!
                                row[billIdIdx] = sysInvoice;
                            }
                        }
                    }
                }
                csvWriter.writeNext(row);
            }
            csvWriter.flush();
        }

        return baos.toByteArray();
    }
}
