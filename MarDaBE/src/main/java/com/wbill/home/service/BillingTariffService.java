package com.wbill.home.service;

import com.wbill.home.model.BillingCustomerType;
import com.wbill.home.model.BillingTariff;
import com.wbill.home.repository.BillingCustomerTypeRepository;
import com.wbill.home.repository.BillingTariffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BillingTariffService {

    @Autowired
    private BillingTariffRepository tariffRepository;

    @Autowired
    private BillingCustomerTypeRepository customerTypeRepository;

    // Get all tariffs with fallback strategy
    public List<BillingTariff> getAllTariffs() {
        try {
            List<BillingTariff> tariffs = tariffRepository.findAllTariffs();
            if (tariffs.isEmpty()) {
                tariffs = tariffRepository.findAllActive();
            }
            if (tariffs.isEmpty()) {
                tariffs = tariffRepository.findAll();
            }
            return tariffs;
        } catch (Exception e) {
            return tariffRepository.findAll();
        }
    }

    // Get tariffs by status with pagination
    public Page<BillingTariff> getTariffsByStatus(String status, Pageable pageable) {
        return tariffRepository.findByStatusWithPagination(status, pageable);
    }

    // Get by ID
    public Optional<BillingTariff> getTariffById(Integer id) {
        return tariffRepository.findById(id);
    }

    // Create
    public BillingTariff createTariff(BillingTariff tariff) {
        // Validate customer type exists and is active
        Optional<BillingCustomerType> customerTypeOpt = customerTypeRepository
                .findById(tariff.getBillingCustomerType().getId());
        if (!customerTypeOpt.isPresent()) {
            throw new RuntimeException("Customer type not found");
        }
        BillingCustomerType customerType = customerTypeOpt.get();
        if (!"active".equals(customerType.getDeleted())) {
            throw new RuntimeException("Customer type is not active");
        }

        // Uniqueness: block name per customer type (only check active tariffs)
        if (tariffRepository.existsByBillingCustomerTypeIdAndBlockNameAndStatus(customerType.getId(),
                tariff.getBlockName(), "active")) {
            throw new RuntimeException("Tariff block name already exists for this customer type");
        }

        // Defaults
        tariff.setBillingCustomerType(customerType);
        tariff.setStatus("active");

        return tariffRepository.save(tariff);
    }

    // Update
    public BillingTariff updateTariff(Integer id, BillingTariff updatedTariff) {
        Optional<BillingTariff> existingOpt = tariffRepository.findById(id);
        if (!existingOpt.isPresent()) {
            throw new RuntimeException("Tariff not found with id: " + id);
        }

        // Validate customer type
        Optional<BillingCustomerType> customerTypeOpt = customerTypeRepository
                .findById(updatedTariff.getBillingCustomerType().getId());
        if (!customerTypeOpt.isPresent()) {
            throw new RuntimeException("Customer type not found");
        }
        BillingCustomerType customerType = customerTypeOpt.get();
        if (!"active".equals(customerType.getDeleted())) {
            throw new RuntimeException("Customer type is not active");
        }

        // Uniqueness on update (only check active tariffs, exclude self)
        if (tariffRepository.existsByBillingCustomerTypeIdAndBlockNameAndIdNotAndStatus(
                customerType.getId(), updatedTariff.getBlockName(), id, "active")) {
            throw new RuntimeException("Tariff block name already exists for this customer type");
        }

        BillingTariff existing = existingOpt.get();
        existing.setBillingCustomerType(customerType);
        existing.setBlockName(updatedTariff.getBlockName());
        existing.setConsumption(updatedTariff.getConsumption());
        existing.setTarrifBirr(updatedTariff.getTarrifBirr());
        existing.setIsLast(updatedTariff.getIsLast());

        return tariffRepository.save(existing);
    }

    // Deactivate (soft delete)
    public BillingTariff deactivateTariff(Integer id) {
        Optional<BillingTariff> tariffOpt = tariffRepository.findById(id);
        if (!tariffOpt.isPresent()) {
            throw new RuntimeException("Tariff not found with id: " + id);
        }
        BillingTariff tariff = tariffOpt.get();
        tariff.setStatus("deleted");
        return tariffRepository.save(tariff);
    }

    // Activate
    public BillingTariff activateTariff(Integer id) {
        Optional<BillingTariff> tariffOpt = tariffRepository.findById(id);
        if (!tariffOpt.isPresent()) {
            throw new RuntimeException("Tariff not found with id: " + id);
        }
        BillingTariff tariff = tariffOpt.get();
        tariff.setStatus("active");
        return tariffRepository.save(tariff);
    }

    // Stats
    public TariffStatistics getTariffStatistics() {
        long active = tariffRepository.countActive();
        long deleted = tariffRepository.countDeleted();
        long total = active + deleted;
        return new TariffStatistics(total, active, deleted);
    }

    public static class TariffStatistics {
        private long total;
        private long active;
        private long deleted;

        public TariffStatistics(long total, long active, long deleted) {
            this.total = total;
            this.active = active;
            this.deleted = deleted;
        }

        public long getTotal() {
            return total;
        }

        public long getActive() {
            return active;
        }

        public long getDeleted() {
            return deleted;
        }
    }
}
