package com.wbill.home;

import com.wbill.home.model.BillingReading;
import com.wbill.home.repository.BillingReadingRepository;
import com.wbill.home.service.BillingService;
import com.wbill.home.service.BillingService.BillingProcessResult;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class BillingServiceBatchTest {

    @Autowired
    private BillingService billingService;

    @Autowired
    private BillingReadingRepository readingRepo;

    @Test
    @DisplayName("Verify generating bills for multiple selected readings succeeds without transient object exception")
    void testGenerateBillsForMultipleReadings() {
        List<Integer> readingIds = List.of(185993, 185994);
        for (Integer id : readingIds) {
            BillingReading r = readingRepo.findById(id).orElse(null);
            if (r != null) {
                r.setBillGenerated(false);
                r.setInvoiceNumber(null);
                r.setBillingInvoiceNumbers(null);
                readingRepo.save(r);
            }
        }

        BillingProcessResult result = billingService.generateBillsForSelectedReadings(readingIds);
        System.out.println("[TEST RESULT] Requested: " + result.getRequested() 
                + ", Processed: " + result.getProcessed() 
                + ", Skipped: " + result.getSkipped() 
                + ", SkipReasons: " + result.getSkipReasons());

        assertEquals(2, result.getRequested());
        assertTrue(result.getProcessed() > 0, 
                "Should process readings: " + result.getSkipReasons());
        for (String reason : result.getSkipReasons()) {
            assertFalse(reason.contains("TransientPropertyValueException"), 
                    "Must not throw TransientPropertyValueException: " + reason);
        }
    }
}
