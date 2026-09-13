package com.wbill.home.repository;

import com.wbill.home.dto.AddressCountryDTO;
import com.wbill.home.model.AddressCountry;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressCountryRepository extends JpaRepository<AddressCountry, Integer> {
    
    // Check if country code already exists
    boolean existsByCountryCode(String countryCode);
    
    // Check if country name already exists
    boolean existsByCountryName(String countryName);
    
    // Find by country code
    Optional<AddressCountry> findByCountryCode(String countryCode);
    
    // Find by country name
    Optional<AddressCountry> findByCountryName(String countryName);
    
    // Find by status
    List<AddressCountry> findByStatus(String status);
    
    // Find by continent
    List<AddressCountry> findByContinent(String continent);
    
    // Find by status and continent
    List<AddressCountry> findByStatusAndContinent(String status, String continent);
    
    /**
     * Finds a paginated list of address countries with a given status and returns them as DTOs.
     * This uses a constructor expression for efficient projection.
     * @param status The status to filter by (e.g., "active").
     * @param pageable The pagination information (page number, size).
     * @return A Page of AddressCountryDTO objects.
     */
    @Query("SELECT new com.wbill.home.dto.AddressCountryDTO(" +
           "a.id, a.countryCode, a.countryName, a.continent, a.status, a.deleted, " +
           "a.registeredDate, a.modifiedDate) " +
           "FROM AddressCountry a WHERE a.status = :status")
    Page<AddressCountryDTO> findByStatusAsDTO(@Param("status") String status, Pageable pageable);
    
    /**
     * Finds all address countries and returns them as DTOs with user information.
     * @return List of AddressCountryDTO objects with user details.
     */
    @Query("SELECT new com.wbill.home.dto.AddressCountryDTO(" +
           "a.id, a.countryCode, a.countryName, a.continent, a.status, a.deleted, " +
           "a.registeredDate, a.modifiedDate, " +
           "a.registeredBy.id, " +
           "CONCAT(COALESCE(a.registeredBy.firstName, ''), ' ', " +
           "COALESCE(a.registeredBy.midleName, ''), ' ', " +
           "COALESCE(a.registeredBy.lastName, '')), " +
           "a.modifiedBy.id, " +
           "CONCAT(COALESCE(a.modifiedBy.firstName, ''), ' ', " +
           "COALESCE(a.modifiedBy.midleName, ''), ' ', " +
           "COALESCE(a.modifiedBy.lastName, ''))) " +
           "FROM AddressCountry a " +
           "LEFT JOIN a.registeredBy " +
           "LEFT JOIN a.modifiedBy")
    List<AddressCountryDTO> findAllAsDTO();
    
    /**
     * Finds address countries by status and returns them as DTOs with user information.
     * @param status The status to filter by.
     * @return List of AddressCountryDTO objects with user details.
     */
    @Query("SELECT new com.wbill.home.dto.AddressCountryDTO(" +
           "a.id, a.countryCode, a.countryName, a.continent, a.status, a.deleted, " +
           "a.registeredDate, a.modifiedDate, " +
           "a.registeredBy.id, " +
           "CONCAT(COALESCE(a.registeredBy.firstName, ''), ' ', " +
           "COALESCE(a.registeredBy.midleName, ''), ' ', " +
           "COALESCE(a.registeredBy.lastName, '')), " +
           "a.modifiedBy.id, " +
           "CONCAT(COALESCE(a.modifiedBy.firstName, ''), ' ', " +
           "COALESCE(a.modifiedBy.midleName, ''), ' ', " +
           "COALESCE(a.modifiedBy.lastName, ''))) " +
           "FROM AddressCountry a " +
           "LEFT JOIN a.registeredBy " +
           "LEFT JOIN a.modifiedBy " +
           "WHERE a.status = :status")
    List<AddressCountryDTO> findByStatusAsDTO(@Param("status") String status);
    
    /**
     * Finds a single address country by ID and returns it as DTO with user information.
     * @param id The ID of the address country.
     * @return Optional AddressCountryDTO with user details.
     */
    @Query("SELECT new com.wbill.home.dto.AddressCountryDTO(" +
           "a.id, a.countryCode, a.countryName, a.continent, a.status, a.deleted, " +
           "a.registeredDate, a.modifiedDate, " +
           "a.registeredBy.id, " +
           "CONCAT(COALESCE(a.registeredBy.firstName, ''), ' ', " +
           "COALESCE(a.registeredBy.midleName, ''), ' ', " +
           "COALESCE(a.registeredBy.lastName, '')), " +
           "a.modifiedBy.id, " +
           "CONCAT(COALESCE(a.modifiedBy.firstName, ''), ' ', " +
           "COALESCE(a.modifiedBy.midleName, ''), ' ', " +
           "COALESCE(a.modifiedBy.lastName, ''))) " +
           "FROM AddressCountry a " +
           "LEFT JOIN a.registeredBy " +
           "LEFT JOIN a.modifiedBy " +
           "WHERE a.id = :id")
    Optional<AddressCountryDTO> findByIdAsDTO(@Param("id") Integer id);
    
    // Order by country name
    List<AddressCountry> findAllByOrderByCountryNameAsc();
    
    // Order by ID
    List<AddressCountry> findAllByOrderByIdAsc();
}
