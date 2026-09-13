package com.wbill.home.repository;

import com.wbill.home.model.InvStoreUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvStoreUserRepository extends JpaRepository<InvStoreUser, Integer> {

    List<InvStoreUser> findByStoreId(int storeId);

    List<InvStoreUser> findByUserAccountId(int userAccountId);

    List<InvStoreUser> findByStoreIdAndIsActiveTrue(int storeId);

    List<InvStoreUser> findByUserAccountIdAndIsActiveTrue(int userAccountId);

    Optional<InvStoreUser> findByStoreIdAndUserAccountId(int storeId, int userAccountId);

    boolean existsByStoreIdAndUserAccountId(int storeId, int userAccountId);

    @Query("SELECT su FROM InvStoreUser su ORDER BY su.store.storeName ASC, su.userAccount.firstName ASC")
    List<InvStoreUser> findAllOrdered();

    @Query("SELECT su FROM InvStoreUser su WHERE su.userAccount.userName = :username AND su.isActive = true")
    List<InvStoreUser> findActiveStoresByUsername(@Param("username") String username);
}
