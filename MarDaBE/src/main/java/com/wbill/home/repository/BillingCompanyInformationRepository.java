package com.wbill.home.repository;

import com.wbill.home.model.BillingCompanyInformation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingCompanyInformationRepository extends JpaRepository<BillingCompanyInformation, Integer> {
    // Assuming you want the latest. Adjust query if 'latest' is determined differently.
    @Query("SELECT bci FROM BillingCompanyInformation bci ORDER BY bci.id DESC")
    List<BillingCompanyInformation> findTopByOrderByIdDesc();

    @Query("SELECT bci FROM BillingCompanyInformation bci WHERE bci.status = :status ORDER BY bci.id DESC")
    Page<BillingCompanyInformation> findByStatusWithPagination(@Param("status") String status, Pageable pageable);

    @Query("SELECT COUNT(bci) FROM BillingCompanyInformation bci WHERE bci.status = 'active'")
    long countActive();

    @Query("SELECT COUNT(bci) FROM BillingCompanyInformation bci WHERE bci.status = 'deleted'")
    long countDeleted();
}