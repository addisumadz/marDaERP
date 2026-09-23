package com.wbill.home.controller.hrms;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.wbill.home.model.hrms.HrmsLeaveAllocation;
import com.wbill.home.model.hrms.HrmsLeaveRequest;
import com.wbill.home.model.hrms.HrmsLeaveType;
import com.wbill.home.service.hrms.HrmsLeaveService;

@RestController
@RequestMapping({"/api/mardaerp/hrms/leave", "/api/hrms/leave"})
@CrossOrigin(origins = "*", maxAge = 3600)
public class HrmsLeaveController {

    @Autowired
    private HrmsLeaveService leaveService;

    @GetMapping("/types")
    public ResponseEntity<List<HrmsLeaveType>> getLeaveTypes() {
        return ResponseEntity.ok(leaveService.getAllActiveLeaveTypes());
    }

    @GetMapping("/requests")
    public ResponseEntity<List<HrmsLeaveRequest>> getAllRequests() {
        return ResponseEntity.ok(leaveService.getAllLeaveRequests());
    }

    @GetMapping("/requests/employee/{employeeId}")
    public ResponseEntity<List<HrmsLeaveRequest>> getEmployeeRequests(@PathVariable int employeeId) {
        return ResponseEntity.ok(leaveService.getEmployeeLeaveRequests(employeeId));
    }

    @GetMapping("/allocations/employee/{employeeId}")
    public ResponseEntity<List<HrmsLeaveAllocation>> getEmployeeAllocations(@PathVariable int employeeId,
                                                                          @RequestParam(defaultValue = "2018") int fiscalYearEc) {
        return ResponseEntity.ok(leaveService.getEmployeeLeaveAllocations(employeeId, fiscalYearEc));
    }

    @PostMapping("/allocations/recalculate/{employeeId}")
    public ResponseEntity<HrmsLeaveAllocation> recalculateAnnualLeave(@PathVariable int employeeId,
                                                                      @RequestParam(defaultValue = "2018") int fiscalYearEc) {
        return ResponseEntity.ok(leaveService.initializeOrRecalculateAnnualLeave(employeeId, fiscalYearEc));
    }

    @PostMapping("/requests")
    public ResponseEntity<HrmsLeaveRequest> submitRequest(@RequestBody HrmsLeaveRequest request,
                                                          @RequestParam int employeeId,
                                                          @RequestParam(defaultValue = "1") int userId) {
        return ResponseEntity.ok(leaveService.submitLeaveRequest(request, employeeId, userId));
    }

    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<HrmsLeaveRequest> approveRequest(@PathVariable int id,
                                                           @RequestParam(defaultValue = "1") int userId) {
        return ResponseEntity.ok(leaveService.approveLeaveRequest(id, userId));
    }

    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<HrmsLeaveRequest> rejectRequest(@PathVariable int id,
                                                          @RequestParam(defaultValue = "1") int userId,
                                                          @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(leaveService.rejectLeaveRequest(id, userId, reason));
    }
}
