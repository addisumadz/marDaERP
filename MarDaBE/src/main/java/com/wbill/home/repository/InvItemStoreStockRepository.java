package com.wbill.home.repository;

import com.wbill.home.model.InvItemStoreStock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface InvItemStoreStockRepository extends JpaRepository<InvItemStoreStock, Long> {
    Optional<InvItemStoreStock> findByItemIdAndStoreId(long itemId, int storeId);
    List<InvItemStoreStock> findByStoreId(int storeId);
    List<InvItemStoreStock> findByItemId(long itemId);
    Page<InvItemStoreStock> findByStoreId(int storeId, Pageable pageable);

    @Query("SELECT s FROM InvItemStoreStock s WHERE s.store.id = :storeId AND s.quantityOnHand <= s.item.reorderLevel AND s.item.deleted = 'No'")
    List<InvItemStoreStock> findLowStockByStore(int storeId);

    @Query("SELECT s FROM InvItemStoreStock s WHERE s.quantityOnHand <= s.item.reorderLevel AND s.item.deleted = 'No'")
    List<InvItemStoreStock> findAllLowStock();

    @Query("SELECT COALESCE(SUM(s.quantityOnHand * s.weightedAvgCost), 0) FROM InvItemStoreStock s WHERE s.store.id = :storeId")
    java.math.BigDecimal getTotalStockValueByStore(int storeId);

    @Query("SELECT COALESCE(SUM(s.quantityOnHand * s.weightedAvgCost), 0) FROM InvItemStoreStock s")
    java.math.BigDecimal getTotalStockValue();
}
