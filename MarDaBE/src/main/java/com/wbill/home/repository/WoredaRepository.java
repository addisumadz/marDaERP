package com.wbill.home.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.wbill.home.model.*;

import java.util.List;
import java.util.Optional;

public interface WoredaRepository extends JpaRepository<Woreda, Integer> {

    List<Woreda> findByStatus(String status);

    @Query("SELECT w FROM Woreda w WHERE w.status = :status AND w.id = :id")
    Optional<Woreda> findByStatusAndId(@Param("status") String status, @Param("id") int id);
    List<Woreda> findByStatusAndZoneId(String status, int zoneId);
}
