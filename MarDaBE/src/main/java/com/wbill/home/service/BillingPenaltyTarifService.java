package com.wbill.home.service;

import com.wbill.home.model.BillingPenaltyTarif;
import com.wbill.home.model.BillingCustomerType;
import com.wbill.home.repository.BillingPenaltyTarifRepository;
import com.wbill.home.repository.BillingCustomerTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BillingPenaltyTarifService {

    @Autowired
    private BillingPenaltyTarifRepository penaltyTarifRepository;

    @Autowired
    private BillingCustomerTypeRepository customerTypeRepository;

    // Get all penalty tarifs with fallback strategy
    public List<BillingPenaltyTarif> getAllPenaltyTarifs() {
        try {
            // First attempt: get all penalty tarifs regardless of status for frontend filtering
            List<BillingPenaltyTarif> penaltyTarifs = penaltyTarifRepository.findAllPenaltyTarifs();
            if (penaltyTarifs.isEmpty()) {
                // Fallback: try to get active only
                penaltyTarifs = penaltyTarifRepository.findAllActive();
            }
            if (penaltyTarifs.isEmpty()) {
                // Final fallback: get all from repository
                penaltyTarifs = penaltyTarifRepository.findAll();
            }
            return penaltyTarifs;
        } catch (Exception e) {
            // Final fallback: get all from repository
            return penaltyTarifRepository.findAll();
        }
    }

    // Get penalty tarifs by status with pagination
    public Page<BillingPenaltyTarif> getPenaltyTarifsByStatus(String status, Pageable pageable) {
        return penaltyTarifRepository.findByDeletedWithPagination(status, pageable);
    }

    // Get penalty tarif by ID
    public Optional<BillingPenaltyTarif> getPenaltyTarifById(Integer id) {
        return penaltyTarifRepository.findById(id);
    }

    // Create new penalty tarif
    public BillingPenaltyTarif createPenaltyTarif(BillingPenaltyTarif penaltyTarif) {
        // Validate customer type exists and is active
        Optional<BillingCustomerType> customerTypeOpt = customerTypeRepository.findById(penaltyTarif.getBillingCustomerType().getId());
        if (!customerTypeOpt.isPresent()) {
            throw new RuntimeException("Customer type not found");
        }
        
        BillingCustomerType customerType = customerTypeOpt.get();
        if (!"active".equals(customerType.getDeleted())) {
            throw new RuntimeException("Customer type is not active");
        }

        // Validate uniqueness (customer type + number of months combination)
        if (penaltyTarifRepository.existsByBillingCustomerTypeIdAndNumberOfMonth(
                penaltyTarif.getBillingCustomerType().getId(), 
                penaltyTarif.getNumberOfMonth())) {
            throw new RuntimeException("Penalty tarif already exists for this customer type and number of months");
        }

        // Set the customer type and default status
        penaltyTarif.setBillingCustomerType(customerType);
        penaltyTarif.setDeleted("active");
        
        return penaltyTarifRepository.save(penaltyTarif);
    }

    // Update existing penalty tarif
    public BillingPenaltyTarif updatePenaltyTarif(Integer id, BillingPenaltyTarif updatedPenaltyTarif) {
        Optional<BillingPenaltyTarif> existingOpt = penaltyTarifRepository.findById(id);
        if (!existingOpt.isPresent()) {
            throw new RuntimeException("Penalty tarif not found with id: " + id);
        }

        BillingPenaltyTarif existing = existingOpt.get();

        // Validate customer type exists and is active
        Optional<BillingCustomerType> customerTypeOpt = customerTypeRepository.findById(updatedPenaltyTarif.getBillingCustomerType().getId());
        if (!customerTypeOpt.isPresent()) {
            throw new RuntimeException("Customer type not found");
        }
        
        BillingCustomerType customerType = customerTypeOpt.get();
        if (!"active".equals(customerType.getDeleted())) {
            throw new RuntimeException("Customer type is not active");
        }

        // Update fields
        existing.setBillingCustomerType(customerType);
        existing.setIsPercent(updatedPenaltyTarif.getIsPercent());
        existing.setPenalityBirr(updatedPenaltyTarif.getPenalityBirr());
        existing.setAdditionalPenalty(updatedPenaltyTarif.getAdditionalPenalty());
        existing.setNumberOfMonth(updatedPenaltyTarif.getNumberOfMonth());
        existing.setBewerBzatYbaza(updatedPenaltyTarif.getBewerBzatYbaza());
        existing.setWeruLayDemr(updatedPenaltyTarif.getWeruLayDemr());
        existing.setEnaKezihBelay(updatedPenaltyTarif.getEnaKezihBelay());

        return penaltyTarifRepository.save(existing);
    }

    // Deactivate penalty tarif (soft delete)
    public BillingPenaltyTarif deactivatePenaltyTarif(Integer id) {
        Optional<BillingPenaltyTarif> penaltyTarifOpt = penaltyTarifRepository.findById(id);
        if (!penaltyTarifOpt.isPresent()) {
            throw new RuntimeException("Penalty tarif not found with id: " + id);
        }

        BillingPenaltyTarif penaltyTarif = penaltyTarifOpt.get();
        penaltyTarif.setDeleted("deleted");
        
        return penaltyTarifRepository.save(penaltyTarif);
    }

    // Activate penalty tarif
    public BillingPenaltyTarif activatePenaltyTarif(Integer id) {
        Optional<BillingPenaltyTarif> penaltyTarifOpt = penaltyTarifRepository.findById(id);
        if (!penaltyTarifOpt.isPresent()) {
            throw new RuntimeException("Penalty tarif not found with id: " + id);
        }

        BillingPenaltyTarif penaltyTarif = penaltyTarifOpt.get();
        penaltyTarif.setDeleted("active");
        
        return penaltyTarifRepository.save(penaltyTarif);
    }

    // Get statistics
    public PenaltyTarifStatistics getPenaltyTarifStatistics() {
        long totalActive = penaltyTarifRepository.countActive();
        long totalDeleted = penaltyTarifRepository.countDeleted();
        long totalAll = totalActive + totalDeleted;
        
        return new PenaltyTarifStatistics(totalAll, totalActive, totalDeleted);
    }

    // Helper method to check if penalty tarif exists
    public boolean penaltyTarifExists(Integer id) {
        return penaltyTarifRepository.existsById(id);
    }

    // Helper method to get active penalty tarifs only
    public List<BillingPenaltyTarif> getActivePenaltyTarifs() {
        return penaltyTarifRepository.findAllActive();
    }

    // Statistics inner class
    public static class PenaltyTarifStatistics {
        private long total;
        private long active;
        private long deleted;

        public PenaltyTarifStatistics(long total, long active, long deleted) {
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
