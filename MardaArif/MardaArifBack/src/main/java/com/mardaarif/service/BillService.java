package com.mardaarif.service;

import com.mardaarif.model.Bill;
import com.mardaarif.model.BillStatus;
import com.mardaarif.model.City;
import com.mardaarif.repository.BillRepository;
import com.mardaarif.repository.CityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class BillService {
    private static final Logger logger = LoggerFactory.getLogger(BillService.class);

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private CityRepository cityRepository;

    /**
     * Register or update a bill from a city's WBMS.
     * Mirrors the Unicash updateOrRegisterBill behavior.
     */
    public Bill updateOrRegisterBill(Integer cityId, Map<String, Object> payload) {
        // Extract bill data from Unicash-format payload
        String billId = (String) payload.get("billId");
        String validUntil = (String) payload.get("validUntil");
        
        // MardaArif specific fields
        String billReason = (String) payload.get("billReason");
        String email = (String) payload.get("email");
        String prevReadStr = (String) payload.get("prevRead");
        String currReadStr = (String) payload.get("currRead");
        String consumptionStr = (String) payload.get("consumption");
        Map<String, Object> customer = (Map<String, Object>) payload.get("customer");
        String fullName = customer != null ? (String) customer.get("fullName") : null;
        String phoneNumber = customer != null ? (String) customer.get("phoneNumber") : null;
        String customerId = customer != null ? (String) customer.get("customerId") : null;

        Map<String, Object> receiptData = (Map<String, Object>) payload.get("receiptData");
        String description = "";
        Double amountDue = 0.0;
        if (receiptData != null) {
            List<Map<String, Object>> items = (List<Map<String, Object>>) receiptData.get("items");
            if (items != null && !items.isEmpty()) {
                Map<String, Object> item = items.get(0);
                description = (String) item.get("name");
                Object price = item.get("price");
                if (price instanceof Number) {
                    amountDue = ((Number) price).doubleValue();
                }
            }
        }

        // Check if bill already exists
        Optional<Bill> existingBill = billRepository.findByBillIdAndCityId(billId, cityId);

        Bill bill;
        if (existingBill.isPresent()) {
            bill = existingBill.get();
            logger.info("[BillService] Updating existing bill: billId={}, cityId={}", billId, cityId);
        } else {
            bill = new Bill();
            bill.setBillId(billId);
            bill.setCityId(cityId);
            logger.info("[BillService] Registering new bill: billId={}, cityId={}", billId, cityId);
        }

        bill.setCustomerId(customerId);
        bill.setCustomerName(fullName);
        bill.setPhoneNumber(phoneNumber);
        bill.setAmountDue(amountDue);
        bill.setDescription(description);
        bill.setValidUntil(validUntil);
        
        // MardaArif specific mapping
        bill.setBillReason(billReason);
        bill.setEmail(email);
        try { bill.setPrevRead(prevReadStr != null ? Double.parseDouble(prevReadStr) : null); } catch (Exception e) {}
        try { bill.setCurrRead(currReadStr != null ? Double.parseDouble(currReadStr) : null); } catch (Exception e) {}
        try { bill.setConsumption(consumptionStr != null ? Double.parseDouble(consumptionStr) : null); } catch (Exception e) {}

        // Update city's last sync time
        cityRepository.findById(cityId).ifPresent(city -> {
            city.setLastSyncAt(LocalDateTime.now());
            cityRepository.save(city);
        });

        return billRepository.save(bill);
    }

    /**
     * Cancel a bill.
     */
    public Bill cancelBill(String billId, Integer cityId) {
        Optional<Bill> existingBill = billRepository.findByBillIdAndCityId(billId, cityId);
        if (existingBill.isEmpty()) {
            throw new RuntimeException("Bill not found: " + billId);
        }
        Bill bill = existingBill.get();
        bill.setStatus(BillStatus.CANCELLED);
        return billRepository.save(bill);
    }

    /**
     * Get bills for a specific city.
     */
    public List<Bill> getBillsByCity(Integer cityId) {
        return billRepository.findByCityId(cityId);
    }

    /**
     * Get all bills.
     */
    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    /**
     * Search bills by customer ID, name, or bill ID.
     */
    public List<Bill> searchBills(String search, Integer cityId) {
        if (cityId != null) {
            return billRepository.searchBillsByCityId(cityId, search);
        }
        return billRepository.searchBills(search);
    }

    /**
     * Get paid bills for CSV sync file generation.
     */
    public List<Bill> getPaidBillsForSync(Integer cityId, String startDate, String endDate) {
        return billRepository.findPaidBillsByCityAndDateRange(cityId, startDate, endDate);
    }

    /**
     * Get bill by ID.
     */
    public Optional<Bill> getBillById(Long id) {
        return billRepository.findById(id);
    }

    /**
     * Mark a bill as paid.
     */
    public Bill markBillAsPaid(Long id, Double paidAmount, String paidOn, String bankName, String bankRef) {
        Bill bill = billRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Bill not found: " + id));
        bill.setStatus(BillStatus.PAID);
        bill.setPaidAmount(paidAmount);
        bill.setPaidOn(paidOn);
        bill.setBankName(bankName);
        bill.setBankTransactionReference(bankRef);
        return billRepository.save(bill);
    }
}
