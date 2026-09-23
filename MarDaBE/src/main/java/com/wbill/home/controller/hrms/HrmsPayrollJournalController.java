package com.wbill.home.controller.hrms;

import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.wbill.home.model.FncJournalEntry;
import com.wbill.home.service.hrms.HrmsJournalIntegrationService;

@RestController
@RequestMapping({"/api/mardaerp/hrms/payroll-journal", "/api/hrms/payroll-journal"})
@CrossOrigin(origins = "*", maxAge = 3600)
public class HrmsPayrollJournalController {

    @Autowired
    private HrmsJournalIntegrationService journalIntegrationService;

    /**
     * Previews balanced DR/CR lines for the monthly payroll run before posting.
     */
    @GetMapping("/preview/{payrollRunId}")
    public ResponseEntity<Map<String, Object>> previewPayrollJournal(@PathVariable int payrollRunId) {
        try {
            Map<String, Object> preview = journalIntegrationService.previewPayrollJournal(payrollRunId);
            return ResponseEntity.ok(preview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Pushes the balanced payroll entry into FncJournalEntry with DRAFT status.
     */
    @PostMapping("/push/{payrollRunId}")
    public ResponseEntity<?> pushPayrollToJournal(@PathVariable int payrollRunId,
                                                  Authentication authentication) {
        try {
            String username = authentication != null ? authentication.getName() : "HRMS_SYSTEM";
            FncJournalEntry entry = journalIntegrationService.pushPayrollToJournal(payrollRunId, username);
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "journalEntryId", entry.getId(),
                    "entryNumber", entry.getEntryNumber(),
                    "referenceNumber", entry.getReferenceNumber(),
                    "message", "Payroll journal entry successfully created in DRAFT status."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
