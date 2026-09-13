package com.wbill.home.service;

import com.wbill.home.model.InvItemGroup;
import com.wbill.home.model.InvItemCategory;
import com.wbill.home.repository.InvItemGroupRepository;
import com.wbill.home.repository.InvItemCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class InvItemGroupService {

    @Autowired
    private InvItemGroupRepository repository;

    @Autowired
    private InvItemCategoryRepository categoryRepository;

    public List<InvItemGroup> getAllActive() {
        return repository.findByDeletedAndIsActiveOrderByGroupCodeAsc("No", true);
    }

    public List<InvItemGroup> getActiveByCategory(int categoryId) {
        return repository.findByCategoryIdAndDeletedAndIsActiveOrderByGroupCodeAsc(categoryId, "No", true);
    }

    public Page<InvItemGroup> getAllPaged(int page, int size) {
        return repository.findByDeleted("No", PageRequest.of(page, size, Sort.by("groupCode").ascending()));
    }

    public Page<InvItemGroup> getByCategoryPaged(int categoryId, int page, int size) {
        return repository.findByCategoryIdAndDeleted(categoryId, "No", PageRequest.of(page, size, Sort.by("groupCode").ascending()));
    }

    public Optional<InvItemGroup> getById(int id) {
        return repository.findById(id).filter(g -> "No".equals(g.getDeleted()));
    }

    public InvItemGroup create(InvItemGroup group, int categoryId, String username) {
        if (repository.existsByGroupCode(group.getGroupCode())) {
            throw new IllegalArgumentException("Group code '" + group.getGroupCode() + "' already exists");
        }
        InvItemCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        group.setCategory(category);
        group.setCreatedBy(username);
        group.setDeleted("No");
        return repository.save(group);
    }

    public InvItemGroup update(int id, InvItemGroup dto, int categoryId) {
        InvItemGroup existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        if (!existing.getGroupCode().equals(dto.getGroupCode()) && repository.existsByGroupCode(dto.getGroupCode())) {
            throw new IllegalArgumentException("Group code already exists");
        }
        InvItemCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        existing.setCategory(category);
        existing.setGroupCode(dto.getGroupCode());
        existing.setGroupName(dto.getGroupName());
        existing.setGroupNameAm(dto.getGroupNameAm());
        existing.setIsActive(dto.getIsActive());
        return repository.save(existing);
    }

    public void softDelete(int id) {
        InvItemGroup group = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        group.setDeleted("Yes");
        repository.save(group);
    }
}
