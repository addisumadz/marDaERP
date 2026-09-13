package com.wbill.home.service;

import com.wbill.home.model.Role;
import com.wbill.home.repository.RoleRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    // Create a new role
    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

    // Update an existing role
    public Role updateRole(Integer id, Role roleDetails) {
        Optional<Role> roleOptional = roleRepository.findById(id);
        if (roleOptional.isPresent()) {
            Role role = roleOptional.get();
            role.setName(roleDetails.getName());
            return roleRepository.save(role);
        } else {
            throw new RuntimeException("Role not found with id: " + id);
        }
    }

    // Delete a role by ID
    public void deleteRole(Integer id) {
        if (roleRepository.existsById(id)) {
            roleRepository.deleteById(id);
        } else {
            throw new RuntimeException("Role not found with id: " + id);
        }
    }

    // Get a role by ID
    public Role getRoleById(Integer id) {
        return roleRepository.findById(id).orElseThrow(() -> new RuntimeException("Role not found with id: " + id));
    }

    // Get all roles
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
}
