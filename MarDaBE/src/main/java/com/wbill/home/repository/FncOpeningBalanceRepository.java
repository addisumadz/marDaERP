package com.wbill.home.repository;

import com.wbill.home.model.FncOpeningBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface FncOpeningBalanceRepository extends JpaRepository<FncOpeningBalance, Integer> {

    List<FncOpeningBalance> findByFiscalYearId(int fiscalYearId);

    Optional<FncOpeningBalance> findByAccountIdAndFiscalYearId(int accountId, int fiscalYearId);

    @Query("SELECT ob FROM FncOpeningBalance ob JOIN FETCH ob.account " +
           "WHERE ob.fiscalYear.id = :fyId ORDER BY ob.account.accountCode")
    List<FncOpeningBalance> findByFiscalYearWithAccount(@Param("fyId") int fiscalYearId);
}
