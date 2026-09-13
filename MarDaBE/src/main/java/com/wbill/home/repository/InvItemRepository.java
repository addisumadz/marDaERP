package com.wbill.home.repository;

import com.wbill.home.model.InvItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface InvItemRepository extends JpaRepository<InvItem, Long> {
    List<InvItem> findByDeletedAndIsActiveOrderByItemCodeAsc(String deleted, boolean isActive);
    Page<InvItem> findByDeleted(String deleted, Pageable pageable);
    Page<InvItem> findByCategoryIdAndDeleted(int categoryId, String deleted, Pageable pageable);
    Page<InvItem> findByItemGroupIdAndDeleted(int itemGroupId, String deleted, Pageable pageable);
    Optional<InvItem> findByItemCode(String itemCode);
    boolean existsByItemCode(String itemCode);

    @Query("SELECT s FROM InvItem s WHERE s.deleted = 'No' AND s.isActive = true AND " +
           "(LOWER(s.itemName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.itemCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.itemNameAm) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<InvItem> searchItems(String search, Pageable pageable);

    // For auto-numbering: get the max item code with a given prefix
    @Query("SELECT MAX(i.itemCode) FROM InvItem i WHERE i.itemCode LIKE CONCAT(:prefix, '%')")
    String findMaxItemCodeByPrefix(String prefix);

    // Low stock items
    @Query("SELECT i FROM InvItem i JOIN InvItemStoreStock s ON s.item = i " +
           "WHERE i.deleted = 'No' AND i.isActive = true AND s.quantityOnHand <= i.reorderLevel")
    List<InvItem> findLowStockItems();
}
