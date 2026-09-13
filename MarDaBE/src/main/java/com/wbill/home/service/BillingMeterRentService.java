package com.wbill.home.service;

import com.wbill.home.model.BillingMeterRent;
import com.wbill.home.model.BillingCustomerType;
import com.wbill.home.model.BillingMeterSize;
import com.wbill.home.repository.BillingMeterRentRepository;
import com.wbill.home.repository.BillingCustomerTypeRepository;
import com.wbill.home.repository.BillingMeterSizeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BillingMeterRentService {

    @Autowired
    private BillingMeterRentRepository meterRentRepository;
    
    @Autowired
    private BillingCustomerTypeRepository customerTypeRepository;
    
    @Autowired
    private BillingMeterSizeRepository meterSizeRepository;

    // Get all meter rents (both active and deleted for frontend categorization)
    public List<BillingMeterRent> getAllMeterRents() {
        try {
            // First attempt: get all meter rents
            List<BillingMeterRent> allMeterRents = meterRentRepository.findAllMeterRents();
            return allMeterRents;
        } catch (Exception e) {
            System.err.println("Error in getAllMeterRents: " + e.getMessage());
            // Fallback: get active meter rents only
            try {
                List<BillingMeterRent> activeMeterRents = meterRentRepository.findAllActive();
                return activeMeterRents;
            } catch (Exception e2) {
                System.err.println("Error in fallback getAllMeterRents: " + e2.getMessage());
                // Final fallback: return all from findAll
                return meterRentRepository.findAll();
            }
        }
    }

    // Get meter rents by status with pagination
    public Page<BillingMeterRent> getMeterRentsByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("rentBirr").ascending());
        
        if ("ACTIVE".equalsIgnoreCase(status)) {
            return meterRentRepository.findAllActiveWithPagination(pageable);
        } else if ("DELETED".equalsIgnoreCase(status)) {
            return meterRentRepository.findAllDeleted(pageable);
        } else {
            return meterRentRepository.findByStatus(status.toLowerCase(), pageable);
        }
    }

    // Get meter rent by ID
    public Optional<BillingMeterRent> getMeterRentById(Integer id) {
        return meterRentRepository.findById(id);
    }

    // Create new meter rent
    public BillingMeterRent createMeterRent(BillingMeterRent meterRent) {
        // Validation
        validateMeterRent(meterRent, null);

        // Set default values
        meterRent.setStatus("active");

        return meterRentRepository.save(meterRent);
    }

    // Update existing meter rent
    public BillingMeterRent updateMeterRent(Integer id, BillingMeterRent updatedMeterRent) {
        Optional<BillingMeterRent> existingMeterRentOpt = meterRentRepository.findById(id);
        
        if (!existingMeterRentOpt.isPresent()) {
            throw new RuntimeException("Meter Rent not found with id: " + id);
        }

        BillingMeterRent existingMeterRent = existingMeterRentOpt.get();
        
        // Validation - skip duplicate validation during updates
        validateMeterRent(updatedMeterRent, id);

        // Update fields
        existingMeterRent.setBillingCustomerType(updatedMeterRent.getBillingCustomerType());
        existingMeterRent.setBillingMeterSize(updatedMeterRent.getBillingMeterSize());
        existingMeterRent.setRentBirr(updatedMeterRent.getRentBirr());

        return meterRentRepository.save(existingMeterRent);
    }

    // Soft delete (deactivate) meter rent
    public BillingMeterRent deactivateMeterRent(Integer id, String remark) {
        Optional<BillingMeterRent> meterRentOpt = meterRentRepository.findById(id);
        
        if (!meterRentOpt.isPresent()) {
            throw new RuntimeException("Meter Rent not found with id: " + id);
        }

        BillingMeterRent meterRent = meterRentOpt.get();
        meterRent.setStatus("deleted");

        return meterRentRepository.save(meterRent);
    }

    // Activate meter rent
    public BillingMeterRent activateMeterRent(Integer id) {
        Optional<BillingMeterRent> meterRentOpt = meterRentRepository.findById(id);
        
        if (!meterRentOpt.isPresent()) {
            throw new RuntimeException("Meter Rent not found with id: " + id);
        }

        BillingMeterRent meterRent = meterRentOpt.get();
        meterRent.setStatus("active");

        return meterRentRepository.save(meterRent);
    }

    // Helper method for validation
    private void validateMeterRent(BillingMeterRent meterRent, Integer excludeId) {
        if (meterRent.getBillingCustomerType() == null) {
            throw new IllegalArgumentException("Customer type is required");
        }

        if (meterRent.getBillingMeterSize() == null) {
            throw new IllegalArgumentException("Meter size is required");
        }

        if (meterRent.getRentBirr() < 0) {
            throw new IllegalArgumentException("Rent amount must be a positive number");
        }

        // Validate that customer type exists and is active
        Optional<BillingCustomerType> customerTypeOpt = customerTypeRepository.findById(meterRent.getBillingCustomerType().getId());
        if (!customerTypeOpt.isPresent() || !"active".equals(customerTypeOpt.get().getDeleted())) {
            throw new IllegalArgumentException("Invalid or inactive customer type");
        }

        // Validate that meter size exists and is active
        Optional<BillingMeterSize> meterSizeOpt = meterSizeRepository.findById(meterRent.getBillingMeterSize().getId());
        if (!meterSizeOpt.isPresent() || !"active".equals(meterSizeOpt.get().getDeleted())) {
            throw new IllegalArgumentException("Invalid or inactive meter size");
        }

        // Only check for duplicates during creation (excludeId is null)
        if (excludeId == null) {
            if (meterRentRepository.existsByBillingCustomerTypeAndBillingMeterSize(
                    meterRent.getBillingCustomerType(), meterRent.getBillingMeterSize())) {
                throw new IllegalArgumentException("Meter rent for this customer type and meter size combination already exists");
            }
        }
        // Skip duplicate validation during updates
    }

    // Get meter rent statistics
    public MeterRentStatistics getMeterRentStatistics() {
        Long activeCount = meterRentRepository.countActiveMeterRents();
        Long deletedCount = meterRentRepository.countDeletedMeterRents();
        
        return new MeterRentStatistics(
            activeCount != null ? activeCount : 0L,
            deletedCount != null ? deletedCount : 0L
        );
    }

    // Inner class for statistics
    public static class MeterRentStatistics {
        private Long activeMeterRents;
        private Long deletedMeterRents;

        public MeterRentStatistics(Long activeMeterRents, Long deletedMeterRents) {
            this.activeMeterRents = activeMeterRents;
            this.deletedMeterRents = deletedMeterRents;
        }

        public Long getActiveMeterRents() {
            return activeMeterRents;
        }

        public void setActiveMeterRents(Long activeMeterRents) {
            this.activeMeterRents = activeMeterRents;
        }

        public Long getDeletedMeterRents() {
            return deletedMeterRents;
        }

        public void setDeletedMeterRents(Long deletedMeterRents) {
            this.deletedMeterRents = deletedMeterRents;
        }
    }
}
