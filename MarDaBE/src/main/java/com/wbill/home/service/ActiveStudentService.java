// 
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import com.school.home.model.ActiveStudent;
//import com.school.home.model.Section;
//import com.school.home.repository.ActiveStudentRepository;
//import com.school.home.repository.SectionRepository;
//
//import java.util.Date;
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class ActiveStudentService {
//
//    @Autowired
//    private ActiveStudentRepository activeStudentRepository;
//
//    @Autowired
//    private SectionRepository sectionRepository;
//
//    public List<ActiveStudent> getAllActiveStudents() {
//        return activeStudentRepository.findAll();
//    }
//
//    public ActiveStudent createActiveStudent(ActiveStudent activeStudent, Integer sectionId) {
//        Section section = sectionRepository.findById(sectionId)
//            .orElseThrow(() -> new RuntimeException("Section not found"));
//        activeStudent.setSection(section);
//        return activeStudentRepository.save(activeStudent);
//    }
//
//    public Optional<ActiveStudent> getActiveStudentById(Integer id) {
//        return activeStudentRepository.findById(id);
//    }
//
//    public ActiveStudent updateActiveStudent(ActiveStudent activeStudent, Integer sectionId) {
//        Section section = sectionRepository.findById(sectionId)
//            .orElseThrow(() -> new RuntimeException("Section not found"));
//        activeStudent.setSection(section);
//        return activeStudentRepository.save(activeStudent);
//    }
//
//    public void deleteActiveStudent(Integer id) {
//        activeStudentRepository.deleteById(id);
//    }
//
//    public ActiveStudent deactivateActiveStudent(ActiveStudent activeStudent) {
//        // Implement logic for deactivating if needed
//        return activeStudentRepository.save(activeStudent);
//    }
//
//    // Add any additional methods as needed
//}


