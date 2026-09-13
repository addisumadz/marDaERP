package com.wbill.home.hrms;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import com.wbill.home.hrms.config.HrmsEthiopianCalendarUtil;
import com.wbill.home.hrms.config.HrmsProclamation1156Constants;
import com.wbill.home.model.hrms.HrmsEmployee;
import com.wbill.home.model.hrms.HrmsSalaryCalculated;
import com.wbill.home.repository.hrms.HrmsTaxBracketRepository;
import com.wbill.home.service.hrms.HrmsPayrollCalculationEngine;

public class HrmsPayrollCalculationEngineTest {

    @Mock
    private HrmsTaxBracketRepository taxBracketRepository;

    @InjectMocks
    private HrmsPayrollCalculationEngine calculationEngine;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testScheduleAIncomeTaxBrackets() {
        // Bracket 1: 0 - 600 ETB (0%)
        assertEquals(0.0, calculationEngine.calculateEmploymentTax(500.0));
        assertEquals(0.0, calculationEngine.calculateEmploymentTax(600.0));

        // Bracket 2: 601 - 1,650 ETB (10%, deductible 60)
        // For 1,000 ETB: (1000 * 0.10) - 60 = 40.0 ETB
        assertEquals(40.0, calculationEngine.calculateEmploymentTax(1000.0));

        // Bracket 3: 1,651 - 3,200 ETB (15%, deductible 142.50)
        // For 2,000 ETB: (2000 * 0.15) - 142.50 = 157.50 ETB
        assertEquals(157.5, calculationEngine.calculateEmploymentTax(2000.0));

        // Bracket 4: 3,201 - 5,250 ETB (20%, deductible 302.50)
        // For 4,000 ETB: (4000 * 0.20) - 302.50 = 497.50 ETB
        assertEquals(497.5, calculationEngine.calculateEmploymentTax(4000.0));

        // Bracket 5: 5,251 - 7,800 ETB (25%, deductible 565.00)
        // For 6,000 ETB: (6000 * 0.25) - 565.00 = 935.00 ETB
        assertEquals(935.0, calculationEngine.calculateEmploymentTax(6000.0));

        // Bracket 6: 7,801 - 10,900 ETB (30%, deductible 955.00)
        // For 10,000 ETB: (10000 * 0.30) - 955.00 = 2045.00 ETB
        assertEquals(2045.0, calculationEngine.calculateEmploymentTax(10000.0));

        // Bracket 7: > 10,900 ETB (35%, deductible 1500.00)
        // For 20,000 ETB: (20000 * 0.35) - 1500.00 = 5500.00 ETB
        assertEquals(5500.0, calculationEngine.calculateEmploymentTax(20000.0));
    }

    @Test
    void testProclamation1156OvertimeCalculation() {
        double basicSalary = 12000.0; // Hourly rate = 12000 / 240 = 50.0 ETB/hr

        // Day OT (1.5x): 10 hours * 50 * 1.5 = 750 ETB
        double dayOt = calculationEngine.calculateOvertimePay(basicSalary, 10, 0, 0, 0);
        assertEquals(750.0, dayOt);

        // Night OT (1.75x): 10 hours * 50 * 1.75 = 875 ETB
        double nightOt = calculationEngine.calculateOvertimePay(basicSalary, 0, 10, 0, 0);
        assertEquals(875.0, nightOt);

        // Weekend OT (2.0x): 8 hours * 50 * 2.0 = 800 ETB
        double weekendOt = calculationEngine.calculateOvertimePay(basicSalary, 0, 0, 8, 0);
        assertEquals(800.0, weekendOt);

        // Holiday OT (2.5x): 8 hours * 50 * 2.5 = 1000 ETB
        double holidayOt = calculationEngine.calculateOvertimePay(basicSalary, 0, 0, 0, 8);
        assertEquals(1000.0, holidayOt);
    }

    @Test
    void testPensionStatutoryRates() {
        double basicSalary = 10000.0;
        assertEquals(700.0, calculationEngine.calculateEmployeePension(basicSalary)); // 7%
        assertEquals(1100.0, calculationEngine.calculateEmployerPension(basicSalary)); // 11%
    }

    @Test
    void testFullMonthlySalaryWithDualBankSplit() {
        HrmsEmployee emp = new HrmsEmployee();
        emp.setCurrentSalary(20000.0);
        emp.setPrimaryBankAccount("1000123456789");
        emp.setSecondaryBankAccount("9999876543210"); // Abay Bank

        // Employee with 10 hrs day OT (10 * 83.33 * 1.5 = 1250 ETB)
        HrmsSalaryCalculated result = calculationEngine.computeEmployeeMonthlySalary(
                emp, 10, 0, 0, 0, 0, 0, 0, true);

        assertEquals(20000.0, result.getBasicSalary());
        assertEquals(1250.0, result.getPartTimeTotal());
        assertEquals(21250.0, result.getGrossSalary());
        assertEquals(1400.0, result.getTotal7PercentPension()); // 7% of 20,000 = 1400
        assertEquals(2200.0, result.getTotal11PercentPension()); // 11% of 20,000 = 2200

        // Both primary CBE and secondary Abay bank received positive disbursements
        assertTrue(result.getDisbursedToPrimaryCbe() > 0);
        assertTrue(result.getDisbursedToSecondaryAbay() > 0);
        assertEquals(result.getNetSalary(), result.getDisbursedToPrimaryCbe() + result.getDisbursedToSecondaryAbay(), 0.01);
    }

    @Test
    void testEthiopianCalendarConversions() {
        // September 11, 2025 is Meskerem 1, 2018 (Ethiopian New Year)
        LocalDate sep11 = LocalDate.of(2025, 9, 11);
        int[] ethDate = HrmsEthiopianCalendarUtil.toEthiopianDate(sep11);

        assertEquals(2018, ethDate[0]); // Year
        assertEquals(1, ethDate[1]);    // Meskerem (Month 1)
        assertEquals(1, ethDate[2]);    // Day 1

        assertEquals("መስከረም", HrmsEthiopianCalendarUtil.getEthiopianMonthName(1));
        assertEquals("ጳጉሜ", HrmsEthiopianCalendarUtil.getEthiopianMonthName(13));
    }
}
