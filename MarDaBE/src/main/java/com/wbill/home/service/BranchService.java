package com.wbill.home.service;

import com.wbill.home.model.AddressStreets;
import com.wbill.home.model.Branch;
import com.wbill.home.repository.AddressStreetsRepository;
import com.wbill.home.repository.BranchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BranchService {

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private AddressStreetsRepository addressStreetsRepository;

    public List<Branch> getAll() {
        return branchRepository.findAll();
    }

    public Page<Branch> getByStatus(String status, Pageable pageable) {
        return branchRepository.findByDeletedWithPagination(status, pageable);
    }

    public Optional<Branch> getById(Integer id) {
        return branchRepository.findById(id);
    }

    public Branch create(Branch branch) {
        if (branch.getDeleted() == null || branch.getDeleted().trim().isEmpty()) {
            branch.setDeleted("active");
        }
        return branchRepository.save(branch);
    }

    public Branch update(Integer id, Branch newData) {
        Branch existing = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));

        existing.setBranchCode(newData.getBranchCode());
        existing.setBranchDescription(newData.getBranchDescription());
        existing.setOfficeLevel(newData.getOfficeLevel());
        existing.setAboutOffice(newData.getAboutOffice());
        existing.setBranchKebele(newData.getBranchKebele());
        // keep deleted unchanged here; use activate/deactivate to manage it
        return branchRepository.save(existing);
    }

    public Branch deactivate(Integer id) {
        Branch existing = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));
        existing.setDeleted("deleted");
        return branchRepository.save(existing);
    }

    public Branch activate(Integer id) {
        Branch existing = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));
        existing.setDeleted("active");
        return branchRepository.save(existing);
    }

    public Branch resolveAndAttachKebele(Branch branch, Integer kebeleId) {
        AddressStreets kebele = addressStreetsRepository.findById(kebeleId)
                .orElseThrow(() -> new RuntimeException("Kebele (AddressStreets) not found with id: " + kebeleId));
        branch.setBranchKebele(kebele);
        return branch;
    }

    public BranchStatistics getStatistics() {
        long active = branchRepository.countActive();
        long deleted = branchRepository.countDeleted();
        long total = active + deleted;
        return new BranchStatistics(total, active, deleted);
    }

    public static class BranchStatistics {
        private long total;
        private long active;
        private long deleted;

        public BranchStatistics(long total, long active, long deleted) {
            this.total = total;
            this.active = active;
            this.deleted = deleted;
        }

        public long getTotal() { return total; }
        public long getActive() { return active; }
        public long getDeleted() { return deleted; }
    }
}
