package com.wbill.home.repository;

import com.wbill.home.model.FncAccount;
import com.wbill.home.model.FncAccount.AccountType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface FncAccountRepository extends JpaRepository<FncAccount, Integer> {

    Optional<FncAccount> findByAccountCode(String accountCode);

    List<FncAccount> findByAccountType(AccountType accountType);

    List<FncAccount> findByIsActiveAndIsHeader(boolean isActive, boolean isHeader);

    List<FncAccount> findByIsActive(boolean isActive);

    List<FncAccount> findByParentAccountIsNullAndIsActiveOrderByAccountCodeAsc(boolean isActive);

    List<FncAccount> findByParentAccountIdAndIsActiveOrderByAccountCodeAsc(int parentId, boolean isActive);

    @Query("SELECT a FROM FncAccount a WHERE a.isActive = true AND a.isHeader = false ORDER BY a.accountCode")
    List<FncAccount> findPostableAccounts();

    @Query("SELECT a FROM FncAccount a WHERE a.isActive = :active ORDER BY a.accountCode")
    Page<FncAccount> findByIsActive(@Param("active") boolean active, Pageable pageable);

    @Query("SELECT a FROM FncAccount a WHERE a.isActive = true AND " +
           "(LOWER(a.accountCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.accountName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "a.accountNameAm LIKE CONCAT('%', :search, '%')) ORDER BY a.accountCode")
    List<FncAccount> searchAccounts(@Param("search") String search);

    List<FncAccount> findAllByOrderByAccountCodeAsc();

    boolean existsByAccountCode(String accountCode);
}
