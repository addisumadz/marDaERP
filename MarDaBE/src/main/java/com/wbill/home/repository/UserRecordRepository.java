package com.wbill.home.repository;

import com.wbill.home.model.UserRecord;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRecordRepository extends JpaRepository<UserRecord, Integer> {

    Optional<UserRecord> findFirstByUserRole_RoleCodeIgnoreCaseAndPageCodeIgnoreCaseAndDeletedIgnoreCase(
            String roleCode,
            String pageCode,
            String deleted
    );

    List<UserRecord> findByUserRole_IdAndDeletedIgnoreCase(Integer roleId, String deleted);

    // Dynamic menu mapping: get all page codes accessible by any of the given role codes
    @Query("SELECT DISTINCT ur.pageCode FROM UserRecord ur WHERE ur.userRole.roleCode IN :roleCodes AND ur.deleted = 'active'")
    List<String> findPageCodesByRoleCodes(@Param("roleCodes") List<String> roleCodes);

    // Get full permission records for a set of role codes
    @Query("SELECT ur FROM UserRecord ur WHERE ur.userRole.roleCode IN :roleCodes AND ur.deleted = 'active'")
    List<UserRecord> findByRoleCodes(@Param("roleCodes") List<String> roleCodes);
}
