package com.wbill.home.repository.hrms;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsBiometricDevice;

@Repository
public interface HrmsBiometricDeviceRepository extends JpaRepository<HrmsBiometricDevice, Integer> {
    List<HrmsBiometricDevice> findByActiveTrue();
}
