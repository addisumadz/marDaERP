package com.wbill.home.service.hrms;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.wbill.home.model.hrms.HrmsEmployee;
import com.wbill.home.repository.hrms.HrmsEmployeeRepository;

@Service
public class HrmsEmployeeService {

    @Autowired
    private HrmsEmployeeRepository employeeRepository;

    public List<HrmsEmployee> getAllActiveEmployees() {
        return employeeRepository.findByDeletedFalseOrderByFullNameAsc();
    }

    public Optional<HrmsEmployee> getEmployeeById(int id) {
        return employeeRepository.findById(id).filter(e -> !e.isDeleted());
    }

    public Optional<HrmsEmployee> getEmployeeByEmployeeId(String employeeId) {
        return employeeRepository.findByEmployeeIdAndDeletedFalse(employeeId);
    }

    public List<HrmsEmployee> searchEmployees(String search) {
        if (search == null || search.trim().isEmpty()) {
            return getAllActiveEmployees();
        }
        return employeeRepository.searchEmployees(search.trim());
    }

    @Transactional
    public HrmsEmployee saveEmployee(HrmsEmployee employee, Integer registeredByUserId) {
        if (employee.getId() == 0) {
            // New employee
            if (employee.getRegisteredDate() == null) {
                employee.setRegisteredDate(LocalDateTime.now());
            }
            if (registeredByUserId != null) {
                employee.setRegisteredBy(registeredByUserId);
            }
            // If retirement date not specified, set 60 years from birth date (Ethiopian Civil Service / Public Enterprise standard)
            if (employee.getTuretaYemiwetubetKen() == null && employee.getDateOfBirth() != null) {
                employee.setTuretaYemiwetubetKen(employee.getDateOfBirth().plusYears(60));
            }
        } else {
            employee.setModifiedDate(LocalDateTime.now());
            if (registeredByUserId != null) {
                employee.setModifiedBy(registeredByUserId);
            }
        }
        return employeeRepository.save(employee);
    }

    @Transactional
    public void softDeleteEmployee(int id, Integer userId) {
        employeeRepository.findById(id).ifPresent(e -> {
            e.setDeleted(true);
            e.setModifiedDate(LocalDateTime.now());
            e.setModifiedBy(userId);
            employeeRepository.save(e);
        });
    }
}
