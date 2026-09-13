package com.wbill.home.repository.hrms;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsShiftSchedule;

@Repository
public interface HrmsShiftScheduleRepository extends JpaRepository<HrmsShiftSchedule, Integer> {
    Optional<HrmsShiftSchedule> findByShiftCode(String shiftCode);
    List<HrmsShiftSchedule> findByActiveTrue();
}
