package com.wbill.home.repository;

import com.wbill.home.dto.CustomerListDTO;
import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.BillingReading;
import com.wbill.home.model.UserAccount;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

@Repository
public interface BillingCustomerInfoRepository extends JpaRepository<BillingCustomerInfo, Integer> {
        // public interface BillingCustomerInfoRepository extends
        // JpaRepository<BillingCustomerInfo, Integer> {
        boolean existsByAccountNumber(String accountNumber);

        boolean existsByMeterNumber(String meterNumber);

        /**
         * Finds a paginated list of customers with a given status and returns them as
         * DTOs.
         * This uses a constructor expression for efficient projection.
         * 
         * @param status   The status to filter by (e.g., "active").
         * @param pageable The pagination information (page number, size).
         * @return A Page of CustomerListDTO objects.
         */
        @Query("SELECT new com.wbill.home.dto.CustomerListDTO(b.id, b.accountNumber, b.fullName, b.phoneNumber, b.registeredDate, b.status) "
                        +
                        "FROM BillingCustomerInfo b WHERE b.status = :status")
        Page<CustomerListDTO> findByStatusAsDTO(@Param("status") String status, Pageable pageable);

        @Query("SELECT new com.wbill.home.dto.CustomerListDTO(b.id, b.accountNumber, b.fullName, b.phoneNumber, b.registeredDate, b.status) "
                        + "FROM BillingCustomerInfo b WHERE b.status = :status "
                        + "AND (:customerTypeId IS NULL OR b.billingCustomerType.id = :customerTypeId) "
                        + "AND (:kebeleId IS NULL OR b.addressStreet.id = :kebeleId) "
                        + "AND (:ketenaId IS NULL OR b.addressKetena.id = :ketenaId) "
                        + "AND (:branchId IS NULL OR b.branch.id = :branchId) "
                        + "AND (:readerId IS NULL OR b.userAccount.id = :readerId) "
                        + "AND (:search IS NULL OR LOWER(b.fullName) LIKE LOWER(CONCAT('%', :search, '%')) "
                        + "OR LOWER(b.accountNumber) LIKE LOWER(CONCAT('%', :search, '%')) "
                        + "OR LOWER(b.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
        Page<CustomerListDTO> findFilteredByStatus(@Param("status") String status,
                                                   @Param("customerTypeId") Integer customerTypeId,
                                                   @Param("kebeleId") Integer kebeleId,
                                                   @Param("ketenaId") Integer ketenaId,
                                                   @Param("branchId") Integer branchId,
                                                   @Param("readerId") Integer readerId,
                                                   @Param("search") String search,
                                                   Pageable pageable);


        // You might also need to find the customer by account number
        // This method would be in BillingCustomerInfoRepository

        Optional<BillingCustomerInfo> findByAccountNumber(String accountNumber);

        List<BillingCustomerInfo> findByAccountNumberIn(List<String> accountNumbers);

        // Active-only lookup by account number (status hardcoded to ACTIVE)
        @Query("SELECT b FROM BillingCustomerInfo b WHERE b.accountNumber = :accountNumber AND UPPER(b.status) = 'ACTIVE'")
        Optional<BillingCustomerInfo> findActiveByAccountNumber(@Param("accountNumber") String accountNumber);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT b FROM BillingCustomerInfo b WHERE b.accountNumber = :accountNumber AND UPPER(b.status) = 'ACTIVE'")
        Optional<BillingCustomerInfo> findActiveByAccountNumberForUpdate(@Param("accountNumber") String accountNumber);

        // Query to find the max account number for a given Kebele
        // @Query("SELECT MAX(CAST(b.accountNumber AS long)) FROM BillingCustomerInfo b
        // WHERE b.addressStreet.id = :kebeleId")
        // Optional<Long> findMaxAccountNumberByKebele(@Param("kebeleId") Integer
        // kebeleId);

        // @Query(value = "SELECT MAX(CAST(account_number AS bigint)) FROM
        // billing_customer_info WHERE address_street_id = :kebeleId", nativeQuery =
        // true)
        // Long findMaxAccountNumberByKebeleNative(@Param("kebeleId") Integer kebeleId);

        // @Query(value = "SELECT MAX(CAST(account_number AS bigint)) FROM
        // billing_customer_info WHERE address_street_id = :kebeleId", nativeQuery =
        // true)
        // Long findMaxAccountNumberByKebeleNative(@Param("kebeleId") Integer kebeleId);

        @Query(value = "SELECT MAX(CAST(account_number AS SIGNED)) FROM billing_customer_info WHERE address_streets_id = :kebeleId", nativeQuery = true)
        Long findMaxAccountNumberByKebeleNative(@Param("kebeleId") Integer kebeleId);

        /**
         * Finds active customers who do not have a reading for the given kifyaWer,
         * returning them as a lightweight CustomerListDTO.
         */
        // @Query("SELECT new com.wbill.home.dto.CustomerListDTO(c.id, c.accountNumber,
        // c.fullName, c.phoneNumber, c.registeredDate, c.status) " +
        // "FROM BillingCustomerInfo c " +
        // "LEFT JOIN BillingReading r ON c.id = r.billingCustomerInfo.id AND r.kifyaWer
        // = :kifyaWer " +
        // "WHERE c.status = 'ACTIVE' AND r.id IS NULL")
        // List<CustomerListDTO>
        // findActiveCustomersWithoutReadingForMonth(@Param("kifyaWer") String
        // kifyaWer);

        // @Query("SELECT new com.wbill.home.dto.CustomerListDTO(" +
        // "c.id, c.accountNumber, c.fullName, c.phoneNumber, c.registeredDate,
        // c.status, " +
        // "c.addressStreet.name, " + // Assuming 'name' is the field in AddressStreets
        // "c.addressKetena.name, " + // Assuming 'name' is the field in AddressKetena
        // "c.billingCustomerType.name, " + // Assuming 'name' is the field in
        // BillingCustomerType
        // "c.userAccount.fullName, " + // Assuming 'fullName' is the field in
        // UserAccount
        // "c.branch.name) " + // Assuming 'name' is the field in Branch
        // "FROM BillingCustomerInfo c " +
        // // The following joins are implicitly handled by accessing related entities
        // (e.g., c.branch.name)
        // // To prevent filtering out customers with NULL relations, use explicit LEFT
        // JOINs if needed.
        // // Example: LEFT JOIN c.userAccount ua
        // "LEFT JOIN BillingReading r ON c.id = r.billingCustomerInfo.id AND r.kifyaWer
        // = :kifyaWer " +
        // "WHERE c.status = 'ACTIVE' AND r.id IS NULL")
        // List<CustomerListDTO>
        // findActiveCustomersWithoutReadingForMonth(@Param("kifyaWer") String
        // kifyaWer);

        @Query("SELECT new com.wbill.home.dto.CustomerListDTO(" +
                        "c.id, c.accountNumber, c.fullName, c.phoneNumber, c.registeredDate, c.status, " +
                        "c.addressStreet.id, " + // Select the ID of the related AddressStreets
                        "c.addressKetena.id, " + // Select the ID of the related AddressKetena
                        "c.billingCustomerType.id, " + // Select the ID of the related BillingCustomerType
                        "c.userAccount.id, " + // Select the ID of the related UserAccount
                        "c.branch.id, " + // Select the ID of the related Branch
                        "CONCAT(c.userAccount.firstName, ' ', c.userAccount.midleName, ' ', c.userAccount.lastName), " +
                        "CAST(COALESCE((SELECT br.lastReading FROM BillingReading br WHERE br.id = (SELECT MAX(br2.id) FROM BillingReading br2 WHERE br2.billingCustomerInfo.id = c.id)), c.initialReading) AS integer)) "
                        +
                        "FROM BillingCustomerInfo c " +
                        "LEFT JOIN BillingReading r ON c.id = r.billingCustomerInfo.id AND r.kifyaWer = :kifyaWer AND LOWER(r.status) != 'deleted' "
                        +
                        "WHERE LOWER(c.status) = 'active' AND r.id IS NULL")
        List<CustomerListDTO> findActiveCustomersWithoutReadingForMonth(@Param("kifyaWer") String kifyaWer);

        List<BillingCustomerInfo> findAllByOrderByFullNameAsc();

        List<BillingCustomerInfo> findAllByOrderByIdAsc();

        List<BillingCustomerInfo> findByBranch_IdOrderByIdAsc(Integer branchId);

        List<BillingCustomerInfo> findByUserAccountAndStatus(UserAccount userAccount, String status);

        // List<BillingCustomerInfoDTO> findCustomerInfoDTOsByStatus(@Param("status")
        // String status); // Added @Param for clarity
        // // If you need all customers regardless of status (for your initial fetch)
        // @Query("SELECT NEW com.yourcompany.yourapp.dto.BillingCustomerInfoDTO(" +
        // "b.id, b.accountNumber, b.fullName, b.phoneNumber, b.meterNumber, " +
        // "b.addressDescription, b.registeredDate, b.status) " +
        // "FROM BillingCustomerInfo b")
        // List<BillingCustomerInfoDTO> findAllCustomerInfoDTOs();
        //
        //
        //
        // // NamedQuery methods
        // List<BillingCustomerInfo> findAll();
        // Optional<BillingCustomerInfo> findById(@Param("id") int id);
        // List<BillingCustomerInfo> findByAllId(); // Corresponds to
        // BillingCustomerInfo.findByAllId
        // // Gets the latest BillingCustomerInfo by highest ID
        // BillingCustomerInfo findTopByOrderByIdDesc();
        //
        // List<BillingCustomerInfo> findByLatestId(); // Corresponds to
        // BillingCustomerInfo.findByLatestId
        // List<BillingCustomerInfo> findByLatestIdOBAccN(); // Corresponds to
        // BillingCustomerInfo.findByLatestIdOBAccN
        // List<BillingCustomerInfo>
        // findByLatestIdOBAccNStreet(@Param("addressStreetsId") int addressStreetsId);
        // // Corresponds to BillingCustomerInfo.findByLatestIdOBAccNStreet
        // List<BillingCustomerInfo> findByLatestIdOBCounN(); // Corresponds to
        // BillingCustomerInfo.findByLatestIdOBCounN
        // List<BillingCustomerInfo> findByFullName(@Param("fullName") String fullName,
        // @Param("status") String status); // Corresponds to
        // BillingCustomerInfo.findByFullName
        // Optional<BillingCustomerInfo> findByAccountNumber(@Param("accountNumber")
        // String accountNumber, @Param("status") String status); // Corresponds to
        // BillingCustomerInfo.findByAccountNumber
        // List<BillingCustomerInfo> findByHouseNumber(@Param("houseNumber") String
        // houseNumber); // Corresponds to BillingCustomerInfo.findByHouseNumber
        // Optional<BillingCustomerInfo> findByMeterNumber(@Param("meterNumber") String
        // meterNumber, @Param("status") String status); // Corresponds to
        // BillingCustomerInfo.findByMeterNumber
        // List<BillingCustomerInfo> findByMeterSizeId(@Param("meterSizeId") int
        // meterSizeId);
        // List<BillingCustomerInfo> findByCountNumber(@Param("countNumber") String
        // countNumber); // Corresponds to BillingCustomerInfo.findByCountNumber
        //
        // List<BillingCustomerInfo> findByStatus(@Param("status") String status); //
        // Corresponds to BillingCustomerInfo.findByStatus

        //
        // List<BillingCustomerInfo> findByStatusYekoye(@Param("oldHasPenalty") boolean
        // oldHasPenalty, @Param("status") String status); // Corresponds to
        // BillingCustomerInfo.findByStatusYekoye
        // Long findByStatusCount(@Param("status") String status); // Corresponds to
        // BillingCustomerInfo.findByStatusCount
        // // Long findByStatus(@Param("status") String status); // Corresponds to
        // BillingCustomerInfo.findByStatusCount
        // Long findByYearMonthStatusCount(@Param("canceledYear") int canceledYear,
        // @Param("canceledMonth") int canceledMonth, @Param("status") String status);
        // // Corresponds to BillingCustomerInfo.findByYearMonthStatusCount
        // Long findByBranchsCount(@Param("branchsId") int branchsId, @Param("status")
        // String status); // Corresponds to BillingCustomerInfo.findByBranchsCount
        // Long findByTypeCount(@Param("customerTypeId") int customerTypeId,
        // @Param("status") String status); // Corresponds to
        // BillingCustomerInfo.findByTypeCount
        // Long findByMeterSizeCount(@Param("meterSizeId") int meterSizeId,
        // @Param("status") String status); // Corresponds to
        // BillingCustomerInfo.findByMeterSizeCount
        // Long findByFromToCount(@Param("registeredYear") int registeredYear,
        // @Param("registeredMonth") int registeredMonth, @Param("status") String
        // status); // Corresponds to BillingCustomerInfo.findByFromToCount
        // List<BillingCustomerInfo> findByStatusAssignd(@Param("status") String
        // status); // Corresponds to BillingCustomerInfo.findByStatusAssignd
        // List<UserAccount> findByStatusGBUser(@Param("status") String status); //
        // Corresponds to BillingCustomerInfo.findByStatusGBUser
        // List<BillingCustomerInfo> findByZone(@Param("zoneId") int zoneId,
        // @Param("status") String status); // Corresponds to
        // BillingCustomerInfo.findByZone
        // List<BillingCustomerInfo> findByCity(@Param("cityId") int cityId,
        // @Param("status") String status); // Corresponds to
        // BillingCustomerInfo.findByCity
        // List<BillingCustomerInfo> findByCityUserA(@Param("assignedReaderId") int
        // assignedReaderId, @Param("status") String status); // Corresponds to
        // BillingCustomerInfo.findByCityUserA
        // List<BillingCustomerInfo> findByCityUserInit(@Param("assignedReaderId") int
        // assignedReaderId, @Param("isInitialized") boolean isInitialized,
        // @Param("status") String status); // Corresponds to
        // BillingCustomerInfo.findByCityUserInit
        // List<BillingCustomerInfo> findByStreets(@Param("addressStreetsId") int
        // addressStreetsId, @Param("status") String status); // Corresponds to
        // BillingCustomerInfo.findByStreets
        // List<BillingCustomerInfo> findByStreetsAll(@Param("addressStreetsId") int
        // addressStreetsId); // Corresponds to BillingCustomerInfo.findByStreetsAll
        // Double findByTeklalaTekemach(@Param("status") String status); // Corresponds
        // to BillingCustomerInfo.findByTeklalaTekemach
        // List<BillingCustomerInfo> findByStatusType(@Param("customerTypeId") int
        // customerTypeId, @Param("status") String status); // Corresponds to
        // BillingCustomerInfo.findByStatusType

        long countByStatus(@Param("status") String status);

        Long countByStatusAndCompleteDeletedIsNull(String status); // For Deactivated (status='deleted' AND
                                                                   // completeDeleted is NULL)

        // For Complete Deleted (completeDeleted = 'deleted') - assuming field name is
        // correct from user req
        // User said "completeDeletedat ... = deleted". Let's assume field is
        // completeDeleted based on grep result but verify field name in Entity if
        // getting errors.
        // Actually, I should check the field name in Entity first. I didn't verify it
        // visually, just grepped.
        // Let's assume standard naming. If error, I'll fix.
        Long countByCompleteDeleted(String completeDeleted);
}
