package com.wbill.home.controller;

import com.wbill.home.dto.FncJournalEntryCreateDTO;
import com.wbill.home.dto.FncJournalEntryDTO;
import com.wbill.home.model.FncJournalEntry;
import com.wbill.home.model.FncJournalEntry.EntryStatus;
import com.wbill.home.service.FncJournalEntryService;
import com.wbill.home.repository.BillingReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/card_managenment/fnc-journal-entries")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FncJournalEntryController {

    @Autowired
    private FncJournalEntryService journalEntryService;

    @Autowired
    private BillingReadingRepository billingReadingRepository;

    @GetMapping("/all")
    public ResponseEntity<Page<FncJournalEntryDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer fiscalYearId) {
        try {
            Page<FncJournalEntry> entries;
            if (fiscalYearId != null && status != null) {
                entries = journalEntryService.getEntriesByFiscalYearAndStatus(fiscalYearId, EntryStatus.valueOf(status), page, size);
            } else if (status != null) {
                entries = journalEntryService.getEntriesByStatus(EntryStatus.valueOf(status), page, size);
            } else if (fiscalYearId != null) {
                entries = journalEntryService.getEntriesByFiscalYear(fiscalYearId, page, size);
            } else {
                entries = journalEntryService.getAllEntries(page, size);
            }
            return ResponseEntity.ok(entries.map(je -> new FncJournalEntryDTO(je, true)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable long id) {
        return journalEntryService.getEntryById(id)
                .map(je -> ResponseEntity.ok(new FncJournalEntryDTO(je, true)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody FncJournalEntryCreateDTO dto, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            FncJournalEntry created = journalEntryService.createEntry(dto, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(new FncJournalEntryDTO(created, true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating journal entry: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable long id, @RequestBody FncJournalEntryCreateDTO dto, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            FncJournalEntry updated = journalEntryService.updateEntry(id, dto, username);
            return ResponseEntity.ok(new FncJournalEntryDTO(updated, true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/post")
    public ResponseEntity<?> post(@PathVariable long id, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            FncJournalEntry posted = journalEntryService.postEntry(id, username);
            return ResponseEntity.ok(new FncJournalEntryDTO(posted, true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/void")
    public ResponseEntity<?> voidEntry(@PathVariable long id, @RequestBody Map<String, String> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            String reason = body.getOrDefault("reason", "");
            FncJournalEntry voided = journalEntryService.voidEntry(id, reason, username);
            return ResponseEntity.ok(new FncJournalEntryDTO(voided, true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable long id) {
        try {
            journalEntryService.deleteEntry(id);
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/unpushed-count")
    public ResponseEntity<?> getUnpushedBillCount(@RequestParam String kifyaWer) {
        try {
            long unpushedCount = billingReadingRepository.countUnpushedBills(kifyaWer);
            long pushedCount = billingReadingRepository.countPushedBills(kifyaWer);
            return ResponseEntity.ok(Map.of(
                    "unpushedCount", unpushedCount,
                    "pushedCount", pushedCount,
                    "totalCount", unpushedCount + pushedCount
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error checking unpushed bills: " + e.getMessage()));
        }
    }

    @GetMapping("/unpushed-paid-count")
    public ResponseEntity<?> getUnpushedPaidBillCount(@RequestParam String kifyaWer) {
        try {
            long unpushedCount = billingReadingRepository.countUnpushedPaidBills(kifyaWer);
            long pushedCount = billingReadingRepository.countPushedPaidBills(kifyaWer);
            return ResponseEntity.ok(Map.of(
                    "unpushedCount", unpushedCount,
                    "pushedCount", pushedCount,
                    "totalCount", unpushedCount + pushedCount
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error checking unpushed paid bills: " + e.getMessage()));
        }
    }

    @GetMapping("/by-billing-month")
    public ResponseEntity<?> getEntriesByBillingMonth(@RequestParam String billingMonth) {
        try {
            List<FncJournalEntry> entries = journalEntryService.getEntriesByBillingMonth(billingMonth);
            return ResponseEntity.ok(entries);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching journal entries for billing month: " + e.getMessage()));
        }
    }

    @GetMapping("/journal-balance-summary")
    public ResponseEntity<?> getJournalBalanceSummary(@RequestParam String kifyaWer) {
        try {
            Map<String, Object> summary = journalEntryService.getJournalBalanceSummary(kifyaWer);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error calculating journal balance: " + e.getMessage()));
        }
    }

    @GetMapping("/unpaid-bills-summary")
    public ResponseEntity<?> getUnpaidBillsSummary(@RequestParam String kifyaWer) {
        try {
            String kifyaWerWithComma = kifyaWer != null && kifyaWer.contains(",") ? kifyaWer : (kifyaWer != null ? kifyaWer.replace(" ", ", ") : "");
            String kifyaWerNoComma = kifyaWer != null ? kifyaWer.replace(",", "").replaceAll("\\s+", " ").trim() : "";
            String pattern = "%" + kifyaWerNoComma.replace(" ", "%") + "%";

            Object[] result = billingReadingRepository.getUnpaidPushedBillSummary(
                    kifyaWerWithComma, kifyaWerNoComma, pattern
            );
            if (result == null || result.length == 0 || result[0] == null) {
                // Return empty/zero summary when no unpaid bills exist (>10 entries, use HashMap)
                Map<String, Object> empty = new HashMap<>();
                empty.put("yezihWerFjotaKfya", 0); empty.put("kotariKiray", 0); empty.put("techemariKfya", 0);
                empty.put("additionalHisab", 0); empty.put("wuzifKotariKiray", 0); empty.put("wuzifTechemariKfya", 0);
                empty.put("kitat", 0); empty.put("wuzifFjotaKfya", 0); empty.put("wuzifDerekKoshasha", 0);
                empty.put("wuzifHisab", 0); empty.put("temelashBirr", 0); empty.put("billCount", 0L);
                return ResponseEntity.ok(empty);
            }
            // The query returns a single Object[] row with 12 columns
            Object[] row = (result[0] instanceof Object[]) ? (Object[]) result[0] : result;
            return ResponseEntity.ok(Map.ofEntries(
                    Map.entry("yezihWerFjotaKfya", row[0] != null ? ((Number) row[0]).doubleValue() : 0),
                    Map.entry("kotariKiray", row[1] != null ? ((Number) row[1]).doubleValue() : 0),
                    Map.entry("techemariKfya", row[2] != null ? ((Number) row[2]).doubleValue() : 0),
                    Map.entry("additionalHisab", row[3] != null ? ((Number) row[3]).doubleValue() : 0),
                    Map.entry("wuzifKotariKiray", row[4] != null ? ((Number) row[4]).doubleValue() : 0),
                    Map.entry("wuzifTechemariKfya", row[5] != null ? ((Number) row[5]).doubleValue() : 0),
                    Map.entry("kitat", row[6] != null ? ((Number) row[6]).doubleValue() : 0),
                    Map.entry("wuzifFjotaKfya", row[7] != null ? ((Number) row[7]).doubleValue() : 0),
                    Map.entry("wuzifDerekKoshasha", row[8] != null ? ((Number) row[8]).doubleValue() : 0),
                    Map.entry("wuzifHisab", row[9] != null ? ((Number) row[9]).doubleValue() : 0),
                    Map.entry("temelashBirr", row[10] != null ? ((Number) row[10]).doubleValue() : 0),
                    Map.entry("billCount", row[11] != null ? ((Number) row[11]).longValue() : 0L)
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching unpaid bills summary: " + e.getMessage()));
        }
    }
}
