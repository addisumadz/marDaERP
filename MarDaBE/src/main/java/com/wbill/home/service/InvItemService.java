package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class InvItemService {

    @Autowired
    private InvItemRepository repository;

    @Autowired
    private InvItemCategoryRepository categoryRepository;

    @Autowired
    private InvItemGroupRepository groupRepository;

    @Autowired
    private InvUnitOfMeasureRepository uomRepository;

    @Autowired
    private InvStockService stockService;

    public List<InvItem> getAllActive() {
        return repository.findByDeletedAndIsActiveOrderByItemCodeAsc("No", true);
    }

    public Page<InvItem> getAllPaged(int page, int size) {
        return repository.findByDeleted("No", PageRequest.of(page, size, Sort.by("itemCode").ascending()));
    }

    public Page<InvItem> getByCategoryPaged(int categoryId, int page, int size) {
        return repository.findByCategoryIdAndDeleted(categoryId, "No", PageRequest.of(page, size, Sort.by("itemCode").ascending()));
    }

    public Page<InvItem> search(String search, int page, int size) {
        return repository.searchItems(search, PageRequest.of(page, size));
    }

    public Optional<InvItem> getById(long id) {
        return repository.findById(id).filter(i -> "No".equals(i.getDeleted()));
    }

    /**
     * Creates an item with auto-generated item code: categoryCode + incremental number.
     * Example: PIPE-00001, CHEM-00002
     */
    public InvItem create(InvItem item, int categoryId, Integer groupId, int uomId, String username) {
        InvItemCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        item.setCategory(category);

        // Auto-generate item code from category code
        String itemCode = stockService.generateItemCode(category.getCategoryCode());
        item.setItemCode(itemCode);

        // Inherit tracking type from category
        item.setTrackingType(category.getTrackingType());

        if (groupId != null) {
            InvItemGroup group = groupRepository.findById(groupId)
                    .orElseThrow(() -> new IllegalArgumentException("Item group not found"));
            item.setItemGroup(group);
        }

        InvUnitOfMeasure uom = uomRepository.findById(uomId)
                .orElseThrow(() -> new IllegalArgumentException("Unit of measure not found"));
        item.setUnitOfMeasure(uom);

        item.setCreatedBy(username);
        item.setDeleted("No");
        return repository.save(item);
    }

    public InvItem update(long id, InvItem dto, int categoryId, Integer groupId, int uomId) {
        InvItem existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        InvItemCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        existing.setCategory(category);
        existing.setTrackingType(category.getTrackingType());

        if (groupId != null) {
            existing.setItemGroup(groupRepository.findById(groupId).orElse(null));
        } else {
            existing.setItemGroup(null);
        }

        InvUnitOfMeasure uom = uomRepository.findById(uomId)
                .orElseThrow(() -> new IllegalArgumentException("UOM not found"));
        existing.setUnitOfMeasure(uom);

        existing.setItemName(dto.getItemName());
        existing.setItemNameAm(dto.getItemNameAm());
        existing.setDescription(dto.getDescription());
        existing.setReorderLevel(dto.getReorderLevel());
        existing.setReorderQuantity(dto.getReorderQuantity());
        existing.setItemUsage(dto.getItemUsage());
        existing.setDefaultUnitCost(dto.getDefaultUnitCost());
        existing.setIsActive(dto.getIsActive());
        return repository.save(existing);
    }

    public void softDelete(long id) {
        InvItem item = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        item.setDeleted("Yes");
        repository.save(item);
    }

    public List<InvItem> getLowStockItems() {
        return repository.findLowStockItems();
    }
}
