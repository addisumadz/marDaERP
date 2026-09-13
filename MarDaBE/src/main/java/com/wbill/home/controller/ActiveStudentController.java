//package com.school.home.controller;
//
//import com.school.home.model.ActiveStudent;
//import com.school.home.service.ActiveStudentService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Optional;
//
//@CrossOrigin(origins = "*", maxAge = 3600)
//@RestController
//@RequestMapping("/api/card_management/")
//public class ActiveStudentController {
//
//    @Autowired
//    private ActiveStudentService activeStudentService;
//
//    // Get all ActiveStudents by status
//    @GetMapping("/activeStudentByStatus/{status}")
//    public List<ActiveStudent> getAllActiveStudents(@PathVariable String status) {
//        return activeStudentService.getAllActiveStudents(status);
//    }
//
//    // Create a new ActiveStudent and associate with a Student
//    @PostMapping("/activeStudent/{studentId}")
//    public ResponseEntity<ActiveStudent> createActiveStudent(@RequestBody ActiveStudent activeStudent, @PathVariable int studentId) {
//        ActiveStudent createdActiveStudent = activeStudentService.createActiveStudent(activeStudent, studentId);
//        return ResponseEntity.ok(createdActiveStudent);
//    }
//
//    // Get ActiveStudent by status and ID
//    @GetMapping("/activeStudentByStatusAndId/{status}/{activeStudentId}")
//    public ResponseEntity<ActiveStudent> getActiveStudentByStatusAndId(@PathVariable String status, @PathVariable int activeStudentId) {
//        Optional<ActiveStudent> activeStudent = activeStudentService.getActiveStudentByStatusAndId(status, activeStudentId);
//        return activeStudent.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
//    }
//
//    // Update an ActiveStudent and associate it with a new Student
//    @PutMapping("/activeStudent/{activeStudentId}/{studentId}")
//    public ResponseEntity<ActiveStudent> updateActiveStudent(@RequestBody ActiveStudent activeStudent, @PathVariable int activeStudentId, @PathVariable int studentId) {
//        ActiveStudent updatedActiveStudent = activeStudentService.updateActiveStudent(activeStudent, activeStudentId, studentId);
//        return ResponseEntity.ok(updatedActiveStudent);
//    }
//
//    // Delete ActiveStudent by ID
//    @DeleteMapping("/deleteActiveStudent/{activeStudentId}")
//    public ResponseEntity<Void> deleteActiveStudent(@PathVariable int activeStudentId) {
//        activeStudentService.deleteActiveStudent(activeStudentId);
//        return ResponseEntity.noContent().build();
//    }
//
//    // Deactivate an ActiveStudent by setting its status to "inactive"
//    @PutMapping("/deactivateActiveStudent")
//    public ResponseEntity<ActiveStudent> deactivateActiveStudent(@RequestBody ActiveStudent activeStudent) {
//        ActiveStudent deactivatedActiveStudent = activeStudentService.deactivateActiveStudent(activeStudent);
//        return ResponseEntity.ok(deactivatedActiveStudent);
//    }
//
//    // Get ActiveStudents by status and Student ID
//    @GetMapping("/activeStudentsByStatusAndStudentId/{status}/{studentId}")
//    public ResponseEntity<List<ActiveStudent>> getActiveStudentsByStatusAndStudentId(@PathVariable String status, @PathVariable int studentId) {
//        List<ActiveStudent> activeStudents = activeStudentService.getActiveStudentsByStatusAndStudentId(status, studentId);
//        return ResponseEntity.ok(activeStudents);
//    }
//}



