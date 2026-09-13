package com.wbill.home.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wbill.home.model.User; 
import com.wbill.home.model.ERole; 

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
	  Optional<User> findByUsername(String username);
	  List<User> findByStatus(String status);
	  Boolean existsByUsername(String username);
	  List<User> findByRoles_NameAndStatus(ERole roleName, String status);

	  Boolean existsByEmail(String email);
}
 