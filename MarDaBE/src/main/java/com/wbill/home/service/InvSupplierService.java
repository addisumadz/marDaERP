package com.wbill.home.service;

import com.wbill.home.model.InvSupplier;
import com.wbill.home.repository.InvSupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class InvSupplierService {

    @Autowired
    private InvSupplierRepository repository;

    public List<InvSupplier> getAllActive() {
        return repository.findByDeletedAndIsActiveOrderBySupplierNameAsc("No", true);
    }

    public Page<InvSupplier> getAllPaged(int page, int size) {
        return repository.findByDeleted("No", PageRequest.of(page, size, Sort.by("supplierName").ascending()));
    }

    public Page<InvSupplier> search(String search, int page, int size) {
        return repository.searchSuppliers(search, PageRequest.of(page, size));
    }

    public Optional<InvSupplier> getById(int id) {
        return repository.findById(id).filter(s -> "No".equals(s.getDeleted()));
    }

    public InvSupplier create(InvSupplier supplier, String username) {
        if (repository.existsBySupplierCode(supplier.getSupplierCode())) {
            throw new IllegalArgumentException("Supplier code '" + supplier.getSupplierCode() + "' already exists");
        }
        supplier.setCreatedBy(username);
        supplier.setDeleted("No");
        return repository.save(supplier);
    }

    public InvSupplier update(int id, InvSupplier dto) {
        InvSupplier existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
        if (!existing.getSupplierCode().equals(dto.getSupplierCode()) && repository.existsBySupplierCode(dto.getSupplierCode())) {
            throw new IllegalArgumentException("Supplier code already exists");
        }
        existing.setSupplierCode(dto.getSupplierCode());
        existing.setSupplierName(dto.getSupplierName());
        existing.setSupplierNameAm(dto.getSupplierNameAm());
        existing.setTin(dto.getTin());
        existing.setPhone(dto.getPhone());
        existing.setEmail(dto.getEmail());
        existing.setAddress(dto.getAddress());
        existing.setCity(dto.getCity());
        existing.setContactPerson(dto.getContactPerson());
        existing.setContactPhone(dto.getContactPhone());
        existing.setBankName(dto.getBankName());
        existing.setBankAccountNumber(dto.getBankAccountNumber());
        existing.setIsActive(dto.getIsActive());
        return repository.save(existing);
    }

    public void softDelete(int id) {
        InvSupplier supplier = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
        supplier.setDeleted("Yes");
        repository.save(supplier);
    }
}
