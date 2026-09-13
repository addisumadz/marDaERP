package com.wbill.home.service;

import com.wbill.home.model.BillingBanks;
import com.wbill.home.repository.BillingBanksRepository;

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
public class BillingBanksService {

    @Autowired
    private BillingBanksRepository billingBanksRepository;

    // Get all banks (both active and deleted for frontend categorization)
    public List<BillingBanks> getAllBillingBanks() {
        try {
            // First attempt: get all banks
            List<BillingBanks> allBanks = billingBanksRepository.findAllBanks();
            //System.out.println("All banks count: " + allBanks.size());
            return allBanks;
        } catch (Exception e) {
            System.err.println("Error in getAllBillingBanks: " + e.getMessage());
            // Fallback: get active banks only
            try {
                List<BillingBanks> activeBanks = billingBanksRepository.findAllActive();
                System.out.println("Active banks fallback count: " + activeBanks.size());
                return activeBanks;
            } catch (Exception e2) {
                System.err.println("Error in fallback getAllBillingBanks: " + e2.getMessage());
                // Final fallback: return all from findAll
                return billingBanksRepository.findAll();
            }
        }
    }

    // Get banks by status with pagination
    public Page<BillingBanks> getBillingBanksByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("bankName").ascending());
        
        if ("ACTIVE".equalsIgnoreCase(status)) {
            return billingBanksRepository.findAllActiveWithPagination(pageable);
        } else if ("DELETED".equalsIgnoreCase(status)) {
            return billingBanksRepository.findAllDeleted(pageable);
        } else {
            return billingBanksRepository.findByDeleted(status.toLowerCase(), pageable);
        }
    }

    // Get bank by ID
    public Optional<BillingBanks> getBillingBankById(Integer id) {
        return billingBanksRepository.findById(id);
    }

    // Create new bank
    public BillingBanks createBillingBank(BillingBanks billingBank) {
        // Validation
        validateBillingBank(billingBank, null);

        // Set default values
        billingBank.setDeleted("active");
        billingBank.setTotalYetekefeleReport(0.0);
        billingBank.setTotalTekefayReport(0.0);

        return billingBanksRepository.save(billingBank);
    }

    // Update existing bank
    public BillingBanks updateBillingBank(Integer id, BillingBanks updatedBank) {
        Optional<BillingBanks> existingBankOpt = billingBanksRepository.findById(id);
        
        if (!existingBankOpt.isPresent()) {
            throw new RuntimeException("Billing Bank not found with id: " + id);
        }

        BillingBanks existingBank = existingBankOpt.get();
        
        // Validation
        validateBillingBank(updatedBank, id);

        // Update fields (excluding totalYetekefeleReport and totalTekefayReport as requested)
        existingBank.setGatewayCode(updatedBank.getGatewayCode());
        existingBank.setBankCode(updatedBank.getBankCode());
        existingBank.setBankName(updatedBank.getBankName());
        existingBank.setBankColor(updatedBank.getBankColor());

        return billingBanksRepository.save(existingBank);
    }

    // Soft delete (deactivate) bank
    public BillingBanks deactivateBillingBank(Integer id, String remark) {
        Optional<BillingBanks> bankOpt = billingBanksRepository.findById(id);
        
        if (!bankOpt.isPresent()) {
            throw new RuntimeException("Billing Bank not found with id: " + id);
        }

        BillingBanks bank = bankOpt.get();
        bank.setDeleted("deleted");

        return billingBanksRepository.save(bank);
    }

    // Activate bank
    public BillingBanks activateBillingBank(Integer id) {
        Optional<BillingBanks> bankOpt = billingBanksRepository.findById(id);
        
        if (!bankOpt.isPresent()) {
            throw new RuntimeException("Billing Bank not found with id: " + id);
        }

        BillingBanks bank = bankOpt.get();
        bank.setDeleted("active");

        return billingBanksRepository.save(bank);
    }

    // Helper method for validation
    private void validateBillingBank(BillingBanks bank, Integer excludeId) {
        if (bank.getGatewayCode() == null || bank.getGatewayCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Gateway code is required");
        }

        if (bank.getBankCode() == null || bank.getBankCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Bank code is required");
        }

        if (bank.getBankName() == null || bank.getBankName().trim().isEmpty()) {
            throw new IllegalArgumentException("Bank name is required");
        }

        if (bank.getBankColor() == null || bank.getBankColor().trim().isEmpty()) {
            throw new IllegalArgumentException("Bank color is required");
        }

        // Only check for duplicates during creation (excludeId is null)
        if (excludeId == null) {
            if (billingBanksRepository.existsByGatewayCode(bank.getGatewayCode())) {
                throw new IllegalArgumentException("Gateway code already exists");
            }
            if (billingBanksRepository.existsByBankCode(bank.getBankCode())) {
                throw new IllegalArgumentException("Bank code already exists");
            }
            if (billingBanksRepository.existsByBankName(bank.getBankName())) {
                throw new IllegalArgumentException("Bank name already exists");
            }
        }
        // Skip duplicate validation during updates
    }

    // Get bank statistics
    public BankStatistics getBankStatistics() {
        Long activeCount = billingBanksRepository.countActiveBanks();
        Long deletedCount = billingBanksRepository.countDeletedBanks();
        
        return new BankStatistics(
            activeCount != null ? activeCount : 0L,
            deletedCount != null ? deletedCount : 0L
        );
    }

    // Inner class for statistics
    public static class BankStatistics {
        private Long activeBanks;
        private Long deletedBanks;

        public BankStatistics(Long activeBanks, Long deletedBanks) {
            this.activeBanks = activeBanks;
            this.deletedBanks = deletedBanks;
        }

        public Long getActiveBanks() {
            return activeBanks;
        }

        public void setActiveBanks(Long activeBanks) {
            this.activeBanks = activeBanks;
        }

        public Long getDeletedBanks() {
            return deletedBanks;
        }

        public void setDeletedBanks(Long deletedBanks) {
            this.deletedBanks = deletedBanks;
        }
    }
}
