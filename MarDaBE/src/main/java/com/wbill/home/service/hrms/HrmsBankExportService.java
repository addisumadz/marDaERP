package com.wbill.home.service.hrms;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.wbill.home.model.hrms.HrmsPayrollRun;
import com.wbill.home.model.hrms.HrmsSalaryCalculated;
import com.wbill.home.repository.hrms.HrmsPayrollRunRepository;
import com.wbill.home.repository.hrms.HrmsSalaryCalculatedRepository;

/**
 * Service to generate electronic bank disbursement files for Commercial Bank of Ethiopia (CBE)
 * and Abay Bank.
 */
@Service
public class HrmsBankExportService {

    @Autowired
    private HrmsPayrollRunRepository payrollRunRepository;

    @Autowired
    private HrmsSalaryCalculatedRepository salaryCalculatedRepository;

    /**
     * Generates CBE Bulk Electronic Transfer File (CSV/TXT).
     * Standard CBE format:
     * SerialNo,AccountNumber,BeneficiaryName,AmountETB,Narration
     */
    public byte[] generateCbeBulkPayrollCsv(int payrollRunId) {
        HrmsPayrollRun run = payrollRunRepository.findById(payrollRunId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll run not found: " + payrollRunId));

        List<HrmsSalaryCalculated> items = salaryCalculatedRepository.findByPayrollRunIdAndDeletedFalse(payrollRunId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            // Header
            writer.println("Serial No,Account Number,Beneficiary Name,Amount,Reference");

            int serial = 1;
            for (HrmsSalaryCalculated item : items) {
                if (item.getDisbursedToPrimaryCbe() > 0) {
                    String acct = item.getEmployee().getPrimaryBankAccount();
                    if (acct == null || acct.trim().isEmpty()) {
                        acct = "MISSING_ACCOUNT";
                    }
                    String name = item.getEmployee().getFullName();
                    double amount = item.getDisbursedToPrimaryCbe();
                    String ref = "SAL-" + run.getSalaryMonthName() + "-" + run.getSalaryYear();

                    writer.printf("%d,\"%s\",\"%s\",%.2f,\"%s\"%n",
                            serial++, acct.trim(), escapeCsv(name), amount, ref);
                }
            }
        }

        return out.toByteArray();
    }

    /**
     * Generates Abay Bank Bulk Transfer File (CSV).
     * Standard Abay Bank format:
     * SerialNo,AccountNumber,EmployeeName,AmountETB,Purpose
     */
    public byte[] generateAbayBankPayrollCsv(int payrollRunId) {
        HrmsPayrollRun run = payrollRunRepository.findById(payrollRunId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll run not found: " + payrollRunId));

        List<HrmsSalaryCalculated> items = salaryCalculatedRepository.findByPayrollRunIdAndDeletedFalse(payrollRunId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            // Header
            writer.println("Seq,Abay Account Number,Beneficiary Name,Amount ETB,Description");

            int serial = 1;
            for (HrmsSalaryCalculated item : items) {
                if (item.getDisbursedToSecondaryAbay() > 0) {
                    String acct = item.getEmployee().getSecondaryBankAccount();
                    if (acct == null || acct.trim().isEmpty()) {
                        acct = "MISSING_ABAY_ACCOUNT";
                    }
                    String name = item.getEmployee().getFullName();
                    double amount = item.getDisbursedToSecondaryAbay();
                    String purpose = "Special Allowance / " + run.getSalaryMonthName() + " " + run.getSalaryYear();

                    writer.printf("%d,\"%s\",\"%s\",%.2f,\"%s\"%n",
                            serial++, acct.trim(), escapeCsv(name), amount, escapeCsv(purpose));
                }
            }
        }

        return out.toByteArray();
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        return val.replace("\"", "\"\"");
    }
}
