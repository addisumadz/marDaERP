package com.wbill.home.service;

import com.wbill.home.dto.AddressZoneDTO;
import com.wbill.home.model.AddressZone;
import com.wbill.home.model.AddressState;
import com.wbill.home.model.UserAccount;
import com.wbill.home.repository.AddressZoneRepository;
import com.wbill.home.repository.AddressStateRepository;
import com.wbill.home.repository.UserAccountRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@Transactional
public class AddressZoneService {

    private final AddressZoneRepository addressZoneRepository;
    private final AddressStateRepository addressStateRepository;
    private final UserAccountRepository userAccountRepository;

    public AddressZoneService(AddressZoneRepository addressZoneRepository,
                             AddressStateRepository addressStateRepository,
                             UserAccountRepository userAccountRepository) {
        this.addressZoneRepository = addressZoneRepository;
        this.addressStateRepository = addressStateRepository;
        this.userAccountRepository = userAccountRepository;
    }

    /**
     * Get all address zones as DTOs
     */
    public List<AddressZoneDTO> getAllAddressZones() {
        return addressZoneRepository.findAllAsDTO();
    }

    /**
     * Get address zones by status as DTOs
     */
    public List<AddressZoneDTO> getAddressZonesByStatus(String status) {
        return addressZoneRepository.findByStatusAsDTO(status);
    }

    /**
     * Get paginated address zones by status
     */
    public Page<AddressZoneDTO> findByStatusPaginated(String status, Pageable pageable) {
        return addressZoneRepository.findByStatusAsDTO(status, pageable);
    }

    /**
     * Find address zone by ID and return as DTO
     */
    public Optional<AddressZoneDTO> findById(Integer id) {
        return addressZoneRepository.findByIdAsDTO(id);
    }

    /**
     * Get address zones by state ID
     */
    public List<AddressZoneDTO> getAddressZonesByStateId(Integer stateId) {
        return addressZoneRepository.findByStateIdAsDTO(stateId);
    }

    /**
     * Create a new address zone
     */
    public AddressZone createAddressZone(AddressZoneDTO dto) {
        // Validate unique constraints
        if (addressZoneRepository.existsByZoneCode(dto.getZoneCode())) {
            throw new IllegalArgumentException("Zone code already exists: " + dto.getZoneCode());
        }
        if (addressZoneRepository.existsByZoneName(dto.getZoneName())) {
            throw new IllegalArgumentException("Zone name already exists: " + dto.getZoneName());
        }

        // Validate state exists
        AddressState state = addressStateRepository.findById(dto.getStateId())
                .orElseThrow(() -> new EntityNotFoundException("State not found with id: " + dto.getStateId()));

        AddressZone addressZone = new AddressZone();
        addressZone.setZoneCode(dto.getZoneCode());
        addressZone.setZoneName(dto.getZoneName());
        addressZone.setAddressState(state);
        addressZone.setStatus("active");
        addressZone.setDeleted("active");
        
        // Set audit fields
        Date now = new Date();
        UserAccount currentUser = getCurrentUser();
        addressZone.setRegisteredDate(now);
        addressZone.setRegisteredBy(currentUser);
        addressZone.setModifiedDate(now);
        addressZone.setModifiedBy(currentUser);

        return addressZoneRepository.save(addressZone);
    }

    /**
     * Update an existing address zone
     */
    public AddressZone updateAddressZone(Integer id, AddressZoneDTO dto) {
        AddressZone existingZone = addressZoneRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address Zone not found with id: " + id));

        // Check unique constraints only if values are changing
        if (!existingZone.getZoneCode().equals(dto.getZoneCode()) && 
            addressZoneRepository.existsByZoneCode(dto.getZoneCode())) {
            throw new IllegalArgumentException("Zone code already exists: " + dto.getZoneCode());
        }
        if (!existingZone.getZoneName().equals(dto.getZoneName()) && 
            addressZoneRepository.existsByZoneName(dto.getZoneName())) {
            throw new IllegalArgumentException("Zone name already exists: " + dto.getZoneName());
        }

        // Validate state exists if changing
        if (!Objects.equals(existingZone.getAddressState().getId(), dto.getStateId())) {
            AddressState state = addressStateRepository.findById(dto.getStateId())
                    .orElseThrow(() -> new EntityNotFoundException("State not found with id: " + dto.getStateId()));
            existingZone.setAddressState(state);
        }

        // Update fields
        existingZone.setZoneCode(dto.getZoneCode());
        existingZone.setZoneName(dto.getZoneName());
        // Status and deleted fields are managed automatically
        
        // Update audit fields
        existingZone.setModifiedDate(new Date());
        existingZone.setModifiedBy(getCurrentUser());

        return addressZoneRepository.save(existingZone);
    }

    /**
     * Activate an address zone
     */
    public void activateAddressZone(Integer id) {
        AddressZone addressZone = addressZoneRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address Zone not found with id: " + id));
        
        addressZone.setStatus("active");
        addressZone.setDeleted("active");
        addressZone.setModifiedDate(new Date());
        addressZone.setModifiedBy(getCurrentUser());
        
        addressZoneRepository.save(addressZone);
    }

    /**
     * Deactivate an address zone (soft delete)
     */
    public void deactivateAddressZone(Integer id, String remark) {
        AddressZone addressZone = addressZoneRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address Zone not found with id: " + id));
        
        addressZone.setStatus("deleted");
        addressZone.setDeleted("deleted");
        addressZone.setModifiedDate(new Date());
        addressZone.setModifiedBy(getCurrentUser());
        
        addressZoneRepository.save(addressZone);
    }

    /**
     * Permanently delete an address zone
     */
    public void deleteAddressZone(Integer id) {
        if (!addressZoneRepository.existsById(id)) {
            throw new EntityNotFoundException("Address Zone not found with id: " + id);
        }
        addressZoneRepository.deleteById(id);
    }

    /**
     * Check if zone code exists
     */
    public boolean existsByZoneCode(String zoneCode) {
        return addressZoneRepository.existsByZoneCode(zoneCode);
    }

    /**
     * Check if zone name exists
     */
    public boolean existsByZoneName(String zoneName) {
        return addressZoneRepository.existsByZoneName(zoneName);
    }

    /**
     * Find address zone by zone code
     */
    public Optional<AddressZone> findByZoneCode(String zoneCode) {
        return addressZoneRepository.findByZoneCode(zoneCode);
    }

    /**
     * Find address zone by zone name
     */
    public Optional<AddressZone> findByZoneName(String zoneName) {
        return addressZoneRepository.findByZoneName(zoneName);
    }

    /**
     * Get all address zones ordered by name
     */
    public List<AddressZone> getAllAddressZonesOrderedByName() {
        return addressZoneRepository.findAllByOrderByZoneNameAsc();
    }

    /**
     * Get zones by state and status
     */
    public List<AddressZone> getAddressZonesByStateAndStatus(Integer stateId, String status) {
        return addressZoneRepository.findByStateIdAndStatus(stateId, status);
    }

    /**
     * Count zones by state
     */
    public Long countZonesByState(Integer stateId) {
        return addressZoneRepository.countByStateId(stateId);
    }

    /**
     * Count active zones by state
     */
    public Long countActiveZonesByState(Integer stateId) {
        return addressZoneRepository.countActiveByStateId(stateId);
    }

    /**
     * Get current authenticated user
     */
    private UserAccount getCurrentUser() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof UserDetails) {
                String username = ((UserDetails) principal).getUsername();
                return userAccountRepository.findByUserName(username)
                        .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));
            }
        } catch (Exception e) {
            // If we can't get the current user, we'll use a default or system user
            // You might want to handle this differently based on your requirements
        }
        
        // Return a default user or throw an exception
        // For now, we'll try to get the first admin user or create a system user reference
        return userAccountRepository.findById(1)
                .orElseThrow(() -> new EntityNotFoundException("No system user found"));
    }
}
