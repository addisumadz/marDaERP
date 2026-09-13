package com.wbill.home.repository;

import com.wbill.home.model.FncGeneralLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface FncGeneralLedgerRepository extends JpaRepository<FncGeneralLedger, Long> {

    List<FncGeneralLedger> findByFiscalYearIdOrderByAccountAccountCodeAsc(int fiscalYearId);

    List<FncGeneralLedger> findByAccountIdAndFiscalYearIdOrderByPeriodMonthAsc(int accountId, int fiscalYearId);

    Optional<FncGeneralLedger> findByAccountIdAndFiscalYearIdAndPeriodMonth(int accountId, int fiscalYearId, int periodMonth);

    @Query("SELECT gl FROM FncGeneralLedger gl JOIN FETCH gl.account " +
           "WHERE gl.fiscalYear.id = :fyId ORDER BY gl.account.accountCode, gl.periodMonth")
    List<FncGeneralLedger> findByFiscalYearWithAccount(@Param("fyId") int fiscalYearId);
}
