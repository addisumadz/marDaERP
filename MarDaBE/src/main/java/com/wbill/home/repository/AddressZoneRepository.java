package com.wbill.home.repository;

import com.wbill.home.dto.AddressZoneDTO;
import com.wbill.home.model.AddressZone;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressZoneRepository extends JpaRepository<AddressZone, Integer> {

    /**
     * Find all address zones as DTOs with state and country information
     */
    @Query("SELECT new com.wbill.home.dto.AddressZoneDTO(" +
           "az.id, az.zoneCode, az.zoneName, az.addressState.id, " +
           "az.addressState.stateName, az.addressState.addressCountry.countryName, " +
           "az.status, az.deleted, az.registeredDate, az.modifiedDate, " +
           "az.registeredBy.userName, az.modifiedBy.userName) " +
           "FROM AddressZone az " +
           "ORDER BY az.zoneName ASC")
    List<AddressZoneDTO> findAllAsDTO();

    /**
     * Find address zones by status as DTOs
     */
    @Query("SELECT new com.wbill.home.dto.AddressZoneDTO(" +
           "az.id, az.zoneCode, az.zoneName, az.addressState.id, " +
           "az.addressState.stateName, az.addressState.addressCountry.countryName, " +
           "az.status, az.deleted, az.registeredDate, az.modifiedDate, " +
           "az.registeredBy.userName, az.modifiedBy.userName) " +
           "FROM AddressZone az " +
           "WHERE az.status = :status " +
           "ORDER BY az.zoneName ASC")
    List<AddressZoneDTO> findByStatusAsDTO(@Param("status") String status);

    /**
     * Find address zones by status as DTOs with pagination
     */
    @Query("SELECT new com.wbill.home.dto.AddressZoneDTO(" +
           "az.id, az.zoneCode, az.zoneName, az.addressState.id, " +
           "az.addressState.stateName, az.addressState.addressCountry.countryName, " +
           "az.status, az.deleted, az.registeredDate, az.modifiedDate, " +
           "az.registeredBy.userName, az.modifiedBy.userName) " +
           "FROM AddressZone az " +
           "WHERE az.status = :status " +
           "ORDER BY az.zoneName ASC")
    Page<AddressZoneDTO> findByStatusAsDTO(@Param("status") String status, Pageable pageable);

    /**
     * Find address zone by ID as DTO
     */
    @Query("SELECT new com.wbill.home.dto.AddressZoneDTO(" +
           "az.id, az.zoneCode, az.zoneName, az.addressState.id, " +
           "az.addressState.stateName, az.addressState.addressCountry.countryName, " +
           "az.status, az.deleted, az.registeredDate, az.modifiedDate, " +
           "az.registeredBy.userName, az.modifiedBy.userName) " +
           "FROM AddressZone az " +
           "WHERE az.id = :id")
    Optional<AddressZoneDTO> findByIdAsDTO(@Param("id") Integer id);

    /**
     * Find address zones by state ID
     */
    @Query("SELECT az FROM AddressZone az WHERE az.addressState.id = :stateId ORDER BY az.zoneName ASC")
    List<AddressZone> findByStateId(@Param("stateId") Integer stateId);

    /**
     * Find address zones by state ID as DTOs
     */
    @Query("SELECT new com.wbill.home.dto.AddressZoneDTO(" +
           "az.id, az.zoneCode, az.zoneName, az.addressState.id, " +
           "az.addressState.stateName, az.addressState.addressCountry.countryName, " +
           "az.status, az.deleted, az.registeredDate, az.modifiedDate, " +
           "az.registeredBy.userName, az.modifiedBy.userName) " +
           "FROM AddressZone az " +
           "WHERE az.addressState.id = :stateId " +
           "ORDER BY az.zoneName ASC")
    List<AddressZoneDTO> findByStateIdAsDTO(@Param("stateId") Integer stateId);

    /**
     * Find address zones by state ID and status
     */
    @Query("SELECT az FROM AddressZone az WHERE az.addressState.id = :stateId AND az.status = :status ORDER BY az.zoneName ASC")
    List<AddressZone> findByStateIdAndStatus(@Param("stateId") Integer stateId, @Param("status") String status);

    /**
     * Check if zone code exists
     */
    boolean existsByZoneCode(String zoneCode);

    /**
     * Check if zone name exists
     */
    boolean existsByZoneName(String zoneName);

    /**
     * Find by zone code
     */
    Optional<AddressZone> findByZoneCode(String zoneCode);

    /**
     * Find by zone name
     */
    Optional<AddressZone> findByZoneName(String zoneName);

    /**
     * Find all address zones ordered by name
     */
    List<AddressZone> findAllByOrderByZoneNameAsc();

    /**
     * Count zones by state
     */
    @Query("SELECT COUNT(az) FROM AddressZone az WHERE az.addressState.id = :stateId")
    Long countByStateId(@Param("stateId") Integer stateId);

    /**
     * Count active zones by state
     */
    @Query("SELECT COUNT(az) FROM AddressZone az WHERE az.addressState.id = :stateId AND az.status = 'active'")
    Long countActiveByStateId(@Param("stateId") Integer stateId);
}
