package com.wbill.home.service;

import com.wbill.home.dto.AddressCityDTO;
import com.wbill.home.model.AddressCity;
import com.wbill.home.model.AddressZone;
import com.wbill.home.model.UserAccount;
import com.wbill.home.repository.AddressCityRepository;
import com.wbill.home.repository.AddressZoneRepository;
import com.wbill.home.repository.UserAccountRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@Transactional
public class AddressCityService {

    private final AddressCityRepository addressCityRepository;
    private final AddressZoneRepository addressZoneRepository;
    private final UserAccountRepository userAccountRepository;

    public AddressCityService(AddressCityRepository addressCityRepository,
                             AddressZoneRepository addressZoneRepository,
                             UserAccountRepository userAccountRepository) {
        this.addressCityRepository = addressCityRepository;
        this.addressZoneRepository = addressZoneRepository;
        this.userAccountRepository = userAccountRepository;
    }

    /**
     * Get all cities (both active and deleted for frontend categorization)
     */
    @Transactional(readOnly = true)
    public List<AddressCityDTO> getAllAddressCities() {
        return addressCityRepository.findAllCitiesWithDetails();
    }

    /**
     * Get cities by status with pagination
     */
    @Transactional(readOnly = true)
    public Page<AddressCityDTO> findByStatusPaginated(String status, Pageable pageable) {
        return addressCityRepository.findByStatusPaginated(status, pageable);
    }

    /**
     * Get cities by status without pagination
     */
    @Transactional(readOnly = true)
    public List<AddressCityDTO> getAddressCitiesByStatus(String status) {
        return addressCityRepository.findByStatus(status);
    }

    /**
     * Find city by ID
     */
    @Transactional(readOnly = true)
    public Optional<AddressCityDTO> findById(Integer id) {
        return addressCityRepository.findCityById(id);
    }

    /**
     * Get cities by zone ID
     */
    @Transactional(readOnly = true)
    public List<AddressCityDTO> getAddressCitiesByZoneId(Integer zoneId) {
        return addressCityRepository.findByZoneId(zoneId);
    }

    /**
     * Create a new city
     */
    public AddressCity createAddressCity(AddressCityDTO dto) {
        // Validate required fields
        if (dto.getCityCode() == null || dto.getCityCode().trim().isEmpty()) {
            throw new IllegalArgumentException("City code is required");
        }
        if (dto.getCityName() == null || dto.getCityName().trim().isEmpty()) {
            throw new IllegalArgumentException("City name is required");
        }
        if (dto.getZoneId() == null) {
            throw new IllegalArgumentException("Zone is required");
        }
        if (dto.getCenterLatitude() == null) {
            throw new IllegalArgumentException("Center latitude is required");
        }
        if (dto.getCenterLongitude() == null) {
            throw new IllegalArgumentException("Center longitude is required");
        }
        if (dto.getPopulationSize() == null || dto.getPopulationSize() < 0) {
            throw new IllegalArgumentException("Population size must be a non-negative number");
        }
        if (dto.getPublicTapUser() == null || dto.getPublicTapUser() < 0) {
            throw new IllegalArgumentException("Public tap users must be a non-negative number");
        }
        if (dto.getAverageHouseHoldSize() == null || dto.getAverageHouseHoldSize() < 0) {
            throw new IllegalArgumentException("Average household size must be a non-negative number");
        }

        // Check for duplicate city code
        if (addressCityRepository.existsByCityCode(dto.getCityCode())) {
            throw new IllegalArgumentException("City code already exists: " + dto.getCityCode());
        }

        // Check for duplicate city name
        if (addressCityRepository.existsByCityName(dto.getCityName())) {
            throw new IllegalArgumentException("City name already exists: " + dto.getCityName());
        }

        // Validate zone exists
        AddressZone zone = addressZoneRepository.findById(dto.getZoneId())
                .orElseThrow(() -> new EntityNotFoundException("Zone not found with id: " + dto.getZoneId()));

        // Get current user (assuming user ID 1 for now - should be from security context)
        UserAccount currentUser = userAccountRepository.findById(1)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));

        // Create new city
        AddressCity city = new AddressCity();
        city.setCityCode(dto.getCityCode().trim());
        city.setCityName(dto.getCityName().trim());
        city.setCenterLatitude(dto.getCenterLatitude());
        city.setCenterLongitude(dto.getCenterLongitude());
        city.setPopulationSize(dto.getPopulationSize());
        city.setPublicTapUser(dto.getPublicTapUser());
        city.setAverageHouseHoldSize(dto.getAverageHouseHoldSize());
        city.setAddressZone(zone);
        city.setStatus("active");
        city.setDeleted("active");
        city.setRegisteredDate(new Date());
        city.setRegisteredBy(currentUser);
        city.setModifiedDate(new Date());
        city.setModifiedBy(currentUser);

        return addressCityRepository.save(city);
    }

    /**
     * Update an existing city
     */
    public AddressCity updateAddressCity(Integer id, AddressCityDTO dto) {
        // Find existing city
        AddressCity existingCity = addressCityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("City not found with id: " + id));

        // Validate required fields
        if (dto.getCityCode() == null || dto.getCityCode().trim().isEmpty()) {
            throw new IllegalArgumentException("City code is required");
        }
        if (dto.getCityName() == null || dto.getCityName().trim().isEmpty()) {
            throw new IllegalArgumentException("City name is required");
        }
        if (dto.getZoneId() == null) {
            throw new IllegalArgumentException("Zone is required");
        }
        if (dto.getCenterLatitude() == null) {
            throw new IllegalArgumentException("Center latitude is required");
        }
        if (dto.getCenterLongitude() == null) {
            throw new IllegalArgumentException("Center longitude is required");
        }
        if (dto.getPopulationSize() == null || dto.getPopulationSize() < 0) {
            throw new IllegalArgumentException("Population size must be a non-negative number");
        }
        if (dto.getPublicTapUser() == null || dto.getPublicTapUser() < 0) {
            throw new IllegalArgumentException("Public tap users must be a non-negative number");
        }
        if (dto.getAverageHouseHoldSize() == null || dto.getAverageHouseHoldSize() < 0) {
            throw new IllegalArgumentException("Average household size must be a non-negative number");
        }

        // Check for duplicate city code (excluding current city)
        if (addressCityRepository.existsByCityCodeAndIdNot(dto.getCityCode(), id)) {
            throw new IllegalArgumentException("City code already exists: " + dto.getCityCode());
        }

        // Check for duplicate city name (excluding current city)
        if (addressCityRepository.existsByCityNameAndIdNot(dto.getCityName(), id)) {
            throw new IllegalArgumentException("City name already exists: " + dto.getCityName());
        }

        // Update zone if changed
        if (!Objects.equals(existingCity.getAddressZone().getId(), dto.getZoneId())) {
            AddressZone zone = addressZoneRepository.findById(dto.getZoneId())
                    .orElseThrow(() -> new EntityNotFoundException("Zone not found with id: " + dto.getZoneId()));
            existingCity.setAddressZone(zone);
        }

        // Get current user (assuming user ID 1 for now - should be from security context)
        UserAccount currentUser = userAccountRepository.findById(1)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));

        // Update city fields
        existingCity.setCityCode(dto.getCityCode().trim());
        existingCity.setCityName(dto.getCityName().trim());
        existingCity.setCenterLatitude(dto.getCenterLatitude());
        existingCity.setCenterLongitude(dto.getCenterLongitude());
        existingCity.setPopulationSize(dto.getPopulationSize());
        existingCity.setPublicTapUser(dto.getPublicTapUser());
        existingCity.setAverageHouseHoldSize(dto.getAverageHouseHoldSize());
        existingCity.setModifiedDate(new Date());
        existingCity.setModifiedBy(currentUser);

        return addressCityRepository.save(existingCity);
    }

    /**
     * Activate a city
     */
    public void activateAddressCity(Integer id) {
        AddressCity city = addressCityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("City not found with id: " + id));

        // Get current user (assuming user ID 1 for now - should be from security context)
        UserAccount currentUser = userAccountRepository.findById(1)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));

        city.setStatus("active");
        city.setDeleted("active");
        city.setModifiedDate(new Date());
        city.setModifiedBy(currentUser);

        addressCityRepository.save(city);
    }

    /**
     * Deactivate a city (soft delete)
     */
    public void deactivateAddressCity(Integer id, String remark) {
        AddressCity city = addressCityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("City not found with id: " + id));

        // Get current user (assuming user ID 1 for now - should be from security context)
        UserAccount currentUser = userAccountRepository.findById(1)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));

        city.setStatus("deleted");
        city.setDeleted("deleted");
        city.setModifiedDate(new Date());
        city.setModifiedBy(currentUser);

        addressCityRepository.save(city);
    }

    /**
     * Permanently delete a city
     */
    public void deleteAddressCity(Integer id) {
        AddressCity city = addressCityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("City not found with id: " + id));

        addressCityRepository.delete(city);
    }

    /**
     * Check if city code exists
     */
    @Transactional(readOnly = true)
    public boolean existsByCityCode(String cityCode) {
        return addressCityRepository.existsByCityCode(cityCode);
    }

    /**
     * Check if city name exists
     */
    @Transactional(readOnly = true)
    public boolean existsByCityName(String cityName) {
        return addressCityRepository.existsByCityName(cityName);
    }

    /**
     * Count cities by zone
     */
    @Transactional(readOnly = true)
    public Long countCitiesByZone(Integer zoneId) {
        return addressCityRepository.countByZoneId(zoneId);
    }

    /**
     * Count active cities by zone
     */
    @Transactional(readOnly = true)
    public Long countActiveCitiesByZone(Integer zoneId) {
        return addressCityRepository.countActiveByZoneId(zoneId);
    }

    /**
     * Count cities by state
     */
    @Transactional(readOnly = true)
    public Long countCitiesByState(Integer stateId) {
        return addressCityRepository.countByStateId(stateId);
    }

    /**
     * Count active cities by state
     */
    @Transactional(readOnly = true)
    public Long countActiveCitiesByState(Integer stateId) {
        return addressCityRepository.countActiveByStateId(stateId);
    }
}
