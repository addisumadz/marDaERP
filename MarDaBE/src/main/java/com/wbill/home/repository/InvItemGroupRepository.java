package com.wbill.home.repository;

import com.wbill.home.model.InvItemGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InvItemGroupRepository extends JpaRepository<InvItemGroup, Integer> {
    List<InvItemGroup> findByCategoryIdAndDeletedAndIsActiveOrderByGroupCodeAsc(int categoryId, String deleted, boolean isActive);
    List<InvItemGroup> findByDeletedAndIsActiveOrderByGroupCodeAsc(String deleted, boolean isActive);
    Page<InvItemGroup> findByDeleted(String deleted, Pageable pageable);
    Page<InvItemGroup> findByCategoryIdAndDeleted(int categoryId, String deleted, Pageable pageable);
    Optional<InvItemGroup> findByGroupCode(String groupCode);
    boolean existsByGroupCode(String groupCode);
}
