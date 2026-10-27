package com.wbill.home.repository;

import com.wbill.home.model.ArifPayConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArifPayConfigRepository extends JpaRepository<ArifPayConfig, Integer> {
}
