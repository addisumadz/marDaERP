package com.wbill.home.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.wbill.home.model.Zone;

import java.util.List;
import java.util.Optional;

public interface ZoneRepository extends JpaRepository<Zone, Integer> {

    List<Zone> findByStatus(String status);

    @Query("SELECT z FROM Zone z WHERE z.status = :status AND z.id = :id")
    Optional<Zone> findByStatusAndId(@Param("status") String status, @Param("id") int id);
    List<Zone> findByStatusAndRegionId(String status, int regionId);

}
