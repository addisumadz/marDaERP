package com.mardaarif.repository;

import com.mardaarif.model.ArifPayConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArifPayConfigRepository extends JpaRepository<ArifPayConfig, Integer> {
}
