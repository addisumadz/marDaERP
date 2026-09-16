package com.wbill.home.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wbill.home.model.SmsSetting;

@Repository
public interface SmsSettingRepository extends JpaRepository<SmsSetting, Integer> {

    List<SmsSetting> findByIsActiveTrue();

    Optional<SmsSetting> findFirstByCityIdAndIsActiveTrue(Integer cityId);

    Optional<SmsSetting> findFirstByCityNameIgnoreCaseAndIsActiveTrue(String cityName);

    Optional<SmsSetting> findFirstByCityIdIsNullAndIsActiveTrue();
}
