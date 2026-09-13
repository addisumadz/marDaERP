package com.wbill.home.dto;

import com.wbill.home.model.BillingInvoiceNumbers;
import com.wbill.home.model.BillingMeterRent;
import com.wbill.home.model.BillingPenaltyTarif;
import com.wbill.home.model.BillingTariff;
import com.wbill.home.model.CompanyProfile;

import java.util.*;

/**
 * Pre-cached in-memory batch context holding immutable billing configurations
 * (tariffs, meter rent matrices, penalty rules, company profile parameters, and preallocated invoices).
 * Eliminates N+1 database queries during high-volume bill generation (20K+ records).
 */
public class BillingBatchContext {
    private final CompanyProfile companyProfile;
    private final Map<Integer, List<BillingTariff>> tariffsByCustomerType;
    private final Map<String, Double> meterRentMap;
    private final Map<Integer, List<BillingPenaltyTarif>> penaltyTariffsByCustomerType;
    private final Queue<BillingInvoiceNumbers> preallocatedInvoices;
    private final String invoicePrefix;

    public BillingBatchContext(CompanyProfile companyProfile,
                               List<BillingTariff> allTariffs,
                               List<BillingMeterRent> allMeterRents,
                               List<BillingPenaltyTarif> allPenaltyTariffs) {
        this.companyProfile = companyProfile;
        this.invoicePrefix = (companyProfile != null && companyProfile.getAccountNumberCompanyShortCode() != null
                && !companyProfile.getAccountNumberCompanyShortCode().trim().isEmpty())
                ? companyProfile.getAccountNumberCompanyShortCode().trim() : "SJ";

        // Group tariffs by customer type ID, ordered by consumption/block
        this.tariffsByCustomerType = new HashMap<>();
        if (allTariffs != null) {
            for (BillingTariff t : allTariffs) {
                if (t.getBillingCustomerType() != null && "active".equalsIgnoreCase(t.getStatus())) {
                    tariffsByCustomerType
                            .computeIfAbsent(t.getBillingCustomerType().getId(), k -> new ArrayList<>())
                            .add(t);
                }
            }
            for (List<BillingTariff> list : tariffsByCustomerType.values()) {
                list.sort(Comparator.comparingDouble(BillingTariff::getConsumption));
            }
        }

        // Map meter rent by "customerTypeId_meterSizeId"
        this.meterRentMap = new HashMap<>();
        if (allMeterRents != null) {
            // Sort by id descending so latest active rent takes precedence
            List<BillingMeterRent> sortedRents = new ArrayList<>(allMeterRents);
            sortedRents.sort((a, b) -> Integer.compare(b.getId(), a.getId()));
            for (BillingMeterRent rent : sortedRents) {
                if (rent.getBillingCustomerType() != null && rent.getBillingMeterSize() != null
                        && "active".equalsIgnoreCase(rent.getStatus())) {
                    String key = rent.getBillingCustomerType().getId() + "_" + rent.getBillingMeterSize().getId();
                    meterRentMap.putIfAbsent(key, rent.getRentBirr());
                }
            }
        }

        // Group penalty tariffs by customer type ID, sorted by numberOfMonth asc
        this.penaltyTariffsByCustomerType = new HashMap<>();
        if (allPenaltyTariffs != null) {
            for (BillingPenaltyTarif pt : allPenaltyTariffs) {
                if (pt.getBillingCustomerType() != null) {
                    penaltyTariffsByCustomerType
                            .computeIfAbsent(pt.getBillingCustomerType().getId(), k -> new ArrayList<>())
                            .add(pt);
                }
            }
            for (List<BillingPenaltyTarif> list : penaltyTariffsByCustomerType.values()) {
                list.sort(Comparator.comparingInt(BillingPenaltyTarif::getNumberOfMonth));
            }
        }

        this.preallocatedInvoices = new ArrayDeque<>();
    }

    public CompanyProfile getCompanyProfile() {
        return companyProfile;
    }

    public String getInvoicePrefix() {
        return invoicePrefix;
    }

    public List<BillingTariff> getTariffs(Integer customerTypeId) {
        if (customerTypeId == null) return Collections.emptyList();
        return tariffsByCustomerType.getOrDefault(customerTypeId, Collections.emptyList());
    }

    public Double getMeterRent(Integer customerTypeId, Integer meterSizeId) {
        if (customerTypeId == null || meterSizeId == null) return null;
        return meterRentMap.get(customerTypeId + "_" + meterSizeId);
    }

    public List<BillingPenaltyTarif> getPenaltyTariffs(Integer customerTypeId) {
        if (customerTypeId == null) return Collections.emptyList();
        return penaltyTariffsByCustomerType.getOrDefault(customerTypeId, Collections.emptyList());
    }

    public void addInvoices(Collection<BillingInvoiceNumbers> invoices) {
        if (invoices != null) {
            preallocatedInvoices.addAll(invoices);
        }
    }

    public BillingInvoiceNumbers pollInvoice() {
        return preallocatedInvoices.poll();
    }

    public int getAvailableInvoiceCount() {
        return preallocatedInvoices.size();
    }
}
