package com.wbill.home.service;

import com.wbill.home.model.AddressCity;
import com.wbill.home.model.AddressStreets;
import com.wbill.home.model.UserAccount;
import com.wbill.home.repository.AddressCityRepository;
import com.wbill.home.repository.AddressStreetsRepository;
import com.wbill.home.repository.UserAccountRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AddressStreetsService {

    @Autowired
    private AddressStreetsRepository addressStreetsRepository;

    @Autowired
    private AddressCityRepository addressCityRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    // Get all streets (both active and deleted for frontend categorization)
    public List<AddressStreets> getAllAddressStreets() {
        // Return all streets regardless of status so frontend can categorize by status
        List<AddressStreets> allStreets = addressStreetsRepository.findAllStreets();
        //System.out.println("All streets count: " + allStreets.size());
        return allStreets;
    }

    // Get streets by status with pagination
    public Page<AddressStreets> getAddressStreetsByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("streetsName").ascending());
        
        if ("ACTIVE".equalsIgnoreCase(status)) {
            return addressStreetsRepository.findByStatusAndNotDeleted("active", pageable);
        } else if ("DELETED".equalsIgnoreCase(status)) {
            return addressStreetsRepository.findAllDeleted(pageable);
        } else {
            return addressStreetsRepository.findByStatus(status.toLowerCase(), pageable);
        }
    }

    // Get street by ID
    public Optional<AddressStreets> getAddressStreetById(Integer id) {
        return addressStreetsRepository.findById(id);
    }

    // Get streets by city ID
    public List<AddressStreets> getStreetsByCityId(Integer cityId) {
        return addressStreetsRepository.findByCityIdAndActive(cityId);
    }

    // Create new street
    public AddressStreets createAddressStreet(AddressStreets addressStreet) {
        // Validation
        validateAddressStreet(addressStreet, null);

        // Set audit fields
        UserAccount currentUser = getCurrentUser();
        Date now = new Date();
        
        addressStreet.setRegisteredBy(currentUser);
        addressStreet.setModifiedBy(currentUser);
        addressStreet.setRegisteredDate(now);
        addressStreet.setModifiedDate(now);
        addressStreet.setStatus("active");
        addressStreet.setDeleted("active");

        return addressStreetsRepository.save(addressStreet);
    }

    // Update existing street
    public AddressStreets updateAddressStreet(Integer id, AddressStreets updatedStreet) {
        Optional<AddressStreets> existingStreetOpt = addressStreetsRepository.findById(id);
        
        if (!existingStreetOpt.isPresent()) {
            throw new RuntimeException("Address Street not found with id: " + id);
        }

        AddressStreets existingStreet = existingStreetOpt.get();
        
        // Validation
        validateAddressStreet(updatedStreet, id);

        // Update fields
        existingStreet.setStreetsCode(updatedStreet.getStreetsCode());
        existingStreet.setStreetsName(updatedStreet.getStreetsName());
        existingStreet.setAddressStreetsNumber(updatedStreet.getAddressStreetsNumber());
        existingStreet.setPopulationSize(updatedStreet.getPopulationSize());
        existingStreet.setAddressCity(updatedStreet.getAddressCity());

        // Update audit fields
        UserAccount currentUser = getCurrentUser();
        existingStreet.setModifiedBy(currentUser);
        existingStreet.setModifiedDate(new Date());

        return addressStreetsRepository.save(existingStreet);
    }

    // Activate street
    public AddressStreets activateAddressStreet(Integer id) {
        Optional<AddressStreets> streetOpt = addressStreetsRepository.findById(id);
        
        if (!streetOpt.isPresent()) {
            throw new RuntimeException("Address Street not found with id: " + id);
        }

        AddressStreets street = streetOpt.get();
        street.setStatus("active");
        street.setDeleted("active");
        
        // Update audit fields
        UserAccount currentUser = getCurrentUser();
        street.setModifiedBy(currentUser);
        street.setModifiedDate(new Date());

        return addressStreetsRepository.save(street);
    }

    // Deactivate street (soft delete)
    public AddressStreets deactivateAddressStreet(Integer id, String remark) {
        Optional<AddressStreets> streetOpt = addressStreetsRepository.findById(id);
        
        if (!streetOpt.isPresent()) {
            throw new RuntimeException("Address Street not found with id: " + id);
        }

        AddressStreets street = streetOpt.get();
        street.setStatus("deleted");
        street.setDeleted("deleted");
        
        // Update audit fields
        UserAccount currentUser = getCurrentUser();
        street.setModifiedBy(currentUser);
        street.setModifiedDate(new Date());

        return addressStreetsRepository.save(street);
    }

    // Delete street permanently
    public void deleteAddressStreet(Integer id) {
        if (!addressStreetsRepository.existsById(id)) {
            throw new RuntimeException("Address Street not found with id: " + id);
        }
        addressStreetsRepository.deleteById(id);
    }

    // Check if street code exists
    public boolean checkStreetCodeExists(String streetCode) {
        return addressStreetsRepository.existsByStreetsCode(streetCode);
    }

    // Check if street name exists in city
    public boolean checkStreetNameExistsInCity(String streetName, Integer cityId) {
        Optional<AddressCity> cityOpt = addressCityRepository.findById(cityId);
        if (!cityOpt.isPresent()) {
            return false;
        }
        return addressStreetsRepository.existsByStreetsNameAndAddressCity(streetName, cityOpt.get());
    }

    // Get street statistics by city
    public StreetStatistics getStreetStatsByCity(Integer cityId) {
        Long activeCount = addressStreetsRepository.countByCityIdAndActive(cityId);
        Long totalPopulation = addressStreetsRepository.sumPopulationByCityId(cityId);
        
        return new StreetStatistics(
            activeCount != null ? activeCount : 0L,
            totalPopulation != null ? totalPopulation : 0L
        );
    }

    // Inner class for statistics
    public static class StreetStatistics {
        private final Long activeStreetsCount;
        private final Long totalPopulation;
        
        public StreetStatistics(Long activeStreetsCount, Long totalPopulation) {
            this.activeStreetsCount = activeStreetsCount;
            this.totalPopulation = totalPopulation;
        }
        
        public Long getActiveStreetsCount() {
            return activeStreetsCount;
        }
        
        public Long getTotalPopulation() {
            return totalPopulation;
        }
    }

    // Get active streets
    public List<AddressStreets> getActiveStreets() {
        return addressStreetsRepository.findAllWithLocationHierarchy("active");
    }

    // Get inactive streets
    public List<AddressStreets> getInactiveStreets() {
        return addressStreetsRepository.findByStatus("inactive");
    }

    // Get deleted streets
    public List<AddressStreets> getDeletedStreets() {
        return addressStreetsRepository.findByDeleted("yes");
    }

    // Private helper methods
    private void validateAddressStreet(AddressStreets addressStreet, Integer excludeId) {
        // Validate required fields
        if (addressStreet.getStreetsCode() == null || addressStreet.getStreetsCode().trim().isEmpty()) {
            throw new RuntimeException("Street code is required");
        }
        
        if (addressStreet.getStreetsName() == null || addressStreet.getStreetsName().trim().isEmpty()) {
            throw new RuntimeException("Street name is required");
        }
        
        if (addressStreet.getAddressCity() == null) {
            throw new RuntimeException("City is required");
        }

        // Validate city exists
        if (!addressCityRepository.existsById(addressStreet.getAddressCity().getId())) {
            throw new RuntimeException("Selected city does not exist");
        }

        // Check for duplicate street code
        if (excludeId != null) {
            if (addressStreetsRepository.existsByStreetsCodeAndIdNot(addressStreet.getStreetsCode(), excludeId)) {
                throw new RuntimeException("Street code already exists");
            }
        } else {
            if (addressStreetsRepository.existsByStreetsCode(addressStreet.getStreetsCode())) {
                throw new RuntimeException("Street code already exists");
            }
        }

        // Check for duplicate street name in the same city
        if (excludeId != null) {
            if (addressStreetsRepository.existsByStreetsNameAndAddressCityAndIdNot(
                    addressStreet.getStreetsName(), addressStreet.getAddressCity(), excludeId)) {
                throw new RuntimeException("Street name already exists in this city");
            }
        } else {
            if (addressStreetsRepository.existsByStreetsNameAndAddressCity(
                    addressStreet.getStreetsName(), addressStreet.getAddressCity())) {
                throw new RuntimeException("Street name already exists in this city");
            }
        }

        // Validate field lengths
        if (addressStreet.getStreetsCode().length() > 20) {
            throw new RuntimeException("Street code must be at most 20 characters");
        }
        
        if (addressStreet.getStreetsName().length() > 150) {
            throw new RuntimeException("Street name must be at most 150 characters");
        }

        // Validate numeric fields
        if (addressStreet.getAddressStreetsNumber() < 0) {
            throw new RuntimeException("Street number must be non-negative");
        }
        
        if (addressStreet.getPopulationSize() < 0) {
            throw new RuntimeException("Population size must be non-negative");
        }
    }

    private UserAccount getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }
        
        String username = authentication.getName();
        Optional<UserAccount> userOpt = userAccountRepository.findByUserName(username);
        
        if (!userOpt.isPresent()) {
            throw new RuntimeException("Current user not found in database");
        }
        
        return userOpt.get();
    }
}
