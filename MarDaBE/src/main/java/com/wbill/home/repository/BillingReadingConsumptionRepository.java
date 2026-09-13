package com.wbill.home.repository;


import com.wbill.home.model.BillingReadingConsumption;
import com.wbill.home.model.BillingReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillingReadingConsumptionRepository extends JpaRepository<BillingReadingConsumption, Integer> {

    /**
     * Finds all BillingReadingConsumption records for a given BillingReading.
     * This is useful for retrieving the detailed consumption breakdown for a specific bill.
     * The results are ordered by block name to maintain a logical sequence.
     * * @param billingReading The BillingReading entity.
     * @return A list of BillingReadingConsumption records.
     */
    List<BillingReadingConsumption> findByBillingReadingOrderByBlockName(BillingReading billingReading);

    /**
     * Finds all BillingReadingConsumption records for a given BillingReading.
     * This is useful for retrieving the detailed consumption breakdown for a specific bill.
     * The results are ordered by ID to maintain insertion order.
     * @param billingReading The BillingReading entity.
     * @return A list of BillingReadingConsumption records ordered by ID.
     */
    List<BillingReadingConsumption> findByBillingReadingOrderById(BillingReading billingReading);

    /**
     * Deletes all BillingReadingConsumption records associated with a specific BillingReading.
     * This is useful for scenarios where a bill needs to be voided or recalculated, ensuring
     * historical consumption details are removed or replaced.
     *
     * @param billingReading The BillingReading entity.
     */
    void deleteAllByBillingReading(BillingReading billingReading);

    /**
     * Finds all BillingReadingConsumption records that are marked as a specific status.
     * This can be used for reporting or administrative purposes to find, for example, 
     * all "active" or "voided" consumption details.
     *
     * @param status The status to search for (e.g., "active", "voided").
     * @return A list of BillingReadingConsumption records with the given status.
     */
    List<BillingReadingConsumption> findByStatus(String status);
}