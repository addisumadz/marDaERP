package com.wbill.home.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.wbill.home.model.DashboardSummary;

@Repository
public interface DashboardSummaryRepository extends JpaRepository<DashboardSummary, Integer> {

    // We typically only want the most recent summary.
    @Query(value = "SELECT * FROM dashboard_summary ORDER BY last_updated DESC LIMIT 1", nativeQuery = true)
    DashboardSummary findTopByOrderByLastUpdatedDesc();
}
