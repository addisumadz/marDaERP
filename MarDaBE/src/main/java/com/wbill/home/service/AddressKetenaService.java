package com.wbill.home.service;

import com.wbill.home.dto.AddressKetenaDTO;
import com.wbill.home.dto.AddressKetenaCreateDTO;
import com.wbill.home.model.AddressKetena;
import com.wbill.home.model.AddressStreets;
import com.wbill.home.repository.AddressKetenaRepository;
import com.wbill.home.repository.AddressStreetsRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@Transactional
public class AddressKetenaService {

    @Autowired
    private AddressKetenaRepository addressKetenaRepository;

    @Autowired
    private AddressStreetsRepository addressStreetsRepository;

    // Get all ketenas (both active and deleted for frontend categorization)
    public List<AddressKetenaDTO> getAllAddressKetenas() {
        return addressKetenaRepository.findAllKetenasWithDetails();
    }

    // Get ketenas by status with pagination
    public Page<AddressKetenaDTO> getAddressKetenasByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("ketenaName").ascending());
        return addressKetenaRepository.findByStatusPaginated(status, pageable);
    }

    // Get ketena by ID
    public Optional<AddressKetenaDTO> getAddressKetenaById(Integer id) {
        return addressKetenaRepository.findKetenaById(id);
    }

    // Get ketenas by streets ID
    public List<AddressKetenaDTO> getAddressKetenasByStreetsId(Integer streetsId) {
        return addressKetenaRepository.findByStreetsId(streetsId);
    }


    // Create new ketena
    public AddressKetena createAddressKetena(AddressKetenaCreateDTO dto) {
        // Validate required fields
        if (dto.getKetenaCode() == null || dto.getKetenaCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Ketena code is required");
        }
        if (dto.getKetenaName() == null || dto.getKetenaName().trim().isEmpty()) {
            throw new IllegalArgumentException("Ketena name is required");
        }
        if (dto.getStreetsId() == null) {
            throw new IllegalArgumentException("Streets/Kebele is required");
        }
        if (dto.getPopulationSize() == null || dto.getPopulationSize() < 0) {
            throw new IllegalArgumentException("Population size must be a non-negative number");
        }

        // Check for duplicate ketena code
        if (addressKetenaRepository.existsByKetenaCode(dto.getKetenaCode())) {
            throw new IllegalArgumentException("Ketena code already exists: " + dto.getKetenaCode());
        }

        // Check for duplicate ketena name
        if (addressKetenaRepository.existsByKetenaName(dto.getKetenaName())) {
            throw new IllegalArgumentException("Ketena name already exists: " + dto.getKetenaName());
        }

        // Validate streets exists
        AddressStreets streets = addressStreetsRepository.findById(dto.getStreetsId())
                .orElseThrow(() -> new EntityNotFoundException("Streets/Kebele not found with id: " + dto.getStreetsId()));

        // Create new ketena
        AddressKetena ketena = new AddressKetena();
        ketena.setKetenaCode(dto.getKetenaCode().trim());
        ketena.setKetenaName(dto.getKetenaName().trim());
        ketena.setPopulationSize(dto.getPopulationSize());
        ketena.setAddressStreets(streets);
        ketena.setDeleted("active");

        return addressKetenaRepository.save(ketena);
    }

    // Update existing ketena
    public AddressKetena updateAddressKetena(Integer id, AddressKetenaCreateDTO dto) {
        // Find existing ketena
        AddressKetena existingKetena = addressKetenaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ketena not found with id: " + id));

        // Validate required fields
        if (dto.getKetenaCode() == null || dto.getKetenaCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Ketena code is required");
        }
        if (dto.getKetenaName() == null || dto.getKetenaName().trim().isEmpty()) {
            throw new IllegalArgumentException("Ketena name is required");
        }
        if (dto.getStreetsId() == null) {
            throw new IllegalArgumentException("Streets/Kebele is required");
        }
        if (dto.getPopulationSize() == null || dto.getPopulationSize() < 0) {
            throw new IllegalArgumentException("Population size must be a non-negative number");
        }

        // Check for duplicate ketena code (excluding current ketena)
        boolean codeExists = addressKetenaRepository.existsByKetenaCodeAndIdNot(dto.getKetenaCode(), id);
        System.out.println("DEBUG: Checking ketena code '" + dto.getKetenaCode() + "' for ID " + id + " - exists: " + codeExists);
        if (codeExists) {
            throw new IllegalArgumentException("Ketena code already exists: " + dto.getKetenaCode());
        }

        // Check for duplicate ketena name (excluding current ketena)
        boolean nameExists = addressKetenaRepository.existsByKetenaNameAndIdNot(dto.getKetenaName(), id);
        System.out.println("DEBUG: Checking ketena name '" + dto.getKetenaName() + "' for ID " + id + " - exists: " + nameExists);
        if (nameExists) {
            throw new IllegalArgumentException("Ketena name already exists: " + dto.getKetenaName());
        }

        // Update streets if changed
        if (!Objects.equals(existingKetena.getAddressStreets().getId(), dto.getStreetsId())) {
            AddressStreets streets = addressStreetsRepository.findById(dto.getStreetsId())
                    .orElseThrow(() -> new EntityNotFoundException("Streets/Kebele not found with id: " + dto.getStreetsId()));
            existingKetena.setAddressStreets(streets);
        }

        // Update ketena fields
        existingKetena.setKetenaCode(dto.getKetenaCode().trim());
        existingKetena.setKetenaName(dto.getKetenaName().trim());
        existingKetena.setPopulationSize(dto.getPopulationSize());

        return addressKetenaRepository.save(existingKetena);
    }

    // Activate ketena
    public AddressKetena activateAddressKetena(Integer id) {
        Optional<AddressKetena> ketenaOpt = addressKetenaRepository.findById(id);
        
        if (!ketenaOpt.isPresent()) {
            throw new RuntimeException("Ketena not found with id: " + id);
        }

        AddressKetena ketena = ketenaOpt.get();
        ketena.setDeleted("active");

        return addressKetenaRepository.save(ketena);
    }

    // Deactivate ketena (soft delete)
    public AddressKetena deactivateAddressKetena(Integer id, String remark) {
        Optional<AddressKetena> ketenaOpt = addressKetenaRepository.findById(id);
        
        if (!ketenaOpt.isPresent()) {
            throw new RuntimeException("Ketena not found with id: " + id);
        }

        AddressKetena ketena = ketenaOpt.get();
        ketena.setDeleted("deleted");

        return addressKetenaRepository.save(ketena);
    }

    // Delete ketena permanently
    public void deleteAddressKetena(Integer id) {
        AddressKetena ketena = addressKetenaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ketena not found with id: " + id));

        addressKetenaRepository.delete(ketena);
    }

    // Check if ketena code exists
    public boolean existsByKetenaCode(String ketenaCode) {
        return addressKetenaRepository.existsByKetenaCode(ketenaCode);
    }

    // Check if ketena name exists
    public boolean existsByKetenaName(String ketenaName) {
        return addressKetenaRepository.existsByKetenaName(ketenaName);
    }

    // Count ketenas by streets
    public Long countKetenasByStreets(Integer streetsId) {
        return addressKetenaRepository.countByStreetsId(streetsId);
    }

    // Count active ketenas by streets
    public Long countActiveKetenasByStreets(Integer streetsId) {
        return addressKetenaRepository.countActiveByStreetsId(streetsId);
    }
}
