package com.wbill.home.service;

import com.wbill.home.model.BillingCustomerType;
import com.wbill.home.repository.BillingCustomerTypeRepository;

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
public class BillingCustomerTypeService {

    @Autowired
    private BillingCustomerTypeRepository customerTypeRepository;

    // Get all customer types (both active and deleted for frontend categorization)
    public List<BillingCustomerType> getAllCustomerTypes() {
        try {
            // First attempt: get all customer types
            List<BillingCustomerType> allCustomerTypes = customerTypeRepository.findAllCustomerTypes();
            return allCustomerTypes;
        } catch (Exception e) {
            System.err.println("Error in getAllCustomerTypes: " + e.getMessage());
            // Fallback: get active customer types only
            try {
                List<BillingCustomerType> activeCustomerTypes = customerTypeRepository.findAllActive();
                return activeCustomerTypes;
            } catch (Exception e2) {
                System.err.println("Error in fallback getAllCustomerTypes: " + e2.getMessage());
                // Final fallback: return all from findAll
                return customerTypeRepository.findAll();
            }
        }
    }

    // Get customer types by status with pagination
    public Page<BillingCustomerType> getCustomerTypesByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("customerType").ascending());
        
        if ("ACTIVE".equalsIgnoreCase(status)) {
            return customerTypeRepository.findAllActiveWithPagination(pageable);
        } else if ("DELETED".equalsIgnoreCase(status)) {
            return customerTypeRepository.findAllDeleted(pageable);
        } else {
            return customerTypeRepository.findByDeleted(status.toLowerCase(), pageable);
        }
    }

    // Get customer type by ID
    public Optional<BillingCustomerType> getCustomerTypeById(Integer id) {
        return customerTypeRepository.findById(id);
    }

    // Create new customer type
    public BillingCustomerType createCustomerType(BillingCustomerType customerType) {
        // Validation
        validateCustomerType(customerType, null);

        // Set default values
        customerType.setDeleted("active");

        return customerTypeRepository.save(customerType);
    }

    // Update existing customer type
    public BillingCustomerType updateCustomerType(Integer id, BillingCustomerType updatedCustomerType) {
        Optional<BillingCustomerType> existingCustomerTypeOpt = customerTypeRepository.findById(id);
        
        if (!existingCustomerTypeOpt.isPresent()) {
            throw new RuntimeException("Customer Type not found with id: " + id);
        }

        BillingCustomerType existingCustomerType = existingCustomerTypeOpt.get();
        
        // Validation - skip duplicate validation during updates
        validateCustomerType(updatedCustomerType, id);

        // Update only the specified fields
        existingCustomerType.setCustomerType(updatedCustomerType.getCustomerType());
        existingCustomerType.setDescription(updatedCustomerType.getDescription());
        existingCustomerType.setTechemariKfya(updatedCustomerType.getTechemariKfya());

        return customerTypeRepository.save(existingCustomerType);
    }

    // Soft delete (deactivate) customer type
    public BillingCustomerType deactivateCustomerType(Integer id, String remark) {
        Optional<BillingCustomerType> customerTypeOpt = customerTypeRepository.findById(id);
        
        if (!customerTypeOpt.isPresent()) {
            throw new RuntimeException("Customer Type not found with id: " + id);
        }

        BillingCustomerType customerType = customerTypeOpt.get();
        customerType.setDeleted("deleted");

        return customerTypeRepository.save(customerType);
    }

    // Activate customer type
    public BillingCustomerType activateCustomerType(Integer id) {
        Optional<BillingCustomerType> customerTypeOpt = customerTypeRepository.findById(id);
        
        if (!customerTypeOpt.isPresent()) {
            throw new RuntimeException("Customer Type not found with id: " + id);
        }

        BillingCustomerType customerType = customerTypeOpt.get();
        customerType.setDeleted("active");

        return customerTypeRepository.save(customerType);
    }

    // Helper method for validation
    private void validateCustomerType(BillingCustomerType customerType, Integer excludeId) {
        if (customerType.getCustomerType() == null || customerType.getCustomerType().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer type is required");
        }

        if (customerType.getDescription() == null || customerType.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Description is required");
        }

        if (customerType.getTechemariKfya() < 0) {
            throw new IllegalArgumentException("Techemari Kfya must be a positive number");
        }

        // Only check for duplicates during creation (excludeId is null)
        if (excludeId == null) {
            if (customerTypeRepository.existsByCustomerType(customerType.getCustomerType())) {
                throw new IllegalArgumentException("Customer type already exists");
            }
            if (customerTypeRepository.existsByDescription(customerType.getDescription())) {
                throw new IllegalArgumentException("Description already exists");
            }
        }
        // Skip duplicate validation during updates
    }

    // Get customer type statistics
    public CustomerTypeStatistics getCustomerTypeStatistics() {
        Long activeCount = customerTypeRepository.countActiveCustomerTypes();
        Long deletedCount = customerTypeRepository.countDeletedCustomerTypes();
        
        return new CustomerTypeStatistics(
            activeCount != null ? activeCount : 0L,
            deletedCount != null ? deletedCount : 0L
        );
    }

    // Inner class for statistics
    public static class CustomerTypeStatistics {
        private Long activeCustomerTypes;
        private Long deletedCustomerTypes;

        public CustomerTypeStatistics(Long activeCustomerTypes, Long deletedCustomerTypes) {
            this.activeCustomerTypes = activeCustomerTypes;
            this.deletedCustomerTypes = deletedCustomerTypes;
        }

        public Long getActiveCustomerTypes() {
            return activeCustomerTypes;
        }

        public void setActiveCustomerTypes(Long activeCustomerTypes) {
            this.activeCustomerTypes = activeCustomerTypes;
        }

        public Long getDeletedCustomerTypes() {
            return deletedCustomerTypes;
        }

        public void setDeletedCustomerTypes(Long deletedCustomerTypes) {
            this.deletedCustomerTypes = deletedCustomerTypes;
        }
    }
}
