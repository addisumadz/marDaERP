package com.wbill.home.repository.hrms;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsJobGrade;

@Repository
public interface HrmsJobGradeRepository extends JpaRepository<HrmsJobGrade, Integer> {
    List<HrmsJobGrade> findByActiveTrueOrderByGradeCodeAsc();
}
