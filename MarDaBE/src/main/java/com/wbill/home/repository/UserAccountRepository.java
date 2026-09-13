package com.wbill.home.repository;

import com.wbill.home.model.UserAccount;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Integer> {
    
    // Find by username
    Optional<UserAccount> findByUserName(String username);

    // For authentication: active and not deleted
    Optional<UserAccount> findByUserNameAndStatusAndDeleted(String userName, String status, String deleted);

    // List by status (non-paginated)
    List<UserAccount> findByStatus(String status);

    // Pagination by deleted flag (to mirror other modules)
    @Query("SELECT u FROM UserAccount u WHERE u.deleted = :status ORDER BY u.id DESC")
    Page<UserAccount> findByDeletedWithPagination(@Param("status") String status, Pageable pageable);

    // Count helpers
    @Query("SELECT COUNT(u) FROM UserAccount u WHERE u.deleted = 'active'")
    long countActive();

    @Query("SELECT COUNT(u) FROM UserAccount u WHERE u.deleted = 'deleted'")
    long countDeleted();

    // Uniqueness checks
    boolean existsByUserName(String userName);
    boolean existsByUserNameAndIdNot(String userName, Integer id);

    // Branch scoped active users
    @Query("SELECT u FROM UserAccount u WHERE u.branch.id = :branchId AND u.status = 'active' AND u.deleted = 'active'")
    List<UserAccount> findActiveByBranchId(@Param("branchId") Integer branchId);

    // Backward-compatible alias used by DropdownService - now restricted to meter readers (roleCode = 'mobileanbabi')
    @Query("SELECT u FROM UserAccount u WHERE u.branch.id = :branchId AND u.status = 'active' AND u.deleted = 'active' AND LOWER(u.userRole.roleCode) = 'mobileanbabi'")
    List<UserAccount> findActiveReadersByBranchId(@Param("branchId") Integer branchId);

    // Active meter readers by roleCode (case-insensitive)
    @Query("SELECT u FROM UserAccount u WHERE u.status = 'active' AND u.deleted = 'active' AND LOWER(u.userRole.roleCode) = 'mobileanbabi'")
    List<UserAccount> findActiveMeterReaders();

    // Active meter readers by roleCode and branch
    @Query("SELECT u FROM UserAccount u WHERE u.branch.id = :branchId AND u.status = 'active' AND u.deleted = 'active' AND LOWER(u.userRole.roleCode) = 'mobileanbabi'")
    List<UserAccount> findActiveMeterReadersByBranch(@Param("branchId") Integer branchId);

    // Active cashier users by role_id = 49
    @Query("SELECT u FROM UserAccount u WHERE u.userRole.id = 49 AND u.status = 'active' AND u.deleted = 'active'")
    List<UserAccount> findActiveCashierUsers();
}
