package com.wbill.home.controller.hrms;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.wbill.home.model.FncFiscalYear;
import com.wbill.home.model.hrms.*;
import com.wbill.home.repository.FncFiscalYearRepository;
import com.wbill.home.repository.hrms.*;
import com.wbill.home.service.hrms.HrmsPayrollCalculationEngine;

@RestController
@RequestMapping({"/api/card_managenment/hrms/payroll", "/api/hrms/payroll"})
@CrossOrigin(origins = "*", maxAge = 3600)
public class HrmsPayrollController {

    @Autowired
    private HrmsPayrollRunRepository payrollRunRepository;

    @Autowired
    private HrmsSalaryCalculatedRepository salaryCalculatedRepository;

    @Autowired
    private HrmsTaxBracketRepository taxBracketRepository;

    @Autowired
    private HrmsSalaryConfigurationRepository salaryConfigurationRepository;

    @Autowired
    private HrmsPayrollAccountMapRepository accountMapRepository;

    @Autowired
    private HrmsEmployeeRepository employeeRepository;

    @Autowired
    private FncFiscalYearRepository fiscalYearRepository;

    @Autowired
    private HrmsPayrollCalculationEngine calculationEngine;

    @GetMapping("/runs")
    public ResponseEntity<List<HrmsPayrollRun>> getPayrollRuns() {
        return ResponseEntity.ok(payrollRunRepository.findByDeletedFalseOrderBySalaryMonthDateDesc());
    }

    @GetMapping("/runs/{id}")
    public ResponseEntity<HrmsPayrollRun> getPayrollRunById(@PathVariable int id) {
        return payrollRunRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/runs/{id}/items")
    public ResponseEntity<List<HrmsSalaryCalculated>> getPayrollRunItems(@PathVariable int id) {
        return ResponseEntity.ok(salaryCalculatedRepository.findByPayrollRunIdAndDeletedFalse(id));
    }

    /**
     * Executes monthly payroll calculation for all active employees.
     */
    @PostMapping("/runs/generate")
    public ResponseEntity<HrmsPayrollRun> generatePayrollRun(@RequestBody Map<String, Object> payload,
                                                             @RequestParam(defaultValue = "1") int userId) {
        String monthName = (String) payload.get("salaryMonthName"); // e.g. መስከረም
        int year = ((Number) payload.get("salaryYear")).intValue(); // e.g. 2018
        int fiscalYearId = ((Number) payload.get("fiscalYearId")).intValue();
        boolean routeExtraToAbay = payload.get("routeExtraToAbay") != null && (Boolean) payload.get("routeExtraToAbay");

        FncFiscalYear fy = fiscalYearRepository.findById(fiscalYearId)
                .orElseThrow(() -> new IllegalArgumentException("Fiscal year not found: " + fiscalYearId));

        String ref = "PAYROLL-" + monthName + "-" + year;

        // Check if existing run exists
        HrmsPayrollRun run = payrollRunRepository
                .findByPayrollReferenceAndDeletedFalse(ref)
                .orElse(new HrmsPayrollRun());

        run.setPayrollReference(ref);
        run.setSalaryMonthName(monthName);
        run.setSalaryYear(year);
        run.setSalaryMonthDate(LocalDate.now());
        run.setFiscalYear(fy);
        run.setRegisteredBy(userId);
        run.setRegisteredDate(LocalDateTime.now());
        run.setApprovalStatus("DRAFT");
        run.setPaymentStatus("PENDING");

        HrmsPayrollRun savedRun = payrollRunRepository.save(run);

        // Calculate for all active employees
        List<HrmsEmployee> activeEmployees = employeeRepository.findByEmploymentStatusAndDeletedFalse("ACTIVE");
        List<HrmsSalaryCalculated> calculatedList = new ArrayList<>();

        double sumBasic = 0;
        double sumOvertime = 0;
        double sumAdditive = 0;
        double sumGross = 0;
        double sumTaxable = 0;
        double sumTax = 0;
        double sumPension7 = 0;
        double sumPension11 = 0;
        double sumDeductible = 0;
        double sumNet = 0;
        double sumNetCbe = 0;
        double sumNetAbay = 0;

        for (HrmsEmployee emp : activeEmployees) {
            // For monthly payroll run, pull regular salary + standard allowances
            HrmsSalaryCalculated calc = calculationEngine.computeEmployeeMonthlySalary(
                    emp, 0, 0, 0, 0, 0, 0, 0, routeExtraToAbay);

            calc.setPayrollRun(savedRun);
            calc.setRegisteredBy(userId);
            calc.setRegisteredDate(LocalDateTime.now());
            calculatedList.add(calc);

            sumBasic += calc.getBasicSalary();
            sumOvertime += calc.getPartTimeTotal();
            sumAdditive += calc.getTotalAdditive();
            sumGross += calc.getGrossSalary();
            sumTaxable += calc.getTotalTaxableIncome();
            sumTax += calc.getSalaryTax();
            sumPension7 += calc.getTotal7PercentPension();
            sumPension11 += calc.getTotal11PercentPension();
            sumDeductible += calc.getTotalDeductible();
            sumNet += calc.getNetSalary();
            sumNetCbe += calc.getDisbursedToPrimaryCbe();
            sumNetAbay += calc.getDisbursedToSecondaryAbay();
        }

        salaryCalculatedRepository.saveAll(calculatedList);

        // Update run totals
        savedRun.setTotalBasicSalary(HrmsPayrollCalculationEngine.roundMoney(sumBasic));
        savedRun.setTotalOvertime(HrmsPayrollCalculationEngine.roundMoney(sumOvertime));
        savedRun.setTotalAdditive(HrmsPayrollCalculationEngine.roundMoney(sumAdditive));
        savedRun.setTotalGrossSalary(HrmsPayrollCalculationEngine.roundMoney(sumGross));
        savedRun.setTotalTaxableIncome(HrmsPayrollCalculationEngine.roundMoney(sumTaxable));
        savedRun.setTotalSalaryTax(HrmsPayrollCalculationEngine.roundMoney(sumTax));
        savedRun.setTotalPensionEmployee(HrmsPayrollCalculationEngine.roundMoney(sumPension7));
        savedRun.setTotalPensionEmployer(HrmsPayrollCalculationEngine.roundMoney(sumPension11));
        savedRun.setTotalDeductible(HrmsPayrollCalculationEngine.roundMoney(sumDeductible));
        savedRun.setTotalNetSalary(HrmsPayrollCalculationEngine.roundMoney(sumNet));
        savedRun.setTotalNetCbe(HrmsPayrollCalculationEngine.roundMoney(sumNetCbe));
        savedRun.setTotalNetAbay(HrmsPayrollCalculationEngine.roundMoney(sumNetAbay));

        return ResponseEntity.ok(payrollRunRepository.save(savedRun));
    }

    @GetMapping("/tax-brackets")
    public ResponseEntity<List<HrmsTaxBracket>> getTaxBrackets() {
        return ResponseEntity.ok(taxBracketRepository.findByDeletedFalseOrderByWeightAsc());
    }

    @GetMapping("/salary-configurations")
    public ResponseEntity<List<HrmsSalaryConfiguration>> getSalaryConfigurations() {
        return ResponseEntity.ok(salaryConfigurationRepository.findByDeletedFalseOrderByWeightAsc());
    }

    @GetMapping("/account-maps")
    public ResponseEntity<List<HrmsPayrollAccountMap>> getAccountMappings() {
        return ResponseEntity.ok(accountMapRepository.findAllByOrderByMappingKeyAsc());
    }

    @PutMapping("/account-maps")
    public ResponseEntity<List<HrmsPayrollAccountMap>> saveAccountMappings(@RequestBody List<HrmsPayrollAccountMap> maps) {
        return ResponseEntity.ok(accountMapRepository.saveAll(maps));
    }
}
