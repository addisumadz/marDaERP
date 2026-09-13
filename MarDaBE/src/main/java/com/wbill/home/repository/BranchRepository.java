package com.wbill.home.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.wbill.home.model.AddressStreets;
import com.wbill.home.model.Branch;

import java.util.List;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Integer> {
    
	@Query("SELECT b FROM Branch b WHERE b.deleted = 'active' ORDER BY b.branchDescription ASC")
    List<Branch> findAllActive();
    Branch findByBranchCode(String branchCode);
    
    List<Branch> findByBranchDescriptionContainingIgnoreCase(String description);
    
    @Query("SELECT b FROM Branch b WHERE LOWER(b.branchDescription) = LOWER(:description) AND b.deleted = 'active'")
    List<Branch> findByExactBranchDescription(@Param("description") String description);

    
    List<Branch> findByBranchKebele(AddressStreets addressStreets);
    
    List<Branch> findByOfficeLevel(String officeLevel);
    
    List<Branch> findByDeleted(String deleted);

    @Query("SELECT b FROM Branch b WHERE b.deleted = :status ORDER BY b.id DESC")
    Page<Branch> findByDeletedWithPagination(@Param("status") String status, Pageable pageable);

    @Query("SELECT COUNT(b) FROM Branch b WHERE b.deleted = 'active'")
    long countActive();

    @Query("SELECT COUNT(b) FROM Branch b WHERE b.deleted = 'deleted'")
    long countDeleted();
}