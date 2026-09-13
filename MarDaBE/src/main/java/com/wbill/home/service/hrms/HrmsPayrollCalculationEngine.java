package com.wbill.home.service.hrms;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.wbill.home.hrms.config.HrmsProclamation1156Constants;
import com.wbill.home.model.hrms.HrmsEmployee;
import com.wbill.home.model.hrms.HrmsTaxBracket;
import com.wbill.home.model.hrms.HrmsSalaryCalculated;
import com.wbill.home.repository.hrms.HrmsTaxBracketRepository;

/**
 * Precision Payroll Calculation Engine for Ethiopian Municipal Water Utility
 * Compliant with:
 * - Ethiopian Labour Proclamation No. 1156/2019 (Overtime 1.5x, 1.75x, 2.0x, 2.5x)
 * - Ministry of Revenues Employment Income Tax Proclamation 979/2016 (Schedule A)
 * - Pension Proclamation No. 1267/2022 & 1268/2022 (7% Employee + 11% Employer = 18%)
 */
@Service
public class HrmsPayrollCalculationEngine {

    @Autowired
    private HrmsTaxBracketRepository taxBracketRepository;

    /**
     * Calculates tax using Ethiopian Schedule 'A' Progressive Brackets.
     * Tax = (Taxable Income * Bracket Rate) - Deductible Constant
     */
    public double calculateEmploymentTax(double taxableIncome) {
        if (taxableIncome <= 600.0) {
            return 0.0;
        }

        List<HrmsTaxBracket> brackets = taxBracketRepository.findByDeletedFalseOrderByWeightAsc();
        if (brackets.isEmpty()) {
            // Hardcoded fallback to standard Schedule A if database table not yet populated
            return calculateScheduleAFallback(taxableIncome);
        }

        for (HrmsTaxBracket bracket : brackets) {
            if (bracket.isAndAbove() && taxableIncome > bracket.getUpperLimitBirr()) {
                double tax = (taxableIncome * (bracket.getPercentBirr() / 100.0)) - bracket.getTotalDeductibleTillThis();
                return roundMoney(Math.max(0.0, tax));
            } else if (taxableIncome <= bracket.getUpperLimitBirr()) {
                double tax = (taxableIncome * (bracket.getPercentBirr() / 100.0)) - bracket.getTotalDeductibleTillThis();
                return roundMoney(Math.max(0.0, tax));
            }
        }

        return 0.0;
    }

    /**
     * Calculates Statutory Overtime Pay under Labour Proclamation 1156/2019 Article 68.
     * Hourly Rate = Basic Salary / (30 days * 8 hours) = Basic Salary / 240
     */
    public double calculateOvertimePay(double basicSalary,
                                       double dayHours,
                                       double nightHours,
                                       double weekendHours,
                                       double holidayHours) {
        if (basicSalary <= 0) return 0.0;

        double hourlyRate = basicSalary / (HrmsProclamation1156Constants.STANDARD_MONTHLY_WORKING_DAYS *
                                           HrmsProclamation1156Constants.STANDARD_DAILY_HOURS);

        double dayOtPay = dayHours * hourlyRate * HrmsProclamation1156Constants.OVERTIME_RATE_DAY;
        double nightOtPay = nightHours * hourlyRate * HrmsProclamation1156Constants.OVERTIME_RATE_NIGHT;
        double weekendOtPay = weekendHours * hourlyRate * HrmsProclamation1156Constants.OVERTIME_RATE_WEEKEND;
        double holidayOtPay = holidayHours * hourlyRate * HrmsProclamation1156Constants.OVERTIME_RATE_HOLIDAY;

        return roundMoney(dayOtPay + nightOtPay + weekendOtPay + holidayOtPay);
    }

    /**
     * Calculates Employee 7% Pension.
     */
    public double calculateEmployeePension(double basicSalary) {
        if (basicSalary <= 0) return 0.0;
        return roundMoney(basicSalary * HrmsProclamation1156Constants.EMPLOYEE_PENSION_RATE);
    }

    /**
     * Calculates Employer 11% Pension.
     */
    public double calculateEmployerPension(double basicSalary) {
        if (basicSalary <= 0) return 0.0;
        return roundMoney(basicSalary * HrmsProclamation1156Constants.EMPLOYER_PENSION_RATE);
    }

    /**
     * Full Gross-to-Net Calculation for an Employee for the Month.
     */
    public HrmsSalaryCalculated computeEmployeeMonthlySalary(HrmsEmployee employee,
                                                            double overtimeDayHours,
                                                            double overtimeNightHours,
                                                            double overtimeWeekendHours,
                                                            double overtimeHolidayHours,
                                                            double totalTaxableAllowances,
                                                            double totalNonTaxableAllowances,
                                                            double voluntaryDeductions,
                                                            boolean routeExtraPayToSecondaryBank) {

        double basicSalary = employee.getCurrentSalary();

        // 1. Overtime Pay
        double overtimeTotalPay = calculateOvertimePay(basicSalary,
                overtimeDayHours, overtimeNightHours, overtimeWeekendHours, overtimeHolidayHours);

        // 2. Additives & Gross Salary
        double totalAdditive = totalTaxableAllowances + totalNonTaxableAllowances;
        double grossSalary = basicSalary + overtimeTotalPay + totalAdditive;

        // 3. Taxable Income
        double taxableIncome = basicSalary + overtimeTotalPay + totalTaxableAllowances;

        // 4. Statutory Deductions
        double salaryTax = calculateEmploymentTax(taxableIncome);
        double employeePension7 = calculateEmployeePension(basicSalary);
        double employerPension11 = calculateEmployerPension(basicSalary);

        // 5. Total Deductions & Net Salary
        double totalDeductible = salaryTax + employeePension7 + voluntaryDeductions;
        double netSalary = roundMoney(Math.max(0.0, grossSalary - totalDeductible));

        // 6. Dual Bank Disbursement Split (Primary CBE vs Secondary Abay Bank)
        double disbursedCbe = netSalary;
        double disbursedAbay = 0.0;

        if (employee.getSecondaryBankAccount() != null && !employee.getSecondaryBankAccount().trim().isEmpty()) {
            if (routeExtraPayToSecondaryBank) {
                // Secondary bank receives overtime & allowances net portion; Primary CBE receives basic salary net
                double regularNet = Math.max(0.0, basicSalary - (salaryTax * (basicSalary / taxableIncome)) - employeePension7);
                disbursedCbe = roundMoney(Math.min(netSalary, regularNet));
                disbursedAbay = roundMoney(Math.max(0.0, netSalary - disbursedCbe));
            }
        }

        HrmsSalaryCalculated calc = new HrmsSalaryCalculated();
        calc.setEmployee(employee);
        calc.setBasicSalary(roundMoney(basicSalary));
        calc.setCurrentSalary(roundMoney(basicSalary));
        calc.setPartTimeWorkingHr(overtimeDayHours);
        calc.setPartTimeNight(overtimeNightHours);
        calc.setPartTimeWeekend(overtimeWeekendHours);
        calc.setPartTimeHolliday(overtimeHolidayHours);
        calc.setPartTimeTotal(overtimeTotalPay);
        calc.setTotalAdditive(roundMoney(totalAdditive));
        calc.setGrossSalary(roundMoney(grossSalary));
        calc.setTotalTaxableIncome(roundMoney(taxableIncome));
        calc.setSalaryTax(roundMoney(salaryTax));
        calc.setTotal7PercentPension(roundMoney(employeePension7));
        calc.setTotal11PercentPension(roundMoney(employerPension11));
        calc.setTotalDeductible(roundMoney(totalDeductible));
        calc.setNetSalary(roundMoney(netSalary));
        calc.setDisbursedToPrimaryCbe(roundMoney(disbursedCbe));
        calc.setDisbursedToSecondaryAbay(roundMoney(disbursedAbay));

        return calc;
    }

    public static double roundMoney(double amount) {
        return BigDecimal.valueOf(amount).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private double calculateScheduleAFallback(double income) {
        if (income <= 600) return 0.0;
        if (income <= 1650) return roundMoney((income * 0.10) - 60.0);
        if (income <= 3200) return roundMoney((income * 0.15) - 142.5);
        if (income <= 5250) return roundMoney((income * 0.20) - 302.5);
        if (income <= 7800) return roundMoney((income * 0.25) - 565.0);
        if (income <= 10900) return roundMoney((income * 0.30) - 955.0);
        return roundMoney((income * 0.35) - 1500.0);
    }
}
