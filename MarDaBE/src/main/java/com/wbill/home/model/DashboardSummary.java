package com.wbill.home.model;

import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.*;

/**
 * Entity to store cached dashboard statistics.
 * Refreshed on-demand to improve performance.
 */
@Entity
@Table(name = "dashboard_summary")
public class DashboardSummary implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "total_active_customers")
    private int totalActiveCustomers;

    @Column(name = "total_deactivated_customers")
    private int totalDeactivatedCustomers;

    @Column(name = "total_deleted_customers")
    private int totalDeletedCustomers;

    @Column(name = "active_billing_month")
    private String activeBillingMonth; // e.g., "Meskerem"

    @Column(name = "active_billing_year")
    private int activeBillingYear; // e.g., 2017

    @Temporal(TemporalType.DATE)
    @Column(name = "active_reading_date")
    private Date activeReadingDate;

    @Transient
    private String activeReadingMonth; // Populated by Service, not in DB

    // Summary Fields (matching frontend 'Summary Overview' requirements)
    @Column(name = "total_bills_generated")
    private int totalBillsGenerated;

    @Column(name = "total_consumption_m3")
    private double totalConsumptionM3; // consumption

    @Column(name = "total_wuzif_consumption_m3")
    private Double totalWuzifConsumptionM3; // wuzifFjota (using double for safety, though often int)

    @Column(name = "total_additional_fees")
    private Double totalAdditionalFees; // techemariKfya + wuzifTechemariKfya

    @Column(name = "total_derek_koshasha")
    private Double totalDerekKoshasha; // additionalHisab + wuzifDerekKoshasha

    @Column(name = "total_wuzif_amount")
    private Double totalWuzifAmount; // wuzifHisab (excluding derek koshasha usually, but we store raw total here or
                                     // specific?)
    // Let's store the specific components so frontend can display as is.

    @Column(name = "total_penalty")
    private Double totalPenalty; // kitat

    @Column(name = "total_prepaid")
    private Double totalPrepaid; // kecreditYetekefele

    @Column(name = "total_paid_amount")
    private Double totalPaidAmount; // tekilalaYetekefele (collected)

    @Column(name = "total_expected_amount")
    private Double totalExpectedAmount; // tekilalaTekefay (payable)

    @Column(name = "customers_without_reading")
    private Long customersWithoutReading;

    // --- New Fields for Group 1/2 Detailed Breakdown ---

    // Group 1: Current Month
    // yezihWerFjotaKfya (Water Consumption Fee)
    @Column(name = "paid_yezih_wer_fjota_kfya")
    private Double paidYezihWerFjotaKfya;

    @Column(name = "total_yezih_wer_fjota_kfya")
    private Double totalYezihWerFjotaKfya;

    // kotariKiray (Meter Rent)
    @Column(name = "paid_kotari_kiray")
    private Double paidKotariKiray;

    @Column(name = "total_kotari_kiray")
    private Double totalKotariKiray;

    // techemariKfya (Additional Fee - usually distinct from Additional Hisab/Derek
    // Koshasha)
    @Column(name = "paid_techemari_kfya")
    private Double paidTechemariKfya;

    @Column(name = "total_techemari_kfya")
    private Double totalTechemariKfya;

    // additionalHisab (Yeworu Derek Koshasha / Current Month Waste)
    @Column(name = "paid_additional_hisab")
    private Double paidAdditionalHisab;

    // Group 2: Arrears (Wuzif)
    // wuzifKotariKiray
    @Column(name = "paid_wuzif_kotari_kiray")
    private Double paidWuzifKotariKiray;

    @Column(name = "total_wuzif_kotari_kiray")
    private Double totalWuzifKotariKiray;

    // wuzifTechemariKfya
    @Column(name = "paid_wuzif_techemari_kfya")
    private Double paidWuzifTechemariKfya;

    @Column(name = "total_wuzif_techemari_kfya")
    private Double totalWuzifTechemariKfya;

    // kitat (Penalty)
    @Column(name = "paid_kitat")
    private Double paidKitat;
    // totalPenalty already exists

    // wuzifFjotaKfya (Arrears Consumption Fee)
    @Column(name = "paid_wuzif_fjota_kfya")
    private Double paidWuzifFjotaKfya;

    @Column(name = "total_wuzif_fjota_kfya")
    private Double totalWuzifFjotaKfya;

    // wuzifDerekKoshasha (Arrears Waste)
    @Column(name = "paid_wuzif_derek_koshasha")
    private Double paidWuzifDerekKoshasha;

    @Column(name = "total_wuzif_derek_koshasha")
    private Double totalWuzifDerekKoshasha;

    // wuzifHisab (Total Arrears)
    @Column(name = "paid_wuzif_hisab")
    private Double paidWuzifHisab;

    // Consumption fields (not monetary, but distinct totals needed)
    @Column(name = "total_wuzif_fjota")
    private Double totalWuzifFjota; // Volume

    @Lob
    @Column(name = "mobile_reader_stats")
    private String mobileReaderStats; // JSON string: [{"name":"Abebe","count":50}, ...]

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "last_updated")
    private Date lastUpdated;

    @Column(name = "updated_by")
    private String updatedBy;

    // Stores detailed payment location stats including duplicates (JSON string)
    @Lob
    @Column(name = "payment_location_stats")
    private String paymentLocationStats;

    public DashboardSummary() {
    }

    // Constructor for Repository Aggregation Query
    public DashboardSummary(
            // Group 1
            Double totalYezihWerFjotaKfya, Double paidYezihWerFjotaKfya,
            Double totalKotariKiray, Double paidKotariKiray,
            Double totalTechemariKfya, Double paidTechemariKfya,
            Double totalAdditionalHisab, Double paidAdditionalHisab,

            // Group 2
            Double totalWuzifKotariKiray, Double paidWuzifKotariKiray,
            Double totalWuzifTechemariKfya, Double paidWuzifTechemariKfya,
            Double totalPenalty, Double paidKitat,
            Double totalWuzifFjotaKfya, Double paidWuzifFjotaKfya,
            Double totalWuzifDerekKoshasha, Double paidWuzifDerekKoshasha,
            Double totalWuzifHisab, Double paidWuzifHisab,

            // High Level
            Long totalConsumption, Long totalWuzifConsumption,
            Double totalPrepaid, Double totalPaidAmount, Double totalExpectedAmount,
            Long totalBillsGenerated, Long voidBillsCount) {

        // Group 1
        this.totalYezihWerFjotaKfya = totalYezihWerFjotaKfya != null ? totalYezihWerFjotaKfya : 0.0;
        this.paidYezihWerFjotaKfya = paidYezihWerFjotaKfya != null ? paidYezihWerFjotaKfya : 0.0;
        this.totalKotariKiray = totalKotariKiray != null ? totalKotariKiray : 0.0;
        this.paidKotariKiray = paidKotariKiray != null ? paidKotariKiray : 0.0;
        this.totalTechemariKfya = totalTechemariKfya != null ? totalTechemariKfya : 0.0;
        this.paidTechemariKfya = paidTechemariKfya != null ? paidTechemariKfya : 0.0;
        this.totalDerekKoshasha = totalAdditionalHisab != null ? totalAdditionalHisab : 0.0; // Mapping additionalHisab
                                                                                             // to totalDerekKoshasha
                                                                                             // per user request logic
        this.paidAdditionalHisab = paidAdditionalHisab != null ? paidAdditionalHisab : 0.0;

        // Group 2
        this.totalWuzifKotariKiray = totalWuzifKotariKiray != null ? totalWuzifKotariKiray : 0.0;
        this.paidWuzifKotariKiray = paidWuzifKotariKiray != null ? paidWuzifKotariKiray : 0.0;
        this.totalWuzifTechemariKfya = totalWuzifTechemariKfya != null ? totalWuzifTechemariKfya : 0.0;
        this.paidWuzifTechemariKfya = paidWuzifTechemariKfya != null ? paidWuzifTechemariKfya : 0.0;
        this.totalPenalty = totalPenalty != null ? totalPenalty : 0.0;
        this.paidKitat = paidKitat != null ? paidKitat : 0.0;
        this.totalWuzifFjotaKfya = totalWuzifFjotaKfya != null ? totalWuzifFjotaKfya : 0.0;
        this.paidWuzifFjotaKfya = paidWuzifFjotaKfya != null ? paidWuzifFjotaKfya : 0.0;
        this.totalWuzifDerekKoshasha = totalWuzifDerekKoshasha != null ? totalWuzifDerekKoshasha : 0.0;
        this.paidWuzifDerekKoshasha = paidWuzifDerekKoshasha != null ? paidWuzifDerekKoshasha : 0.0;
        this.totalWuzifAmount = totalWuzifHisab != null ? totalWuzifHisab : 0.0;
        this.paidWuzifHisab = paidWuzifHisab != null ? paidWuzifHisab : 0.0;

        // High Level
        this.totalConsumptionM3 = totalConsumption != null ? totalConsumption.doubleValue() : 0.0;
        this.totalWuzifConsumptionM3 = totalWuzifConsumption != null ? totalWuzifConsumption.doubleValue() : 0.0;
        this.totalPrepaid = totalPrepaid != null ? totalPrepaid : 0.0;
        this.totalPaidAmount = totalPaidAmount != null ? totalPaidAmount : 0.0;
        this.totalExpectedAmount = totalExpectedAmount != null ? totalExpectedAmount : 0.0;
        this.totalBillsGenerated = totalBillsGenerated != null ? totalBillsGenerated.intValue() : 0;

        // Calculated aggregates
        // Total Additional Fees = Techemari + Wuzif Techemari
        this.totalAdditionalFees = this.totalTechemariKfya + this.totalWuzifTechemariKfya;

        // Total Derek Koshasha logic: The user says "Yeworu Derek Koshasha =
        // additionalHisab".
        // And "Total Derek Koshasha" usually sums Current + Wuzif Derek Koshasha
        this.totalDerekKoshasha = (totalAdditionalHisab != null ? totalAdditionalHisab : 0.0)
                + this.totalWuzifDerekKoshasha;
    }

    // Getters and Setters

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getTotalActiveCustomers() {
        return totalActiveCustomers;
    }

    public void setTotalActiveCustomers(int totalActiveCustomers) {
        this.totalActiveCustomers = totalActiveCustomers;
    }

    public int getTotalDeactivatedCustomers() {
        return totalDeactivatedCustomers;
    }

    public void setTotalDeactivatedCustomers(int totalDeactivatedCustomers) {
        this.totalDeactivatedCustomers = totalDeactivatedCustomers;
    }

    public int getTotalDeletedCustomers() {
        return totalDeletedCustomers;
    }

    public void setTotalDeletedCustomers(int totalDeletedCustomers) {
        this.totalDeletedCustomers = totalDeletedCustomers;
    }

    public String getActiveBillingMonth() {
        return activeBillingMonth;
    }

    public void setActiveBillingMonth(String activeBillingMonth) {
        this.activeBillingMonth = activeBillingMonth;
    }

    public int getActiveBillingYear() {
        return activeBillingYear;
    }

    public void setActiveBillingYear(int activeBillingYear) {
        this.activeBillingYear = activeBillingYear;
    }

    public Date getActiveReadingDate() {
        return activeReadingDate;
    }

    public void setActiveReadingDate(Date activeReadingDate) {
        this.activeReadingDate = activeReadingDate;
    }

    public String getActiveReadingMonth() {
        return activeReadingMonth;
    }

    public void setActiveReadingMonth(String activeReadingMonth) {
        this.activeReadingMonth = activeReadingMonth;
    }

    public int getTotalBillsGenerated() {
        return totalBillsGenerated;
    }

    public void setTotalBillsGenerated(int totalBillsGenerated) {
        this.totalBillsGenerated = totalBillsGenerated;
    }

    public Long getCustomersWithoutReading() {
        return customersWithoutReading;
    }

    public void setCustomersWithoutReading(Long customersWithoutReading) {
        this.customersWithoutReading = customersWithoutReading;
    }

    public String getMobileReaderStats() {
        return mobileReaderStats;
    }

    public void setMobileReaderStats(String mobileReaderStats) {
        this.mobileReaderStats = mobileReaderStats;
    }

    public double getTotalConsumptionM3() {
        return totalConsumptionM3;
    }

    public void setTotalConsumptionM3(double totalConsumptionM3) {
        this.totalConsumptionM3 = totalConsumptionM3;
    }

    public double getTotalWuzifConsumptionM3() {
        return totalWuzifConsumptionM3;
    }

    public void setTotalWuzifConsumptionM3(double totalWuzifConsumptionM3) {
        this.totalWuzifConsumptionM3 = totalWuzifConsumptionM3;
    }

    public double getTotalAdditionalFees() {
        return totalAdditionalFees;
    }

    public void setTotalAdditionalFees(double totalAdditionalFees) {
        this.totalAdditionalFees = totalAdditionalFees;
    }

    public double getTotalDerekKoshasha() {
        return totalDerekKoshasha;
    }

    public void setTotalDerekKoshasha(double totalDerekKoshasha) {
        this.totalDerekKoshasha = totalDerekKoshasha;
    }

    public double getTotalWuzifAmount() {
        return totalWuzifAmount;
    }

    public void setTotalWuzifAmount(double totalWuzifAmount) {
        this.totalWuzifAmount = totalWuzifAmount;
    }

    public double getTotalPenalty() {
        return totalPenalty;
    }

    public void setTotalPenalty(double totalPenalty) {
        this.totalPenalty = totalPenalty;
    }

    public double getTotalPrepaid() {
        return totalPrepaid;
    }

    public void setTotalPrepaid(double totalPrepaid) {
        this.totalPrepaid = totalPrepaid;
    }

    public double getTotalPaidAmount() {
        return totalPaidAmount;
    }

    public void setTotalPaidAmount(double totalPaidAmount) {
        this.totalPaidAmount = totalPaidAmount;
    }

    public double getTotalExpectedAmount() {
        return totalExpectedAmount;
    }

    public void setTotalExpectedAmount(double totalExpectedAmount) {
        this.totalExpectedAmount = totalExpectedAmount;
    }

    public Date getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Date lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public Double getPaidYezihWerFjotaKfya() {
        return paidYezihWerFjotaKfya;
    }

    public void setPaidYezihWerFjotaKfya(Double paidYezihWerFjotaKfya) {
        this.paidYezihWerFjotaKfya = paidYezihWerFjotaKfya;
    }

    public Double getTotalYezihWerFjotaKfya() {
        return totalYezihWerFjotaKfya;
    }

    public void setTotalYezihWerFjotaKfya(Double totalYezihWerFjotaKfya) {
        this.totalYezihWerFjotaKfya = totalYezihWerFjotaKfya;
    }

    public Double getPaidKotariKiray() {
        return paidKotariKiray;
    }

    public void setPaidKotariKiray(Double paidKotariKiray) {
        this.paidKotariKiray = paidKotariKiray;
    }

    public Double getTotalKotariKiray() {
        return totalKotariKiray;
    }

    public void setTotalKotariKiray(Double totalKotariKiray) {
        this.totalKotariKiray = totalKotariKiray;
    }

    public Double getPaidTechemariKfya() {
        return paidTechemariKfya;
    }

    public void setPaidTechemariKfya(Double paidTechemariKfya) {
        this.paidTechemariKfya = paidTechemariKfya;
    }

    public Double getTotalTechemariKfya() {
        return totalTechemariKfya;
    }

    public void setTotalTechemariKfya(Double totalTechemariKfya) {
        this.totalTechemariKfya = totalTechemariKfya;
    }

    public Double getPaidAdditionalHisab() {
        return paidAdditionalHisab;
    }

    public void setPaidAdditionalHisab(Double paidAdditionalHisab) {
        this.paidAdditionalHisab = paidAdditionalHisab;
    }

    public Double getPaidWuzifKotariKiray() {
        return paidWuzifKotariKiray;
    }

    public void setPaidWuzifKotariKiray(Double paidWuzifKotariKiray) {
        this.paidWuzifKotariKiray = paidWuzifKotariKiray;
    }

    public Double getTotalWuzifKotariKiray() {
        return totalWuzifKotariKiray;
    }

    public void setTotalWuzifKotariKiray(Double totalWuzifKotariKiray) {
        this.totalWuzifKotariKiray = totalWuzifKotariKiray;
    }

    public Double getPaidWuzifTechemariKfya() {
        return paidWuzifTechemariKfya;
    }

    public void setPaidWuzifTechemariKfya(Double paidWuzifTechemariKfya) {
        this.paidWuzifTechemariKfya = paidWuzifTechemariKfya;
    }

    public Double getTotalWuzifTechemariKfya() {
        return totalWuzifTechemariKfya;
    }

    public void setTotalWuzifTechemariKfya(Double totalWuzifTechemariKfya) {
        this.totalWuzifTechemariKfya = totalWuzifTechemariKfya;
    }

    public Double getPaidKitat() {
        return paidKitat;
    }

    public void setPaidKitat(Double paidKitat) {
        this.paidKitat = paidKitat;
    }

    public Double getPaidWuzifFjotaKfya() {
        return paidWuzifFjotaKfya;
    }

    public void setPaidWuzifFjotaKfya(Double paidWuzifFjotaKfya) {
        this.paidWuzifFjotaKfya = paidWuzifFjotaKfya;
    }

    public Double getTotalWuzifFjotaKfya() {
        return totalWuzifFjotaKfya;
    }

    public void setTotalWuzifFjotaKfya(Double totalWuzifFjotaKfya) {
        this.totalWuzifFjotaKfya = totalWuzifFjotaKfya;
    }

    public Double getPaidWuzifDerekKoshasha() {
        return paidWuzifDerekKoshasha;
    }

    public void setPaidWuzifDerekKoshasha(Double paidWuzifDerekKoshasha) {
        this.paidWuzifDerekKoshasha = paidWuzifDerekKoshasha;
    }

    public Double getTotalWuzifDerekKoshasha() {
        return totalWuzifDerekKoshasha;
    }

    public void setTotalWuzifDerekKoshasha(Double totalWuzifDerekKoshasha) {
        this.totalWuzifDerekKoshasha = totalWuzifDerekKoshasha;
    }

    public Double getPaidWuzifHisab() {
        return paidWuzifHisab;
    }

    public void setPaidWuzifHisab(Double paidWuzifHisab) {
        this.paidWuzifHisab = paidWuzifHisab;
    }

    public Double getTotalWuzifFjota() {
        return totalWuzifFjota;
    }

    public void setTotalWuzifFjota(Double totalWuzifFjota) {
        this.totalWuzifFjota = totalWuzifFjota;
    }

    public String getPaymentLocationStats() {
        return paymentLocationStats;
    }

    public void setPaymentLocationStats(String paymentLocationStats) {
        this.paymentLocationStats = paymentLocationStats;
    }
}
