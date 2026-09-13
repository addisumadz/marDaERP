package com.wbill.home.repository;

import com.wbill.home.model.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Integer> {

    @Query("SELECT ur FROM UserRole ur WHERE ur.deleted = 'active' ORDER BY ur.roleName ASC")
    List<UserRole> findAllActive();

    @Query("SELECT ur FROM UserRole ur WHERE ur.deleted = :status ORDER BY ur.id DESC")
    Page<UserRole> findByDeletedWithPagination(@Param("status") String status, Pageable pageable);

    boolean existsByRoleCodeAndIdNot(String roleCode, Integer id);
    boolean existsByRoleCode(String roleCode);

    @Query("SELECT COUNT(ur) FROM UserRole ur WHERE ur.deleted = 'active'")
    long countActive();

    @Query("SELECT COUNT(ur) FROM UserRole ur WHERE ur.deleted = 'deleted'")
    long countDeleted();
}
