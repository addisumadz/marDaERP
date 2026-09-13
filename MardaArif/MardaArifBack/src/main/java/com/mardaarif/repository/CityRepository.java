package com.mardaarif.repository;

import com.mardaarif.model.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, Integer> {
    Optional<City> findByApiKey(String apiKey);
    Optional<City> findByCityCode(String cityCode);
    List<City> findByActiveTrue();
    boolean existsByCityCode(String cityCode);
}
