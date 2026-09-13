package com.wbill.home.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wbill.home.model.AddressCity;
import com.wbill.home.model.AddressStreets;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressStreetsRepository extends JpaRepository<AddressStreets, Integer> {
    
    // Basic queries
    @Query("SELECT s FROM AddressStreets s WHERE s.status = 'active' AND s.deleted = 'active' ORDER BY s.streetsName ASC")
    List<AddressStreets> findAllActive();
    
    @Query("SELECT s FROM AddressStreets s ORDER BY s.streetsName ASC")
    List<AddressStreets> findAllStreets();
    
    List<AddressStreets> findByAddressCity(AddressCity addressCity);
    
    Optional<AddressStreets> findByStreetsCode(String streetsCode);
    
    List<AddressStreets> findByStreetsNameContainingIgnoreCase(String streetsName);
    
    @Query("SELECT s FROM AddressStreets s WHERE LOWER(s.streetsName) = LOWER(:name) AND s.status = 'active'")
    List<AddressStreets> findByExactStreetName(@Param("name") String name);
    
    List<AddressStreets> findByStatus(String status);
    
    List<AddressStreets> findByDeleted(String deleted);
    
    // Paginated queries
    Page<AddressStreets> findByStatus(String status, Pageable pageable);
    
    Page<AddressStreets> findByDeleted(String deleted, Pageable pageable);
    
    @Query("SELECT s FROM AddressStreets s WHERE s.status = :status AND s.deleted = 'active' ORDER BY s.streetsName ASC")
    Page<AddressStreets> findByStatusAndNotDeleted(@Param("status") String status, Pageable pageable);
    
    @Query("SELECT s FROM AddressStreets s WHERE s.deleted = 'deleted' ORDER BY s.streetsName ASC")
    Page<AddressStreets> findAllDeleted(Pageable pageable);
    
    // City-based queries
    @Query("SELECT s FROM AddressStreets s WHERE s.addressCity.id = :cityId AND s.status = 'active' AND s.deleted = 'active'")
    List<AddressStreets> findByCityIdAndActive(@Param("cityId") Integer cityId);
    
    @Query("SELECT s FROM AddressStreets s WHERE s.addressCity.id = :cityId")
    Page<AddressStreets> findByCityId(@Param("cityId") Integer cityId, Pageable pageable);
    
    // Existence checks
    boolean existsByStreetsCodeAndIdNot(String streetsCode, Integer id);
    
    boolean existsByStreetsCode(String streetsCode);
    
    boolean existsByStreetsNameAndAddressCityAndIdNot(String streetsName, AddressCity addressCity, Integer id);
    
    boolean existsByStreetsNameAndAddressCity(String streetsName, AddressCity addressCity);
    
    // Statistics queries
    @Query("SELECT COUNT(s) FROM AddressStreets s WHERE s.addressCity.id = :cityId AND s.status = 'active' AND s.deleted = 'active'")
    Long countByCityIdAndActive(@Param("cityId") Integer cityId);
    
    @Query("SELECT SUM(s.populationSize) FROM AddressStreets s WHERE s.addressCity.id = :cityId AND s.status = 'active' AND s.deleted = 'active'")
    Long sumPopulationByCityId(@Param("cityId") Integer cityId);
    
    // Combined queries for frontend
    @Query("SELECT s FROM AddressStreets s " +
           "JOIN FETCH s.addressCity c " +
           "JOIN FETCH c.addressZone z " +
           "JOIN FETCH z.addressState st " +
           "JOIN FETCH st.addressCountry co " +
           "WHERE s.status = :status AND s.deleted = 'active' " +
           "ORDER BY s.streetsName ASC")
    List<AddressStreets> findAllWithLocationHierarchy(@Param("status") String status);
}
