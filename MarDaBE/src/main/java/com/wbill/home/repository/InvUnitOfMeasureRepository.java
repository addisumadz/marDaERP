package com.wbill.home.repository;

import com.wbill.home.model.InvUnitOfMeasure;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InvUnitOfMeasureRepository extends JpaRepository<InvUnitOfMeasure, Integer> {
    List<InvUnitOfMeasure> findByDeletedAndIsActiveOrderByUnitCodeAsc(String deleted, boolean isActive);
    List<InvUnitOfMeasure> findByDeletedOrderByUnitCodeAsc(String deleted);
    Page<InvUnitOfMeasure> findByDeleted(String deleted, Pageable pageable);
    Optional<InvUnitOfMeasure> findByUnitCode(String unitCode);
    boolean existsByUnitCode(String unitCode);
}
