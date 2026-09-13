package com.wbill.home.repository;

import com.wbill.home.model.InvItemCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InvItemCategoryRepository extends JpaRepository<InvItemCategory, Integer> {
    List<InvItemCategory> findByDeletedAndIsActiveOrderByCategoryCodeAsc(String deleted, boolean isActive);
    List<InvItemCategory> findByDeletedOrderByCategoryCodeAsc(String deleted);
    Page<InvItemCategory> findByDeleted(String deleted, Pageable pageable);
    Optional<InvItemCategory> findByCategoryCode(String categoryCode);
    boolean existsByCategoryCode(String categoryCode);
}
