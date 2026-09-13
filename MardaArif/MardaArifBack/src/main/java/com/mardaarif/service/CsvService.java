package com.mardaarif.service;

import com.mardaarif.model.Bill;
import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.opencsv.exceptions.CsvValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
public class CsvService {
    private static final Logger logger = LoggerFactory.getLogger(CsvService.class);

    @Value("${storage.csv-dir:src/main/resources/static/csv-files}")
    private String csvDir;

    /**
     * Generate a CSV file for paid bills (mirrors Unicash billSyncFile behavior).
     * Returns the relative path to the generated CSV.
     */
    public String generateBillSyncCsv(List<Bill> paidBills, Integer cityId) throws IOException {
        // Ensure directory exists
        Path dirPath = Paths.get(csvDir);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = "sync_city" + cityId + "_" + timestamp + ".csv";
        Path filePath = dirPath.resolve(filename);

        try (CSVWriter writer = new CSVWriter(new FileWriter(filePath.toFile()))) {
            // Header matching Unicash CSV format
            String[] header = {
                "bill_id", "customer_id", "customer_name", "phone_number",
                "amount_due", "paid_amount", "paid_on",
                "bank_name", "bank_transaction_reference", "status"
            };
            writer.writeNext(header);

            for (Bill bill : paidBills) {
                String[] row = {
                    bill.getBillId(),
                    bill.getCustomerId(),
                    bill.getCustomerName(),
                    bill.getPhoneNumber(),
                    bill.getAmountDue() != null ? bill.getAmountDue().toString() : "0",
                    bill.getPaidAmount() != null ? bill.getPaidAmount().toString() : "0",
                    bill.getPaidOn(),
                    bill.getBankName(),
                    bill.getBankTransactionReference(),
                    bill.getStatus().name()
                };
                writer.writeNext(row);
            }
        }

        logger.info("[CsvService] Generated sync CSV: {} with {} records", filename, paidBills.size());
        return filename;
    }

    /**
     * Parse a CSV file for bulk bill updates (mirrors Unicash bulkBillUpdate behavior).
     * Returns a list of maps, each representing a bill row.
     */
    public List<Map<String, String>> parseBulkBillCsv(MultipartFile file) throws IOException, CsvValidationException {
        List<Map<String, String>> rows = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] header = reader.readNext();
            if (header == null) {
                throw new RuntimeException("CSV file is empty");
            }

            // Normalize headers
            for (int i = 0; i < header.length; i++) {
                header[i] = header[i].trim().toLowerCase().replace(" ", "_");
            }

            String[] line;
            while ((line = reader.readNext()) != null) {
                Map<String, String> row = new LinkedHashMap<>();
                for (int i = 0; i < Math.min(header.length, line.length); i++) {
                    row.put(header[i], line[i].trim());
                }
                rows.add(row);
            }
        }

        logger.info("[CsvService] Parsed {} rows from bulk CSV upload", rows.size());
        return rows;
    }

    /**
     * Get the path to a CSV file.
     */
    public File getCsvFile(String filename) {
        Path filePath = Paths.get(csvDir).resolve(filename);
        File file = filePath.toFile();
        if (!file.exists()) {
            throw new RuntimeException("CSV file not found: " + filename);
        }
        return file;
    }
}
