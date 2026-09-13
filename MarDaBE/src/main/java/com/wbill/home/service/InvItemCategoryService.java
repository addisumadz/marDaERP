package com.wbill.home.service;

import com.wbill.home.model.InvItemCategory;
import com.wbill.home.repository.InvItemCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class InvItemCategoryService {

    @Autowired
    private InvItemCategoryRepository repository;

    public List<InvItemCategory> getAllActive() {
        return repository.findByDeletedAndIsActiveOrderByCategoryCodeAsc("No", true);
    }

    public List<InvItemCategory> getAll() {
        return repository.findByDeletedOrderByCategoryCodeAsc("No");
    }

    public Page<InvItemCategory> getAllPaged(int page, int size) {
        return repository.findByDeleted("No", PageRequest.of(page, size, Sort.by("categoryCode").ascending()));
    }

    public Optional<InvItemCategory> getById(int id) {
        return repository.findById(id).filter(c -> "No".equals(c.getDeleted()));
    }

    public InvItemCategory create(InvItemCategory category, String username) {
        if (repository.existsByCategoryCode(category.getCategoryCode())) {
            throw new IllegalArgumentException("Category code '" + category.getCategoryCode() + "' already exists");
        }
        category.setCreatedBy(username);
        category.setDeleted("No");
        return repository.save(category);
    }

    public InvItemCategory update(int id, InvItemCategory dto) {
        InvItemCategory existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
        if (!existing.getCategoryCode().equals(dto.getCategoryCode()) && repository.existsByCategoryCode(dto.getCategoryCode())) {
            throw new IllegalArgumentException("Category code '" + dto.getCategoryCode() + "' already exists");
        }
        existing.setCategoryCode(dto.getCategoryCode());
        existing.setCategoryName(dto.getCategoryName());
        existing.setCategoryNameAm(dto.getCategoryNameAm());
        existing.setDescription(dto.getDescription());
        existing.setItemType(dto.getItemType());
        existing.setTrackingType(dto.getTrackingType());
        existing.setIsActive(dto.getIsActive());
        return repository.save(existing);
    }

    public void softDelete(int id) {
        InvItemCategory cat = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        cat.setDeleted("Yes");
        repository.save(cat);
    }
}
