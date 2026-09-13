package com.wbill.home.service;

import com.wbill.home.model.InvStore;
import com.wbill.home.model.InvStoreUser;
import com.wbill.home.model.UserAccount;
import com.wbill.home.repository.InvStoreRepository;
import com.wbill.home.repository.InvStoreUserRepository;
import com.wbill.home.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InvStoreUserService {

    @Autowired
    private InvStoreUserRepository storeUserRepo;

    @Autowired
    private InvStoreRepository storeRepo;

    @Autowired
    private UserAccountRepository userAccountRepo;

    public List<InvStoreUser> getAll() {
        return storeUserRepo.findAllOrdered();
    }

    public List<InvStoreUser> getByStoreId(int storeId) {
        return storeUserRepo.findByStoreId(storeId);
    }

    public List<InvStoreUser> getByUserAccountId(int userAccountId) {
        return storeUserRepo.findByUserAccountId(userAccountId);
    }

    public List<InvStoreUser> getActiveStoresForUser(String username) {
        return storeUserRepo.findActiveStoresByUsername(username);
    }

    @Transactional
    public InvStoreUser assignUserToStore(int storeId, int userAccountId, String roleInStore,
                                          boolean isPrimary, String notes, String assignedBy) {
        InvStore store = storeRepo.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found with id: " + storeId));

        UserAccount user = userAccountRepo.findById(userAccountId)
                .orElseThrow(() -> new IllegalArgumentException("User account not found with id: " + userAccountId));

        // Check if already assigned
        Optional<InvStoreUser> existing = storeUserRepo.findByStoreIdAndUserAccountId(storeId, userAccountId);
        InvStoreUser storeUser;
        if (existing.isPresent()) {
            storeUser = existing.get();
            storeUser.setIsActive(true);
            storeUser.setRoleInStore(roleInStore != null ? roleInStore : "STORE_KEEPER");
            storeUser.setIsPrimary(isPrimary);
            storeUser.setNotes(notes);
            storeUser.setAssignedBy(assignedBy);
            storeUser.setAssignedDate(LocalDateTime.now());
        } else {
            storeUser = new InvStoreUser();
            storeUser.setStore(store);
            storeUser.setUserAccount(user);
            storeUser.setRoleInStore(roleInStore != null ? roleInStore : "STORE_KEEPER");
            storeUser.setIsPrimary(isPrimary);
            storeUser.setIsActive(true);
            storeUser.setNotes(notes);
            storeUser.setAssignedBy(assignedBy);
            storeUser.setAssignedDate(LocalDateTime.now());
        }

        // If primary store keeper, keep inv_store.store_keeper_id synchronized
        if (isPrimary || "STORE_KEEPER".equalsIgnoreCase(roleInStore)) {
            store.setStoreKeeper(user);
            storeRepo.save(store);
        } else if ("STORE_MANAGER".equalsIgnoreCase(roleInStore)) {
            store.setManager(user);
            storeRepo.save(store);
        }

        return storeUserRepo.save(storeUser);
    }

    @Transactional
    public InvStoreUser updateAssignment(int id, String roleInStore, Boolean isPrimary,
                                         Boolean isActive, String notes) {
        InvStoreUser storeUser = storeUserRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Store user assignment not found with id: " + id));

        if (roleInStore != null) {
            storeUser.setRoleInStore(roleInStore);
        }
        if (isPrimary != null) {
            storeUser.setIsPrimary(isPrimary);
            if (isPrimary && storeUser.getStore() != null && storeUser.getUserAccount() != null) {
                storeUser.getStore().setStoreKeeper(storeUser.getUserAccount());
                storeRepo.save(storeUser.getStore());
            }
        }
        if (isActive != null) {
            storeUser.setIsActive(isActive);
        }
        if (notes != null) {
            storeUser.setNotes(notes);
        }

        return storeUserRepo.save(storeUser);
    }

    @Transactional
    public void deleteAssignment(int id) {
        if (!storeUserRepo.existsById(id)) {
            throw new IllegalArgumentException("Store user assignment not found with id: " + id);
        }
        storeUserRepo.deleteById(id);
    }
}
