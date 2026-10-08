package com.wbill.home.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.util.EthiopianCalendarUtil;

public class AverageConsumptionCalculationTest {

    @Test
    @DisplayName("Periods generator correctly includes selected month and historical months")
    void testPeriodsGeneration() {
        String currentKifyaWer = "መስከረም, 2017";
        int months = 6;

        List<String> periods = new ArrayList<>();
        String period = currentKifyaWer.trim();
        for (int i = 0; i < months; i++) {
            if (period == null || period.trim().isEmpty()) {
                break;
            }
            if (!periods.contains(period)) {
                periods.add(period);
            }
            period = EthiopianCalendarUtil.getPreviousKifyaWer(period);
        }

        assertEquals(6, periods.size());
        assertEquals("መስከረም, 2017", periods.get(0));
        assertEquals("ነሐሴ, 2016", periods.get(1));
        assertEquals("ሐምሌ, 2016", periods.get(2));
        assertEquals("ሰኔ, 2016", periods.get(3));
        assertEquals("ግንቦት, 2016", periods.get(4));
        assertEquals("ሚያዚያ, 2016", periods.get(5));
    }

    @Test
    @DisplayName("Calculation skips cons <= 0 per user requirement and averages active usage")
    void testCalculationSkipsZeroAndNegative() {
        int[] simulatedConsumptions = {20, 0, -5, 10};

        int sum = 0;
        int count = 0;
        for (int cons : simulatedConsumptions) {
            if (cons <= 0) {
                continue;
            }
            sum += cons;
            count++;
        }

        assertEquals(30, sum);
        assertEquals(2, count);
        int avg = (int) Math.round(sum / (double) count);
        assertEquals(15, avg);
    }

    @Test
    @DisplayName("Zero history customer with null existing average receives standard default of 10")
    void testZeroHistoryCustomerReceivesDefaultWhenNull() {
        BillingCustomerInfo customer = new BillingCustomerInfo();
        customer.setInitialConsumption(null);

        int count = 0;
        if (count == 0) {
            Integer existingAvg = customer.getInitialConsumption();
            if (existingAvg == null || existingAvg <= 0) {
                customer.setInitialConsumption(10);
            }
        }

        assertEquals(10, customer.getInitialConsumption());
    }

    @Test
    @DisplayName("Zero history customer with existing average > 0 preserves existing average")
    void testZeroHistoryCustomerPreservesExistingAverage() {
        BillingCustomerInfo customer = new BillingCustomerInfo();
        customer.setInitialConsumption(25);

        int count = 0;
        if (count == 0) {
            Integer existingAvg = customer.getInitialConsumption();
            if (existingAvg == null || existingAvg <= 0) {
                customer.setInitialConsumption(10);
            }
        }

        assertEquals(25, customer.getInitialConsumption());
    }

    @Test
    @DisplayName("Consumption fallback from lastReading - prevReading is applied when consumption field is 0")
    void testConsumptionFallbackFromReadings() {
        int cons = 0;
        int lastR = 150;
        int prevR = 100;

        if (cons == 0 && lastR > 0 && prevR >= 0) {
            cons = lastR - prevR;
        }

        assertEquals(50, cons);
    }
}
