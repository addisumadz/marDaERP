package com.wbill.home.service;

import com.wbill.home.model.FncBillingAccountMap;
import com.wbill.home.repository.FncBillingAccountMapRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FncBillingAccountMapService {

    @Autowired
    private FncBillingAccountMapRepository repository;

    public List<FncBillingAccountMap> getAllMappings() {
        return repository.findAll();
    }

    @Transactional
    public List<FncBillingAccountMap> saveMappings(List<FncBillingAccountMap> mappings) {
        for (FncBillingAccountMap incoming : mappings) {
            Optional<FncBillingAccountMap> existing = repository.findByMappingKey(incoming.getMappingKey());
            if (existing.isPresent()) {
                FncBillingAccountMap entity = existing.get();
                entity.setAccountId(incoming.getAccountId());
                entity.setLabel(incoming.getLabel());
                repository.save(entity);
            } else {
                repository.save(incoming);
            }
        }
        return repository.findAll();
    }
}
