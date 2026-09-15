package com.wbill.home.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.BillingReading;
import com.wbill.home.model.BillingReadingWuzif;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingReadingWuzifRepository extends JpaRepository<BillingReadingWuzif, Integer> {
	// Finds all unpaid wuzif records for a customer, ordered by the billing period
	// @Query("SELECT w FROM BillingReadingWuzif w WHERE
	// w.billingReadingActualPayment.billingCustomerInfo = ?1 AND w.isMoneyCollected
	// = false ORDER BY w.billingReadingActualPayment.kifyaWer ASC")
	// List<BillingReadingWuzif> findUnpaidWuzifForCustomer(BillingCustomerInfo
	// customerInfo);
	//
	// @Query("SELECT w FROM BillingReadingWuzif w WHERE
	// w.billingReadingActualPayment.billingCustomerInfo = ?1 AND w.isMoneyCollected
	// = false AND w.deleted = 'active' ORDER BY
	// w.billingReadingActualPayment.kifyaWer ASC")
	// List<BillingReadingWuzif> findUnpaidWuzifForCustomer(BillingCustomerInfo
	// customerInfo);

	// @Query("SELECT w FROM BillingReadingWuzif w " +
	// "WHERE w.billingReadingActualPayment.billingCustomerInfo = ?1 " +
	// "AND w.billingReadingActualPayment.status = 'active' " + // 1. Checks parent
	// bill status
	// "AND w.isMoneyCollected = 0 " + // 2. Checks if wuzif is unpaid (using 0)
	// "AND w.deleted = 'active' " +
	// "ORDER BY w.billingReadingActualPayment.kifyaWer ASC")
	// List<BillingReadingWuzif> findUnpaidWuzifForCustomer(BillingCustomerInfo
	// customerInfo);
	//

	// @Query("SELECT w FROM BillingReadingWuzif w " +
	// "WHERE w.billingReadingActualPayment.billingCustomerInfo = ?1 " +
	// "AND w.billingReadingActualPayment.status = 'active' " +
	// "AND w.isMoneyCollected = false " +
	// "AND w.deleted = 'active' " +
	// "ORDER BY w.billingReadingActualPayment.kifyaWer ASC")
	// List<BillingReadingWuzif> findUnpaidWuzifForCustomer(BillingCustomerInfo
	// customerInfo);

	@Query("SELECT w FROM BillingReadingWuzif w " +
			"WHERE w.billingReadingActualPayment.billingCustomerInfo = ?1 " +
			"AND w.billingReadingActualPayment.status = 'active' " +
			"AND w.isMoneyCollected = false " +
			"AND w.deleted = 'active' " +
			"ORDER BY w.billingReadingActualPayment ASC")
	List<BillingReadingWuzif> findUnpaidWuzifForCustomer(BillingCustomerInfo customerInfo);

	@Query("SELECT w FROM BillingReadingWuzif w " +
			"WHERE w.billingReadingActualPayment.billingCustomerInfo = ?1 " +
			"AND w.billingReadingActualPayment.status = 'active' " +
			"AND w.isMoneyCollected = false " +
			"ORDER BY w.billingReadingActualPayment.kifyaWer ASC")
	List<BillingReadingWuzif> findUnpaidAllWuzifForCustomer(BillingCustomerInfo customerInfo);

	@Query("SELECT w FROM BillingReadingWuzif w " +
			"WHERE w.billingReadingActualPayment.billingCustomerInfo = ?1 " +
			"AND w.billingReadingActualPayment.status = 'active' " +
			"AND w.billingReadingActualPayment.isBillGenerated = true " +
			"ORDER BY w.billingReadingActualPayment.kifyaWer ASC")
	List<BillingReadingWuzif> findUnpaidDeleteAllWuzifForCustomer(BillingCustomerInfo customerInfo);

	@Query("SELECT w FROM BillingReadingWuzif w " +
			"WHERE w.billingReadingActualPayment.billingCustomerInfo = ?1 " +
			"AND w.billingReadingActualPayment.status = 'active' " +
			"AND w.isMoneyCollected = false " +
			"ORDER BY w.billingReadingActualPayment.kifyaWer ASC")
	List<BillingReadingWuzif> findUnpaidWuzifForCustomerAndDeleted(BillingCustomerInfo customerInfo);

	@Query("SELECT w FROM BillingReadingWuzif w " +
			"WHERE w.billingReadingActualPayment = :billingReading " +
			"AND w.isMoneyCollected = false " +
			"AND w.deleted = 'active'")
	List<BillingReadingWuzif> findByBillingReadingActualPaymentCheck(
			@Param("billingReading") BillingReading billingReading);

	@Query("SELECT w FROM BillingReadingWuzif w " +
			"WHERE w.billingReadingActualPayment = :billingReading ")
	List<BillingReadingWuzif> findByBillingReadingActualPaymentAll(
			@Param("billingReading") BillingReading billingReading);

	@Query("SELECT w FROM BillingReadingWuzif w " +
			"WHERE w.billingReadingActualPayment.billingCustomerInfo IN :customers " +
			"AND w.billingReadingActualPayment.status = 'active' " +
			"AND w.isMoneyCollected = false " +
			"ORDER BY w.billingReadingActualPayment.kifyaWer ASC")
	List<BillingReadingWuzif> findUnpaidWuzifForCustomers(@Param("customers") List<BillingCustomerInfo> customers);

	/**
	 * Bulk check: returns distinct customer IDs that have at least one active unpaid
	 * wuzif record (mirrors findUnpaidWuzifForCustomer conditions).
	 */
	@Query("SELECT DISTINCT w.billingReadingActualPayment.billingCustomerInfo.id FROM BillingReadingWuzif w " +
			"WHERE w.billingReadingActualPayment.billingCustomerInfo.id IN :customerIds " +
			"AND w.billingReadingActualPayment.status = 'active' " +
			"AND w.isMoneyCollected = false " +
			"AND w.deleted = 'active'")
	List<Integer> findCustomerIdsWithActiveUnpaidWuzif(@Param("customerIds") List<Integer> customerIds);

	/**
	 * Bulk check: returns the distinct reading IDs (from the supplied list) that
	 * still appear as unpaid wuzif records (billingReadingActualPayment).
	 */
	@Query("SELECT DISTINCT w.billingReadingActualPayment.id FROM BillingReadingWuzif w " +
			"WHERE w.billingReadingActualPayment.id IN :readingIds " +
			"AND w.isMoneyCollected = false " +
			"AND w.deleted = 'active'")
	List<Integer> findReadingIdsWithActiveWuzif(@Param("readingIds") List<Integer> readingIds);

	/**
	 * Bulk check: returns the distinct reading IDs (from the supplied list) that
	 * exist in the wuzif table as billingReadingActualPayment with deleted = 'active'.
	 * Unlike findReadingIdsWithActiveWuzif, this does NOT filter by isMoneyCollected.
	 */
	@Query("SELECT DISTINCT w.billingReadingActualPayment.id FROM BillingReadingWuzif w " +
			"WHERE w.billingReadingActualPayment.id IN :readingIds " +
			"AND w.deleted = 'active'")
	List<Integer> findReadingIdsInWuzifList(@Param("readingIds") List<Integer> readingIds);
}
