package com.wbill.home.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.wbill.home.model.Region;

import java.util.List;
import java.util.Optional;

public interface RegionRepository extends JpaRepository<Region, Integer> {

    List<Region> findByStatus(String status);

    @Query("SELECT r FROM Region r WHERE r.status = :status AND r.id = :id")
    Optional<Region> findByStatusAndId(@Param("status") String status, @Param("id") int id);
}
