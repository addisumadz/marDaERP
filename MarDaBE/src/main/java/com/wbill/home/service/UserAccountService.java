package com.wbill.home.service;

import com.wbill.home.dto.PasswordChangeDTO;
import com.wbill.home.dto.UserAccountCreateDTO;
import com.wbill.home.dto.UserAccountDTO;
import com.wbill.home.dto.UserAccountUpdateDTO;
import com.wbill.home.model.Branch;
import com.wbill.home.model.UserAccount;
import com.wbill.home.model.UserRole;
import com.wbill.home.model.hrms.HrmsEmployee;
import com.wbill.home.repository.BranchRepository;
import com.wbill.home.repository.UserAccountRepository;
import com.wbill.home.repository.UserRoleRepository;
import com.wbill.home.repository.hrms.HrmsEmployeeRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserAccountService {
  private final UserAccountRepository repo;
  private final BranchRepository branchRepository;
  private final UserRoleRepository userRoleRepository;
  private final HrmsEmployeeRepository hrmsEmployeeRepository;
  private final PasswordEncoder passwordEncoder;

  public UserAccountService(UserAccountRepository repo,
                            BranchRepository branchRepository,
                            UserRoleRepository userRoleRepository,
                            HrmsEmployeeRepository hrmsEmployeeRepository,
                            PasswordEncoder passwordEncoder) {
    this.repo = repo;
    this.branchRepository = branchRepository;
    this.userRoleRepository = userRoleRepository;
    this.hrmsEmployeeRepository = hrmsEmployeeRepository;
    this.passwordEncoder = passwordEncoder;
  }

  // Read operations
  @Transactional(readOnly = true)
  public UserAccountDTO getById(int id) {
    return repo.findById(id)
        .map(UserAccountDTO::from)
        .orElseThrow(() -> new EntityNotFoundException("UserAccount not found: " + id));
  }

  @Transactional(readOnly = true)
  public List<UserAccountDTO> getAll() {
    return repo.findAll().stream().map(UserAccountDTO::from).collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public Page<UserAccountDTO> getByDeletedWithPagination(String status, Pageable pageable) {
    return repo.findByDeletedWithPagination(status, pageable).map(UserAccountDTO::from);
  }

  // Create
  public UserAccountDTO create(UserAccountCreateDTO dto) {
    if (repo.existsByUserName(dto.userName)) {
      throw new IllegalArgumentException("Username already exists: " + dto.userName);
    }

    HrmsEmployee employee = null;
    if (dto.employeeId != null && dto.employeeId > 0) {
      if (repo.existsByEmployeeId(dto.employeeId)) {
        throw new IllegalArgumentException("This employee is already linked to another user account");
      }
      employee = hrmsEmployeeRepository.findById(dto.employeeId)
          .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + dto.employeeId));
    }

    Branch branch = null;
    if (dto.branchId != null) {
      branch = branchRepository.findById(dto.branchId)
          .orElseThrow(() -> new EntityNotFoundException("Branch not found: " + dto.branchId));
    } else if (employee != null && employee.getBranch() != null) {
      branch = employee.getBranch();
    }

    UserRole role = dto.roleId != null
        ? userRoleRepository.findById(dto.roleId).orElseThrow(() -> new EntityNotFoundException("Role not found: " + dto.roleId))
        : null;

    UserAccount u = new UserAccount();
    u.setUserName(dto.userName);
    u.setPassword(passwordEncoder.encode(dto.password));
    u.setFirstName(dto.firstName);
    u.setMidleName(dto.midleName);
    u.setLastName(dto.lastName);
    u.setSex(dto.sex);
    u.setBranch(branch);
    u.setUserRole(role);
    u.setEmployee(employee);
    // Defaults
    u.setStatus("active");
    u.setDeleted("active");
    Date now = new Date();
    u.setRegisteredDate(now);
    u.setModifiedDate(now);

    UserAccount saved = repo.save(u);
    return UserAccountDTO.from(saved);
  }

  // Update
  public UserAccountDTO update(Integer id, UserAccountUpdateDTO dto) {
    UserAccount u = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("UserAccount not found: " + id));

    if (dto.branchId != null) {
      Branch branch = branchRepository.findById(dto.branchId)
          .orElseThrow(() -> new EntityNotFoundException("Branch not found: " + dto.branchId));
      u.setBranch(branch);
    }
    if (dto.roleId != null) {
      UserRole role = userRoleRepository.findById(dto.roleId)
          .orElseThrow(() -> new EntityNotFoundException("Role not found: " + dto.roleId));
      u.setUserRole(role);
    }

    if (dto.employeeId != null) {
      if (dto.employeeId <= 0) {
        // Unlink
        u.setEmployee(null);
      } else {
        if (repo.existsByEmployeeIdAndIdNot(dto.employeeId, id)) {
          throw new IllegalArgumentException("This employee is already linked to another user account");
        }
        HrmsEmployee emp = hrmsEmployeeRepository.findById(dto.employeeId)
            .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + dto.employeeId));
        u.setEmployee(emp);
      }
    }

    if (dto.firstName != null) u.setFirstName(dto.firstName);
    if (dto.midleName != null) u.setMidleName(dto.midleName);
    if (dto.lastName != null) u.setLastName(dto.lastName);
    if (dto.sex != null) u.setSex(dto.sex);
    if (dto.status != null) u.setStatus(dto.status);
    if (dto.deleted != null) u.setDeleted(dto.deleted);

    u.setModifiedDate(new Date());

    UserAccount saved = repo.save(u);
    return UserAccountDTO.from(saved);
  }

  // Quick Link / Unlink Employee
  public UserAccountDTO linkEmployee(Integer userId, Integer employeeId) {
    UserAccount u = repo.findById(userId)
        .orElseThrow(() -> new EntityNotFoundException("UserAccount not found: " + userId));

    if (employeeId == null || employeeId <= 0) {
      u.setEmployee(null);
    } else {
      if (repo.existsByEmployeeIdAndIdNot(employeeId, userId)) {
        throw new IllegalArgumentException("This employee is already linked to another user account");
      }
      HrmsEmployee emp = hrmsEmployeeRepository.findById(employeeId)
          .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + employeeId));
      u.setEmployee(emp);
    }

    u.setModifiedDate(new Date());
    return UserAccountDTO.from(repo.save(u));
  }

  public UserAccountDTO unlinkEmployee(Integer userId) {
    return linkEmployee(userId, null);
  }

  // Activate / Deactivate (soft delete)
  public void activate(Integer id) {
    UserAccount u = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("UserAccount not found: " + id));
    u.setStatus("active");
    u.setModifiedDate(new Date());
    repo.save(u);
  }

  public void deactivate(Integer id) {
    UserAccount u = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("UserAccount not found: " + id));
    u.setStatus("deactivated");
    u.setModifiedDate(new Date());
    repo.save(u);
  }

  // Delete permanently
  public void delete(Integer id) {
    if (!repo.existsById(id)) {
      throw new EntityNotFoundException("UserAccount not found: " + id);
    }
    repo.deleteById(id);
  }

  // Change password (separate management)
  public void changePassword(Integer id, PasswordChangeDTO payload) {
    if (payload == null || payload.newPassword == null || payload.newPassword.isBlank()) {
      throw new IllegalArgumentException("New password is required");
    }
    UserAccount u = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("UserAccount not found: " + id));

    // Verify caller privileges: Only authenticated ROLE_ADMIN can bypass currentPassword
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    boolean isAdmin = auth != null && auth.isAuthenticated() && auth.getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN") 
                    || a.getAuthority().equalsIgnoreCase("ADMIN"));

    if (!isAdmin) {
      if (payload.currentPassword == null || payload.currentPassword.isBlank()) {
        throw new IllegalArgumentException("Current password is required");
      }
      if (!passwordEncoder.matches(payload.currentPassword, u.getPassword())) {
        throw new IllegalArgumentException("Current password is incorrect");
      }
    }

    u.setPassword(passwordEncoder.encode(payload.newPassword));
    u.setModifiedDate(new Date());
    repo.save(u);
  }
}
