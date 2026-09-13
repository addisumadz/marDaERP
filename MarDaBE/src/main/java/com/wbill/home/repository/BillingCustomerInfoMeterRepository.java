package com.wbill.home.repository;

import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.BillingCustomerInfoMeter;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BillingCustomerInfoMeterRepository extends JpaRepository<BillingCustomerInfoMeter, Integer> {
    List<BillingCustomerInfoMeter> findByBillingCustomerInfo_Id(Integer customerId);

    // Finds all active meters for a customer except for the one with the given
    // meter ID.
    @Query("SELECT m FROM BillingCustomerInfoMeter m WHERE m.billingCustomerInfo.id = :customerId AND m.id != :meterIdToKeepActive AND m.activeMeter = true")
    List<BillingCustomerInfoMeter> findOtherActiveMeters(@Param("customerId") Integer customerId,
            @Param("meterIdToKeepActive") Integer meterIdToKeepActive);

    /**
     * Finds the most recently registered, active, and not-deleted meter for a given
     * customer.
     * This is typically used to get the initial reading of the current meter in
     * use.
     *
     * @param customer      The customer entity to search for.
     * @param deletedStatus The string representing the "not deleted" status (e.g.,
     *                      "active").
     * @return An Optional containing the most recent active meter, or an empty
     *         Optional if none is found.
     */
    Optional<BillingCustomerInfoMeter> findFirstByBillingCustomerInfoAndActiveMeterIsTrueAndDeletedOrderByRegisteredDateDesc(
            BillingCustomerInfo customer,
            String deletedStatus);

    // Find active meters for a customer
    List<BillingCustomerInfoMeter> findByBillingCustomerInfoAndActiveMeterTrue(BillingCustomerInfo customer);

}
