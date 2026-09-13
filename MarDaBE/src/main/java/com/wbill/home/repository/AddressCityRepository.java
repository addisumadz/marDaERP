package com.wbill.home.repository;

import com.wbill.home.dto.AddressCityDTO;
import com.wbill.home.model.AddressCity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressCityRepository extends JpaRepository<AddressCity, Integer> {

    /**
     * Find all cities with complete information
     */
    @Query("SELECT new com.wbill.home.dto.AddressCityDTO(" +
           "c.id, c.cityCode, c.cityName, c.centerLatitude, c.centerLongitude, " +
           "c.populationSize, c.publicTapUser, c.averageHouseHoldSize, " +
           "c.status, c.deleted, c.registeredDate, c.modifiedDate, " +
           "z.id, z.zoneName, z.zoneCode, " +
           "s.id, s.stateName, s.stateCode, " +
           "co.id, co.countryName, co.countryCode, " +
           "rb.id, rb.userName, mb.id, mb.userName) " +
           "FROM AddressCity c " +
           "LEFT JOIN c.addressZone z " +
           "LEFT JOIN z.addressState s " +
           "LEFT JOIN s.addressCountry co " +
           "LEFT JOIN c.registeredBy rb " +
           "LEFT JOIN c.modifiedBy mb " +
           "ORDER BY c.cityName")
    List<AddressCityDTO> findAllCitiesWithDetails();

    /**
     * Find cities by status with pagination
     */
    @Query("SELECT new com.wbill.home.dto.AddressCityDTO(" +
           "c.id, c.cityCode, c.cityName, c.centerLatitude, c.centerLongitude, " +
           "c.populationSize, c.publicTapUser, c.averageHouseHoldSize, " +
           "c.status, c.deleted, c.registeredDate, c.modifiedDate, " +
           "z.id, z.zoneName, z.zoneCode, " +
           "s.id, s.stateName, s.stateCode, " +
           "co.id, co.countryName, co.countryCode, " +
           "rb.id, rb.userName, mb.id, mb.userName) " +
           "FROM AddressCity c " +
           "LEFT JOIN c.addressZone z " +
           "LEFT JOIN z.addressState s " +
           "LEFT JOIN s.addressCountry co " +
           "LEFT JOIN c.registeredBy rb " +
           "LEFT JOIN c.modifiedBy mb " +
           "WHERE (:status = 'all' OR " +
           "      (:status = 'active' AND c.status = 'active' AND c.deleted = 'active') OR " +
           "      (:status = 'deleted' AND c.status = 'deleted' AND c.deleted = 'deleted')) " +
           "ORDER BY c.cityName")
    Page<AddressCityDTO> findByStatusPaginated(@Param("status") String status, Pageable pageable);

    /**
     * Find cities by status without pagination
     */
    @Query("SELECT new com.wbill.home.dto.AddressCityDTO(" +
           "c.id, c.cityCode, c.cityName, c.centerLatitude, c.centerLongitude, " +
           "c.populationSize, c.publicTapUser, c.averageHouseHoldSize, " +
           "c.status, c.deleted, c.registeredDate, c.modifiedDate, " +
           "z.id, z.zoneName, z.zoneCode, " +
           "s.id, s.stateName, s.stateCode, " +
           "co.id, co.countryName, co.countryCode, " +
           "rb.id, rb.userName, mb.id, mb.userName) " +
           "FROM AddressCity c " +
           "LEFT JOIN c.addressZone z " +
           "LEFT JOIN z.addressState s " +
           "LEFT JOIN s.addressCountry co " +
           "LEFT JOIN c.registeredBy rb " +
           "LEFT JOIN c.modifiedBy mb " +
           "WHERE (:status = 'all' OR " +
           "      (:status = 'active' AND c.status = 'active' AND c.deleted = 'active') OR " +
           "      (:status = 'deleted' AND c.status = 'deleted' AND c.deleted = 'deleted')) " +
           "ORDER BY c.cityName")
    List<AddressCityDTO> findByStatus(@Param("status") String status);

    /**
     * Find city by ID with complete information
     */
    @Query("SELECT new com.wbill.home.dto.AddressCityDTO(" +
           "c.id, c.cityCode, c.cityName, c.centerLatitude, c.centerLongitude, " +
           "c.populationSize, c.publicTapUser, c.averageHouseHoldSize, " +
           "c.status, c.deleted, c.registeredDate, c.modifiedDate, " +
           "z.id, z.zoneName, z.zoneCode, " +
           "s.id, s.stateName, s.stateCode, " +
           "co.id, co.countryName, co.countryCode, " +
           "rb.id, rb.userName, mb.id, mb.userName) " +
           "FROM AddressCity c " +
           "LEFT JOIN c.addressZone z " +
           "LEFT JOIN z.addressState s " +
           "LEFT JOIN s.addressCountry co " +
           "LEFT JOIN c.registeredBy rb " +
           "LEFT JOIN c.modifiedBy mb " +
           "WHERE c.id = :id")
    Optional<AddressCityDTO> findCityById(@Param("id") Integer id);

    /**
     * Find cities by zone ID
     */
    @Query("SELECT new com.wbill.home.dto.AddressCityDTO(" +
           "c.id, c.cityCode, c.cityName, c.centerLatitude, c.centerLongitude, " +
           "c.populationSize, c.publicTapUser, c.averageHouseHoldSize, " +
           "c.status, c.deleted, c.registeredDate, c.modifiedDate, " +
           "z.id, z.zoneName, z.zoneCode, " +
           "s.id, s.stateName, s.stateCode, " +
           "co.id, co.countryName, co.countryCode, " +
           "rb.id, rb.userName, mb.id, mb.userName) " +
           "FROM AddressCity c " +
           "LEFT JOIN c.addressZone z " +
           "LEFT JOIN z.addressState s " +
           "LEFT JOIN s.addressCountry co " +
           "LEFT JOIN c.registeredBy rb " +
           "LEFT JOIN c.modifiedBy mb " +
           "WHERE c.addressZone.id = :zoneId AND c.deleted = 'active' " +
           "ORDER BY c.cityName")
    List<AddressCityDTO> findByZoneId(@Param("zoneId") Integer zoneId);

    /**
     * Check if city code exists
     */
    boolean existsByCityCode(String cityCode);

    /**
     * Check if city name exists
     */
    boolean existsByCityName(String cityName);

    /**
     * Check if city code exists excluding specific ID
     */
    boolean existsByCityCodeAndIdNot(String cityCode, Integer id);

    /**
     * Check if city name exists excluding specific ID
     */
    boolean existsByCityNameAndIdNot(String cityName, Integer id);

    /**
     * Count cities by zone
     */
    @Query("SELECT COUNT(c) FROM AddressCity c WHERE c.addressZone.id = :zoneId")
    Long countByZoneId(@Param("zoneId") Integer zoneId);

    /**
     * Count active cities by zone
     */
    @Query("SELECT COUNT(c) FROM AddressCity c WHERE c.addressZone.id = :zoneId AND c.status = 'active' AND c.deleted = 'active'")
    Long countActiveByZoneId(@Param("zoneId") Integer zoneId);

    /**
     * Count cities by state (through zone)
     */
    @Query("SELECT COUNT(c) FROM AddressCity c WHERE c.addressZone.addressState.id = :stateId")
    Long countByStateId(@Param("stateId") Integer stateId);

    /**
     * Count active cities by state (through zone)
     */
    @Query("SELECT COUNT(c) FROM AddressCity c WHERE c.addressZone.addressState.id = :stateId AND c.status = 'active' AND c.deleted = 'active'")
    Long countActiveByStateId(@Param("stateId") Integer stateId);
}
