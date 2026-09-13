package com.wbill.home.controller.hrms;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.wbill.home.model.hrms.HrmsDepartment;
import com.wbill.home.model.hrms.HrmsJobGrade;
import com.wbill.home.model.hrms.HrmsPosition;
import com.wbill.home.repository.hrms.HrmsDepartmentRepository;
import com.wbill.home.repository.hrms.HrmsJobGradeRepository;
import com.wbill.home.repository.hrms.HrmsPositionRepository;

@RestController
@RequestMapping({"/api/card_managenment/hrms/departments", "/api/hrms/departments"})
@CrossOrigin(origins = "*", maxAge = 3600)
public class HrmsDepartmentController {

    @Autowired
    private HrmsDepartmentRepository departmentRepository;

    @Autowired
    private HrmsPositionRepository positionRepository;

    @Autowired
    private HrmsJobGradeRepository jobGradeRepository;

    @GetMapping
    public ResponseEntity<List<HrmsDepartment>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findByActiveTrueOrderByDepartmentNameAsc());
    }

    @PostMapping
    public ResponseEntity<HrmsDepartment> createDepartment(@RequestBody HrmsDepartment dept) {
        return ResponseEntity.ok(departmentRepository.save(dept));
    }

    @GetMapping("/positions")
    public ResponseEntity<List<HrmsPosition>> getAllPositions() {
        return ResponseEntity.ok(positionRepository.findByActiveTrueOrderByPositionTitleAsc());
    }

    @PostMapping("/positions")
    public ResponseEntity<HrmsPosition> createPosition(@RequestBody HrmsPosition pos) {
        return ResponseEntity.ok(positionRepository.save(pos));
    }

    @GetMapping("/grades")
    public ResponseEntity<List<HrmsJobGrade>> getAllJobGrades() {
        return ResponseEntity.ok(jobGradeRepository.findByActiveTrueOrderByGradeCodeAsc());
    }
}
