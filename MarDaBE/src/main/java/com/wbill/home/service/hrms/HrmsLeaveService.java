package com.wbill.home.service.hrms;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.wbill.home.hrms.config.HrmsProclamation1156Constants;
import com.wbill.home.model.hrms.HrmsEmployee;
import com.wbill.home.model.hrms.HrmsLeaveAllocation;
import com.wbill.home.model.hrms.HrmsLeaveRequest;
import com.wbill.home.model.hrms.HrmsLeaveType;
import com.wbill.home.repository.hrms.HrmsEmployeeRepository;
import com.wbill.home.repository.hrms.HrmsLeaveAllocationRepository;
import com.wbill.home.repository.hrms.HrmsLeaveRequestRepository;
import com.wbill.home.repository.hrms.HrmsLeaveTypeRepository;

@Service
public class HrmsLeaveService {

    @Autowired
    private HrmsLeaveTypeRepository leaveTypeRepository;

    @Autowired
    private HrmsLeaveAllocationRepository leaveAllocationRepository;

    @Autowired
    private HrmsLeaveRequestRepository leaveRequestRepository;

    @Autowired
    private HrmsEmployeeRepository employeeRepository;

    public List<HrmsLeaveType> getAllActiveLeaveTypes() {
        return leaveTypeRepository.findByActiveTrueOrderByIdAsc();
    }

    public List<HrmsLeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findByDeletedFalseOrderByLeaveStartDesc();
    }

    public List<HrmsLeaveRequest> getEmployeeLeaveRequests(int employeeId) {
        return leaveRequestRepository.findByEmployeeIdAndDeletedFalseOrderByLeaveStartDesc(employeeId);
    }

    public List<HrmsLeaveAllocation> getEmployeeLeaveAllocations(int employeeId, int fiscalYearEc) {
        return leaveAllocationRepository.findByEmployeeIdAndFiscalYearEc(employeeId, fiscalYearEc);
    }

    /**
     * Calculates and allocates Annual Leave entitlement under Ethiopian Labour Proclamation No. 1156/2019:
     * Days = 16 + floor(Years of Service / 2)
     */
    @Transactional
    public HrmsLeaveAllocation initializeOrRecalculateAnnualLeave(int employeeId, int fiscalYearEc) {
        HrmsEmployee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + employeeId));

        HrmsLeaveType annualLeaveType = leaveTypeRepository.findByTypeCode("ANNUAL")
                .orElseGet(() -> {
                    HrmsLeaveType alt = new HrmsLeaveType();
                    alt.setTypeCode("ANNUAL");
                    alt.setTypeName("Annual Leave");
                    alt.setTypeNameAm("ዓመታዊ የዕረፍት ፈቃድ");
                    alt.setDefaultDays(16);
                    alt.setServiceAccrued(true);
                    return leaveTypeRepository.save(alt);
                });

        int serviceYears = 0;
        LocalDate hireDate = employee.getFirstEmploymentDate() != null ?
                employee.getFirstEmploymentDate() : employee.getYeteketerubetKen();

        if (hireDate != null) {
            serviceYears = Period.between(hireDate, LocalDate.now()).getYears();
        }

        int entitledDays = HrmsProclamation1156Constants.BASE_ANNUAL_LEAVE_DAYS +
                (serviceYears / HrmsProclamation1156Constants.SERVICE_YEARS_PER_ADDITIONAL_LEAVE_DAY);

        Optional<HrmsLeaveAllocation> existing = leaveAllocationRepository
                .findByEmployeeIdAndLeaveTypeIdAndFiscalYearEc(employeeId, annualLeaveType.getId(), fiscalYearEc);

        HrmsLeaveAllocation allocation = existing.orElse(new HrmsLeaveAllocation());
        allocation.setEmployee(employee);
        allocation.setLeaveType(annualLeaveType);
        allocation.setFiscalYearEc(fiscalYearEc);
        allocation.setEntitledDays(entitledDays);
        if (allocation.getId() == 0) {
            allocation.setRemainingDays(entitledDays);
            allocation.setUsedDays(0);
        } else {
            allocation.setRemainingDays(Math.max(0, entitledDays + allocation.getCarriedOverDays() - allocation.getUsedDays()));
        }

        return leaveAllocationRepository.save(allocation);
    }

    @Transactional
    public HrmsLeaveRequest submitLeaveRequest(HrmsLeaveRequest request, int employeeId, int registeredByUserId) {
        HrmsEmployee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + employeeId));

        request.setEmployee(employee);
        request.setRegisteredBy(registeredByUserId);
        request.setRegisteredDate(LocalDateTime.now());
        request.setApprovalStatus("PENDING");

        return leaveRequestRepository.save(request);
    }

    @Transactional
    public HrmsLeaveRequest approveLeaveRequest(int requestId, int approvedByUserId) {
        HrmsLeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found: " + requestId));

        request.setApprovalStatus("APPROVED");
        request.setApprovedBy(approvedByUserId);
        request.setApprovedDate(LocalDateTime.now());

        // Deduct from allocation if leave type exists
        if (request.getLeaveType() != null) {
            Optional<HrmsLeaveAllocation> allocOpt = leaveAllocationRepository
                    .findByEmployeeIdAndLeaveTypeIdAndFiscalYearEc(
                            request.getEmployee().getId(),
                            request.getLeaveType().getId(),
                            request.getYear());

            allocOpt.ifPresent(alloc -> {
                alloc.setUsedDays(alloc.getUsedDays() + request.getLeaveDays());
                alloc.setRemainingDays(Math.max(0, alloc.getRemainingDays() - request.getLeaveDays()));
                leaveAllocationRepository.save(alloc);
            });
        }

        return leaveRequestRepository.save(request);
    }

    @Transactional
    public HrmsLeaveRequest rejectLeaveRequest(int requestId, int rejectedByUserId, String reason) {
        HrmsLeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found: " + requestId));

        request.setApprovalStatus("REJECTED");
        request.setApprovedBy(rejectedByUserId);
        request.setApprovedDate(LocalDateTime.now());
        if (reason != null) {
            request.setLeaveReason((request.getLeaveReason() != null ? request.getLeaveReason() + " | " : "") + "Rejected: " + reason);
        }

        return leaveRequestRepository.save(request);
    }
}
