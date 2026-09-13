package com.wbill.home.service;

import com.wbill.home.model.InvUnitOfMeasure;
import com.wbill.home.repository.InvUnitOfMeasureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class InvUnitOfMeasureService {

    @Autowired
    private InvUnitOfMeasureRepository repository;

    public List<InvUnitOfMeasure> getAllActive() {
        return repository.findByDeletedAndIsActiveOrderByUnitCodeAsc("No", true);
    }

    public List<InvUnitOfMeasure> getAll() {
        return repository.findByDeletedOrderByUnitCodeAsc("No");
    }

    public Page<InvUnitOfMeasure> getAllPaged(int page, int size) {
        return repository.findByDeleted("No", PageRequest.of(page, size, Sort.by("unitCode").ascending()));
    }

    public Optional<InvUnitOfMeasure> getById(int id) {
        return repository.findById(id).filter(u -> "No".equals(u.getDeleted()));
    }

    public InvUnitOfMeasure create(InvUnitOfMeasure unit, String username) {
        if (repository.existsByUnitCode(unit.getUnitCode())) {
            throw new IllegalArgumentException("Unit code '" + unit.getUnitCode() + "' already exists");
        }
        unit.setCreatedBy(username);
        unit.setDeleted("No");
        return repository.save(unit);
    }

    public InvUnitOfMeasure update(int id, InvUnitOfMeasure dto, String username) {
        InvUnitOfMeasure existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Unit not found with id: " + id));
        // Check code uniqueness if changed
        if (!existing.getUnitCode().equals(dto.getUnitCode()) && repository.existsByUnitCode(dto.getUnitCode())) {
            throw new IllegalArgumentException("Unit code '" + dto.getUnitCode() + "' already exists");
        }
        existing.setUnitCode(dto.getUnitCode());
        existing.setUnitName(dto.getUnitName());
        existing.setUnitNameAm(dto.getUnitNameAm());
        existing.setIsActive(dto.getIsActive());
        return repository.save(existing);
    }

    public void softDelete(int id) {
        InvUnitOfMeasure unit = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Unit not found"));
        unit.setDeleted("Yes");
        repository.save(unit);
    }

    public void toggleActive(int id) {
        InvUnitOfMeasure unit = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Unit not found"));
        unit.setIsActive(!unit.getIsActive());
        repository.save(unit);
    }
}
