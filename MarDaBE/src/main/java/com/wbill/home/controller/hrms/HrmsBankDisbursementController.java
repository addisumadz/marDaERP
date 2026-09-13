package com.wbill.home.controller.hrms;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.wbill.home.service.hrms.HrmsBankExportService;

@RestController
@RequestMapping({"/api/card_managenment/hrms/bank-disbursement", "/api/hrms/bank-disbursement"})
@CrossOrigin(origins = "*", maxAge = 3600)
public class HrmsBankDisbursementController {

    @Autowired
    private HrmsBankExportService bankExportService;

    @GetMapping("/cbe/{payrollRunId}")
    public ResponseEntity<byte[]> downloadCbeBulkPayrollCsv(@PathVariable int payrollRunId) {
        try {
            byte[] csvData = bankExportService.generateCbeBulkPayrollCsv(payrollRunId);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"CBE_Payroll_Run_" + payrollRunId + ".csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/abay/{payrollRunId}")
    public ResponseEntity<byte[]> downloadAbayBankPayrollCsv(@PathVariable int payrollRunId) {
        try {
            byte[] csvData = bankExportService.generateAbayBankPayrollCsv(payrollRunId);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"AbayBank_Payroll_Run_" + payrollRunId + ".csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
