package com.mardaarif.repository;

import com.mardaarif.model.Sms;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SmsRepository extends JpaRepository<Sms, Long> {
    List<Sms> findByCityId(Integer cityId);
    List<Sms> findByCityIdAndStatus(Integer cityId, String status);
    void deleteByCityId(Integer cityId);
}
