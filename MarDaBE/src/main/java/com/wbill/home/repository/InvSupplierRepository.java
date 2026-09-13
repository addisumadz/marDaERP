package com.wbill.home.repository;

import com.wbill.home.model.InvSupplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface InvSupplierRepository extends JpaRepository<InvSupplier, Integer> {
    List<InvSupplier> findByDeletedAndIsActiveOrderBySupplierNameAsc(String deleted, boolean isActive);
    Page<InvSupplier> findByDeleted(String deleted, Pageable pageable);
    Optional<InvSupplier> findBySupplierCode(String supplierCode);
    boolean existsBySupplierCode(String supplierCode);

    @Query("SELECT s FROM InvSupplier s WHERE s.deleted = 'No' AND s.isActive = true AND " +
           "(LOWER(s.supplierName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.supplierCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.tin) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<InvSupplier> searchSuppliers(String search, Pageable pageable);
}
