package com.wbill.home.repository;

import com.wbill.home.model.UserAccountRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface UserAccountRoleRepository extends JpaRepository<UserAccountRole, Integer> {

    List<UserAccountRole> findByUserAccountIdAndIsActiveTrue(int userAccountId);

    List<UserAccountRole> findByUserRoleRoleCodeAndIsActiveTrue(String roleCode);

    @Query("SELECT uar FROM UserAccountRole uar WHERE uar.userAccount.id = :userId AND uar.userRole.roleCode = :roleCode AND uar.isActive = true")
    List<UserAccountRole> findByUserAndRole(@Param("userId") int userId, @Param("roleCode") String roleCode);

    @Query("SELECT DISTINCT uar.userRole.roleCode FROM UserAccountRole uar WHERE uar.userAccount.userName = :username AND uar.isActive = true")
    List<String> findRoleCodesByUsername(@Param("username") String username);

    @Query("SELECT uar FROM UserAccountRole uar JOIN FETCH uar.userAccount JOIN FETCH uar.userRole WHERE uar.isActive = true ORDER BY uar.userAccount.userName")
    List<UserAccountRole> findAllActiveWithDetails();

    boolean existsByUserAccountIdAndUserRoleIdAndBranchIdAndIsActiveTrue(int userAccountId, int userRoleId, Integer branchId);
}
