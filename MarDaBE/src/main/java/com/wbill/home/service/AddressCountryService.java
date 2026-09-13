package com.wbill.home.service;

import com.wbill.home.dto.AddressCountryDTO;
import com.wbill.home.model.AddressCountry;
import com.wbill.home.model.UserAccount;
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
import java.util.Optional;

@Service
@Transactional
public class AddressCountryService {

    private final AddressCountryRepository addressCountryRepository;
    private final UserAccountRepository userAccountRepository;

    public AddressCountryService(AddressCountryRepository addressCountryRepository,
                               UserAccountRepository userAccountRepository) {
        this.addressCountryRepository = addressCountryRepository;
        this.userAccountRepository = userAccountRepository;
    }

    /**
     * Get all address countries as DTOs
     */
    public List<AddressCountryDTO> getAllAddressCountries() {
        return addressCountryRepository.findAllAsDTO();
    }

    /**
     * Get address countries by status as DTOs
     */
    public List<AddressCountryDTO> getAddressCountriesByStatus(String status) {
        return addressCountryRepository.findByStatusAsDTO(status);
    }

    /**
     * Get paginated address countries by status
     */
    public Page<AddressCountryDTO> findByStatusPaginated(String status, Pageable pageable) {
        return addressCountryRepository.findByStatusAsDTO(status, pageable);
    }

    /**
     * Find address country by ID and return as DTO
     */
    public Optional<AddressCountryDTO> findById(Integer id) {
        return addressCountryRepository.findByIdAsDTO(id);
    }

    /**
     * Create a new address country
     */
    public AddressCountry createAddressCountry(AddressCountryDTO dto) {
        // Validate unique constraints
        if (addressCountryRepository.existsByCountryCode(dto.getCountryCode())) {
            throw new IllegalArgumentException("Country code already exists: " + dto.getCountryCode());
        }
        if (addressCountryRepository.existsByCountryName(dto.getCountryName())) {
            throw new IllegalArgumentException("Country name already exists: " + dto.getCountryName());
        }

        AddressCountry addressCountry = new AddressCountry();
        addressCountry.setCountryCode(dto.getCountryCode());
        addressCountry.setCountryName(dto.getCountryName());
        addressCountry.setContinent(dto.getContinent());
        addressCountry.setStatus("active");
        addressCountry.setDeleted("active");
        
        // Set audit fields
        Date now = new Date();
        UserAccount currentUser = getCurrentUser();
        addressCountry.setRegisteredDate(now);
        addressCountry.setRegisteredBy(currentUser);
        addressCountry.setModifiedDate(now);
        addressCountry.setModifiedBy(currentUser);

        return addressCountryRepository.save(addressCountry);
    }

    /**
     * Update an existing address country
     */
    public AddressCountry updateAddressCountry(Integer id, AddressCountryDTO dto) {
        AddressCountry existingCountry = addressCountryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address Country not found with id: " + id));

        // Check unique constraints only if values are changing
        if (!existingCountry.getCountryCode().equals(dto.getCountryCode()) && 
            addressCountryRepository.existsByCountryCode(dto.getCountryCode())) {
            throw new IllegalArgumentException("Country code already exists: " + dto.getCountryCode());
        }
        if (!existingCountry.getCountryName().equals(dto.getCountryName()) && 
            addressCountryRepository.existsByCountryName(dto.getCountryName())) {
            throw new IllegalArgumentException("Country name already exists: " + dto.getCountryName());
        }

        // Update fields
        existingCountry.setCountryCode(dto.getCountryCode());
        existingCountry.setCountryName(dto.getCountryName());
        existingCountry.setContinent(dto.getContinent());
        // Status and deleted fields are managed automatically
        
        // Update audit fields
        existingCountry.setModifiedDate(new Date());
        existingCountry.setModifiedBy(getCurrentUser());

        return addressCountryRepository.save(existingCountry);
    }

    /**
     * Activate an address country
     */
    public void activateAddressCountry(Integer id) {
        AddressCountry addressCountry = addressCountryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address Country not found with id: " + id));
        
        addressCountry.setStatus("active");
        addressCountry.setDeleted("active");
        addressCountry.setModifiedDate(new Date());
        addressCountry.setModifiedBy(getCurrentUser());
        
        addressCountryRepository.save(addressCountry);
    }

    /**
     * Deactivate an address country (soft delete)
     */
    public void deactivateAddressCountry(Integer id, String remark) {
        AddressCountry addressCountry = addressCountryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address Country not found with id: " + id));
        
        addressCountry.setStatus("deleted");
        addressCountry.setDeleted("deleted");
        addressCountry.setModifiedDate(new Date());
        addressCountry.setModifiedBy(getCurrentUser());
        
        addressCountryRepository.save(addressCountry);
    }

    /**
     * Permanently delete an address country
     */
    public void deleteAddressCountry(Integer id) {
        if (!addressCountryRepository.existsById(id)) {
            throw new EntityNotFoundException("Address Country not found with id: " + id);
        }
        addressCountryRepository.deleteById(id);
    }


    /**
     * Get address countries by continent
     */
    public List<AddressCountry> getAddressCountriesByContinent(String continent) {
        return addressCountryRepository.findByContinent(continent);
    }

    /**
     * Get address countries by status and continent
     */
    public List<AddressCountry> getAddressCountriesByStatusAndContinent(String status, String continent) {
        return addressCountryRepository.findByStatusAndContinent(status, continent);
    }

    /**
     * Check if country code exists
     */
    public boolean existsByCountryCode(String countryCode) {
        return addressCountryRepository.existsByCountryCode(countryCode);
    }

    /**
     * Check if country name exists
     */
    public boolean existsByCountryName(String countryName) {
        return addressCountryRepository.existsByCountryName(countryName);
    }

    /**
     * Find address country by country code
     */
    public Optional<AddressCountry> findByCountryCode(String countryCode) {
        return addressCountryRepository.findByCountryCode(countryCode);
    }

    /**
     * Find address country by country name
     */
    public Optional<AddressCountry> findByCountryName(String countryName) {
        return addressCountryRepository.findByCountryName(countryName);
    }

    /**
     * Get all address countries ordered by name
     */
    public List<AddressCountry> getAllAddressCountriesOrderedByName() {
        return addressCountryRepository.findAllByOrderByCountryNameAsc();
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
