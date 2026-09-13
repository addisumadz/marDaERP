package com.wbill.home.service;

import com.wbill.home.model.UserRole;
import com.wbill.home.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserRoleService {

    @Autowired
    private UserRoleRepository repository;

    public List<UserRole> getAll() { return repository.findAll(); }

    public Page<UserRole> getByDeleted(String status, Pageable pageable) {
        return repository.findByDeletedWithPagination(status, pageable);
    }

    public Optional<UserRole> getById(Integer id) { return repository.findById(id); }

    public UserRole create(UserRole role) {
        // Defaults
        if (role.getStatus() == null || role.getStatus().isEmpty()) role.setStatus("active");
        if (role.getDeleted() == null || role.getDeleted().isEmpty()) role.setDeleted("active");
        // Business rule: isMedical must always be false (0)
        role.setIsMedical(false);
        // Uniqueness check for roleCode (optional but recommended)
        if (repository.existsByRoleCode(role.getRoleCode())) {
            throw new RuntimeException("Role code already exists: " + role.getRoleCode());
        }
        return repository.save(role);
    }

    public UserRole update(Integer id, UserRole newData) {
        UserRole existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("UserRole not found with id: " + id));
        // Uniqueness check if roleCode changes
        if (!existing.getRoleCode().equals(newData.getRoleCode()) && repository.existsByRoleCodeAndIdNot(newData.getRoleCode(), id)) {
            throw new RuntimeException("Role code already exists: " + newData.getRoleCode());
        }
        existing.setRoleCode(newData.getRoleCode());
        existing.setRoleName(newData.getRoleName());
        existing.setIsStore(newData.getIsStore());
        existing.setIsFormanExpert(newData.getIsFormanExpert());
        existing.setIsWaterMeterReader(newData.getIsWaterMeterReader());
        // Enforce rule: isMedical always false
        existing.setIsMedical(false);
        // Keep deleted/status unless you want to allow changing here
        return repository.save(existing);
    }

    public UserRole deactivate(Integer id) {
        UserRole existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("UserRole not found with id: " + id));
        existing.setDeleted("deleted");
        existing.setStatus("deactivated");
        return repository.save(existing);
    }

    public UserRole activate(Integer id) {
        UserRole existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("UserRole not found with id: " + id));
        existing.setDeleted("active");
        existing.setStatus("active");
        return repository.save(existing);
    }

    public UserRoleStatistics getStatistics() {
        long active = repository.countActive();
        long deleted = repository.countDeleted();
        long total = active + deleted;
        return new UserRoleStatistics(total, active, deleted);
    }

    public static class UserRoleStatistics {
        private long total;
        private long active;
        private long deleted;

        public UserRoleStatistics(long total, long active, long deleted) {
            this.total = total; this.active = active; this.deleted = deleted;
        }
        public long getTotal() { return total; }
        public long getActive() { return active; }
        public long getDeleted() { return deleted; }
    }
}
