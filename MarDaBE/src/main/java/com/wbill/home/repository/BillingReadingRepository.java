package com.wbill.home.repository;

import com.wbill.home.dto.BillingReadingDTO;
import com.wbill.home.dto.SimplifiedReadingDTO;
import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.BillingReading;
import com.wbill.home.model.UserAccount;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingReadingRepository extends JpaRepository<BillingReading, Integer> {

        // Helper string for the long SELECT NEW part to keep queries readable
        // IMPORTANT: Ensure this matches the updated BillingReadingDTO constructor
        // exactly in order and type.
        // NOTE: b.invoiceNumber was removed and replaced with bin.invoiceNumber,
        // cu.fullName, and bb.name
        String BILLING_READING_DTO_CONSTRUCTOR = "NEW com.wbill.home.dto.BillingReadingDTO(" +
                        "b.id, b.isBillGenerated, b.isMoneyCollected, " +
                        "b.lastReading, b.previousReading, b.consumption, b.kifyaWer, " +
                        "b.additionalHisab, b.yezihWerFjotaKfya, b.kotariKiray, " +
                        "b.techemariKfya, b.yezihWer, b.wuzifHisab, " +
                        "b.wuzifDerekKoshasha, b.isPaidThroughBank, " +
                        "b.isPaidOnFrontOffice, b.isPaidFromTekemach, " +
                        "b.isDerashPaid, b.isUnicashPaid, b.isAbyssiniaPaid, " +
                        "b.tekilalaTekefay, b.tekilalaBankYetekefele, " +
                        "b.tekilalaYetekefele, b.kecreditYetekefele, " +
                        "b.bankPaidAgentId, b.uBankPaidAgentId, b.status, " +
                        "b.kitat, b.wuzifTechemariKfya, b.consumptionWuzif, " +
                        "b.wuzifKotariKiray, b.wuzifFjota, b.isVoid, b.temelashBirr, " +
                        "b.wuzifFjotaKfya, " +
                        "bin.invoiceNumbers, cu.id, cu.userName, COALESCE(bb.bankName, ubb.bankName), " +
                        "bc.fullName, bc.accountNumber, " +
                        "st.id, st.streetsName, " +
                        // Newly added filter-aligned fields via aliases
                        "ket.id, br.id, ar.id, " +
                        // Readable names for UI display
                        "ket.ketenaName, br.branchDescription, ar.userName, " +
                        // NEW appended fields at the end (must match DTO constructor)
                        "b.billDescriptionBank, bc.fullNameEng, b.wuzifWorBzat, " +
                        "ctype.id, ctype.customerType, bc.phoneNumber, b.isSendToBank, b.isSendToBankUnicash, b.enableEditMeneshaReading, bc.initialConsumption, bc.id, b.zeroReadingWorBzat, "
                        +
                        // CASHIER & DATES ADDITIONS
                        "b.moneyCollectedDate, b.uMoneyCollectedDate, b.collectionDate, b.modifiedDate, b.registeredDate, ubb.bankName, b.bankConfirmationCode, b.uBankPaidConfirmationCode, bc.status, b.wuzifKezihEske, b.isJournalPushed, b.isPaidJournalPushed, " +
                        // SERVICE CHARGE FIELDS
                        "b.mBillingAdditionalPayment1Value, b.mBillingAdditionalPayment2Value, b.mBillingAdditionalPayment1Wuzif, b.mBillingAdditionalPayment2Wuzif, b.mBillingAdditionalPayment1ValueLable, b.mBillingAdditionalPayment2ValueLable)";

        // Helper string for the LEFT JOINs to keep queries clean
        String JOINS_FOR_DTO = "FROM BillingReading b " +
                        "LEFT JOIN b.billingInvoiceNumbers bin " +
                        "LEFT JOIN b.billingBanks bb " +
                        "LEFT JOIN b.uBillingBank ubb " +
                        "LEFT JOIN b.cashierUser cu " + // Added Cashier Join
                        // Explicit customer-related joins as LEFT to avoid losing rows when null
                        "LEFT JOIN b.billingCustomerInfo bc " +
                        "LEFT JOIN bc.addressStreet st " +
                        "LEFT JOIN bc.addressKetena ket " +
                        "LEFT JOIN bc.branch br " +
                        "LEFT JOIN bc.userAccount ar " +
                        "LEFT JOIN bc.billingCustomerType ctype ";

        // 0 by customerId

        @Query("SELECT " + BILLING_READING_DTO_CONSTRUCTOR + JOINS_FOR_DTO +
                        "WHERE b.billingCustomerInfo.id = :customerId " +
                        "ORDER BY b.id DESC")
        List<BillingReadingDTO> findReadingDTOsByCustomerId(@Param("customerId") int customerId);

        // Example 1: Fetch all readings as DTOs
        @Query("SELECT " + BILLING_READING_DTO_CONSTRUCTOR + JOINS_FOR_DTO)
        List<BillingReadingDTO> findAllReadingDTOs();

        // Example 2: Fetch readings as DTOs based on status
        @Query("SELECT " + BILLING_READING_DTO_CONSTRUCTOR + JOINS_FOR_DTO + "WHERE b.status = :status")
        List<BillingReadingDTO> findReadingDTOsByStatus(@Param("status") String status);

        // Example 3: Fetch readings as DTOs based on status AND kifyaWer (single
        // string)
        @Query("SELECT " + BILLING_READING_DTO_CONSTRUCTOR + JOINS_FOR_DTO +
                        "WHERE LOWER(b.status) = LOWER(:status) AND b.kifyaWer = :kifyaWer AND b.isBillGenerated = true AND b.isVoid = false")
        List<BillingReadingDTO> findReadingDTOsByStatusAndKifyaWer(
                        @Param("status") String status,
                        @Param("kifyaWer") String kifyaWer);

        // New: Fetch readings including VOID for Bill Support Page
        @Query("SELECT " + BILLING_READING_DTO_CONSTRUCTOR + JOINS_FOR_DTO +
                        "WHERE LOWER(b.status) = LOWER(:status) AND b.kifyaWer = :kifyaWer AND b.isBillGenerated = true")
        List<BillingReadingDTO> findSupportPageReadingsByStatusAndKifyaWer(
                        @Param("status") String status,
                        @Param("kifyaWer") String kifyaWer);

        // New: Fetch ALL readings (skip isBillGenerated check) for Reading Management
        // Page
        @Query("SELECT " + BILLING_READING_DTO_CONSTRUCTOR + JOINS_FOR_DTO +
                        "WHERE LOWER(b.status) = LOWER(:status) AND b.kifyaWer = :kifyaWer")
        List<BillingReadingDTO> findReadingManagementByStatusAndKifyaWer(
                        @Param("status") String status,
                        @Param("kifyaWer") String kifyaWer);

        // Wrapper with logging of returned size
        default List<BillingReadingDTO> findReadingDTOsByStatusAndKifyaWerWithLog(
                        String status,
                        String kifyaWer) {
                List<BillingReadingDTO> result = findReadingDTOsByStatusAndKifyaWer(status, kifyaWer);
                int count = result != null ? result.size() : 0;
                System.out.println("[BillingReadingRepository] findReadingDTOsByStatusAndKifyaWer status="
                                + status + ", kifyaWer=" + kifyaWer + ", count=" + count);
                return result;
        }

        // New: Fetch readings by kifyaWer only (any status)
        @Query("SELECT " + BILLING_READING_DTO_CONSTRUCTOR + JOINS_FOR_DTO +
                        "WHERE b.kifyaWer = :kifyaWer")
        List<BillingReadingDTO> findReadingDTOsByKifyaWer(
                        @Param("kifyaWer") String kifyaWer);

        // Native count to mirror direct SQL (no joins)
        @Query(value = "SELECT COUNT(*) FROM billing_reading b " +
                        "WHERE LOWER(b.status) = LOWER(:status) " +
                        "AND b.is_bill_generated = 1 " +
                        "AND b.is_void = 0 " +
                        "AND b.kifya_wer = :kifyaWer", nativeQuery = true)
        long countBaseReadingsByStatusAndKifyaWerNative(
                        @Param("status") String status,
                        @Param("kifyaWer") String kifyaWer);

        // Native list of IDs to enable diffing between native and JPQL DTO results
        @Query(value = "SELECT b.id FROM billing_reading b " +
                        "WHERE LOWER(b.status) = LOWER(:status) " +
                        "AND b.is_bill_generated = 1 " +
                        "AND b.is_void = 0 " +
                        "AND b.kifya_wer = :kifyaWer", nativeQuery = true)
        List<Integer> findIdsByStatusAndKifyaWerNative(
                        @Param("status") String status,
                        @Param("kifyaWer") String kifyaWer);

        // Fast distinct billing periods from database
        @Query(value = "SELECT DISTINCT b.kifya_wer FROM billing_reading b " +
                        "WHERE b.kifya_wer IS NOT NULL AND b.kifya_wer != '' " +
                        "ORDER BY b.id DESC LIMIT 48", nativeQuery = true)
        List<String> findDistinctKifyaWerNative();

        // Example 4: Fetch readings for a specific customer by status and kifyaWer
        @Query("SELECT " + BILLING_READING_DTO_CONSTRUCTOR + JOINS_FOR_DTO +
                        "WHERE b.billingCustomerInfo.id = :customerId AND b.status = :status AND b.kifyaWer = :kifyaWer "
                        +
                        "ORDER BY b.id DESC")
        List<BillingReadingDTO> findReadingDTOsByCustomerIdAndStatusAndKifyaWer(
                        @Param("customerId") int customerId,
                        @Param("status") String status,
                        @Param("kifyaWer") String kifyaWer);

        // Method to find the last reading for a specific customer in a given kifyaWer
        // (month/year)
        // This query does not need the DTO projection and can remain as is.
        @Query("SELECT b.lastReading FROM BillingReading b " +
                        "WHERE b.billingCustomerInfo.id = :customerId AND b.kifyaWer = :kifyaWer " +
                        "ORDER BY b.id DESC")
        Optional<Integer> findLastReadingByCustomerIdAndKifyaWer(
                        @Param("customerId") int customerId,
                        @Param("kifyaWer") String kifyaWer);

        Optional<BillingReading> findByBillingCustomerInfoAndKifyaWer(BillingCustomerInfo customer, String kifyaWer);

        Optional<BillingReading> findByBillingCustomerInfoAndKifyaWerAndStatusOrderByCollectionDateDesc(
                        BillingCustomerInfo customer,
                        String kifyaWer,
                        String status);

        Optional<BillingReading> findFirstByBillingCustomerInfoAndKifyaWerAndStatusOrderByCollectionDateDesc(
                        BillingCustomerInfo customer,
                        String kifyaWer,
                        String status);

        // Method to find the full previous BillingReading entity for
        // zero_reading_wor_bzat calculation
        // This query does not need the DTO projection and can remain as is.
        // @Query("SELECT b FROM BillingReading b " +
        // "WHERE b.billingCustomerInfo.id = :customerId AND b.kifyaWer = :kifyaWer " +
        // "ORDER BY b.id DESC")
        // Optional<BillingReading> findFullReadingByCustomerIdAndKifyaWer(
        // @Param("customerId") int customerId,
        // @Param("kifyaWer") String kifyaWer
        // );

        @Query("SELECT b FROM BillingReading b " +
                        "WHERE b.billingCustomerInfo.id = :customerId " +
                        "AND b.kifyaWer = :kifyaWer " +
                        "AND b.status = 'active' " +
                        "ORDER BY b.id DESC")
        Optional<BillingReading> findFullReadingByCustomerIdAndKifyaWer(
                        @Param("customerId") int customerId,
                        @Param("kifyaWer") String kifyaWer);

        @Query("SELECT b FROM BillingReading b " +
                        "WHERE b.billingCustomerInfo IN :customers " +
                        "AND b.kifyaWer = :kifyaWer " +
                        "AND b.status = 'active' " +
                        "ORDER BY b.id DESC")
        List<BillingReading> findFullReadingsByCustomersAndKifyaWer(
                        @Param("customers") List<BillingCustomerInfo> customers,
                        @Param("kifyaWer") String kifyaWer);

        @Query("SELECT b FROM BillingReading b " +
                        "WHERE b.billingCustomerInfo.id = :customerId " +
                        "AND b.kifyaWer = :kifyaWer " +
                        "AND b.status = 'active' " +
                        "ORDER BY b.id DESC")
        BillingReading findTopByCustomerIdAndKifyaWerOrderByIdDesc(
                        @Param("customerId") int customerId,
                        @Param("kifyaWer") String kifyaWer);

        // New method to get simplified readings with isBillGenerated filter
        // @Query("SELECT NEW com.wbill.home.dto.SimplifiedReadingDTO(" +
        // "b.billingCustomerInfo.fullName, b.billingCustomerInfo.accountNumber, " +
        // "b.lastReading, b.previousReading, b.consumption, b.kifyaWer, b.status) " +
        // "FROM BillingReading b " +
        // "WHERE b.isBillGenerated = false OR b.isBillGenerated = 0")
        // List<SimplifiedReadingDTO> findSimplifiedReadingsWhereBillNotGenerated();

        // New method with additional filters
        @Query("SELECT NEW com.wbill.home.dto.SimplifiedReadingDTO(" +
                        "b.id,b.billingCustomerInfo.fullName, b.billingCustomerInfo.accountNumber, " +
                        "b.lastReading, b.previousReading, b.consumption, b.kifyaWer, b.status) " +
                        "FROM BillingReading b " +
                        "WHERE b.isBillGenerated = false " +
                        "AND (:status IS NULL OR b.status = :status) " +
                        "AND (:kifyaWer IS NULL OR b.kifyaWer = :kifyaWer)")
        List<SimplifiedReadingDTO> findFilteredSimplifiedReadingsWhereBillNotGenerated(
                        @Param("status") String status,
                        @Param("kifyaWer") String kifyaWer);

        // Optional<BillingReading>
        // findByBillingCustomerInfoAndKifyaWer(BillingCustomerInfo customer, String
        // kifyaWer);

        @Query("SELECT " + BILLING_READING_DTO_CONSTRUCTOR + JOINS_FOR_DTO +
                        "WHERE b.status = :status AND b.kifyaWer = :kifyaWer AND  b.isBillGenerated = false")
        List<BillingReadingDTO> findReadingDTOsReadingsWhereBillNotGenerated(
                        @Param("status") String status,
                        @Param("kifyaWer") String kifyaWer);

        /**
         * ✅ NEW METHOD: Finds the absolute latest reading for a customer,
         * regardless of the month. Used as a fallback.
         */

        Optional<BillingReading> findFirstByBillingCustomerInfoOrderByRegisteredDateDesc(
                        BillingCustomerInfo customer);

        /**
         * Finds the single most recent reading for a specific customer within a
         * specific billing period (kifyaWer).
         *
         * @param customer The customer entity to search for.
         * @param kifyaWer The billing period string (e.g., "ሐምሌ, 2017").
         * @return An Optional containing the first matching BillingReading, or an empty
         *         Optional if none is found.
         */
        Optional<BillingReading> findFirstByBillingCustomerInfoAndKifyaWerOrderByRegisteredDateDesc(
                        BillingCustomerInfo customer,
                        String kifyaWer);

        /**
         * Find a billing reading by its invoice number (for Unicash CSV import)
         * 
         * @param invoiceNumbers The invoice number to search for
         * @return Optional containing the matching BillingReading
         */
        Optional<BillingReading> findByBillingInvoiceNumbers_InvoiceNumbers(String invoiceNumbers);

        /**
         * Fetch all readings for a given kifyaWer with bill generated = true,
         * together with invoice numbers to build an in-memory lookup map.
         */
        @Query("SELECT b FROM BillingReading b " +
                        "LEFT JOIN FETCH b.billingInvoiceNumbers bin " +
                        "WHERE b.kifyaWer = :kifyaWer AND b.isBillGenerated = true")
        List<BillingReading> findByKifyaWerWithInvoiceNumbers(@Param("kifyaWer") String kifyaWer);

        // Legacy-style Wuzif query: fetch readings for a reader and month where
        // wuzifHisab > :minHisab
        @Query("SELECT b FROM BillingReading b " +
                        "WHERE b.kifyaWer = :kifyaWer " +
                        "AND b.billingCustomerInfo.userAccount = :reader " +
                        "AND b.status = :status " +
                        "AND b.wuzifHisab > :minHisab")
        List<BillingReading> findWuzifByReaderAndKifyaWer(
                        @Param("reader") UserAccount reader,
                        @Param("kifyaWer") String kifyaWer,
                        @Param("status") String status,
                        @Param("minHisab") double minHisab);

        // Updated Query for Granular Financial Summary (including Paid/Total Breakdown)
        @Query("SELECT new com.wbill.home.model.DashboardSummary(" +
        // Group 1 totals:
                        "SUM(b.yezihWerFjotaKfya), " + // totalYezihWerFjotaKfya
                        "SUM(CASE WHEN (b.isPaidOnFrontOffice = true OR b.isDerashPaid = true OR b.isUnicashPaid = true OR b.kecreditYetekefele > 0) THEN b.yezihWerFjotaKfya ELSE 0.0 END), "
                        + // paidYezihWerFjotaKfya

                        "SUM(b.kotariKiray), " + // totalKotariKiray
                        "SUM(CASE WHEN (b.isPaidOnFrontOffice = true OR b.isDerashPaid = true OR b.isUnicashPaid = true OR b.kecreditYetekefele > 0) THEN b.kotariKiray ELSE 0.0 END), "
                        + // paidKotariKiray

                        "SUM(b.techemariKfya), " + // totalTechemariKfya
                        "SUM(CASE WHEN (b.isPaidOnFrontOffice = true OR b.isDerashPaid = true OR b.isUnicashPaid = true OR b.kecreditYetekefele > 0) THEN b.techemariKfya ELSE 0.0 END), "
                        + // paidTechemariKfya

                        "SUM(b.additionalHisab), " + // totalAdditionalHisab (Yeworu Derek Koshasha)
                        "SUM(CASE WHEN (b.isPaidOnFrontOffice = true OR b.isDerashPaid = true OR b.isUnicashPaid = true OR b.kecreditYetekefele > 0) THEN b.additionalHisab ELSE 0.0 END), "
                        + // paidAdditionalHisab

                        // Group 2 totals:
                        "SUM(b.wuzifKotariKiray), " + // totalWuzifKotariKiray
                        "SUM(CASE WHEN (b.isPaidOnFrontOffice = true OR b.isDerashPaid = true OR b.isUnicashPaid = true OR b.kecreditYetekefele > 0) THEN b.wuzifKotariKiray ELSE 0.0 END), "
                        + // paidWuzifKotariKiray

                        "SUM(b.wuzifTechemariKfya), " + // totalWuzifTechemariKfya
                        "SUM(CASE WHEN (b.isPaidOnFrontOffice = true OR b.isDerashPaid = true OR b.isUnicashPaid = true OR b.kecreditYetekefele > 0) THEN b.wuzifTechemariKfya ELSE 0.0 END), "
                        + // paidWuzifTechemariKfya

                        "SUM(b.kitat), " + // totalPenalty
                        "SUM(CASE WHEN (b.isPaidOnFrontOffice = true OR b.isDerashPaid = true OR b.isUnicashPaid = true OR b.kecreditYetekefele > 0) THEN b.kitat ELSE 0.0 END), "
                        + // paidKitat

                        "SUM(b.wuzifFjotaKfya), " + // totalWuzifFjotaKfya
                        "SUM(CASE WHEN (b.isPaidOnFrontOffice = true OR b.isDerashPaid = true OR b.isUnicashPaid = true OR b.kecreditYetekefele > 0) THEN b.wuzifFjotaKfya ELSE 0.0 END), "
                        + // paidWuzifFjotaKfya

                        "SUM(b.wuzifDerekKoshasha), " + // totalWuzifDerekKoshasha
                        "SUM(CASE WHEN (b.isPaidOnFrontOffice = true OR b.isDerashPaid = true OR b.isUnicashPaid = true OR b.kecreditYetekefele > 0) THEN b.wuzifDerekKoshasha ELSE 0.0 END), "
                        + // paidWuzifDerekKoshasha

                        "SUM(b.wuzifHisab), " + // totalWuzifHisab
                        "SUM(CASE WHEN (b.isPaidOnFrontOffice = true OR b.isDerashPaid = true OR b.isUnicashPaid = true OR b.kecreditYetekefele > 0) THEN b.wuzifHisab ELSE 0.0 END), "
                        + // paidWuzifHisab

                        // Other High Level
                        "SUM(b.consumption), " + // totalConsumptionM3
                        "SUM(b.consumptionWuzif), " + // totalWuzifConsumptionM3
                        "SUM(b.kecreditYetekefele), " + // totalPrepaid
                        "SUM(b.tekilalaYetekefele), " + // totalPaidAmount
                        "SUM(b.tekilalaTekefay), " + // totalExpectedAmount
                        "COUNT(b), " + // totalBillsGenerated
                        "SUM(CASE WHEN (b.isVoid = true) THEN 1 ELSE 0 END) " + // voidBillsCount (for exclusion logic
                                                                                // if needed, or informational)
                        ") " +
                        "FROM BillingReading b WHERE b.isVoid = false AND b.isBillGenerated = true AND b.kifyaWer = :kifyaWer")
        com.wbill.home.model.DashboardSummary getDashboardSums(@Param("kifyaWer") String kifyaWer);

        long countByMobileReaderUserAndKifyaWer(com.wbill.home.model.UserAccount mobileReaderUser, String kifyaWer);

        long countDistinctCustomersByKifyaWer(@Param("kifyaWer") String kifyaWer);

        // --- NEW QUERIES FOR DASHBOARD PAYMENT LOCATION ANALYSIS ---

        // 1. Prepaid Stats
        @Query("SELECT COUNT(b), SUM(b.kecreditYetekefele), SUM(b.additionalHisab), SUM(b.wuzifDerekKoshasha), SUM(b.tekilalaTekefay) "
                        +
                        "FROM BillingReading b WHERE b.kifyaWer = :kifyaWer AND b.isVoid = false AND b.kecreditYetekefele > 0")
        List<Object[]> getPrepaidStats(@Param("kifyaWer") String kifyaWer);

        // 2. Office Paid Stats
        @Query("SELECT COUNT(b), SUM(b.tekilalaYetekefele), SUM(b.additionalHisab), SUM(b.wuzifDerekKoshasha), SUM(b.tekilalaTekefay) "
                        +
                        "FROM BillingReading b WHERE b.kifyaWer = :kifyaWer AND b.isVoid = false AND b.isPaidOnFrontOffice = true")
        List<Object[]> getOfficePaidStats(@Param("kifyaWer") String kifyaWer);

        // 3. Bank/Derash Paid Stats (Grouped by Bank Name)
        @Query("SELECT COALESCE(bb.bankName, ubb.bankName, 'Unknown'), COUNT(b), SUM(b.tekilalaBankYetekefele), SUM(b.additionalHisab), SUM(b.wuzifDerekKoshasha), SUM(b.tekilalaTekefay) "
                        +
                        "FROM BillingReading b " +
                        "LEFT JOIN b.billingBanks bb " +
                        "LEFT JOIN b.uBillingBank ubb " +
                        "WHERE b.kifyaWer = :kifyaWer AND b.isVoid = false AND (b.isDerashPaid = true OR b.isUnicashPaid = true) "
                        +
                        "GROUP BY COALESCE(bb.bankName, ubb.bankName, 'Unknown')")
        List<Object[]> getBankPaidStats(@Param("kifyaWer") String kifyaWer);

        // 4. Duplicate Payment Check Counts
        // Returns list of IDs where more than one payment flag is true (simplified
        // check)
        @Query("SELECT COUNT(b), SUM(b.tekilalaYetekefele), SUM(b.additionalHisab), SUM(b.wuzifDerekKoshasha), SUM(b.tekilalaTekefay) "
                        +
                        "FROM BillingReading b " +
                        "WHERE b.kifyaWer = :kifyaWer AND b.isVoid = false AND " +
                        "((CASE WHEN b.kecreditYetekefele > 0 THEN 1 ELSE 0 END) + " +
                        "(CASE WHEN b.isPaidOnFrontOffice = true THEN 1 ELSE 0 END) + " +
                        "(CASE WHEN (b.isDerashPaid = true OR b.isUnicashPaid = true) THEN 1 ELSE 0 END)) > 1")
        List<Object[]> getDuplicatePaymentStats(@Param("kifyaWer") String kifyaWer);

        // ── Yearly Consumption Summary (grouped by kifyaWer) ──
        // Supports optional filtering by customerType and branch
        @Query("SELECT b.kifyaWer, " +
                        "SUM(b.consumption), COUNT(b), " +
                        "SUM(b.yezihWerFjotaKfya), SUM(b.kotariKiray), " +
                        "SUM(b.techemariKfya), SUM(b.additionalHisab), " +
                        "SUM(b.kitat), SUM(b.wuzifHisab), " +
                        "SUM(b.tekilalaTekefay), SUM(b.tekilalaYetekefele), " +
                        "SUM(b.kecreditYetekefele), SUM(b.wuzifDerekKoshasha) " +
                        "FROM BillingReading b " +
                        "LEFT JOIN b.billingCustomerInfo bc " +
                        "LEFT JOIN bc.billingCustomerType ctype " +
                        "LEFT JOIN bc.branch br " +
                        "WHERE b.kifyaWer IN :kifyaWerList " +
                        "AND b.isVoid = false AND b.isBillGenerated = true " +
                        "AND LOWER(b.status) = 'active' " +
                        "AND (:customerTypeId IS NULL OR ctype.id = :customerTypeId) " +
                        "AND (:branchId IS NULL OR br.id = :branchId) " +
                        "GROUP BY b.kifyaWer")
        List<Object[]> getYearlyConsumptionSummary(
                        @Param("kifyaWerList") List<String> kifyaWerList,
                        @Param("customerTypeId") Integer customerTypeId,
                        @Param("branchId") Integer branchId);

        // --- JOURNAL PUSH TRACKING QUERIES ---

        // Count bills not yet pushed to journal for a billing period
        @Query("SELECT COUNT(b) FROM BillingReading b " +
                        "WHERE b.kifyaWer = :kifyaWer AND b.isVoid = false " +
                        "AND b.isBillGenerated = true AND LOWER(b.status) = 'active' " +
                        "AND b.isJournalPushed = false")
        long countUnpushedBills(@Param("kifyaWer") String kifyaWer);

        // Count bills already pushed to journal for a billing period
        @Query("SELECT COUNT(b) FROM BillingReading b " +
                        "WHERE b.kifyaWer = :kifyaWer AND b.isVoid = false " +
                        "AND b.isBillGenerated = true AND LOWER(b.status) = 'active' " +
                        "AND b.isJournalPushed = true")
        long countPushedBills(@Param("kifyaWer") String kifyaWer);

        // Bulk update: mark unpushed bills as journal-pushed
        @Modifying
        @Query("UPDATE BillingReading b SET b.isJournalPushed = true, b.journalEntryRef = :ref " +
                        "WHERE b.kifyaWer = :kifyaWer AND b.isVoid = false " +
                        "AND b.isBillGenerated = true AND LOWER(b.status) = 'active' " +
                        "AND b.isJournalPushed = false")
        int markBillsAsJournalPushed(@Param("kifyaWer") String kifyaWer, @Param("ref") String ref);

        // Reset pushed flag when journal entry is voided
        @Modifying
        @Query("UPDATE BillingReading b SET b.isJournalPushed = false, b.journalEntryRef = null " +
                        "WHERE b.journalEntryRef = :ref")
        int resetJournalPushedByRef(@Param("ref") String ref);

        // --- PAID BILL JOURNAL PUSH TRACKING QUERIES (separate from Bill Preparation) ---

        // Count paid bills not yet pushed to paid journal for a billing period
        @Query("SELECT COUNT(b) FROM BillingReading b " +
                        "WHERE b.kifyaWer = :kifyaWer AND b.isVoid = false " +
                        "AND b.isBillGenerated = true AND LOWER(b.status) = 'active' " +
                        "AND b.isPaidJournalPushed = false " +
                        "AND (b.isPaidOnFrontOffice = true OR b.isDerashPaid = true OR b.isUnicashPaid = true OR b.kecreditYetekefele > 0)")
        long countUnpushedPaidBills(@Param("kifyaWer") String kifyaWer);

        // Count paid bills already pushed to paid journal for a billing period
        @Query("SELECT COUNT(b) FROM BillingReading b " +
                        "WHERE b.kifyaWer = :kifyaWer AND b.isVoid = false " +
                        "AND b.isBillGenerated = true AND LOWER(b.status) = 'active' " +
                        "AND b.isPaidJournalPushed = true " +
                        "AND (b.isPaidOnFrontOffice = true OR b.isDerashPaid = true OR b.isUnicashPaid = true OR b.kecreditYetekefele > 0)")
        long countPushedPaidBills(@Param("kifyaWer") String kifyaWer);

        // Bulk update: mark unpushed paid bills as paid-journal-pushed
        @Modifying
        @Query("UPDATE BillingReading b SET b.isPaidJournalPushed = true, b.paidJournalEntryRef = :ref " +
                        "WHERE b.kifyaWer = :kifyaWer AND b.isVoid = false " +
                        "AND b.isBillGenerated = true AND LOWER(b.status) = 'active' " +
                        "AND b.isPaidJournalPushed = false " +
                        "AND (b.isPaidOnFrontOffice = true OR b.isDerashPaid = true OR b.isUnicashPaid = true OR b.kecreditYetekefele > 0)")
        int markPaidBillsAsJournalPushed(@Param("kifyaWer") String kifyaWer, @Param("ref") String ref);

        // Reset paid pushed flag when paid journal entry is voided
        @Modifying
        @Query("UPDATE BillingReading b SET b.isPaidJournalPushed = false, b.paidJournalEntryRef = null " +
                        "WHERE b.paidJournalEntryRef = :ref")
        int resetPaidJournalPushedByRef(@Param("ref") String ref);

        // --- UNPAID BILL SUMMARY QUERIES (for Section 3: Unpaid Receivable Reversal) ---

        // Sum charge-level breakdown for unpaid bills (active, non-void, not collected)
        @Query("SELECT SUM(b.yezihWerFjotaKfya), SUM(b.kotariKiray), SUM(b.techemariKfya), " +
                        "SUM(b.additionalHisab), SUM(b.wuzifKotariKiray), SUM(b.wuzifTechemariKfya), " +
                        "SUM(b.kitat), SUM(b.wuzifFjotaKfya), SUM(b.wuzifDerekKoshasha), " +
                        "SUM(b.wuzifHisab), SUM(b.temelashBirr), COUNT(b) " +
                        "FROM BillingReading b WHERE (b.kifyaWer = :kifyaWer OR b.kifyaWer = :kifyaWerAlt OR b.kifyaWer LIKE :pattern) " +
                        "AND b.isVoid = false AND LOWER(b.status) = 'active' " +
                        "AND (b.isMoneyCollected = false OR b.isMoneyCollected IS NULL)")
        Object[] getUnpaidPushedBillSummary(
                        @Param("kifyaWer") String kifyaWer,
                        @Param("kifyaWerAlt") String kifyaWerAlt,
                        @Param("pattern") String pattern);
}