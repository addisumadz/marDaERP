package com.wbill.home.service;

import com.wbill.home.dto.AddressStateDTO;
import com.wbill.home.model.AddressState;
import com.wbill.home.model.AddressCountry;
import com.wbill.home.model.UserAccount;
import com.wbill.home.repository.AddressStateRepository;
import com.wbill.home.repository.AddressCountryRepository;
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
public class AddressStateService {

    private final AddressStateRepository addressStateRepository;
    private final AddressCountryRepository addressCountryRepository;
    private final UserAccountRepository userAccountRepository;

    public AddressStateService(AddressStateRepository addressStateRepository,
                              AddressCountryRepository addressCountryRepository,
                              UserAccountRepository userAccountRepository) {
        this.addressStateRepository = addressStateRepository;
        this.addressCountryRepository = addressCountryRepository;
        this.userAccountRepository = userAccountRepository;
    }

    /**
     * Get all address states as DTOs
     */
    public List<AddressStateDTO> getAllAddressStates() {
        return addressStateRepository.findAllAsDTO();
    }

    /**
     * Get address states by status as DTOs
     */
    public List<AddressStateDTO> getAddressStatesByStatus(String status) {
        return addressStateRepository.findByStatusAsDTO(status);
    }

    /**
     * Get paginated address states by status
     */
    public Page<AddressStateDTO> findByStatusPaginated(String status, Pageable pageable) {
        return addressStateRepository.findByStatusAsDTO(status, pageable);
    }

    /**
     * Find address state by ID and return as DTO
     */
    public Optional<AddressStateDTO> findById(Integer id) {
        return addressStateRepository.findByIdAsDTO(id);
    }

    /**
     * Get address states by country ID
     */
    public List<AddressStateDTO> getAddressStatesByCountryId(Integer countryId) {
        return addressStateRepository.findByCountryIdAsDTO(countryId);
    }

    /**
     * Create a new address state
     */
    public AddressState createAddressState(AddressStateDTO dto) {
        // Validate unique constraints
        if (addressStateRepository.existsByStateCode(dto.getStateCode())) {
            throw new IllegalArgumentException("State code already exists: " + dto.getStateCode());
        }
        if (addressStateRepository.existsByStateName(dto.getStateName())) {
            throw new IllegalArgumentException("State name already exists: " + dto.getStateName());
        }

        // Validate country exists
        AddressCountry country = addressCountryRepository.findById(dto.getCountryId())
                .orElseThrow(() -> new EntityNotFoundException("Country not found with id: " + dto.getCountryId()));

        AddressState addressState = new AddressState();
        addressState.setAddressCountry(country);
        addressState.setStateCode(dto.getStateCode());
        addressState.setStateName(dto.getStateName());
        addressState.setStatus("active");
        addressState.setDeleted("active");
        
        // Set audit fields
        Date now = new Date();
        UserAccount currentUser = getCurrentUser();
        addressState.setRegisteredDate(now);
        addressState.setRegisteredBy(currentUser);
        addressState.setModifiedDate(now);
        addressState.setModifiedBy(currentUser);

        return addressStateRepository.save(addressState);
    }

    /**
     * Update an existing address state
     */
    public AddressState updateAddressState(Integer id, AddressStateDTO dto) {
        AddressState existingState = addressStateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address State not found with id: " + id));

        // Check unique constraints only if values are changing
        if (!existingState.getStateCode().equals(dto.getStateCode()) && 
            addressStateRepository.existsByStateCode(dto.getStateCode())) {
            throw new IllegalArgumentException("State code already exists: " + dto.getStateCode());
        }
        if (!existingState.getStateName().equals(dto.getStateName()) && 
            addressStateRepository.existsByStateName(dto.getStateName())) {
            throw new IllegalArgumentException("State name already exists: " + dto.getStateName());
        }

        // Validate country exists if changing
        if (!Objects.equals(existingState.getAddressCountry().getId(), dto.getCountryId())) {
            AddressCountry country = addressCountryRepository.findById(dto.getCountryId())
                    .orElseThrow(() -> new EntityNotFoundException("Country not found with id: " + dto.getCountryId()));
            existingState.setAddressCountry(country);
        }

        // Update fields
        existingState.setStateCode(dto.getStateCode());
        existingState.setStateName(dto.getStateName());
        // Status and deleted fields are managed automatically
        
        // Update audit fields
        existingState.setModifiedDate(new Date());
        existingState.setModifiedBy(getCurrentUser());

        return addressStateRepository.save(existingState);
    }

    /**
     * Activate an address state
     */
    public void activateAddressState(Integer id) {
        AddressState addressState = addressStateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address State not found with id: " + id));
        
        addressState.setStatus("active");
        addressState.setDeleted("active");
        addressState.setModifiedDate(new Date());
        addressState.setModifiedBy(getCurrentUser());
        
        addressStateRepository.save(addressState);
    }

    /**
     * Deactivate an address state (soft delete)
     */
    public void deactivateAddressState(Integer id, String remark) {
        AddressState addressState = addressStateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address State not found with id: " + id));
        
        addressState.setStatus("deleted");
        addressState.setDeleted("deleted");
        addressState.setModifiedDate(new Date());
        addressState.setModifiedBy(getCurrentUser());
        
        addressStateRepository.save(addressState);
    }

    /**
     * Permanently delete an address state
     */
    public void deleteAddressState(Integer id) {
        if (!addressStateRepository.existsById(id)) {
            throw new EntityNotFoundException("Address State not found with id: " + id);
        }
        addressStateRepository.deleteById(id);
    }

    /**
     * Get address states by country ID
     */
    public List<AddressState> getAddressStatesByCountry(Integer countryId) {
        return addressStateRepository.findByAddressCountryId(countryId);
    }

    /**
     * Get address states by status and country ID
     */
    public List<AddressState> getAddressStatesByStatusAndCountry(String status, Integer countryId) {
        return addressStateRepository.findByStatusAndAddressCountryId(status, countryId);
    }

    /**
     * Check if state code exists
     */
    public boolean existsByStateCode(String stateCode) {
        return addressStateRepository.existsByStateCode(stateCode);
    }

    /**
     * Check if state name exists
     */
    public boolean existsByStateName(String stateName) {
        return addressStateRepository.existsByStateName(stateName);
    }

    /**
     * Find address state by state code
     */
    public Optional<AddressState> findByStateCode(String stateCode) {
        return addressStateRepository.findByStateCode(stateCode);
    }

    /**
     * Find address state by state name
     */
    public Optional<AddressState> findByStateName(String stateName) {
        return addressStateRepository.findByStateName(stateName);
    }

    /**
     * Get all address states ordered by name
     */
    public List<AddressState> getAllAddressStatesOrderedByName() {
        return addressStateRepository.findAllByOrderByStateNameAsc();
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
