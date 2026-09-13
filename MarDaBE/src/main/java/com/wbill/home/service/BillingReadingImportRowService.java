package com.wbill.home.service;

import com.wbill.home.model.BillingReading;
import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.BillingCustomerInfoMeter;
import com.wbill.home.model.BillingZeroReadingReason;
import com.wbill.home.model.BillingCompanyInformation;
import com.wbill.home.repository.BillingReadingRepository;
import com.wbill.home.repository.BillingCustomerInfoRepository;
import com.wbill.home.repository.BillingCustomerInfoMeterRepository;
import com.wbill.home.util.EthiopianCalendarUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Optional;

import jakarta.persistence.EntityNotFoundException;

/**
 * Handles single-row import processing in its own short-lived transaction.
 * Each row acquires and releases locks independently, preventing
 * "Lock wait timeout exceeded" errors during bulk Excel imports.
 */
@Service
public class BillingReadingImportRowService {

    @Autowired
    private BillingReadingRepository billingReadingRepository;

    @Autowired
    private BillingCustomerInfoRepository billingCustomerInfoRepository;

    @Autowired
    private BillingCustomerInfoMeterRepository billingCustomerInfoMeterRepository;

    /**
     * Result holder for a single row import.
     */
    public static class RowResult {
        private boolean success;
        private boolean updated; // true if existing reading was updated, false if new created
        private String message;

        public RowResult(boolean success, boolean updated, String message) {
            this.success = success;
            this.updated = updated;
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public boolean isUpdated() { return updated; }
        public String getMessage() { return message; }
    }

    /**
     * Process a single Excel row in its own transaction (REQUIRES_NEW).
     * This ensures locks are acquired and released per-row, not per-file.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public RowResult processRow(
            String customerAccountNumber,
            int currentReading,
            String currentKifyaWerString,
            String previousKifyaWerString,
            BillingZeroReadingReason defaultZeroReason,
            BillingCompanyInformation companyInfo) {

        // Find customer with pessimistic lock (short-lived, released at end of this method)
        BillingCustomerInfo customer = billingCustomerInfoRepository
                .findActiveByAccountNumberForUpdate(customerAccountNumber)
                .orElseThrow(() -> new IllegalStateException("Customer not found for account: "));

        // Try to update existing reading for this period
        Optional<BillingReading> existingReadingOpt = billingReadingRepository
                .findByBillingCustomerInfoAndKifyaWerAndStatusOrderByCollectionDateDesc(
                        customer, currentKifyaWerString, "active");

        if (existingReadingOpt.isPresent()) {
            BillingReading toUpdate = existingReadingOpt.get();
            int newConsumption = currentReading - toUpdate.getPreviousReading();
            if (newConsumption < 0) {
                throw new IllegalStateException("Update results in negative consumption (" + newConsumption + ").");
            }

            toUpdate.setLastReading(currentReading);
            toUpdate.setConsumption(newConsumption);
            toUpdate.setModifiedDate(new Date());
            toUpdate.setCollectionDate(new Date());
            billingReadingRepository.save(toUpdate);

            return new RowResult(true, true, "Updated reading for account " + customerAccountNumber);
        } else {
            // Create new reading — use holder array to get meter ID alongside previous reading
            int[] meterHolder = new int[]{0};
            int previousReading = getPreviousReadingWithMeter(customer, currentKifyaWerString, meterHolder);
            final int meterNoUsed = meterHolder[0];

            int consumption = currentReading - previousReading;
            if (consumption < 0) {
                throw new IllegalStateException("New reading results in negative consumption (" + consumption + ").");
            }

            BillingReading newReading = new BillingReading();
            newReading.setBillingCustomerInfo(customer);
            newReading.setKifyaWer(currentKifyaWerString);
            newReading.setPreviousReading(previousReading);
            newReading.setLastReading(currentReading);
            newReading.setConsumption(consumption);
            newReading.setCollectionDate(new Date());
            newReading.setRegisteredDate(new Date());
            newReading.setModifiedDate(new Date());
            newReading.setStatus("active");
            newReading.setConsumptionWuzifYalefew(0);
            newReading.setConsumptionWuzif(0);

            // --- Zero Reading Logic ---
            if (newReading.getConsumption() == 0) {
                newReading.setZeroOccurred(true);
                if (newReading.getBillingZeroReadingReason() == null && defaultZeroReason != null) {
                    newReading.setBillingZeroReadingReason(defaultZeroReason);
                }
                Optional<BillingReading> prevReadingForZeroBzatOpt = billingReadingRepository
                        .findFullReadingByCustomerIdAndKifyaWer(customer.getId(), previousKifyaWerString);
                if (prevReadingForZeroBzatOpt.isPresent()) {
                    BillingReading prevReadingForZeroBzat = prevReadingForZeroBzatOpt.get();
                    newReading.setZeroReadingWorBzat(prevReadingForZeroBzat.getZeroReadingWorBzat() + 1);
                } else {
                    newReading.setZeroReadingWorBzat(1);
                }
            } else {
                newReading.setZeroOccurred(false);
                newReading.setBillingZeroReadingReason(null);
                newReading.setZeroReadingWorBzat(0);
            }

            // --- Meter ---
            if (meterNoUsed != 0) {
                BillingCustomerInfoMeter meter = billingCustomerInfoMeterRepository.findById(meterNoUsed)
                        .orElseThrow(() -> new EntityNotFoundException("Meter not found with id: " + meterNoUsed));
                newReading.setBillingCustomerInfoMeter(meter);
            } else {
                newReading.setBillingCustomerInfoMeter(null);
            }
            newReading.setMobileReaderUser(null);
            newReading.setModifiedByUser(null);

            // --- Yeteganene ---
            if (newReading.getConsumption() != 0.0 && companyInfo != null) {
                double average = (customer.getInitialConsumption() != null) ? customer.getInitialConsumption() : 0;
                if (average != 0) {
                    boolean isYeteganene = ((average * (companyInfo.getYeteganenePercent() / 100.0))
                            + average) <= newReading.getConsumption();
                    newReading.setYeteganene(isYeteganene);
                } else {
                    newReading.setYeteganene(false);
                }
            } else {
                newReading.setYeteganene(false);
            }

            billingReadingRepository.save(newReading);

            // Update initialized flag if needed
            if (customer.getIsInitializedSecondTime()) {
                customer.setIsInitializedSecondTime(false);
                billingCustomerInfoRepository.save(customer);
            }

            return new RowResult(true, false, "Created reading for account " + customerAccountNumber);
        }
    }

    /**
     * Gets previous reading and sets the meter ID in the holder array.
     * This replaces the instance-variable side-effect pattern from the original code.
     */
    private int getPreviousReadingWithMeter(BillingCustomerInfo customer, String currentKifyaWer, int[] meterHolder) {
        if (customer.getIsInitializedSecondTime()) {
            Optional<BillingCustomerInfoMeter> latestActiveMeterOpt = billingCustomerInfoMeterRepository
                    .findFirstByBillingCustomerInfoAndActiveMeterIsTrueAndDeletedOrderByRegisteredDateDesc(customer,
                            "active");
            if (latestActiveMeterOpt.isPresent()) {
                meterHolder[0] = latestActiveMeterOpt.get().getId();
                return latestActiveMeterOpt.get().getInitialReading();
            } else {
                throw new EntityNotFoundException(
                        "CRITICAL: A meter change was flagged, but no active meter was found for customer: "
                                + customer.getAccountNumber());
            }
        } else {
            String previousKifyaWerString = EthiopianCalendarUtil.getPreviousKifyaWer(currentKifyaWer);

            // Step 1: Check immediate previous month
            Optional<BillingReading> immediatePreviousReadingOpt = billingReadingRepository
                    .findFirstByBillingCustomerInfoAndKifyaWerOrderByRegisteredDateDesc(customer,
                            previousKifyaWerString);
            if (immediatePreviousReadingOpt.isPresent()) {
                BillingReading prev = immediatePreviousReadingOpt.get();
                if (prev.getBillingCustomerInfoMeter() != null) {
                    meterHolder[0] = prev.getBillingCustomerInfoMeter().getId();
                } else {
                    meterHolder[0] = 0;
                }
                return prev.getLastReading();
            }

            // Step 2: Check absolute latest reading
            Optional<BillingReading> absoluteLatestReadingOpt = billingReadingRepository
                    .findFirstByBillingCustomerInfoOrderByRegisteredDateDesc(customer);
            if (absoluteLatestReadingOpt.isPresent()) {
                BillingReading prev = absoluteLatestReadingOpt.get();
                if (prev.getBillingCustomerInfoMeter() != null) {
                    meterHolder[0] = prev.getBillingCustomerInfoMeter().getId();
                } else {
                    meterHolder[0] = 0;
                }
                return prev.getLastReading();
            }

            // Step 3: Fallback to the active meter's initial reading
            Optional<BillingCustomerInfoMeter> latestActiveMeterOpt = billingCustomerInfoMeterRepository
                    .findFirstByBillingCustomerInfoAndActiveMeterIsTrueAndDeletedOrderByRegisteredDateDesc(customer,
                            "active");
            if (latestActiveMeterOpt.isPresent()) {
                meterHolder[0] = latestActiveMeterOpt.get().getId();
                return latestActiveMeterOpt.get().getInitialReading();
            }

            throw new EntityNotFoundException(
                    "CRITICAL: No previous readings or active meter found for customer: "
                            + customer.getAccountNumber());
        }
    }

    // Unused but kept for potential future use
    private int getPreviousReadingForCustomerLocal(BillingCustomerInfo customer, String currentKifyaWer) {
        int[] holder = new int[]{0};
        return getPreviousReadingWithMeter(customer, currentKifyaWer, holder);
    }
}
