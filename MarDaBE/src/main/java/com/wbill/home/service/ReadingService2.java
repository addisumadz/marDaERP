package com.wbill.home.service;

import com.wbill.home.dto.BillingReadingDTO;
import com.wbill.home.dto.ReadingUpdateDTO;
import com.wbill.home.dto.SimplifiedReadingDTO;
import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.BillingReading; // If you have methods returning full entities
import com.wbill.home.repository.BillingCustomerInfoRepository;
import com.wbill.home.repository.BillingReadingRepository;
import com.wbill.home.util.EthiopianCalendarUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ReadingService2 {

    @Autowired
    private BillingReadingRepository billingReadingRepository;
    @Autowired
    private BillingCustomerInfoRepository billingCustomerInfoRepository;

    @Transactional(readOnly = true)
    public List<BillingReadingDTO> getAllReadingsForList() {
        return billingReadingRepository.findAllReadingDTOs();
    }

    @Transactional(readOnly = true)
    public List<BillingReadingDTO> getReadingsByStatusForList(String status) {
        return billingReadingRepository.findReadingDTOsByStatus(status);
    }

//    @Transactional(readOnly = true)
//    public List<BillingReadingDTO> getReadingsByCustomerIdForList(int customerId) {
//        return billingReadingRepository.findReadingDTOsByCustomerId(customerId);
//    }

//    // If you need to fetch readings for a specific customer:
//    @Query("SELECT NEW com.wbill.home.dto.BillingReadingDTO(" +
//           "b.id, b.invoiceNumber,b.isMoneyCollected, b.isMoneyCollected, b.lastReading, b.previousReading, b.consumption, b.kifyaWer, " +
//           "b.additionalHisab, b.yezihWerFjotaKfya, b.kotariKiray, b.techemariKfya, b.yezihWer, b.wuzifHisab, " +
//           "b.wuzifDerekKoshasha, b.isPaidThroughBank, b.isPaidOnFrontOffice, b.isPaidFromTekemach, " +
//           "b.isDerashPaid, b.isUnicashPaid, b.isAbyssiniaPaid, b.tekilalaTekefay, b.tekilalaBankYetekefele, " +
//           "b.tekilalaYetekefele, b.kecreditYetekefele, b.bankPaidAgentId, b.uBankPaidAgentId, b.status) " +
//           "FROM BillingReading b WHERE b.billingCustomerInfo.id = :customerId ORDER BY b.id DESC") // Example: Fetch by customer ID
//    List<BillingReadingDTO> findReadingDTOsByCustomerId(@Param("customerId") int customerId);

    
    // Example: Method to get the full BillingReading entity if details are needed
    @Transactional(readOnly = true)
    public Optional<BillingReading> getReadingById(int id) {
        return billingReadingRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public List<BillingReadingDTO> getReadingsByStatusAndKifyaWerForList(String status, String kifyaWer) {
        return billingReadingRepository.findReadingDTOsReadingsWhereBillNotGenerated(status, kifyaWer);
    }

    
    @Transactional(readOnly = true)
    public List<BillingReadingDTO> getBillReadingsByStatusAndKifyaWerForList(String status, String kifyaWer) {
        return billingReadingRepository.findReadingDTOsByStatusAndKifyaWer(status, kifyaWer);
    }
    @Transactional(readOnly = true)
    public List<BillingReadingDTO> getReadingsByCustomerIdAndStatusAndKifyaWerForList(int customerId, String status, String kifyaWer) {
        return billingReadingRepository.findReadingDTOsByCustomerIdAndStatusAndKifyaWer(customerId, status, kifyaWer);
    }
    
    
    @Transactional(readOnly = true)
    public List<BillingReadingDTO> getReadingsByCustomerId(int customerId) {
        return billingReadingRepository.findReadingDTOsByCustomerId(customerId);
    }

    public List<SimplifiedReadingDTO> getFilteredSimplifiedReadingsWhereBillNotGenerated(
            String status, String kifyaWer) {
        return billingReadingRepository.findFilteredSimplifiedReadingsWhereBillNotGenerated(status, kifyaWer);
    }
    
    @Transactional
    public BillingReading createReading(ReadingUpdateDTO dto) {
        // 1. Validate customer exists
        BillingCustomerInfo customer = billingCustomerInfoRepository.findByAccountNumber(dto.getCustomerAccountNumber())
                .orElseThrow(() -> new RuntimeException("Customer not found with account: " + dto.getCustomerAccountNumber()));

        // 2. Prevent duplicate reading for the same period
        billingReadingRepository.findByBillingCustomerInfoAndKifyaWer(customer, dto.getKifyaWer())
            .ifPresent(r -> { throw new RuntimeException("Reading for this period already exists."); });

        // 3. Determine previous reading
        String previousKifyaWer = EthiopianCalendarUtil.getPreviousKifyaWer(dto.getKifyaWer());
        Optional<BillingReading> prevReadingOpt = billingReadingRepository.findFullReadingByCustomerIdAndKifyaWer(customer.getId(), previousKifyaWer);

       int previousReadingValue = prevReadingOpt.map(BillingReading::getLastReading).orElse((int) customer.getInitialReading());

        // 4. Calculate consumption
        int consumption = dto.getLastReading() - previousReadingValue;
        if (consumption < 0) {
            throw new RuntimeException("Negative consumption is not allowed. Check reading values.");
        }

        // 5. Build the new BillingReading entity
        BillingReading newReading = new BillingReading();
        newReading.setBillingCustomerInfo(customer);
        newReading.setKifyaWer(dto.getKifyaWer());
        newReading.setLastReading(dto.getLastReading());
        newReading.setPreviousReading(previousReadingValue);
        newReading.setConsumption(consumption);
        newReading.setCollectionDate(new Date());
        newReading.setRegisteredDate(new Date());
        newReading.setModifiedDate(new Date());
        newReading.setStatus("active");
        newReading.setBillGenerated(false); // Bill not generated yet
        newReading.setMoneyCollected(false);
        // Set other necessary defaults...
        
        return billingReadingRepository.save(newReading);
    }

    @Transactional
    public BillingReading updateReading(Integer id, ReadingUpdateDTO dto) {
        BillingReading reading = billingReadingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reading not found with id: " + id));

        // Update the reading and recalculate consumption
        reading.setLastReading(dto.getLastReading());
        int newConsumption = reading.getLastReading() - reading.getPreviousReading();
        if (newConsumption < 0) {
            throw new RuntimeException("Update resulted in negative consumption.");
        }
        reading.setConsumption(newConsumption);
        reading.setModifiedDate(new Date());

        return billingReadingRepository.save(reading);
    }

    @Transactional
    public void deleteReading(Integer id) {
        if (!billingReadingRepository.existsById(id)) {
            throw new RuntimeException("Reading not found, cannot delete.");
        }
        billingReadingRepository.deleteById(id);
    }
    
}