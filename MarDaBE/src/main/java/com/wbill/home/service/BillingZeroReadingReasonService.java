package com.wbill.home.service;

import com.wbill.home.model.BillingZeroReadingReason;
import com.wbill.home.repository.BillingZeroReadingReasonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BillingZeroReadingReasonService {

    @Autowired
    private BillingZeroReadingReasonRepository repository;

    // Get all with fallback similar to meter sizes
    public List<BillingZeroReadingReason> getAllReasons() {
        try {
            List<BillingZeroReadingReason> list = repository.findAllReasons();
            if (list.isEmpty()) {
                list = repository.findAllActive();
            }
            if (list.isEmpty()) {
                list = repository.findAll();
            }
            return list;
        } catch (Exception e) {
            return repository.findAll();
        }
    }

    public Page<BillingZeroReadingReason> getReasonsByStatus(String status, Pageable pageable) {
        return repository.findByDeletedWithPagination(status, pageable);
    }

    public Optional<BillingZeroReadingReason> getReasonById(Integer id) {
        return repository.findById(id);
    }

    public BillingZeroReadingReason createReason(BillingZeroReadingReason reason) {
        // Uniqueness checks (by code or name)
        if (repository.existsByReasonCode(reason.getReasonCode())) {
            throw new RuntimeException("Reason with this code already exists");
        }
        if (repository.existsByReasonName(reason.getReasonName())) {
            throw new RuntimeException("Reason with this name already exists");
        }

        // Defaults for other attributes
        applyDefaults(reason);
        reason.setDeleted("active");

        return repository.save(reason);
    }

    public BillingZeroReadingReason updateReason(Integer id, BillingZeroReadingReason newData) {
        Optional<BillingZeroReadingReason> existingOpt = repository.findById(id);
        if (!existingOpt.isPresent()) {
            throw new RuntimeException("Zero reading reason not found with id: " + id);
        }
        BillingZeroReadingReason existing = existingOpt.get();

        // Update only allowed fields
        existing.setReasonCode(newData.getReasonCode());
        existing.setReasonName(newData.getReasonName());
        existing.setIsZeroReadingReason(newData.getIsZeroReadingReason());
        existing.setIsDoorCloseReason(newData.getIsDoorCloseReason());

        // Keep others at 0/false
        keepOthersZero(existing);

        return repository.save(existing);
    }

    public BillingZeroReadingReason deactivateReason(Integer id) {
        Optional<BillingZeroReadingReason> opt = repository.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Zero reading reason not found with id: " + id);
        }
        BillingZeroReadingReason entity = opt.get();
        entity.setDeleted("deleted");
        return repository.save(entity);
    }

    public BillingZeroReadingReason activateReason(Integer id) {
        Optional<BillingZeroReadingReason> opt = repository.findById(id);
        if (!opt.isPresent()) {
            throw new RuntimeException("Zero reading reason not found with id: " + id);
        }
        BillingZeroReadingReason entity = opt.get();
        entity.setDeleted("active");
        return repository.save(entity);
    }

    public ReasonStatistics getReasonStatistics() {
        long active = repository.countActive();
        long deleted = repository.countDeleted();
        long total = active + deleted;
        return new ReasonStatistics(total, active, deleted);
    }

    public boolean exists(Integer id) {
        return repository.existsById(id);
    }

    private void applyDefaults(BillingZeroReadingReason r) {
        // Only these are allowed to be set externally: reasonCode, reasonName, isZeroReadingReason, isDoorCloseReason, deleted
        // Force other fields to 0/false/null as appropriate
        if (r.getOldReasonCode() != null && !r.getOldReasonCode().isEmpty()) {
            // allowed to be set? Requirement says keep others to 0; so null it
            r.setOldReasonCode(null);
        }
        r.setIsKotariKiray(false);
        r.setIsUnderReadReason(false);
        r.setIsOldReasons(false);
        r.setTempStatics(0);
    }

    private void keepOthersZero(BillingZeroReadingReason r) {
        r.setIsKotariKiray(false);
        r.setIsUnderReadReason(false);
        r.setIsOldReasons(false);
        r.setTempStatics(0);
        r.setOldReasonCode(null);
    }

    public static class ReasonStatistics {
        private long total;
        private long active;
        private long deleted;

        public ReasonStatistics(long total, long active, long deleted) {
            this.total = total;
            this.active = active;
            this.deleted = deleted;
        }

        public long getTotal() { return total; }
        public long getActive() { return active; }
        public long getDeleted() { return deleted; }
    }
}
