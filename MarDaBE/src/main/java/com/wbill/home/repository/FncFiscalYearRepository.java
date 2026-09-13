package com.wbill.home.repository;

import com.wbill.home.model.FncFiscalYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FncFiscalYearRepository extends JpaRepository<FncFiscalYear, Integer> {

    List<FncFiscalYear> findAllByOrderByStartDateDesc();

    List<FncFiscalYear> findByIsClosed(boolean isClosed);

    @Query("SELECT fy FROM FncFiscalYear fy WHERE fy.startDate <= :date AND fy.endDate >= :date")
    Optional<FncFiscalYear> findByDate(@Param("date") LocalDate date);

    @Query("SELECT fy FROM FncFiscalYear fy WHERE fy.isClosed = false ORDER BY fy.startDate DESC")
    List<FncFiscalYear> findOpenFiscalYears();

    @Query("SELECT fy FROM FncFiscalYear fy WHERE " +
           "(fy.startDate <= :endDate AND fy.endDate >= :startDate) AND fy.id != :excludeId")
    List<FncFiscalYear> findOverlapping(@Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate,
                                         @Param("excludeId") int excludeId);
}
