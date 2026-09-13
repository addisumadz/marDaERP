package com.wbill.home.service;

import com.wbill.home.model.BillingCompanyInformation;
import com.wbill.home.repository.BillingCompanyInformationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BillingCompanyInformationService {

    @Autowired
    private BillingCompanyInformationRepository repository;

    public List<BillingCompanyInformation> getAll() {
        // return all; frontend will filter by status
        return repository.findAll();
    }

    public Page<BillingCompanyInformation> getByStatus(String status, Pageable pageable) {
        return repository.findByStatusWithPagination(status, pageable);
    }

    public Optional<BillingCompanyInformation> getById(Integer id) {
        return repository.findById(id);
    }

    public BillingCompanyInformation create(BillingCompanyInformation entity) {
        // default status to active if not provided
        if (entity.getStatus() == null || entity.getStatus().trim().isEmpty()) {
            entity.setStatus("active");
        }
        return repository.save(entity);
    }

    public BillingCompanyInformation update(Integer id, BillingCompanyInformation newData) {
        Optional<BillingCompanyInformation> existingOpt = repository.findById(id);
        if (!existingOpt.isPresent()) {
            throw new RuntimeException("Company information not found with id: " + id);
        }
        BillingCompanyInformation existing = existingOpt.get();

        existing.setCompanyName(newData.getCompanyName());
        existing.setCompanyLogo(newData.getCompanyLogo());
        existing.setMotto(newData.getMotto());
        existing.setMessage(newData.getMessage());
        existing.setAdditionalInformation(newData.getAdditionalInformation());
        existing.setGenzebSebsabe(newData.getGenzebSebsabe());
        existing.setDeresegnYemiaregagt(newData.getDeresegnYemiaregagt());
        existing.setDeresegnSebsabiLabel(newData.getDeresegnSebsabiLabel());
        existing.setDeresegnYemiaregagtLabel(newData.getDeresegnYemiaregagtLabel());
        existing.setYeteganenePercent(newData.getYeteganenePercent());
        // keep status unchanged during general update unless explicitly set by activate/deactivate endpoints

        return repository.save(existing);
    }

    public BillingCompanyInformation deactivate(Integer id) {
        Optional<BillingCompanyInformation> opt = repository.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Company information not found with id: " + id);
        }
        BillingCompanyInformation entity = opt.get();
        entity.setStatus("deleted");
        return repository.save(entity);
    }

    public BillingCompanyInformation activate(Integer id) {
        Optional<BillingCompanyInformation> opt = repository.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Company information not found with id: " + id);
        }
        BillingCompanyInformation entity = opt.get();
        entity.setStatus("active");
        return repository.save(entity);
    }

    public CompanyInfoStatistics getStatistics() {
        long active = repository.countActive();
        long deleted = repository.countDeleted();
        long total = active + deleted;
        return new CompanyInfoStatistics(total, active, deleted);
    }

    public static class CompanyInfoStatistics {
        private long total;
        private long active;
        private long deleted;

        public CompanyInfoStatistics(long total, long active, long deleted) {
            this.total = total;
            this.active = active;
            this.deleted = deleted;
        }

        public long getTotal() { return total; }
        public long getActive() { return active; }
        public long getDeleted() { return deleted; }
    }
}
