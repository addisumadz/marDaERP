package com.wbill.home.repository;

import com.wbill.home.model.InvStockTransaction;
import com.wbill.home.model.InvStockTransaction.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface InvStockTransactionRepository extends JpaRepository<InvStockTransaction, Long> {
    Page<InvStockTransaction> findByItemIdOrderByCreatedAtDesc(long itemId, Pageable pageable);
    Page<InvStockTransaction> findByStoreIdOrderByCreatedAtDesc(int storeId, Pageable pageable);
    Page<InvStockTransaction> findByItemIdAndStoreIdOrderByCreatedAtDesc(long itemId, int storeId, Pageable pageable);
    Page<InvStockTransaction> findByTransactionTypeOrderByCreatedAtDesc(TransactionType type, Pageable pageable);

    List<InvStockTransaction> findByItemIdAndStoreIdAndTransactionDateBetweenOrderByCreatedAtAsc(
            long itemId, int storeId, LocalDate from, LocalDate to);

    // Stock card: all transactions for an item in a store
    @Query("SELECT t FROM InvStockTransaction t WHERE t.item.id = :itemId AND t.store.id = :storeId " +
           "ORDER BY t.transactionDate ASC, t.createdAt ASC")
    List<InvStockTransaction> getStockCard(long itemId, int storeId);

    @Query("SELECT MAX(CAST(SUBSTRING(t.transactionNumber, 10) AS long)) FROM InvStockTransaction t WHERE t.transactionNumber LIKE CONCAT(:prefix, '%')")
    Long findMaxTransactionSequence(String prefix);

    boolean existsByTransactionNumber(String transactionNumber);
}
