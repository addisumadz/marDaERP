package com.wbill.home.repository;

import com.wbill.home.model.CustomMaintenanceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomMaintenanceRequestRepository extends JpaRepository<CustomMaintenanceRequest, Long> {

    Optional<CustomMaintenanceRequest> findByRequestNumber(String requestNumber);

    List<CustomMaintenanceRequest> findByCustomerId(Integer customerId);

    List<CustomMaintenanceRequest> findByStatus(String status);

    @Query("SELECT r FROM CustomMaintenanceRequest r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:branchId IS NULL OR r.branch.id = :branchId) AND " +
           "(:maintenanceTypeId IS NULL OR (r.maintenanceType IS NOT NULL AND r.maintenanceType.id = :maintenanceTypeId)) AND " +
           "(:searchTerm IS NULL OR " +
           "LOWER(r.requestNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.customerFullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.accountNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.meterNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "r.phoneNumber LIKE CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY r.createdAt DESC")
    Page<CustomMaintenanceRequest> findFiltered(
        @Param("status") String status,
        @Param("branchId") Integer branchId,
        @Param("maintenanceTypeId") Long maintenanceTypeId,
        @Param("searchTerm") String searchTerm,
        Pageable pageable
    );

    @Query("SELECT COUNT(r) FROM CustomMaintenanceRequest r WHERE r.status = :status")
    long countByStatus(@Param("status") String status);

    @Query("SELECT COUNT(r) FROM CustomMaintenanceRequest r WHERE r.status = :status AND (:branchId IS NULL OR r.branch.id = :branchId)")
    long countByStatusAndBranch(@Param("status") String status, @Param("branchId") Integer branchId);

    @Query("SELECT COUNT(r) FROM CustomMaintenanceRequest r WHERE r.requestNumber LIKE CONCAT(:prefix, '%')")
    long countByRequestNumberPrefix(@Param("prefix") String prefix);
}
