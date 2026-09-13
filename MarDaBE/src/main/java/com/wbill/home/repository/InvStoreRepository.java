package com.wbill.home.repository;

import com.wbill.home.model.InvStore;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InvStoreRepository extends JpaRepository<InvStore, Integer> {
    List<InvStore> findByDeletedAndIsActiveOrderByStoreCodeAsc(String deleted, boolean isActive);
    Page<InvStore> findByDeleted(String deleted, Pageable pageable);
    Optional<InvStore> findByStoreCode(String storeCode);
    Optional<InvStore> findByBranchId(int branchId);
    Optional<InvStore> findByIsMainStoreTrue();
    boolean existsByStoreCode(String storeCode);
    List<InvStore> findByDeletedOrderByStoreCodeAsc(String deleted);
}
