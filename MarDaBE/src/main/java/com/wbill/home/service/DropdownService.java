package com.wbill.home.service;

import com.wbill.home.dto.DropdownDTO;
import com.wbill.home.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DropdownService {
    @Autowired private AddressStreetsRepository kebeleRepository;
    @Autowired private AddressKetenaRepository ketenaRepository;
    @Autowired private BranchRepository branchRepository;
    @Autowired private BillingMeterSizeRepository meterSizeRepository;
    @Autowired private BillingCustomerTypeRepository customerTypeRepository;
    @Autowired private UserAccountRepository userRepository;
    @Autowired private BillingTerminationReasonRepository terminationReasonRepository;

    // Termination reasons
    public List<DropdownDTO> getAllTerminationReasons() {
        return terminationReasonRepository.findAllActive().stream()
                .map(reason -> new DropdownDTO(reason.getId(), reason.getTerminationReason()))
                .collect(Collectors.toList());
    }

    // Kebeles
    public List<DropdownDTO> getAllActiveKebeles() {
        return kebeleRepository.findAllActive().stream()
                .map(kebele -> new DropdownDTO(kebele.getId(), kebele.getStreetsName()))
                .collect(Collectors.toList());
    }

    // Ketenas by kebele
    public List<DropdownDTO> getActiveKetenasByKebele(Integer kebeleId) {
        return ketenaRepository.findActiveByKebeleId(kebeleId).stream()
                .map(ketena -> new DropdownDTO(ketena.getId(), ketena.getKetenaName()))
                .collect(Collectors.toList());
    }

    // All active ketenas
    public List<DropdownDTO> getAllActiveKetenas() {
        return ketenaRepository.findAll().stream()
                .filter(k -> "active".equalsIgnoreCase(k.getDeleted()))
                .map(ketena -> new DropdownDTO(ketena.getId(), ketena.getKetenaName()))
                .collect(Collectors.toList());
    }

    // Readers by branch (legacy)
    public List<DropdownDTO> getAllActiveReadersByBranch(Integer branchId) {
        return userRepository.findActiveReadersByBranchId(branchId).stream()
                .map(user -> new DropdownDTO(user.getId(), user.getFirstName() + " " + user.getLastName()))
                .collect(Collectors.toList());
    }

    // Branches
    public List<DropdownDTO> getAllActiveBranches() {
        return branchRepository.findAllActive().stream()
                .map(branch -> new DropdownDTO(branch.getId(), branch.getBranchDescription()))
                .collect(Collectors.toList());
    }

    public List<DropdownDTO> getAllActiveMeterSizes() {
        return meterSizeRepository.findAllActive().stream()
                .map(meterSize -> new DropdownDTO(meterSize.getId(), String.valueOf(meterSize.getMeterSize())))
                .collect(Collectors.toList());
    }

    public List<DropdownDTO> getAllActiveCustomerTypes() {
        return customerTypeRepository.findAllActive().stream()
                .map(customerType -> new DropdownDTO(customerType.getId(), customerType.getCustomerType()))
                .collect(Collectors.toList());
    }

    // New: active meter readers (roleCode = 'mobileanbabi')
    public List<DropdownDTO> getActiveMeterReaders() {
        return userRepository.findActiveMeterReaders().stream()
                .map(user -> new DropdownDTO(user.getId(), user.getFirstName() + " " + user.getLastName()))
                .collect(Collectors.toList());
    }

    // New: active meter readers by branch
    public List<DropdownDTO> getActiveMeterReadersByBranch(Integer branchId) {
        return userRepository.findActiveMeterReadersByBranch(branchId).stream()
                .map(user -> new DropdownDTO(user.getId(), user.getFirstName() + " " + user.getLastName()))
                .collect(Collectors.toList());
    }

    // New: active users by roleCode (fallback for future codes)
    public List<DropdownDTO> getActiveUsersByRoleCode(String roleCode) {
        if (roleCode == null) return List.of();
        String code = roleCode.toLowerCase();
        if ("mobileanbabi".equals(code)) {
            return getActiveMeterReaders();
        }
        return userRepository.findAll().stream()
                .filter(u -> "active".equals(u.getStatus()) && "active".equals(u.getDeleted()))
                .filter(u -> u.getUserRole() != null && u.getUserRole().getRoleCode() != null && u.getUserRole().getRoleCode().equalsIgnoreCase(roleCode))
                .map(user -> new DropdownDTO(user.getId(), user.getFirstName() + " " + user.getLastName()))
                .collect(Collectors.toList());
    }

    // New: active cashier users (role_id = 49)
    public List<DropdownDTO> getActiveCashiers() {
        return userRepository.findActiveCashierUsers().stream()
                .map(user -> new DropdownDTO(user.getId(), user.getFirstName() + " " + user.getLastName()))
                .collect(Collectors.toList());
    }
}