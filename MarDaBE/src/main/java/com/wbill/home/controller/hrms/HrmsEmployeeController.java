package com.wbill.home.controller.hrms;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.wbill.home.model.hrms.HrmsEmployee;
import com.wbill.home.service.hrms.HrmsEmployeeService;

@RestController
@RequestMapping({"/api/card_managenment/hrms/employees", "/api/hrms/employees"})
@CrossOrigin(origins = "*", maxAge = 3600)
public class HrmsEmployeeController {

    @Autowired
    private HrmsEmployeeService employeeService;

    @GetMapping
    public ResponseEntity<List<HrmsEmployee>> getAllEmployees(@RequestParam(required = false) String search) {
        try {
            List<HrmsEmployee> employees = employeeService.searchEmployees(search);
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<HrmsEmployee> getEmployeeById(@PathVariable int id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<HrmsEmployee> createEmployee(@RequestBody HrmsEmployee employee,
                                                       @RequestParam(required = false) Integer userId) {
        try {
            HrmsEmployee saved = employeeService.saveEmployee(employee, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<HrmsEmployee> updateEmployee(@PathVariable int id,
                                                       @RequestBody HrmsEmployee employee,
                                                       @RequestParam(required = false) Integer userId) {
        try {
            employee.setId(id);
            HrmsEmployee saved = employeeService.saveEmployee(employee, userId);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @Autowired
    private com.wbill.home.repository.hrms.HrmsEmployeeEducationRepository educationRepository;

    @Autowired
    private com.wbill.home.repository.hrms.HrmsEmployeeExperienceRepository experienceRepository;

    @Autowired
    private com.wbill.home.repository.hrms.HrmsEmployeeSkillRepository skillRepository;

    @Autowired
    private com.wbill.home.repository.hrms.HrmsEmployeeDependentRepository dependentRepository;

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable int id,
                                               @RequestParam(required = false) Integer userId) {
        try {
            employeeService.softDeleteEmployee(id, userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ─── Education Records ─────────────────────────────────
    @GetMapping("/{id}/education")
    public ResponseEntity<List<com.wbill.home.model.hrms.HrmsEmployeeEducation>> getEmployeeEducation(@PathVariable int id) {
        return ResponseEntity.ok(educationRepository.findByEmployee_IdAndDeletedFalseOrderByGraduationYearEcDesc(id));
    }

    @PostMapping("/{id}/education")
    public ResponseEntity<com.wbill.home.model.hrms.HrmsEmployeeEducation> addEmployeeEducation(@PathVariable int id,
                                                                                                 @RequestBody com.wbill.home.model.hrms.HrmsEmployeeEducation education,
                                                                                                 @RequestParam(required = false) Integer userId) {
        HrmsEmployee emp = employeeService.getEmployeeById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
        education.setEmployee(emp);
        education.setRegisteredBy(userId != null ? userId : 1);
        education.setRegisteredDate(java.time.LocalDateTime.now());
        education.setDeleted(false);
        return ResponseEntity.status(HttpStatus.CREATED).body(educationRepository.save(education));
    }

    @DeleteMapping("/education/{eduId}")
    public ResponseEntity<Void> deleteEducation(@PathVariable int eduId) {
        educationRepository.findById(eduId).ifPresent(e -> {
            e.setDeleted(true);
            educationRepository.save(e);
        });
        return ResponseEntity.noContent().build();
    }

    // ─── Work Experience Records ───────────────────────────
    @GetMapping("/{id}/experience")
    public ResponseEntity<List<com.wbill.home.model.hrms.HrmsEmployeeExperience>> getEmployeeExperience(@PathVariable int id) {
        return ResponseEntity.ok(experienceRepository.findByEmployee_IdAndDeletedFalseOrderByEmployeedFromDesc(id));
    }

    @PostMapping("/{id}/experience")
    public ResponseEntity<com.wbill.home.model.hrms.HrmsEmployeeExperience> addEmployeeExperience(@PathVariable int id,
                                                                                                   @RequestBody com.wbill.home.model.hrms.HrmsEmployeeExperience exp,
                                                                                                   @RequestParam(required = false) Integer userId) {
        HrmsEmployee emp = employeeService.getEmployeeById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
        exp.setEmployee(emp);
        exp.setRegisteredBy(userId != null ? userId : 1);
        exp.setRegisteredDate(java.time.LocalDateTime.now());
        exp.setDeleted(false);
        return ResponseEntity.status(HttpStatus.CREATED).body(experienceRepository.save(exp));
    }

    @DeleteMapping("/experience/{expId}")
    public ResponseEntity<Void> deleteExperience(@PathVariable int expId) {
        experienceRepository.findById(expId).ifPresent(e -> {
            e.setDeleted(true);
            experienceRepository.save(e);
        });
        return ResponseEntity.noContent().build();
    }

    // ─── Skills & Competencies ─────────────────────────────
    @GetMapping("/{id}/skills")
    public ResponseEntity<List<com.wbill.home.model.hrms.HrmsEmployeeSkill>> getEmployeeSkills(@PathVariable int id) {
        return ResponseEntity.ok(skillRepository.findByEmployee_IdAndDeletedFalse(id));
    }

    @PostMapping("/{id}/skills")
    public ResponseEntity<com.wbill.home.model.hrms.HrmsEmployeeSkill> addEmployeeSkill(@PathVariable int id,
                                                                                        @RequestBody com.wbill.home.model.hrms.HrmsEmployeeSkill skill,
                                                                                        @RequestParam(required = false) Integer userId) {
        HrmsEmployee emp = employeeService.getEmployeeById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
        skill.setEmployee(emp);
        skill.setRegisteredBy(userId != null ? userId : 1);
        skill.setRegisteredDate(java.time.LocalDateTime.now());
        skill.setDeleted(false);
        return ResponseEntity.status(HttpStatus.CREATED).body(skillRepository.save(skill));
    }

    @DeleteMapping("/skills/{skillId}")
    public ResponseEntity<Void> deleteSkill(@PathVariable int skillId) {
        skillRepository.findById(skillId).ifPresent(s -> {
            s.setDeleted(true);
            skillRepository.save(s);
        });
        return ResponseEntity.noContent().build();
    }

    // ─── Dependents / Family ───────────────────────────────
    @GetMapping("/{id}/dependents")
    public ResponseEntity<List<com.wbill.home.model.hrms.HrmsEmployeeDependent>> getEmployeeDependents(@PathVariable int id) {
        return ResponseEntity.ok(dependentRepository.findByEmployee_IdAndDeletedFalse(id));
    }

    @PostMapping("/{id}/dependents")
    public ResponseEntity<com.wbill.home.model.hrms.HrmsEmployeeDependent> addEmployeeDependent(@PathVariable int id,
                                                                                                 @RequestBody com.wbill.home.model.hrms.HrmsEmployeeDependent dep,
                                                                                                 @RequestParam(required = false) Integer userId) {
        HrmsEmployee emp = employeeService.getEmployeeById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
        dep.setEmployee(emp);
        dep.setRegisteredBy(userId != null ? userId : 1);
        dep.setRegisteredDate(java.time.LocalDateTime.now());
        dep.setDeleted(false);
        return ResponseEntity.status(HttpStatus.CREATED).body(dependentRepository.save(dep));
    }

    @DeleteMapping("/dependents/{depId}")
    public ResponseEntity<Void> deleteDependent(@PathVariable int depId) {
        dependentRepository.findById(depId).ifPresent(d -> {
            d.setDeleted(true);
            dependentRepository.save(d);
        });
        return ResponseEntity.noContent().build();
    }
}
