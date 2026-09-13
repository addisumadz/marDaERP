package com.wbill.home.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wbill.home.model.Setting;

import java.util.List;

@Repository
public interface SettingRepository extends JpaRepository<Setting, Integer> {
    List<Setting> findByStatus(String status);
}
