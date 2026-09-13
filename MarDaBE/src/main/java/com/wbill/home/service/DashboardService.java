package com.wbill.home.service;

import java.time.LocalDate;
import java.util.Date;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wbill.home.model.CompanyProfile;
import com.wbill.home.model.DashboardSummary;
import com.wbill.home.repository.BillingCustomerInfoRepository;
import com.wbill.home.repository.BillingReadingRepository;
import com.wbill.home.repository.CompanyProfileRepository;
import com.wbill.home.repository.DashboardSummaryRepository;
import com.wbill.home.util.EthiopianCalendarConverter;

@Service
public class DashboardService {

    @Autowired
    private DashboardSummaryRepository dashboardSummaryRepository;

    @Autowired
    private BillingCustomerInfoRepository customerInfoRepository;

    @Autowired
    private BillingReadingRepository readingRepository;

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Autowired
    private com.wbill.home.repository.UserAccountRepository userAccountRepository;

    // Use EthiopianCalendarConverter utility instead of local array

    public DashboardSummary getLatestSummary() {
        DashboardSummary summary = dashboardSummaryRepository.findTopByOrderByLastUpdatedDesc();
        if (summary != null && summary.getActiveReadingDate() != null) {
            // Populate transient field
            try {
                LocalDate gDate = new java.sql.Date(
                        summary.getActiveReadingDate().getTime()).toLocalDate();
                EthiopianCalendarConverter.EthiopianDate ethDate = EthiopianCalendarConverter
                        .gregorianToEthiopian(gDate);
                String monthName = EthiopianCalendarConverter.getEthiopianMonthNameAmharic(ethDate.getMonth());
                // Use comma for display
                summary.setActiveReadingMonth(monthName + ", " + ethDate.getYear());
            } catch (Exception e) {
                System.err.println("Error converting active reading date: " + e.getMessage());
            }
        }
        return summary;
    }

    @Transactional
    public DashboardSummary refreshSummary(String updatedBy) {
        System.out.println("[DashboardService] Starting refresh for user: " + updatedBy);

        DashboardSummary summary = new DashboardSummary();
        summary.setLastUpdated(new Date());
        summary.setUpdatedBy(updatedBy);

        // 1. Get Comp Profile for Active Month
        List<CompanyProfile> profiles = companyProfileRepository.findByStatus("Active"); // Use "Active"
        if (profiles.isEmpty()) {
            // Fallback to lowercase
            profiles = companyProfileRepository.findByStatus("active");
        }

        String kifyaWerDb = null; // For DB Queries (Underscore)
        CompanyProfile profile = null;

        if (!profiles.isEmpty()) {
            profile = profiles.get(0);

            if (profile.getActiveBillingMonth() != null) {
                // Convert Active Billing Month
                try {
                    EthiopianCalendarConverter.EthiopianDate ethDate = EthiopianCalendarConverter
                            .gregorianToEthiopian(profile.getActiveBillingMonth());
                    String monthName = EthiopianCalendarConverter.getEthiopianMonthNameAmharic(ethDate.getMonth());

                    // Format: Month, Year
                    String kifyaWerLocal = monthName + ", " + ethDate.getYear();

                    // Use this format for both DB (DashboardSummary persistence) and Repo Query
                    kifyaWerDb = kifyaWerLocal;

                    summary.setActiveBillingMonth(kifyaWerLocal);
                    summary.setActiveBillingYear(ethDate.getYear());
                } catch (Exception e) {
                    System.err.println("Error converting active billing month: " + e.getMessage());
                    summary.setActiveBillingMonth("Error");
                }
            } else {
                summary.setActiveBillingMonth("Unknown");
            }

            if (profile.getActiveReadingDate() != null) {
                summary.setActiveReadingDate(java.sql.Date.valueOf(profile.getActiveReadingDate()));
                // Populate transient field for immediate return
                try {
                    EthiopianCalendarConverter.EthiopianDate ethReadDate = EthiopianCalendarConverter
                            .gregorianToEthiopian(profile.getActiveReadingDate());
                    String rMonthName = EthiopianCalendarConverter.getEthiopianMonthNameAmharic(ethReadDate.getMonth());
                    summary.setActiveReadingMonth(rMonthName + ", " + ethReadDate.getYear());
                } catch (Exception e) {
                    System.err.println("Error converting active reading date: " + e.getMessage());
                }
            }
        }

        // 2. Customer Counts
        long activeCust = customerInfoRepository.countByStatus("active");
        long deactivatedCust = customerInfoRepository.countByStatusAndCompleteDeletedIsNull("deleted");
        long deletedCust = customerInfoRepository.countByCompleteDeleted("deleted");

        summary.setTotalActiveCustomers((int) activeCust);
        summary.setTotalDeactivatedCustomers((int) deactivatedCust);
        summary.setTotalDeletedCustomers((int) deletedCust);

        // 3. Financial Summary
        if (kifyaWerDb != null) {
            // Use DB Format (Underscore) for Repository Query
            DashboardSummary repoSummary = readingRepository.getDashboardSums(kifyaWerDb);

            if (repoSummary != null) {
                summary.setTotalBillsGenerated(repoSummary.getTotalBillsGenerated());
                summary.setTotalConsumptionM3(repoSummary.getTotalConsumptionM3());
                summary.setTotalWuzifConsumptionM3(repoSummary.getTotalWuzifConsumptionM3());
                summary.setTotalAdditionalFees(repoSummary.getTotalAdditionalFees());
                summary.setTotalDerekKoshasha(repoSummary.getTotalDerekKoshasha());
                summary.setTotalPenalty(repoSummary.getTotalPenalty());
                summary.setTotalWuzifAmount(repoSummary.getTotalWuzifAmount());
                summary.setTotalPrepaid(repoSummary.getTotalPrepaid());
                summary.setTotalExpectedAmount(repoSummary.getTotalExpectedAmount());
                summary.setTotalPaidAmount(repoSummary.getTotalPaidAmount());

                // Copy NEW Refactored Fields
                summary.setTotalYezihWerFjotaKfya(repoSummary.getTotalYezihWerFjotaKfya());
                summary.setPaidYezihWerFjotaKfya(repoSummary.getPaidYezihWerFjotaKfya());
                summary.setTotalKotariKiray(repoSummary.getTotalKotariKiray());
                summary.setPaidKotariKiray(repoSummary.getPaidKotariKiray());
                summary.setTotalTechemariKfya(repoSummary.getTotalTechemariKfya());
                summary.setPaidTechemariKfya(repoSummary.getPaidTechemariKfya());
                summary.setPaidAdditionalHisab(repoSummary.getPaidAdditionalHisab());
                summary.setTotalWuzifKotariKiray(repoSummary.getTotalWuzifKotariKiray());
                summary.setPaidWuzifKotariKiray(repoSummary.getPaidWuzifKotariKiray());
                summary.setTotalWuzifTechemariKfya(repoSummary.getTotalWuzifTechemariKfya());
                summary.setPaidWuzifTechemariKfya(repoSummary.getPaidWuzifTechemariKfya());
                summary.setPaidKitat(repoSummary.getPaidKitat());
                summary.setTotalWuzifFjotaKfya(repoSummary.getTotalWuzifFjotaKfya());
                summary.setPaidWuzifFjotaKfya(repoSummary.getPaidWuzifFjotaKfya());
                summary.setTotalWuzifDerekKoshasha(repoSummary.getTotalWuzifDerekKoshasha());
                summary.setPaidWuzifDerekKoshasha(repoSummary.getPaidWuzifDerekKoshasha());
                summary.setPaidWuzifHisab(repoSummary.getPaidWuzifHisab());
                summary.setTotalWuzifFjota(repoSummary.getTotalWuzifFjota());
            }

            // 4. Mobile Reader Stats & Customers Without Reading (Based on Reading Date)
            if (profile != null && profile.getActiveReadingDate() != null) {
                String readingMonthDb = "";
                try {
                    EthiopianCalendarConverter.EthiopianDate ethReadingDate = EthiopianCalendarConverter
                            .gregorianToEthiopian(profile.getActiveReadingDate());
                    String rStatsMonth = EthiopianCalendarConverter
                            .getEthiopianMonthNameAmharic(ethReadingDate.getMonth());

                    // Use 'Month, Year' for DB as well per user request
                    readingMonthDb = rStatsMonth + ", " + ethReadingDate.getYear();
                } catch (Exception e) {
                    System.err.println("Error calculating reading month for stats: " + e.getMessage());
                }

                // Customers Without Reading
                if (!readingMonthDb.isEmpty()) {
                    long customersWithReading = readingRepository.countDistinctCustomersByKifyaWer(readingMonthDb);
                    summary.setCustomersWithoutReading((long) Math.max(0, activeCust - customersWithReading));
                } else {
                    summary.setCustomersWithoutReading(0L);
                }

                List<com.wbill.home.model.UserAccount> readers = userAccountRepository.findActiveMeterReaders();
                List<java.util.Map<String, Object>> readerStats = new java.util.ArrayList<>();

                for (com.wbill.home.model.UserAccount reader : readers) {
                    long count = readingRepository.countByMobileReaderUserAndKifyaWer(reader, readingMonthDb);
                    java.util.Map<String, Object> stat = new java.util.HashMap<>();
                    // Construct Name
                    String nm = "";
                    if (reader.getFirstName() != null)
                        nm += reader.getFirstName();
                    if (reader.getMidleName() != null)
                        nm += " " + reader.getMidleName();
                    if (reader.getLastName() != null)
                        nm += " " + reader.getLastName();

                    stat.put("name", nm.trim());
                    stat.put("username", reader.getUserName());
                    stat.put("count", count);
                    readerStats.add(stat);
                }

                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    summary.setMobileReaderStats(mapper.writeValueAsString(readerStats));
                } catch (Exception e) {
                    System.err.println("Error serializing mobile reader stats: " + e.getMessage());
                }
            }

        } else {
            // Zero out
            summary.setTotalBillsGenerated(0);
            summary.setTotalConsumptionM3(0.0);
            summary.setTotalWuzifConsumptionM3(0.0);
            summary.setTotalAdditionalFees(0.0);
            summary.setTotalDerekKoshasha(0.0);
            summary.setTotalPenalty(0.0);
            summary.setTotalWuzifAmount(0.0);
            summary.setTotalPrepaid(0.0);
            summary.setTotalExpectedAmount(0.0);
            summary.setTotalPaidAmount(0.0);
            summary.setCustomersWithoutReading(0L);
        }

        // --- NEW: Calculate Payment Location Stats for Dashboard ---
        if (kifyaWerDb != null) {
            try {
                // Initialize map structure (matching BillList page structure)
                Map<String, Object> paymentStats = new HashMap<>();

                // 1. Prepaid (KecreditYetekefele > 0)
                List<Object[]> prepaidRes = readingRepository.getPrepaidStats(kifyaWerDb);
                Map<String, Object> prepaidData = new HashMap<>();
                if (!prepaidRes.isEmpty()) {
                    Object[] row = prepaidRes.get(0);
                    prepaidData.put("count", row[0] != null ? row[0] : 0L);
                    prepaidData.put("paidAmount", row[1] != null ? row[1] : 0.0);
                    prepaidData.put("additionalHisab", row[2] != null ? row[2] : 0.0);
                    prepaidData.put("wuzifDerekKoshasha", row[3] != null ? row[3] : 0.0);
                    prepaidData.put("tekilalaTekefay", row[4] != null ? row[4] : 0.0);
                } else {
                    prepaidData.put("count", 0L);
                    prepaidData.put("paidAmount", 0.0);
                }
                paymentStats.put("prepaid", prepaidData);

                // 2. Office Paid
                List<Object[]> officeRes = readingRepository.getOfficePaidStats(kifyaWerDb);
                Map<String, Object> officeData = new HashMap<>();
                if (!officeRes.isEmpty()) {
                    Object[] row = officeRes.get(0);
                    officeData.put("count", row[0] != null ? row[0] : 0L);
                    officeData.put("paidAmount", row[1] != null ? row[1] : 0.0);
                    officeData.put("additionalHisab", row[2] != null ? row[2] : 0.0);
                    officeData.put("wuzifDerekKoshasha", row[3] != null ? row[3] : 0.0);
                    officeData.put("tekilalaTekefay", row[4] != null ? row[4] : 0.0);
                } else {
                    officeData.put("count", 0L);
                    officeData.put("paidAmount", 0.0);
                }
                paymentStats.put("office", officeData);

                // 3. Bank Paid (List of banks)
                List<Object[]> bankRes = readingRepository.getBankPaidStats(kifyaWerDb);
                List<Map<String, Object>> bankList = new ArrayList<>();
                for (Object[] row : bankRes) {
                    Map<String, Object> bData = new HashMap<>();
                    bData.put("bankName", row[0]);
                    bData.put("count", row[1] != null ? row[1] : 0L);
                    bData.put("paidAmount", row[2] != null ? row[2] : 0.0);
                    bData.put("additionalHisab", row[3] != null ? row[3] : 0.0);
                    bData.put("wuzifDerekKoshasha", row[4] != null ? row[4] : 0.0);
                    bData.put("tekilalaTekefay", row[5] != null ? row[5] : 0.0);
                    bankList.add(bData);
                }
                paymentStats.put("banks", bankList);

                // 4. Duplicate Payments (Bills with multiple payment flags)
                // Using simplified count logic from repository
                List<Object[]> dupRes = readingRepository.getDuplicatePaymentStats(kifyaWerDb);
                Map<String, Object> duplicateInit = new HashMap<>();
                if (!dupRes.isEmpty()) {
                    Object[] row = dupRes.get(0);
                    duplicateInit.put("count", row[0] != null ? row[0] : 0L);
                    duplicateInit.put("paidAmount", row[1] != null ? row[1] : 0.0);
                    duplicateInit.put("additionalHisab", row[2] != null ? row[2] : 0.0);
                    duplicateInit.put("wuzifDerekKoshasha", row[3] != null ? row[3] : 0.0);
                    duplicateInit.put("tekilalaTekefay", row[4] != null ? row[4] : 0.0);
                }
                paymentStats.put("duplicates", duplicateInit);

                // Serialize
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                summary.setPaymentLocationStats(mapper.writeValueAsString(paymentStats));

            } catch (Exception e) {
                System.err.println("Error calculating payment stats: " + e.getMessage());
                // Don't fail the whole refresh
                summary.setPaymentLocationStats("{}");
            }
        } else {
            summary.setPaymentLocationStats("{}");
        }

        DashboardSummary saved = dashboardSummaryRepository.save(summary);
        System.out.println("[DashboardService] Refresh completed. Saved Summary ID: " + saved.getId());
        return saved;
    }
}
