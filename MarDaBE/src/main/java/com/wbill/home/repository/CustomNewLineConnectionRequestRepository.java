package com.wbill.home.repository;

import com.wbill.home.model.CustomNewLineConnectionRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomNewLineConnectionRequestRepository extends JpaRepository<CustomNewLineConnectionRequest, Long> {

    Optional<CustomNewLineConnectionRequest> findByApplicationNumber(String applicationNumber);

    List<CustomNewLineConnectionRequest> findByStatus(String status);

    @Query("SELECT r FROM CustomNewLineConnectionRequest r WHERE " +
           "(:status IS NULL OR r.status = :status OR (:status = 'REJECTED_OR_CANCELLED' AND (r.status = 'SURVEY_REJECTED_UNFEASIBLE' OR r.status = 'APPLICATION_CANCELLED' OR r.status = 'RETURNED_FOR_REVISION'))) AND " +
           "(:branchId IS NULL OR r.branch.id = :branchId) AND " +
           "(:searchTerm IS NULL OR " +
           "LOWER(r.applicationNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.customerFullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.customerFullNameEng) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "r.phoneNumber LIKE CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY r.createdAt DESC")
    Page<CustomNewLineConnectionRequest> findFiltered(
        @Param("status") String status,
        @Param("branchId") Integer branchId,
        @Param("searchTerm") String searchTerm,
        Pageable pageable
    );

    @Query("SELECT COUNT(r) FROM CustomNewLineConnectionRequest r WHERE r.status = :status")
    long countByStatus(@Param("status") String status);

    @Query("SELECT COUNT(r) FROM CustomNewLineConnectionRequest r WHERE r.status = :status AND (:branchId IS NULL OR r.branch.id = :branchId)")
    long countByStatusAndBranch(@Param("status") String status, @Param("branchId") Integer branchId);

    @Query("SELECT COUNT(r) FROM CustomNewLineConnectionRequest r WHERE r.applicationNumber LIKE CONCAT(:prefix, '%')")
    long countByApplicationNumberPrefix(@Param("prefix") String prefix);
}
