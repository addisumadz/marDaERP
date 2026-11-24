package com.wbill.home.repository;

import com.wbill.home.model.SmsTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SmsTemplateRepository extends JpaRepository<SmsTemplate, Integer> {
    Optional<SmsTemplate> findByTemplateCode(String templateCode);
    List<SmsTemplate> findByIsActiveTrue();
}

