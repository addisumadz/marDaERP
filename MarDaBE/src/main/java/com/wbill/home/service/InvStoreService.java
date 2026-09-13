package com.wbill.home.service;

import com.wbill.home.model.InvStore;
import com.wbill.home.model.Branch;
import com.wbill.home.model.UserAccount;
import com.wbill.home.repository.InvStoreRepository;
import com.wbill.home.repository.BranchRepository;
import com.wbill.home.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class InvStoreService {

    @Autowired
    private InvStoreRepository repository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    public List<InvStore> getAllActive() {
        return repository.findByDeletedAndIsActiveOrderByStoreCodeAsc("No", true);
    }

    public List<InvStore> getAll() {
        return repository.findByDeletedOrderByStoreCodeAsc("No");
    }

    public Page<InvStore> getAllPaged(int page, int size) {
        return repository.findByDeleted("No", PageRequest.of(page, size, Sort.by("storeCode").ascending()));
    }

    public Optional<InvStore> getById(int id) {
        return repository.findById(id).filter(s -> "No".equals(s.getDeleted()));
    }

    public Optional<InvStore> getMainStore() {
        return repository.findByIsMainStoreTrue();
    }

    public Optional<InvStore> getByBranch(int branchId) {
        return repository.findByBranchId(branchId);
    }

    public InvStore create(InvStore store, Integer branchId, Integer storeKeeperId, Integer managerId, String username) {
        if (repository.existsByStoreCode(store.getStoreCode())) {
            throw new IllegalArgumentException("Store code '" + store.getStoreCode() + "' already exists");
        }
        if (branchId != null) {
            Branch branch = branchRepository.findById(branchId)
                    .orElseThrow(() -> new IllegalArgumentException("Branch not found"));
            store.setBranch(branch);
        }
        if (storeKeeperId != null) {
            UserAccount keeper = userAccountRepository.findById(storeKeeperId)
                    .orElseThrow(() -> new IllegalArgumentException("Store keeper not found"));
            store.setStoreKeeper(keeper);
        }
        if (managerId != null) {
            UserAccount manager = userAccountRepository.findById(managerId)
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
            store.setManager(manager);
        }
        store.setCreatedBy(username);
        store.setDeleted("No");
        return repository.save(store);
    }

    public InvStore update(int id, InvStore dto, Integer branchId, Integer storeKeeperId, Integer managerId) {
        InvStore existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        if (!existing.getStoreCode().equals(dto.getStoreCode()) && repository.existsByStoreCode(dto.getStoreCode())) {
            throw new IllegalArgumentException("Store code already exists");
        }
        existing.setStoreCode(dto.getStoreCode());
        existing.setStoreName(dto.getStoreName());
        existing.setStoreNameAm(dto.getStoreNameAm());
        existing.setIsMainStore(dto.getIsMainStore());
        existing.setLocation(dto.getLocation());
        existing.setIsActive(dto.getIsActive());

        if (branchId != null) {
            existing.setBranch(branchRepository.findById(branchId).orElse(null));
        }
        if (storeKeeperId != null) {
            existing.setStoreKeeper(userAccountRepository.findById(storeKeeperId).orElse(null));
        }
        if (managerId != null) {
            existing.setManager(userAccountRepository.findById(managerId).orElse(null));
        }
        return repository.save(existing);
    }

    public void softDelete(int id) {
        InvStore store = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Store not found"));
        store.setDeleted("Yes");
        repository.save(store);
    }
}
