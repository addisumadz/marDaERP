package com.wbill.home.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wbill.home.model.BillingCustomerType;
import com.wbill.home.model.BillingTariff;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface BillingTariffRepository extends JpaRepository<BillingTariff, Integer> {
        // Fetch tariff rules for a customer type, ordered correctly
        List<BillingTariff> findByBillingCustomerTypeAndStatusOrderByConsumptionAsc(
                        BillingCustomerType customerType, String status);

        List<BillingTariff> findByBillingCustomerTypeAndStatus(
                        BillingCustomerType customerType, String status);

        // List all tariffs ordered by consumption (for frontend filtering)
        @Query("SELECT t FROM BillingTariff t ORDER BY t.consumption ASC")
        List<BillingTariff> findAllTariffs();

        // List active tariffs ordered by consumption
        @Query("SELECT t FROM BillingTariff t WHERE t.status = 'active' ORDER BY t.consumption ASC")
        List<BillingTariff> findAllActive();

        // Pagination by status
        @Query("SELECT t FROM BillingTariff t WHERE t.status = :status ORDER BY t.consumption ASC")
        Page<BillingTariff> findByStatusWithPagination(@Param("status") String status, Pageable pageable);

        // Existence checks (e.g., avoid duplicate blockName within a customer type)
        boolean existsByBillingCustomerTypeIdAndBlockName(Integer customerTypeId, String blockName);

        boolean existsByBillingCustomerTypeIdAndBlockNameAndIdNot(Integer customerTypeId, String blockName, Integer id);

        // Status-aware existence checks (only check among active tariffs)
        boolean existsByBillingCustomerTypeIdAndBlockNameAndStatus(Integer customerTypeId, String blockName,
                        String status);

        boolean existsByBillingCustomerTypeIdAndBlockNameAndIdNotAndStatus(Integer customerTypeId, String blockName,
                        Integer id, String status);

        // Statistics
        @Query("SELECT COUNT(t) FROM BillingTariff t WHERE t.status = 'active'")
        long countActive();

        @Query("SELECT COUNT(t) FROM BillingTariff t WHERE t.status = 'deleted'")
        long countDeleted();
}