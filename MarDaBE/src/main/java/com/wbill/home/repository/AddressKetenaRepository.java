package com.wbill.home.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wbill.home.dto.AddressKetenaDTO;
import com.wbill.home.model.AddressKetena;
import com.wbill.home.model.AddressStreets;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressKetenaRepository extends JpaRepository<AddressKetena, Integer> {

       /**
        * Find all ketenas with complete information
        */
       @Query("SELECT new com.wbill.home.dto.AddressKetenaDTO(" +
                     "k.id, k.ketenaCode, k.ketenaName, k.populationSize, " +
                     "k.deleted, " +
                     "s.id, s.streetsCode, s.streetsName, " +
                     "c.id, c.cityName, c.cityCode, " +
                     "z.id, z.zoneName, z.zoneCode, " +
                     "st.id, st.stateName, st.stateCode) " +
                     "FROM AddressKetena k " +
                     "LEFT JOIN k.addressStreets s " +
                     "LEFT JOIN s.addressCity c " +
                     "LEFT JOIN c.addressZone z " +
                     "LEFT JOIN z.addressState st " +
                     "ORDER BY k.ketenaName")
       List<AddressKetenaDTO> findAllKetenasWithDetails();

       @Query("SELECT new com.wbill.home.dto.AddressKetenaDTO(" +
                     "k.id, k.ketenaCode, k.ketenaName, k.populationSize, " +
                     "k.deleted, " +
                     "s.id, s.streetsCode, s.streetsName, " +
                     "c.id, c.cityName, c.cityCode, " +
                     "z.id, z.zoneName, z.zoneCode, " +
                     "st.id, st.stateName, st.stateCode) " +
                     "FROM AddressKetena k " +
                     "LEFT JOIN k.addressStreets s " +
                     "LEFT JOIN s.addressCity c " +
                     "LEFT JOIN c.addressZone z " +
                     "LEFT JOIN z.addressState st " +
                     "WHERE k.deleted = 'active' " +
                     "ORDER BY k.ketenaName")
       List<AddressKetenaDTO> findAllActiveKetenasWithDetails();

       /**
        * Find ketenas by status with pagination
        */
       @Query("SELECT new com.wbill.home.dto.AddressKetenaDTO(" +
                     "k.id, k.ketenaCode, k.ketenaName, k.populationSize, " +
                     "k.deleted, " +
                     "s.id, s.streetsCode, s.streetsName, " +
                     "c.id, c.cityName, c.cityCode, " +
                     "z.id, z.zoneName, z.zoneCode, " +
                     "st.id, st.stateName, st.stateCode) " +
                     "FROM AddressKetena k " +
                     "LEFT JOIN k.addressStreets s " +
                     "LEFT JOIN s.addressCity c " +
                     "LEFT JOIN c.addressZone z " +
                     "LEFT JOIN z.addressState st " +
                     "WHERE (:status = 'all' OR " +
                     "      (:status = 'active' AND k.deleted = 'active') OR " +
                     "      (:status = 'deleted' AND k.deleted = 'deleted')) " +
                     "ORDER BY k.ketenaName")
       Page<AddressKetenaDTO> findByStatusPaginated(@Param("status") String status, Pageable pageable);

       /**
        * Find ketena by ID with complete information
        */
       @Query("SELECT new com.wbill.home.dto.AddressKetenaDTO(" +
                     "k.id, k.ketenaCode, k.ketenaName, k.populationSize, " +
                     "k.deleted, " +
                     "s.id, s.streetsCode, s.streetsName, " +
                     "c.id, c.cityName, c.cityCode, " +
                     "z.id, z.zoneName, z.zoneCode, " +
                     "st.id, st.stateName, st.stateCode) " +
                     "FROM AddressKetena k " +
                     "LEFT JOIN k.addressStreets s " +
                     "LEFT JOIN s.addressCity c " +
                     "LEFT JOIN c.addressZone z " +
                     "LEFT JOIN z.addressState st " +
                     "WHERE k.id = :id")
       Optional<AddressKetenaDTO> findKetenaById(@Param("id") Integer id);

       /**
        * Find ketenas by streets ID
        */
       @Query("SELECT new com.wbill.home.dto.AddressKetenaDTO(" +
                     "k.id, k.ketenaCode, k.ketenaName, k.populationSize, " +
                     "k.deleted, " +
                     "s.id, s.streetsCode, s.streetsName, " +
                     "c.id, c.cityName, c.cityCode, " +
                     "z.id, z.zoneName, z.zoneCode, " +
                     "st.id, st.stateName, st.stateCode) " +
                     "FROM AddressKetena k " +
                     "LEFT JOIN k.addressStreets s " +
                     "LEFT JOIN s.addressCity c " +
                     "LEFT JOIN c.addressZone z " +
                     "LEFT JOIN z.addressState st " +
                     "WHERE k.addressStreets.id = :streetsId AND k.deleted = 'active' " +
                     "ORDER BY k.ketenaName")
       List<AddressKetenaDTO> findByStreetsId(@Param("streetsId") Integer streetsId);

       /**
        * Check if ketena code exists
        */
       boolean existsByKetenaCode(String ketenaCode);

       /**
        * Check if ketena name exists
        */
       boolean existsByKetenaName(String ketenaName);

       /**
        * Check if ketena code exists excluding specific ID (only among active records)
        */
       @Query("SELECT CASE WHEN COUNT(k) > 0 THEN true ELSE false END FROM AddressKetena k WHERE k.ketenaCode = :ketenaCode AND k.id != :id AND k.deleted = 'active'")
       boolean existsByKetenaCodeAndIdNot(@Param("ketenaCode") String ketenaCode, @Param("id") Integer id);

       /**
        * Check if ketena name exists excluding specific ID (only among active records)
        */
       @Query("SELECT CASE WHEN COUNT(k) > 0 THEN true ELSE false END FROM AddressKetena k WHERE k.ketenaName = :ketenaName AND k.id != :id AND k.deleted = 'active'")
       boolean existsByKetenaNameAndIdNot(@Param("ketenaName") String ketenaName, @Param("id") Integer id);

       /**
        * Count ketenas by streets
        */
       @Query("SELECT COUNT(k) FROM AddressKetena k WHERE k.addressStreets.id = :streetsId")
       Long countByStreetsId(@Param("streetsId") Integer streetsId);

       /**
        * Count active ketenas by streets
        */
       @Query("SELECT COUNT(k) FROM AddressKetena k WHERE k.addressStreets.id = :streetsId AND k.deleted = 'active'")
       Long countActiveByStreetsId(@Param("streetsId") Integer streetsId);

       @Query("SELECT k FROM AddressKetena k WHERE k.addressStreets.id = :kebeleId AND k.deleted = 'active' ORDER BY k.ketenaName ASC")
       List<AddressKetena> findActiveByKebeleId(@Param("kebeleId") Integer kebeleId);

       List<AddressKetena> findByAddressStreets(AddressStreets addressStreets);

       AddressKetena findByKetenaCode(String ketenaCode);

       List<AddressKetena> findByKetenaNameContainingIgnoreCase(String ketenaName);

       @Query("SELECT k FROM AddressKetena k WHERE LOWER(k.ketenaName) = LOWER(:ketenaName) AND k.deleted = 'active'")
       List<AddressKetena> findByExactKetenaName(@Param("ketenaName") String ketenaName);

       @Query("SELECT k FROM AddressKetena k WHERE LOWER(k.ketenaName) = LOWER(:ketenaName) " +
                     "AND k.deleted = 'active' " +
                     "AND k.addressStreets.id = :kebeleId")
       List<AddressKetena> findByExactKetenaNameAndKebele(
                     @Param("ketenaName") String ketenaName,
                     @Param("kebeleId") int kebeleId);

       List<AddressKetena> findByDeleted(String deleted);

       List<AddressKetena> findByPopulationSizeGreaterThan(int population);
}