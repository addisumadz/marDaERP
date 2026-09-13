package com.wbill.home.repository;

import com.wbill.home.model.FncBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface FncBudgetRepository extends JpaRepository<FncBudget, Integer> {

    List<FncBudget> findAllByOrderByCreatedAtDesc();

    List<FncBudget> findByFiscalYearIdOrderByCreatedAtDesc(int fiscalYearId);

    @Query("SELECT b FROM FncBudget b WHERE b.fiscalYear.id = :fyId AND b.status = 'APPROVED'")
    Optional<FncBudget> findApprovedByFiscalYear(@Param("fyId") int fiscalYearId);

    @Query("SELECT b FROM FncBudget b LEFT JOIN FETCH b.lines l LEFT JOIN FETCH l.account WHERE b.id = :id")
    Optional<FncBudget> findByIdWithLines(@Param("id") int id);
}
