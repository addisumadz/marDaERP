package com.wbill.home.repository;

import com.wbill.home.dto.AddressStateDTO;
import com.wbill.home.model.AddressState;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressStateRepository extends JpaRepository<AddressState, Integer> {
    
    // Check if state code already exists
    boolean existsByStateCode(String stateCode);
    
    // Check if state name already exists
    boolean existsByStateName(String stateName);
    
    // Find by state code
    Optional<AddressState> findByStateCode(String stateCode);
    
    // Find by state name
    Optional<AddressState> findByStateName(String stateName);
    
    // Find by status
    List<AddressState> findByStatus(String status);
    
    // Find by country ID
    List<AddressState> findByAddressCountryId(Integer countryId);
    
    // Find by status and country ID
    List<AddressState> findByStatusAndAddressCountryId(String status, Integer countryId);
    
    /**
     * Finds a paginated list of address states with a given status and returns them as DTOs.
     * @param status The status to filter by (e.g., "active").
     * @param pageable The pagination information (page number, size).
     * @return A Page of AddressStateDTO objects.
     */
    @Query("SELECT new com.wbill.home.dto.AddressStateDTO(" +
           "a.id, a.addressCountry.id, a.stateCode, a.stateName, a.status, a.deleted, " +
           "a.registeredDate, a.modifiedDate) " +
           "FROM AddressState a WHERE a.status = :status")
    Page<AddressStateDTO> findByStatusAsDTO(@Param("status") String status, Pageable pageable);
    
    /**
     * Finds all address states and returns them as DTOs with user and country information.
     * @return List of AddressStateDTO objects with user and country details.
     */
    @Query("SELECT new com.wbill.home.dto.AddressStateDTO(" +
           "a.id, a.addressCountry.id, a.addressCountry.countryName, a.stateCode, a.stateName, " +
           "a.status, a.deleted, a.registeredDate, a.modifiedDate, " +
           "a.registeredBy.id, " +
           "CONCAT(COALESCE(a.registeredBy.firstName, ''), ' ', " +
           "COALESCE(a.registeredBy.midleName, ''), ' ', " +
           "COALESCE(a.registeredBy.lastName, '')), " +
           "a.modifiedBy.id, " +
           "CONCAT(COALESCE(a.modifiedBy.firstName, ''), ' ', " +
           "COALESCE(a.modifiedBy.midleName, ''), ' ', " +
           "COALESCE(a.modifiedBy.lastName, ''))) " +
           "FROM AddressState a " +
           "LEFT JOIN a.registeredBy " +
           "LEFT JOIN a.modifiedBy " +
           "LEFT JOIN a.addressCountry")
    List<AddressStateDTO> findAllAsDTO();
    
    /**
     * Finds address states by status and returns them as DTOs with user and country information.
     * @param status The status to filter by.
     * @return List of AddressStateDTO objects with user and country details.
     */
    @Query("SELECT new com.wbill.home.dto.AddressStateDTO(" +
           "a.id, a.addressCountry.id, a.addressCountry.countryName, a.stateCode, a.stateName, " +
           "a.status, a.deleted, a.registeredDate, a.modifiedDate, " +
           "a.registeredBy.id, " +
           "CONCAT(COALESCE(a.registeredBy.firstName, ''), ' ', " +
           "COALESCE(a.registeredBy.midleName, ''), ' ', " +
           "COALESCE(a.registeredBy.lastName, '')), " +
           "a.modifiedBy.id, " +
           "CONCAT(COALESCE(a.modifiedBy.firstName, ''), ' ', " +
           "COALESCE(a.modifiedBy.midleName, ''), ' ', " +
           "COALESCE(a.modifiedBy.lastName, ''))) " +
           "FROM AddressState a " +
           "LEFT JOIN a.registeredBy " +
           "LEFT JOIN a.modifiedBy " +
           "LEFT JOIN a.addressCountry " +
           "WHERE a.status = :status")
    List<AddressStateDTO> findByStatusAsDTO(@Param("status") String status);
    
    /**
     * Finds a single address state by ID and returns it as DTO with user and country information.
     * @param id The ID of the address state.
     * @return Optional AddressStateDTO with user and country details.
     */
    @Query("SELECT new com.wbill.home.dto.AddressStateDTO(" +
           "a.id, a.addressCountry.id, a.addressCountry.countryName, a.stateCode, a.stateName, " +
           "a.status, a.deleted, a.registeredDate, a.modifiedDate, " +
           "a.registeredBy.id, " +
           "CONCAT(COALESCE(a.registeredBy.firstName, ''), ' ', " +
           "COALESCE(a.registeredBy.midleName, ''), ' ', " +
           "COALESCE(a.registeredBy.lastName, '')), " +
           "a.modifiedBy.id, " +
           "CONCAT(COALESCE(a.modifiedBy.firstName, ''), ' ', " +
           "COALESCE(a.modifiedBy.midleName, ''), ' ', " +
           "COALESCE(a.modifiedBy.lastName, ''))) " +
           "FROM AddressState a " +
           "LEFT JOIN a.registeredBy " +
           "LEFT JOIN a.modifiedBy " +
           "LEFT JOIN a.addressCountry " +
           "WHERE a.id = :id")
    Optional<AddressStateDTO> findByIdAsDTO(@Param("id") Integer id);
    
    /**
     * Finds address states by country ID and returns them as DTOs.
     * @param countryId The country ID to filter by.
     * @return List of AddressStateDTO objects.
     */
    @Query("SELECT new com.wbill.home.dto.AddressStateDTO(" +
           "a.id, a.addressCountry.id, a.addressCountry.countryName, a.stateCode, a.stateName, " +
           "a.status, a.deleted, a.registeredDate, a.modifiedDate, " +
           "a.registeredBy.id, " +
           "CONCAT(COALESCE(a.registeredBy.firstName, ''), ' ', " +
           "COALESCE(a.registeredBy.midleName, ''), ' ', " +
           "COALESCE(a.registeredBy.lastName, '')), " +
           "a.modifiedBy.id, " +
           "CONCAT(COALESCE(a.modifiedBy.firstName, ''), ' ', " +
           "COALESCE(a.modifiedBy.midleName, ''), ' ', " +
           "COALESCE(a.modifiedBy.lastName, ''))) " +
           "FROM AddressState a " +
           "LEFT JOIN a.registeredBy " +
           "LEFT JOIN a.modifiedBy " +
           "LEFT JOIN a.addressCountry " +
           "WHERE a.addressCountry.id = :countryId")
    List<AddressStateDTO> findByCountryIdAsDTO(@Param("countryId") Integer countryId);
    
    // Order by state name
    List<AddressState> findAllByOrderByStateNameAsc();
    
    // Order by ID
    List<AddressState> findAllByOrderByIdAsc();
}
