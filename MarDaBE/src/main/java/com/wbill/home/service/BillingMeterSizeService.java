package com.wbill.home.service;

import com.wbill.home.model.BillingMeterSize;
import com.wbill.home.repository.BillingMeterSizeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BillingMeterSizeService {

    @Autowired
    private BillingMeterSizeRepository meterSizeRepository;

    // Get all meter sizes with fallback strategy
    public List<BillingMeterSize> getAllMeterSizes() {
        try {
            // First attempt: get all meter sizes regardless of status for frontend filtering
            List<BillingMeterSize> meterSizes = meterSizeRepository.findAllMeterSizes();
            if (meterSizes.isEmpty()) {
                // Fallback: try to get active only
                meterSizes = meterSizeRepository.findAllActive();
            }
            if (meterSizes.isEmpty()) {
                // Final fallback: get all from repository
                meterSizes = meterSizeRepository.findAll();
            }
            return meterSizes;
        } catch (Exception e) {
            // Final fallback: get all from repository
            return meterSizeRepository.findAll();
        }
    }

    // Get meter sizes by status with pagination
    public Page<BillingMeterSize> getMeterSizesByStatus(String status, Pageable pageable) {
        return meterSizeRepository.findByDeletedWithPagination(status, pageable);
    }

    // Get meter size by ID
    public Optional<BillingMeterSize> getMeterSizeById(Integer id) {
        return meterSizeRepository.findById(id);
    }

    // Create new meter size
    public BillingMeterSize createMeterSize(BillingMeterSize meterSize) {
        // Validate uniqueness
        if (meterSizeRepository.existsByMeterSizeAndMeterCode(meterSize.getMeterSize(), meterSize.getMeterCode())) {
            throw new RuntimeException("Meter size with this size and code combination already exists");
        }

        // Set default status
        meterSize.setDeleted("active");
        
        return meterSizeRepository.save(meterSize);
    }

    // Update existing meter size
    public BillingMeterSize updateMeterSize(Integer id, BillingMeterSize updatedMeterSize) {
        Optional<BillingMeterSize> existingOpt = meterSizeRepository.findById(id);
        if (!existingOpt.isPresent()) {
            throw new RuntimeException("Meter size not found with id: " + id);
        }

        BillingMeterSize existing = existingOpt.get();

        // Update fields
        existing.setMeterSize(updatedMeterSize.getMeterSize());
        existing.setMeterCode(updatedMeterSize.getMeterCode());

        return meterSizeRepository.save(existing);
    }

    // Deactivate meter size (soft delete)
    public BillingMeterSize deactivateMeterSize(Integer id) {
        Optional<BillingMeterSize> meterSizeOpt = meterSizeRepository.findById(id);
        if (!meterSizeOpt.isPresent()) {
            throw new RuntimeException("Meter size not found with id: " + id);
        }

        BillingMeterSize meterSize = meterSizeOpt.get();
        meterSize.setDeleted("deleted");
        
        return meterSizeRepository.save(meterSize);
    }

    // Activate meter size
    public BillingMeterSize activateMeterSize(Integer id) {
        Optional<BillingMeterSize> meterSizeOpt = meterSizeRepository.findById(id);
        if (!meterSizeOpt.isPresent()) {
            throw new RuntimeException("Meter size not found with id: " + id);
        }

        BillingMeterSize meterSize = meterSizeOpt.get();
        meterSize.setDeleted("active");
        
        return meterSizeRepository.save(meterSize);
    }

    // Get statistics
    public MeterSizeStatistics getMeterSizeStatistics() {
        long totalActive = meterSizeRepository.countActive();
        long totalDeleted = meterSizeRepository.countDeleted();
        long totalAll = totalActive + totalDeleted;
        
        return new MeterSizeStatistics(totalAll, totalActive, totalDeleted);
    }

    // Helper method to check if meter size exists
    public boolean meterSizeExists(Integer id) {
        return meterSizeRepository.existsById(id);
    }

    // Helper method to get active meter sizes only
    public List<BillingMeterSize> getActiveMeterSizes() {
        return meterSizeRepository.findAllActive();
    }

    // Statistics inner class
    public static class MeterSizeStatistics {
        private long total;
        private long active;
        private long deleted;

        public MeterSizeStatistics(long total, long active, long deleted) {
            this.total = total;
            this.active = active;
            this.deleted = deleted;
        }

        // Getters
        public long getTotal() { return total; }
        public long getActive() { return active; }
        public long getDeleted() { return deleted; }
    }
}
